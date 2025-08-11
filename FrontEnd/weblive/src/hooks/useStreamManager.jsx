// Optimized Stream Management Hook
import { useState, useCallback, useEffect, useRef } from 'react';
import { liveStreamAPI } from '../services/api';

export const useStreamManager = () => {
  const [streamStatus, setStreamStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const pollingRef = useRef(null);
  const lastFetchRef = useRef(0);

  // Optimized fetch with debouncing
  const fetchStreamStatus = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) {
      return; // Prevent too frequent requests
    }
    lastFetchRef.current = now;

    try {
      const response = await liveStreamAPI.getStatus();
      setStreamStatus(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching stream status:', error);
      setError('Failed to fetch stream status');
    }
  }, []);

  // Smart polling - only when needed
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    pollingRef.current = setInterval(() => {
      fetchStreamStatus();
    }, 5000); // Reduced frequency
  }, [fetchStreamStatus]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Stream control with optimistic updates
  const controlStream = useCallback(async (action, title = '', description = '') => {
    setLoading(true);
    setError('');
    setMessage('');

    // Optimistic update
    if (action === 'START') {
      setStreamStatus(prev => ({
        ...prev,
        isLive: true,
        streamTitle: title,
        streamDescription: description,
        startTime: new Date().toISOString()
      }));
    } else if (action === 'STOP') {
      setStreamStatus(prev => ({
        ...prev,
        isLive: false,
        live: false
      }));
    }

    try {
      const response = await liveStreamAPI.controlStream(action, title, description);
      setStreamStatus(response.data);
      setMessage(`Stream ${action.toLowerCase()} successful!`);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error controlling stream:', error);
      const errorMessage = 'Error controlling stream: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      
      // Revert optimistic update on error
      await fetchStreamStatus();
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchStreamStatus]);

  // Update from WebSocket
  const updateFromWebSocket = useCallback((wsStreamStatus, wsViewerCount) => {
    setStreamStatus(prevStatus => ({
      ...prevStatus,
      ...wsStreamStatus,
      viewerCount: wsViewerCount || prevStatus?.viewerCount || 0
    }));
  }, []);

  // Initialize
  useEffect(() => {
    fetchStreamStatus();
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [fetchStreamStatus, startPolling, stopPolling]);

  // Clear messages after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    streamStatus,
    loading,
    error,
    message,
    fetchStreamStatus,
    controlStream,
    updateFromWebSocket,
    setError,
    setMessage
  };
};
