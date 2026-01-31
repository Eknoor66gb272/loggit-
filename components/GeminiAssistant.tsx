
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface GeminiAssistantProps {
  onAddContent: (type: 'text' | 'image', content: string) => void;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onAddContent }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [genMode, setGenMode] = useState<'copy' | 'image'>('copy');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use process.env.API_KEY which is injected by Vite/Cloud Run
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("Security Key Missing: Check Cloud Environment.");

      const ai = new GoogleGenAI({ apiKey });
      
      if (genMode === 'copy') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Act as a high-end UI copywriter for a brand called 'Logg IT'. Generate a very short, premium tagline for this requirement: ${prompt}. Return ONLY the text string. Max 60 characters. Use all-caps if it feels more premium.`,
        });
        onAddContent('text', response.text || '');
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A ultra-premium, high-fidelity studio photograph of: ${prompt}. Minimalist cinematic lighting, 8k resolution, elegant, high contrast, Onyx and baby-blue aesthetic. Professional commercial photography style.` }]
          },
          config: {
            imageConfig: { aspectRatio: "16:9" }
          }
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) throw new Error("Model refused generation.");
        
        const imagePart = candidates[0].content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          onAddContent('image', `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        } else {
          throw new Error("Visual channel unavailable. Try a different description.");
        }
      }
      setPrompt('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Check API key and project limits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/80 border-2 border-slate-800 rounded-[2.5rem] p-6 shadow-2xl animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#E8B49A] rounded-full animate-pulse shadow-[0_0_10px_#E8B49A]"></div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] logo-font">AI Synthesis</h3>
        </div>
        <div className="flex bg-black rounded-lg p-1 border border-slate-800">
           <button 
             onClick={() => setGenMode('copy')}
             className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${genMode === 'copy' ? 'bg-[#E8B49A] text-black shadow-lg' : 'text-slate-500'}`}
           >Draft</button>
           <button 
             onClick={() => setGenMode('image')}
             className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${genMode === 'image' ? 'bg-[#89CFF0] text-black shadow-lg' : 'text-slate-500'}`}
           >Visual</button>
        </div>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={genMode === 'copy' ? "Describe the copy style..." : "Describe the visual asset..."}
        className="w-full bg-black border-2 border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-[#89CFF0] transition-all h-24 mb-4 resize-none logo-font placeholder-slate-700"
      />
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
           <p className="text-[8px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className={`w-full py-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
          loading || !prompt.trim() 
          ? 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50' 
          : genMode === 'copy' ? 'bg-[#E8B49A] text-black shadow-lg hover:scale-[1.02]' : 'bg-[#89CFF0] text-black shadow-lg hover:scale-[1.02]'
        } logo-font`}
      >
        {loading ? (
          <i className="fa-solid fa-spinner animate-spin"></i>
        ) : (
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        )}
        {loading ? 'Synthesizing...' : `Commence ${genMode === 'copy' ? 'Draft' : 'Render'}`}
      </button>
    </div>
  );
};
