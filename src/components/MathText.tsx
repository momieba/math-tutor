import katex from 'katex';
import { useMemo } from 'react';

/**
 * Rendert Text mit Inline-Mathematik in `$...$` (KaTeX). Inhalte stammen aus der geprüften Wissensbasis.
 * `display` rendert den gesamten String als abgesetzte Formel (ohne $).
 */
export function MathText({ text, display = false, className }: { text: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    if (display) return katex.renderToString(text, { displayMode: true, throwOnError: false });
    return text
      .split(/(\$[^$]+\$)/g)
      .map((part) =>
        part.startsWith('$') && part.endsWith('$') && part.length > 1
          ? katex.renderToString(part.slice(1, -1), { throwOnError: false })
          : escapeHtml(part),
      )
      .join('');
  }, [text, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
