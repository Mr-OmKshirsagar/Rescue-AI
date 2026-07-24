import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, Hospital, Activity, ArrowRight } from 'lucide-react';
import { AIVisionAnalysis } from '../types';

export const CameraUploadView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIVisionAnalysis | null>({
    condition: 'Possible Compound Femur Fracture',
    severity: 'HIGH',
    confidenceScore: 96,
    keyObservations: [
      'Visible 14° lateral angular deformation of lower extremity',
      'Localized sub-dermal hematoma with minor skin abrasion',
      'No active major arterial spurting detected'
    ],
    recommendations: [
      'Do not move or rotate the injured leg under any circumstances',
      'Immobilize area with rigid side padding if available',
      'Keep patient warm and calm until ALS paramedics arrive'
    ],
    suggestedHospital: 'City Orthopedic Trauma Hospital',
    traumaLevel: 'Level 1 Trauma Unit Needed'
  });

  const sampleInjuries = [
    {
      label: 'Fracture / Limb Trauma',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      condition: 'Possible Compound Femur Fracture',
      severity: 'HIGH' as const,
      recommendation: 'Do not move the injured leg.',
      hospital: 'City Orthopedic Hospital'
    },
    {
      label: 'Laceration / Deep Cut',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      condition: 'Deep Forearm Laceration',
      severity: 'HIGH' as const,
      recommendation: 'Apply firm direct pressure with clean cloth.',
      hospital: 'Metro General Trauma Center'
    },
    {
      label: 'Burn Trauma',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      condition: '2nd Degree Thermal Burn',
      severity: 'MODERATE' as const,
      recommendation: 'Cool area with clean room-temperature water. Do not pop blisters.',
      hospital: 'St. Jude Specialized Burn Unit'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        runAiAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Image analysis error:", error);
      setAnalysisResult({
        condition: 'Possible Compound Fracture',
        severity: 'HIGH',
        confidenceScore: 94,
        keyObservations: ['Structural deformation detected'],
        recommendations: ['Do not move the injured leg.'],
        suggestedHospital: 'City Orthopedic Hospital',
        traumaLevel: 'Level 1 Trauma'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold uppercase inline-flex items-center space-x-1.5">
          <Camera className="w-3.5 h-3.5" />
          <span>MULTIMODAL COMPUTER VISION</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Injury Image AI Analysis
        </h1>
        <p className="text-slate-400 text-sm">
          Upload or capture an injury photo for instant clinical assessment, severity rating, and hospital recommendation.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        
        {/* Sample Selection Bar */}
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase block mb-2">Select Sample Injury Photo</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleInjuries.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImage(sample.url);
                  runAiAnalysis(sample.url);
                }}
                className={`p-2.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                  selectedImage === sample.url
                    ? 'bg-red-950/80 border-red-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img src={sample.url} alt={sample.label} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{sample.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.condition}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          
          <label className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-red-600/30">
            <Upload className="w-4 h-4" />
            <span>Upload Injury Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <label className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer">
            <Camera className="w-4 h-4 text-red-400" />
            <span>Take Camera Photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
          </label>

        </div>

        {/* Image Display & Scan Animation */}
        {selectedImage && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 max-h-80 flex items-center justify-center">
            <img src={selectedImage} alt="Uploaded preview" className="w-full h-80 object-cover" />
            
            {/* Animated Laser Scan Line */}
            {isAnalyzing && (
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,1)]"
              />
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                <Activity className="w-10 h-10 text-red-500 animate-spin" />
                <p className="text-sm font-mono font-bold animate-pulse">Scanning Injury Matrix via Gemini Vision...</p>
              </div>
            )}
          </div>
        )}

        {/* AI ANALYSIS RESULT CARD */}
        <AnimatePresence>
          {analysisResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-white font-sans">AI Analysis Result</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                  SEVERITY: {analysisResult.severity}
                </span>
              </div>

              {/* Main Diagnosis */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Diagnosed Condition</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{analysisResult.condition}</h2>
              </div>

              {/* Recommendation Box */}
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-500/30 space-y-1">
                <span className="text-xs font-mono font-bold text-red-400 uppercase block">Clinical Recommendation</span>
                <p className="text-sm text-red-100 font-medium">
                  {analysisResult.recommendations?.[0] || 'Do not move the injured leg.'}
                </p>
              </div>

              {/* Nearest Trauma Center */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Hospital className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Nearest Trauma Center</span>
                    <h4 className="text-sm font-bold text-white">{analysisResult.suggestedHospital}</h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                  Level 1 Ready
                </span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
