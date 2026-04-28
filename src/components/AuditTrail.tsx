import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hourglass, Send, Video, MoreHorizontal, Bolt, CheckCircle2 } from 'lucide-react';

interface AuditJob {
  id: string;
  company: string;
  title: string;
  location: string;
  matchScore: number;
  status: 'queued' | 'sent' | 'interviewing';
  timeInfo: string;
  logo: string;
}

const AUDIT_JOBS: AuditJob[] = [
  {
    id: 'ST-8821',
    company: 'Google',
    title: 'Senior UX Architect',
    location: 'Zurich, CH',
    matchScore: 98,
    status: 'queued',
    timeInfo: 'Ready in 2m',
    logo: 'https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg'
  },
  {
    id: 'ST-8822',
    company: 'Stripe',
    title: 'Product Designer',
    location: 'Remote',
    matchScore: 82,
    status: 'queued',
    timeInfo: 'Waiting...',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg'
  },
  {
    id: 'ST-8823',
    company: 'Figma',
    title: 'Design Technologist',
    location: 'San Francisco',
    matchScore: 94,
    status: 'sent',
    timeInfo: 'Applied 4h ago',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
  },
  {
    id: 'ST-8824',
    company: 'Notion',
    title: 'Product Manager',
    location: 'New York, NY',
    matchScore: 99,
    status: 'interviewing',
    timeInfo: 'Intro Call tomorrow at 10:00 AM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png'
  }
];

export default function AuditTrail() {
  const [activeLogs, setActiveLogs] = React.useState([
    { time: '20:41:02', type: 'INFO', msg: 'Initializing headless browser session...' },
    { time: '20:41:04', type: 'INFO', msg: 'Navigating to LinkedIn.com/jobs/view/382910...' },
    { time: '20:41:08', type: 'INFO', msg: 'Parsing job description for keywords...' },
    { time: '20:41:09', type: 'MATCH', msg: 'Relevance score confirmed at 98%. Proceeding.', isSuccess: true },
    { time: '20:41:12', type: 'INFO', msg: 'Injecting personalized cover letter snippet #A4...' },
    { time: '20:41:18', type: 'INFO', msg: 'Application submitted successfully. Ref: ST-8821.', isSuccess: true },
  ]);

  const columns = [
    { id: 'queued', label: 'QUEUED', icon: Hourglass, color: 'text-zinc-500' },
    { id: 'sent', label: 'SENT', icon: Send, color: 'text-brand' },
    { id: 'interviewing', label: 'INTERVIEWING', icon: Video, color: 'text-match-high' }
  ];

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Application Pipeline</h1>
          <p className="text-sm font-medium text-slate-500">Monitoring 14 automated application sequences in real-time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Monitoring</span>
        </div>
      </header>

      {/* --- Kanban Board --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-2.5">
                 <div className={`p-2 rounded-lg bg-white border border-slate-200 shadow-sm ${col.color}`}>
                   <col.icon className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  {col.label}
                 </h3>
               </div>
               <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{AUDIT_JOBS.filter(j => j.status === col.id).length}</span>
            </div>
            
            <div className="flex-1 space-y-4 min-h-[500px] bg-slate-100/50 rounded-3xl p-4 border border-slate-100/50">
              {AUDIT_JOBS.filter(j => j.status === col.id).map(job => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-100 shadow-sm shrink-0">
                      <img src={job.logo} alt={job.company} className="max-w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      job.matchScore > 90 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {job.matchScore}% Match
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-brand transition-colors leading-tight">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{job.company} • {job.location}</p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-300">ID: {job.id}</span>
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                       <span className={`text-[10px] font-bold ${col.color}`}>
                        {job.timeInfo}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Activity Logs --- */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm professional-shadow">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Real-time Deployment Logs</h2>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session: Active</span>
           </div>
        </div>
        
        <div className="p-2">
          <div className="bg-slate-950 p-6 rounded-2xl font-mono text-[11px] h-64 overflow-y-auto custom-scrollbar flex flex-col-reverse space-y-2">
            {[...activeLogs].reverse().map((log, i) => (
              <div key={i} className="flex gap-4 items-start group py-0.5">
                <span className="text-slate-600 shrink-0 font-bold">[{log.time}]</span>
                <span className={`shrink-0 w-12 text-right font-black tracking-tight ${
                  log.isSuccess ? 'text-emerald-400' : 'text-brand-dim'
                }`}>
                  {log.type}:
                </span>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Control FAB */}
      <button className="fixed bottom-12 right-12 w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow-xl shadow-brand/30 transition-all z-[70]">
        <Bolt className="w-6 h-6" />
      </button>

      {/* Persistence Toast */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-32 right-12 bg-slate-900 text-white rounded-2xl p-4 flex items-center gap-4 shadow-2xl z-[100] min-w-[320px] border border-slate-800"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col flex-1 gap-0.5">
            <span className="text-xs font-bold uppercase tracking-widest">Pipeline Refreshed</span>
            <span className="text-[10px] text-slate-400 font-medium">All autonomous nodes are in sync.</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
