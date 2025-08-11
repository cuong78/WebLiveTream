// Test manual stream status check
window.testStreamStatus = async () => {
  try {
    console.log('🔍 Testing stream status...');
    
    // 1. Check API status
    const response = await fetch('http://localhost:8080/api/livestream/status');
    const data = await response.json();
    console.log('📡 API Response:', data);
    
    // 2. Check if stream is live
    if (data.isLive || data.live) {
      console.log('✅ Stream is LIVE!');
      console.log('📺 Title:', data.streamTitle);
      console.log('👥 Viewers:', data.viewerCount);
    } else {
      console.log('❌ Stream is OFFLINE');
    }
    
    // 3. Try to join as viewer
    const joinResponse = await fetch('http://localhost:8080/api/livestream/viewer/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (joinResponse.ok) {
      console.log('✅ Successfully joined as viewer');
    } else {
      console.log('❌ Failed to join as viewer');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing stream:', error);
  }
};

// Call the test function
window.testStreamStatus();
