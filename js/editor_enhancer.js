// C++ IDE Smart Keybindings & Behavior for AlgoType
// Features: Auto-close pairs (), [], {}, "", '', Smart Enter, Backspace pair delete, Tab/Shift-Tab indent, Line comment toggle

export function attachCppEditorBehavior(textarea, { onChange, onCursorMove, onSubmit }) {
  if (!textarea) return;

  const PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'"
  };

  const CLOSING_CHARS = new Set([')', ']', '}', '"', "'"]);

  textarea.addEventListener('keydown', e => {
    // 1. Submit on Ctrl + Enter / Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) onSubmit();
      return;
    }

    // 2. Toggle comment Ctrl + / or Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      toggleComment();
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // 3. Tab and Shift + Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Unindent
        handleUnindent();
      } else {
        if (start === end) {
          // Insert 4 spaces
          const spaces = '    ';
          textarea.value = val.substring(0, start) + spaces + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
          triggerChange();
        } else {
          // Block indent
          handleBlockIndent();
        }
      }
      return;
    }

    // 4. Smart Enter between { and }
    if (e.key === 'Enter') {
      const prevChar = val[start - 1];
      const nextChar = val[end];

      // Find current line indent
      const lastNl = val.lastIndexOf('\n', start - 1);
      const curLine = val.substring(lastNl + 1, start);
      const indentMatch = curLine.match(/^\s*/);
      const baseIndent = indentMatch ? indentMatch[0] : '';

      if (prevChar === '{' && nextChar === '}') {
        e.preventDefault();
        const innerIndent = baseIndent + '    ';
        const insertText = '\n' + innerIndent + '\n' + baseIndent;
        textarea.value = val.substring(0, start) + insertText + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1 + innerIndent.length;
        triggerChange();
        return;
      }

      // Standard auto-indent
      e.preventDefault();
      let nextIndent = baseIndent;
      if (/[\{\:]\s*$/.test(curLine)) {
        nextIndent += '    ';
      }
      const insertText = '\n' + nextIndent;
      textarea.value = val.substring(0, start) + insertText + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      triggerChange();
      return;
    }

    // 5. Smart Backspace pair deletion
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = val[start - 1];
      const charAfter = val[start];
      if (
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'")
      ) {
        e.preventDefault();
        textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
        textarea.selectionStart = textarea.selectionEnd = start - 1;
        triggerChange();
        return;
      }
    }

    // 6. Overtype closing character
    if (CLOSING_CHARS.has(e.key) && start === end) {
      const charAfter = val[start];
      if (charAfter === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        if (onCursorMove) onCursorMove();
        return;
      }
    }

    // 7. Auto-pairing opening brackets & quotes (with text wrapping support)
    if (PAIRS[e.key]) {
      e.preventDefault();
      const open = e.key;
      const close = PAIRS[open];

      if (start !== end) {
        // Wrap selected text
        const selected = val.substring(start, end);
        const wrapped = open + selected + close;
        textarea.value = val.substring(0, start) + wrapped + val.substring(end);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
      } else {
        // Insert pair and put cursor in middle
        textarea.value = val.substring(0, start) + open + close + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }
      triggerChange();
      return;
    }
  });

  function triggerChange() {
    if (onChange) onChange(textarea.value);
    if (onCursorMove) onCursorMove();
  }

  function handleBlockIndent() {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEndIdx = val.indexOf('\n', end);
    const lineEnd = lineEndIdx === -1 ? val.length : lineEndIdx;

    const block = val.substring(lineStart, lineEnd);
    const lines = block.split('\n');
    const indented = lines.map(l => '    ' + l).join('\n');

    textarea.value = val.substring(0, lineStart) + indented + val.substring(lineEnd);
    textarea.selectionStart = start + 4;
    textarea.selectionEnd = end + lines.length * 4;
    triggerChange();
  }

  function handleUnindent() {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEndIdx = val.indexOf('\n', end);
    const lineEnd = lineEndIdx === -1 ? val.length : lineEndIdx;

    const block = val.substring(lineStart, lineEnd);
    const lines = block.split('\n');
    let removedChars = 0;
    const unindented = lines
      .map(l => {
        if (l.startsWith('    ')) {
          removedChars += 4;
          return l.substring(4);
        } else if (l.startsWith('  ')) {
          removedChars += 2;
          return l.substring(2);
        } else if (l.startsWith(' ')) {
          removedChars += 1;
          return l.substring(1);
        }
        return l;
      })
      .join('\n');

    textarea.value = val.substring(0, lineStart) + unindented + val.substring(lineEnd);
    textarea.selectionStart = Math.max(lineStart, start - 4);
    textarea.selectionEnd = Math.max(lineStart, end - removedChars);
    triggerChange();
  }

  function toggleComment() {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEndIdx = val.indexOf('\n', end);
    const lineEnd = lineEndIdx === -1 ? val.length : lineEndIdx;

    const block = val.substring(lineStart, lineEnd);
    const lines = block.split('\n');

    const allCommented = lines.every(l => l.trim().startsWith('//') || l.trim().length === 0);
    const newLines = lines.map(l => {
      if (allCommented) {
        return l.replace(/^(\s*)\/\/\s?/, '$1');
      } else {
        return l.trim().length > 0 ? '// ' + l : l;
      }
    });

    const replaced = newLines.join('\n');
    textarea.value = val.substring(0, lineStart) + replaced + val.substring(lineEnd);
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replaced.length;
    triggerChange();
  }
}
