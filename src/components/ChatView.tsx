import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, History, MessageCircle, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatViewProps {
}

const STORAGE_KEY = 'material_pure_chat_sessions';

export function ChatView({ }: ChatViewProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
    }
    // Default initial session
    return [{
      id: Date.now().toString(),
      title: "New Habit Coach Chat",
      messages: [
        { role: 'assistant', content: "Hello! I'm your AI Habit Coach. How can I help you build better routines and achieve your goals today?" }
      ],
      updatedAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || Date.now().toString();
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: Date.now().toString(),
    title: "New Habit Coach Chat",
    messages: [{ role: 'assistant', content: "Hello! I'm your AI Habit Coach. How can I help you build better routines and achieve your goals today?" }],
    updatedAt: Date.now()
  };

  const messages = currentSession.messages;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Error saving chat sessions:", e);
    }
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showHistory]);

  const updateCurrentMessages = (newMessages: Message[]) => {
    setSessions(prev => {
      const existing = prev.find(s => s.id === activeSessionId);
      const title = newMessages.length > 1 && newMessages[1].role === 'user' 
        ? (newMessages[1].content.length > 30 ? newMessages[1].content.substring(0, 30) + '...' : newMessages[1].content)
        : existing?.title || "Habit Coach Chat";

      if (existing) {
        return prev.map(s => s.id === activeSessionId ? { ...s, messages: newMessages, title, updatedAt: Date.now() } : s);
      } else {
        return [{
          id: activeSessionId,
          title,
          messages: newMessages,
          updatedAt: Date.now()
        }, ...prev];
      }
    });
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      messages: [
        { role: 'assistant', content: "Hello! I'm your AI Habit Coach. What habit would you like to build or discuss today?" }
      ],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowHistory(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const freshId = Date.now().toString();
        return [{
          id: freshId,
          title: "New Habit Coach Chat",
          messages: [{ role: 'assistant', content: "Hello! I'm your AI Habit Coach. How can I help you build better routines and achieve your goals today?" }],
          updatedAt: Date.now()
        }];
      }
      return filtered;
    });
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    updateCurrentMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are a supportive habit-tracking coach. The user says: "${userMessage}". Provide a helpful, concise response formatted cleanly with bolding or bullet points where appropriate.` 
        }),
      });
      const data = await response.json();
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: data.text }];
      updateCurrentMessages(finalMessages);
    } catch (error) {
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: "Sorry, I'm having trouble connecting right now. Please try again shortly." }];
      updateCurrentMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
    );
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-sm" />
            <span className="flex-1 leading-relaxed">{formatBoldText(text)}</span>
          </div>
        );
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const [, num, text] = numMatch;
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5">
            <span className="font-bold text-primary shrink-0">{num}.</span>
            <span className="flex-1 leading-relaxed">{formatBoldText(text)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className={trimmed === '' ? 'h-2' : 'my-1.5 leading-relaxed'}>
          {formatBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <header className="h-nav-height px-6 flex items-center border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="w-10" />
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <h1 className="font-bold text-gray-900 tracking-tight text-base">AI Coach</h1>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 -mr-2 rounded-full hover:bg-primary/5 text-primary transition-colors relative"
          title="Chat History"
        >
          <History size={20} />
          {sessions.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      </header>

      {/* Message History Container with Smooth Independent Scrolling */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 pb-[140px]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-end gap-3 max-w-[88%] sm:max-w-[78%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 relative overflow-hidden",
                msg.role === 'user' 
                  ? "bg-gray-900 text-white" 
                  : "bg-gradient-to-tr from-primary to-primary/80 text-white shadow-primary/20"
              )}>
                {msg.role === 'user' ? (
                  <User size={18} />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    <Sparkles size={18} className="relative z-10 text-amber-200" />
                  </>
                )}
              </div>

              {/* Chat Bubble */}
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-sm shadow-primary/20" 
                  : "bg-gradient-to-br from-white via-primary/[0.02] to-white text-gray-800 rounded-tl-sm border border-primary/10 shadow-lg shadow-black/[0.02]"
              )}>
                {msg.role === 'assistant' ? renderFormattedContent(msg.content) : <p className="leading-relaxed">{msg.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Sleek Animated Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-3 max-w-[85%]"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <Sparkles size={18} className="relative z-10 text-amber-200 animate-spin" />
            </div>
            <div className="bg-gradient-to-br from-white via-primary/[0.03] to-white border border-primary/10 px-5 py-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
              <span className="text-xs text-gray-400 font-medium ml-2">Coach is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className="sticky bottom-[80px] left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-black/5 p-4 sm:p-5 z-30">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            className="w-full bg-white ring-1 ring-black/5 border-0 rounded-2xl px-6 py-4 sm:py-5 pr-16 focus:ring-2 focus:ring-primary shadow-sm transition-all text-gray-800 text-sm sm:text-base font-medium placeholder:text-gray-400"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 sm:p-3.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center hover:bg-primary/90"
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* History Slide-Over Drawer / Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Chat History</h2>
                    <p className="text-xs text-gray-400 font-medium">{sessions.length} saved conversation{sessions.length === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-4 border-b border-black/5 bg-gray-50/50">
                <button
                  onClick={handleNewChat}
                  className="w-full bg-primary text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/95 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  <span>+ New Chat</span>
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const dateStr = new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setShowHistory(false);
                      }}
                      className={cn(
                        "w-full rounded-2xl p-4 text-left border transition-all flex items-start gap-4 group cursor-pointer relative overflow-hidden",
                        isActive 
                          ? "bg-primary/[0.04] border-primary/30 shadow-sm" 
                          : "bg-white border-black/5 hover:border-black/10 hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-primary/5 text-primary group-hover:bg-primary/10"
                      )}>
                        <MessageCircle size={20} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={cn("font-bold text-sm truncate", isActive ? "text-primary" : "text-gray-900")}>
                          {session.title}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {dateStr}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-3 top-3 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


