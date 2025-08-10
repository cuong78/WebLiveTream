import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { connected } = useWebSocket();

  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <div className="status-indicator">
        <span className={`status-dot ${connected ? 'online' : 'offline'}`}></span>
        <span className="status-text">
          {connected ? 'Kết nối trực tiếp' : 'HTTP Polling'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
