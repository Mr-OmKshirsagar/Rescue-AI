import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export interface IncidentData {
  incident_id: string;
  caller_name: string;
  phone: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  severity?: string;
  summary?: string;
  image_url?: string;
}

export interface AmbulanceLocation {
  incident_id: string;
  latitude: number;
  longitude: number;
  status: string;
  eta_minutes: number;
}

export interface VisionResult {
  incident_id: string;
  severity: string;
  analysis: string;
  recommendation: string;
  image_url?: string;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [ambulanceLocations, setAmbulanceLocations] = useState<Record<string, AmbulanceLocation>>({});
  const [visionResults, setVisionResults] = useState<Record<string, VisionResult>>({});

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:8000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected to backend');
      setConnected(true);
      
      // Subscribe to all incidents
      newSocket.emit('incident_subscribe', { incident_id: 'all' });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected from backend');
      setConnected(false);
    });

    // Real-time incident events
    newSocket.on('NEW_INCIDENT', (data: IncidentData) => {
      console.log('🚨 New incident:', data);
      setIncidents((prev) => [data, ...prev]);
    });

    newSocket.on('INCIDENT_UPDATED', (data: IncidentData) => {
      console.log('📝 Incident updated:', data);
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.incident_id === data.incident_id ? data : incident
        )
      );
    });

    // Ambulance location updates (every 5 seconds)
    newSocket.on('AMBULANCE_LOCATION', (data: AmbulanceLocation) => {
      console.log('📍 Ambulance location:', data);
      setAmbulanceLocations((prev) => ({
        ...prev,
        [data.incident_id]: data,
      }));
    });

    // Vision analysis results
    newSocket.on('VISION_RESULT', (data: VisionResult) => {
      console.log('👁️ Vision result:', data);
      setVisionResults((prev) => ({
        ...prev,
        [data.incident_id]: data,
      }));
      
      // Update incident with vision severity
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.incident_id === data.incident_id
            ? { ...incident, severity: data.severity }
            : incident
        )
      );
    });

    // ETA updates
    newSocket.on('ETA_UPDATED', (data: any) => {
      console.log('⏱️ ETA updated:', data);
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.incident_id === data.incident_id
            ? { ...incident, eta: data.eta }
            : incident
        )
      );
    });

    // Hospital alerts
    newSocket.on('HOSPITAL_ALERT', (data: any) => {
      console.log('🏥 Hospital alert:', data);
    });

    // Connection response
    newSocket.on('CONNECTION_RESPONSE', (data: any) => {
      console.log('Connection response:', data);
    });

    // Subscription response
    newSocket.on('SUBSCRIPTION_RESPONSE', (data: any) => {
      console.log('Subscription response:', data);
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return {
    socket,
    connected,
    incidents,
    ambulanceLocations,
    visionResults,
    setIncidents,
    setAmbulanceLocations,
    setVisionResults,
  };
}
