import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import axios from 'axios';

interface Stream {
  id: number;
  title: string;
  description: string;
  streamUrl: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStream, setNewStream] = useState({
    title: '',
    description: '',
    streamUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      navigate('/login');
      return;
    }
    
    fetchStreams();
  }, [navigate]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/admin/streams');
      setStreams(response.data);
    } catch (err: any) {
      setError('Không thể tải danh sách stream');
      console.error('Error fetching streams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/admin/streams/start', {
        ...newStream,
        status: 'LIVE'
      });
      
      setStreams(prev => [...prev, response.data]);
      setNewStream({ title: '', description: '', streamUrl: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      setError('Không thể tạo stream mới');
      console.error('Error creating stream:', err);
    }
  };

  const handleStopStream = async (streamId: number) => {
    try {
      await axios.post(`http://localhost:8080/api/admin/streams/${streamId}/stop`);
      setStreams(prev => 
        prev.map(stream => 
          stream.id === streamId 
            ? { ...stream, status: 'OFFLINE' }
            : stream
        )
      );
    } catch (err: any) {
      setError('Không thể dừng stream');
      console.error('Error stopping stream:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard - WebLiveStream
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Xin chào, {authService.getUsername()}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Create Stream Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {showCreateForm ? 'Hủy' : 'Tạo Stream Mới'}
          </button>
        </div>

        {/* Create Stream Form */}
        {showCreateForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Tạo Stream Mới</h2>
            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={newStream.title}
                  onChange={(e) => setNewStream({...newStream, title: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  required
                  value={newStream.description}
                  onChange={(e) => setNewStream({...newStream, description: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stream URL</label>
                <input
                  type="url"
                  required
                  value={newStream.streamUrl}
                  onChange={(e) => setNewStream({...newStream, streamUrl: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Tạo Stream
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Streams List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {streams.map((stream) => (
              <li key={stream.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{stream.title}</h3>
                    <p className="text-gray-600">{stream.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>URL: {stream.streamUrl}</span>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          stream.status === 'LIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {stream.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {stream.status === 'LIVE' && (
                      <button
                        onClick={() => handleStopStream(stream.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Dừng Stream
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {streams.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Chưa có stream nào
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
