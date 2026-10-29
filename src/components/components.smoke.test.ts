/**
 * Render-Smoke-Tests ohne Browser: prüfen, dass die neuen Komponenten fehlerfrei rendern
 * und zentrale Texte/ARIA-Attribute enthalten. (Interaktion testet der Tester im Browser/Tablet.)
 */
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { pythagoras } from '../content/pythagoras';
import { ChoiceInput, MathInput, NumericInput, toPreviewLatex } from './AnswerInputs';
import { FeedbackPanel } from './FeedbackPanel';
import { emptyHistory } from './handwriting/canvasModel';
import { HandwritingCanvas } from './handwriting/HandwritingCanvas';
import { ProgressBar } from './ProgressBar';
import { ScoreBadge } from './ScoreBadge';
import { SolutionView } from './SolutionView';
import { StatusBadge } from './StatusBadge';

const noop = () => {};

describe('Komponenten rendern', () => {
  it('StatusBadge zeigt deutsche Labels für alle Status', () => {
    expect(renderToStaticMarkup(h(StatusBadge, { status: 'not_started' }))).toContain('Nicht begonnen');
    expect(renderToStaticMarkup(h(StatusBadge, { status: 'in_progress' }))).toContain('In Bearbeitung');
    expect(renderToStaticMarkup(h(StatusBadge, { status: 'needs_practice' }))).toContain('Übung erforderlich');
    expect(renderToStaticMarkup(h(StatusBadge, { status: 'mastered' }))).toContain('Sicher beherrscht');
  });

  it('ProgressBar begrenzt Werte und setzt ARIA', () => {
    const html = renderToStaticMarkup(h(ProgressBar, { value: 1.7, label: 'Test' }));
    expect(html).toContain('aria-valuenow="100"');
    expect(renderToStaticMarkup(h(ProgressBar, { value: Number.NaN }))).toContain('aria-valuenow="0"');
  });

  it('ScoreBadge nutzt scoreBand', () => {
    expect(renderToStaticMarkup(h(ScoreBadge, { score: 85 }))).toContain('Weitgehend sicher');
    expect(renderToStaticMarkup(h(ScoreBadge, { score: 10 }))).toContain('Grundlagen aufbauen');
  });

  it('FeedbackPanel zeigt Urteil, Markierungen und typische Fehler', () => {
    const html = renderToStaticMarkup(
      h(FeedbackPanel, {
        verdict: 'incorrect',
        points: 0,
        feedback: 'Falsch',
        marks: [{ color: 'red', message: 'Falsch' }],
        mistake: 'Kathete verwechselt',
        commonMistakes: [{ description: 'Kathete verwechselt', feedback: 'Achte auf den rechten Winkel' }],
      }),
    );
    expect(html).toContain('Noch nicht richtig');
    expect(html).toContain('Typischer Fehler erkannt');
    expect(html).toContain('Achte auf den rechten Winkel');
  });

  it('SolutionView rendert Schritte mit KaTeX', () => {
    const html = renderToStaticMarkup(h(SolutionView, { solution: pythagoras.subtopics[0].exercises[1].solution }));
    expect(html).toContain('Musterlösung');
    expect(html).toContain('katex');
  });

  it('Eingaben je Typ rendern', () => {
    const ex = pythagoras.subtopics[0].exercises[0];
    expect(renderToStaticMarkup(h(ChoiceInput, { choices: ex.choices!, value: 'b', onChange: noop }))).toContain('aria-checked="true"');
    expect(renderToStaticMarkup(h(NumericInput, { id: 'n', value: '', onChange: noop, unit: 'cm' }))).toContain('inputMode="decimal"');
    expect(renderToStaticMarkup(h(MathInput, { id: 'm', value: 'x^2', onChange: noop, label: 'Antwort' }))).toContain('Vorschau');
  });

  it('HandwritingCanvas rendert Werkzeugleiste und sperrt Scrollen', () => {
    const html = renderToStaticMarkup(h(HandwritingCanvas, { history: emptyHistory(), onChange: noop }));
    for (const label of ['Stift', 'Linie', 'Radierer', 'Rückgängig', 'Wiederholen', 'Alles löschen', 'Vergrößern']) expect(html).toContain(label);
    expect(html).toContain('touch-action:none');
  });

  it('toPreviewLatex wandelt gängige Schreibweisen', () => {
    expect(toPreviewLatex('sqrt(16) * 3²')).toBe('\\sqrt{16} \\cdot  3^2');
    expect(toPreviewLatex('20%')).toBe('20\\%');
  });
});
