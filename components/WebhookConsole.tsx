
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Link as LinkIcon, Sparkles, AlertCircle, Eye, Info, Layers, Trash2, Plus, Bookmark, Clock, User, Search, RefreshCw, Copy, Check } from 'lucide-react';
import { helpCraftWebhookMessage } from '../services/geminiService';
import { WebhookPayload, SavedWebhook, WebhookChatEntry } from '../types';

const WebhookConsole: React.FC = () => {
  const [savedWebhooks, setSavedWebhooks] = useState<SavedWebhook[]>([]);
  const [chatHistory, setChatHistory] = useState<WebhookChatEntry[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [inputText, setInputText] = useState('');
  const [payload, setPayload] = useState<WebhookPayload | null>(null);
  
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('df_saved_webhooks');
    const history = localStorage.getItem('df_webhook_history');
    if (saved) setSavedWebhooks(JSON.parse(saved));
    if (history) setChatHistory(JSON.parse(history));
    
    // Draft recovery
    const draft = sessionStorage.getItem('df_webhook_draft');
    if (draft) setInputText(draft);
  }, []);

  useEffect(() => {
    localStorage.setItem('df_saved_webhooks', JSON.stringify(savedWebhooks));
  }, [savedWebhooks]);

  useEffect(() => {
    localStorage.setItem('df_webhook_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleInputUpdate = (val: string) => {
    setInputText(val);
    sessionStorage.setItem('df_webhook_draft', val);
  };

  const handleSaveWebhook = () => {
    if (!currentUrl || !currentName) return;
    const newWebhook: SavedWebhook = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentName,
      url: currentUrl
    };
    setSavedWebhooks([...savedWebhooks, newWebhook]);
    setSelectedWebhookId(newWebhook.id);
    setCurrentName('');
    setCurrentUrl('');
  };

  const activeWebhook = savedWebhooks.find(w => w.id === selectedWebhookId);

  const handleSend = async () => {
    const targetUrl = activeWebhook?.url || currentUrl;
    if (!targetUrl) {
      setStatus({ type: 'error', msg: 'Destination Required. Enter or select a Webhook URL.' });
      return;
    }
    
    setSending(true);
    setStatus(null);
    try {
      const dataToSend = payload || { content: inputText, username: 'Forge User' };
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const newEntry: WebhookChatEntry = {
          id: Date.now().toString(),
          webhookId: selectedWebhookId || 'adhoc',
          webhookName: activeWebhook?.name || 'Quick Send',
          timestamp: Date.now(),
          payload: dataToSend
        };
        setChatHistory([newEntry, ...chatHistory]);
        setStatus({ type: 'success', msg: 'Payload dispatched successfully!' });
        setInputText('');
        setPayload(null);
        sessionStorage.removeItem('df_webhook_draft');
      } else {
        const err = await response.text();
        setStatus({ type: 'error', msg: `Fail: ${response.statusText}` });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Connection Failed. CORS may be restricting the request.' });
    } finally {
      setSending(false);
    }
  };

  const handleCloneHistory = (entry: WebhookChatEntry) => {
    setInputText(entry.payload.content || '');
    setPayload(entry.payload);
    setSelectedWebhookId(entry.webhookId);
    setStatus({ type: 'success', msg: 'Historical payload cloned to composer.' });
  };

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return chatHistory;
    const search = historySearch.toLowerCase();
    return chatHistory.filter(h => 
      h.payload.content?.toLowerCase().includes(search) || 
      h.webhookName.toLowerCase().includes(search) ||
      h.payload.username?.toLowerCase().includes(search)
    );
  }, [chatHistory, historySearch]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* LEFT: Endpoint Manager */}
      <div className="xl:col-span-3 space-y-6">
        <div className="discord-card p-6 border border-white/5 space-y-5">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5" /> Registry
          </h3>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {savedWebhooks.map(w => (
              <div 
                key={w.id}
                onClick={() => setSelectedWebhookId(w.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedWebhookId === w.id ? 'bg-blue-600/10 border-blue-500/40 shadow-lg' : 'bg-black/20 border-transparent hover:bg-black/40'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full ${selectedWebhookId === w.id ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{w.name}</div>
                    <div className="text-[9px] text-gray-500 truncate font-mono opacity-40">{w.url}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSavedWebhooks(savedWebhooks.filter(sw => sw.id !== w.id)); }} 
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
             <input 
              type="text" 
              placeholder="Name (e.g. #general)" 
              value={currentName}
              onChange={e => setCurrentName(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-lg p-2.5 text-xs focus:border-blue-500 transition-all outline-none"
            />
            <input 
              type="text" 
              placeholder="Webhook URL" 
              value={currentUrl}
              onChange={e => setCurrentUrl(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-lg p-2.5 text-xs focus:border-blue-500 transition-all outline-none"
            />
            <button 
              onClick={handleSaveWebhook}
              disabled={!currentUrl || !currentName}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
            >
              Add to Registry
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE: Live Broadcast System */}
      <div className="xl:col-span-9 flex flex-col gap-6 h-[calc(100vh-160px)] min-h-[650px]">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          
          {/* COMPOSER */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="discord-card p-6 border border-white/5 flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Composer
                </h3>
                {activeWebhook && (
                  <div className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 uppercase">
                    Linked: {activeWebhook.name}
                  </div>
                )}
              </div>
              
              <textarea 
                value={inputText}
                onChange={(e) => handleInputUpdate(e.target.value)}
                placeholder="What's the message? Type plain text or a scenario..."
                className="flex-1 w-full bg-black/20 border border-gray-700 rounded-xl p-5 text-sm focus:border-blue-500 focus:outline-none resize-none transition-all leading-relaxed"
              />

              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    setAiLoading(true);
                    try { const res = await helpCraftWebhookMessage(inputText); setPayload(res); } finally { setAiLoading(false); }
                  }}
                  disabled={aiLoading || !inputText.trim()}
                  className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {aiLoading ? 'Analyzing...' : <><Sparkles className="w-4 h-4" /> Smart Enhance</>}
                </button>
                <button 
                  onClick={() => { setPayload(null); handleInputUpdate(''); }}
                  className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={sending || (!inputText.trim() && !payload)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 transition-all active:scale-[0.98] text-lg"
              >
                {sending ? 'Broadcasting...' : <><Send className="w-6 h-6" /> Execute Payload</>}
              </button>
              
              {status && (
                <div className={`p-3 rounded-xl text-xs border flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-900/10 border-green-500/20 text-green-300' : 'bg-red-900/10 border-red-500/20 text-red-300'}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{status.msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* HISTORY FEED */}
          <div className="discord-card border border-white/5 flex flex-col overflow-hidden bg-[#2b2d31]/40">
            <div className="p-4 border-b border-white/5 bg-black/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                  <Clock className="w-4 h-4 text-gray-500" /> History Feed
                </h3>
                <span className="text-[10px] text-gray-600 font-mono">{filteredHistory.length} LOGS_DETECTED</span>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter history..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full bg-black/40 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {filteredHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <Layers className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold">No Records Found</p>
                </div>
              ) : (
                filteredHistory.map(entry => (
                  <div key={entry.id} className="group flex gap-4 animate-in fade-in duration-300 relative">
                    <div className="w-9 h-9 bg-gray-800 rounded-full flex-shrink-0 flex items-center justify-center border border-white/5">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                         <span className="font-bold text-white text-xs hover:underline cursor-pointer">{entry.payload.username || 'Forge User'}</span>
                         <span className="bg-[#5865f2] text-[8px] px-1 rounded font-bold text-white uppercase">App</span>
                         <span className="text-[9px] text-gray-600">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <div className="text-[13px] text-gray-400 leading-relaxed truncate">{entry.payload.content}</div>
                       <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleCloneHistory(entry)}
                            className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Clone
                          </button>
                          <button 
                            onClick={() => setChatHistory(chatHistory.filter(h => h.id !== entry.id))}
                            className="text-[9px] font-bold text-red-500/70 hover:text-red-400 flex items-center gap-1 uppercase"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookConsole;
