// View: Màn hình "Ôn hôm nay" (Daily Spaced Repetition)
// Tích hợp Đếm ngược ngày thi, Mục tiêu hàng ngày (Feature 9), Code đến hạn & Điều then chốt

import { store, LEITNER_INTERVALS } from '../store.js';
import { PAST_PROBLEMS } from '../../data/problems.js';

export function renderTodayView(container, { onStartTyping, onOpenProblem }) {
  let activeSubTab = 'code';
  let currentFlashcardIndex = 0;
  let flashcardRevealed = false;

  function update() {
    const dueAlgos = store.getDueAlgos();
    const dueNotes = store.getDueNotes();
    const set = store.db.set || {};

    // Exam countdown math
    const examDateStr = set.examDate || '2026-12-10';
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Daily goal calculations
    const todayStr = new Date().toISOString().slice(0, 10);
    const runsToday = (store.db.hist || []).filter(h => h.d === todayStr).length;
    const goalAlgos = Number(set.dailyGoalAlgos || 3);
    const algoPct = Math.min(100, Math.round((runsToday / Math.max(1, goalAlgos)) * 100));

    // Problems marked solved today
    const solvedTodayCount = Object.values(store.db.problemStates || {}).filter(
      st => st.status === 'ac' && st.updatedAt && new Date(st.updatedAt).toISOString().slice(0, 10) === todayStr
    ).length;
    const goalProblems = Number(set.dailyGoalProblems || 1);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Feature 9: Countdown & Daily Goal Banner -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider text-blue-200 font-semibold">Đếm ngược kỳ thi Olympic Tin học:</span>
              <button id="btn-edit-exam-date" class="text-blue-300 hover:text-white text-xs underline cursor-pointer">
                (Đổi ngày: ${examDateStr})
              </button>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-extrabold font-mono text-amber-300">${daysRemaining}</span>
              <span class="text-lg font-medium text-blue-100">ngày còn lại để bứt phá</span>
            </div>
          </div>

          <!-- Daily Goals Progress -->
          <div class="bg-blue-950/60 border border-blue-700/50 rounded-lg p-3 sm:min-w-[280px] space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-blue-200 font-medium">Mục tiêu hôm nay:</span>
              <span class="font-mono text-amber-300 font-bold">${runsToday}/${goalAlgos} thuật toán · ${solvedTodayCount}/${goalProblems} bài</span>
            </div>
            <div class="w-full bg-blue-900/80 h-2 rounded-full overflow-hidden">
              <div class="bg-amber-400 h-full transition-all" style="width: ${algoPct}%"></div>
            </div>
            <div class="text-[11px] text-blue-300 flex justify-between">
              <span>Đạt ${algoPct}% tiến độ gõ code</span>
              <button id="btn-edit-goals" class="text-blue-200 hover:underline cursor-pointer">Sửa mục tiêu</button>
            </div>
          </div>
        </div>

        <!-- Header & Daily Summary -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Ôn tập hôm nay</h2>
            <p class="text-sm text-slate-600 mt-1">
              Chu kỳ lặp lại ngắt quãng (Spaced Repetition) Leitner 5 mức: [0, 1, 3, 7, 14, 30 ngày].
            </p>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-blue-900">
              <span class="font-semibold tabular-nums">${dueAlgos.length}</span> template code đến hạn
            </div>
            <div class="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-amber-900">
              <span class="font-semibold tabular-nums">${dueNotes.length}</span> điều then chốt
            </div>
          </div>
        </div>

        <!-- 2 Sub-Tabs Switcher -->
        <div class="flex items-center gap-2 border-b border-slate-200">
          <button id="tab-btn-code" class="px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === 'code'
              ? 'border-blue-800 text-blue-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }">
            Template code đến hạn (${dueAlgos.length})
          </button>
          <button id="tab-btn-notes" class="px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeSubTab === 'notes'
              ? 'border-blue-800 text-blue-900 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }">
            Điều then chốt đến hạn (${dueNotes.length})
          </button>
        </div>

        <!-- Tab 1: Overdue Code Templates -->
        <div id="subtab-content-code" class="${activeSubTab === 'code' ? 'block' : 'hidden'}">
          ${
            dueAlgos.length === 0
              ? `
            <div class="p-8 text-center bg-white/70 border border-slate-200 rounded-lg">
              <div class="text-emerald-700 font-semibold text-lg">Tuyệt vời! Đã hoàn thành ôn code hôm nay.</div>
              <p class="text-sm text-slate-500 mt-1">Không còn template nào đến hạn theo chu kỳ Leitner. Bạn có thể tự do luyện tập thêm ở tab "Luyện gõ template".</p>
            </div>
            `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${dueAlgos
                .map(algo => {
                  const stat = store.db.stats[algo.id] || { box: 0, last: 0, runs: 0, bw: 0 };
                  const daysInterval = LEITNER_INTERVALS[stat.box || 0];
                  return `
                  <div class="bg-white border border-slate-300 rounded p-4 hover:border-blue-600 transition-all flex flex-col justify-between shadow-xs">
                    <div>
                      <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span class="font-medium text-slate-700">${algo.tag}</span>
                        <span class="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          Mức ${stat.box}/5 (${daysInterval} ngày)
                        </span>
                      </div>
                      <h3 class="font-semibold text-slate-900 text-base leading-snug">${algo.titleVi || algo.title}</h3>
                      ${algo.titleVi && algo.titleVi !== algo.title ? `<div class="text-xs text-slate-500 font-mono mt-0.5">${algo.title}</div>` : ''}
                      <div class="mt-2 text-xs text-slate-500 space-y-0.5">
                        <div>Đã gõ: <span class="font-mono text-slate-700">${stat.runs || 0}</span> lần</div>
                        <div>Tốc độ tốt nhất: <span class="font-mono text-slate-700">${stat.bw || 0}</span> WPM</div>
                      </div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button data-algo-id="${algo.id}" data-mode="copy" class="btn-start-algo flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded transition-colors text-center cursor-pointer" title="Xem đầy đủ code mẫu để gõ theo">
                        Gõ Chép
                      </button>
                      <button data-algo-id="${algo.id}" data-mode="recall" class="btn-start-algo flex-1 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded transition-colors text-center cursor-pointer" title="Luyện gõ thuộc lòng để thăng hạng hộp Leitner">
                        Gõ Nhớ (Thi)
                      </button>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
            `
          }
        </div>

        <!-- Tab 2: Overdue Key Takeaways Flashcards -->
        <div id="subtab-content-notes" class="${activeSubTab === 'notes' ? 'block' : 'hidden'}">
          ${
            dueNotes.length === 0
              ? `
            <div class="p-8 text-center bg-white/70 border border-slate-200 rounded-lg">
              <div class="text-emerald-700 font-semibold text-lg">Đã ôn hết điều then chốt hôm nay!</div>
              <p class="text-sm text-slate-500 mt-1">Tất cả ghi chú tính chất bài toán đã được củng cố. Hãy bổ sung thêm ghi chú mới khi giải đề.</p>
            </div>
            `
              : `
            <div class="max-w-2xl mx-auto">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Thẻ số <strong class="text-slate-800">${currentFlashcardIndex + 1}</strong> trên <strong>${dueNotes.length}</strong></span>
                <span>Mức ghi nhớ: <strong class="text-slate-800">Hộp ${dueNotes[currentFlashcardIndex]?.box || 0}/5</strong></span>
              </div>

              <!-- Flashcard Component -->
              <div class="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm min-h-[260px] flex flex-col justify-between">
                <div>
                  ${(() => {
                    const note = dueNotes[currentFlashcardIndex];
                    if (!note) return '';
                    let refName = 'Ghi chú độc lập';
                    if (note.refType === 'problem') {
                      const p = PAST_PROBLEMS.find(item => item.id === note.refId);
                      refName = p ? `Bài đề: ${p.title} (Lần ${p.lan} - ${p.year})` : `Bài #${note.refId}`;
                    } else if (note.refType === 'algo') {
                      const a = store.getAlgoById(note.refId);
                      refName = a ? `Thuật toán: ${a.title}` : `Algo #${note.refId}`;
                    }
                    return `
                      <div class="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded inline-block mb-3">
                        ${refName}
                      </div>
                    `;
                  })()}

                  <div class="text-slate-600 text-sm italic mb-2">
                    ${flashcardRevealed ? 'Nội dung then chốt:' : 'Hãy tự nhẩm lại tính chất / bẫy / công thức then chốt của bài/thuật toán này trước khi lật thẻ:'}
                  </div>

                  <div class="mt-4 p-4 rounded text-base leading-relaxed ${
                    flashcardRevealed ? 'bg-amber-50/70 border border-amber-200 text-slate-900 font-medium' : 'bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-center py-8 select-none'
                  }">
                    ${flashcardRevealed ? dueNotes[currentFlashcardIndex].text : '••••• Bấm nút bên dưới để hiện đáp án •••••'}
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                  ${
                    !flashcardRevealed
                      ? `
                    <button id="btn-reveal-flashcard" class="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded text-sm transition-colors cursor-pointer">
                      Hiện điều then chốt (Space / Enter)
                    </button>
                    `
                      : `
                    <div class="flex items-center gap-3 w-full">
                      <button id="btn-rate-forgot" class="flex-1 py-2.5 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 font-medium rounded text-sm transition-colors cursor-pointer">
                        Chưa nhớ (Hạ về Hộp 0)
                      </button>
                      <button id="btn-rate-remembered" class="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded text-sm transition-colors cursor-pointer">
                        Đã nhớ (Lên Hộp ${Math.min(5, (dueNotes[currentFlashcardIndex]?.box || 0) + 1)})
                      </button>
                    </div>
                    `
                  }
                </div>
              </div>
            </div>
            `
          }
        </div>
      </div>
    `;

    // Bindings
    container.querySelector('#tab-btn-code')?.addEventListener('click', () => {
      activeSubTab = 'code';
      update();
    });
    container.querySelector('#tab-btn-notes')?.addEventListener('click', () => {
      activeSubTab = 'notes';
      flashcardRevealed = false;
      update();
    });

    container.querySelectorAll('.btn-start-algo').forEach(btn => {
      btn.addEventListener('click', () => {
        const algoId = btn.getAttribute('data-algo-id');
        const mode = btn.getAttribute('data-mode') || 'copy';
        onStartTyping(algoId, mode);
      });
    });

    container.querySelector('#btn-reveal-flashcard')?.addEventListener('click', () => {
      flashcardRevealed = true;
      update();
    });

    container.querySelector('#btn-rate-forgot')?.addEventListener('click', () => {
      const note = dueNotes[currentFlashcardIndex];
      if (note) {
        store.rateNoteReview(note.id, false);
      }
      flashcardRevealed = false;
      if (currentFlashcardIndex >= dueNotes.length - 1) {
        currentFlashcardIndex = 0;
      }
      update();
    });

    container.querySelector('#btn-rate-remembered')?.addEventListener('click', () => {
      const note = dueNotes[currentFlashcardIndex];
      if (note) {
        store.rateNoteReview(note.id, true);
      }
      flashcardRevealed = false;
      if (currentFlashcardIndex >= dueNotes.length - 1) {
        currentFlashcardIndex = 0;
      }
      update();
    });

    // Edit Exam Date
    container.querySelector('#btn-edit-exam-date')?.addEventListener('click', () => {
      const newDate = prompt('Nhập ngày thi dự kiến (định dạng YYYY-MM-DD):', examDateStr);
      if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        store.updateSettings({ examDate: newDate });
        update();
      }
    });

    // Edit Daily Goals
    container.querySelector('#btn-edit-goals')?.addEventListener('click', () => {
      const algos = prompt('Mục tiêu số thuật toán cần ôn mỗi ngày:', String(goalAlgos));
      const probs = prompt('Mục tiêu số bài đề cần giải mỗi ngày:', String(goalProblems));
      if (algos && !isNaN(algos) && probs && !isNaN(probs)) {
        store.updateSettings({
          dailyGoalAlgos: Number(algos),
          dailyGoalProblems: Number(probs)
        });
        update();
      }
    });
  }

  update();
}
