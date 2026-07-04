"use client";

import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, X, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type VoiceCommand =
  | { type: "ADD_TRANSACTION";    description: string; amount: number; category: string; txType: "income" | "expense" }
  | { type: "DELETE_LAST" }
  | { type: "DELETE_BY_DESC";     description: string }
  | { type: "UNKNOWN";            raw: string };

// ── Intent parser ──────────────────────────────────────────────────────────
function parseVoiceCommand(text: string): VoiceCommand {
  const t = text.toLowerCase().trim();

  // DELETE commands: "delete last entry", "remove last", "delete groceries"
  if (/delete last|remove last|undo last/.test(t)) {
    return { type: "DELETE_LAST" };
  }
  const deleteMatch = t.match(/(?:delete|remove)\s+(?:the\s+)?(.+?)(?:\s+entry|\s+transaction)?$/);
  if (deleteMatch) {
    return { type: "DELETE_BY_DESC", description: deleteMatch[1].trim() };
  }

  // ADD commands: "add expense 500 for groceries", "add income 2000 salary"
  const addMatch = t.match(
    /(?:add|record|create)\s+(expense|income|spending)?\s*(?:of\s+)?(\d+(?:\.\d+)?)\s+(?:for\s+|on\s+|as\s+)?(.+)/
  );
  if (addMatch) {
    const txType: "income" | "expense" = (addMatch[1] === "income") ? "income" : "expense";
    const amount  = parseFloat(addMatch[2]);
    const rawDesc = addMatch[3].trim();
    const CATS: Record<string, string> = {
      food: "Food", groceries: "Food", restaurant: "Food", coffee: "Food",
      rent: "Housing", housing: "Housing", mortgage: "Housing",
      transport: "Transport", fuel: "Transport", gas: "Transport", uber: "Transport",
      entertainment: "Entertainment", netflix: "Entertainment", spotify: "Entertainment",
      utilities: "Utilities", electricity: "Utilities", water: "Utilities",
      salary: "Income", income: "Income", freelance: "Income",
      health: "Health", gym: "Health", medicine: "Health",
      shopping: "Shopping",
    };
    const category = Object.entries(CATS).find(([k]) => rawDesc.includes(k))?.[1] ?? "Other";
    return { type: "ADD_TRANSACTION", description: rawDesc, amount, category, txType };
  }

  return { type: "UNKNOWN", raw: text };
}

// ── Props ──────────────────────────────────────────────────────────────────
interface VoiceInputProps {
  onCommand: (cmd: VoiceCommand) => void;
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function VoiceInput({ onCommand, className = "" }: VoiceInputProps) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus]         = useState<"idle" | "listening" | "processing" | "done" | "error">("idle");
  const [result, setResult]         = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("error");
      setResult("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setStatus("listening");
      setTranscript("");
      setResult("");
    };

    recognition.onresult = (e: any) => {
      const interim = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(interim);
    };

    recognition.onend = () => {
      setListening(false);
      setStatus("processing");
      const finalText = transcript || recognitionRef.current?._lastTranscript || "";
      if (!finalText.trim()) {
        setStatus("error");
        setResult("No speech detected. Please try again.");
        return;
      }
      const cmd = parseVoiceCommand(finalText);
      if (cmd.type === "UNKNOWN") {
        setStatus("error");
        setResult(`Couldn't understand: "${finalText}". Try "Add expense 50 for coffee" or "Delete last entry".`);
      } else {
        setStatus("done");
        const desc =
          cmd.type === "ADD_TRANSACTION"  ? `Adding ${cmd.txType} of $${cmd.amount} for ${cmd.description}` :
          cmd.type === "DELETE_LAST"       ? "Deleting last entry" :
          cmd.type === "DELETE_BY_DESC"    ? `Deleting "${cmd.description}"` : "";
        setResult(desc);
        onCommand(cmd);
      }
    };

    recognition.onerror = (e: any) => {
      setListening(false);
      setStatus("error");
      setResult(e.error === "not-allowed" ? "Microphone permission denied." : `Error: ${e.error}`);
    };

    // Store transcript on each result for onend access
    recognition.addEventListener("result", (e: any) => {
      recognitionRef.current._lastTranscript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
    });

    recognition.start();
  }, [transcript, onCommand]);

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const dismiss = () => {
    setStatus("idle");
    setTranscript("");
    setResult("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mic button */}
      <button
        onClick={listening ? stopListening : startListening}
        title={listening ? "Stop listening" : "Voice command"}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
          ${listening
            ? "bg-[#ba1a1a] text-white animate-pulse"
            : "bg-[#00534e] text-white hover:opacity-90"
          }`}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {listening && (
          <span className="absolute inset-0 rounded-full bg-[#ba1a1a] opacity-30 animate-ping" />
        )}
      </button>

      {/* Feedback panel */}
      <AnimatePresence>
        {(status !== "idle") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-xl border border-[#e5e2e1] p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[12px] font-bold text-[#1c1b1b] uppercase tracking-wide">
                {status === "listening"   && "🎙 Listening…"}
                {status === "processing"  && "⚡ Processing…"}
                {status === "done"        && "✅ Done"}
                {status === "error"       && "❌ Error"}
              </p>
              <button onClick={dismiss} className="p-0.5 rounded hover:bg-[#f0edec] text-[#6e7978]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wave bars when listening */}
            {status === "listening" && (
              <div className="flex gap-[3px] items-center h-8 mb-2">
                {[0.1, 0.3, 0.2, 0.4, 0.15, 0.35, 0.25].map((d, i) => (
                  <div key={i} className="w-[3px] bg-[#00534e] rounded-full"
                    style={{ height: "6px", animation: `pulse-wave 1.1s ease-in-out infinite`, animationDelay: `${d}s` }} />
                ))}
                <span className="ml-2 text-[11px] text-[#6e7978] italic">
                  {transcript || "Speak now…"}
                </span>
              </div>
            )}

            {/* Result message */}
            {(status === "done" || status === "error") && result && (
              <div className={`flex items-start gap-2 mt-1 p-2.5 rounded-xl text-[12px] ${
                status === "done" ? "bg-[#9ef1e9]/20 text-[#00534e]" : "bg-[#ffdad6]/30 text-[#ba1a1a]"
              }`}>
                {status === "done"
                  ? <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                }
                {result}
              </div>
            )}

            {/* Hint */}
            {status === "listening" && (
              <p className="text-[10px] text-[#6e7978] mt-2">
                Try: <em>"Add expense 120 for groceries"</em> or <em>"Delete last entry"</em>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
