import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Cpu, Camera, Hospital, CheckCircle2 } from 'lucide-react';

export const HowItWorksTimeline: React.FC = () => {
  const steps = [
    {
      num: 'Step 1',
      title: 'Emergency Call',
      description: 'Caller dials ResqAI line or opens app. Voice assistant connects in under 800 milliseconds.',
      icon: PhoneCall,
      color: 'from-red-500 to-red-600'
    },
    {
      num: 'Step 2',
      title: 'AI Collects Information',
      description: 'Natural speech triage extracts symptoms, caller location, and evaluates medical threat index.',
      icon: Cpu,
      color: 'from-red-600 to-amber-500'
    },
    {
      num: 'Step 3',
      title: 'Photo Upload',
      description: 'Caller or bystander uploads injury image for instant computer vision fracture/wound diagnosis.',
      icon: Camera,
      color: 'from-amber-500 to-emerald-500'
    },
    {
      num: 'Step 4',
      title: 'Hospital Alert',
      description: 'Nearest trauma bay receives live patient summary, vitals forecast, and prep requirements.',
      icon: Hospital,
      color: 'from-emerald-500 to-blue-500'
    },
    {
      num: 'Step 5',
      title: 'Ambulance Arrives',
      description: 'ALS unit arrives with continuous telemetry sync. Patient transferred without intake delay.',
      icon: CheckCircle2,
      color: 'from-blue-500 to-red-500'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-[#090A0F]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
        <h2 className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
          AUTOMATED DISPATCH WORKFLOW
        </h2>
        <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          How ResqAI Operates in Seconds
        </h3>
        <p className="text-slate-400 text-base sm:text-lg">
          An end-to-end intelligent pipeline connecting the victim, dispatch, vision model, and hospital trauma bay.
        </p>
      </div>

      {/* Steps Timeline Container */}
      <div className="relative">
        
        {/* Glowing Desktop Connecting Line */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0">
          <motion.div 
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Node Icon Circle */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-xl shadow-red-500/20 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold uppercase">
                    0{idx + 1}
                  </span>
                </div>

                {/* Step Card */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl w-full hover:border-red-500/40 transition-colors duration-300 backdrop-blur-md">
                  <span className="text-xs font-mono font-bold text-red-400 block mb-1">{step.num}</span>
                  <h4 className="text-base font-bold text-white mb-2 font-sans">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
