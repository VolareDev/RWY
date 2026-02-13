
import React, { useState } from 'react';
import { AppView } from './types';
import RWYApp from './components/RWYApp';
import ArgeNotamApp from './components/ArgeNotamApp';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');

  if (view === 'rwy') {
    return (
      <div className="relative">
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-[9999] bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          VOLVER AL INICIO
        </button>
        <RWYApp />
      </div>
    );
  }

  if (view === 'notam') {
    return (
      <div className="relative">
        <button 
          onClick={() => setView('home')}
          className="fixed top-4 left-4 z-[9999] bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          VOLVER AL INICIO
        </button>
        <ArgeNotamApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-block bg-blue-600 text-white text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase mb-4">
            Aeronautical Portal 2026
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
            AeroTools <span className="text-blue-600">AR</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Selecciona la herramienta que deseas utilizar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Rumbos de RWY */}
          <button 
            onClick={() => setView('rwy')}
            className="group relative bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-blue-500 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-blue-50 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10,2L2,12L10,22V15H22V9H10V2Z" />
              </svg>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Rumbos de RWY</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Cálculo de pistas, declinación magnética y coordenadas de umbrales.</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest">
                Ingresar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </button>

          {/* Card 2: ArgeNotam */}
          <button 
            onClick={() => setView('notam')}
            className="group relative bg-slate-900 p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-orange-500 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-white opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
              </svg>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">ArgeNotam</h3>
                <p className="text-slate-400 font-medium text-sm mt-2">Monitoreo y análisis inteligente de NOTAMs argentinos con IA.</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest">
                Ingresar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </button>
        </div>

        <footer className="text-center pt-12">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Desarrollado por Daniel Montoto - 2026</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
