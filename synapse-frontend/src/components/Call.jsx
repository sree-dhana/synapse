import { useEffect, useState, useRef } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import '../styles/call.css';

const Call = ({ socket, roomId, onClose }) => {
  const {
    remoteStreams,
    callType,
    isInCall,
    localVideoRef,
    leaveCall,
    toggleMute,
    toggleVideo,
    createPeerConnection,
    peerConnections
  } = useWebRTC(socket, roomId);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleWebRTCOffer = async ({ offer, senderSocketId }) => {
      console.log('Received WebRTC offer from', senderSocketId);
      
      const pc = createPeerConnection(senderSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('webrtc-answer', {
        roomId,
        answer,
        targetSocketId: senderSocketId
      });
    };

    const handleWebRTCAnswer = async ({ answer, senderSocketId }) => {
      console.log('Received WebRTC answer from', senderSocketId);
      
      const pc = peerConnections.get(senderSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleWebRTCIceCandidate = async ({ candidate, senderSocketId }) => {
      console.log('Received ICE candidate from', senderSocketId);
      
      const pc = peerConnections.get(senderSocketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleUserJoinedCall = async ({ socketId }) => {
      console.log('User joined call:', socketId);
      
      // Create offer for the new user
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit('webrtc-offer', {
        roomId,
        offer,
        targetSocketId: socketId
      });
    };

    const handleUserLeftCall = ({ socketId }) => {
      console.log('User left call:', socketId);
      
      const pc = peerConnections.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.delete(socketId);
      }
    };

    const handleCallEnded = () => {
      console.log('Call ended');
      leaveCall();
      onClose();
    };

    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
    socket.on('user-joined-call', handleUserJoinedCall);
    socket.on('user-left-call', handleUserLeftCall);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
      socket.off('user-joined-call', handleUserJoinedCall);
      socket.off('user-left-call', handleUserLeftCall);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, roomId, createPeerConnection, peerConnections, leaveCall, onClose]);

  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  const handleLeaveCall = () => {
    leaveCall();
    onClose();
  };

  if (!isInCall) return null;

  return (
    <div className="call-overlay">
      <div className="call-container">
        <div className="call-header">
          <h3>{callType === 'video' ? '📹' : '🎙️'} {callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          <button className="close-btn" onClick={handleLeaveCall}>✕</button>
        </div>

        <div className="video-grid">
          {/* Local Video */}
          {callType === 'video' && (
            <div className="video-container local-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`video ${isVideoOff ? 'video-off' : ''}`}
              />
              <div className="video-label">You {isMuted && '🔇'}</div>
            </div>
          )}

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
            <RemoteVideo key={socketId} stream={stream} socketId={socketId} callType={callType} />
          ))}
        </div>

        {/* Call Controls */}
        <div className="call-controls">
          <button 
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🎙️'}
          </button>

          {callType === 'video' && (
            <button 
              className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
              onClick={handleToggleVideo}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? '📹' : '📸'}
            </button>
          )}

          <button 
            className="control-btn end-call"
            onClick={handleLeaveCall}
            title="End call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream, socketId, callType }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-container remote-video">
      {callType === 'video' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="video"
        />
      ) : (
        <div className="audio-only">
          <div className="avatar">🎙️</div>
        </div>
      )}
      <div className="video-label">User {socketId.slice(0, 6)}</div>
    </div>
  );
};

export default Call;
