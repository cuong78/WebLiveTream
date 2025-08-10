import React, { useState } from 'react';
import type { VideoRecord } from '../types';

interface VideoArchiveProps {
  videos: VideoRecord[];
  onVideoSelect?: (video: VideoRecord) => void;
  className?: string;
}

const VideoArchive: React.FC<VideoArchiveProps> = ({
  videos,
  onVideoSelect,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;
  
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videos.length / videosPerPage);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center">
          📹 VIDEO XEM LẠI
        </h3>
        <span className="text-sm text-gray-400">
          {videos.length} video
        </span>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📹</div>
          <p>Chưa có video nào</p>
          <p className="text-sm">Video sẽ được lưu trữ sau mỗi buổi phát sóng</p>
        </div>
      ) : (
        <>
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => onVideoSelect?.(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239CA3AF' text-anchor='middle' dy='.3em'%3E📹%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-3">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {formatDate(video.date)}
                  </p>
                  {video.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                ‹ Trước
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Sau ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoArchive;
