// View: Thi thử bấm giờ (Mock Contest 180 phút)
// Đếm ngược 180 phút (lưu trạng thái tab), tự chấm điểm trên 400 và lưu lịch sử

import { store } from '../store.js';
import { PAST_PROBLEMS } from '../../data/problems.js';

export function renderMockView(container) {
  let timerInterval = null;

  function render() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const activeMock = store.getActiveMock();

    if (activeMock) {
      renderActiveMock(activeMock);
    } else {
      renderMockLobby();
    }
  }

  // --- LOBBY: SELECT CONTEST & VIEW HISTORY ---
  function renderMockLobby() {
    const pastMocks = store.db.mocks || [];

    // Group past exam editions
    const contests = [
      { id: 'lan34', title: 'Đề thi chính thức Lần 34 (Năm 2025)', lan: 34 },
      { id: 'lan33', title: 'Đề thi chính thức Lần 33 (Năm 2024)', lan: 33 },
      { id: 'lan32', title: 'Đề thi chính thức Lần 32 (Năm 2023)', lan: 32 },
      { id: 'lan31', title: 'Đề thi chính thức Lần 31 (Năm 2022)', lan: 31 },
      { id: 'lan30', title: 'Đề thi chính thức Lần 30 (Năm 2022)', lan: 30 },
      { id: 'lan29', title: 'Đề thi chính thức Lần 29 (Năm 2020)', lan: 29 }
    ];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Thi Thử Bấm Giờ (180 Phút)</h2>
            <p class="text-sm text-slate-600 mt-1">
              Mô phỏng áp lực phòng thi Olympic Tin học Sinh viên: 4 bài, đếm ngược 180 phút, chiến thuật tối ưu subtask và tự chấm trên 400 điểm.
            </p>
          </div>
          <div class="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded text-xs text-blue-900 font-medium">
            Đã thi thử: <strong class="font-mono text-sm">${pastMocks.length}</strong> lần
          </div>
        </div>

        <!-- Start New Mock Exam Card -->
        <div class="bg-white border-2 border-slate-300 rounded-lg p-6 space-y-4 shadow-xs">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="font-bold text-slate-900 text-lg">Bắt đầu một đợt thi thử mới</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Chọn một bộ đề thi chính thức gồm 4 bài. Đồng hồ sẽ chạy độc lập, đóng tab mở lại vẫn duy trì thời gian còn lại.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${contests
              .map(c => {
                const problems = PAST_PROBLEMS.filter(p => p.lan === c.lan);
                return `
                <div class="border border-slate-200 rounded p-4 hover:border-blue-700 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 text-base leading-snug">${c.title}</h4>
                    <div class="mt-2 text-xs text-slate-600 space-y-1">
                      ${problems
                        .map((p, idx) => `<div><strong>Bài ${idx + 1}:</strong> ${p.title} <span class="text-slate-400">(${p.tags.join(', ')})</span></div>`)
                        .join('')}
                    </div>
                  </div>
                  <button data-lan="${c.lan}" data-title="${c.title}" class="btn-start-contest-exam mt-4 w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded transition-colors cursor-pointer text-center">
                    Bắt đầu thi thử 180 phút
                  </button>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- History of Past Mocks -->
        <div class="bg-white border border-slate-300 rounded-lg p-6 space-y-4">
          <h3 class="font-bold text-slate-900 text-lg">Lịch sử các lần thi thử (${pastMocks.length})</h3>

          ${
            pastMocks.length === 0
              ? `<div class="text-slate-500 text-xs italic py-4 text-center">Bạn chưa hoàn thành đợt thi thử nào. Hãy chọn một đề thi phía trên để bắt đầu!</div>`
              : `
            <div class="space-y-3">
              ${pastMocks
                .map(
                  m => `
                <div class="border border-slate-200 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900 text-base">${m.examName}</span>
                      <span class="text-xs text-slate-500 font-mono">${m.date}</span>
                    </div>
                    <div class="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      ${m.perProblem
                        .map(
                          (p, idx) => {
                            const probObj = PAST_PROBLEMS.find(item => item.id === p.id);
                            return `<span>Bài ${idx + 1} (${probObj?.title || p.id}): <strong class="text-blue-900">${p.score}/100</strong> (${p.minutes}p)</span>`;
                          }
                        )
                        .join('')}
                    </div>
                  </div>
                  <div class="text-right sm:border-l sm:pl-6 shrink-0">
                    <div class="text-xs text-slate-500">Tổng điểm</div>
                    <div class="text-2xl font-bold font-mono ${m.totalScore >= 300 ? 'text-emerald-700' : m.totalScore >= 200 ? 'text-blue-900' : 'text-slate-800'}">
                      ${m.totalScore}/400
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">${m.durationMin} phút</div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
            `
          }
        </div>
      </div>
    `;

    // Start contest button binding
    container.querySelectorAll('.btn-start-contest-exam').forEach(btn => {
      btn.addEventListener('click', () => {
        const lan = Number(btn.getAttribute('data-lan'));
        const examName = btn.getAttribute('data-title');
        const problemIds = PAST_PROBLEMS.filter(p => p.lan === lan).map(p => p.id);

        if (confirm(`Bạn đã sẵn sàng bước vào phòng thi thử 180 phút với đề "${examName}"?`)) {
          store.startMockSession({ examName, problemIds });
          render();
        }
      });
    });
  }

  // --- ACTIVE MOCK SESSION SCREEN ---
  function renderActiveMock(session) {
    const elapsedMs = Date.now() - session.startTime;
    let remainingMs = Math.max(0, session.durationMs - elapsedMs);

    const problems = session.problemIds.map(id => PAST_PROBLEMS.find(p => p.id === id)).filter(Boolean);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Floating sticky Timer & Submit Bar -->
        <div class="bg-blue-950 text-white rounded-lg p-4 sticky top-16 z-30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-0.5">
            <div class="text-xs text-blue-200">Đang thi thử trực tiếp:</div>
            <h3 class="font-bold text-lg text-white leading-tight">${session.examName}</h3>
          </div>

          <div class="flex items-center gap-6">
            <!-- Digital Countdown -->
            <div class="text-center">
              <div class="text-[10px] uppercase tracking-wider text-blue-300">Thời gian còn lại</div>
              <div id="countdown-display" class="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                ${formatTime(remainingMs)}
              </div>
            </div>

            <!-- Score tally -->
            <div class="text-center border-l border-blue-800 pl-4">
              <div class="text-[10px] uppercase tracking-wider text-blue-300">Tự chấm hiện tại</div>
              <div id="live-total-score" class="text-2xl sm:text-3xl font-mono font-bold text-white">
                0/400
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <button id="btn-finish-mock" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors cursor-pointer shadow-xs">
                Nộp bài & Kết thúc
              </button>
              <button id="btn-cancel-mock" class="px-2.5 py-2 bg-blue-900 hover:bg-rose-900 text-blue-200 hover:text-white text-xs rounded transition-colors cursor-pointer" title="Hủy buổi thi">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- 4 Problems Cards -->
        <div class="space-y-6">
          ${problems
            .map((p, idx) => {
              const currentScore = session.scores[p.id] ?? '';
              const currentMinutes = session.minutes[p.id] ?? '';
              const currentNote = session.notes[p.id] ?? '';

              return `
              <div class="bg-white border-2 border-slate-300 rounded-lg p-5 space-y-4 shadow-xs">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b pb-3">
                  <div>
                    <div class="text-xs font-bold text-blue-900">BÀI ${idx + 1} (100 ĐIỂM)</div>
                    <h4 class="text-xl font-bold text-slate-900">${p.title}</h4>
                    <div class="flex flex-wrap gap-1 mt-1 text-xs">
                      ${p.tags.map(t => `<span class="bg-slate-100 px-2 py-0.5 rounded text-slate-700">${t}</span>`).join('')}
                      ${p.techniques.map(tc => `<span class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded">${tc}</span>`).join('')}
                    </div>
                  </div>

                  <!-- Per-Problem Inputs -->
                  <div class="flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-200">
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 uppercase">Điểm đạt (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        data-prob-id="${p.id}"
                        class="input-prob-score w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-sm focus:outline-blue-700"
                        placeholder="Điểm"
                        value="${currentScore}"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-600 uppercase">Phút đã làm</label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        data-prob-id="${p.id}"
                        class="input-prob-min w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-sm focus:outline-blue-700"
                        placeholder="Phút"
                        value="${currentMinutes}"
                      />
                    </div>
                  </div>
                </div>

                <!-- Subtasks Guidance -->
                <div class="bg-slate-50 p-3 rounded text-xs space-y-1.5 border border-slate-200">
                  <div class="font-bold text-slate-700">Subtask & Chiến thuật lấy điểm:</div>
                  ${p.subtasks
                    .map(
                      st => `
                    <div class="flex items-start gap-2 text-slate-700">
                      <span class="font-mono font-bold text-blue-900 w-12 shrink-0">${st.pct}% điểm:</span>
                      <span class="leading-relaxed">${st.desc}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>

                <!-- Notes for this problem during contest -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Ghi chú chiến thuật & Lỗi gặp phải trong bài này:</label>
                  <textarea
                    rows="2"
                    data-prob-id="${p.id}"
                    class="textarea-prob-note w-full p-2 border border-slate-300 rounded text-xs focus:outline-blue-700"
                    placeholder="Ghi lại các ca test đặc biệt, mẹo tránh TLE, lý do mất điểm..."
                  >${currentNote}</textarea>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;

    // Live update total score helper
    function updateLiveScore() {
      let sum = 0;
      container.querySelectorAll('.input-prob-score').forEach(input => {
        sum += Number(input.value || 0);
      });
      const el = container.querySelector('#live-total-score');
      if (el) el.textContent = `${sum}/400`;
    }

    updateLiveScore();

    // Timer Loop
    timerInterval = setInterval(() => {
      const nowRemaining = Math.max(0, session.durationMs - (Date.now() - session.startTime));
      const el = container.querySelector('#countdown-display');
      if (el) el.textContent = formatTime(nowRemaining);

      if (nowRemaining <= 0) {
        clearInterval(timerInterval);
        alert('ĐÃ HẾT 180 PHÚT! Vui lòng hoàn thành việc tự chấm điểm và nộp bài.');
      }
    }, 1000);

    // Save inputs continuously to localStorage
    container.querySelectorAll('.input-prob-score').forEach(input => {
      input.addEventListener('input', () => {
        const pId = input.getAttribute('data-prob-id');
        store.updateMockProgress({ scores: { [pId]: input.value } });
        updateLiveScore();
      });
    });

    container.querySelectorAll('.input-prob-min').forEach(input => {
      input.addEventListener('input', () => {
        const pId = input.getAttribute('data-prob-id');
        store.updateMockProgress({ minutes: { [pId]: input.value } });
      });
    });

    container.querySelectorAll('.textarea-prob-note').forEach(input => {
      input.addEventListener('input', () => {
        const pId = input.getAttribute('data-prob-id');
        store.updateMockProgress({ notes: { [pId]: input.value } });
      });
    });

    // Finish exam
    container.querySelector('#btn-finish-mock')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn nộp bài và kết thúc đợt thi thử này?')) {
        clearInterval(timerInterval);
        const record = store.finishMockSession();
        alert(`Chúc mừng bạn đã hoàn thành đợt thi thử!\nTổng điểm: ${record.totalScore}/400 điểm.`);
        render();
      }
    });

    // Cancel exam
    container.querySelector('#btn-cancel-mock')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn hủy bỏ đợt thi thử này mà không lưu kết quả?')) {
        clearInterval(timerInterval);
        store.cancelMockSession();
        render();
      }
    });
  }

  function formatTime(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  render();
}
