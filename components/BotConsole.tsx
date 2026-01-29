
import React, { useState, useEffect } from 'react';
import { Send, Terminal, Key, Hash, Sparkles, AlertCircle, Info, ShieldCheck, Activity, Radio, EyeOff, Eye } from 'lucide-react';
import { helpCraftBotMessage } from '../services/geminiService';
import { BotPresence, BotStatus, BotActivity } from '../types';
import CodeBlock from './CodeBlock';

const BotConsole: React.FC = () => {
  const [token, setToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('Professional');
  const [showToken, setShowToken] = useState(false);
  
  // Presence State
  const [presence, setPresence] = useState<BotPresence>({
    status: 'online',
    activityName: 'Discord Forge',
    activityType: 'PLAYING'
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning', msg: string } | null>(null);
  const [embed, setEmbed] = useState<any>(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('df_bot_token');
    const savedChan = sessionStorage.getItem('df_bot_chan');
    if (savedToken) setToken(savedToken);
    if (savedChan) setChannelId(savedChan);
  }, []);

  const handleTokenChange = (val: string) => {
    setToken(val);
    sessionStorage.setItem('df_bot_token', val);
  };

  const handleChanChange = (val: string) => {
    setChannelId(val);
    sessionStorage.setItem('df_bot_chan', val);
  };

  const handleAiCraft = async () => {
    if (!message.trim()) return;
    setAiLoading(true);
    try {
      const crafted = await helpCraftBotMessage(message, tone);
      setMessage(crafted.content);
      if (crafted.embed) setEmbed(crafted.embed);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !channelId) {
      setStatus({ type: 'error', msg: 'Authentication missing. Bot Token and Channel ID are required.' });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const body: any = { content: message };
      if (embed) body.embeds = [embed];

      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Message successfully reached the gateway!' });
        setMessage('');
        setEmbed(null);
      } else {
        const errData = await response.json();
        setStatus({ type: 'error', msg: `Discord API: ${errData.message || response.statusText}` });
      }
    } catch (e) {
      setStatus({ 
        type: 'warning', 
        msg: 'CORS Security: Browsers cannot send bot tokens via REST. Copy the curl command below to your terminal.' 
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (s: BotStatus) => {
    switch(s) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="text-green-400" /> Bot Remote Console
          </h2>
          <p className="text-sm text-gray-500">Interact with your bot's gateway and presence in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="discord-card p-6 border border-white/5 space-y-5">
            <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
              <Key className="w-4 h-4" /> Gateway Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Secure Bot Token</label>
                <div className="relative group">
                  <input 
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    placeholder="MTAyN..."
                    className="w-full bg-black/40 border border-gray-700 rounded p-2 text-xs focus:border-green-500 focus:outline-none transition-all pr-10"
                  />
                  <button 
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Channel ID</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={channelId}
                    onChange={(e) => handleChanChange(e.target.value)}
                    placeholder="1234567890..."
                    className="w-full bg-black/40 border border-gray-700 rounded p-2 text-xs focus:border-green-500 focus:outline-none transition-all"
                  />
                  <Hash className="absolute right-3 top-2.5 w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="discord-card p-6 border border-white/5 space-y-5">
            <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
              <Activity className="w-4 h-4" /> Presence Simulator
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(['online', 'idle', 'dnd', 'invisible'] as BotStatus[]).map(s => (
                  <button 
                    key={s}
                    onClick={() => setPresence({...presence, status: s})}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${presence.status === s ? 'bg-gray-700 text-white border-white/20' : 'bg-black/20 text-gray-500 border-transparent hover:bg-black/40'}`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(s)}`}></span>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select 
                  value={presence.activityType}
                  onChange={(e) => setPresence({...presence, activityType: e.target.value as BotActivity})}
                  className="bg-black/40 border border-gray-800 rounded px-2 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option value="PLAYING">Playing</option>
                  <option value="STREAMING">Streaming</option>
                  <option value="LISTENING">Listening</option>
                  <option value="WATCHING">Watching</option>
                </select>
                <input 
                  type="text"
                  value={presence.activityName}
                  onChange={(e) => setPresence({...presence, activityName: e.target.value})}
                  className="flex-1 bg-black/40 border border-gray-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Activity Text..."
                />
              </div>
            </div>
          </div>

          <div className="discord-card p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                <Sparkles className="w-4 h-4 text-blue-400" /> Dispatcher
              </h3>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="bg-gray-800 text-[10px] border border-gray-700 rounded px-2 py-1 text-gray-300"
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Aggressive</option>
              </select>
            </div>
            <textarea 
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What should the bot say? Use AI for personality..."
              className="w-full bg-black/20 border border-gray-700 rounded p-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleAiCraft}
                disabled={aiLoading || !message.trim()}
                className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {aiLoading ? 'Thinking...' : <><Sparkles className="w-3 h-3" /> AI Enhance</>}
              </button>
            </div>
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={sending || (!message.trim() && !embed)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/10 transition-all active:scale-[0.98]"
          >
            {sending ? 'Broadcasting...' : <><Radio className="w-5 h-5" /> Execute Live Uplink</>}
          </button>
        </div>

        {/* RIGHT: Preview Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1e1f22] rounded-xl overflow-hidden shadow-2xl border border-white/5 flex flex-col h-[500px]">
            <div className="p-3 bg-black/40 text-[10px] text-gray-500 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-green-400" />
                <span className="font-mono text-gray-400 tracking-tighter uppercase">Stream :: Active_Relay_{channelId.substring(0,8) || 'NONE'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[9px] font-bold text-green-500">REALTIME_SIMULATOR</span>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {/* Bot Presence Preview */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center gap-4 transition-all hover:border-white/10">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    AI
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-[#2b2d31] ${getStatusColor(presence.status)}`}></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Application Bot <span className="text-[10px] text-gray-500 font-normal">#0001</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <span className="font-bold text-[10px] uppercase text-gray-500">{presence.activityType.toLowerCase()}</span>
                    <span className="text-white font-medium">{presence.activityName}</span>
                  </div>
                </div>
              </div>

              {/* Message Entry */}
              <div className="flex gap-4 group animate-in fade-in zoom-in-95 duration-300">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg border border-white/5 group-hover:border-blue-500/20 transition-all">
                  <div className="w-6 h-6 bg-blue-500 rounded-sm opacity-20"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">Application Bot</span>
                    <span className="bg-[#5865f2] text-[9px] px-1 rounded font-bold text-white uppercase">App</span>
                    <span className="text-[10px] text-gray-500 opacity-60">Just now</span>
                  </div>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {message || <span className="text-gray-600 italic">Enter a payload to see it in the gateway...</span>}
                  </div>
                  
                  {embed && (
                    <div className="mt-2 flex max-w-md animate-in slide-in-from-left-2 duration-300">
                      <div className="w-1 rounded-l" style={{ backgroundColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865f2' }}></div>
                      <div className="flex-1 bg-[#2b2d31] p-3 rounded-r border border-white/5 border-l-0">
                        {embed.title && <div className="text-white font-bold text-sm mb-1">{embed.title}</div>}
                        {embed.description && <div className="text-xs text-gray-400 leading-relaxed">{embed.description}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {status && (
              <div className={`m-4 p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300 ${status.type === 'success' ? 'bg-green-900/10 border-green-500/20 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-red-900/10 border-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]'}`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-0.5 tracking-wide">{status.type.toUpperCase()}</p>
                  <p className="opacity-80">{status.msg}</p>
                </div>
              </div>
            )}
          </div>

          <div className="discord-card p-6 border border-white/5">
             <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
               <Info className="w-4 h-4 text-blue-400" /> Technical Payload (cURL)
             </h4>
             <div className="bg-black/40 p-4 rounded-xl font-mono text-[11px] text-green-400/80 border border-white/5 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500/20"></div>
                <div className="break-all leading-loose">
                  curl -X POST "https://discord.com/api/v10/channels/{channelId || 'CHANNEL_ID'}/messages" \<br/>
                  -H "Authorization: Bot {token ? '********' : 'YOUR_TOKEN'}" \<br/>
                  -H "Content-Type: application/json" \<br/>
                  -d '{JSON.stringify({ content: message || 'Hello World' })}'
                </div>
             </div>
             <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
               <ShieldCheck className="w-3 h-3 inline mr-1 text-blue-500" />
               Discord Forge automatically obfuscates tokens in code views to prevent accidental exposure during screencasts.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotConsole;
