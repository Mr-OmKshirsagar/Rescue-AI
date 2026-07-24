import React from 'react';
import { motion } from 'motion/react';
import { Mic, Siren as Ambulance, Brain, Camera, Bell, MapPin } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'AI Voice Assistant',
      description: 'Zero-latency multi-lingual emergency audio triage that understands natural panic dialogue and extracts critical facts automatically.',
      tag: '0.8s Latency',
      gradient: 'from-red-500/20 to-amber-500/10'
    },
    {
      icon: Ambulance,
      title: 'Instant Ambulance Dispatch',
      description: 'Automated GPS dispatch algorithm triggers nearby ALS units within milliseconds of threat validation without human bottleneck.',
      tag: 'Automated GPS',
      gradient: 'from-red-500/20 to-red-700/10'
    },
    {
      icon: Brain,
      title: 'AI Medical Triage',
      description: 'Clinical grade risk model categorizes trauma severity, vital threat indices, and prioritizes life-threatening cases.',
      tag: 'Clinical Score',
      gradient: 'from-amber-500/20 to-red-500/10'
    },
    {
      icon: Camera,
      title: 'Injury Image Analysis',
      description: 'Multimodal vision model scans uploaded wound or injury photos to detect fractures, burns, or arterial bleeding instantly.',
      tag: 'Multimodal AI',
      gradient: 'from-red-500/20 to-purple-500/10'
    },
    {
      icon: Bell,
      title: 'Hospital Live Alerts',
      description: 'Streams patient vitals, injury photos, and audio summaries directly to target ER trauma bays before the ambulance arrives.',
      tag: 'Pre-Arrival Prep',
      gradient: 'from-emerald-500/20 to-red-500/10'
    },
    {
      icon: MapPin,
      title: 'Live ETA Tracking',
      description: 'Real-time telemetry map streams vehicle velocity, traffic delay bypass, and countdown timer for dispatchers and families.',
      tag: 'Telemetry Map',
      gradient: 'from-blue-500/20 to-red-500/10'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
          BUILT FOR CRITICAL SECONDS
        </h2>
        <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          Next-Generation Emergency Capabilities
        </h3>
        <p className="text-slate-400 text-base sm:text-lg">
          Combining voice AI, computer vision, and predictive dispatch to eliminate emergency response friction.
        </p>
      </div>

      {/* 6 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative rounded-2xl bg-black/40 border border-white/10 p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between"
            >
              {/* Background Subtle Gradient Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/40 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    {feature.tag}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors font-sans">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Subtle Accent */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono group-hover:text-red-400 transition-colors">
                <span>ResqAI Module 0{idx + 1}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
