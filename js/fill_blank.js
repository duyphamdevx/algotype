// Fill-in-the-blank Engine (Chế độ Điền khuyết)
// Extracts explicit «...» blanks, or auto-generates blanks on ~30% of loop/operator lines

export function parseFillBlanks(code, autoGenerate = false) {
  const explicitRegex = /«([^»]+)»/g;
  const hasExplicit = explicitRegex.test(code);

  if (hasExplicit) {
    let index = 0;
    const blanks = [];
    const parts = [];
    let lastIdx = 0;

    code.replace(explicitRegex, (match, answer, offset) => {
      parts.push({ type: 'text', text: code.slice(lastIdx, offset) });
      const blankId = `blank_${index++}`;
      blanks.push({ id: blankId, answer: answer.trim() });
      parts.push({ type: 'blank', id: blankId, answer: answer.trim() });
      lastIdx = offset + match.length;
      return match;
    });

    if (lastIdx < code.length) {
      parts.push({ type: 'text', text: code.slice(lastIdx) });
    }

    return { parts, blanks, isAuto: false };
  }

  if (autoGenerate) {
    // Automatically select ~30% of significant lines (lines with for, while, return, or key assignments)
    const lines = code.split('\n');
    const blanks = [];
    const parts = [];
    let blankIndex = 0;

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      const isSignificant =
        trimmed.length > 5 &&
        (trimmed.startsWith('for') ||
          trimmed.startsWith('while') ||
          trimmed.includes('return') ||
          trimmed.includes('+=') ||
          trimmed.includes('^=') ||
          trimmed.includes('min(') ||
          trimmed.includes('max(') ||
          trimmed.includes('push('));

      // Pick approx 30% deterministically based on lineIdx
      if (isSignificant && (lineIdx % 3 === 1)) {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        const core = line.slice(indent.length);

        parts.push({ type: 'text', text: indent });
        const blankId = `blank_auto_${blankIndex++}`;
        blanks.push({ id: blankId, answer: core.trim() });
        parts.push({ type: 'blank', id: blankId, answer: core.trim() });
        parts.push({ type: 'text', text: '\n' });
      } else {
        parts.push({ type: 'text', text: line + (lineIdx < lines.length - 1 ? '\n' : '') });
      }
    });

    return { parts, blanks, isAuto: true };
  }

  // No blanks
  return { parts: [{ type: 'text', text: code }], blanks: [], isAuto: false };
}
