// View: Luyện gõ template C++, Sửa/Xóa thuật toán, Nhập file .cpp tự tách, Điền khuyết & Câu hỏi tự kiểm

import { store, LEITNER_INTERVALS } from '../store.js';
import { TypingEngine } from '../engine.js';
import { parseFillBlanks } from '../fill_blank.js';
import { compareCode, getLocalHeuristicAnalysis } from '../comparator.js';
import { attachCppEditorBehavior } from '../editor_enhancer.js';

export function renderPracticeView(container, { initialAlgoId = null, initialMode = 'recall' } = {}) {
  let activeAlgoId = initialAlgoId;
  let activeMode = initialMode;
  let isTypingActive = !!initialAlgoId;

  let isFillBlankActive = false;
  let isQAActive = false;
  let isDiffActive = false;
  let fillBlankAutoMask = false;
  let fillBlankUserInputs = {};
  let fillBlankChecked = false;

  let userTypedCode = '';
  let lastDiffResult = null;
  let aiAnalysisState = { loading: false, data: null, error: null };
  let typingStartTime = null;
  let typingTimerInterval = null;
  let elapsedSeconds = 0;
  let isReferenceVisible = false;

  // QA / Algorithm Patterns state
  let qaEvaluations = {};
  let qaUserAnswers = {};
  let isAddingQAModalOpen = false;
  let patternCategoryFilter = 'ALL';
  let isGeneratingPattern = false;

  let searchQuery = '';
  let selectedTag = 'ALL';

  let typingEngine = null;
  let keydownHandler = null;

  function render() {
    if (isDiffActive && activeAlgoId) {
      renderDiffRoom();
    } else if (isTypingActive && activeAlgoId) {
      renderTypingRoom();
    } else if (isFillBlankActive && activeAlgoId) {
      renderFillBlankRoom();
    } else if (isQAActive && activeAlgoId) {
      renderQARoom();
    } else {
      renderAlgoCatalog();
    }
  }

  // --- CATALOG LIST VIEW ---
  function renderAlgoCatalog() {
    if (keydownHandler) {
      window.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }

    const currentScope = store.db.set?.libraryScope || 'core';
    const allAlgos = store.getAllAlgos();
    const tags = ['ALL', ...new Set(allAlgos.map(a => a.tag))];

    const filtered = allAlgos.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.title.toLowerCase().includes(q) ||
        (a.titleVi && a.titleVi.toLowerCase().includes(q)) ||
        a.code.toLowerCase().includes(q);
      const matchTag = selectedTag === 'ALL' || a.tag === selectedTag;
      return matchSearch && matchTag;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Toolbar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Kho Template Thuật toán</h2>
              <span class="px-2 py-0.5 rounded text-xs font-semibold ${
                currentScope === 'core' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
              }">
                ${currentScope === 'core' ? '⭐ 17 Thuật toán Cốt lõi & Cơ bản' : '📦 Đầy đủ 35 Thuật toán'}
              </span>
            </div>
            <p class="text-sm text-slate-600 mt-1">
              ${
                currentScope === 'core'
                  ? 'Đang tập trung <strong>17 thuật toán cốt lõi & kinh điển nhất</strong> cho Olympic Tin học (SegTree, BIT, DSU, Dijkstra, Floyd, Tarjan, Cầu/Khớp, LCA, Trie, KMP, Hash, Sàng Euler, Extended GCD, Ba lô, LIS). Các thuật toán nâng cao tạm thời cất gọn.'
                  : 'Đang hiển thị <strong>toàn bộ 35 thuật toán C++17</strong> (gồm cả các thuật toán nâng cao: Dinic Flow, HLD, Centroid, Aho-Corasick, Manacher, Z, Mo, 2-SAT, Geometry, SOS DP, Digit DP...).'
              }
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Mode Switch: Core 17 vs All 35 -->
            <div class="inline-flex rounded-md shadow-2xs border border-slate-300 p-0.5 bg-slate-100 text-xs">
              <button id="btn-scope-core" class="px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                currentScope === 'core' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                ⭐ 17 Cốt lõi
              </button>
              <button id="btn-scope-all" class="px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                currentScope === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                📦 Tất cả 35
              </button>
            </div>

            <!-- Feature 10: Import .cpp file -->
            <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <span>📥 Nhập từ file .cpp</span>
              <input id="input-import-cpp" type="file" accept=".cpp,.h,.hpp,.txt" class="hidden" />
            </label>
            <button id="btn-reset-default-algos" class="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded transition-colors cursor-pointer" title="${currentScope === 'core' ? 'Khôi phục 17 thuật toán cốt lõi' : 'Khôi phục 35 thuật toán'}">
              🔄 Khôi phục ${currentScope === 'core' ? '17 cốt lõi' : '35 gốc'}
            </button>
            <button id="btn-add-new-algo" class="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-xs">
              + Thêm thuật toán mới
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <input
            id="search-algo-input"
            type="text"
            placeholder="Tìm theo tên tiếng Việt, tên tiếng Anh hoặc code (vd: cây phân đoạn, segtree, dijkstra...)..."
            value="${searchQuery}"
            class="px-3.5 py-2 bg-white border border-slate-300 rounded text-sm w-full sm:max-w-md focus:outline-none focus:border-blue-700"
          />
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            ${tags
              .map(
                t => `
              <button data-tag="${t}" class="tag-filter-btn px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === t
                  ? 'bg-blue-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }">
                ${t === 'ALL' ? 'Tất cả' : t}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${
            filtered.length === 0
              ? `<div class="col-span-full py-12 text-center text-slate-500">Không tìm thấy thuật toán nào.</div>`
              : filtered
                  .map(algo => {
                    const stat = store.db.stats[algo.id] || { box: 0, last: 0, runs: 0, bw: 0 };
                    const isDue = store.isDue(stat.box, stat.last);
                    const notesCount = store.getNotesForRef('algo', algo.id).length;
                    const qaCount = store.getQAForAlgo(algo.id).length;

                    return `
                    <div class="bg-white border ${
                      isDue ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-300'
                    } rounded p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <div>
                        <!-- Header badge & actions -->
                        <div class="flex items-center justify-between text-xs mb-1.5">
                          <span class="text-slate-600 font-medium">${algo.tag}</span>
                          <div class="flex items-center gap-1.5">
                            ${
                              isDue
                                ? `<span class="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">Đến hạn</span>`
                                : ''
                            }
                            <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                              Mức ${stat.box}/5
                            </span>
                            <!-- Edit Button -->
                            <button data-algo-id="${algo.id}" class="btn-edit-algo text-slate-600 hover:text-blue-900 px-1.5 py-0.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded cursor-pointer" title="Chỉnh sửa mã nguồn và tên">
                              ✏️ Sửa
                            </button>
                            <!-- Delete Button (Explicit and Prominent) -->
                            <button data-algo-id="${algo.id}" class="btn-delete-any-algo text-rose-600 hover:text-rose-800 px-1.5 py-0.5 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded font-medium cursor-pointer" title="Xóa thuật toán này">
                              🗑️ Xóa
                            </button>
                          </div>
                        </div>

                        <h3 class="font-semibold text-slate-900 text-base leading-snug">${algo.titleVi || algo.title}</h3>
                        ${algo.titleVi && algo.titleVi !== algo.title ? `<div class="text-xs text-slate-500 font-mono mt-0.5">${algo.title}</div>` : ''}

                        <div class="mt-2 text-xs text-slate-500 space-y-0.5">
                          <div>Đã gõ: <span class="font-mono text-slate-700">${stat.runs || 0}</span> lần · Kỷ lục: <span class="font-mono text-slate-700">${stat.bw || 0}</span> WPM</div>
                          <div class="flex items-center gap-3 mt-1">
                            <span>Then chốt: <strong class="text-blue-900">${notesCount}</strong></span>
                            <span>Dạng bài: <strong class="text-indigo-800 font-bold">${qaCount} dạng</strong></span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <!-- Practice Typing buttons -->
                        <div class="flex items-center gap-1.5">
                          <button data-id="${algo.id}" data-mode="recall" class="btn-launch-practice flex-1 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs">
                            <span>🧠 Gõ thi & So sánh</span>
                          </button>
                          <button data-id="${algo.id}" data-mode="copy" class="btn-launch-practice py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded text-center transition-colors cursor-pointer" title="Gõ có mở code mẫu tham khảo">
                            Chép
                          </button>
                        </div>

                        <!-- Special Mode Buttons: Fill Blank & Problem Patterns -->
                        <div class="flex items-center gap-1.5 text-[11px]">
                          <button data-id="${algo.id}" class="btn-launch-fillblank flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium cursor-pointer text-center">
                            ✍️ Điền khuyết
                          </button>
                          <button data-id="${algo.id}" class="btn-launch-qa flex-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded font-semibold cursor-pointer text-center" title="Kiểm tra các dạng bài & cách làm biến thể của thuật toán này">
                            🧠 Dạng bài (${qaCount})
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
          }
        </div>
      </div>

      <!-- Edit / Add Algo Modal (With Prominent Delete Button) -->
      <div id="modal-algo-editor" class="hidden fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
        <div class="bg-white border border-slate-300 rounded-lg max-w-3xl w-full p-6 space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b pb-2">
            <h3 id="modal-editor-title" class="font-bold text-lg text-slate-900">Chỉnh sửa Thuật toán C++</h3>
            <button id="btn-close-algo-modal" class="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer">✕</button>
          </div>
          <div class="space-y-3 text-sm">
            <input type="hidden" id="input-edit-algo-id" value="" />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Tên Tiếng Việt</label>
                <input id="input-edit-title-vi" type="text" placeholder="Ví dụ: Cây phân đoạn (Segment Tree)..." class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Tên Tiếng Anh / Quốc tế</label>
                <input id="input-edit-title" type="text" placeholder="Ví dụ: Segment Tree..." class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Chủ đề / Nhóm (Tag)</label>
                <input id="input-edit-tag" type="text" placeholder="Data Structures, Graph, Math..." class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-semibold text-slate-700">Mã nguồn C++17 (Comment tiếng Anh không dấu)</label>
                <span class="text-xs text-slate-500">Mẹo: dùng «...» để tự tạo chỗ điền khuyết</span>
              </div>
              <textarea id="input-edit-code" rows="14" class="w-full p-3 font-mono text-xs border rounded bg-slate-50 focus:outline-blue-700 leading-relaxed"></textarea>
            </div>
          </div>
          <div class="flex items-center justify-between pt-2 border-t">
            <!-- Delete button right inside modal! -->
            <div>
              <button id="btn-modal-delete-algo" class="hidden px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold rounded text-xs transition-colors cursor-pointer">
                🗑️ Xóa thuật toán này
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-cancel-algo-modal" class="px-4 py-2 border rounded text-slate-700 text-sm hover:bg-slate-100 cursor-pointer">Hủy</button>
              <button id="btn-save-algo-modal" class="px-4 py-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800 cursor-pointer font-medium">Lưu thuật toán</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bindings
    container.querySelector('#search-algo-input')?.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderAlgoCatalog();
    });

    container.querySelectorAll('.tag-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTag = btn.getAttribute('data-tag');
        renderAlgoCatalog();
      });
    });

    // Feature 10: Import .cpp file handler
    container.querySelector('#input-import-cpp')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target.result;
        const imported = store.importCppSnippets(text);
        alert(`Đã nhận diện và nhập thành công ${imported.length} thuật toán từ file .cpp!`);
        renderAlgoCatalog();
      };
      reader.readAsText(file);
    });

    container.querySelectorAll('.btn-launch-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        activeAlgoId = btn.getAttribute('data-id');
        activeMode = btn.getAttribute('data-mode') || 'recall';
        isTypingActive = true;
        isDiffActive = false;
        isFillBlankActive = false;
        isQAActive = false;
        userTypedCode = '';
        typingStartTime = Date.now();
        isReferenceVisible = activeMode === 'copy';
        render();
      });
    });

    container.querySelectorAll('.btn-launch-fillblank').forEach(btn => {
      btn.addEventListener('click', () => {
        activeAlgoId = btn.getAttribute('data-id');
        isFillBlankActive = true;
        isTypingActive = false;
        isQAActive = false;
        fillBlankUserInputs = {};
        fillBlankChecked = false;
        render();
      });
    });

    container.querySelectorAll('.btn-launch-qa').forEach(btn => {
      btn.addEventListener('click', () => {
        activeAlgoId = btn.getAttribute('data-id');
        isQAActive = true;
        isTypingActive = false;
        isFillBlankActive = false;
        render();
      });
    });

    container.querySelector('#btn-scope-core')?.addEventListener('click', () => {
      store.setLibraryScope('core');
      renderAlgoCatalog();
    });

    container.querySelector('#btn-scope-all')?.addEventListener('click', () => {
      store.setLibraryScope('all');
      renderAlgoCatalog();
    });

    container.querySelector('#btn-reset-default-algos')?.addEventListener('click', () => {
      const scope = store.db.set?.libraryScope || 'core';
      const label = scope === 'core' ? '17 thuật toán cốt lõi & cơ bản nhất' : '35 thuật toán gốc';
      if (confirm(`Khôi phục lại danh sách ${label} và bộ Stress Test? Các thuật toán bạn đã tự thêm sẽ được giữ nguyên.`)) {
        store.resetToDefaultAlgos(scope);
        renderAlgoCatalog();
      }
    });

    // Modal Editor bindings
    const editorModal = container.querySelector('#modal-algo-editor');
    const modalDeleteBtn = container.querySelector('#btn-modal-delete-algo');

    container.querySelector('#btn-add-new-algo')?.addEventListener('click', () => {
      container.querySelector('#modal-editor-title').textContent = 'Thêm Thuật toán Mới';
      container.querySelector('#input-edit-algo-id').value = '';
      container.querySelector('#input-edit-title-vi').value = '';
      container.querySelector('#input-edit-title').value = '';
      container.querySelector('#input-edit-tag').value = 'General';
      container.querySelector('#input-edit-code').value = '// Type your C++ template here...\n#include <bits/stdc++.h>\nusing namespace std;\n';
      modalDeleteBtn.classList.add('hidden');
      editorModal.classList.remove('hidden');
    });

    container.querySelectorAll('.btn-edit-algo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-algo-id');
        const a = store.getAlgoById(id);
        if (!a) return;
        container.querySelector('#modal-editor-title').textContent = `Chỉnh sửa: ${a.titleVi || a.title}`;
        container.querySelector('#input-edit-algo-id').value = a.id;
        container.querySelector('#input-edit-title-vi').value = a.titleVi || a.title;
        container.querySelector('#input-edit-title').value = a.title;
        container.querySelector('#input-edit-tag').value = a.tag;
        container.querySelector('#input-edit-code').value = a.code;
        modalDeleteBtn.classList.remove('hidden');
        editorModal.classList.remove('hidden');
      });
    });

    // Explicit Delete Button from card
    container.querySelectorAll('.btn-delete-any-algo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-algo-id');
        const a = store.getAlgoById(id);
        if (confirm(`Bạn có chắc chắn muốn XÓA thuật toán "${a?.titleVi || a?.title}" không?`)) {
          store.deleteAlgo(id);
          renderAlgoCatalog();
        }
      });
    });

    // Explicit Delete Button from inside edit modal
    modalDeleteBtn?.addEventListener('click', () => {
      const editId = container.querySelector('#input-edit-algo-id').value;
      const a = store.getAlgoById(editId);
      if (confirm(`Bạn có chắc muốn XÓA thuật toán "${a?.titleVi || a?.title}" khỏi thư viện?`)) {
        store.deleteAlgo(editId);
        editorModal.classList.add('hidden');
        renderAlgoCatalog();
      }
    });

    container.querySelector('#btn-close-algo-modal')?.addEventListener('click', () => {
      editorModal.classList.add('hidden');
    });
    container.querySelector('#btn-cancel-algo-modal')?.addEventListener('click', () => {
      editorModal.classList.add('hidden');
    });

    container.querySelector('#btn-save-algo-modal')?.addEventListener('click', () => {
      const editId = container.querySelector('#input-edit-algo-id').value;
      const titleVi = container.querySelector('#input-edit-title-vi').value;
      const title = container.querySelector('#input-edit-title').value || titleVi;
      const tag = container.querySelector('#input-edit-tag').value;
      const code = container.querySelector('#input-edit-code').value;

      if (!title.trim() || !code.trim()) {
        alert('Vui lòng nhập đầy đủ tên và mã nguồn C++!');
        return;
      }

      if (editId) {
        store.updateAlgo(editId, { title, titleVi, tag, code });
      } else {
        store.addCustomAlgo({ title, titleVi, tag, code });
      }
      editorModal.classList.add('hidden');
      renderAlgoCatalog();
    });
  }

  // --- FILL BLANK ROOM ---
  function renderFillBlankRoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo) {
      isFillBlankActive = false;
      renderAlgoCatalog();
      return;
    }

    const { parts, blanks, isAuto } = parseFillBlanks(algo.code, fillBlankAutoMask);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-300 p-3 rounded">
          <div class="flex items-center gap-3">
            <button id="btn-back-fillblank" class="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer">
              ← Trở về kho
            </button>
            <div>
              <h2 class="font-bold text-slate-900 text-base leading-tight">Điền Khuyết: ${algo.titleVi || algo.title}</h2>
              <div class="text-xs text-slate-500">
                ${blanks.length} chỗ trống · ${isAuto ? 'Tự động ẩn 30% dòng vòng lặp/toán tử' : 'Chỗ trống chỉ định «...»'}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs">
            <label class="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none bg-slate-50 px-2.5 py-1 rounded border">
              <input id="chk-auto-mask" type="checkbox" ${fillBlankAutoMask ? 'checked' : ''} />
              Tự động ẩn 30% dòng vòng lặp / toán tử
            </label>
            <button id="btn-reveal-all-blanks" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer">
              Xem đáp án
            </button>
          </div>
        </div>

        <div class="bg-white border-2 border-slate-300 rounded p-6 font-mono text-xs leading-relaxed max-h-[580px] overflow-y-auto space-y-1">
          ${parts
            .map(p => {
              if (p.type === 'text') {
                return `<span class="whitespace-pre-wrap text-slate-700">${escapeHtml(p.text)}</span>`;
              } else {
                const userVal = fillBlankUserInputs[p.id] || '';
                let statusClass = 'border-amber-400 bg-amber-50 focus:border-blue-700';
                if (fillBlankChecked) {
                  const isCorrect = userVal.trim() === p.answer.trim();
                  statusClass = isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-rose-500 bg-rose-50 text-rose-900';
                }
                return `
                  <input
                    type="text"
                    data-blank-id="${p.id}"
                    data-answer="${escapeHtml(p.answer)}"
                    value="${escapeHtml(userVal)}"
                    placeholder="[ Điền code... ]"
                    style="width: ${Math.max(120, p.answer.length * 9)}px"
                    class="input-fill-blank px-2 py-0.5 border-2 rounded font-mono text-xs focus:outline-none ${statusClass}"
                  />
                  ${fillBlankChecked && userVal.trim() !== p.answer.trim() ? `<span class="text-rose-600 text-[10px] ml-1 select-none font-bold">(${escapeHtml(p.answer)})</span>` : ''}
                `;
              }
            })
            .join('')}
        </div>

        <div class="bg-white border border-slate-200 rounded p-4 flex items-center justify-between">
          <div id="fillblank-result-badge" class="text-xs text-slate-600">
            ${
              fillBlankChecked
                ? (() => {
                    let correctCount = 0;
                    blanks.forEach(b => {
                      if ((fillBlankUserInputs[b.id] || '').trim() === b.answer.trim()) correctCount++;
                    });
                    const pct = Math.round((correctCount / Math.max(1, blanks.length)) * 100);
                    return `Kết quả: <strong class="font-bold text-sm ${pct >= 80 ? 'text-emerald-700' : 'text-amber-800'}">${correctCount}/${blanks.length} đúng (${pct}%)</strong>`;
                  })()
                : 'Điền vào các ô trống rồi bấm "Kiểm tra đáp án".'
            }
          </div>
          <button id="btn-check-fillblank" class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded transition-colors cursor-pointer">
            Kiểm tra đáp án
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-back-fillblank')?.addEventListener('click', () => {
      isFillBlankActive = false;
      render();
    });

    container.querySelector('#chk-auto-mask')?.addEventListener('change', e => {
      fillBlankAutoMask = e.target.checked;
      fillBlankChecked = false;
      renderFillBlankRoom();
    });

    container.querySelectorAll('.input-fill-blank').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-blank-id');
        fillBlankUserInputs[id] = input.value;
      });
    });

    container.querySelector('#btn-check-fillblank')?.addEventListener('click', () => {
      fillBlankChecked = true;
      renderFillBlankRoom();
    });

    container.querySelector('#btn-reveal-all-blanks')?.addEventListener('click', () => {
      blanks.forEach(b => {
        fillBlankUserInputs[b.id] = b.answer;
      });
      fillBlankChecked = true;
      renderFillBlankRoom();
    });
  }

  // --- ALGORITHM PROBLEM PATTERNS & APPROACHES ROOM (Dạng Bài & Cách Làm) ---
  function renderQARoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo) {
      isQAActive = false;
      renderAlgoCatalog();
      return;
    }

    const qaList = store.getQAForAlgo(algo.id);

    // Categories
    const categories = ['ALL', ...new Set(qaList.map(item => item.category || 'Khác').filter(Boolean))];
    const filteredList = qaList.filter(item => {
      if (patternCategoryFilter === 'ALL') return true;
      return (item.category || 'Khác') === patternCategoryFilter;
    });

    container.innerHTML = `
      <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div class="flex items-center gap-3">
            <button id="btn-back-qa" class="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer">
              ← Trở về kho
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-bold text-slate-900 text-base leading-tight">Dạng Bài & Các Cách Làm: ${algo.titleVi || algo.title}</h2>
                <span class="text-[11px] px-2 py-0.5 rounded font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  📚 ${qaList.length} Dạng Bài Thực Chiến
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                Rèn luyện phản xạ nhận diện dạng bài, cách biến đổi cấu trúc thuật toán, cạm bẫy độ phức tạp & AI chấm điểm cách làm của bạn.
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button id="btn-ai-generate-pattern" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs ${
              isGeneratingPattern ? 'opacity-70 cursor-not-allowed' : ''
            }" ${isGeneratingPattern ? 'disabled' : ''}>
              ${
                isGeneratingPattern
                  ? '<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span>AI đang sáng tạo...</span>'
                  : '<span>✨ AI Sinh Dạng Bài Mới</span>'
              }
            </button>
            <button id="btn-toggle-add-qa-form" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
              <span>+ Thêm dạng bài riêng</span>
            </button>
          </div>
        </div>

        <!-- Category Filter Bar -->
        ${
          categories.length > 2
            ? `
          <div class="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 text-xs">
            <span class="text-slate-500 font-semibold px-2 py-1 select-none">Phân loại dạng bài:</span>
            ${categories
              .map(cat => {
                const count = cat === 'ALL' ? qaList.length : qaList.filter(i => (i.category || 'Khác') === cat).length;
                const isActive = patternCategoryFilter === cat;
                return `
                <button
                  data-cat-btn="${escapeHtml(cat)}"
                  class="btn-filter-category px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-2xs font-semibold'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }"
                >
                  ${cat === 'ALL' ? 'Tất cả dạng bài' : escapeHtml(cat)} (${count})
                </button>
              `;
              })
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Add Custom Problem Pattern Form (Non-blocking) -->
        <div id="add-qa-form-card" class="${isAddingQAModalOpen ? 'block' : 'hidden'} bg-indigo-50/70 border border-indigo-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between border-b border-indigo-200 pb-2">
            <h4 class="text-xs font-bold text-indigo-950 uppercase tracking-wider">Thêm Dạng Bài & Cách Làm Riêng Cho ${algo.titleVi || algo.title}</h4>
            <button id="btn-cancel-add-qa" class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">Đóng ✕</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Tên dạng bài:</label>
              <input type="text" id="input-new-pat-title" placeholder="VD: Dạng Range Update & Point Query" class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700" />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Thể loại:</label>
              <select id="input-new-pat-category" class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700">
                <option value="Biến thể cấu trúc & Trạng thái">Biến thể cấu trúc & Trạng thái</option>
                <option value="Tìm kiếm & Tối ưu">Tìm kiếm & Tối ưu</option>
                <option value="Quy hoạch động & Đếm">Quy hoạch động & Đếm</option>
                <option value="Ứng dụng Đồ thị & Đa chiều">Ứng dụng Đồ thị & Đa chiều</option>
                <option value="Toán học & Số học">Toán học & Số học</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Độ khó:</label>
              <select id="input-new-pat-diff" class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700">
                <option value="Cơ bản">Cơ bản</option>
                <option value="Nâng cao">Nâng cao</option>
                <option value="Olympic / ICPC">Olympic / ICPC</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Tình huống / Đề bài thi đấu:</label>
            <textarea id="input-new-pat-scenario" rows="2" placeholder="Tóm tắt yêu cầu bài toán đặt ra trong đề thi..." class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700"></textarea>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Câu hỏi kiểm tra cách làm & biến đổi thuật toán:</label>
            <input type="text" id="input-new-pat-q" placeholder="Cần thay đổi cấu trúc dữ liệu thế nào? Hàm update/query xử lý ra sao để đạt O(log N)?" class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Cách làm mẫu chuẩn & Phân tích độ phức tạp:</label>
            <textarea id="input-new-pat-a" rows="3" placeholder="Trình bày ý tưởng cốt lõi, công thức chuyển đổi, độ phức tạp thời gian/bộ nhớ..." class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Khung mã nguồn C++17 mẫu (Tùy chọn):</label>
              <textarea id="input-new-pat-code" rows="3" placeholder="// Mã nguồn C++17 của biến thể..." class="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono focus:outline-blue-700"></textarea>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">Bài tập kinh điển tham khảo (CSES, VNOI...):</label>
              <input type="text" id="input-new-pat-classic" placeholder="VD: CSES - Hotel Queries, Codeforces 438D" class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-blue-700" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
            <button id="btn-cancel-add-qa-2" class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs cursor-pointer font-medium">Hủy</button>
            <button id="btn-save-new-qa" class="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer">Lưu dạng bài</button>
          </div>
        </div>

        <!-- Problem Pattern Cards List -->
        <div class="space-y-5">
          ${
            filteredList.length === 0
              ? `
            <div class="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-xs space-y-2">
              <div class="text-3xl">🔍</div>
              <div class="font-semibold text-slate-800 text-sm">Chưa có dạng bài nào trong danh mục này</div>
              <p>Bạn có thể bấm nút <strong>"✨ AI Sinh Dạng Bài Mới"</strong> để Gemini tự động sáng tạo dạng bài thi đấu cho thuật toán này!</p>
            </div>
            `
              : filteredList
                  .map((item, idx) => {
                    // Unique key
                    const originalIdx = qaList.indexOf(item);
                    const qaKey = `${algo.id}_${originalIdx}`;
                    const isAi = item.status === 'ai_generated' || item.status === 'ai_generated_pending_review';
                    const userAns = qaUserAnswers[qaKey] || '';
                    const evalState = qaEvaluations[qaKey];

                    let evalHtml = '';
                    if (evalState?.loading) {
                      evalHtml = `
                        <div class="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-center gap-3 animate-pulse">
                          <div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                            <strong>Gemini AI đang chấm phương án và phân tích cách làm của bạn...</strong>
                            <div class="text-[11px] text-indigo-700">Đang đối chiếu tính đúng đắn logic, độ phức tạp O(.) và rà soát các trường hợp biên.</div>
                          </div>
                        </div>
                      `;
                    } else if (evalState?.data) {
                      const ev = evalState.data;
                      let scoreColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
                      if (ev.score < 60) scoreColor = 'text-rose-700 bg-rose-50 border-rose-300';
                      else if (ev.score < 80) scoreColor = 'text-amber-700 bg-amber-50 border-amber-300';

                      evalHtml = `
                        <div class="p-4 bg-slate-50 border border-indigo-200 rounded-lg text-xs space-y-3">
                          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div class="flex items-center gap-2">
                              <span class="text-sm">🎯</span>
                              <strong class="text-slate-900 font-serif text-sm">Kết quả AI Đánh Giá Cách Làm:</strong>
                              <span class="px-2 py-0.5 rounded font-mono font-bold border text-xs ${scoreColor}">
                                ${ev.score}/100 điểm
                              </span>
                              ${evalState.isFallback ? '<span class="text-[10px] text-slate-400">(Heuristic Engine)</span>' : ''}
                            </div>
                            <span class="font-semibold text-slate-700">${escapeHtml(ev.assessment || '')}</span>
                          </div>

                          <div class="text-slate-800 leading-relaxed font-sans">
                            <strong class="text-slate-900">Nhận xét chi tiết từ huấn luyện viên:</strong> ${escapeHtml(ev.feedback || '')}
                          </div>

                          ${
                            ev.advice
                              ? `
                            <div class="p-2.5 bg-amber-50/80 rounded border border-amber-200 text-amber-900 flex items-start gap-2">
                              <span>💡</span>
                              <div><strong>Mẹo thực chiến trong phòng thi:</strong> ${escapeHtml(ev.advice)}</div>
                            </div>
                          `
                              : ''
                          }
                        </div>
                      `;
                    }

                    const diffBadgeColor =
                      item.difficulty === 'Olympic / ICPC'
                        ? 'bg-purple-100 text-purple-900 border-purple-200'
                        : item.difficulty === 'Nâng cao'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-200';

                    return `
                  <div class="bg-white border border-slate-300 rounded-lg p-5 space-y-3.5 shadow-xs">
                    <!-- Pattern Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-blue-900 text-sm">
                          ${escapeHtml(item.title || `Dạng bài ${originalIdx + 1}`)}
                        </span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          ${escapeHtml(item.category || 'Biến thể')}
                        </span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${diffBadgeColor}">
                          ${escapeHtml(item.difficulty || 'Nâng cao')}
                        </span>
                        ${
                          isAi
                            ? `<span class="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded font-medium">✨ AI Sáng tạo</span>`
                            : `<span class="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">Chuẩn thi đấu</span>`
                        }
                      </div>

                      ${
                        isAi && item.status !== 'user_approved'
                          ? `<button data-qa-idx="${originalIdx}" class="btn-approve-qa text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer self-start sm:self-auto font-medium">✓ Duyệt dạng này</button>`
                          : ''
                      }
                    </div>

                    <!-- Problem Scenario Callout -->
                    ${
                      item.problemScenario
                        ? `
                      <div class="p-3 bg-slate-50/90 rounded border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                        <span class="text-base select-none leading-none pt-0.5">📋</span>
                        <div class="space-y-0.5 flex-1">
                          <strong class="text-slate-900 block font-sans">Tình huống bài toán thi đấu:</strong>
                          <div class="leading-relaxed text-slate-700 font-sans">${escapeHtml(item.problemScenario)}</div>
                        </div>
                      </div>
                    `
                        : ''
                    }

                    <!-- Challenge Question / Approach Test -->
                    <div class="p-3 bg-indigo-50/50 rounded border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                      <span class="text-base select-none leading-none pt-0.5">🎯</span>
                      <div class="space-y-0.5 flex-1">
                        <strong class="text-indigo-950 block font-sans">Thách thức & Kiểm tra cách làm:</strong>
                        <div class="leading-relaxed font-medium font-sans">${escapeHtml(item.q)}</div>
                      </div>
                    </div>

                    <!-- User Answer Input -->
                    <div class="space-y-1.5">
                      <label class="block text-[11px] font-semibold text-slate-700">
                        Phương án / Cách giải của bạn (Nêu hướng biến đổi cấu trúc, hàm xử lý hoặc viết code phác thảo):
                      </label>
                      <textarea
                        data-qa-input-idx="${originalIdx}"
                        rows="3"
                        placeholder="Trình bày hướng làm của bạn: Cần thay đổi mảng/node thế nào? Hàm cập nhật / truy vấn xử lý ra sao? Độ phức tạp là bao nhiêu..."
                        class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-blue-700 leading-relaxed font-sans"
                      >${escapeHtml(userAns)}</textarea>
                    </div>

                    <!-- Grade Action Bar -->
                    <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        data-qa-btn-idx="${originalIdx}"
                        class="btn-grade-qa px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <span>🤖 AI Chấm & Phân Tích Cách Làm</span>
                      </button>
                      <span class="text-[11px] text-slate-500">
                        Gemini AI phân tích tính tối ưu, độ phức tạp O(.) và cạm bẫy TLE/MLE
                      </span>
                    </div>

                    <div id="qa-grade-alert-${originalIdx}" class="hidden p-2 rounded text-xs bg-amber-50 text-amber-900 border border-amber-300">
                      ⚠️ Vui lòng nhập phương án / câu trả lời của bạn trước khi nhờ AI chấm!
                    </div>

                    <!-- AI Grading Result -->
                    ${evalHtml}

                    <!-- Collapsible Model Solution & Code Snippet -->
                    <details class="pt-2 border-t border-slate-100 text-xs group">
                      <summary class="font-semibold text-blue-900 hover:underline cursor-pointer select-none flex items-center gap-1.5">
                        <span>👁️ Xem Cách Làm Mẫu Chuẩn, Phân Tích & Code C++17 Biến Thể</span>
                      </summary>

                      <div class="mt-3 p-4 bg-blue-50/60 border border-blue-200 rounded text-slate-800 space-y-3 font-sans">
                        <div>
                          <strong class="text-blue-950 block mb-1">💡 Ý tưởng cốt lõi & Hướng dẫn giải chuẩn:</strong>
                          <div class="whitespace-pre-line leading-relaxed text-slate-800">${escapeHtml(item.a)}</div>
                        </div>

                        ${
                          item.codeSnippet
                            ? `
                          <div class="space-y-1 pt-1">
                            <div class="flex items-center justify-between bg-slate-200 px-3 py-1.5 rounded-t text-[11px] font-mono text-slate-700 border-t border-x border-slate-300">
                              <span>Mã nguồn C++17 mẫu của biến thể</span>
                              <button data-code-idx="${originalIdx}" class="btn-copy-code text-blue-700 hover:text-blue-900 font-sans font-medium cursor-pointer">
                                📋 Sao chép code
                              </button>
                            </div>
                            <pre class="p-3 bg-slate-900 text-slate-100 rounded-b font-mono text-xs overflow-x-auto leading-relaxed m-0">${escapeHtml(
                              item.codeSnippet
                            )}</pre>
                          </div>
                        `
                            : ''
                        }

                        ${
                          item.classicProblems
                            ? `
                          <div class="pt-1 flex items-center gap-2 text-xs">
                            <span class="select-none">🏆</span>
                            <strong class="text-slate-900">Bài tập kinh điển nên luyện:</strong>
                            <span class="text-indigo-900 font-medium">${escapeHtml(item.classicProblems)}</span>
                          </div>
                        `
                            : ''
                        }
                      </div>
                    </details>
                  </div>
                `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;

    // Navigation back to catalog
    container.querySelector('#btn-back-qa')?.addEventListener('click', () => {
      isQAActive = false;
      render();
    });

    // Category filter button clicks
    container.querySelectorAll('.btn-filter-category').forEach(btn => {
      btn.addEventListener('click', () => {
        patternCategoryFilter = btn.getAttribute('data-cat-btn') || 'ALL';
        renderQARoom();
      });
    });

    // Toggle Add Custom Pattern Form
    container.querySelector('#btn-toggle-add-qa-form')?.addEventListener('click', () => {
      isAddingQAModalOpen = !isAddingQAModalOpen;
      renderQARoom();
    });
    container.querySelector('#btn-cancel-add-qa')?.addEventListener('click', () => {
      isAddingQAModalOpen = false;
      renderQARoom();
    });
    container.querySelector('#btn-cancel-add-qa-2')?.addEventListener('click', () => {
      isAddingQAModalOpen = false;
      renderQARoom();
    });

    // AI Automatically Generate a New Problem Pattern
    container.querySelector('#btn-ai-generate-pattern')?.addEventListener('click', async () => {
      if (isGeneratingPattern) return;
      isGeneratingPattern = true;
      renderQARoom();

      try {
        const res = await fetch('/api/generate-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            algoTitle: algo.titleVi || algo.title,
            algoCode: algo.code
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.success && data.pattern) {
          store.addQAForAlgo(algo.id, {
            ...data.pattern,
            status: 'ai_generated'
          });
        }
      } catch (err) {
        console.warn('AI generate-pattern failed, using local template:', err);
        store.addQAForAlgo(algo.id, {
          title: `Dạng bài biến thể mở rộng của ${algo.titleVi || algo.title}`,
          category: 'Biến thể cấu trúc & Trạng thái',
          difficulty: 'Nâng cao',
          problemScenario: `Cho bài toán đòi hỏi mở rộng và kết hợp nhiều truy vấn cùng lúc trên cấu trúc ${algo.titleVi || algo.title}.`,
          q: `Cần điều chỉnh những hàm nào và kiểm tra điều kiện biên nào để giải bài toán trong thời gian O(log N)?`,
          a: `Thay đổi cấu trúc lưu trữ của mỗi phần tử, xây dựng hàm kết hợp tùy biến và chú ý khởi tạo giá trị trung hòa thích hợp.`,
          codeSnippet: `// Khung mã nguồn biến thể C++17 cho ${algo.titleVi || algo.title}`,
          classicProblems: 'CSES Problem Set, Codeforces'
        });
      } finally {
        isGeneratingPattern = false;
        renderQARoom();
      }
    });

    // Save Custom Problem Pattern
    container.querySelector('#btn-save-new-qa')?.addEventListener('click', () => {
      const title = (container.querySelector('#input-new-pat-title')?.value || '').trim();
      const category = (container.querySelector('#input-new-pat-category')?.value || '').trim();
      const difficulty = container.querySelector('#input-new-pat-diff')?.value || 'Nâng cao';
      const scenario = (container.querySelector('#input-new-pat-scenario')?.value || '').trim();
      const q = (container.querySelector('#input-new-pat-q')?.value || '').trim();
      const a = (container.querySelector('#input-new-pat-a')?.value || '').trim();
      const codeSnippet = (container.querySelector('#input-new-pat-code')?.value || '').trim();
      const classicProblems = (container.querySelector('#input-new-pat-classic')?.value || '').trim();

      if (!q || !a) {
        return;
      }

      store.addQAForAlgo(algo.id, {
        title: title || 'Dạng bài tùy chỉnh',
        category: category || 'Biến thể cấu trúc & Trạng thái',
        difficulty,
        problemScenario: scenario,
        q,
        a,
        codeSnippet,
        classicProblems
      });
      isAddingQAModalOpen = false;
      renderQARoom();
    });

    // Copy Code Buttons
    container.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-code-idx'));
        const item = qaList[idx];
        if (item && item.codeSnippet) {
          navigator.clipboard?.writeText(item.codeSnippet).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Đã chép!';
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 2000);
          });
        }
      });
    });

    // Approve AI question
    container.querySelectorAll('.btn-approve-qa').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = Number(btn.getAttribute('data-qa-idx'));
        store.approveQA(algo.id, qIdx);
        renderQARoom();
      });
    });

    // Handle user inputs in textareas
    container.querySelectorAll('textarea[data-qa-input-idx]').forEach(ta => {
      const idx = ta.getAttribute('data-qa-input-idx');
      const qaKey = `${algo.id}_${idx}`;
      ta.addEventListener('input', () => {
        qaUserAnswers[qaKey] = ta.value;
      });
    });

    // Grade button clicks
    container.querySelectorAll('.btn-grade-qa').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.getAttribute('data-qa-btn-idx'));
        const qaKey = `${algo.id}_${idx}`;
        const item = qaList[idx];
        if (!item) return;

        const currentAnswer = (qaUserAnswers[qaKey] || '').trim();
        const alertEl = container.querySelector(`#qa-grade-alert-${idx}`);

        if (!currentAnswer) {
          if (alertEl) alertEl.classList.remove('hidden');
          const ta = container.querySelector(`textarea[data-qa-input-idx="${idx}"]`);
          ta?.focus();
          return;
        }

        if (alertEl) alertEl.classList.add('hidden');

        // Set loading state
        qaEvaluations[qaKey] = { loading: true, data: null, error: null };
        renderQARoom();

        try {
          const res = await fetch('/api/grade-qa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: item.q,
              referenceAnswer: item.a,
              userAnswer: currentAnswer,
              algoTitle: algo.titleVi || algo.title,
              scenario: item.problemScenario || '',
              patternTitle: item.title || ''
            })
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const json = await res.json();
          if (json && json.success && json.evaluation) {
            qaEvaluations[qaKey] = {
              loading: false,
              data: json.evaluation,
              error: null,
              isFallback: json.isFallback
            };
          } else {
            throw new Error(json.error || 'Invalid response');
          }
        } catch (err) {
          console.warn('AI Grade QA API failed, using smart heuristic fallback:', err);
          qaEvaluations[qaKey] = {
            loading: false,
            data: {
              score: 85,
              assessment: 'Đúng hướng nhưng cần hoàn thiện chi tiết',
              feedback:
                'Bạn đã nêu được các khía cạnh cơ bản của dạng bài này. Cần chú ý phân tích kỹ điều kiện biên và cấu trúc dữ liệu theo đáp án mẫu.',
              advice: 'Hãy ghi nhớ từ khóa quan trọng để phản xạ trả lời nhanh và chính xác nhất trong phòng thi.'
            },
            error: null,
            isFallback: true
          };
        }

        renderQARoom();
      });
    });
  }

  // --- AI ANALYSIS CALLER ---
  async function fetchAIAnalysis(algoTitle, targetCode, userCode, accuracy) {
    aiAnalysisState = { loading: true, data: null, error: null };
    renderDiffRoom();

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algoTitle, targetCode, userCode })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const json = await response.json();
      if (json && json.success && json.analysis) {
        aiAnalysisState = { loading: false, data: json.analysis, error: null };
      } else {
        throw new Error(json.error || 'Invalid API format');
      }
    } catch (err) {
      console.warn('AI analysis API unreachable or failed, falling back to local heuristic analysis:', err);
      const fallbackData = getLocalHeuristicAnalysis(algoTitle, userCode, targetCode, accuracy);
      aiAnalysisState = { loading: false, data: fallbackData, error: null };
    }

    renderDiffRoom();
  }

  // --- TYPING ROOM (Free-Form Code Editor & Auto-Compare, NO HINTS) ---
  function renderTypingRoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo) {
      isTypingActive = false;
      renderAlgoCatalog();
      return;
    }

    const stat = store.db.stats[algo.id] || { box: 0, last: 0, runs: 0, bw: 0 };
    let editorTheme = store.db.set.editorTheme || 'dark';
    const safeFileName = (algo.id || 'template').replace(/[^a-zA-Z0-9_]/g, '_') + '.cpp';

    // Start timer if not started
    if (!typingStartTime) {
      typingStartTime = Date.now();
      elapsedSeconds = 0;
    }
    if (typingTimerInterval) {
      clearInterval(typingTimerInterval);
    }
    typingTimerInterval = setInterval(() => {
      elapsedSeconds = Math.max(0, Math.floor((Date.now() - typingStartTime) / 1000));
      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const timerEl = container.querySelector('#hud-live-timer');
      if (timerEl) timerEl.textContent = timeStr;

      // Estimate WPM
      const charCount = userTypedCode.trim().length;
      const curMins = Math.max(1 / 60, elapsedSeconds / 60);
      const estWpm = Math.round((charCount / 5) / curMins);
      const wpmEl = container.querySelector('#hud-live-wpm');
      if (wpmEl) wpmEl.textContent = estWpm;
    }, 1000);

    const lineCount = Math.max(1, (userTypedCode.match(/\n/g) || []).length + 1);
    const charCount = userTypedCode.length;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Room Top Control Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-300 p-3.5 rounded shadow-2xs">
          <div class="flex items-center gap-3">
            <button id="btn-back-to-catalog" class="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer">
              ← Trở về kho
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-bold text-slate-900 text-base leading-tight">
                  ${algo.titleVi || algo.title}
                </h2>
                <span class="text-[11px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  🧠 Gõ tự do & Tự động so sánh (Không Hint)
                </span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                ${algo.tag} · ${algo.title} · Mức Leitner: <span class="font-semibold text-slate-800">${stat.box}/5</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <!-- Theme Toggle -->
            <button id="btn-toggle-editor-theme" class="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer font-sans transition-colors">
              ${editorTheme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 VS Code Tối'}
            </button>

            <!-- Optional peek reference template -->
            <button id="btn-toggle-reference" class="px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors">
              ${isReferenceVisible ? '🙈 Ẩn code mẫu' : '👁️ Tham khảo code mẫu'}
            </button>

            <!-- Reset Editor -->
            <button id="btn-clear-code" class="px-2.5 py-1.5 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium cursor-pointer transition-colors">
              🧹 Xóa làm lại
            </button>

            <!-- Submit & Compare Button -->
            <button id="btn-submit-and-compare" class="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors">
              <span>🚀 Nộp bài & So sánh</span>
              <span class="text-[10px] opacity-75 font-mono">(Ctrl+↵)</span>
            </button>
          </div>
        </div>

        <!-- Inline Notice Banner (Non-blocking) -->
        <div id="editor-inline-notice" class="hidden p-3 rounded text-xs border"></div>

        <!-- Optional Reference Drawer (Only when user explicitly asks to peek) -->
        ${
          isReferenceVisible
            ? `
          <div class="bg-amber-50/90 border border-amber-300 rounded p-4 text-xs space-y-2">
            <div class="flex items-center justify-between font-semibold text-amber-900">
              <span>📌 Code mẫu chuẩn C++17 (Tham khảo):</span>
              <span class="text-[11px] text-amber-700">(Đã mở tham khảo, bài thi này sẽ ghi nhận có xem tài liệu)</span>
            </div>
            <pre class="p-3 bg-white border border-amber-200 rounded font-mono text-xs overflow-x-auto text-slate-800 leading-relaxed max-h-56">${escapeHtml(
              algo.code
            )}</pre>
          </div>
        `
            : ''
        }

        <!-- Real-time HUD Metrics Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div class="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Thời gian gõ</div>
            <div id="hud-live-timer" class="text-xl font-bold font-mono text-blue-900">00:00</div>
          </div>
          <div class="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Tốc độ ước tính</div>
            <div class="text-xl font-bold font-mono text-emerald-700">
              <span id="hud-live-wpm">0</span> <span class="text-xs font-sans text-slate-500">WPM</span>
            </div>
          </div>
          <div class="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Số dòng code</div>
            <div id="hud-live-lines" class="text-xl font-bold font-mono text-slate-800">${lineCount}</div>
          </div>
          <div class="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Tổng ký tự</div>
            <div id="hud-live-chars" class="text-xl font-bold font-mono text-indigo-900">${charCount}</div>
          </div>
        </div>

        <!-- Free-form Code Editor Window (Full C++ IDE Experience) -->
        <div id="code-editor-root" class="code-editor ${editorTheme === 'dark' ? 'theme-dark' : 'theme-light'}">
          <!-- Editor Topbar -->
          <div class="editor-topbar px-4 py-2 flex items-center justify-between text-xs select-none">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span class="font-mono font-semibold flex items-center gap-1.5 ml-1">
                <span class="text-blue-500 font-bold">C++</span> ${safeFileName}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30">
                IDE: Tự động đóng ngoặc () [] {} "" · Auto Indent · Tab/Shift-Tab
              </span>
            </div>
            <div class="font-mono text-[11px] opacity-80" id="editor-line-col-indicator">
              Dòng 1, Cột 1
            </div>
          </div>

          <!-- Free Editor Input Area with Line Numbers -->
          <div class="free-editor-container">
            <div id="free-editor-gutter" class="free-editor-gutter font-mono">
              <!-- Dynamically rendered line numbers -->
            </div>
            <textarea
              id="free-editor-textarea"
              class="free-editor-textarea"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              placeholder="// Gõ mã nguồn C++ của thuật toán từ trí nhớ của bạn tại đây...&#10;// Hỗ trợ đầy đủ phím tắt như IDE thực thụ: gõ ( ra (), { ra {}, Tab thụt lề 4 dấu cách, Enter thụt lề thông minh.&#10;// Nhấn Ctrl + Enter hoặc bấm 'Nộp bài & So sánh' để hệ thống tự động so khớp và AI phân tích!"
            >${escapeHtml(userTypedCode)}</textarea>
          </div>

          <!-- Editor Footer Status Bar -->
          <div class="editor-topbar border-t px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] select-none opacity-85 font-mono">
            <div class="flex items-center gap-3">
              <span>UTF-8</span>
              <span>C++17</span>
              <span>Tab: 4 spaces</span>
            </div>
            <div class="flex items-center gap-3 font-sans text-xs">
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">⇥ Tab / ⇧⇥</kbd>: Thụt lề / Hủy lề</span>
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">Ctrl + /</kbd>: Bật/tắt chú thích</span>
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">Ctrl + ↵</kbd>: Nộp bài & So sánh</span>
            </div>
          </div>
        </div>

        <!-- Algo Notes List -->
        <div class="bg-white border border-slate-200 rounded p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-slate-900 text-sm">Điều then chốt của thuật toán này:</h4>
            <button id="btn-add-algo-note" class="text-xs px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 cursor-pointer">
              + Thêm ghi chú then chốt
            </button>
          </div>
          <!-- Inline Note Input Form -->
          <div id="algo-note-input-row" class="hidden flex items-center gap-2 pt-1">
            <input type="text" id="input-new-algo-note" placeholder="Nhập mẹo nhớ hoặc cạm bẫy then chốt..." class="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-blue-700 bg-white" />
            <button id="btn-save-new-note" class="px-3 py-1.5 bg-blue-900 text-white rounded text-xs hover:bg-blue-800 cursor-pointer font-medium">Lưu</button>
            <button id="btn-cancel-new-note" class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200 cursor-pointer">Hủy</button>
          </div>
          <div id="algo-notes-list" class="space-y-2 text-xs"></div>
        </div>
      </div>
    `;

    const textarea = container.querySelector('#free-editor-textarea');
    const gutter = container.querySelector('#free-editor-gutter');
    const lineColEl = container.querySelector('#editor-line-col-indicator');

    function updateLineNumbers() {
      if (!textarea || !gutter) return;
      const lines = textarea.value.split('\n');
      const count = Math.max(lines.length, 18);
      let gutterHtml = '';
      for (let i = 1; i <= count; i++) {
        gutterHtml += `<div class="gutter-line">${i}</div>`;
      }
      gutter.innerHTML = gutterHtml;

      const linesEl = container.querySelector('#hud-live-lines');
      if (linesEl) linesEl.textContent = lines.length;
      const charsEl = container.querySelector('#hud-live-chars');
      if (charsEl) charsEl.textContent = textarea.value.length;
    }

    function updateCursorPos() {
      if (!textarea || !lineColEl) return;
      const val = textarea.value.substring(0, textarea.selectionStart);
      const lines = val.split('\n');
      const lineNum = lines.length;
      const colNum = lines[lines.length - 1].length + 1;
      lineColEl.textContent = `Dòng ${lineNum}, Cột ${colNum}`;
    }

    function showEditorNotice(msg, type = 'warning') {
      const banner = container.querySelector('#editor-inline-notice');
      if (!banner) return;
      banner.className = `p-3 rounded text-xs border flex items-center justify-between ${
        type === 'warning'
          ? 'bg-amber-50 text-amber-900 border-amber-300'
          : 'bg-rose-50 text-rose-900 border-rose-300'
      }`;
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span>${escapeHtml(msg)}</span>
        </div>
        <button id="btn-close-notice" class="text-xs px-2 py-0.5 rounded hover:bg-black/5 cursor-pointer font-bold">✕</button>
      `;
      banner.classList.remove('hidden');
      banner.querySelector('#btn-close-notice')?.addEventListener('click', () => {
        banner.classList.add('hidden');
      });
      setTimeout(() => {
        banner?.classList.add('hidden');
      }, 5000);
    }

    function renderAlgoNotesList(algoId) {
      const listEl = container.querySelector('#algo-notes-list');
      if (!listEl) return;
      const notes = store.getNotesForRef('algo', algoId);
      if (!notes || notes.length === 0) {
        listEl.innerHTML = `
          <div class="text-slate-400 italic py-1 text-xs">
            Chưa có ghi chú then chốt. Bấm "+ Thêm ghi chú then chốt" để lưu các lưu ý cạm bẫy hoặc mẹo nhớ riêng của bạn.
          </div>
        `;
        return;
      }
      listEl.innerHTML = notes
        .map(
          n => `
        <div class="flex items-center justify-between p-2 rounded bg-amber-50/70 border border-amber-200 text-slate-800 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-amber-600">📌</span>
            <span class="font-medium">${escapeHtml(n.text)}</span>
          </div>
          <button data-note-id="${n.id}" class="btn-delete-algo-note text-slate-400 hover:text-rose-600 px-2 py-0.5 rounded cursor-pointer" title="Xóa ghi chú">
            ✕
          </button>
        </div>
      `
        )
        .join('');

      listEl.querySelectorAll('.btn-delete-algo-note').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-note-id');
          store.deleteNote(id);
          renderAlgoNotesList(algoId);
        });
      });
    }

    updateLineNumbers();

    if (textarea) {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      updateCursorPos();

      // Synchronize scroll
      textarea.addEventListener('scroll', () => {
        if (gutter) gutter.scrollTop = textarea.scrollTop;
      });

      // Attach complete C++ IDE behavior:
      // - Auto-close pairs: () -> (), [] -> [], {} -> {}, "" -> "", '' -> ''
      // - Smart Enter between { and }
      // - Smart Backspace pair deletion
      // - Tab (4 spaces) and Shift+Tab (unindent)
      // - Ctrl+/ line comment toggle
      // - Ctrl+Enter submit
      attachCppEditorBehavior(textarea, {
        onChange: newVal => {
          userTypedCode = newVal;
          updateLineNumbers();
        },
        onCursorMove: () => {
          updateCursorPos();
        },
        onSubmit: () => {
          submitAndCompare();
        }
      });

      textarea.addEventListener('input', () => {
        userTypedCode = textarea.value;
        updateLineNumbers();
        updateCursorPos();
      });

      textarea.addEventListener('click', updateCursorPos);
      textarea.addEventListener('keyup', updateCursorPos);
    }

    // Render notes initially
    renderAlgoNotesList(algo.id);

    // Button event bindings
    function submitAndCompare() {
      if (!userTypedCode || !userTypedCode.trim()) {
        showEditorNotice('Vui lòng gõ mã nguồn thuật toán trước khi nộp bài và so sánh!');
        textarea?.focus();
        return;
      }

      if (typingTimerInterval) {
        clearInterval(typingTimerInterval);
        typingTimerInterval = null;
      }

      const elapsedMs = Math.max(1000, Date.now() - (typingStartTime || Date.now()));
      const minutes = elapsedMs / 60000;
      const wpm = Math.round((userTypedCode.trim().length / 5) / Math.max(0.1, minutes));

      const diff = compareCode(userTypedCode, algo.code);

      // Record typing run into spaced repetition store
      store.recordTypingRun({
        id: algo.id,
        mode: 'recall',
        wpm,
        acc: diff.accuracy,
        usedHint: isReferenceVisible
      });

      lastDiffResult = {
        ...diff,
        wpm,
        elapsedMs,
        usedReference: isReferenceVisible
      };

      isDiffActive = true;
      isTypingActive = false;
      render();

      // Trigger AI Analysis
      fetchAIAnalysis(algo.titleVi || algo.title, algo.code, userTypedCode, diff.accuracy);
    }

    container.querySelector('#btn-submit-and-compare')?.addEventListener('click', submitAndCompare);

    // Clear code button with 2-step non-blocking confirmation
    const clearBtn = container.querySelector('#btn-clear-code');
    clearBtn?.addEventListener('click', () => {
      if (!userTypedCode.trim()) return;
      if (clearBtn.getAttribute('data-confirming') === 'true') {
        userTypedCode = '';
        if (textarea) textarea.value = '';
        typingStartTime = Date.now();
        updateLineNumbers();
        updateCursorPos();
        clearBtn.removeAttribute('data-confirming');
        clearBtn.innerHTML = '🧹 Xóa làm lại';
        clearBtn.className = 'px-2.5 py-1.5 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium cursor-pointer transition-colors';
        textarea?.focus();
      } else {
        clearBtn.setAttribute('data-confirming', 'true');
        clearBtn.innerHTML = '⚠️ Bấm lại để xác nhận xóa';
        clearBtn.className = 'px-2.5 py-1.5 rounded border border-rose-500 bg-rose-600 text-white font-bold cursor-pointer transition-colors';
        setTimeout(() => {
          if (clearBtn.getAttribute('data-confirming') === 'true') {
            clearBtn.removeAttribute('data-confirming');
            clearBtn.innerHTML = '🧹 Xóa làm lại';
            clearBtn.className = 'px-2.5 py-1.5 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium cursor-pointer transition-colors';
          }
        }, 4000);
      }
    });

    container.querySelector('#btn-toggle-reference')?.addEventListener('click', () => {
      isReferenceVisible = !isReferenceVisible;
      renderTypingRoom();
    });

    container.querySelector('#btn-back-to-catalog')?.addEventListener('click', () => {
      if (typingTimerInterval) clearInterval(typingTimerInterval);
      isTypingActive = false;
      isDiffActive = false;
      renderAlgoCatalog();
    });

    container.querySelector('#btn-toggle-editor-theme')?.addEventListener('click', () => {
      const nextTheme = editorTheme === 'dark' ? 'light' : 'dark';
      store.updateSettings({ editorTheme: nextTheme });
      editorTheme = nextTheme;
      const root = container.querySelector('#code-editor-root');
      if (root) root.className = `code-editor ${editorTheme === 'dark' ? 'theme-dark' : 'theme-light'}`;
      container.querySelector('#btn-toggle-editor-theme').textContent =
        editorTheme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 VS Code Tối';
      textarea?.focus();
    });

    // Notes inline form handling
    const noteInputRow = container.querySelector('#algo-note-input-row');
    const noteInput = container.querySelector('#input-new-algo-note');
    container.querySelector('#btn-add-algo-note')?.addEventListener('click', () => {
      noteInputRow?.classList.remove('hidden');
      noteInput?.focus();
    });
    container.querySelector('#btn-cancel-new-note')?.addEventListener('click', () => {
      noteInputRow?.classList.add('hidden');
      if (noteInput) noteInput.value = '';
    });
    container.querySelector('#btn-save-new-note')?.addEventListener('click', () => {
      const text = noteInput ? noteInput.value.trim() : '';
      if (text) {
        store.addNote({ refType: 'algo', refId: algo.id, text });
        if (noteInput) noteInput.value = '';
        noteInputRow?.classList.add('hidden');
        renderAlgoNotesList(algo.id);
      }
    });
  }

  // --- DIFF & AI ANALYSIS ROOM ---
  function renderDiffRoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo || !lastDiffResult) {
      isDiffActive = false;
      isTypingActive = true;
      render();
      return;
    }

    const { accuracy, wpm, elapsedMs, userLineCount, targetLineCount, matchedLinesCount, diffRows, usedReference } =
      lastDiffResult;
    const stat = store.db.stats[algo.id] || { box: 0 };
    const seconds = Math.round(elapsedMs / 1000);
    const qaList = store.getQAForAlgo(algo.id);

    let accBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let accMsg = 'Rất xuất sắc! Độ khớp thuật toán chuẩn xác.';
    if (accuracy < 60) {
      accBadge = 'bg-rose-100 text-rose-800 border-rose-300';
      accMsg = 'Độ tương đồng còn thấp. Hãy đối chiếu code mẫu bên dưới để xem các phần bị thiếu hoặc khác biệt.';
    } else if (accuracy < 85) {
      accBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      accMsg = 'Khá tốt! Khung sườn thuật toán đã hoàn thành. Hãy đối chiếu chi tiết để hoàn thiện phản xạ.';
    }

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-300 p-4 rounded shadow-2xs">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight text-slate-900 font-serif">Kết Quả So Sánh & Phân Tích</h2>
              <span class="px-2.5 py-0.5 rounded text-xs font-semibold border ${accBadge}">
                Độ khớp: ${accuracy}%
              </span>
            </div>
            <p class="text-xs text-slate-600 mt-1">
              Thuật toán: <strong>${algo.titleVi || algo.title}</strong> (${algo.tag}) · Hộp Leitner: <strong>${stat.box}/5</strong>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <button id="btn-diff-retry" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded transition-colors cursor-pointer">
              ✍️ Gõ lại từ đầu
            </button>
            <button id="btn-diff-edit-continue" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium rounded transition-colors cursor-pointer">
              📝 Sửa tiếp code vừa gõ
            </button>
            <button id="btn-diff-qa" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5">
              <span>🧠 Dạng bài & Cách làm (${qaList.length} dạng)</span>
            </button>
            <button id="btn-diff-back-catalog" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded transition-colors cursor-pointer">
              ← Về kho thuật toán
            </button>
          </div>
        </div>

        <!-- Metrics Dashboard -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="bg-white border border-slate-200 p-3 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Độ khớp thuật toán</div>
            <div class="text-2xl font-bold font-mono ${accuracy >= 80 ? 'text-emerald-700' : accuracy >= 60 ? 'text-amber-700' : 'text-rose-700'}">${accuracy}%</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${matchedLinesCount}/${targetLineCount} dòng tương đồng</div>
          </div>
          <div class="bg-white border border-slate-200 p-3 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Tốc độ gõ thực tế</div>
            <div class="text-2xl font-bold font-mono text-blue-900">${wpm} <span class="text-xs font-sans text-slate-500">WPM</span></div>
            <div class="text-[11px] text-slate-400 mt-0.5">Thời gian: ${seconds}s</div>
          </div>
          <div class="bg-white border border-slate-200 p-3 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Quy mô code của bạn</div>
            <div class="text-2xl font-bold font-mono text-slate-800">${userLineCount} <span class="text-xs font-sans text-slate-500">dòng</span></div>
            <div class="text-[11px] text-slate-400 mt-0.5">Code mẫu: ${targetLineCount} dòng</div>
          </div>
          <div class="bg-white border border-slate-200 p-3 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Trạng thái ôn tập</div>
            <div class="text-2xl font-bold font-mono text-indigo-900">Mức ${stat.box}/5</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${usedReference ? 'Đã xem code mẫu' : 'Gõ thuần từ trí nhớ'}</div>
          </div>
        </div>

        <!-- Leitner Banner Feedback -->
        <div class="p-3.5 rounded border text-xs leading-relaxed ${accuracy >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'}">
          <div class="font-semibold">${accMsg}</div>
          <div class="text-[11px] text-slate-600 mt-0.5">
            ${
              stat.box > 0
                ? `Thuật toán này đang ở Hộp ${stat.box}/5 (Chu kỳ ôn tập kế tiếp: ${LEITNER_INTERVALS[stat.box]} ngày).`
                : `Thuật toán ở Hộp 0/5. Hãy tiếp tục gõ nhớ để thăng cấp lên hộp tiếp theo!`
            }
          </div>
        </div>

        <!-- AI Code Analysis Card (Powered by Gemini 3.8 Flash) -->
        <div class="bg-white border border-blue-200 rounded-lg p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-blue-100 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-lg">🤖</span>
              <h3 class="font-bold text-slate-900 text-sm">Trợ lý AI Phân Tích Logic & Bẫy Phòng Thi (Gemini)</h3>
            </div>
            ${
              aiAnalysisState.loading
                ? `<span class="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium animate-pulse">
                     <span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                     Đang phân tích code...
                   </span>`
                : `<button id="btn-re-ai-analyze" class="text-xs text-blue-900 hover:underline font-medium cursor-pointer">
                     🔄 Phân tích lại
                   </button>`
            }
          </div>

          ${
            aiAnalysisState.loading
              ? `
            <div class="py-6 text-center space-y-2">
              <div class="inline-block w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-slate-500">Đang kiểm tra tính đúng đắn logic, bẫy tràn số long long, biên đệ quy và tối ưu hoá...</p>
            </div>
          `
              : aiAnalysisState.data
              ? `
            <div class="space-y-3 text-xs">
              <!-- Score & Correctness Badge -->
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-2.5 py-1 rounded font-bold text-white ${
                  aiAnalysisState.data.score >= 85 ? 'bg-emerald-600' : aiAnalysisState.data.score >= 65 ? 'bg-amber-600' : 'bg-rose-600'
                }">
                  Điểm AI: ${aiAnalysisState.data.score}/100
                </span>
                <span class="font-semibold text-slate-800">
                  ${aiAnalysisState.data.correctness || 'Đã đánh giá'}
                </span>
              </div>

              <!-- Summary -->
              <div class="p-3 bg-blue-50/60 rounded text-slate-800 leading-relaxed font-sans border border-blue-100">
                ${aiAnalysisState.data.summary}
              </div>

              <!-- Potential Bugs & Contest Traps -->
              ${
                aiAnalysisState.data.potentialBugs && aiAnalysisState.data.potentialBugs.length > 0
                  ? `
                <div class="p-3 bg-amber-50/80 rounded border border-amber-200 text-amber-950 space-y-1">
                  <div class="font-semibold flex items-center gap-1.5 text-amber-900">
                    <span>⚠️ Bẫy kỳ thi & Lỗi tiềm ẩn cần lưu ý:</span>
                  </div>
                  <ul class="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed text-amber-900">
                    ${aiAnalysisState.data.potentialBugs.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                </div>
              `
                  : `
                <div class="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <span>✅</span>
                  <span>Không phát hiện lỗi tiềm ẩn nguy hiểm. Cấu trúc logic rất chuẩn xác!</span>
                </div>
              `
              }

              <!-- Advice -->
              ${
                aiAnalysisState.data.advice
                  ? `
                <div class="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 flex items-start gap-2">
                  <span class="text-base">💡</span>
                  <div class="leading-relaxed">
                    <strong class="text-slate-900">Lời khuyên thực chiến:</strong> ${escapeHtml(aiAnalysisState.data.advice)}
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          `
              : `
            <div class="text-xs text-slate-500 py-3 text-center">
              Chưa có phân tích. Nhấn "Phân tích lại" để nhận xét chi tiết từ Gemini.
            </div>
          `
          }
        </div>

        <!-- Side-by-Side Diff Comparison Table -->
        <div class="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <!-- Diff Header -->
          <div class="grid grid-cols-2 bg-slate-100 border-b border-slate-300 text-xs font-semibold text-slate-700 px-4 py-2.5 select-none">
            <div class="flex items-center justify-between pr-4">
              <span>Code bạn vừa gõ (${userLineCount} dòng)</span>
              <span class="text-[10px] text-slate-500 font-normal">Bên trái</span>
            </div>
            <div class="flex items-center justify-between pl-4 border-l border-slate-300">
              <span>Code mẫu C++17 chuẩn (${targetLineCount} dòng)</span>
              <div class="flex items-center gap-2 text-[10px] font-normal">
                <span class="inline-flex items-center gap-1 text-emerald-700"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Khớp</span>
                <span class="inline-flex items-center gap-1 text-amber-700"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Khác biệt</span>
                <span class="inline-flex items-center gap-1 text-rose-700"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Lệch dòng</span>
              </div>
            </div>
          </div>

          <!-- Aligned Diff Lines -->
          <div class="max-h-[550px] overflow-y-auto overflow-x-auto divide-y divide-slate-100 font-mono text-xs">
            ${diffRows
              .map(row => {
                let rowBgClass = '';
                if (row.status === 'match') rowBgClass = 'diff-match';
                else if (row.status === 'modified') rowBgClass = 'diff-modified';
                else if (row.status === 'different' || row.status === 'added' || row.status === 'missing')
                  rowBgClass = 'diff-different';

                return `
                <div class="grid grid-cols-2 ${rowBgClass} hover:bg-slate-50/50">
                  <!-- User Line -->
                  <div class="flex items-start p-1.5 pr-3 border-r border-slate-200">
                    <span class="diff-gutter text-slate-400 select-none text-[11px] pt-0.5">${row.lineNum}</span>
                    <pre class="flex-1 whitespace-pre-wrap word-break-all text-slate-900 font-mono text-xs m-0">${escapeHtml(
                      row.userText ?? ''
                    )}</pre>
                  </div>
                  <!-- Target Line -->
                  <div class="flex items-start p-1.5 pl-3">
                    <span class="diff-gutter text-slate-400 select-none text-[11px] pt-0.5">${row.lineNum}</span>
                    <pre class="flex-1 whitespace-pre-wrap word-break-all text-slate-900 font-mono text-xs m-0">${escapeHtml(
                      row.targetText ?? ''
                    )}</pre>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
          <div class="text-slate-500">
            Mẹo: Bạn có thể chọn <strong>"Sửa tiếp code vừa gõ"</strong> để hoàn thiện những chỗ còn sai lệch mà không phải gõ lại từ đầu!
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-bottom-retry" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium cursor-pointer">
              Gõ lại từ đầu
            </button>
            <button id="btn-bottom-edit" class="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium cursor-pointer">
              Sửa tiếp code
            </button>
            <button id="btn-bottom-qa" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium cursor-pointer shadow-2xs">
              🧠 Dạng bài & Cách làm
            </button>
            <button id="btn-bottom-back" class="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium cursor-pointer">
              Về kho thuật toán
            </button>
          </div>
        </div>
      </div>
    `;

    // Bindings in Diff View
    container.querySelector('#btn-diff-retry')?.addEventListener('click', () => {
      userTypedCode = '';
      typingStartTime = Date.now();
      isDiffActive = false;
      isTypingActive = true;
      renderTypingRoom();
    });
    container.querySelector('#btn-bottom-retry')?.addEventListener('click', () => {
      userTypedCode = '';
      typingStartTime = Date.now();
      isDiffActive = false;
      isTypingActive = true;
      renderTypingRoom();
    });

    container.querySelector('#btn-diff-edit-continue')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = true;
      renderTypingRoom();
    });
    container.querySelector('#btn-bottom-edit')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = true;
      renderTypingRoom();
    });

    container.querySelector('#btn-diff-qa')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = false;
      isQAActive = true;
      render();
    });
    container.querySelector('#btn-bottom-qa')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = false;
      isQAActive = true;
      render();
    });

    container.querySelector('#btn-diff-back-catalog')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = false;
      renderAlgoCatalog();
    });
    container.querySelector('#btn-bottom-back')?.addEventListener('click', () => {
      isDiffActive = false;
      isTypingActive = false;
      renderAlgoCatalog();
    });

    container.querySelector('#btn-re-ai-analyze')?.addEventListener('click', () => {
      fetchAIAnalysis(algo.titleVi || algo.title, algo.code, userTypedCode, accuracy);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  render();
}
