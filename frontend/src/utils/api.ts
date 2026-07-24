const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface DispatchRequest {
  caller_name: string;
  phone: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface TriageRequest {
  incident_id: string;
  conversation: string;
}

export interface VisionAnalysisRequest {
  incident_id: string;
  image_file: File;
}

// Dispatch endpoints
export async function createDispatch(data: DispatchRequest) {
  const response = await fetch(`${API_URL}/dispatch/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Dispatch failed: ${response.statusText}`);
  return response.json();
}

export async function getDispatch(id: string) {
  const response = await fetch(`${API_URL}/dispatch/${id}`);
  if (!response.ok) throw new Error(`Get dispatch failed: ${response.statusText}`);
  return response.json();
}

export async function getAllDispatch() {
  const response = await fetch(`${API_URL}/dispatch/`);
  if (!response.ok) throw new Error(`Get all dispatch failed: ${response.statusText}`);
  return response.json();
}

// Triage endpoints
export async function performTriage(data: TriageRequest) {
  const response = await fetch(`${API_URL}/triage/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Triage failed: ${response.statusText}`);
  return response.json();
}

// Vision endpoints
export async function analyzeVision(data: VisionAnalysisRequest) {
  const formData = new FormData();
  formData.append('incident_id', data.incident_id);
  formData.append('file', data.image_file);

  const response = await fetch(`${API_URL}/vision/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`Vision analysis failed: ${response.statusText}`);
  return response.json();
}

export async function getVisionResult(id: string) {
  const response = await fetch(`${API_URL}/vision/get/${id}`);
  if (!response.ok) throw new Error(`Get vision result failed: ${response.statusText}`);
  return response.json();
}

// Hospital endpoints
export async function calculateETA(origin: string, destination: string) {
  const response = await fetch(`${API_URL}/hospital/eta?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  if (!response.ok) throw new Error(`ETA calculation failed: ${response.statusText}`);
  return response.json();
}

export async function getNearestHospital(latitude: number, longitude: number) {
  const response = await fetch(`${API_URL}/hospital/nearest?latitude=${latitude}&longitude=${longitude}`);
  if (!response.ok) throw new Error(`Get nearest hospital failed: ${response.statusText}`);
  return response.json();
}

export async function sendHospitalAlert(data: any) {
  const response = await fetch(`${API_URL}/hospital/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Hospital alert failed: ${response.statusText}`);
  return response.json();
}

// Health check
export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error(`Health check failed: ${response.statusText}`);
  return response.json();
}
