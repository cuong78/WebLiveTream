import React from 'react';
import type { Stream } from '../types';

interface ServerSelectionProps {
  streams: Stream[];
  activeStreamId: string;
  onStreamSelect: (streamId: string) => void;
  className?: string;
}

const ServerSelection: React.FC<ServerSelectionProps> = ({
  streams,
  activeStreamId,
  onStreamSelect,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-semibold mb-3 flex items-center">
        🎬 Đổi Server:
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => onStreamSelect(stream.id)}
            className={`
              relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeStreamId === stream.id 
                ? 'bg-red-600 text-white shadow-lg scale-105' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
          >
            {/* Live Indicator */}
            {stream.isLive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
            
            <div className="flex flex-col items-center space-y-1">
              <span className="font-bold">{stream.serverName}</span>
              
              {/* Stream Status */}
              <div className="flex items-center space-x-1 text-xs">
                {stream.isLive ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400">LIVE</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-500">OFFLINE</span>
                  </>
                )}
              </div>
              
              {/* Viewer Count */}
              {stream.isLive && stream.viewerCount > 0 && (
                <div className="text-xs text-gray-400">
                  👥 {stream.viewerCount.toLocaleString()}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🔄 LOAD LẠI TRANG
        </button>
      </div>

      {/* Schedule Info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>⏰ Lịch phát sóng: 18h00 hàng ngày</p>
        <p>📍 Địa điểm: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
      </div>
    </div>
  );
};

export default ServerSelection;
