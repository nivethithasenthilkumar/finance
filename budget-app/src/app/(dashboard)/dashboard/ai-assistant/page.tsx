"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, Mic, Plus, Keyboard, Settings2, ChevronRight,
  TrendingDown, Bell, PiggyBank, FileText, Edit3,
} from "lucide-react";
import { useAppStore } from "@/lib/app-store";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
  card?: "food";
}

const INITIAL: Message[] = [
  {
    id: 1, role: "ai",
    text: "Hi Sarah! 👋\nI'm your AI financial assistant. How can I help you today?",
    time: "10:28 AM",
  },
  {
    id: 2, role: "user",
    text: "How much did I spend on food this month?",
    time: "10:30 AM",
  },
  {
    id: 3, role: "ai",
    text: "You spent **$593.60** on food this month. That's **8%** higher than last month.",
    time: "10:30 AM",
    card: "food",
  },
];

const CHIPS = [
  { label: "Spending This Month", prompt: "Summarize my spending this month vs last month, highlight my top category and any overspending." },
  { label: "Investment Advice", prompt: "Give me a general overview of my portfolio allocation and diversification — no buy/sell recommendations." },
  { label: "Budget Optimization", prompt: "Which budget categories am I exceeding or underusing, and what should I adjust?" },
];

const POPULAR = [
  { label: "Save More Money", prompt: "Look at my subscriptions and discretionary spending and suggest a realistic monthly savings target." },
  { label: "Upcoming Bills", prompt: "List my upcoming bills, due dates, and any risk to my cash flow." },
  { label: "Predictions", prompt: "What's my forecasted spending, savings, and balance for next month?" }
];

const HISTORY = {
  Today: [
    { icon: "💳", title: "Spending this month", time: "10:30 AM", active: true },
    { icon: "📈", title: "Investment advice",   time: "Yesterday" },
    { icon: "📄", title: "Budget optimisation", time: "Yesterday" },
  ],
  "Previous 7 Days": [
    { icon: "💰", title: "Save more money",       time: "2 days ago" },
    { icon: "📅", title: "Upcoming bills",        time: "3 days ago" },
    { icon: "❤️", title: "Financial health check",time: "5 days ago" },
  ],
};

function WaveBars({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`flex gap-[3px] items-center ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          className="w-[3px] bg-[#006d67] rounded-full"
          animate={{ height: ["4px", "16px", "4px"] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FoodCard() {
  return (
    <div className="bg-white border border-[#bec9c7]/30 rounded-2xl p-5 shadow-sm mt-3 max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#006d67]/5 text-[#006d67] rounded-xl flex items-center justify-center text-xl">🍽️</div>
          <div>
            <p className="text-[10px] text-[#6e7978] uppercase font-bold tracking-tight">Food Expenses</p>
            <p className="text-[20px] font-bold text-[#1c1b1b]">$593.60</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#ba1a1a] font-semibold text-[12px]">
            <TrendingDown className="w-3.5 h-3.5" /> 8%
          </div>
          <p className="text-[10px] text-[#6e7978]">vs last month</p>
        </div>
      </div>
      <div className="h-20 flex items-end justify-between gap-1">
        {[40, 60, 55, 75, 65, 90].map((h, i) => (
          <div key={i} className={`flex-1 rounded-t-sm relative ${i === 5 ? "bg-[#006d67]/30" : "bg-[#006d67]/15"}`}
            style={{ height: `${h}%` }}>
            {i === 5 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#006d67] rounded-full border-2 border-white" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderText(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

export default function AIAssistantPage() {
  const { aiChats, addAiChat } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [listening, setListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [voiceResponses, setVoiceResponses] = useState("auto"); // "auto", "always", "never"
  const [voiceGender, setVoiceGender] = useState("female"); // "male", "female"
  const [aiTone, setAiTone] = useState("Friendly & Casual");

  const [nextId, setNextId]     = useState(4);
  const [activeSessionId, setActiveSessionId] = useState(() => "session-" + Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessions = useMemo(() => {
    const map = new Map<string, any[]>();
    aiChats.forEach(c => {
      const sid = c.sessionId || "legacy";
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(c);
    });
    return Array.from(map.entries()).map(([sid, chats]) => ({
      id: sid,
      chats,
      firstMessage: chats[0].userMessage,
      timestamp: chats[0].timestamp || new Date().toISOString()
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [aiChats]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bpa_ai_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setVoiceResponses(parsed.voiceResponses || "auto");
        setVoiceGender(parsed.voiceGender || "female");
        setAiTone(parsed.aiTone || "Friendly & Casual");
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    const currentSessionChats = aiChats.filter(c => (c.sessionId || "legacy") === activeSessionId);
    
    if (currentSessionChats.length === 0) {
      setMessages([]);
      return;
    }
    
    const loaded: Message[] = [];
    let msgId = 1;
    for (const chat of currentSessionChats) {
      if (chat.userMessage) {
        loaded.push({ id: msgId++, role: "user", text: chat.userMessage, time: chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "" });
      }
      if (chat.aiResponse) {
        loaded.push({ id: msgId++, role: "ai", text: chat.aiResponse, time: chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "" });
      }
    }
    setMessages(loaded);
    setNextId(msgId + 10);
  }, [aiChats, activeSessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const { profile, budgets, goals, totalIncome, totalExpenses, totalBalance } = useAppStore();
  const userEmail = profile.email;

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[*#_]/g, ''); // Remove basic markdown for cleaner speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // Attempt to pick based on common OS voices
    if (voiceGender === "female") {
      selectedVoice = voices.find(v => v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Female") || v.name.includes("Google US English"));
    } else {
      selectedVoice = voices.find(v => v.name.includes("David") || v.name.includes("Alex") || v.name.includes("Male") || v.name.includes("Google UK English Male"));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const send = async (text: string, overridePrompt?: string, isSpoken: boolean = false) => {
    if (!text.trim()) return;
    const emailToUse = userEmail || "anonymous@budgetpredict.com";
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = nextId;
    const aiMsgId = nextId + 1;
    
    setMessages(p => [...p, { id: userMsgId, role: "user", text, time: now }]);
    setNextId(p => p + 2);
    setInput("");
    setTyping(true);
    try {
      const financialContext = {
        totalIncome,
        totalExpenses,
        totalBalance,
        budgets: budgets.map(b => ({ category: b.category, limit: b.budget, spent: b.spent })),
        goals: goals.map(g => ({ name: g.name, target: g.target, current: g.current }))
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          message: overridePrompt || text,
          tone: aiTone,
          financialContext
        })
      });
      
      const data = await response.json();
      setTyping(false);
      
      const aiReply = data.text || "Sorry, I couldn't understand that.";
      
      setMessages(p => [...p, { id: aiMsgId, role: "ai", text: aiReply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      addAiChat({ userMessage: text, aiResponse: aiReply, sessionId: activeSessionId });

      if (voiceResponses === "always" || (voiceResponses === "auto" && isSpoken)) {
        speak(aiReply);
      }
    } catch (err) {
      console.error(err);
      setTyping(false);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      // Auto-send the transcribed text
      setTimeout(() => send(transcript, undefined, true), 400);
    };
    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access blocked! Please click the camera/mic icon in your address bar (top right) and select 'Allow'.");
      } else {
        alert("Voice Error: " + event.error);
      }
    };
    recognition.onend = () => setListening(false);
    
    recognition.start();
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden -m-6 lg:-m-8">

      {/* ── LEFT: Chat History ── */}
      <aside className="w-72 border-r border-[#bec9c7]/30 flex flex-col bg-white shrink-0">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-[#006d67]">Chat History</h2>
            <button onClick={() => setActiveSessionId("session-" + Date.now())} 
              className="flex items-center gap-1 text-[13px] font-bold text-[#006d67] hover:bg-[#006d67]/10 px-2 py-1 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <div className="mb-6">
            <p className="text-[11px] font-bold text-[#6e7978] uppercase tracking-wider mb-2">Recent Chats</p>
            <div className="space-y-0.5">
              {sessions.length === 0 && <p className="text-[12px] text-[#6e7978]">No recent chats.</p>}
              {sessions.map((session) => (
                <div key={session.id} onClick={() => setActiveSessionId(session.id)}
                  className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${
                    session.id === activeSessionId ? "bg-[#006d67]/10" : "hover:bg-[#f0edec]"
                  }`}>
                  <span className="text-[18px] shrink-0 mt-0.5">💬</span>
                  <div>
                    <p className={`text-[13px] font-semibold ${session.id === activeSessionId ? "text-[#006d67]" : "text-[#1c1b1b]"}`}>
                      {session.firstMessage.length > 25 ? session.firstMessage.substring(0, 25) + '...' : session.firstMessage}
                    </p>
                    <p className="text-[11px] text-[#6e7978]">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#f0edec]">
          <button className="w-full py-2.5 border border-[#bec9c7] text-[#006d67] text-[13px] font-bold rounded-xl hover:bg-[#f0edec] transition-colors">
            View All History
          </button>
        </div>
      </aside>

      {/* ── CENTER: Chat ── */}
      <section className="flex-1 flex flex-col bg-[#fcf9f8] relative overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-start border-b border-[#f0edec] bg-white">
          <div>
            <h1 className="text-[20px] font-bold text-[#1c1b1b]">AI Assistant</h1>
            <p className="text-[13px] text-[#3e4947]">Your smart financial companion. Ask anything or speak your mind.</p>
          </div>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-1.5 px-3 py-2 border border-[#bec9c7]/60 rounded-xl text-[12px] font-semibold text-[#3e4947] hover:bg-[#f0edec] transition-all">
            <Settings2 className="w-3.5 h-3.5" /> Assistant Settings
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-60">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              {msg.role === "ai" ? (
                <div className="w-10 h-10 rounded-full bg-[#006d67]/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#006d67]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#e5e2e1] flex items-center justify-center shrink-0 text-[13px] font-bold text-[#3e4947]">SJ</div>
              )}

              <div className={`space-y-2 max-w-md ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {msg.role === "ai" ? (
                  <>
                    <div className="bg-white border border-[#f0f0f0] shadow-sm p-4 rounded-2xl rounded-tl-none text-[14px] text-[#1c1b1b] leading-relaxed">
                      {renderText(msg.text)}
                    </div>
                    {msg.card === "food" && <FoodCard />}
                  </>
                ) : (
                  <div className="bg-[#006d67] text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                    <p className="text-[14px] leading-relaxed">{msg.text}</p>
                    <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                      <span className="text-[10px]">{msg.time}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006d67]/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#006d67]" />
                </div>
                <div className="bg-white border border-[#f0f0f0] p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  {[0, 150, 300].map(d => (
                    <motion.span key={d} className="w-2 h-2 rounded-full bg-[#006d67]"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d / 1000 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Footer: chips + input + listening */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 bg-gradient-to-t from-[#fcf9f8] via-[#fcf9f8]/95 to-transparent pt-12">
          {/* Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CHIPS.map(c => (
              <button key={c.label} onClick={() => send(c.label, c.prompt)}
                className="px-4 py-1.5 whitespace-nowrap bg-white border border-[#bec9c7]/60 rounded-full text-[12px] font-semibold text-[#3e4947] hover:bg-[#006d67] hover:text-white hover:border-[#006d67] transition-all shadow-sm">
                {c.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 pl-4 border border-[#bec9c7]/60 shadow-sm">
            <button className="text-[#6e7978] hover:text-[#006d67] transition-colors"><Plus className="w-5 h-5" /></button>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ask anything about your finances..."
              className="flex-1 border-none focus:ring-0 bg-transparent text-[14px] text-[#1c1b1b] placeholder:text-[#6e7978]/60 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <button className="p-2 text-[#6e7978] hover:text-[#006d67]"><Keyboard className="w-4 h-4" /></button>
              <button onClick={handleMicClick}
                className={`p-2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${listening ? "bg-[#006d67] text-white" : "bg-[#006d67]/5 text-[#006d67] hover:bg-[#006d67]/10"}`}>
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => send(input)}
                className="p-2 w-9 h-9 bg-[#006d67] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listening bar — always visible like the HTML */}
          <div className="mt-3 p-4 rounded-2xl bg-[#006d67]/5 border border-[#006d67]/15 flex flex-col items-center">
            <div className="flex items-center gap-6 mb-2">
              {/* Left wave bars */}
              <div className="flex gap-[3px] items-center">
                {[0.1, 0.3, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="w-[3px] bg-[#006d67] rounded-full"
                    style={{ height: "4px", animation: `pulse-wave 1.2s ease-in-out infinite`, animationDelay: `${d}s` }} />
                ))}
              </div>
              <button onClick={handleMicClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-[#006d67]/30 active:scale-95 transition-transform ${listening ? "bg-[#006d67]" : "bg-[#006d67]"}`}>
                <Mic className="w-5 h-5 text-white" />
              </button>
              {/* Right wave bars */}
              <div className="flex gap-[3px] items-center">
                {[0.4, 0.2, 0.5, 0.1].map((d, i) => (
                  <div key={i} className="w-[3px] bg-[#006d67] rounded-full"
                    style={{ height: "4px", animation: `pulse-wave 1.2s ease-in-out infinite`, animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
            <p className="text-[13px] font-bold text-[#006d67]">Tap to speak</p>
            <p className="text-[11px] text-[#6e7978]">Listening...</p>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Insights & Tools ── */}
      <aside className="w-80 border-l border-[#bec9c7]/30 bg-white overflow-y-auto shrink-0 p-6 space-y-8">

        {/* Voice Assistant */}
        <section>
          <h3 className="text-[14px] font-bold text-[#1c1b1b] mb-1">Speak to Assistant</h3>
          <p className="text-[12px] text-[#6e7978] mb-4">Try our voice assistant</p>
          <div className="bg-[#fcf9f8] p-5 rounded-2xl border border-[#bec9c7]/30 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
              <WaveBars count={3} className="opacity-30" />
              <button onClick={handleMicClick}
                className="w-14 h-14 rounded-full border-4 border-[#006d67]/15 flex items-center justify-center hover:border-[#006d67]/30 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#006d67]/5 flex items-center justify-center text-[#006d67]">
                  <Mic className="w-5 h-5" />
                </div>
              </button>
              <WaveBars count={3} className="opacity-30" />
            </div>
            <p className="text-[12px] font-semibold text-[#6e7978]/70">Tap to start speaking</p>
          </div>
        </section>

        {/* Smart Insights */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-[#1c1b1b]">Smart Insights</h3>
            <button className="text-[12px] font-bold text-[#006d67] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { icon: <TrendingDown className="w-4 h-4" />, bg: "bg-green-50 text-green-600",  title: "Your spending is 12% lower", sub: "than last month. Great job!" },
              { icon: <Bell className="w-4 h-4" />,         bg: "bg-orange-50 text-orange-600", title: "You have 2 bills due",        sub: "in the next 7 days." },
              { icon: <PiggyBank className="w-4 h-4" />,    bg: "bg-purple-50 text-purple-600", title: "You can save up to $200",     sub: "this month by optimizing subscriptions." },
            ].map((ins, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-xl ${ins.bg} flex items-center justify-center shrink-0`}>{ins.icon}</div>
                <div>
                  <p className="text-[13px] font-bold text-[#1c1b1b]">{ins.title}</p>
                  <p className="text-[11px] text-[#6e7978]">{ins.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Questions */}
        <section>
          <h3 className="text-[14px] font-bold text-[#1c1b1b] mb-3">Popular Questions</h3>
          <div className="space-y-1.5">
            {POPULAR.map(q => (
              <button key={q.label} onClick={() => send(q.label, q.prompt)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#bec9c7]/30 hover:bg-[#f0edec] text-left group transition-colors">
                <span className="text-[12px] text-[#3e4947] group-hover:text-[#006d67] transition-colors">{q.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6e7978] group-hover:text-[#006d67] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[14px] font-bold text-[#1c1b1b]">Recent Documents</h3>
            <button className="text-[12px] font-bold text-[#006d67] hover:underline">View All</button>
          </div>
          <div className="p-4 border border-[#bec9c7]/30 rounded-2xl flex items-center gap-3 hover:bg-[#f0edec] cursor-pointer transition-colors group">
            <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#1c1b1b] truncate group-hover:text-[#006d67] transition-colors">April Bank Statement</p>
              <p className="text-[11px] text-[#6e7978]">PDF · Uploaded 2 days ago</p>
            </div>
          </div>
        </section>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#f0edec] flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-[#1c1b1b]">Assistant Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-[#6e7978] hover:text-[#1c1b1b]">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[14px] font-semibold text-[#1c1b1b]">Spoken Responses</p>
                  <p className="text-[12px] text-[#6e7978]">Read out AI responses automatically.</p>
                </div>
                <select 
                  value={voiceResponses} 
                  onChange={(e) => setVoiceResponses(e.target.value)}
                  className="border border-[#bec9c7] rounded-xl p-2 text-[13px] outline-none focus:border-[#006d67] bg-white">
                  <option value="auto">Only when I speak</option>
                  <option value="always">Always read aloud</option>
                  <option value="never">Never (Muted)</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[14px] font-semibold text-[#1c1b1b]">Voice Gender</p>
                  <p className="text-[12px] text-[#6e7978]">Based on your device's built-in voices.</p>
                </div>
                <select 
                  value={voiceGender} 
                  onChange={(e) => setVoiceGender(e.target.value)}
                  className="border border-[#bec9c7] rounded-xl p-2 text-[13px] outline-none focus:border-[#006d67] bg-white">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1c1b1b] mb-2">Preferred Tone</p>
                <select 
                  value={aiTone} 
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full border border-[#bec9c7] rounded-xl p-2.5 text-[14px] outline-none focus:border-[#006d67]">
                  <option value="Friendly & Casual">Friendly & Casual</option>
                  <option value="Professional">Professional</option>
                  <option value="Direct & Concise">Direct & Concise</option>
                  <option value="Roasting & Friendly">Roasting & Friendly</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#f0edec] flex justify-end">
              <button onClick={() => {
                localStorage.setItem("bpa_ai_settings", JSON.stringify({ voiceResponses, voiceGender, aiTone }));
                setShowSettings(false);
              }} className="px-5 py-2 bg-[#006d67] text-white font-semibold rounded-xl text-[13px] hover:bg-[#005a54] transition-colors">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
