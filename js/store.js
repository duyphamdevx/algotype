// Data Store and State Management for AlgoType v2
// LocalStorage key: algotype-v2 (with automated non-destructive migration from algotype-v1)

import { BUILTIN_ALGOS } from '../data/builtins.js';
import { PAST_PROBLEMS } from '../data/problems.js';
import { BUILTIN_QA } from '../data/qa.js';
import { INITIAL_FORMULAS } from '../data/formulas.js';
import { STRESS_TEST_SNIPPETS } from '../data/stresstest.js';

export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30];

const V1_KEY = 'algotype-v1';
const V2_KEY = 'algotype-v2';

const INITIAL_SAMPLE_NOTES = [
  {
    id: "note_lucas_mod2",
    refType: "problem",
    refId: "olp33_p2",
    text: "XOR chỉ cần hệ số Pascal lẻ chẵn: C(n, k) lẻ <=> (n & k) == k (Định lý Lucas theo modulo 2). Mọi a XOR a = 0.",
    box: 1,
    last: Date.now() - 2 * 86400000,
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: "note_square_free",
    refType: "problem",
    refId: "olp34_p1",
    text: "LCM/GCD là số chính phương khi a·b là số chính phương <=> phần không chứa số chính phương (square-free part) của a và b bằng nhau.",
    box: 1,
    last: Date.now() - 2 * 86400000,
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: "note_fib_gcd",
    refType: "algo",
    refId: "matrix_exponentiation",
    text: "Hằng đẳng thức quan trọng: gcd(Fib(a), Fib(b)) = Fib(gcd(a, b)). Với MOD >= 10^18, phép nhân ma trận phải dùng __int128 mulmod.",
    box: 0,
    last: Date.now() - 86400000,
    createdAt: Date.now() - 86400000
  },
  {
    id: "note_dijkstra_spt",
    refType: "algo",
    refId: "dijkstra",
    text: "Cạnh e(u, v, w) thuộc ít nhất một đường đi ngắn nhất từ 1 tới N khi và chỉ khi: distS[u] + w + distT[v] == distS[N].",
    box: 2,
    last: Date.now() - 4 * 86400000,
    createdAt: Date.now() - 5 * 86400000
  },
  {
    id: "note_segtree_min_idx",
    refType: "algo",
    refId: "segtree_point_range",
    text: "Khi lưu pair<val, idx> trên Segment Tree: Nếu val bằng nhau thì ưu tiên chọn idx nhỏ hơn đứng trước để bảo toàn tính ổn định.",
    box: 1,
    last: Date.now() - 2 * 86400000,
    createdAt: Date.now() - 2 * 86400000
  }
];

const INITIAL_SAMPLE_MISTAKES = [
  {
    id: "mistake_1",
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    refId: "olp32_p1",
    category: "overflow",
    note: "Phép nhân (a * b) % MOD bị tràn số long long khi MOD > 2*10^9. Cần ép kiểu __int128 hoặc viết hàm mulmod.",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: "mistake_2",
    date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    refId: "olp30_p2",
    category: "edge_case",
    note: "Segment tree mảng vòng: quên xử lý trường hợp l > r khi query vắt ngang qua mút cuối mảng.",
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: "mistake_3",
    date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    refId: "olp33_p1",
    category: "mod_missing",
    note: "Sau khi trừ bao hàm loại trừ dp[i] - dp[j], kết quả bị âm nhưng quên +MOD trước khi % MOD.",
    createdAt: Date.now() - 86400000 * 5
  }
];

class Store {
  constructor() {
    this.db = this.initDB();
    this.listeners = [];
  }

  initDB() {
    try {
      const v2Data = localStorage.getItem(V2_KEY);
      if (v2Data) {
        const parsed = JSON.parse(v2Data);
        return this.validateAndNormalizeDB(parsed);
      }

      // Check v1 migration
      const v1Data = localStorage.getItem(V1_KEY);
      if (v1Data) {
        console.info('Migrating from algotype-v1 to algotype-v2...');
        const oldDB = JSON.parse(v1Data);
        const migrated = {
          version: 2,
          algos: [...JSON.parse(JSON.stringify(BUILTIN_ALGOS)), ...JSON.parse(JSON.stringify(STRESS_TEST_SNIPPETS))],
          custom: Array.isArray(oldDB.custom) ? oldDB.custom : [],
          stats: oldDB.stats || {},
          hist: Array.isArray(oldDB.hist) ? oldDB.hist : [],
          set: Object.assign({
            auto: true,
            mode: 'recall',
            fs: 14,
            last: 'segtree_point_range',
            examDate: '2026-12-10',
            dailyGoalAlgos: 3,
            dailyGoalProblems: 1
          }, oldDB.set || {}),
          notes: INITIAL_SAMPLE_NOTES,
          problemStates: {},
          mistakes: INITIAL_SAMPLE_MISTAKES,
          qa: JSON.parse(JSON.stringify(BUILTIN_QA)),
          formulas: JSON.parse(JSON.stringify(INITIAL_FORMULAS)),
          mocks: [],
          activeMock: null
        };

        if (Array.isArray(oldDB.custom)) {
          oldDB.custom.forEach(c => {
            if (!migrated.algos.some(a => a.id === c.id)) {
              migrated.algos.push(c);
            }
          });
        }

        PAST_PROBLEMS.forEach(p => {
          if (p.notesDefault) {
            migrated.notes.push({
              id: `note_${p.id}`,
              refType: 'problem',
              refId: p.id,
              text: p.notesDefault,
              box: 0,
              last: Date.now() - 86400000,
              createdAt: Date.now()
            });
          }
        });

        localStorage.setItem(V2_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) {
      console.error('Error loading DB from localStorage:', e);
    }

    const freshDB = {
      version: 2,
      algos: [...JSON.parse(JSON.stringify(BUILTIN_ALGOS)), ...JSON.parse(JSON.stringify(STRESS_TEST_SNIPPETS))],
      custom: [],
      stats: {},
      hist: [],
      set: {
        auto: true,
        mode: 'recall',
        fs: 14,
        last: 'segtree_point_range',
        examDate: '2026-12-10',
        dailyGoalAlgos: 3,
        dailyGoalProblems: 1
      },
      notes: [...INITIAL_SAMPLE_NOTES],
      problemStates: {},
      mistakes: [...INITIAL_SAMPLE_MISTAKES],
      qa: JSON.parse(JSON.stringify(BUILTIN_QA)),
      formulas: JSON.parse(JSON.stringify(INITIAL_FORMULAS)),
      mocks: [],
      activeMock: null
    };

    PAST_PROBLEMS.forEach(p => {
      if (p.notesDefault && !freshDB.notes.some(n => n.refId === p.id)) {
        freshDB.notes.push({
          id: `note_${p.id}`,
          refType: 'problem',
          refId: p.id,
          text: p.notesDefault,
          box: 0,
          last: Date.now() - 86400000,
          createdAt: Date.now()
        });
      }
    });

    this.save(freshDB);
    return freshDB;
  }

  validateAndNormalizeDB(data) {
    if (!data.version) data.version = 2;

    if (!Array.isArray(data.algos) || data.algos.length === 0) {
      data.algos = [...JSON.parse(JSON.stringify(BUILTIN_ALGOS)), ...JSON.parse(JSON.stringify(STRESS_TEST_SNIPPETS))];
      if (Array.isArray(data.custom)) {
        data.custom.forEach(c => {
          if (!data.algos.some(a => a.id === c.id)) {
            data.algos.push(c);
          }
        });
      }
    }

    // Ensure stress snippets exist
    STRESS_TEST_SNIPPETS.forEach(snip => {
      if (!data.algos.some(a => a.id === snip.id)) {
        data.algos.push(snip);
      }
    });

    // Propagate Vietnamese titles (titleVi) from builtins to existing saved data
    const builtinMap = new Map();
    BUILTIN_ALGOS.forEach(b => builtinMap.set(b.id, b));
    STRESS_TEST_SNIPPETS.forEach(s => builtinMap.set(s.id, s));
    if (Array.isArray(data.algos)) {
      data.algos.forEach(a => {
        const b = builtinMap.get(a.id);
        if (b && b.titleVi) {
          a.titleVi = b.titleVi;
        }
      });
    }

    if (!Array.isArray(data.custom)) data.custom = [];
    if (!data.stats || typeof data.stats !== 'object') data.stats = {};
    if (!Array.isArray(data.hist)) data.hist = [];
    if (!data.set || typeof data.set !== 'object') {
      data.set = {
        auto: true,
        mode: 'recall',
        fs: 14,
        last: 'segtree_point_range',
        examDate: '2026-12-10',
        dailyGoalAlgos: 3,
        dailyGoalProblems: 1
      };
    }
    if (!data.set.examDate) data.set.examDate = '2026-12-10';
    if (!data.set.dailyGoalAlgos) data.set.dailyGoalAlgos = 3;
    if (!data.set.dailyGoalProblems) data.set.dailyGoalProblems = 1;

    if (!Array.isArray(data.notes)) data.notes = [];
    if (!data.problemStates || typeof data.problemStates !== 'object') data.problemStates = {};
    if (!Array.isArray(data.mistakes)) data.mistakes = [];
    if (!data.qa || typeof data.qa !== 'object') {
      data.qa = JSON.parse(JSON.stringify(BUILTIN_QA));
    }
    if (!Array.isArray(data.formulas) || data.formulas.length === 0) {
      data.formulas = JSON.parse(JSON.stringify(INITIAL_FORMULAS));
    }
    if (!Array.isArray(data.mocks)) data.mocks = [];

    data.algos.forEach(a => {
      if (!data.stats[a.id]) {
        data.stats[a.id] = { box: 0, last: 0, runs: 0, bw: 0, bt: 0 };
      }
    });

    return data;
  }

  save(data = this.db) {
    try {
      this.db = data;
      localStorage.setItem(V2_KEY, JSON.stringify(this.db));
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.db);
      } catch (e) {
        console.error('Error in store subscriber:', e);
      }
    }
  }

  // --- Algorithm CRUD (Add / Edit / Delete Any Algorithm on Web) ---
  getAllAlgos() {
    return this.db.algos || [];
  }

  getAlgoById(id) {
    return (this.db.algos || []).find(a => a.id === id) || null;
  }

  addCustomAlgo(algo) {
    const id = 'custom_' + Date.now();
    const newAlgo = {
      id,
      title: algo.title.trim(),
      titleVi: (algo.titleVi || algo.title).trim(),
      tag: algo.tag.trim() || 'Custom',
      code: algo.code
    };
    this.db.algos.push(newAlgo);
    this.db.stats[id] = { box: 0, last: 0, runs: 0, bw: 0, bt: 0 };
    this.save();
    return newAlgo;
  }

  updateAlgo(id, { title, titleVi, tag, code }) {
    const idx = (this.db.algos || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      this.db.algos[idx] = {
        ...this.db.algos[idx],
        title: title.trim(),
        titleVi: (titleVi !== undefined ? titleVi : (this.db.algos[idx].titleVi || title)).trim(),
        tag: tag.trim() || 'General',
        code: code
      };
      this.save();
      return true;
    }
    return false;
  }

  deleteAlgo(id) {
    this.db.algos = (this.db.algos || []).filter(a => a.id !== id);
    delete this.db.stats[id];
    delete this.db.qa[id];
    this.db.notes = this.db.notes.filter(n => !(n.refType === 'algo' && n.refId === id));
    this.save();
  }

  resetToDefaultAlgos() {
    this.db.algos = [...JSON.parse(JSON.stringify(BUILTIN_ALGOS)), ...JSON.parse(JSON.stringify(STRESS_TEST_SNIPPETS))];
    this.db.qa = JSON.parse(JSON.stringify(BUILTIN_QA));
    this.save();
  }

  // Import from a .cpp file with delimiters like // [ALGO: title | tag] or // === title ===
  importCppSnippets(cppContent) {
    const lines = cppContent.split('\n');
    const imported = [];
    let curTitle = '';
    let curTag = 'General';
    let curCodeLines = [];

    const saveCurrent = () => {
      if (curTitle && curCodeLines.length > 0) {
        const code = curCodeLines.join('\n').trim();
        if (code) {
          const id = 'cpp_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          const algo = { id, title: curTitle, tag: curTag, code };
          this.db.algos.push(algo);
          this.db.stats[id] = { box: 0, last: 0, runs: 0, bw: 0, bt: 0 };
          imported.push(algo);
        }
      }
      curTitle = '';
      curTag = 'General';
      curCodeLines = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Check marker: // [ALGO: Title | Tag]
      const markerMatch = trimmed.match(/^\/\/\s*\[ALGO:\s*([^\|\]]+)(?:\|\s*([^\]]+))?\]/i);
      // Or check marker: // === Title ===
      const separatorMatch = trimmed.match(/^\/\/\s*===\s*([^=]+)\s*===/);

      if (markerMatch) {
        saveCurrent();
        curTitle = markerMatch[1].trim();
        curTag = markerMatch[2] ? markerMatch[2].trim() : 'General';
      } else if (separatorMatch) {
        saveCurrent();
        curTitle = separatorMatch[1].trim();
        curTag = 'General';
      } else {
        if (curTitle) {
          curCodeLines.push(line);
        }
      }
    }
    saveCurrent();

    // If no delimiter was found, import entire file as a single snippet
    if (imported.length === 0 && cppContent.trim()) {
      const id = 'cpp_imp_' + Date.now();
      const algo = {
        id,
        title: 'Snippet nhập từ file C++',
        tag: 'Imported',
        code: cppContent.trim()
      };
      this.db.algos.push(algo);
      this.db.stats[id] = { box: 0, last: 0, runs: 0, bw: 0, bt: 0 };
      imported.push(algo);
    }

    this.save();
    return imported;
  }

  // Record typing run outcome and update Leitner box
  recordTypingRun({ id, mode, wpm, acc, usedHint }) {
    const now = Date.now();
    if (!this.db.stats[id]) {
      this.db.stats[id] = { box: 0, last: 0, runs: 0, bw: 0, bt: 0 };
    }
    const stat = this.db.stats[id];
    stat.runs = (stat.runs || 0) + 1;
    stat.bw = Math.max(stat.bw || 0, wpm);
    stat.bt = now;

    if (mode === 'recall') {
      if (acc >= 95 && !usedHint) {
        stat.box = Math.min(5, (stat.box || 0) + 1);
      } else {
        stat.box = Math.max(0, (stat.box || 0) - 1);
      }
      stat.last = now;
    } else {
      if (stat.box === 0 && acc >= 90) {
        stat.box = 1;
        stat.last = now;
      }
    }

    this.db.hist.push({
      d: new Date(now).toISOString().slice(0, 10),
      id,
      mode,
      wpm,
      acc
    });

    if (this.db.hist.length > 500) {
      this.db.hist = this.db.hist.slice(-500);
    }

    this.save();
  }

  // --- Spaced Repetition Due Checks ---
  isDue(box, lastTimestamp) {
    if (!lastTimestamp) return true;
    const intervalDays = LEITNER_INTERVALS[Math.min(5, Math.max(0, box || 0))];
    const msInterval = intervalDays * 86400000;
    return (Date.now() - lastTimestamp) >= msInterval;
  }

  getDueAlgos() {
    const all = this.getAllAlgos();
    return all.filter(a => {
      const st = this.db.stats[a.id] || { box: 0, last: 0 };
      return this.isDue(st.box, st.last);
    });
  }

  getDueNotes() {
    return (this.db.notes || []).filter(note => {
      return this.isDue(note.box, note.last);
    });
  }

  // --- Key Notes ---
  addNote({ refType, refId, text }) {
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      refType,
      refId,
      text: text.trim(),
      box: 0,
      last: 0,
      createdAt: Date.now()
    };
    this.db.notes.push(newNote);
    this.save();
    return newNote;
  }

  rateNoteReview(noteId, remembered) {
    const note = this.db.notes.find(n => n.id === noteId);
    if (note) {
      if (remembered) {
        note.box = Math.min(5, (note.box || 0) + 1);
      } else {
        note.box = 0;
      }
      note.last = Date.now();
      this.save();
    }
  }

  deleteNote(noteId) {
    this.db.notes = this.db.notes.filter(n => n.id !== noteId);
    this.save();
  }

  getNotesForRef(refType, refId) {
    return (this.db.notes || []).filter(n => n.refType === refType && n.refId === refId);
  }

  // --- Self-Check Questions & Answers ---
  getQAForAlgo(algoId) {
    return (this.db.qa && this.db.qa[algoId]) || [];
  }

  addQAForAlgo(algoId, { q, a }) {
    if (!this.db.qa) this.db.qa = {};
    if (!this.db.qa[algoId]) this.db.qa[algoId] = [];
    this.db.qa[algoId].push({ q: q.trim(), a: a.trim(), status: 'user_created' });
    this.save();
  }

  approveQA(algoId, qIndex) {
    if (this.db.qa && this.db.qa[algoId] && this.db.qa[algoId][qIndex]) {
      this.db.qa[algoId][qIndex].status = 'user_approved';
      this.save();
    }
  }

  // --- Quick Formula Handbook (Feature 14) ---
  getFormulas() {
    return this.db.formulas || [];
  }

  addFormula({ title, category, latex, description, example, cppSnippet }) {
    const newF = {
      id: 'formula_' + Date.now(),
      title: title.trim(),
      category: category.trim() || 'Số học',
      latex: latex.trim(),
      description: description.trim(),
      example: (example || '').trim(),
      cppSnippet: (cppSnippet || '').trim()
    };
    if (!Array.isArray(this.db.formulas)) this.db.formulas = [];
    this.db.formulas.push(newF);
    this.save();
    return newF;
  }

  deleteFormula(id) {
    this.db.formulas = (this.db.formulas || []).filter(f => f.id !== id);
    this.save();
  }

  // --- Past Exam Problems State ---
  getProblemState(problemId) {
    return this.db.problemStates[problemId] || {
      status: 'unsolved',
      userNote: '',
      updatedAt: 0
    };
  }

  setProblemState(problemId, { status, userNote }) {
    const prev = this.getProblemState(problemId);
    this.db.problemStates[problemId] = {
      status: status !== undefined ? status : prev.status,
      userNote: userNote !== undefined ? userNote : prev.userNote,
      updatedAt: Date.now()
    };
    this.save();
  }

  // --- Mistakes ---
  addMistake({ category, note, refId, date }) {
    const newMistake = {
      id: 'mistake_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: date || new Date().toISOString().slice(0, 10),
      refId: refId || '',
      category: category || 'impl_bug',
      note: note.trim(),
      createdAt: Date.now()
    };
    this.db.mistakes.unshift(newMistake);
    this.save();
    return newMistake;
  }

  deleteMistake(id) {
    this.db.mistakes = this.db.mistakes.filter(m => m.id !== id);
    this.save();
  }

  getWeeklyMistakeStats() {
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const weeklyCounts = {};
    const totalCounts = {};

    (this.db.mistakes || []).forEach(m => {
      const cat = m.category || 'other';
      totalCounts[cat] = (totalCounts[cat] || 0) + 1;
      if (m.createdAt >= oneWeekAgo) {
        weeklyCounts[cat] = (weeklyCounts[cat] || 0) + 1;
      }
    });

    return { weeklyCounts, totalCounts };
  }

  // --- Mock Contest ---
  startMockSession({ examName, problemIds }) {
    const session = {
      id: 'mock_' + Date.now(),
      examName,
      problemIds,
      startTime: Date.now(),
      durationMs: 180 * 60 * 1000,
      scores: {},
      minutes: {},
      notes: {},
      isFinished: false
    };
    this.db.activeMock = session;
    this.save();
    return session;
  }

  getActiveMock() {
    return this.db.activeMock || null;
  }

  updateMockProgress({ scores, minutes, notes }) {
    if (!this.db.activeMock) return;
    if (scores) this.db.activeMock.scores = Object.assign(this.db.activeMock.scores, scores);
    if (minutes) this.db.activeMock.minutes = Object.assign(this.db.activeMock.minutes, minutes);
    if (notes) this.db.activeMock.notes = Object.assign(this.db.activeMock.notes, notes);
    this.save();
  }

  finishMockSession() {
    if (!this.db.activeMock) return null;
    const session = this.db.activeMock;
    session.isFinished = true;
    session.endTime = Date.now();

    let totalScore = 0;
    const perProblem = session.problemIds.map(pId => {
      const score = Number(session.scores[pId] || 0);
      totalScore += score;
      return {
        id: pId,
        score,
        minutes: Number(session.minutes[pId] || 0),
        note: session.notes[pId] || ''
      };
    });

    const record = {
      id: session.id,
      date: new Date(session.startTime).toISOString().slice(0, 10),
      examName: session.examName,
      durationMin: Math.round((session.endTime - session.startTime) / 60000),
      totalScore,
      perProblem
    };

    if (!Array.isArray(this.db.mocks)) this.db.mocks = [];
    this.db.mocks.unshift(record);
    this.db.activeMock = null;
    this.save();
    return record;
  }

  cancelMockSession() {
    this.db.activeMock = null;
    this.save();
  }

  // --- Settings & Backup ---
  updateSettings(newSet) {
    this.db.set = Object.assign(this.db.set, newSet);
    this.save();
  }

  exportBackupJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.db, null, 2));
    const dlAnchor = document.createElement('a');
    const filename = `algotype_v2_backup_${new Date().toISOString().slice(0, 10)}.json`;
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', filename);
    dlAnchor.click();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = this.validateAndNormalizeDB(parsed);
      this.save(validated);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const store = new Store();
