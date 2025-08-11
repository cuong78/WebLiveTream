// WebRTC Service for Real Video Streaming
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peerConnections = new Map(); // Map of viewer ID to RTCPeerConnection
    this.isStreaming = false;
    this.stompClient = null;
    
    // STUN servers for NAT traversal
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  // Initialize WebRTC service
  async initialize() {
    try {
      const socket = new SockJS(`http://${window.location.hostname}:8080/ws`);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = () => {
        console.log('🔗 WebRTC signaling connected');
        
        // Subscribe to WebRTC messages
        this.stompClient.subscribe('/topic/webrtc', (message) => {
          this.handleSignalingMessage(JSON.parse(message.body));
        });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('❌ WebRTC signaling error:', frame);
      };

      this.stompClient.onDisconnect = () => {
        console.log('🔌 WebRTC signaling disconnected');
      };

      this.stompClient.activate();

    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  // Start streaming as admin
  async startStream(stream) {
    if (this.isStreaming) {
      console.warn('⚠️ Already streaming');
      return;
    }

    this.localStream = stream;
    this.isStreaming = true;

    // Notify server that admin is ready to stream
    this.sendSignalingMessage({
      type: 'admin-ready',
      message: 'Admin is ready to stream'
    });

    console.log('📹 Admin started streaming');
  }

  // Stop streaming
  stopStream() {
    if (!this.isStreaming) return;

    // Close all peer connections
    this.peerConnections.forEach((pc, viewerId) => {
      pc.close();
    });
    this.peerConnections.clear();

    this.localStream = null;
    this.isStreaming = false;

    // Notify server
    this.sendSignalingMessage({
      type: 'admin-stopped',
      message: 'Admin stopped streaming'
    });

    console.log('🛑 Admin stopped streaming');
  }

  // Join as viewer
  async joinAsViewer() {
    if (!this.isStreaming) {
      this.sendSignalingMessage({
        type: 'viewer-join',
        message: 'Viewer wants to join'
      });
    }
  }

  // Handle signaling messages
  async handleSignalingMessage(message) {
    console.log('📨 Received signaling message:', message);
    
    switch (message.type) {
      case 'viewer-join':
        if (this.isAdmin()) {
          await this.handleViewerJoin(message.viewerId);
        }
        break;
      
      case 'offer':
        if (!this.isAdmin()) {
          await this.handleOffer(message);
        }
        break;
      
      case 'answer':
        if (this.isAdmin()) {
          await this.handleAnswer(message);
        }
        break;
      
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      
      case 'admin-ready':
        // Viewer receives this when admin is ready
        console.log('🎯 Admin is ready, requesting stream...');
        if (!this.isAdmin()) {
          await this.requestStream();
        }
        break;
      
      case 'admin-stopped':
        console.log('🛑 Admin stopped streaming');
        // Reset connection state
        this.peerConnections.clear();
        this.onRemoteStream?.(null);
        break;
      
      default:
        console.log('🔔 Unknown signaling message:', message);
    }
  }

  // Admin handles new viewer
  async handleViewerJoin(viewerId) {
    if (!this.isAdmin() || !this.isStreaming) {
      console.warn('⚠️ Not admin or not streaming');
      return;
    }

    console.log(`👤 New viewer joining: ${viewerId}`);

    try {
      const pc = new RTCPeerConnection(this.configuration);
      this.peerConnections.set(viewerId, pc);

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          console.log(`➕ Adding ${track.kind} track to PC`);
          pc.addTrack(track, this.localStream);
        });
      } else {
        console.error('❌ No local stream available');
        return;
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`🧊 Sending ICE candidate to ${viewerId}`);
          this.sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            viewerId: viewerId
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log(`🔗 Connection state for ${viewerId}: ${pc.connectionState}`);
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        offer: offer,
        viewerId: viewerId
      });

      console.log(`📤 Sent offer to viewer: ${viewerId}`);

    } catch (error) {
      console.error('❌ Error handling viewer join:', error);
    }
  }

  // Viewer handles offer from admin
  async handleOffer(message) {
    if (this.isAdmin()) {
      console.warn('⚠️ Admin received offer, ignoring');
      return;
    }

    console.log('📥 Viewer received offer from admin');

    try {
      const pc = new RTCPeerConnection(this.configuration);
      this.peerConnections.set('admin', pc);

      // Handle incoming stream
      pc.ontrack = (event) => {
        console.log('📥 Received remote stream from admin');
        console.log('Streams:', event.streams);
        if (event.streams && event.streams[0]) {
          this.onRemoteStream?.(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to admin');
          this.sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            viewerId: message.viewerId
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log(`🔗 Viewer connection state: ${pc.connectionState}`);
      };

      // Set remote description and create answer
      await pc.setRemoteDescription(message.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendSignalingMessage({
        type: 'answer',
        answer: answer,
        viewerId: message.viewerId
      });

      console.log('📤 Sent answer to admin');

    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  // Admin handles answer from viewer
  async handleAnswer(message) {
    if (!this.isAdmin()) return;

    try {
      const pc = this.peerConnections.get(message.viewerId);
      if (pc) {
        await pc.setRemoteDescription(message.answer);
        console.log(`📥 Received answer from viewer: ${message.viewerId}`);
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  // Handle ICE candidates
  async handleIceCandidate(message) {
    try {
      const targetId = this.isAdmin() ? message.viewerId : 'admin';
      const pc = this.peerConnections.get(targetId);
      
      if (pc) {
        await pc.addIceCandidate(message.candidate);
        console.log(`🧊 Added ICE candidate for: ${targetId}`);
      }
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  }

  // Viewer requests stream from admin
  async requestStream() {
    console.log('🎯 Viewer requesting stream from admin');
    this.sendSignalingMessage({
      type: 'viewer-join',
      message: 'Requesting stream from admin'
    });
  }

  // Send signaling message through STOMP
  sendSignalingMessage(message) {
    if (this.stompClient && this.stompClient.connected) {
      const destination = `/app/webrtc/${message.type.replace('-', '_')}`;
      console.log(`📤 Sending to ${destination}:`, message);
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('⚠️ STOMP client not connected');
    }
  }

  // Check if current user is admin
  isAdmin() {
    // Get from auth context or localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.roles?.some(role => role.name === 'ADMIN') || false;
  }

  // Set callback for remote stream
  setOnRemoteStream(callback) {
    this.onRemoteStream = callback;
  }

  // Cleanup
  disconnect() {
    this.stopStream();
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}

const webrtcService = new WebRTCService();
export default webrtcService;
