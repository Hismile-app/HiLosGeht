'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface AIMachineryAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_SUGGESTIONS = [
  'What machinery do I need to dig an agricultural water dam in Timau?',
  'How many 15T tipper trips to move 500 tons of ballast in Meru?',
  'Excavator vs Backhoe: which is better for deep foundation trenching in Nkubu?',
  'What is the daily rate and transport for Komatsu D155AX Dozer to Isiolo?',
];

export default function AIMachineryAdvisorModal({ isOpen, onClose, initialQuery = '' }: AIMachineryAdvisorModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConsult = async (textToSubmit?: string) => {
    const q = (textToSubmit || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setResponseMarkdown(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/ai/consultant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (data?.success) {
        setResponseMarkdown(data.data.replyMarkdown);
      } else {
        setResponseMarkdown('Sorry, could not connect to AI advisor. Please call our Meru dispatch hotline at **0717 186396**.');
      }
    } catch (e: any) {
      setResponseMarkdown('Connection error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDispatch = () => {
    const text = encodeURIComponent(`Hello Hi Los Geht Dispatch, I used your AI Project Consultant for the following inquiry:\n\n"${query}"\n\nPlease confirm machinery availability.`);
    window.open(`https://wa.me/254717186396?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-sm sm:text-base tracking-wider uppercase">
                  Hi Los Geht AI Plant Consultant
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold uppercase">
                  Groq 120B
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono">
                Instant equipment recommendations, work capacity & logistics advice for Kenya
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick suggestions if no response yet */}
          {!responseMarkdown && !loading && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-muted uppercase font-semibold">
                Quick Project Inquiries:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(item);
                      handleConsult(item);
                    }}
                    className="text-left text-xs bg-surface hover:bg-orange-50 border border-border hover:border-orange-200 px-3 py-1.5 rounded-lg text-zinc-700 transition-colors"
                  >
                    💡 {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input Field */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-700 font-semibold uppercase block">
              Describe your project, soil conditions, or haulage requirement:
            </label>
            <div className="flex gap-2">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={2}
                placeholder="e.g. I need to excavate 3,000 cubic meters of rocky terrain for a foundation in Nkubu. Which machine do you recommend?"
                className="flex-1 bg-surface border border-border rounded-xl p-3 text-xs text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono resize-none"
              />
              <button
                onClick={() => handleConsult()}
                disabled={loading || !query.trim()}
                className="px-5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-heading font-bold uppercase transition-all shadow-subtle flex flex-col items-center justify-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                <span>{loading ? 'Evaluating...' : 'Ask AI'}</span>
              </button>
            </div>
          </div>

          {/* AI Response Display */}
          {loading && (
            <div className="p-8 text-center bg-surface border border-border rounded-xl space-y-2">
              <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto" />
              <div className="font-heading font-bold text-sm text-foreground">
                Synthesizing Heavy Machinery Deployment Plan...
              </div>
              <p className="text-xs text-muted font-mono">
                Evaluating bucket capacities, diesel burn benchmarks, and Meru terrain factors.
              </p>
            </div>
          )}

          {responseMarkdown && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-orange-50/40 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary mb-2 uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Recommendation & Technical Assessment</span>
                </div>
                <MarkdownRenderer content={responseMarkdown} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                <button
                  onClick={handleWhatsAppDispatch}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss Recommendation on WhatsApp</span>
                </button>
                <a
                  href="/contact"
                  className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>Submit Official RFQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface border-t border-border flex items-center justify-between text-[11px] font-mono text-muted shrink-0">
          <span>Official Dispatch Hotlines: 0717 186396 | 0748866823</span>
          <span className="hidden sm:inline">Compiled via Markdown UI Engine</span>
        </div>
      </div>
    </div>
  );
}
