'use client';
import { useState, useEffect } from 'react';
import Groq from "groq-sdk";
import Markdown from 'react-markdown';

const moodStyles = {
  Gentle: {
    bg: "bg-[#bbf7d0]", 
    button: "bg-[#166534] hover:bg-[#14532d]",
    cardShadow: "shadow-[12px_12px_0px_0px_rgba(22,101,52,1)]" 
  },
  Balanced: {
    bg: "bg-[#bfdbfe]", 
    button: "bg-[#1e40af] hover:bg-[#1e3a8a]",
    cardShadow: "shadow-[12px_12px_0px_0px_rgba(30,64,175,1)]"
  },
  "Hard Truth": {
    bg: "bg-[#fecdd3]", 
    button: "bg-[#9f1239] hover:bg-[#881337]",
    cardShadow: "shadow-[12px_12px_0px_0px_rgba(159,18,57,1)]"
  }
};

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isSifting, setIsSifting] = useState(false);
  const [tone, setTone] = useState('Balanced'); 
  const [language, setLanguage] = useState('English');
  const [risk, setRisk] = useState('Moderate'); 
  const [history, setHistory] = useState([]);

  const theme = moodStyles[tone] || moodStyles.Balanced;

  const groq = new Groq({ 
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
  });

  useEffect(() => {
    const saved = localStorage.getItem('siftHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const wipeHistory = () => {
    if (confirm("Delete everything?")) {
      setHistory([]);
      localStorage.removeItem('siftHistory');
    }
  };

  async function handleSift() {
    if (!userInput) return;
    setIsSifting(true);
    setAnalysis(''); 
    
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `### ROLE
      You are 'Sift', a specialist in Financial Psychology and Behavioral Economics.
      Your goal is to decode the emotional noise from financial reality.

      ### INPUT PARAMETERS
      - TONE: ${tone}
      - LANGUAGE: ${language}
      - RISK TOLERANCE: ${risk}

      ### OUTPUT STRUCTURE (Strict Markdown)
      1. **THE NARRATIVE**: Summarize the story the user is telling themselves.
      2. **THE WEIGHT**: Identify the primary stressor (Debt, Lifestyle Creep, or Scarcity).
      3. **TRADE-OFFS**: What are they giving up for this current situation?
      4. **CALCULATED STEPS**: Provide 3 actions aligned with a ${risk} risk profile.
      5. **REFLECTION**: Ask one deep question about their relationship with money.
      6. **RISK ASSESSMENT**: Evaluate their situation through a ${risk} lens.
      7. **WORLD MARKET COMPARISON**: Provide a detailed comparative study between the user's information and the current world market trends.

      ### CONSTRAINTS
      - Respond in ${language}.
      - DO NOT give specific investment advice.
      - Use bold headers and clean bullet points.`
          },
          { role: "user", content: userInput },
        ],
        model: "llama-3.3-70b-versatile",
      });

      const result = chatCompletion.choices[0]?.message?.content || "";
      setAnalysis(result);

      const newEntry = { 
        id: Date.now(), 
        text: userInput.substring(0, 40) + "...", 
        result: result,
        tone: tone,
        date: new Date().toLocaleDateString()
      };
      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('siftHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      setAnalysis("Error: " + error.message);
    }
    setIsSifting(false);
  }

  return (
    <main className={`min-h-screen p-4 md:p-12 transition-all duration-500 ${theme.bg}`}>
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 text-black font-bold">
        
        <div className="lg:col-span-3 space-y-10">
          <div className={`bg-white p-8 md:p-16 rounded-[2rem] border-8 border-black ${theme.cardShadow}`}>
            <div className="flex flex-col mb-10 border-b-8 border-black pb-4">
               <h1 className="text-8xl font-black italic leading-none">Sift.</h1>
               {/* Financial Decoder Label */}
               <span className="text-xl font-black uppercase tracking-[0.2em] mt-2">Financial Decoder</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-black">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase">TONE</label>
                <select 
                  value={tone} 
                  onChange={(e)=>setTone(e.target.value)} 
                  className="w-full p-4 bg-white border-4 border-black font-black text-black text-xl"
                >
                  <option value="Gentle">Gentle</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Hard Truth">Hard Truth</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase">RISK</label>
                <select 
                  value={risk} 
                  onChange={(e)=>setRisk(e.target.value)} 
                  className="w-full p-4 bg-white border-4 border-black font-black text-black text-xl"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase">LANGUAGE</label>
                <select 
                  value={language} 
                  onChange={(e)=>setLanguage(e.target.value)} 
                  className="w-full p-4 bg-white border-4 border-black font-black text-black text-xl"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                </select>
              </div>
            </div>

            <textarea 
              className="w-full h-64 p-8 border-4 border-black bg-white outline-none text-2xl mb-8 placeholder:text-gray-400 text-black font-black"
              placeholder="Tell me the situation..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            
            <button 
              onClick={handleSift}
              className={`w-full text-white py-8 rounded-none font-black text-4xl tracking-tighter border-4 border-black transition-all active:translate-y-2 active:shadow-none ${theme.button}`}
              disabled={isSifting || !userInput}
            >
              {isSifting ? 'WORKING...' : 'SIFT REALITY'}
            </button>
          </div>

          {analysis && (
            <div className="p-10 md:p-16 bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black uppercase tracking-widest mb-10 border-b-4 border-black pb-4 text-black italic">THE DECODE:</h2>
              <article className="prose prose-xl max-w-none text-black">
                <div className="text-black font-black leading-tight space-y-6">
                   <Markdown>{analysis}</Markdown>
                </div>
              </article>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase italic text-black">Archives</h3>
          {history.map((item) => (
            <button 
              key={item.id} 
              onClick={() => {setAnalysis(item.result); setTone(item.tone);}}
              className="w-full text-left p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <p className="text-lg font-black text-black mb-2 truncate">{item.text}</p>
              <span className={`text-xs font-black uppercase px-2 py-1 border-2 border-black text-white ${moodStyles[item.tone]?.button}`}>
                {item.tone}
              </span>
            </button>
          ))}
          {history.length > 0 && (
            <button 
              onClick={wipeHistory}
              className="w-full py-4 text-sm font-black uppercase bg-black text-white border-4 border-black hover:bg-red-600 transition-all"
            >
              WIPE ALL MEMORY
            </button>
          )}
        </div>

      </div>
    </main>
  );
}