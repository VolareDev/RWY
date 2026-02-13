
import React, { useMemo } from 'react';
import { LocationType, Notam, GroundingSource } from '../types';

interface SidebarProps {
  selectedLocation: { type: LocationType, id: string } | null;
  selectedName: string;
  onSelect: (type: LocationType, item: any) => void;
  notams: Notam[];
  sources: GroundingSource[];
  isLoading: boolean;
}

const TOPIC_COLORS: Record<string, { bg: string, border: string, text: string, accent: string }> = {
  'AGA': { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', accent: 'bg-sky-500' },
  'ANS': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', accent: 'bg-indigo-500' },
  'COM': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: 'bg-emerald-500' },
  'MET': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: 'bg-amber-500' },
  'RAC': { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', accent: 'bg-rose-500' },
  'OTHERS': { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', accent: 'bg-slate-500' }
};

const Sidebar: React.FC<SidebarProps> = ({ selectedLocation, selectedName, notams, sources, isLoading }) => {
  const categorizedNotams = useMemo(() => {
    const categories: Record<string, Notam[]> = {
      'AGA': [],
      'ANS': [],
      'COM': [],
      'MET': [],
      'RAC': [],
      'OTHERS': []
    };
    
    notams.forEach(n => {
      const topic = n.topic || 'OTHERS';
      if (categories[topic]) {
        categories[topic].push(n);
      } else {
        categories['OTHERS'].push(n);
      }
    });
    
    return categories;
  }, [notams]);

  const hasNotams = notams.length > 0;

  return (
    <div className="w-full md:w-[450px] bg-slate-900 h-full flex flex-col border-r border-slate-800 shadow-2xl z-[1001]">
      <div className="p-8 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
          <h2 className="text-white text-xs font-black uppercase tracking-widest text-blue-400">ArgeNOTAM v2.5</h2>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter truncate">
          {selectedName || 'Seleccione Localidad'}
        </h1>
        {selectedLocation && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
              {selectedLocation.type}: {selectedLocation.id}
            </span>
            {notams.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-tighter whitespace-nowrap">
                {notams.length} NOTAMS
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-slate-900/40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">Analizando información con IA...</p>
          </div>
        ) : hasNotams ? (
          (Object.entries(categorizedNotams) as [string, Notam[]][]).map(([cat, list]) => {
            if (list.length === 0) return null;
            const colors = TOPIC_COLORS[cat] || TOPIC_COLORS['OTHERS'];
            
            return (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-1 ${colors.accent} rounded-full`} />
                  <h3 className={`text-[10px] font-black ${colors.text} uppercase tracking-widest`}>{cat}</h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="space-y-4">
                  {list.map((notam, i) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all hover:bg-slate-800/30 ${
                      notam.category === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
                      notam.category === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : `${colors.bg} ${colors.border}`
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          notam.category === 'critical' ? 'bg-red-600 text-white' : 
                          notam.category === 'warning' ? 'bg-orange-600 text-white' : `${colors.accent} text-white`
                        }`}>{notam.id}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mb-1">{notam.title}</h4>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-medium mb-3">{notam.content}</p>
                      
                      {notam.raw && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Raw Message</p>
                          <p className="text-[10px] font-mono text-slate-400 bg-black/30 p-2 rounded-lg break-words leading-tight">
                            {notam.raw}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40 py-20">
            <svg className="w-16 h-16 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-relaxed">Sin NOTAMs críticos reportados para esta área</p>
          </div>
        )}

        {sources.length > 0 && (
          <div className="pt-6 border-t border-slate-800 pb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Fuentes Consultadas</h3>
            <div className="space-y-2">
              {sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800 transition-colors group">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  <span className="text-[10px] font-bold text-slate-400 truncate group-hover:text-white transition-colors">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
