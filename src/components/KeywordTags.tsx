import React from 'react';
import { Language, translations } from '../i18n/translations.ts';
import { Tag } from 'lucide-react';

interface KeywordTagsProps {
  lang: Language;
  onTagClick?: (tag: string) => void;
}

export const KeywordTags: React.FC<KeywordTagsProps> = ({ lang, onTagClick }) => {
  const t = translations[lang].keywords;

  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-sky-600" />
        <span className="text-xs sm:text-sm font-bold text-slate-800">
          {t.title}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {t.tags.map((tag, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onTagClick?.(tag)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 text-xs sm:text-sm transition-colors text-left"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
