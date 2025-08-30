import { useState, useRef, useCallback } from 'react';

const useWebRTC = (socket, roomId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'video' or 'voice'
  const [isInCall, setIsInCall] = useState(false);
  
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());

  const startLocalStream = useCallback(async (type) => {
    try {
      const constraints = {
        video: type === 'video',
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [localStream]);

  const createPeerConnection = useCallback((targetSocketId) => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const pc = new RTCPeerConnection(config);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetSocketId
        });
      }
    };
    
    pc.ontrack = (event) => {
      console.log('Received remote stream from', targetSocketId);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(targetSocketId, event.streams[0]);
        return newMap;
      });
    };
    
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${targetSocketId}:`, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(targetSocketId);
          return newMap;
        });
      }
    };
    
    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    peerConnections.current.set(targetSocketId, pc);
    return pc;
  }, [socket, roomId, localStream]);

  const startCall = useCallback(async (type) => {
    try {
      await startLocalStream(type);
      setCallType(type);
      setIsCallActive(true);
      setIsInCall(true);
      
      if (socket) {
        socket.emit('start-call', { roomId, callType: type });
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  }, [socket, roomId, startLocalStream]);

  const joinCall = useCallback(async (type) => {
    try {
      await startLocalStream(type);
      setCallType(type);
      setIsInCall(true);
      
      if (socket) {
        socket.emit('join-call', { roomId });
      }
    } catch (error) {
      console.error('Error joining call:', error);
    }
  }, [socket, roomId, startLocalStream]);

  const leaveCall = useCallback(() => {
    stopLocalStream();
    
    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
    // Clear remote streams
    setRemoteStreams(new Map());
    
    setIsCallActive(false);
    setIsInCall(false);
    setCallType(null);
    
    if (socket) {
      socket.emit('leave-call', { roomId });
    }
  }, [socket, roomId, stopLocalStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }, [localStream]);

  return {
    localStream,
    remoteStreams,
    isCallActive,
    callType,
    isInCall,
    localVideoRef,
    startCall,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    createPeerConnection,
    peerConnections: peerConnections.current
  };
};

export default useWebRTC;
