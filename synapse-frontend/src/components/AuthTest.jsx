import { useState } from 'react';
import { createRoom } from '../api';

const AuthTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setStatus('Testing authentication...');
    
    try {
      const result = await createRoom();
      setStatus(`✅ Authentication successful! Room created: ${result.data.roomId}`);
    } catch (error) {
      if (error.response?.status === 401) {
        setStatus('❌ Authentication failed: Only registered users can create rooms');
      } else if (error.response?.status === 403) {
        setStatus('❌ Access denied: You don\'t have permission');
      } else {
        setStatus(`❌ Error: ${error.response?.data?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🔐 Authentication Test</h3>
      <p>This tests if only registered users can access protected features.</p>
      <button 
        onClick={testAuth} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Create Room (Requires Database User)'}
      </button>
      {status && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AuthTest;
