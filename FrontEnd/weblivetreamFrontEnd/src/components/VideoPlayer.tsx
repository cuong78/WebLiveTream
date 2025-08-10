import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isLive?: boolean;
  onReady?: () => void;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  isLive = false,
  onReady,
  className = ''
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ khởi tạo player nếu chưa có
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: isLive,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: src,
          type: isLive ? 'application/x-mpegURL' : 'video/mp4'
        }],
        poster: poster,
        playbackRates: isLive ? [] : [0.5, 1, 1.25, 1.5, 2],
        liveui: isLive,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true
          }
        }
      });

      player.ready(() => {
        setIsLoading(false);
        onReady?.();
      });

      player.on('error', () => {
        setError('Không thể tải video. Vui lòng thử lại sau.');
        setIsLoading(false);
      });

      player.on('loadstart', () => {
        setIsLoading(true);
        setError(null);
      });

      player.on('canplay', () => {
        setIsLoading(false);
      });
    }

    // Cleanup function
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Update source khi src thay đổi
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src({
        src: src,
        type: isLive ? 'application/x-mpegURL' : 'video/mp4'
      });
    }
  }, [src, isLive]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-2">Đang tải...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center p-4">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-white">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (playerRef.current) {
                  playerRef.current.load();
                }
              }}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div 
        ref={videoRef}
        className="w-full aspect-video bg-black rounded-lg overflow-hidden"
        data-vjs-player
      />

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
