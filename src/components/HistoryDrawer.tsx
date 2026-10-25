import React, { useState } from 'react';
import { HistoryItem, clearHistory, toggleStarHistoryItem } from '../utils/historyManager.ts';
import { MathView } from './MathView.tsx';
import { Language } from '../i18n/translations.ts';
import { History, Star, Trash2, X, Clock, ArrowRight, Copy, Check } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: HistoryItem[];
  onSelectEquation: (equation: string) => void;
  onUpdateList: (newList: HistoryItem[]) => void;
  lang: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyList,
  onSelectEquation,
  onUpdateList,
  lang
}) => {
  if (!isOpen) return null;

  const t = {
    en: {
      title: 'Problem History & Bookmarks',
      empty: 'No solved problems yet. Solve equations to save them here!',
      clearAll: 'Clear History',
      loadBtn: 'Load',
      starred: 'Starred Only',
      all: 'All History'
    },
    zh: {
      title: '做题历史记录与收藏',
      empty: '暂无做题记录。求解任意方程后将自动保存在这里！',
      clearAll: '清空历史',
      loadBtn: '载入重解',
      starred: '仅看收藏',
      all: '全部记录'
    },
    es: {
      title: 'Historial de Ejercicios y Favoritos',
      empty: 'Aún no hay ejercicios guardados. ¡Resuelve ecuaciones para verlas aquí!',
      clearAll: 'Borrar Historial',
      loadBtn: 'Cargar',
      starred: 'Favoritos',
      all: 'Todo'
    },
    fr: {
      title: 'Historique des Problèmes & Favoris',
      empty: 'Aucun problème résolu pour le moment.',
      clearAll: 'Effacer l\'Historique',
      loadBtn: 'Charger',
      starred: 'Favoris',
      all: 'Tout'
    },
    pt: {
      title: 'Histórico de Exercícios e Favoritos',
      empty: 'Nenhum exercício salvo ainda.',
      clearAll: 'Limpar Histórico',
      loadBtn: 'Carregar',
      starred: 'Favoritos',
      all: 'Todos'
    }
  }[lang];

  const conicBadgeNames: Record<string, string> = {
    parabola: lang === 'zh' ? '抛物线' : 'Parabola',
    ellipse: lang === 'zh' ? '椭圆' : 'Ellipse',
    hyperbola: lang === 'zh' ? '双曲线' : 'Hyperbola'
  };

  const conicBadgeColors: Record<string, string> = {
    parabola: 'bg-sky-50 text-sky-700 border-sky-200',
    ellipse: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hyperbola: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleClear = () => {
    clearHistory();
    onUpdateList([]);
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = toggleStarHistoryItem(id);
    onUpdateList(updated);
  };

  const handleCopyItem = async (e: React.MouseEvent, eq: string, id: string) => {
    e.stopPropagation();
    let ok = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(eq);
        ok = true;
      } catch {
        // fallback
      }
    }
    if (!ok && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = eq;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p>{t.empty}</p>
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectEquation(item.equation);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer shadow-2xs group relative"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      conicBadgeColors[item.conicType] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {conicBadgeNames[item.conicType] || item.conicType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => handleCopyItem(e, item.equation, item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        copiedId === item.id
                          ? 'bg-emerald-100 text-emerald-700 font-bold'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={copiedId === item.id ? 'Copied!' : 'Copy equation'}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleToggleStar(e, item.id)}
                      className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-slate-100 rounded-md transition-colors"
                      title="Bookmark"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          item.starred ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="font-semibold text-slate-900 text-sm group-hover:text-sky-700">
                  <MathView math={item.equation} />
                </div>

                <div className="flex items-center justify-end gap-1 text-xs text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <span>{t.loadBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {historyList.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {historyList.length} {lang === 'zh' ? '条已存记录' : 'saved items'}
            </span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAll}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
