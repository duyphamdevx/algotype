// Code Comparison & Diff Engine for AlgoType
// Compares user typed C++ code against target template and provides side-by-side diff & metrics

export function normalizeLine(line) {
  return line
    .replace(/\/\/.*$/, '') // remove single-line comments
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/\s*([{}();,+=\-*/%&|<>!?:])\s*/g, '$1') // normalize around operators
    .trim();
}

// Compute Levenshtein distance similarity between two strings
export function stringSimilarity(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const n = s1.length;
  const m = s2.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const dist = dp[n][m];
  return Math.max(0, 1 - dist / Math.max(n, m));
}

// Line-by-line Diff alignment
export function compareCode(userCode, targetCode) {
  const userLines = userCode.split('\n');
  const targetLines = targetCode.split('\n');

  const normUser = userLines.map(normalizeLine);
  const normTarget = targetLines.map(normalizeLine);

  // Filter out empty lines for core similarity calculation
  const nonEmptyTarget = normTarget.filter(l => l.length > 0);
  const nonEmptyUser = normUser.filter(l => l.length > 0);

  let matchedTokens = 0;
  const targetUsed = new Set();

  for (let u = 0; u < nonEmptyUser.length; u++) {
    const uLine = nonEmptyUser[u];
    let bestMatchIdx = -1;
    let bestSim = 0;

    for (let t = 0; t < nonEmptyTarget.length; t++) {
      if (targetUsed.has(t)) continue;
      const tLine = nonEmptyTarget[t];
      const sim = stringSimilarity(uLine, tLine);
      if (sim > bestSim) {
        bestSim = sim;
        bestMatchIdx = t;
      }
    }

    if (bestSim >= 0.75 && bestMatchIdx !== -1) {
      targetUsed.add(bestMatchIdx);
      matchedTokens += bestSim;
    }
  }

  const accuracy = Math.min(100, Math.round((matchedTokens / Math.max(1, nonEmptyTarget.length)) * 100));

  // Build aligned diff rows
  const maxLines = Math.max(userLines.length, targetLines.length);
  const diffRows = [];

  for (let i = 0; i < maxLines; i++) {
    const uText = userLines[i] ?? null;
    const tText = targetLines[i] ?? null;

    let status = 'neutral';
    if (uText !== null && tText !== null) {
      const normU = normalizeLine(uText);
      const normT = normalizeLine(tText);
      if (normU === normT && normU.length > 0) {
        status = 'match';
      } else if (normU.length === 0 && normT.length === 0) {
        status = 'empty';
      } else {
        const sim = stringSimilarity(normU, normT);
        status = sim >= 0.6 ? 'modified' : 'different';
      }
    } else if (uText !== null && tText === null) {
      status = 'added';
    } else if (uText === null && tText !== null) {
      status = 'missing';
    }

    diffRows.push({
      lineNum: i + 1,
      userText: uText,
      targetText: tText,
      status
    });
  }

  return {
    accuracy,
    userLineCount: userLines.length,
    targetLineCount: targetLines.length,
    matchedLinesCount: targetUsed.size,
    diffRows
  };
}

// Fallback intelligent rule-based heuristic review (if server / AI is unreachable)
export function getLocalHeuristicAnalysis(algoTitle, userCode, targetCode, accuracy) {
  const userLower = userCode.toLowerCase();
  const potentialBugs = [];

  // Check long long vs int
  if (targetCode.includes('long long') && !userCode.includes('long long') && !userLower.includes('int64')) {
    potentialBugs.push('Code mẫu sử dụng kiểu "long long" để tránh tràn số, nhưng code của bạn có thể đang dùng int thông thường.');
  }

  // Check modulo edge cases
  if (targetCode.includes('% MOD') || targetCode.includes('%MOD') || targetCode.includes('MOD1')) {
    if (!userCode.includes('%') || !userLower.includes('mod')) {
      potentialBugs.push('Thuật toán liên quan đến số học modulo nhưng chưa thấy phép tính lấy dư % MOD hoặc khai báo hằng số MOD.');
    }
    if (userCode.includes('-') && !userCode.includes('+ MOD') && !userCode.includes('+MOD')) {
      potentialBugs.push('Lưu ý khi thực hiện phép trừ theo modulo (A - B) % MOD, nếu kết quả âm cần cộng thêm MOD trước khi lấy dư: (A - B % MOD + MOD) % MOD.');
    }
  }

  // Check boundary condition on segment tree or binary search
  if (userLower.includes('query') && userLower.includes('update')) {
    if (!userCode.includes('ql') && !userCode.includes('qr') && !userCode.includes('l > r')) {
      potentialBugs.push('Kiểm tra kỹ điều kiện dừng truy vấn đoạn (đoạn con nằm ngoài khoảng hoặc hoàn toàn nằm trong khoảng).');
    }
  }

  // Check priority_queue in Dijkstra
  if (algoTitle.toLowerCase().includes('dijkstra') || targetCode.includes('priority_queue')) {
    if (userCode.includes('priority_queue') && !userCode.includes('greater')) {
      potentialBugs.push('priority_queue trong C++ mặc định là Max-Heap. Trong Dijkstra cần dùng "greater<...>" để tạo Min-Heap lấy khoảng cách nhỏ nhất.');
    }
  }

  let correctness = 'Đúng chuẩn';
  if (accuracy >= 85) {
    correctness = potentialBugs.length === 0 ? 'Đúng chuẩn' : 'Cơ bản đúng, có điểm cần lưu ý';
  } else if (accuracy >= 60) {
    correctness = 'Cơ bản đúng, có điểm cần lưu ý';
  } else {
    correctness = 'Chưa hoàn chỉnh hoặc chưa đúng bản chất thuật toán';
  }

  let advice = '';
  if (accuracy >= 90) {
    advice = 'Phản xạ rất tốt! Bạn đã nắm vững cấu trúc template chuẩn. Hãy duy trì tốc độ gõ ổn định.';
  } else if (accuracy >= 70) {
    advice = 'Khung sườn thuật toán đã hình thành tốt. Hãy chú ý các biến phụ trợ và điều kiện biên của vòng lặp/đệ quy.';
  } else {
    advice = 'Hãy đọc kỹ lại code mẫu và tự nhẩm các bước cốt lõi (khởi tạo, cập nhật, truy vấn) trước khi gõ lại lần nữa.';
  }

  return {
    score: Math.min(100, Math.max(accuracy, potentialBugs.length === 0 ? accuracy : accuracy - 5)),
    summary: `Bạn đã hoàn thành bài gõ với độ tương đồng thuật toán ước tính đạt ${accuracy}%. ${correctness}.`,
    correctness,
    potentialBugs,
    advice
  };
}
