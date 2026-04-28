import React from 'react';
import { Search, ClipboardList, Settings, BarChart3, HelpCircle, Terminal, Bell, History, Play, Send, CheckCircle2, Zap, BrainCircuit, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuditTrail from './AuditTrail';
import { analyzeJobMatch, UserProfile } from '../services/geminiService';

// --- Types ---
interface Job {
  id: string;
  company: string;
  title: string;
  matchScore: number;
  tags: string[];
  location: string;
  salary: string;
  equity: string;
  bonus: string;
  description: string;
  requirements: string[];
  cultureInfo: string;
  status: 'Discovery' | 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Rejected';
  recruiter: {
    name: string;
    role: string;
    avatar: string;
  };
  context: {
    type: 'positive' | 'neutral' | 'negative';
    text: string;
  }[];
  analysis?: {
    reasoning: string;
    cultureAlignment: number;
    skillMatch: number;
  };
}

interface LogEntry {
  time: string;
  tag: string;
  message: string;
  type: 'brand' | 'success' | 'white' | 'error';
}

interface DashboardProps {
  user: { email: string; name: string };
  onLogout: () => void;
}

// --- Mock Data ---
const MOCK_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  skills: ['React', 'TypeScript', 'Node.js', 'Systems Thinking', 'UI/UX Design', 'Fintech APIs'],
  experienceYears: 12,
  preferences: ['Craft-focused', 'Autonomous teams', 'Financial infrastructure'],
  biography: 'Experienced Product Engineer with a background in systems design. Passionate about building high-quality software that is both functional and aesthetically pleasing. Spent significant time at Stripe focused on developer experience.',
  targetCulture: 'Engineering-led, high agency, documentation-heavy, design-respecting.'
};

const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    company: 'GOOGLE',
    title: 'Senior UX Architect',
    matchScore: 98,
    tags: ['Mountain View', 'L6 Equivalent'],
    location: 'Google Cloud • Mountain View, CA (On-site)',
    salary: '$240k – $310k',
    equity: '0.02% (GSUs)',
    bonus: '15-20% Target',
    description: 'Lead the design strategy for Google Cloud Platform. We need someone who can harmonize complex infrastructure into intuitive experiences. You will be working with large-scale distributed systems and defining the next generation of cloud interfaces.',
    requirements: ['10+ years UX Design', 'Expertise in complex systems', 'Proven leadership on L6+ projects', 'Strong systems thinking'],
    cultureInfo: 'Highly collaborative, data-driven, engineering-centric but UX-respecting. Focus on long-term scalability and security.',
    status: 'Applied',
    recruiter: {
      name: 'Sarah Jenkins',
      role: 'Talent Lead @ Google Cloud',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    },
    context: [
      { type: 'positive', text: 'Matches your "Systems Thinking" core competency from Stripe tenure.' },
      { type: 'positive', text: 'Salary range ($240k - $310k) exceeds your minimum preference by 18%.' },
      { type: 'neutral', text: 'Role requires frequent travel to Seattle (8% match variance).' }
    ]
  },
  {
    id: '2',
    company: 'LINEAR',
    title: 'Product Engineer',
    matchScore: 94,
    tags: ['Remote', 'TypeScript'],
    location: 'Linear • Remote (Global)',
    salary: '$180k – $220k',
    equity: '0.5%',
    bonus: 'N/A',
    description: 'We are looking for a product engineer who cares deeply about craft. Linear is built for high-performance teams. You should be comfortable moving across the stack but have a sharp eye for UI polish and interaction details.',
    requirements: ['Mastery of React & TS', 'Product mind (you decide what to build)', 'Obsession with quality', 'Async-first communication'],
    cultureInfo: 'Small, autonomous, craft-obsessed team. No managers, just engineers. Relies on trust and high individual agency.',
    status: 'Interviewing',
    recruiter: {
      name: 'Karolis Ramanauskas',
      role: 'Founding Engineer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
    },
    context: [
      { type: 'positive', text: 'Highly aligned with your preference for craft-focused startups.' },
      { type: 'positive', text: 'Full remote flexibility matches your "Nomad" lifestyle tag.' }
    ]
  },
  {
    id: '3',
    company: 'STRIPE',
    title: 'Staff Designer, Connect',
    matchScore: 82,
    tags: ['Dublin / NYC', 'Systems Design'],
    location: 'Stripe • Dublin, IE (Hybrid)',
    salary: '€160k – €190k',
    equity: 'Competitive',
    bonus: '10% Performance',
    description: 'Join the Connect team to build the financial infrastructure of the internet. You will be responsible for the end-to-end experience of platforms using Stripe to move money. Requires deep understanding of complex workflows and APIs.',
    requirements: ['Deep visual design skills', 'Systems design background', 'Ability to navigate ambiguity', '8+ years experience'],
    cultureInfo: 'Rigorous, writing-heavy, intellectually curious. High bar for beauty and technical depth. Strong emphasis on high-quality documentation.',
    status: 'Discovery',
    recruiter: {
      name: 'Emily Chen',
      role: 'Global Design Recruiting',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
    },
    context: [
      { type: 'positive', text: 'Experience with fintech APIs is a primary keyword match.' },
      { type: 'neutral', text: 'Hybrid requirement may conflict with current residence.' }
    ]
  }
];

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [selectedJob, setSelectedJob] = React.useState<Job>(INITIAL_JOBS[0]);
  const [appliedJobs, setAppliedJobs] = React.useState<Set<string>>(new Set());
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isAgentRunning, setIsAgentRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Discovery');
  const [userProfile, setUserProfile] = React.useState<UserProfile>(MOCK_USER_PROFILE);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [jobs, setJobs] = React.useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = React.useState('');

  const addLog = (tag: string, message: string, type: LogEntry['type'] = 'white') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [{ time, tag, message, type }, ...prev].slice(0, 50));
  };

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRunAgent = async () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    addLog('INIT', 'Initializing Agent Alpha search sequence...', 'brand');
    showNotification('AI Analysis sequence started', 'info');
    
    addLog('SCAN', "Crawling enterprise job boards...", 'white');
    
    try {
      const updatedJobs = await Promise.all(jobs.map(async (job) => {
        addLog('NLP', `Analyzing alignment for ${job.company}...`, 'brand');
        const analysis = await analyzeJobMatch(userProfile, {
          id: job.id,
          company: job.company,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          culture: job.cultureInfo
        });
        
        return {
          ...job,
          matchScore: analysis.score,
          analysis: {
            reasoning: analysis.reasoning,
            cultureAlignment: analysis.cultureAlignment,
            skillMatch: analysis.skillMatch
          },
          context: [
            ...analysis.pros.map(p => ({ type: 'positive' as const, text: p })),
            ...analysis.cons.map(c => ({ type: 'neutral' as const, text: c }))
          ]
        };
      }));

      // Sort by score
      const sortedJobs = [...updatedJobs].sort((a, b) => b.matchScore - a.matchScore);
      setJobs(sortedJobs);
      setSelectedJob(sortedJobs[0]);
      
      addLog('MATCH', "Sophisticated NLP analysis complete. New alignments established.", 'success');
      showNotification('AI Analysis complete');
    } catch (error) {
      addLog('ERR', "NLP cluster failed to respond. Falling back to static data.", 'error');
    } finally {
      setIsAgentRunning(false);
      addLog('IDLE', 'Deep analysis complete. Awaiting user action.', 'white');
    }
  };

  const handleApply = (jobId: string) => {
    if (appliedJobs.has(jobId)) return;
    setAppliedJobs(prev => new Set([...prev, jobId]));
    
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Applied' } : j));
    
    const job = jobs.find(j => j.id === jobId);
    addLog('APPLY', `Dispatched tailored application for ${job?.company}.`, 'success');
    showNotification(`Successfully applied to ${job?.company}`);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* --- Sidebar --- */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-20 flex items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Terminal className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">JobVault</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
          <nav className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dashboard</p>
            {[
              { icon: Search, label: 'Discovery' },
              { icon: Users, label: 'Identity' },
              { icon: ClipboardList, label: 'Audit Trail' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  addLog('NAV', `Navigated to ${item.label}`, 'brand');
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group w-full ${
                  activeTab === item.label 
                  ? 'text-brand bg-brand/5 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.label ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Session</p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-medium">Daily Limit</span>
                <span className="text-xs font-bold text-slate-900">12/20</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand h-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
               <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <button onClick={onLogout} className="text-xs font-medium text-slate-500 hover:text-brand transition-colors">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="lg:ml-72 flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900"
            >
              <Terminal className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Agent Sync Ready
            </div>
            <button 
              onClick={handleRunAgent}
              disabled={isAgentRunning}
              className={`bg-brand text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg shadow-brand/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 ${isAgentRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className={`w-3 h-3 fill-current ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>{isAgentRunning ? 'Running...' : 'Run Analysis'}</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'Audit Trail' ? (
            <AuditTrail />
          ) : activeTab === 'Identity' ? (
            <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-in fade-in duration-500">
               <header>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Professional Identity</h1>
                 <p className="text-slate-500 font-medium">Define your professional parameters for the AI matching cluster.</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <section className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-brand transition-colors">Full Name</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-brand transition-colors">Years of Experience</label>
                      <input 
                        type="number" 
                        value={userProfile.experienceYears}
                        onChange={(e) => setUserProfile({ ...userProfile, experienceYears: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                      />
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-brand transition-colors">Core Skills (CSV)</label>
                      <input 
                        type="text" 
                        value={userProfile.skills.join(', ')}
                        onChange={(e) => setUserProfile({ ...userProfile, skills: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                      />
                    </div>
                 </section>

                 <section className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-brand transition-colors">Target Culture</label>
                      <textarea 
                        rows={4}
                        value={userProfile.targetCulture}
                        onChange={(e) => setUserProfile({ ...userProfile, targetCulture: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all resize-none"
                        placeholder="Describe your ideal work environment..."
                      />
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-brand transition-colors">Professional Biography</label>
                      <textarea 
                        rows={4}
                        value={userProfile.biography}
                        onChange={(e) => setUserProfile({ ...userProfile, biography: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all resize-none"
                        placeholder="Key achievements and goals..."
                      />
                    </div>
                 </section>
               </div>

               <div className="bg-brand/5 border border-brand/10 rounded-3xl p-8 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-brand/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">NLP Vector Sync</h4>
                      <p className="text-xs text-slate-500 font-medium">Changes here will instantly refine the job matching algorithm.</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => {
                    setActiveTab('Discovery');
                    handleRunAgent();
                  }}
                  className="bg-brand text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:brightness-110 active:scale-95 transition-all"
                 >
                   Sync & Analyze
                 </button>
               </div>
            </div>
          ) : activeTab === 'Settings' ? (
             <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-6 professional-shadow mx-auto max-w-2xl mt-12">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center text-slate-300">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Agent Settings</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Fine-tune your automated search criteria and notification preferences.</p>
              <button className="bg-brand text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:brightness-110 transition-all">Save Preferences</button>
            </div>
          ) : activeTab === 'Analytics' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-12 professional-shadow mt-12 max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Performance Overview</h2>
              <div className="flex justify-center items-end gap-6 h-64 pb-4">
                {[40, 65, 85, 55, 95, 75, 90].map((h, i) => (
                  <div key={i} className="w-12 group relative flex flex-col items-center flex-1">
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: h + '%' }} 
                      className="w-full bg-slate-100 rounded-lg group-hover:bg-brand/10 transition-colors relative"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-brand/20 group-hover:bg-brand rounded-full transition-all" />
                    </motion.div>
                    <span className="mt-4 text-[10px] font-bold text-slate-400">MAY {10+i}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                <div>
                   <p className="text-2xl font-black text-slate-900">2.4k</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Interviews</p>
                </div>
                <div>
                   <p className="text-2xl font-black text-slate-900">+12%</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Success Rate</p>
                </div>
                <div>
                   <p className="text-2xl font-black text-slate-900">890</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Applications</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8 h-full">
              {/* Job List */}
              <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                <div className="flex flex-col gap-4 mb-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Best Matches</h2>
                    <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{filteredJobs.length} FOUND</span>
                  </div>
                  
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filter title, company, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 h-[calc(100vh-340px)] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        layoutId={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-6 rounded-2xl cursor-pointer transition-all border group relative flex flex-col gap-1 ${
                          selectedJob.id === job.id 
                          ? 'bg-white border-brand ring-4 ring-brand/5 shadow-xl' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{job.company}</p>
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            job.status === 'Applied' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            job.status === 'Interviewing' ? 'bg-brand/10 text-brand border-brand/20' :
                            job.status === 'Screening' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {job.status}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-brand transition-colors">{job.title}</h3>
                          <div className={`text-sm font-black whitespace-nowrap px-2 py-1 rounded-lg ${
                            job.matchScore > 90 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                          }`}>
                            {job.matchScore}%
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-slate-500 text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                      <Search className="w-8 h-8 mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No matches found</p>
                    </div>
                  )}
                </div>
              </section>
    
              {/* Job Detail */}
              <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white rounded-3xl overflow-hidden flex flex-col border border-slate-200 professional-shadow">
                  {/* Hero Header */}
                  <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-4 border border-slate-100 shadow-sm shrink-0">
                          <img 
                            src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" 
                            alt="Logo" 
                            className="w-full h-auto"
                          />
                        </div>
                        <div>
                          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-3">{selectedJob.title}</h2>
                          <p className="text-slate-500 font-medium flex items-center gap-2">
                             {selectedJob.company} • {selectedJob.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
    
                  {/* Content Grid */}
                  <div className="p-10 overflow-y-auto max-h-[calc(100vh-420px)] custom-scrollbar">
                    <div className="space-y-10">
                      {selectedJob.analysis ? (
                        <div className="bg-brand/5 border border-brand/10 p-8 rounded-3xl space-y-8">
                          <div className="flex items-center gap-3 mb-2">
                             <BrainCircuit className="w-5 h-5 text-brand" />
                             <h4 className="text-xs font-black text-brand uppercase tracking-widest">Advanced AI Insights</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                              <div className="flex justify-between items-end mb-1">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Culture Alignment</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{selectedJob.analysis.cultureAlignment}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedJob.analysis.cultureAlignment}%` }}
                                  className="bg-brand h-full" 
                                />
                              </div>

                              <div className="flex justify-between items-end mb-1 pt-4">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Precision</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{selectedJob.analysis.skillMatch}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${selectedJob.analysis.skillMatch}%` }}
                                  className="bg-emerald-500 h-full" 
                                />
                              </div>
                            </div>

                            <div className="lg:col-span-2 bg-white/50 border border-brand/5 p-6 rounded-2xl">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Reasoning</p>
                              <p className="text-sm leading-relaxed text-slate-600 font-medium italic">"{selectedJob.analysis.reasoning}"</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                          <Zap className="w-6 h-6 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Run Analysis for Deep AI Insights</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                        <div className="lg:col-span-8 space-y-12">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 mb-6 tracking-widest uppercase">Match Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedJob.context.map((ctx, i) => (
                                <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                                    ctx.type === 'positive' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`} />
                                  <p className="text-sm leading-relaxed text-slate-600 font-medium">{ctx.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase">Job Description</h4>
                              <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                {selectedJob.description}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase">Key Requirements</h4>
                              <ul className="space-y-2">
                                {selectedJob.requirements.map(req => (
                                  <li key={req} className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-8 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase">Company Culture</h4>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                {selectedJob.cultureInfo}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                           <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 space-y-8">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compensation</p>
                              <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{selectedJob.salary}</span>
                              <div className="flex gap-4 mt-6 pt-6 border-t border-slate-200">
                                 <div>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Equity</p>
                                   <p className="text-sm font-bold text-slate-900">{selectedJob.equity}</p>
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bonus</p>
                                   <p className="text-sm font-bold text-slate-900">{selectedJob.bonus}</p>
                                 </div>
                              </div>
                            </div>
                          </div>
        
                          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={selectedJob.recruiter.avatar} alt="Recruiter" className="w-10 h-10 rounded-full border border-slate-200" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{selectedJob.recruiter.name}</p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Recruiter</p>
                              </div>
                            </div>
                            <button className="text-brand font-bold text-xs hover:underline uppercase tracking-widest">Connect</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
                {/* Secondary Logs (Subtle) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 font-medium shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isAgentRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Log</span>
                    </div>
                  </div>
                  
                  <div className="h-24 overflow-y-auto custom-scrollbar text-[11px] space-y-1.5 text-slate-500">
                    {logs.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <span className="text-slate-300 shrink-0">[{log.time}]</span>
                        <span className="font-bold text-slate-400 w-12 text-right uppercase tracking-[0.1em]">{log.tag}:</span>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Floating Application Button */}
      <div className="fixed bottom-10 right-10 z-[60]">
        <button 
          onClick={() => handleApply(selectedJob.id)}
          disabled={appliedJobs.has(selectedJob.id)}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all ${
            appliedJobs.has(selectedJob.id)
            ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-100'
            : 'bg-brand text-white shadow-xl shadow-brand/30 hover:scale-105 active:scale-95'
          }`}
        >
          <Send className={`w-4 h-4 ${appliedJobs.has(selectedJob.id) ? 'fill-current' : ''}`} />
          <span>{appliedJobs.has(selectedJob.id) ? 'Applied Successfully' : 'Apply for this Role'}</span>
        </button>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-10 right-10 z-[101] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${
              notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
