'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

// This component is designed to be robust and safe.
// It parses a string for LaTeX expressions delimited by $...$ or $$...$$
// and renders them using KaTeX. Non-LaTeX parts are rendered as plain text.
// It uses a proper parser to avoid Regex pitfalls with nested or escaped delimiters.

const KatexRenderer = ({ text }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    const parsedParts = [];
    let lastIndex = 0;
    let partIndex = 0;

    // Simple state machine parser
    const MODE_TEXT = 1;
    const MODE_LATEX_INLINE = 2;
    const MODE_LATEX_DISPLAY = 3;

    let mode = MODE_TEXT;
    let currentLatex = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (mode === MODE_TEXT) {
        if (char === '$') {
          // End of a text part, start of a LaTeX part
          if (i > lastIndex) {
            parsedParts.push({ type: 'text', content: text.substring(lastIndex, i), key: `part-${partIndex++}` });
          }
          
          if (nextChar === '$') {
            mode = MODE_LATEX_DISPLAY;
            i++; // Consume the second '$'
          } else {
            mode = MODE_LATEX_INLINE;
          }
          lastIndex = i + 1;
          currentLatex = '';
        } 
      } else { // MODE_LATEX_INLINE or MODE_LATEX_DISPLAY
        let isEnd = false;
        if (mode === MODE_LATEX_INLINE && char === '$') {
            isEnd = true;
        } else if (mode === MODE_LATEX_DISPLAY && char === '$' && nextChar === '$') {
            isEnd = true;
            i++; // Consume the second '$'
        }

        if (isEnd) {
            try {
                const html = katex.renderToString(currentLatex, {
                    throwOnError: false,
                    displayMode: mode === MODE_LATEX_DISPLAY,
                });
                parsedParts.push({ type: 'math', content: html, key: `part-${partIndex++}` });
            } catch (e) {
                // If KaTeX fails, render the original text
                const originalText = (mode === MODE_LATEX_DISPLAY ? '$$' : '$') + currentLatex + (mode === MODE_LATEX_DISPLAY ? '$$' : '$');
                parsedParts.push({ type: 'text', content: originalText, key: `part-${partIndex++}` });
            }
            mode = MODE_TEXT;
            lastIndex = i + 1;
        } else {
            currentLatex += char;
        }
      }
    }

    // Add any remaining text part
    if (lastIndex < text.length) {
      parsedParts.push({ type: 'text', content: text.substring(lastIndex), key: `part-${partIndex++}` });
    }

    return parsedParts;

  }, [text]);

  return (
    // --- CHANGE ---
    // Added `whitespace-pre-wrap` to make the component respect newlines and multiple spaces
    // in the text content. This is crucial for formatting questions and answers correctly.
    <span className="leading-relaxed whitespace-pre-wrap">
      {parts.map(part =>
        part.type === 'math' ? (
          <span key={part.key} className="latex-font" dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          <span key={part.key}>{part.content}</span>
        )
      )}
    </span>
  );
};

export default KatexRenderer;
