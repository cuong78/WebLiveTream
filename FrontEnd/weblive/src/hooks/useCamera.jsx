// Optimized Camera Hook
import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    if (isStreaming || streamRef.current) {
      console.log('📹 Camera already active');
      return { success: true, message: 'Camera already active' };
    }

    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      setIsStreaming(true);
      setRetryCount(0);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Handle track ended events
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log(`${track.kind} track ended`);
          handleStreamEnd();
        });
      });
      
      return { success: true, message: 'Camera started successfully' };
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      const errorMessage = getCameraErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isStreaming]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setError('');
      return { success: true, message: 'Camera stopped' };
    }
    return { success: true, message: 'Camera was not active' };
  }, []);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Auto-retry logic can be added here if needed
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        startCamera();
      }, 2000);
    } else {
      setError('Camera connection lost. Please restart manually.');
    }
  }, [retryCount, startCamera]);

  const getCameraErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Please allow camera and microphone access.';
      case 'NotFoundError':
        return 'Camera or microphone not found.';
      case 'NotReadableError':
        return 'Camera is being used by another application.';
      case 'OverconstrainedError':
        return 'Camera settings not supported.';
      case 'SecurityError':
        return 'Security error accessing camera.';
      default:
        return `Camera error: ${error.message}`;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isStreaming,
    error,
    retryCount,
    videoRef,
    startCamera,
    stopCamera,
    setError
  };
};
