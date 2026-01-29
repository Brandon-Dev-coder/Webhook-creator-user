
import React, { useState } from 'react';
import { AppView } from './types';
import WebhookMaker from './components/WebhookMaker';
import WebhookConsole from './components/WebhookConsole';
import Utilities from './components/Utilities';
import { Layers, LayoutDashboard, Heart, Send, Link, Wrench, ShieldCheck, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);

  const renderContent = () => {
    switch (view) {
      case AppView.WEBHOOK_MAKER:
        return <WebhookMaker />;
      case AppView.WEBHOOK_CONSOLE:
        return <WebhookConsole />;
      case AppView.UTILITIES:
        return <Utilities />;
      default:
        return (
          <div className="space-y-16 animate-in fade-in duration-500 pb-20">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Secure Webhook Infrastructure</span>
              </div>
              <h1 className="text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                Engineer the future of <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600">Discord Automation</span>.
              </h1>
              <p className="text-2xl text-gray-400 mb-12 leading-relaxed font-light max-w-2xl">
                The ultimate development suite by Ryz Misty. Forge purposeful payloads, link multichannel endpoints, and architect professional notification systems.
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => setView(AppView.WEBHOOK_MAKER)}
                  className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl flex items-center gap-4 shadow-3xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-widest"
                >
                  <Layers className="w-7 h-7" /> Webhook Forge
                </button>
                <button 
                  onClick={() => setView(AppView.WEBHOOK_CONSOLE)}
                  className="px-12 py-6 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-3xl flex items-center gap-4 shadow-3xl shadow-black/40 transition-all hover:scale-[1.02] active:scale-95 border border-white/5 text-lg uppercase tracking-widest"
                >
                  <Send className="w-7 h-7" /> Command Center
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "AI-Powered Forge", icon: <Sparkles className="text-blue-400" />, desc: "Transform complex intents into rich, structured Discord embeds and logs with professional Ryz Misty AI assistance." },
                { title: "Linked Multi-Channels", icon: <Link className="text-indigo-400" />, desc: "Map purposeful templates to specific webhook endpoints. Switch server contexts and broadcast payloads instantly." },
                { title: "Private Vault", icon: <Wrench className="text-gray-400" />, desc: "Securely save and organize custom templates for recurring deployments, maintenance alerts, and system monitoring." },
              ].map((feature, i) => (
                <div key={i} className="discord-card p-10 border border-white/5 hover:border-blue-500/20 transition-all shadow-2xl hover:shadow-blue-900/10 group">
                  <div className="w-16 h-16 bg-black/30 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-24 border-t border-white/5 flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-4 text-xs font-black text-gray-500 uppercase tracking-[0.5em] opacity-40">
                Authorized By Ryz Misty <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 max-w-2xl leading-relaxed font-medium italic">
                Ryz Misty Forge is an elite-tier technical environment for Discord integration. All interactions comply with the native Discord Webhook Protocol. Data is stored locally and securely.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden font-inter selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 discord-darker p-10 flex-shrink-0 flex flex-col border-r border-white/5 z-20">
        <div className="flex items-center gap-5 mb-16 px-2 group cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
          <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-3xl shadow-blue-500/40 group-hover:rotate-12 transition-all duration-700">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Forge</h1>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1">© Ryz Misty</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`w-full text-left px-6 py-5 rounded-2xl flex items-center gap-5 transition-all ${view === AppView.DASHBOARD ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 font-black' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 font-bold'}`}
          >
            <LayoutDashboard className="w-6 h-6" /> Dashboard
          </button>
          
          <div className="pt-10 pb-4 px-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Development</div>
          <button 
            onClick={() => setView(AppView.WEBHOOK_MAKER)}
            className={`w-full text-left px-6 py-5 rounded-2xl flex items-center gap-5 transition-all ${view === AppView.WEBHOOK_MAKER ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 font-black' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 font-bold'}`}
          >
            <Layers className="w-6 h-6" /> Webhook Forge
          </button>
          <button 
            onClick={() => setView(AppView.WEBHOOK_CONSOLE)}
            className={`w-full text-left px-6 py-5 rounded-2xl flex items-center gap-5 transition-all ${view === AppView.WEBHOOK_CONSOLE ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 font-black' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 font-bold'}`}
          >
            <Send className="w-6 h-6" /> Command Center
          </button>

          <div className="pt-10 pb-4 px-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Core Toolkit</div>
          <button 
            onClick={() => setView(AppView.UTILITIES)}
            className={`w-full text-left px-6 py-5 rounded-2xl flex items-center gap-5 transition-all ${view === AppView.UTILITIES ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 font-black' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 font-bold'}`}
          >
            <Wrench className="w-6 h-6" /> Utilities
          </button>
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 px-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs font-black text-gray-600 uppercase tracking-[0.2em]">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" /> Engineering Elite
            </div>
            <div className="text-[10px] text-gray-700 font-black uppercase tracking-widest">© {new Date().getFullYear()} Ryz Misty Production</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#313338] relative">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-600/5 via-indigo-600/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto p-12 lg:p-20 relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
