// Typing Core Engine, Key Handling & Side-by-Side Diff Engine

export class TypingEngine {
  constructor({ targetCode, mode = 'recall', autoIndent = true, onUpdate, onComplete }) {
    this.targetCode = targetCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    this.mode = mode; // 'copy' | 'recall'
    this.autoIndent = autoIndent;
    this.onUpdate = onUpdate || (() => {});
    this.onComplete = onComplete || (() => {});

    this.pos = 0;
    this.errors = 0;
    this.startTime = null;
    this.endTime = null;
    this.usedHint = false;
    this.hintRevealedUntil = 0;
    this.fullCodeRevealed = false;
    this.isCompleted = false;
    this.lastError = false;

    // Skip any initial leading whitespace if required, or start at 0
    this.advanceAutoIndentIfNeeded();
  }

  handleKeyDown(e) {
    if (this.isCompleted) return;

    // ESC Key: Reveal 12 characters hint in Recall mode
    if (e.key === 'Escape') {
      e.preventDefault();
      this.revealHint(12);
      this.triggerUpdate();
      return;
    }

    // Ignore standalone modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }

    // Backspace: clear error or step back
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.lastError) {
        this.lastError = false;
        this.triggerUpdate();
        return;
      }
      if (this.pos > 0) {
        this.pos--;
        // If we backed into indentation right after a newline, back up through leading indent
        while (
          this.pos > 0 &&
          (this.targetCode[this.pos] === ' ' || this.targetCode[this.pos] === '\t') &&
          this.targetCode[this.pos - 1] !== '\n'
        ) {
          this.pos--;
        }
        this.lastError = false;
        this.triggerUpdate();
      }
      return;
    }

    // Tab Key: Skip through indentation spaces or tab
    if (e.key === 'Tab') {
      e.preventDefault();
      this.handleTabKey();
      return;
    }

    // Enter Key
    if (e.key === 'Enter') {
      e.preventDefault();
      this.processChar('\n');
      return;
    }

    // Regular single character input
    if (e.key.length === 1) {
      e.preventDefault();
      this.processChar(e.key);
    }
  }

  processChar(char) {
    if (this.pos >= this.targetCode.length) return;

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const expectedChar = this.targetCode[this.pos];

    if (char === expectedChar) {
      this.pos++;
      this.lastError = false;

      // If user typed Enter, apply auto-indent if enabled
      if (char === '\n' && this.autoIndent) {
        this.advanceAutoIndentIfNeeded();
      }

      // Check if finished
      if (this.pos >= this.targetCode.length) {
        this.finish();
        return;
      }
    } else {
      // Incorrect keystroke: cursor stays still, error counted
      this.errors++;
      this.lastError = true;
    }

    this.triggerUpdate();
  }

  handleTabKey() {
    if (this.pos >= this.targetCode.length) return;

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const expected = this.targetCode[this.pos];

    // If expected is tab
    if (expected === '\t') {
      this.pos++;
      this.lastError = false;
    } else if (expected === ' ') {
      // Advance through consecutive spaces up to 4 spaces
      let skipped = 0;
      while (this.pos < this.targetCode.length && this.targetCode[this.pos] === ' ' && skipped < 4) {
        this.pos++;
        skipped++;
      }
      this.lastError = false;
    } else {
      // Tab pressed when not expecting whitespace: count error
      this.errors++;
      this.lastError = true;
    }

    if (this.pos >= this.targetCode.length) {
      this.finish();
      return;
    }

    this.triggerUpdate();
  }

  advanceAutoIndentIfNeeded() {
    if (!this.autoIndent) return;
    // Automatically skip leading spaces/tabs if at file start or right after a newline
    if (this.pos === 0 || (this.pos > 0 && this.targetCode[this.pos - 1] === '\n')) {
      while (
        this.pos < this.targetCode.length &&
        (this.targetCode[this.pos] === ' ' || this.targetCode[this.pos] === '\t')
      ) {
        this.pos++;
      }
    }
  }

  getLineAndCol(index = this.pos) {
    const textBefore = this.targetCode.slice(0, index);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return { line, col };
  }

  revealHint(charCount = 12) {
    this.usedHint = true;
    this.hintRevealedUntil = Math.min(this.targetCode.length, this.pos + charCount);
  }

  revealFullCode() {
    this.usedHint = true;
    this.fullCodeRevealed = true;
    this.triggerUpdate();
  }

  getMetrics() {
    const elapsedMs = this.endTime ? (this.endTime - this.startTime) : (this.startTime ? (Date.now() - this.startTime) : 0);
    const elapsedMinutes = elapsedMs / 60000;
    const typedChars = this.pos;
    const wpm = elapsedMinutes > 0 ? Math.round((typedChars / 5) / elapsedMinutes) : 0;
    const totalKeystrokes = typedChars + this.errors;
    const acc = totalKeystrokes > 0 ? Math.max(0, Math.round((typedChars / totalKeystrokes) * 100)) : 100;

    return {
      wpm,
      acc,
      errors: this.errors,
      pos: this.pos,
      total: this.targetCode.length,
      elapsedMs,
      usedHint: this.usedHint || this.fullCodeRevealed
    };
  }

  finish() {
    this.isCompleted = true;
    this.endTime = Date.now();
    this.triggerUpdate();
    this.onComplete(this.getMetrics());
  }

  triggerUpdate() {
    this.onUpdate({
      ...this.getMetrics(),
      lastError: this.lastError,
      isCompleted: this.isCompleted,
      pos: this.pos,
      hintRevealedUntil: this.hintRevealedUntil,
      fullCodeRevealed: this.fullCodeRevealed
    });
  }
}

// Side-by-side line diff computation for Variant Drills
export function computeSideBySideDiff(userCode, solutionCode) {
  const userLines = (userCode || '').replace(/\r\n/g, '\n').split('\n');
  const solutionLines = (solutionCode || '').replace(/\r\n/g, '\n').split('\n');

  // Simple Longest Common Subsequence line diff
  const n = userLines.length;
  const m = solutionLines.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (userLines[i].trim() === solutionLines[j].trim()) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to form aligned pairs
  let i = n, j = m;
  const pairs = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userLines[i - 1].trim() === solutionLines[j - 1].trim()) {
      pairs.unshift({
        type: 'same',
        userLineNum: i,
        userText: userLines[i - 1],
        solLineNum: j,
        solText: solutionLines[j - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      pairs.unshift({
        type: 'sol_only',
        userLineNum: null,
        userText: '',
        solLineNum: j,
        solText: solutionLines[j - 1]
      });
      j--;
    } else {
      pairs.unshift({
        type: 'user_only',
        userLineNum: i,
        userText: userLines[i - 1],
        solLineNum: null,
        solText: ''
      });
      i--;
    }
  }

  let exactMatches = 0;
  pairs.forEach(p => {
    if (p.type === 'same') exactMatches++;
  });
  const similarityPct = Math.round((exactMatches / Math.max(1, pairs.length)) * 100);

  return { pairs, similarityPct };
}
