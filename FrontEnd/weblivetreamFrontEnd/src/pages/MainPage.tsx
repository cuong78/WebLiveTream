import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';
import ServerSelection from '../components/ServerSelection';
import Chat from '../components/Chat';
import VideoArchive from '../components/VideoArchive';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import type { Stream, VideoRecord, ChatMessage } from '../types';

const MainPage: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string>('1');
  const [videoArchive, setVideoArchive] = useState<VideoRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const activeStream = streams.find(stream => stream.id === activeStreamId);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [streamsData, videosData] = await Promise.all([
          apiService.getStreams(),
          apiService.getVideoArchive()
        ]);
        
        setStreams(streamsData);
        setVideoArchive(videosData);

        // Set active stream to first live stream or first stream
        const liveStream = streamsData.find(s => s.isLive);
        if (liveStream) {
          setActiveStreamId(liveStream.id);
        } else if (streamsData.length > 0) {
          setActiveStreamId(streamsData[0].id);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Socket connection and chat
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    // Chat event listeners
    socketService.onChatMessage((message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketService.onChatHistory((messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    // Stream status updates
    socketService.onStreamStatusUpdate((data) => {
      setStreams(prev => prev.map(stream => 
        stream.id === data.streamId 
          ? { ...stream, isLive: data.isLive, viewerCount: data.viewerCount }
          : stream
      ));
    });

    socketService.onViewerCountUpdate((data) => {
      setStreams(prev => prev.map(stream => 
        stream.id === data.streamId 
          ? { ...stream, viewerCount: data.viewerCount }
          : stream
      ));
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  // Join stream room when active stream changes
  useEffect(() => {
    if (activeStreamId && isSocketConnected) {
      socketService.joinStreamRoom(activeStreamId);
      socketService.joinChatRoom(activeStreamId);
      
      // Update viewer count
      apiService.updateViewerCount(activeStreamId);

      return () => {
        socketService.leaveStreamRoom(activeStreamId);
        socketService.leaveChatRoom(activeStreamId);
      };
    }
  }, [activeStreamId, isSocketConnected]);

  const handleStreamSelect = (streamId: string) => {
    setActiveStreamId(streamId);
    setChatMessages([]); // Clear chat when switching streams
  };

  const handleSendMessage = (message: string) => {
    const username = localStorage.getItem('chatUsername') || 'Ẩn danh';
    socketService.sendChatMessage(activeStreamId, username, message);
  };

  const handleVideoSelect = (video: VideoRecord) => {
    // Create a temporary stream for the video
    const videoStream: Stream = {
      id: `video-${video.id}`,
      title: video.title,
      serverName: 'Video',
      url: video.url,
      isLive: false,
      viewerCount: 0
    };
    
    setStreams(prev => {
      const filtered = prev.filter(s => !s.id.startsWith('video-'));
      return [...filtered, videoStream];
    });
    
    setActiveStreamId(videoStream.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        title="CLB Gà Chọi Cậu Thanh"
        subtitle="Xổ gà trực tiếp 18h hàng ngày"
        showLiveIndicator={activeStream?.isLive}
        contactNumber="0393835679"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Server Selection */}
        <ServerSelection
          streams={streams.filter(s => !s.id.startsWith('video-'))}
          activeStreamId={activeStreamId}
          onStreamSelect={handleStreamSelect}
          className="mb-6"
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {activeStream ? (
              <VideoPlayer
                src={activeStream.url}
                isLive={activeStream.isLive}
                className="w-full"
              />
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 text-4xl mb-2">📺</div>
                  <p className="text-gray-400">Không có stream nào được chọn</p>
                </div>
              </div>
            )}

            {/* Stream Info */}
            {activeStream && (
              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <h2 className="text-white text-xl font-semibold mb-2">
                  {activeStream.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    {activeStream.isLive ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400">Đang phát trực tiếp</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span>Không trực tiếp</span>
                      </>
                    )}
                  </div>
                  {activeStream.viewerCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{activeStream.viewerCount.toLocaleString()} người xem</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <Chat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isConnected={isSocketConnected}
              className="h-full"
            />
          </div>
        </div>

        {/* Video Archive */}
        <VideoArchive
          videos={videoArchive}
          onVideoSelect={handleVideoSelect}
          className="mb-8"
        />

        {/* Footer Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-3">📞 Thông tin liên hệ</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Hotline/Zalo: <span className="text-green-400">0393835679</span></p>
                <p>Địa chỉ: Phước Lâm, Hoà Hiệp Bắc, Đông Hoà, Phú Yên</p>
                <div className="flex space-x-2 mt-3">
                  <a href="https://zalo.me/0393835679" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                    Zalo
                  </a>
                  <a href="https://zalo.me/g/pfyfcy269" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                    Nhóm Zalo
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-white font-semibold mb-3">💳 Thông tin chuyển khoản</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Ngân hàng: <span className="text-yellow-400">Vietinbank</span></p>
                <p>Tên người nhận: <span className="text-yellow-400">Lê Duy Thanh</span></p>
                <p>Số tài khoản: <span className="text-yellow-400">0393835679</span></p>
              </div>
            </div>

            {/* Rules */}
            <div>
              <h3 className="text-white font-semibold mb-3">⚠️ Quy định</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p>✅ Xổ Gà Mua Bán Trên Tinh Thần Giao Lưu Vui Vẻ, Lịch Sự</p>
                <p>🚫 Không Để Số Điện Thoại</p>
                <p>🚫 Không Cá Cược Dưới Mọi Hình Thức</p>
                <p className="text-red-400 font-medium">⛔ CẤM CÁ CƯỢC, CHỬI THỀ, KHOÁ NICK!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>Bản quyền thuộc về CLB Gà Chọi Cậu Thanh © 2025</p>
            <p className="mt-1">Website hoạt động với hình thức giải trí, vui lòng không cá độ dưới mọi hình thức vi phạm pháp luật Việt Nam</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
