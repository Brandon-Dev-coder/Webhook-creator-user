
import React, { useState } from 'react';
import { Bot, Plus, Trash2, Cpu, Zap, Code, Terminal, ShieldAlert, ShieldCheck, BookOpen, AlertTriangle } from 'lucide-react';
import { BotCommand } from '../types';
import { generateBotCode, helpRefineCommand, getSecurityInsights } from '../services/geminiService';
import CodeBlock from './CodeBlock';

const BotMaker: React.FC = () => {
  const [botName, setBotName] = useState('SentinelOne');
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [userInput, setUserInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [antiNukeEnabled, setAntiNukeEnabled] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [securityTab, setSecurityTab] = useState<'build' | 'intelligence'>('build');
  const [intelligenceContent, setIntelligenceContent] = useState<string | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const fetchIntelligence = async (topic: string) => {
    setIntelLoading(true);
    try {
      const insight = await getSecurityInsights(topic);
      setIntelligenceContent(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setIntelLoading(false);
    }
  };

  const addRefinedCommand = async () => {
    if (!userInput.trim()) return;
    setIsRefining(true);
    try {
      const refined = await helpRefineCommand(userInput);
      const newCommand: BotCommand = {
        id: Math.random().toString(36).substr(2, 9),
        name: refined.name,
        description: refined.description,
        response: refined.response,
        type: 'text'
      };
      setCommands([...commands, newCommand]);
      setUserInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const code = await generateBotCode(commands, botName, antiNukeEnabled);
      setGeneratedCode(code);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="text-purple-400" /> Discord Bot Forge
          </h2>
          <p className="text-sm text-gray-500">Design powerful systems with built-in community protections.</p>
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setSecurityTab('build')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${securityTab === 'build' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Cpu className="w-3 h-3 inline mr-2" /> Builder
          </button>
          <button 
            onClick={() => setSecurityTab('intelligence')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${securityTab === 'intelligence' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <BookOpen className="w-3 h-3 inline mr-2" /> Security Intelligence
          </button>
        </div>
      </div>

      {securityTab === 'build' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${antiNukeEnabled ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-gray-800 border-gray-700'}`}
                 onClick={() => setAntiNukeEnabled(!antiNukeEnabled)}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-bold uppercase flex items-center gap-2 ${antiNukeEnabled ? 'text-red-400' : 'text-gray-400'}`}>
                  <ShieldAlert className="w-4 h-4" /> Anti-Nuke Defense
                </h3>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${antiNukeEnabled ? 'bg-red-500' : 'bg-gray-600'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${antiNukeEnabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic leading-relaxed">
                {antiNukeEnabled 
                  ? "Elite Defense Active: Monitoring for mass bans, channel nuking, and rogue admin activity." 
                  : "Standard Bot: Protection disabled. Enable to bake security logic into your generated engine."}
              </p>
            </div>

            <div className="discord-card p-6 border border-white/5">
              <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Command Logic
              </h3>
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe a feature (e.g., a ticket system or security alert)..."
                className="w-full bg-black/30 border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-purple-500 h-24 resize-none mb-3"
              />
              <button 
                onClick={addRefinedCommand}
                disabled={isRefining || !userInput.trim()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-sm font-bold transition-all"
              >
                {isRefining ? 'Synthesizing...' : 'Add logic'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest">Active Modules</h3>
              {commands.map((cmd) => (
                <div key={cmd.id} className="discord-card p-4 border border-white/5 group relative hover:border-purple-500/30">
                  <button onClick={() => setCommands(commands.filter(c => c.id !== cmd.id))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="text-purple-300 font-mono text-xs mb-1">/{cmd.name}</div>
                  <div className="text-[10px] text-gray-500">{cmd.description}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleGenerateCode}
              disabled={generating || (commands.length === 0 && !antiNukeEnabled)}
              className="w-full py-4 discord-blurple discord-blurple-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {generating ? 'Manifesting Logic...' : 'Generate Secure Bot Engine'}
            </button>
          </div>

          <div className="lg:col-span-2">
            {generatedCode ? (
              <div className="animate-in fade-in duration-700">
                <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Defensive Boilerplate Generated
                </div>
                <CodeBlock code={generatedCode} language="javascript" />
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-black/10 border border-white/5 rounded-xl border-dashed">
                <Cpu className="w-12 h-12 text-gray-700 mb-4 animate-pulse" />
                <h3 className="text-gray-500 font-bold">Awaiting Instructions</h3>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'nuking', name: 'Server Nuking defense', icon: <AlertTriangle className="text-red-400" /> },
              { id: 'mass-ban', name: 'Mass Ban Detection', icon: <ShieldAlert className="text-orange-400" /> },
              { id: 'token-theft', name: 'Token Security', icon: <Code className="text-blue-400" /> }
            ].map(topic => (
              <button 
                key={topic.id}
                onClick={() => fetchIntelligence(topic.name)}
                className="discord-card p-6 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col items-center gap-3 text-center"
              >
                <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">{topic.icon}</div>
                <span className="text-sm font-bold text-gray-300">{topic.name}</span>
              </button>
            ))}
          </div>

          <div className="discord-card min-h-[300px] border border-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BookOpen className="w-32 h-32" />
            </div>
            {intelLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-500 font-mono">Analyzing defensive patterns...</p>
              </div>
            ) : intelligenceContent ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-xs font-bold text-purple-400 uppercase mb-4 tracking-widest">Defensive Analysis Report</div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {intelligenceContent}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShieldCheck className="w-12 h-12 text-gray-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Knowledge is the Best Defense</h3>
                <p className="text-sm text-gray-600 max-w-md mt-2">Select a security topic above to learn how "nuke" attacks work and how to write code that makes your bot a shield for your community.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BotMaker;
