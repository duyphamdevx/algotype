// Loose Matcher for C++ Code (So khớp lỏng)
// Strips comments, normalizes whitespace, tokenizes C++, and validates bijective 1-to-1 variable renaming

const CPP_KEYWORDS = new Set([
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
  'bool', 'break', 'case', 'catch', 'char', 'char16_t', 'char32_t', 'class',
  'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype', 'default',
  'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export',
  'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
  'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr',
  'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register',
  'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static',
  'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this',
  'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
  'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t',
  'while', 'xor', 'xor_eq'
]);

const STANDARD_SYMBOLS = new Set([
  'std', 'cin', 'cout', 'endl', 'vector', 'pair', 'queue', 'priority_queue',
  'stack', 'deque', 'set', 'map', 'unordered_set', 'unordered_map', 'bitset',
  'string', 'min', 'max', 'swap', 'abs', 'iota', 'fill', 'memset', 'memcpy',
  'push', 'pop', 'top', 'front', 'back', 'size', 'empty', 'clear', 'resize',
  'assign', 'begin', 'end', 'rbegin', 'rend', 'first', 'second', 'make_pair',
  'greater', 'less', 'ios_base', 'tie', 'sqrt', 'pow', 'log', 'log2',
  '__builtin_popcount', '__builtin_popcountll', '__builtin_ctz', '__builtin_ctzll',
  '__builtin_clz', '__builtin_clzll', '__int128', '__uint128_t', 'bits/stdc++.h'
]);

// Strip C++ comments (single line // and multi-line /* ... */)
export function stripComments(code) {
  if (!code) return '';
  let out = '';
  let i = 0;
  const n = code.length;
  let inString = false;
  let stringChar = '';

  while (i < n) {
    if (inString) {
      out += code[i];
      if (code[i] === '\\' && i + 1 < n) {
        out += code[i + 1];
        i += 2;
        continue;
      }
      if (code[i] === stringChar) {
        inString = false;
      }
      i++;
      continue;
    }

    if (code[i] === '"' || code[i] === "'") {
      inString = true;
      stringChar = code[i];
      out += code[i];
      i++;
      continue;
    }

    // Single line comment
    if (code[i] === '/' && i + 1 < n && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }

    // Multi-line comment
    if (code[i] === '/' && i + 1 < n && code[i + 1] === '*') {
      i += 2;
      while (i + 1 < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    out += code[i];
    i++;
  }
  return out;
}

// Tokenize C++ code into typed tokens
export function tokenizeCpp(code) {
  const cleanCode = stripComments(code);
  const tokens = [];
  let i = 0;
  const n = cleanCode.length;

  const isAlpha = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const isDigit = c => c >= '0' && c <= '9';
  const isAlnum = c => isAlpha(c) || isDigit(c);

  // Multi-char operators ordered by length descending
  const MULTI_OPS = [
    '<<=', '>>=', '...', '->*',
    '==', '!=', '<=', '>=', '&&', '||', '<<', '>>', '++', '--', '+=', '-=',
    '*=', '/=', '%=', '&=', '|=', '^=', '->', '::'
  ];

  while (i < n) {
    const c = cleanCode[i];

    // Whitespace
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // Numbers (dec, hex, binary, exp)
    if (isDigit(c) || (c === '.' && i + 1 < n && isDigit(cleanCode[i + 1]))) {
      let num = '';
      while (i < n && (isAlnum(cleanCode[i]) || cleanCode[i] === '.' || cleanCode[i] === '\'')) {
        num += cleanCode[i];
        i++;
      }
      tokens.push({ type: 'number', text: num.toLowerCase() });
      continue;
    }

    // Identifiers or Keywords
    if (isAlpha(c)) {
      let ident = '';
      while (i < n && isAlnum(cleanCode[i])) {
        ident += cleanCode[i];
        i++;
      }
      if (CPP_KEYWORDS.has(ident)) {
        tokens.push({ type: 'keyword', text: ident });
      } else if (STANDARD_SYMBOLS.has(ident)) {
        tokens.push({ type: 'std_symbol', text: ident });
      } else {
        tokens.push({ type: 'identifier', text: ident });
      }
      continue;
    }

    // Multi-char operators
    let matchedOp = null;
    for (const op of MULTI_OPS) {
      if (cleanCode.startsWith(op, i)) {
        matchedOp = op;
        break;
      }
    }
    if (matchedOp) {
      tokens.push({ type: 'operator', text: matchedOp });
      i += matchedOp.length;
      continue;
    }

    // Single-char operators or delimiters
    tokens.push({ type: 'operator', text: c });
    i++;
  }

  return tokens;
}

// Compare two token lists with bijective 1-to-1 variable renaming
export function looseMatchCpp(userCode, solutionCode) {
  const userTokens = tokenizeCpp(userCode);
  const solTokens = tokenizeCpp(solutionCode);

  const solToUserMap = new Map();
  const userToSolMap = new Map();

  let matchedTokens = 0;
  const discrepancies = [];
  const minLen = Math.min(userTokens.length, solTokens.length);
  const maxLen = Math.max(userTokens.length, solTokens.length);

  for (let k = 0; k < minLen; k++) {
    const u = userTokens[k];
    const s = solTokens[k];

    // Exact match for keywords, standard symbols, numbers, operators
    if (s.type === 'keyword' || s.type === 'operator' || s.type === 'number' || s.type === 'std_symbol') {
      if (u.type === s.type && u.text === s.text) {
        matchedTokens++;
      } else {
        discrepancies.push({
          pos: k,
          expected: s.text,
          got: u.text,
          reason: `Từ khóa/Toán tử khác biệt (kỳ vọng "${s.text}", bạn dùng "${u.text}")`
        });
      }
      continue;
    }

    // User-defined identifier: validate bijective 1-to-1 mapping
    if (s.type === 'identifier') {
      if (u.type !== 'identifier') {
        discrepancies.push({
          pos: k,
          expected: s.text,
          got: u.text,
          reason: `Vị trí này kỳ vọng tên biến ("${s.text}"), nhưng nhận được "${u.text}"`
        });
        continue;
      }

      // Check current mapping
      const mappedUser = solToUserMap.get(s.text);
      const mappedSol = userToSolMap.get(u.text);

      if (!mappedUser && !mappedSol) {
        // Register new 1-to-1 mapping
        solToUserMap.set(s.text, u.text);
        userToSolMap.set(u.text, s.text);
        matchedTokens++;
      } else if (mappedUser === u.text && mappedSol === s.text) {
        // Consistently renamed
        matchedTokens++;
      } else {
        // Conflict in renaming
        discrepancies.push({
          pos: k,
          expected: `${s.text} (đã map thành ${mappedUser || 'chưa map'})`,
          got: `${u.text} (đã map từ ${mappedSol || 'chưa map'})`,
          reason: `Đổi tên biến không nhất quán: "${s.text}" đang được map sang "${mappedUser}", nhưng tại đây dùng "${u.text}"`
        });
      }
    }
  }

  // Handle remaining tokens if lengths differ
  if (userTokens.length > minLen) {
    for (let k = minLen; k < userTokens.length; k++) {
      discrepancies.push({
        pos: k,
        expected: '(Hết code)',
        got: userTokens[k].text,
        reason: `Mã của bạn có thêm token thừa: "${userTokens[k].text}"`
      });
    }
  } else if (solTokens.length > minLen) {
    for (let k = minLen; k < solTokens.length; k++) {
      discrepancies.push({
        pos: k,
        expected: solTokens[k].text,
        got: '(Thiếu)',
        reason: `Mã của bạn thiếu token kỳ vọng: "${solTokens[k].text}"`
      });
    }
  }

  const similarityPct = maxLen > 0 ? Math.round((matchedTokens / maxLen) * 100) : 100;

  // Convert map to friendly array
  const renamingList = [];
  solToUserMap.forEach((userVar, solVar) => {
    if (userVar !== solVar) {
      renamingList.push({ solVar, userVar });
    }
  });

  return {
    similarityPct,
    matchedTokens,
    totalExpectedTokens: solTokens.length,
    totalUserTokens: userTokens.length,
    renamingList,
    discrepancies: discrepancies.slice(0, 10), // Show top 10 discrepancies
    isStructurallyIdentical: discrepancies.length === 0 && userTokens.length === solTokens.length
  };
}
