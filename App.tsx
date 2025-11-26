import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { SourceChips } from './components/SourceChips';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Category, Report, ChatMessage } from './types';
import { generateLiteratureReview, sendChatMessage } from './services/geminiService';
import { Search, Send, Loader2, Sparkles, ArrowRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = Object.values(Category);

export default function App() {
  const [activeTab, setActiveTab] = useState<'research' | 'chat'>('research');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Research State
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.HYPERTROPHY);
  const [researchReport, setResearchReport] = useState<Report | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleResearch = async () => {
    if (!searchTopic.trim()) return;
    setIsSearching(true);
    setResearchReport(null);

    try {
      const result = await generateLiteratureReview(searchTopic, selectedCategory);
      setResearchReport({
        id: Date.now().toString(),
        topic: searchTopic,
        category: selectedCategory,
        summary: result.text,
        groundingMetadata: result.groundingMetadata,
        date: new Date().toLocaleDateString('zh-TW'),
      });
    } catch (e) {
      console.error(e);
      alert("搜尋時發生錯誤，請稍後再試。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatting) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      // Format history for Gemini API
      const apiHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const result = await sendChatMessage(apiHistory, userMsg.content);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.text,
        groundingMetadata: result.groundingMetadata,
        timestamp: Date.now(),
      };

      setChatHistory(prev => [...prev, modelMsg]);
    } catch (e) {
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: "抱歉，連線發生錯誤，請稍後再試。",
            timestamp: Date.now(),
          };
          setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 h-screen overflow-y-auto w-full pt-16 md:pt-0 relative">
        
        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="max-w-5xl mx-auto p-4 md:p-10 pb-24">
            <header className="mb-8 md:mb-12 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                肌力與體能知識庫
              </h1>
              <p className="text-slate-400 text-lg">
                整合最新科研文獻，為您提供實證訓練建議
              </p>
            </header>

            {/* Search Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 relative overflow-hidden">
               {/* Background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                    placeholder="輸入研究主題 (例如：VBT 訓練效果, 十字韌帶術後恢復...)"
                    className="w-full bg-slate-800 border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
                <button
                  onClick={handleResearch}
                  disabled={isSearching || !searchTopic}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] shadow-lg shadow-emerald-900/20"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  <span>分析文獻</span>
                </button>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">選擇領域 Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {!researchReport && !isSearching && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                 {[
                    { title: "提升衝刺速度", desc: "探討阻力雪橇與增強式訓練的最佳劑量反應關係。" },
                    { title: "肌肥大機制", desc: "比較機械張力與代謝壓力在不同訓練課表的角色。" },
                    { title: "運動員恢復", desc: "睡眠、營養與冷療對於菁英運動員的實際效益分析。" }
                 ].map((item, i) => (
                    <div key={i} 
                         onClick={() => { setSearchTopic(item.title); }}
                         className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/30 cursor-pointer transition-all hover:bg-slate-800/80 hover:-translate-y-1">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
                            <BookOpen className="text-emerald-500" size={20}/>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        <div className="mt-4 flex items-center text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            點擊填入 <ArrowRight size={14} className="ml-1"/>
                        </div>
                    </div>
                 ))}
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">正在搜尋最新文獻並整理報告中...</p>
                <p className="text-slate-600 text-sm mt-2">這可能需要 10-15 秒</p>
              </div>
            )}

            {/* Results Report */}
            {researchReport && !isSearching && (
              <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-8 border-b border-slate-800">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                              Research Report
                           </span>
                           <span className="text-slate-500 text-xs flex items-center gap-1">
                              <RefreshCw size={10} /> Generated {researchReport.date}
                           </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                          {researchReport.topic}
                        </h2>
                     </div>
                     <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700">
                        {researchReport.category}
                     </span>
                  </div>

                  <div className="prose prose-invert prose-emerald max-w-none">
                    <MarkdownRenderer content={researchReport.summary} />
                  </div>
                  
                  <SourceChips metadata={researchReport.groundingMetadata} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {chatHistory.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                      <div className="p-4 bg-slate-900 rounded-full mb-4">
                        <Sparkles size={32} className="text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-300 mb-2">AI 肌力與體能教練</h3>
                      <p className="text-sm">您可以詢問關於訓練週期、動作品質或文獻解讀的問題</p>
                   </div>
                ) : (
                   chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 md:p-5 ${
                            msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-900/20' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-md'
                         }`}>
                            <MarkdownRenderer content={msg.content} />
                            {msg.role === 'model' && <SourceChips metadata={msg.groundingMetadata} />}
                         </div>
                      </div>
                   ))
                )}
                {isChatting && (
                   <div className="flex justify-start">
                      <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700">
                         <Loader2 className="animate-spin text-emerald-500" size={20} />
                      </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 sticky bottom-0 z-20">
                <div className="relative max-w-4xl mx-auto">
                   <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      placeholder="輸入您的問題..."
                      className="w-full bg-slate-900 border-slate-700 text-white pl-5 pr-14 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all shadow-inner"
                   />
                   <button 
                      onClick={handleChat}
                      disabled={isChatting || !chatInput.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-slate-700"
                   >
                      <Send size={18} />
                   </button>
                </div>
                <p className="text-center text-xs text-slate-600 mt-3 flex items-center justify-center gap-1">
                   <AlertCircle size={10} /> AI 回答僅供參考，請結合專業教練判斷。
                </p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}