// View: Kho đề cũ Olympic Tin học Chuyên tin (2020-2025)
// 24 bài đề, lọc theo lần thi/dạng bài/trạng thái, bảng subtask, liên kết 2 chiều thuật toán

import { PAST_PROBLEMS } from '../../data/problems.js';
import { store } from '../store.js';

export function renderProblemsView(container, { onOpenAlgo } = {}) {
  let selectedLan = 'ALL';
  let selectedTag = 'ALL';
  let selectedStatus = 'ALL';
  let searchQuery = '';
  let activeModalProblemId = null;

  function render() {
    const allLans = ['ALL', 29, 30, 31, 32, 33, 34];
    const allTags = ['ALL', 'Toán', 'Quy hoạch động', 'Đồ thị', 'Cấu trúc dữ liệu', 'Xâu ký tự', 'Hình học', 'Cây', 'Bitwise'];
    const allStatuses = [
      { id: 'ALL', label: 'Tất cả trạng thái' },
      { id: 'unsolved', label: 'Chưa làm' },
      { id: 'subtask_only', label: 'Chỉ lấy subtask' },
      { id: 'ac', label: 'Đã AC' },
      { id: 'not_understood', label: 'Chưa hiểu đề' }
    ];

    const filtered = PAST_PROBLEMS.filter(p => {
      const state = store.getProblemState(p.id);
      const matchLan = selectedLan === 'ALL' || p.lan === Number(selectedLan);
      const matchTag = selectedTag === 'ALL' || p.tags.includes(selectedTag);
      const matchStatus = selectedStatus === 'ALL' || state.status === selectedStatus;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techniques.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchLan && matchTag && matchStatus && matchSearch;
    });

    // Counts by status
    let totalAC = 0, totalSubtask = 0, totalNotUnderstood = 0;
    PAST_PROBLEMS.forEach(p => {
      const st = store.getProblemState(p.id).status;
      if (st === 'ac') totalAC++;
      else if (st === 'subtask_only') totalSubtask++;
      else if (st === 'not_understood') totalNotUnderstood++;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Kho Đề Thi Olympic Tin học (2020 - 2025)</h2>
            <p class="text-sm text-slate-600 mt-1">
              24 bài thi chính thức khối Chuyên tin Lần 29 đến Lần 34 kèm bảng phân tích subtasks và thuật toán then chốt.
            </p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium">AC: ${totalAC}/24</span>
            <span class="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">Subtask: ${totalSubtask}/24</span>
            <span class="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded">Chưa hiểu: ${totalNotUnderstood}</span>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white border border-slate-300 rounded p-4 space-y-3">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              id="input-problem-search"
              type="text"
              placeholder="Tìm kiếm bài thi theo tên hoặc kỹ thuật..."
              value="${searchQuery}"
              class="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-700"
            />
            <select id="select-status-filter" class="px-3 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-blue-700">
              ${allStatuses
                .map(
                  s => `<option value="${s.id}" ${selectedStatus === s.id ? 'selected' : ''}>${s.label}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Lần thi buttons -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span class="text-slate-500 font-medium whitespace-nowrap mr-1">Lần thi:</span>
            ${allLans
              .map(
                l => `
              <button data-lan="${l}" class="btn-filter-lan px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                String(selectedLan) === String(l)
                  ? 'bg-blue-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }">
                ${l === 'ALL' ? 'Tất cả năm' : `Lần ${l} (${getYearByLan(l)})`}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- Tags buttons -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span class="text-slate-500 font-medium whitespace-nowrap mr-1">Dạng bài:</span>
            ${allTags
              .map(
                t => `
              <button data-tag="${t}" class="btn-filter-tag px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === t
                  ? 'bg-blue-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }">
                ${t === 'ALL' ? 'Tất cả dạng' : t}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Problems List Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${
            filtered.length === 0
              ? `<div class="col-span-full py-12 text-center text-slate-500">Không có bài thi nào khớp với bộ lọc.</div>`
              : filtered
                  .map(p => {
                    const state = store.getProblemState(p.id);
                    const notes = store.getNotesForRef('problem', p.id);
                    return `
                    <div class="bg-white border border-slate-300 rounded p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <div>
                        <!-- Header badge -->
                        <div class="flex items-center justify-between text-xs mb-2">
                          <span class="font-medium text-slate-600">Lần ${p.lan} (${p.year})</span>
                          ${getStatusBadge(state.status)}
                        </div>

                        <h3 class="font-bold text-slate-900 text-lg leading-snug">${p.title}</h3>

                        <!-- Tags & Techniques -->
                        <div class="mt-2 flex flex-wrap gap-1 text-[11px]">
                          ${p.tags.map(t => `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">${t}</span>`).join('')}
                          ${p.techniques.map(tc => `<span class="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">${tc}</span>`).join('')}
                        </div>

                        <!-- Subtask Preview -->
                        <div class="mt-3 text-xs text-slate-600 bg-slate-50 p-2 rounded space-y-1">
                          <div class="font-semibold text-slate-700">Subtasks (${p.subtasks.length}):</div>
                          ${p.subtasks
                            .slice(0, 2)
                            .map(st => `<div class="truncate">· <span class="font-mono font-medium">${st.pct}%</span>: ${st.desc}</div>`)
                            .join('')}
                          ${p.subtasks.length > 2 ? `<div class="text-slate-400 italic text-[11px]">+ ${p.subtasks.length - 2} subtask khác...</div>` : ''}
                        </div>

                        <!-- Key Insight Counter -->
                        <div class="mt-2 text-xs text-slate-500">
                          Điều then chốt: <span class="font-semibold text-blue-900">${notes.length}</span> ghi chú
                        </div>
                      </div>

                      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button data-problem-id="${p.id}" class="btn-open-problem w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded transition-colors cursor-pointer text-center">
                          Chi tiết subtask & Thuật toán
                        </button>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
          }
        </div>
      </div>

      <!-- Problem Detail Modal -->
      <div id="modal-problem-detail" class="hidden fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
        <div class="bg-white border border-slate-300 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
          <div id="modal-problem-content">
            <!-- Rendered by openProblemModal -->
          </div>
        </div>
      </div>
    `;

    // Bindings
    container.querySelector('#input-problem-search')?.addEventListener('input', e => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelector('#select-status-filter')?.addEventListener('change', e => {
      selectedStatus = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-filter-lan').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLan = btn.getAttribute('data-lan');
        render();
      });
    });

    container.querySelectorAll('.btn-filter-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTag = btn.getAttribute('data-tag');
        render();
      });
    });

    container.querySelectorAll('.btn-open-problem').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-problem-id');
        openProblemModal(id);
      });
    });
  }

  function openProblemModal(problemId) {
    const p = PAST_PROBLEMS.find(item => item.id === problemId);
    if (!p) return;

    activeModalProblemId = problemId;
    const state = store.getProblemState(p.id);
    const modal = container.querySelector('#modal-problem-detail');
    const content = container.querySelector('#modal-problem-content');

    const relatedAlgos = p.algoIds.map(id => store.getAlgoById(id)).filter(Boolean);
    const notes = store.getNotesForRef('problem', p.id);

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b pb-3">
          <div>
            <div class="text-xs text-slate-500 font-medium">Olympic Tin học Sinh viên · Lần ${p.lan} (${p.date})</div>
            <h3 class="text-xl font-bold text-slate-900 mt-0.5">${p.title}</h3>
            <div class="flex flex-wrap gap-1 mt-2 text-xs">
              ${p.tags.map(t => `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">${t}</span>`).join('')}
              ${p.techniques.map(tc => `<span class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-medium">${tc}</span>`).join('')}
            </div>
          </div>
          <button id="btn-close-problem-modal" class="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer">✕</button>
        </div>

        <!-- Problem Status & Personal Note -->
        <div class="bg-slate-50 p-3.5 border border-slate-200 rounded space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-800">Trạng thái của bạn:</span>
            <select id="modal-select-status" class="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-700">
              <option value="unsolved" ${state.status === 'unsolved' ? 'selected' : ''}>Chưa làm</option>
              <option value="subtask_only" ${state.status === 'subtask_only' ? 'selected' : ''}>Chỉ lấy subtask</option>
              <option value="ac" ${state.status === 'ac' ? 'selected' : ''}>Đã AC</option>
              <option value="not_understood" ${state.status === 'not_understood' ? 'selected' : ''}>Chưa hiểu đề</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-800 text-xs mb-1">Ghi chú tự do khi giải bài:</label>
            <textarea id="modal-textarea-note" rows="2" placeholder="Ghi lại bẫy đề, hướng tiếp cận subtask hoặc độ phức tạp..." class="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-700">${state.userNote || ''}</textarea>
          </div>
          <div class="flex justify-end">
            <button id="btn-save-problem-state" class="px-3 py-1 bg-blue-900 text-white rounded text-xs hover:bg-blue-800 cursor-pointer">
              Lưu trạng thái & Ghi chú
            </button>
          </div>
        </div>

        <!-- Subtasks Table -->
        <div>
          <h4 class="font-bold text-slate-900 text-sm mb-2">Bảng Phân rã Subtasks & Tỷ lệ điểm:</h4>
          <div class="border border-slate-200 rounded overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th class="p-2.5 w-16 text-center">Điểm</th>
                  <th class="p-2.5">Giới hạn dữ liệu & Thuật toán mục tiêu</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${p.subtasks
                  .map(
                    st => `
                  <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-mono font-bold text-blue-900 text-center">${st.pct}%</td>
                    <td class="p-2.5 text-slate-700 leading-relaxed">${st.desc}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Related Algorithms (Two-way link) -->
        <div>
          <h4 class="font-bold text-slate-900 text-sm mb-2">Thuật toán C++ liên quan (Template dùng cho bài):</h4>
          <div class="flex flex-wrap gap-2">
            ${
              relatedAlgos.length === 0
                ? `<span class="text-xs text-slate-400 italic">Không có template trực tiếp.</span>`
                : relatedAlgos
                    .map(
                      a => `
                    <button data-algo-id="${a.id}" class="btn-goto-algo flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded text-xs text-blue-900 font-medium transition-colors cursor-pointer">
                      <span>⚡ ${a.title}</span>
                      <span class="text-[10px] text-blue-700 font-normal">(${a.tag})</span>
                    </button>
                  `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- Key Takeaway Notes for this Problem -->
        <div class="border-t pt-3 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-900 text-sm">Sổ "Điều then chốt" của bài này:</h4>
            <button id="btn-add-problem-note" class="text-xs px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 cursor-pointer">
              + Thêm điều then chốt
            </button>
          </div>
          <div id="problem-notes-list" class="space-y-2 text-xs">
            ${
              notes.length === 0
                ? `<div class="text-slate-400 italic">Chưa có ghi chú then chốt nào.</div>`
                : notes
                    .map(
                      n => `
                    <div class="p-2.5 bg-amber-50/70 border border-amber-200 rounded flex items-start justify-between gap-2">
                      <div class="space-y-0.5">
                        <div class="text-slate-900 font-medium">${n.text}</div>
                        <div class="text-[10px] text-slate-500 font-mono">Hộp ôn: ${n.box}/5</div>
                      </div>
                      <button data-note-id="${n.id}" class="btn-del-problem-note text-slate-400 hover:text-rose-700 cursor-pointer">✕</button>
                    </div>
                  `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    // Modal Event Bindings
    content.querySelector('#btn-close-problem-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    content.querySelector('#btn-save-problem-state')?.addEventListener('click', () => {
      const status = content.querySelector('#modal-select-status').value;
      const userNote = content.querySelector('#modal-textarea-note').value;
      store.setProblemState(p.id, { status, userNote });
      alert('Đã lưu trạng thái bài thi thành công!');
      render();
      openProblemModal(p.id);
    });

    content.querySelectorAll('.btn-goto-algo').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        const algoId = btn.getAttribute('data-algo-id');
        if (onOpenAlgo) onOpenAlgo(algoId);
      });
    });

    content.querySelector('#btn-add-problem-note')?.addEventListener('click', () => {
      const text = prompt(`Nhập điều then chốt cho bài "${p.title}":`);
      if (text && text.trim()) {
        store.addNote({ refType: 'problem', refId: p.id, text });
        openProblemModal(p.id);
      }
    });

    content.querySelectorAll('.btn-del-problem-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-note-id');
        store.deleteNote(id);
        openProblemModal(p.id);
      });
    });
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'ac':
        return `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">Đã AC</span>`;
      case 'subtask_only':
        return `<span class="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded">Chỉ lấy subtask</span>`;
      case 'not_understood':
        return `<span class="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded">Chưa hiểu đề</span>`;
      default:
        return `<span class="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded">Chưa làm</span>`;
    }
  }

  function getYearByLan(lan) {
    const map = { 29: 2020, 30: 2022, 31: 2022, 32: 2023, 33: 2024, 34: 2025 };
    return map[lan] || '';
  }

  render();
}
