import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Loader2, History, Lock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistoryItem {
  id: string;
  lastMessage: string;
  timestamp: string;
}

interface ChatViewProps {
  onOpenSubscription: () => void;
  isPremium?: boolean;
}

export function ChatView({ onOpenSubscription, isPremium = false }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Material Pure guide. How can I help you build better habits today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock history
  const history: ChatHistoryItem[] = [
    { id: '1', lastMessage: "How can I improve my focus?", timestamp: "2 days ago" },
    { id: '2', lastMessage: "Consistency tips for morning habits", timestamp: "5 days ago" },
    { id: '3', lastMessage: "Breaking bad habits effectively", timestamp: "1 week ago" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isPremium) {
      onOpenSubscription();
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are a supportive habit-tracking coach. The user says: "${userMessage}". Provide a helpful, concise response based on habit-building science.` 
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
        <header className="h-nav-height px-6 flex items-center border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={() => setShowHistory(false)}
            className="p-2 -ml-2 rounded-full hover:bg-primary/5 text-primary"
          >
            <History className="rotate-180" size={20} />
          </button>
          <h1 className="flex-1 text-center font-bold text-primary tracking-tight">Chat History</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-[120px]">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!isPremium) onOpenSubscription();
              }}
              className="w-full bg-white rounded-2xl p-4 text-left border border-black/5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 relative overflow-hidden group"
            >
              {!isPremium && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-white/80 p-2 rounded-full shadow-lg border border-primary/20">
                    <Lock size={16} className="text-primary" />
                  </div>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <MessageCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate text-sm">{item.lastMessage}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.timestamp}</p>
              </div>
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="h-nav-height px-6 flex items-center border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="w-10" />
        <h1 className="flex-1 text-center font-bold text-primary tracking-tight">AI Coach</h1>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 -mr-2 rounded-full hover:bg-primary/5 text-primary"
        >
          <History size={20} />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-[180px]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-end gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5",
                msg.role === 'user' ? "bg-primary text-white" : "bg-white text-primary"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm border border-black/5",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-br-none" 
                  : "bg-white text-gray-800 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-black/5 flex items-center justify-center text-primary">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-black/5 p-4 rounded-2xl rounded-bl-none text-sm italic text-gray-400">
              Analyzing patterns...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-background/80 backdrop-blur-md border-t border-black/5 absolute bottom-[72px] left-0 right-0 z-20">
        <div className="relative flex items-center group">
          <input
            className="w-full bg-white ring-1 ring-black/5 border-0 rounded-2xl px-6 py-5 pr-16 focus:ring-2 focus:ring-primary shadow-sm transition-all text-gray-800"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-90 flex items-center justify-center"
          >
            {isPremium ? <Send size={20} /> : <Lock size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
