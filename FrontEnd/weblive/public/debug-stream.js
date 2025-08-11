// Debug script để kiểm tra stream status
console.log('🔍 Debug Stream Status');

// Check API endpoint directly
fetch('https://livestreambe.zeabur.app/api/livestream/status')
  .then(response => response.json())
  .then(data => {
    console.log('📡 Stream Status from API:', data);
    console.log('🔴 Is Live:', data.isLive || data.live);
    console.log('👥 Viewer Count:', data.viewerCount);
    console.log('📺 Stream Title:', data.streamTitle);
  })
  .catch(error => {
    console.error('❌ Error fetching stream status:', error);
  });

// Check WebSocket connection
const wsUrl = 'ws://localhost:8080/ws';
console.log('🔌 Testing WebSocket connection to:', wsUrl);

// Check if stream status is in localStorage
const streamStatus = localStorage.getItem('streamStatus');
if (streamStatus) {
  console.log('💾 Stream Status in localStorage:', JSON.parse(streamStatus));
} else {
  console.log('💾 No stream status in localStorage');
}
