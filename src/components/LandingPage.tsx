import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Search, Shield, Zap, ArrowRight, Github } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-brand/10 selection:text-brand">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Terminal className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">JobVault</span>
          </div>
          <div className="flex items-center gap-8">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</button>
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Enterprise</button>
            <button 
              onClick={onStart}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,var(--color-brand),transparent_70%)] opacity-5 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/5 border border-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3 fill-current" />
              Now in Private Beta
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-8">
              Autonomous search.<br />
              <span className="text-brand">Professional results.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Deploy intelligent agents to navigate the global job market. Tailored applications, automated research, and verified alignments—all on one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-brand text-white px-10 py-5 rounded-2xl text-base font-bold shadow-2xl shadow-brand/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Get Started with JobVault
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl text-base font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                <Github className="w-5 h-5" />
                View Source
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Search, 
              title: "Smart Discovery", 
              desc: "Agents scan millions of opportunities to find the perfect cultural and technical fit." 
            },
            { 
              icon: Shield, 
              title: "Verified Alignments", 
              desc: "Deep analysis of company health, team structure, and total compensation packages." 
            },
            { 
              icon: Terminal, 
              title: "Automated Pipeline", 
              desc: "Tailored cover letters and application dispatches handled by your dedicated agent." 
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-10 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
