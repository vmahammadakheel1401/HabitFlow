import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, History, MessageCircle } from 'lucide-react';
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
}

export function ChatView({ }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Habit Coach. How can I help you build better routines and achieve your goals today?" }
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
  }, [messages, isLoading, showHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again shortly." }]);
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

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
        <header className="h-nav-height px-6 flex items-center border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={() => setShowHistory(false)}
            className="p-2 -ml-2 rounded-full hover:bg-primary/5 text-primary transition-colors"
          >
            <History className="rotate-180" size={20} />
          </button>
          <h1 className="flex-1 text-center font-bold text-gray-900 tracking-tight text-base">Chat History</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-[120px]">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setShowHistory(false)}
              className="w-full bg-white rounded-2xl p-4 text-left border border-black/5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
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
          className="p-2 -mr-2 rounded-full hover:bg-primary/5 text-primary transition-colors"
          title="Chat History"
        >
          <History size={20} />
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
    </div>
  );
}

