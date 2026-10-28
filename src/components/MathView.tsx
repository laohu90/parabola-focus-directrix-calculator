import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.error('KaTeX render error:', err);
      return `<span class="text-rose-600 font-mono text-xs">${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-1 text-slate-900 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block text-slate-900 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text containing inline LaTeX math expressions delimited by $ ... $.
 * Formats inline math with KaTeX, eliminating raw LaTeX tokens and line overlap/ghosting.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const segments = useMemo(() => {
    if (!text) return [];
    // Split by $...$
    return text.split(/(\$[^$]+\$)/g);
  }, [text]);

  return (
    <span className={`inline leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
          const rawMath = seg.slice(1, -1);
          let html = '';
          try {
            html = katex.renderToString(rawMath, {
              displayMode: false,
              throwOnError: false,
              strict: false
            });
          } catch {
            html = `<span>${rawMath}</span>`;
          }
          return (
            <span
              key={idx}
              className="inline-block px-1 align-baseline font-normal text-slate-900"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <span key={idx}>{seg}</span>;
      })}
    </span>
  );
};
