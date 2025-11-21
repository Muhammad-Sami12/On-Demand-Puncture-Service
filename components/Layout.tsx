import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-200 p-4 sm:p-8">
      <div className="w-full max-w-md bg-white h-[850px] sm:h-[800px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border-8 border-slate-800">
        {/* Phone Notch / Status Bar Mock */}
        <div className="bg-slate-800 text-white px-6 py-2 flex justify-between items-center text-xs select-none z-50 shrink-0">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <div className="w-4 h-4 bg-slate-600 rounded-full flex items-center justify-center text-[8px]">5G</div>
            <div className="w-6 h-3 bg-green-400 rounded-sm"></div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};