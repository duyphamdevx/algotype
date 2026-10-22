// View: Luyện gõ template C++, Sửa/Xóa thuật toán, Nhập file .cpp tự tách, Điền khuyết & Câu hỏi tự kiểm

import { store, LEITNER_INTERVALS } from '../store.js';
import { TypingEngine } from '../engine.js';
import { parseFillBlanks } from '../fill_blank.js';

export function renderPracticeView(container, { initialAlgoId = null, initialMode = 'recall' } = {}) {
  let activeAlgoId = initialAlgoId;
  let activeMode = initialMode;
  let isTypingActive = !!initialAlgoId;

  let isFillBlankActive = false;
  let isQAActive = false;
  let fillBlankAutoMask = false;
  let fillBlankUserInputs = {};
  let fillBlankChecked = false;

  let searchQuery = '';
  let selectedTag = 'ALL';

  let typingEngine = null;
  let keydownHandler = null;

  function render() {
    if (isTypingActive && activeAlgoId) {
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
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Kho Template Thuật toán</h2>
            <p class="text-sm text-slate-600 mt-0.5">
              ${allAlgos.length} thuật toán C++17 kèm tên Tiếng Việt & Quốc tế chuẩn. Bạn có thể <strong>thêm mới, sửa đổi, xóa bất kỳ thuật toán nào</strong> hoặc <strong>nhập file .cpp tự động tách đoạn</strong>.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Feature 10: Import .cpp file -->
            <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <span>📥 Nhập từ file .cpp</span>
              <input id="input-import-cpp" type="file" accept=".cpp,.h,.hpp,.txt" class="hidden" />
            </label>
            <button id="btn-reset-default-algos" class="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded transition-colors cursor-pointer" title="Khôi phục lại 35 thuật toán gốc">
              🔄 Khôi phục 35 gốc
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
                            <span>Tự kiểm: <strong class="text-amber-800">${qaCount} câu</strong></span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <!-- Practice Typing buttons -->
                        <div class="flex items-center gap-1.5">
                          <button data-id="${algo.id}" data-mode="recall" class="btn-launch-practice flex-1 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded text-center transition-colors cursor-pointer">
                            Gõ Nhớ
                          </button>
                          <button data-id="${algo.id}" data-mode="copy" class="btn-launch-practice flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded text-center transition-colors cursor-pointer">
                            Gõ Chép
                          </button>
                        </div>

                        <!-- Special Mode Buttons: Fill Blank & QA -->
                        <div class="flex items-center gap-1.5 text-[11px]">
                          <button data-id="${algo.id}" class="btn-launch-fillblank flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium cursor-pointer text-center">
                            ✍️ Điền khuyết
                          </button>
                          <button data-id="${algo.id}" class="btn-launch-qa flex-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded font-medium cursor-pointer text-center">
                            ❓ Tự kiểm (${qaCount})
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
        activeMode = btn.getAttribute('data-mode');
        isTypingActive = true;
        isFillBlankActive = false;
        isQAActive = false;
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

    container.querySelector('#btn-reset-default-algos')?.addEventListener('click', () => {
      if (confirm('Khôi phục lại 35 thuật toán gốc và bộ Stress Test? Các thuật toán bạn đã tự thêm sẽ được giữ nguyên.')) {
        store.resetToDefaultAlgos();
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

  // --- QA ROOM ---
  function renderQARoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo) {
      isQAActive = false;
      renderAlgoCatalog();
      return;
    }

    const qaList = store.getQAForAlgo(algo.id);

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex items-center justify-between border-b border-slate-300 pb-3">
          <div class="flex items-center gap-3">
            <button id="btn-back-qa" class="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer">
              ← Trở về kho
            </button>
            <div>
              <h2 class="font-bold text-slate-900 text-base leading-tight">Câu Hỏi Tự Kiểm: ${algo.titleVi || algo.title}</h2>
              <div class="text-xs text-slate-500">
                Kiểm chứng mức độ hiểu sâu bản chất thuật toán (bất biến, thứ tự, trường hợp biên)
              </div>
            </div>
          </div>
          <button id="btn-add-qa" class="px-3 py-1.5 bg-blue-900 text-white rounded text-xs hover:bg-blue-800 cursor-pointer">
            + Thêm câu hỏi riêng
          </button>
        </div>

        <div class="space-y-4">
          ${
            qaList.length === 0
              ? `
            <div class="bg-white border border-slate-200 rounded p-8 text-center text-slate-500 text-xs">
              Chưa có câu hỏi tự kiểm cho thuật toán này. Bạn có thể tự thêm câu hỏi mới bằng nút phía trên!
            </div>
            `
              : qaList
                  .map((item, idx) => {
                    const isAi = item.status === 'ai_generated_pending_review';
                    return `
                  <div class="bg-white border border-slate-300 rounded-lg p-5 space-y-3 shadow-xs">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-blue-900 text-sm">Câu ${idx + 1}:</span>
                        ${
                          isAi
                            ? `<span class="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded font-medium">Do AI soạn, cần tôi duyệt</span>`
                            : `<span class="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-medium">Đã duyệt</span>`
                        }
                      </div>
                      ${
                        isAi
                          ? `<button data-qa-idx="${idx}" class="btn-approve-qa text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer">✓ Duyệt câu này</button>`
                          : ''
                      }
                    </div>

                    <div class="text-sm font-semibold text-slate-900 leading-relaxed">
                      ${item.q}
                    </div>

                    <div>
                      <textarea rows="2" placeholder="Tự trả lời nhẩm hoặc gõ câu trả lời của bạn vào đây..." class="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-blue-700"></textarea>
                    </div>

                    <details class="pt-2 border-t border-slate-100 text-xs">
                      <summary class="font-semibold text-blue-900 hover:underline cursor-pointer select-none">
                        👁️ Xem đáp án mẫu & Giải thích
                      </summary>
                      <div class="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded text-slate-800 leading-relaxed font-sans">
                        ${item.a}
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

    container.querySelector('#btn-back-qa')?.addEventListener('click', () => {
      isQAActive = false;
      render();
    });

    container.querySelectorAll('.btn-approve-qa').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = Number(btn.getAttribute('data-qa-idx'));
        store.approveQA(algo.id, qIdx);
        renderQARoom();
      });
    });

    container.querySelector('#btn-add-qa')?.addEventListener('click', () => {
      const q = prompt('Nhập câu hỏi tự kiểm:');
      if (!q || !q.trim()) return;
      const a = prompt('Nhập đáp án mẫu:');
      if (!a || !a.trim()) return;
      store.addQAForAlgo(algo.id, { q, a });
      renderQARoom();
    });
  }

  // --- TYPING ROOM (Multi-line Code Editor Experience) ---
  function renderTypingRoom() {
    const algo = store.getAlgoById(activeAlgoId);
    if (!algo) {
      isTypingActive = false;
      renderAlgoCatalog();
      return;
    }

    const stat = store.db.stats[algo.id] || { box: 0, last: 0, runs: 0, bw: 0 };
    const autoIndent = store.db.set.auto ?? true;
    let editorTheme = store.db.set.editorTheme || 'dark'; // 'dark' (VS Code) | 'light' (Paper)
    let ghostGuide = store.db.set.ghostGuide !== false; // true: subtle ghost structure in Recall mode

    typingEngine = new TypingEngine({
      targetCode: algo.code,
      mode: activeMode,
      autoIndent,
      onUpdate: () => renderTypingDisplay(),
      onComplete: metrics => showCompletionModal(metrics)
    });

    const safeFileName = (algo.id || 'template').replace(/[^a-zA-Z0-9_]/g, '_') + '.cpp';

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Room Top Control Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-300 p-3 rounded">
          <div class="flex items-center gap-3">
            <button id="btn-back-to-catalog" class="text-xs font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer">
              ← Trở về kho
            </button>
            <div>
              <h2 class="font-bold text-slate-900 text-base leading-tight">
                ${algo.titleVi || algo.title}
                ${algo.titleVi && algo.titleVi !== algo.title ? `<span class="text-xs font-normal text-slate-500 font-mono block sm:inline">(${algo.title})</span>` : ''}
              </h2>
              <div class="text-xs text-slate-500">
                ${algo.tag} · Mức Leitner: <span class="font-semibold text-slate-800">${stat.box}/5</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs">
            <!-- Mode Switcher -->
            <div class="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
              <button id="toggle-mode-copy" class="px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeMode === 'copy' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                📝 Chế độ Chép (Code mẫu)
              </button>
              <button id="toggle-mode-recall" class="px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                activeMode === 'recall' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }">
                🧠 Chế độ Nhớ (Phản xạ)
              </button>
            </div>

            <label class="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <input id="chk-auto-indent" type="checkbox" ${autoIndent ? 'checked' : ''} />
              <span>Tự thụt lề (Auto-Indent)</span>
            </label>

            ${
              activeMode === 'recall'
                ? `
              <label class="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <input id="chk-ghost-guide" type="checkbox" ${ghostGuide ? 'checked' : ''} />
                <span>Bóng mờ mờ dẫn đường</span>
              </label>
              <button id="btn-reveal-full-code" class="px-2.5 py-1 text-slate-700 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-100 cursor-pointer">
                👁️ Hiện toàn bộ code
              </button>
            `
                : ''
            }
          </div>
        </div>

        <!-- Real-time HUD Metrics -->
        <div class="grid grid-cols-4 gap-2 text-center text-xs">
          <div class="bg-white border border-slate-200 p-2 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Tốc độ (WPM)</div>
            <div id="hud-wpm" class="text-lg font-bold font-mono text-blue-900">0</div>
          </div>
          <div class="bg-white border border-slate-200 p-2 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Độ chính xác</div>
            <div id="hud-acc" class="text-lg font-bold font-mono text-emerald-700">100%</div>
          </div>
          <div class="bg-white border border-slate-200 p-2 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Lỗi gõ</div>
            <div id="hud-errors" class="text-lg font-bold font-mono text-rose-700">0</div>
          </div>
          <div class="bg-white border border-slate-200 p-2 rounded shadow-2xs">
            <div class="text-slate-500 font-medium">Tiến độ</div>
            <div id="hud-progress" class="text-lg font-bold font-mono text-slate-800">0%</div>
          </div>
        </div>

        <!-- Professional Code Editor Window -->
        <div id="code-editor-root" class="code-editor ${editorTheme === 'dark' ? 'theme-dark' : 'theme-light'}">
          <!-- Editor Header Bar -->
          <div class="editor-topbar px-4 py-2 flex items-center justify-between text-xs select-none">
            <div class="flex items-center gap-3">
              <!-- Window Dots -->
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span class="font-mono font-semibold flex items-center gap-1.5 ml-1">
                <span class="text-blue-500 font-bold">C++</span> ${safeFileName}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${
                activeMode === 'copy'
                  ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              } font-sans font-medium">
                ${activeMode === 'copy' ? 'Chế độ Chép (Hiển thị đầy đủ code)' : 'Chế độ Nhớ (Gõ thuộc lòng)'}
              </span>
            </div>

            <div class="flex items-center gap-3 font-mono">
              <span id="editor-cursor-pos" class="text-[11px] opacity-80">Dòng 1, Cột 1</span>
              <button id="btn-toggle-editor-theme" class="px-2.5 py-1 rounded text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-200/40 dark:hover:bg-slate-700/50 cursor-pointer font-sans transition-colors">
                ${editorTheme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 VS Code Tối'}
              </button>
            </div>
          </div>

          <!-- Multi-line Code Lines Viewport -->
          <div
            id="typing-canvas"
            tabindex="0"
            class="editor-viewport"
            title="Nhấp vào đây và bắt đầu gõ code theo mẫu..."
          >
          </div>

          <!-- Editor Footer Status Bar -->
          <div class="editor-topbar border-t px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] select-none opacity-85 font-mono">
            <div class="flex items-center gap-3">
              <span>UTF-8</span>
              <span>C++17 (g++ -O3)</span>
              <span>Tab: 4 spaces</span>
            </div>
            <div class="flex items-center gap-3 font-sans text-xs">
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">↵ Enter</kbd>: Xuống dòng</span>
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">⇥ Tab</kbd>: Thụt lề</span>
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">⌫ Backspace</kbd>: Sửa lỗi</span>
              <span><kbd class="px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono">Esc</kbd>: Gợi ý 12 ký tự</span>
            </div>
          </div>
        </div>

        <!-- Hint & Help Bar -->
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <span class="italic">💡 Bạn có thể nhấp chuột vào khung soạn thảo bất kỳ lúc nào để bắt đầu gõ bàn phím.</span>
          <span id="hint-indicator" class="text-amber-700 font-semibold"></span>
        </div>

        <!-- Algo Notes List -->
        <div class="bg-white border border-slate-200 rounded p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-slate-900 text-sm">Điều then chốt đã gắn cho thuật toán này:</h4>
            <button id="btn-add-algo-note" class="text-xs px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 cursor-pointer">
              + Thêm ghi chú then chốt
            </button>
          </div>
          <div id="algo-notes-list" class="space-y-2 text-xs">
          </div>
        </div>
      </div>

      <!-- Completion Modal -->
      <div id="modal-completion" class="hidden fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
        <div class="bg-white border-2 border-slate-400 rounded-lg max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div class="text-4xl">🎯</div>
          <h3 class="text-xl font-bold text-slate-900 font-serif">Hoàn thành bài gõ!</h3>
          <div id="modal-completion-body" class="text-sm text-slate-600 space-y-2"></div>
          <div class="flex items-center gap-3 pt-3">
            <button id="btn-modal-qa" class="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold rounded cursor-pointer">
              ❓ Câu hỏi tự kiểm
            </button>
            <button id="btn-modal-retry" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded transition-colors cursor-pointer">
              Gõ lại
            </button>
            <button id="btn-modal-back" class="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium rounded transition-colors cursor-pointer">
              Về danh sách
            </button>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#typing-canvas');
    const editorRoot = container.querySelector('#code-editor-root');
    editorRoot?.addEventListener('click', () => canvas.focus());
    canvas.focus();

    if (keydownHandler) {
      window.removeEventListener('keydown', keydownHandler);
    }
    keydownHandler = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      typingEngine.handleKeyDown(e);
    };
    window.addEventListener('keydown', keydownHandler);

    renderTypingDisplay();
    renderAlgoNotesList(algo.id);

    container.querySelector('#btn-back-to-catalog')?.addEventListener('click', () => {
      isTypingActive = false;
      render();
    });

    container.querySelector('#toggle-mode-recall')?.addEventListener('click', () => {
      activeMode = 'recall';
      isTypingActive = true;
      renderTypingRoom();
    });

    container.querySelector('#toggle-mode-copy')?.addEventListener('click', () => {
      activeMode = 'copy';
      isTypingActive = true;
      renderTypingRoom();
    });

    container.querySelector('#chk-auto-indent')?.addEventListener('change', e => {
      store.updateSettings({ auto: e.target.checked });
      typingEngine.autoIndent = e.target.checked;
    });

    container.querySelector('#chk-ghost-guide')?.addEventListener('change', e => {
      store.updateSettings({ ghostGuide: e.target.checked });
      ghostGuide = e.target.checked;
      renderTypingDisplay();
    });

    container.querySelector('#btn-toggle-editor-theme')?.addEventListener('click', () => {
      const nextTheme = editorTheme === 'dark' ? 'light' : 'dark';
      store.updateSettings({ editorTheme: nextTheme });
      editorTheme = nextTheme;
      if (editorRoot) {
        editorRoot.className = `code-editor ${editorTheme === 'dark' ? 'theme-dark' : 'theme-light'}`;
      }
      container.querySelector('#btn-toggle-editor-theme').textContent =
        editorTheme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 VS Code Tối';
      canvas.focus();
    });

    container.querySelector('#btn-reveal-full-code')?.addEventListener('click', () => {
      if (confirm('Xem toàn bộ code sẽ đánh dấu bài này là đã xem gợi ý và không được tăng mức Leitner. Bạn có chắc không?')) {
        typingEngine.revealFullCode();
        canvas.focus();
      }
    });

    container.querySelector('#btn-add-algo-note')?.addEventListener('click', () => {
      const text = prompt('Nhập điều then chốt / mẹo nhớ cho thuật toán này:');
      if (text && text.trim()) {
        store.addNote({ refType: 'algo', refId: algo.id, text });
        renderAlgoNotesList(algo.id);
      }
    });
  }

  function renderAlgoNotesList(algoId) {
    const listEl = container.querySelector('#algo-notes-list');
    if (!listEl) return;
    const notes = store.getNotesForRef('algo', algoId);
    if (notes.length === 0) {
      listEl.innerHTML = `<span class="text-slate-400 italic">Chưa có ghi chú nào. Hãy thêm các tính chất quan trọng để ôn lại định kỳ.</span>`;
      return;
    }
    listEl.innerHTML = notes
      .map(
        n => `
      <div class="p-2.5 bg-amber-50/60 border border-amber-200 rounded flex items-start justify-between gap-2">
        <span class="text-slate-800 leading-relaxed">${n.text}</span>
        <button data-note-id="${n.id}" class="btn-del-note text-slate-400 hover:text-rose-700 cursor-pointer">✕</button>
      </div>
    `
      )
      .join('');

    listEl.querySelectorAll('.btn-del-note').forEach(btn => {
      btn.addEventListener('click', () => {
        store.deleteNote(btn.getAttribute('data-note-id'));
        renderAlgoNotesList(algoId);
      });
    });
  }

  // --- MULTI-LINE CODE DISPLAY ENGINE ---
  function renderTypingDisplay() {
    const canvas = container.querySelector('#typing-canvas');
    if (!canvas || !typingEngine) return;

    const metrics = typingEngine.getMetrics();
    const targetCode = typingEngine.targetCode;
    const pos = typingEngine.pos;
    const isRecall = typingEngine.mode === 'recall' && !typingEngine.fullCodeRevealed;
    const hintUntil = typingEngine.hintRevealedUntil;
    const ghostGuide = store.db.set.ghostGuide !== false;
    const lastError = typingEngine.lastError;

    // HUD Stats
    const wpmEl = container.querySelector('#hud-wpm');
    if (wpmEl) wpmEl.textContent = metrics.wpm;
    const accEl = container.querySelector('#hud-acc');
    if (accEl) accEl.textContent = metrics.acc + '%';
    const errEl = container.querySelector('#hud-errors');
    if (errEl) errEl.textContent = metrics.errors;
    const pct = Math.round((pos / Math.max(1, targetCode.length)) * 100);
    const progEl = container.querySelector('#hud-progress');
    if (progEl) progEl.textContent = pct + '%';

    const hintEl = container.querySelector('#hint-indicator');
    if (hintEl) {
      if (typingEngine.usedHint) {
        hintEl.textContent = 'Đã dùng gợi ý (Bài này không lên mức Leitner)';
      } else {
        hintEl.textContent = '';
      }
    }

    // Split targetCode into real lines
    const rawLines = targetCode.split('\n');
    let cumulativeIdx = 0;
    const lines = rawLines.map((lineText, idx) => {
      const start = cumulativeIdx;
      const len = lineText.length;
      const hasNewline = idx < rawLines.length - 1;
      const end = start + len + (hasNewline ? 1 : 0);
      cumulativeIdx = end;
      return { lineNum: idx + 1, text: lineText, start, end, hasNewline };
    });

    // Locate active line
    let activeLineIdx = lines.findIndex(l => pos >= l.start && (pos < l.end || (!l.hasNewline && pos === l.end)));
    if (activeLineIdx === -1) activeLineIdx = Math.max(0, lines.length - 1);
    const activeLine = lines[activeLineIdx] || lines[0];

    // Update Topbar Line & Col counter
    const cursorLineEl = container.querySelector('#editor-cursor-pos');
    if (cursorLineEl && activeLine) {
      const col = Math.max(1, pos - activeLine.start + 1);
      cursorLineEl.textContent = `Dòng ${activeLine.lineNum}, Cột ${col}`;
    }

    // Render multi-line code editor DOM
    let html = '';
    for (let li = 0; li < lines.length; li++) {
      const l = lines[li];
      const isActive = li === activeLineIdx;

      html += `<div class="editor-line ${isActive ? 'is-active' : ''}" data-line="${l.lineNum}">`;
      html += `<div class="editor-gutter"><span class="editor-gutter-num">${l.lineNum}</span></div>`;
      html += `<div class="editor-code-content">`;

      // Render line characters
      for (let ci = 0; ci < l.text.length; ci++) {
        const i = l.start + ci;
        const ch = l.text[ci];

        if (i < pos) {
          html += `<span class="char-typed">${escapeHtml(ch)}</span>`;
        } else if (i === pos) {
          const cls = lastError ? 'char-error' : 'char-cursor cursor-blink';
          html += `<span class="${cls}">${escapeHtml(ch)}</span>`;
        } else {
          if (isRecall) {
            if (i < hintUntil) {
              html += `<span class="char-hint">${escapeHtml(ch)}</span>`;
            } else if (ghostGuide) {
              html += `<span class="char-ghost">${escapeHtml(ch)}</span>`;
            } else {
              html += `<span class="char-hidden">${escapeHtml(ch)}</span>`;
            }
          } else {
            html += `<span class="char-untyped">${escapeHtml(ch)}</span>`;
          }
        }
      }

      // Trailing newline
      if (l.hasNewline) {
        const nlIdx = l.start + l.text.length;
        if (pos === nlIdx) {
          const cls = lastError ? 'char-error' : 'char-cursor cursor-blink';
          html += `<span class="${cls} char-enter-symbol" title="Nhấn Enter để xuống dòng">↵</span>`;
        } else if (l.text.length === 0) {
          // Empty blank line
          html += `<span class="opacity-30 text-[10px] select-none font-mono">↵</span>`;
        }
      }

      html += `</div></div>`;
    }

    canvas.innerHTML = html;

    // Smooth autoscroll to keep active line comfortably in view
    const activeLineEl = canvas.querySelector(`.editor-line[data-line="${activeLine.lineNum}"]`);
    if (activeLineEl) {
      const canvasRect = canvas.getBoundingClientRect();
      const lineRect = activeLineEl.getBoundingClientRect();
      if (lineRect.top < canvasRect.top + 50 || lineRect.bottom > canvasRect.bottom - 50) {
        activeLineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function showCompletionModal(metrics) {
    const modal = container.querySelector('#modal-completion');
    const body = container.querySelector('#modal-completion-body');
    if (!modal || !body) return;

    const algo = store.getAlgoById(activeAlgoId);
    const prevStat = store.db.stats[algo.id] || { box: 0 };
    const prevBox = prevStat.box || 0;

    store.recordTypingRun({
      id: algo.id,
      mode: activeMode,
      wpm: metrics.wpm,
      acc: metrics.acc,
      usedHint: metrics.usedHint
    });

    const newStat = store.db.stats[algo.id] || { box: 0 };
    const newBox = newStat.box || 0;

    let boxFeedback = '';
    if (activeMode === 'recall') {
      if (newBox > prevBox) {
        boxFeedback = `<div class="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-semibold">🎉 Lên Hộp ${newBox}/5! Chu kỳ ôn tiếp: ${
          LEITNER_INTERVALS[newBox]
        } ngày.</div>`;
      } else if (metrics.usedHint) {
        boxFeedback = `<div class="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded">Bạn đã dùng phím gợi ý / xem trước code nên mức hộp giữ nguyên (${prevBox}/5).</div>`;
      } else if (metrics.acc < 95) {
        boxFeedback = `<div class="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded">Độ chính xác < 95% nên hộp giảm về ${newBox}/5 để củng cố lại.</div>`;
      } else {
        boxFeedback = `<div class="p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded">Đã đạt mức tối đa (Hộp 5/5).</div>`;
      }
    } else {
      boxFeedback = `<div class="p-2 bg-slate-50 border border-slate-200 text-slate-700 rounded">Chế độ Chép hoàn tất. Hãy thử thách bằng "Chế độ Nhớ" để thăng hạng hộp Leitner!</div>`;
    }

    body.innerHTML = `
      <div class="grid grid-cols-2 gap-2 text-left bg-slate-50 p-3 rounded text-xs mb-3">
        <div>Tốc độ gõ: <strong class="font-mono text-slate-900">${metrics.wpm} WPM</strong></div>
        <div>Độ chính xác: <strong class="font-mono text-slate-900">${metrics.acc}%</strong></div>
        <div>Lỗi bấm sai: <strong class="font-mono text-rose-700">${metrics.errors}</strong></div>
        <div>Thời gian: <strong class="font-mono text-slate-900">${Math.round(metrics.elapsedMs / 1000)}s</strong></div>
      </div>
      ${boxFeedback}
    `;

    modal.classList.remove('hidden');

    container.querySelector('#btn-modal-qa')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      isTypingActive = false;
      isQAActive = true;
      render();
    });

    container.querySelector('#btn-modal-retry')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      renderTypingRoom();
    });

    container.querySelector('#btn-modal-back')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      isTypingActive = false;
      render();
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
