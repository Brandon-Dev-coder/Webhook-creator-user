
import React, { useState } from 'react';
import { Wrench, Shield, Layout, Sparkles, Copy, Check, Hash, Clock, Palette, Eye, Calendar } from 'lucide-react';
import { generateServerBlueprint } from '../services/geminiService';

const PERMISSIONS = [
  { name: 'Administrator', bit: 0x8 },
  { name: 'Manage Channels', bit: 0x10 },
  { name: 'Manage Roles', bit: 0x10000000 },
  { name: 'Manage Webhooks', bit: 0x20000000 },
  { name: 'Kick Members', bit: 0x2 },
  { name: 'Ban Members', bit: 0x4 },
  { name: 'Create Invites', bit: 0x1 },
  { name: 'Send Messages', bit: 0x800 },
  { name: 'Embed Links', bit: 0x4000 },
  { name: 'Attach Files', bit: 0x8000 },
  { name: 'Manage Messages', bit: 0x2000 },
];

const TIMESTAMP_STYLES = [
  { name: 'Short Time', suffix: 't', example: '16:20' },
  { name: 'Long Time', suffix: 'T', example: '16:20:30' },
  { name: 'Short Date', suffix: 'd', example: '20/04/2024' },
  { name: 'Long Date', suffix: 'D', example: '20 April 2024' },
  { name: 'Short Date/Time', suffix: 'f', example: '20 April 2024 16:20' },
  { name: 'Long Date/Time', suffix: 'F', example: 'Saturday, 20 April 2024 16:20' },
  { name: 'Relative Time', suffix: 'R', example: 'in 2 months' },
];

const Utilities: React.FC = () => {
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [blueprintTheme, setBlueprintTheme] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Timestamp Generator State
  const [tsDate, setTsDate] = useState(new Date().toISOString().slice(0, 16));
  const [tsStyle, setTsStyle] = useState('R');

  // Color Studio State
  const [roleColor, setRoleColor] = useState('#5865F2');

  const totalBits = selectedPerms.reduce((acc, bit) => acc + bit, 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleGenerateBlueprint = async () => {
    if (!blueprintTheme.trim()) return;
    setLoading(true);
    try {
      const result = await generateServerBlueprint(blueprintTheme);
      setBlueprint(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const timestampString = `<t:${Math.floor(new Date(tsDate).getTime() / 1000)}:${tsStyle}>`;

  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-20">
      <div className="max-w-4xl">
        <h2 className="text-4xl font-black flex items-center gap-4 text-white">
          <Wrench className="w-10 h-10 text-blue-400" /> Pro Utilities
        </h2>
        <p className="text-gray-500 mt-2 text-lg">Specialized tools to architect your Discord ecosystem with surgical precision.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* PERM CALCULATOR */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Permission Bitwise Calculator</h3>
          </div>
          <div className="discord-card p-8 border border-white/5 space-y-6 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PERMISSIONS.map(p => (
                <button
                  key={p.bit}
                  onClick={() => setSelectedPerms(prev => prev.includes(p.bit) ? prev.filter(b => b !== p.bit) : [...prev, p.bit])}
                  className={`text-[10px] text-left font-bold px-3 py-2 rounded-lg border transition-all ${selectedPerms.includes(p.bit) ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-black/20 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Generated Bitwise Integer</div>
                <div className="text-4xl font-black font-mono text-purple-400">{totalBits}</div>
              </div>
              <button 
                onClick={() => copyToClipboard(totalBits.toString(), 'perm')}
                className={`p-4 rounded-xl transition-all ${copiedText === 'perm' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {copiedText === 'perm' ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* TIMESTAMP GENERATOR */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Timestamp Architect</h3>
          </div>
          <div className="discord-card p-8 border border-white/5 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Target Date & Time</label>
                <input 
                  type="datetime-local"
                  value={tsDate}
                  onChange={e => setTsDate(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-green-500 transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Display Style</label>
                <select 
                  value={tsStyle}
                  onChange={e => setTsStyle(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  {TIMESTAMP_STYLES.map(s => (
                    <option key={s.suffix} value={s.suffix}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Dynamic String</span>
              <code className="text-lg font-bold text-green-400">{timestampString}</code>
              <button 
                onClick={() => copyToClipboard(timestampString, 'ts')}
                className="mt-2 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                {copiedText === 'ts' ? 'COPIED TO CLIPBOARD' : 'CLICK TO COPY STRING'}
              </button>
            </div>
          </div>
        </div>

        {/* ROLE COLOR STUDIO */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Role Color Studio</h3>
          </div>
          <div className="discord-card p-8 border border-white/5 space-y-8 shadow-2xl">
            <div className="flex items-center gap-8">
               <input 
                 type="color"
                 value={roleColor}
                 onChange={e => setRoleColor(e.target.value)}
                 className="w-20 h-20 bg-transparent border-none cursor-pointer p-0"
               />
               <div className="flex-1 space-y-2">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hex Value</div>
                 <div className="text-2xl font-black text-white">{roleColor.toUpperCase()}</div>
                 <div className="text-[10px] text-gray-600 font-mono">INT: {parseInt(roleColor.replace('#', ''), 16)}</div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-[#313338] rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 font-bold uppercase mb-4">Dark Theme Preview</span>
                  <span className="text-lg font-bold" style={{ color: roleColor }}>@Username</span>
               </div>
               <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 font-bold uppercase mb-4">Light Theme Preview</span>
                  <span className="text-lg font-bold" style={{ color: roleColor }}>@Username</span>
               </div>
            </div>
          </div>
        </div>

        {/* BLUEPRINT ENGINE */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Layout className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Server Blueprint Engine</h3>
          </div>
          <div className="discord-card p-8 border border-white/5 space-y-6 shadow-2xl">
            <div className="flex gap-2">
              <input 
                type="text"
                value={blueprintTheme}
                onChange={e => setBlueprintTheme(e.target.value)}
                placeholder="Ex: Cyberpunk Roleplay Server..."
                className="flex-1 bg-black/40 border border-gray-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all"
              />
              <button 
                onClick={handleGenerateBlueprint}
                disabled={loading || !blueprintTheme.trim()}
                className="px-6 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? 'Thinking...' : <Sparkles className="w-5 h-5" />}
              </button>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 min-h-[250px] border border-white/5 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
              {blueprint ? (
                blueprint.categories.map((cat: any, i: number) => (
                  <div key={i} className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{cat.name}</div>
                    {cat.channels.map((chan: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:bg-white/5 rounded cursor-pointer group transition-all">
                        <Hash className="w-3.5 h-3.5 text-gray-700 group-hover:text-blue-400" />
                        {chan}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20">
                  <Layout className="w-12 h-12 mb-3" />
                  <p className="text-sm font-bold">No Blueprint Generated</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Utilities;
