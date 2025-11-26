import React from 'react';
import { BookOpen, MessageSquare, Menu, Activity, Search } from 'lucide-react';

interface Props {
  activeTab: 'research' | 'chat';
  setActiveTab: (tab: 'research' | 'chat') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  
  const navItems = [
    { id: 'research', label: '研究文獻庫', icon: BookOpen },
    { id: 'chat', label: 'AI 教練問答', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
            <Activity className="text-emerald-500" />
            <span className="font-bold text-lg text-white">StrengthScience</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          <Menu />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:flex-shrink-0
      `}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Activity className="text-emerald-500 w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">StrengthScience</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-xs text-slate-900">
                AI
             </div>
             <div>
                <p className="text-sm font-medium text-white">Gemini 2.5</p>
                <p className="text-xs text-emerald-400">Online • Connected</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};