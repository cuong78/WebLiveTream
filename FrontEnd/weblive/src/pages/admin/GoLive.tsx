import { useEffect, useRef, useState } from 'react'

type Message = { type: string; [k: string]: any }

export default function GoLive() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [roomId] = useState('default')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    return () => {
      pcRef.current?.close()
      ws?.close()
    }
  }, [ws])

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: true
    })
    if (videoRef.current) videoRef.current.srcObject = stream
  }

  function connectWS() {
    const socket = new WebSocket((import.meta.env.VITE_WS_URL || 'ws://localhost:8080') + '/ws')
    socket.onopen = () => socket.send(JSON.stringify({ type: 'admin-join', room: roomId }))
    socket.onmessage = async (ev) => {
      const msg: Message = JSON.parse(ev.data)
      if (msg.type === 'viewer-join') {
        await createPeerForViewer(msg.viewerId, socket)
      } else if (msg.type === 'offer') {
        // not used for admin
      } else if (msg.type === 'candidate') {
        const pc = pcRef.current
        if (pc && msg.candidate) await pc.addIceCandidate(msg.candidate)
      }
    }
    setWs(socket)
  }

  async function createPeerForViewer(viewerId: string, socket: WebSocket) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    pcRef.current = pc
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => pc.addTrack(t, stream))
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.send(JSON.stringify({ type: 'candidate', room: roomId, target: viewerId, candidate: e.candidate }))
    }
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.send(JSON.stringify({ type: 'offer', room: roomId, viewerId, sdp: offer }))
  }


  async function goLive() {
    await startCamera();
    connectWS();
    setIsLive(true);
  }

  function stopLive() {
    // Tắt camera
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    stream?.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    // Đóng kết nối WebSocket và Peer
    pcRef.current?.close();
    ws?.close();
    setIsLive(false);
  }

  return (
    <div className="card">
      <div className="title">Phát trực tiếp</div>
      <video ref={videoRef} autoPlay playsInline muted style={{width:'100%', borderRadius:8, marginTop:8}} />
      <div className="pill-row" style={{marginTop:12}}>
        {isLive ? (
          <button className="btn btn-danger" onClick={stopLive}>Dừng Live</button>
        ) : (
          <button className="btn btn-primary" onClick={goLive}>Bắt đầu Live</button>
        )}
        <button className="btn" onClick={()=>setFacingMode(m=>m==='user'?'environment':'user')}>Đổi camera ({facingMode==='user'?'Trước':'Sau'})</button>
      </div>
      <div className="info-item">Room: {roomId}</div>
  <div className="info-item">Trạng thái: {isLive? 'Đang phát' : 'Offline'}</div>
    </div>
  )
}


