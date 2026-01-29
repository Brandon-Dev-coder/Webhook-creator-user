
import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, Layers, Sparkles, Book, Save, Check, X, AlertCircle, Zap, Target, Info, Search } from 'lucide-react';
import { WebhookPayload, WebhookEmbed, WebhookTemplate } from '../types';
import CodeBlock from './CodeBlock';
import { suggestWebhookScenario } from '../services/geminiService';

const PRESETS: WebhookTemplate[] = [
  {
    id: 'preset-1',
    name: "Security Alert",
    purpose: "Notify server staff of potential breaches or unauthorized actions.",
    payload: {
      username: "Security Sentinel",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
      content: "⚠️ **Security Breach Detected**",
      embeds: [{
        title: "Unauthorized Access Attempt",
        description: "An IP address from a blacklisted region tried to log in.",
        color: 15548997,
        fields: [{ name: "Source IP", value: "192.168.1.104", inline: true }]
      }]
    },
    createdAt: Date.now()
  },
  {
    id: 'preset-2',
    name: "Deployment Log",
    purpose: "Track build completions and production releases for dev teams.",
    payload: {
      username: "Deployment Hub",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/3242/3242310.png",
      content: "✅ **Build Successful**",
      embeds: [{
        title: "Version 2.4.0 Live",
        description: "The latest version of the application has been deployed to production.",
        color: 5763719,
        fields: [{ name: "Environment", value: "Production", inline: true }]
      }]
    },
    createdAt: Date.now()
  }
];

const WebhookMaker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [payload, setPayload] = useState<WebhookPayload>({
    username: 'Webhook Forge',
    content: 'Payload transmission initialized.',
    embeds: []
  });
  const [customTemplates, setCustomTemplates] = useState<WebhookTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Save Template Dialog State
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savePurpose, setSavePurpose] = useState('');
  const [includeUrl, setIncludeUrl] = useState(false);

  const [templateFilter, setTemplateFilter] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('df_custom_templates_v2');
    if (saved) setCustomTemplates(JSON.parse(saved));
  }, []);

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSaveTemplate = () => {
    if (!saveName || !savePurpose) return;
    
    const newTpl: WebhookTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: saveName,
      purpose: savePurpose,
      webhookUrl: includeUrl ? url : undefined,
      payload: { ...payload },
      createdAt: Date.now()
    };
    
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    localStorage.setItem('df_custom_templates_v2', JSON.stringify(updated));
    
    setIsSaving(false);
    setSaveName('');
    setSavePurpose('');
    setIncludeUrl(false);
    showStatus('success', 'Custom Forge Template saved.');
  };

  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('df_custom_templates_v2', JSON.stringify(updated));
    showStatus('success', 'Template purged.');
  };

  const applyTemplate = (tpl: WebhookTemplate) => {
    setPayload(tpl.payload);
    if (tpl.webhookUrl) setUrl(tpl.webhookUrl);
    setActiveTab('preview');
    showStatus('success', `Applied: ${tpl.name}`);
  };

  const addEmbed = () => {
    const newEmbed: WebhookEmbed = {
      title: 'New Embed Title',
      description: 'Payload detail content goes here...',
      color: 5814783,
      fields: []
    };
    setPayload(prev => ({ ...prev, embeds: [...(prev.embeds || []), newEmbed] }));
  };

  const removeEmbed = (index: number) => {
    setPayload(prev => ({ ...prev, embeds: prev.embeds?.filter((_, i) => i !== index) }));
  };

  const updateEmbed = (index: number, updates: Partial<WebhookEmbed>) => {
    setPayload(prev => {
      const newEmbeds = [...(prev.embeds || [])];
      newEmbeds[index] = { ...newEmbeds[index], ...updates };
      return { ...prev, embeds: newEmbeds };
    });
  };

  const handleMagicFill = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const suggested = await suggestWebhookScenario(aiPrompt);
      setPayload(suggested);
      setAiPrompt('');
      setActiveTab('preview');
      showStatus('success', 'AI generation complete.');
    } catch (e) {
      showStatus('error', 'AI failed to generate payload.');
    } finally {
      setAiLoading(false);
    }
  };

  const sendWebhook = async () => {
    if (!url) {
      showStatus('error', 'Target URL is missing.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showStatus('success', 'Uplink successful.');
      } else {
        showStatus('error', `Server error ${response.status}.`);
      }
    } catch (e) {
      showStatus('error', 'Network failure or CORS restriction.');
    } finally {
      setSending(false);
    }
  };

  const filteredCustom = customTemplates.filter(t => 
    t.name.toLowerCase().includes(templateFilter.toLowerCase()) || 
    t.purpose.toLowerCase().includes(templateFilter.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Save Modal */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="discord-card w-full max-w-md p-8 border border-white/10 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Save className="text-blue-500" /> Save Template
              </h3>
              <button onClick={() => setIsSaving(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Template Identity</label>
                <input 
                  type="text" 
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="e.g. Weekly Report"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Defined Purpose / Use Case</label>
                <textarea 
                  rows={2}
                  value={savePurpose}
                  onChange={e => setSavePurpose(e.target.value)}
                  placeholder="What is this template specifically for?"
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none resize-none transition-all"
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-black/20 rounded-xl cursor-pointer hover:bg-black/30 transition-all border border-transparent hover:border-white/5">
                <input 
                  type="checkbox" 
                  checked={includeUrl}
                  onChange={e => setIncludeUrl(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/40 border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div>
                  <div className="text-xs font-bold text-gray-300">Link Webhook URL</div>
                  <div className="text-[10px] text-gray-600">Save the current destination URL with this template.</div>
                </div>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsSaving(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all">Cancel</button>
              <button 
                onClick={handleSaveTemplate}
                disabled={!saveName || !savePurpose}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all"
              >
                Create Forge Template
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-3 text-white">
            <Layers className="text-blue-500 w-10 h-10" /> Webhook Forge
          </h2>
          <p className="text-gray-500 mt-1 font-medium">© Ryz Misty — The Professional Standard for Payload Engineering.</p>
        </div>
        <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1.5 shadow-2xl">
          {(['edit', 'preview', 'json'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-[0.2em] ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          
          {/* Enhanced Template Library */}
          <div className="discord-card p-8 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Book className="w-4 h-4 text-blue-500" /> Professional Library
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-600" />
                <input 
                  type="text"
                  placeholder="Filter templates..."
                  value={templateFilter}
                  onChange={e => setTemplateFilter(e.target.value)}
                  className="bg-black/30 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-[10px] focus:border-blue-500 outline-none transition-all w-48"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Presets */}
              {PRESETS.map(p => (
                <div 
                  key={p.id}
                  onClick={() => applyTemplate(p)}
                  className="p-4 bg-black/20 border border-gray-800 hover:border-yellow-500/30 rounded-2xl cursor-pointer group transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" /> {p.name}
                    </span>
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">Preset</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{p.purpose}</p>
                </div>
              ))}
              {/* Custom Templates */}
              {filteredCustom.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="p-4 bg-blue-900/5 border border-blue-500/10 hover:border-blue-500/40 rounded-2xl cursor-pointer group transition-all flex flex-col gap-2 relative"
                >
                  <button 
                    onClick={(e) => deleteTemplate(tpl.id, e)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      <Save className="w-3.5 h-3.5 text-blue-500" /> {tpl.name}
                    </span>
                    {tpl.webhookUrl && <Target className="w-3 h-3 text-green-500" title="Has linked URL" />}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{tpl.purpose}</p>
                </div>
              ))}
              {filteredCustom.length === 0 && customTemplates.length > 0 && (
                <div className="col-span-full py-8 text-center text-xs text-gray-700 font-bold italic">No results found for "{templateFilter}"</div>
              )}
              {customTemplates.length === 0 && (
                <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl opacity-20">
                   <Book className="w-10 h-10 mb-2" />
                   <p className="text-xs font-black">Private Vault Empty</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Composer */}
          <div className="bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Cognitive Intelligence Forge</h3>
                  <p className="text-[10px] text-gray-500 font-bold">Describe your use case and Ryz Misty AI will architect the payload.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Detailed server maintenance notification for the dev-ops channel..."
                  className="flex-1 bg-black/40 border border-gray-700 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                />
                <button 
                  onClick={handleMagicFill}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  {aiLoading ? 'Thinking...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="discord-card p-8 border border-white/5 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Core Parameters
              </h3>
              <button 
                onClick={() => setIsSaving(true)}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-[10px] font-black text-blue-400 rounded-xl flex items-center gap-2 transition-all border border-blue-500/20 uppercase tracking-widest"
              >
                <Save className="w-3.5 h-3.5" /> Save as Template
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-1 tracking-widest">Destination Uplink (Webhook URL)</label>
                <div className="relative group">
                  <Target className="absolute left-4 top-3.5 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all font-mono text-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-1 tracking-widest">Display Identity</label>
                  <input 
                    type="text" 
                    value={payload.username} 
                    onChange={(e) => setPayload(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl p-3.5 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-1 tracking-widest">Avatar Manifest URL</label>
                  <input 
                    type="text" 
                    value={payload.avatar_url} 
                    onChange={(e) => setPayload(p => ({ ...p, avatar_url: e.target.value }))}
                    className="w-full bg-black/30 border border-gray-800 rounded-2xl p-3.5 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-1 tracking-widest">Raw Message Stream</label>
                <textarea 
                  rows={4}
                  value={payload.content} 
                  onChange={(e) => setPayload(p => ({ ...p, content: e.target.value }))}
                  className="w-full bg-black/30 border border-gray-800 rounded-2xl p-5 text-sm resize-none outline-none focus:border-blue-500 transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={addEmbed} 
            className="w-full py-4 bg-gray-800/50 hover:bg-gray-800 text-xs font-black text-gray-500 rounded-2xl flex items-center justify-center gap-2 border border-white/5 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Rich Embed Component
          </button>

          <div className="space-y-6">
            {payload.embeds?.map((embed, idx) => (
              <div key={idx} className="discord-card p-8 border border-white/5 relative animate-in slide-in-from-left-4 duration-300 shadow-xl">
                <button onClick={() => removeEmbed(idx)} className="absolute top-6 right-6 text-red-500/30 hover:text-red-500 p-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Embed Header</label>
                    <input type="text" value={embed.title} onChange={(e) => updateEmbed(idx, { title: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-sm focus:border-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Accent Decimal Color</label>
                    <input type="number" value={embed.color} onChange={(e) => updateEmbed(idx, { color: parseInt(e.target.value) || 0 })} className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-sm focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Detailed Content Description</label>
                    <textarea rows={3} value={embed.description} onChange={(e) => updateEmbed(idx, { description: e.target.value })} className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-sm resize-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10">
            <button 
              onClick={sendWebhook}
              disabled={sending}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl flex items-center justify-center gap-4 shadow-3xl shadow-blue-500/30 transition-all active:scale-[0.98] text-xl uppercase tracking-[0.2em] border-t border-white/20"
            >
              {sending ? 'Uplinking Payload...' : <><Send className="w-7 h-7" /> Execute Broadcast</>}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 sticky top-10 h-fit space-y-8">
          <div className="bg-[#1e1f22] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <div className="p-5 bg-black/40 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[11px] font-black text-gray-500 tracking-[0.4em] uppercase">Visualizer_Stream</span>
              </div>
            </div>
            
            <div className="p-10 space-y-6 bg-[#313338] min-h-[500px] overflow-y-auto">
              {activeTab === 'json' ? (
                <div className="animate-in fade-in duration-300">
                  <CodeBlock code={JSON.stringify(payload, null, 2)} language="json" />
                </div>
              ) : (
                <div className="flex gap-5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-14 h-14 bg-gray-700 rounded-full flex-shrink-0 overflow-hidden border border-white/5 shadow-inner">
                    {payload.avatar_url ? <img src={payload.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><Layers className="w-8 h-8" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-base">{payload.username || 'Webhook Identity'}</span>
                      <span className="bg-[#5865f2] text-[10px] px-1.5 rounded-md font-bold text-white uppercase tracking-wider">App</span>
                      <span className="text-[11px] text-gray-500 font-medium">Today at {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed mb-4">{payload.content || <span className="opacity-20 italic font-medium">Waiting for message stream...</span>}</div>
                    
                    <div className="space-y-3">
                      {payload.embeds?.map((embed, idx) => (
                        <div key={idx} className="flex max-w-lg animate-in fade-in duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="w-1 rounded-l-md" style={{ backgroundColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#1e1f22' }}></div>
                          <div className="flex-1 bg-[#2b2d31] p-5 rounded-r-md border border-white/5 border-l-0 shadow-lg">
                            {embed.title && <div className="text-white font-bold text-[15px] mb-2">{embed.title}</div>}
                            {embed.description && <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{embed.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {status && (
            <div className={`p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right-8 duration-300 shadow-2xl ${status.type === 'success' ? 'bg-green-900/10 border-green-500/30 text-green-400' : 'bg-red-900/10 border-red-500/30 text-red-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {status.type === 'success' ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-sm font-black uppercase tracking-[0.2em]">{status.type === 'success' ? 'Transmission Success' : 'Operation Failed'}</span>
                <p className="text-xs opacity-60 font-medium">{status.msg}</p>
              </div>
            </div>
          )}

          <div className="discord-card p-8 border border-white/5 space-y-4 text-center">
             <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Protocol Architecture</div>
             <p className="text-xs text-gray-500 leading-relaxed font-medium">
               This interface utilizes direct point-to-point Discord API integration. Ryz Misty Forge does not store payload data on external servers. All saved templates are persisted locally to your client browser environment.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookMaker;
