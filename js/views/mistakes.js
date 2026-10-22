// View: Sổ lỗi thực chiến (Mistake Tracker & Post-Mortem Log)
// Ghi nhận sai lầm khi luyện thi & Thống kê tần suất theo tuần

import { store } from '../store.js';
import { PAST_PROBLEMS } from '../../data/problems.js';

export const MISTAKE_CATEGORIES = [
  { id: 'overflow', label: 'Tràn số (Overflow long long / __int128)' },
  { id: 'mod_missing', label: 'Thiếu phép chia Modulo / Quên cộng MOD khi âm' },
  { id: 'edge_case', label: 'Thiếu trường hợp biên (N=1, K=0, r<l, đồ thị không liên thông)' },
  { id: 'tle', label: 'Quá thời gian (TLE - Không tối ưu I/O hoặc độ phức tạp cao)' },
  { id: 'impl_bug', label: 'Lỗi cài đặt (Bug chỉ số 0/1, biến toàn cục, mảng nhỏ)' },
  { id: 'read_wrong', label: 'Đọc sai đề / Hiểu nhầm điều kiện' },
  { id: 'wrong_algo', label: 'Sai thuật toán / Tham lam sai' },
  { id: 'not_understood', label: 'Chưa hiểu đề bài' }
];

export function renderMistakesView(container) {
  let selectedCategoryFilter = 'ALL';

  function render() {
    const mistakes = store.db.mistakes || [];
    const { weeklyCounts, totalCounts } = store.getWeeklyMistakeStats();

    const filtered = mistakes.filter(m => {
      return selectedCategoryFilter === 'ALL' || m.category === selectedCategoryFilter;
    });

    // Sort categories by weekly frequency
    const sortedCategories = [...MISTAKE_CATEGORIES].sort((a, b) => {
      const countA = weeklyCounts[a.id] || 0;
      const countB = weeklyCounts[b.id] || 0;
      return countB - countA;
    });

    const totalWeeklyMistakes = Object.values(weeklyCounts).reduce((a, b) => a + b, 0);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Sổ Lỗi Thực Chiến</h2>
            <p class="text-sm text-slate-600 mt-1">
              Ghi nhận các sai lầm và bẫy đề thi khi luyện đề để triệt tiêu phản xạ sai.
            </p>
          </div>
          <button id="btn-open-add-mistake" class="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white font-medium text-sm rounded transition-colors cursor-pointer">
            + Ghi nhận lỗi mới
          </button>
        </div>

        <!-- Weekly Insights & Statistics Banner -->
        <div class="bg-white border border-slate-300 rounded-lg p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 class="font-bold text-slate-900 text-base">Thống kê loại lỗi lặp lại trong 7 ngày qua (${totalWeeklyMistakes} lỗi)</h3>
            <span class="text-xs text-slate-500">Giúp nhận diện lỗ hổng tư duy cần khắc phục trước ngày thi</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${sortedCategories
              .map(cat => {
                const countWeek = weeklyCounts[cat.id] || 0;
                const countTotal = totalCounts[cat.id] || 0;
                const pct = totalWeeklyMistakes > 0 ? Math.round((countWeek / totalWeeklyMistakes) * 100) : 0;
                return `
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-slate-800">${cat.label}</span>
                    <span class="font-mono text-slate-600">
                      <strong>${countWeek}</strong> tuần này (${pct}%) · Tổng: ${countTotal}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div class="bg-rose-600 h-full transition-all" style="width: ${pct}%"></div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Filter & Mistake Log List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-lg">Nhật ký lỗi chi tiết (${filtered.length})</h3>
            <select id="select-category-filter" class="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-700">
              <option value="ALL">Tất cả các loại lỗi</option>
              ${MISTAKE_CATEGORIES.map(c => `<option value="${c.id}" ${selectedCategoryFilter === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
            </select>
          </div>

          <div class="space-y-3">
            ${
              filtered.length === 0
                ? `<div class="bg-white border border-slate-200 rounded p-8 text-center text-slate-500">Chưa có lỗi nào được ghi nhận trong danh mục này.</div>`
                : filtered
                    .map(m => {
                      const catObj = MISTAKE_CATEGORIES.find(c => c.id === m.category) || { label: m.category };
                      let refTitle = '';
                      if (m.refId) {
                        const prob = PAST_PROBLEMS.find(p => p.id === m.refId);
                        if (prob) refTitle = `Bài thi: ${prob.title} (Lần ${prob.lan})`;
                        else {
                          const al = store.getAlgoById(m.refId);
                          if (al) refTitle = `Thuật toán: ${al.title}`;
                        }
                      }
                      return `
                      <div class="bg-white border border-slate-300 rounded p-4 flex items-start justify-between gap-4 hover:border-slate-400 transition-colors">
                        <div class="space-y-1.5 flex-1">
                          <div class="flex flex-wrap items-center gap-2 text-xs">
                            <span class="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-semibold">
                              ${catObj.label}
                            </span>
                            <span class="text-slate-400 font-mono">${m.date}</span>
                            ${
                              refTitle
                                ? `<span class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-medium">${refTitle}</span>`
                                : ''
                            }
                          </div>
                          <p class="text-slate-800 text-sm leading-relaxed">${m.note}</p>
                        </div>
                        <button data-id="${m.id}" class="btn-delete-mistake text-slate-400 hover:text-rose-700 text-sm cursor-pointer p-1" title="Xóa lỗi này">
                          ✕
                        </button>
                      </div>
                    `;
                    })
                    .join('')
            }
          </div>
        </div>
      </div>

      <!-- Add Mistake Modal -->
      <div id="modal-add-mistake" class="hidden fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between border-b pb-2">
            <h3 class="font-bold text-lg text-slate-900">Ghi nhận sai lầm thi đấu mới</h3>
            <button id="btn-close-mistake-modal" class="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3 text-sm">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Loại sai sót</label>
              <select id="input-mistake-category" class="w-full px-3 py-2 border rounded focus:outline-blue-700 bg-white">
                ${MISTAKE_CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Bài thi hoặc thuật toán liên quan (tùy chọn)</label>
              <select id="input-mistake-ref" class="w-full px-3 py-2 border rounded focus:outline-blue-700 bg-white text-xs">
                <option value="">-- Không gắn cụ thể --</option>
                <optgroup label="24 Bài đề thi 2020-2025">
                  ${PAST_PROBLEMS.map(p => `<option value="${p.id}">Lần ${p.lan} (${p.year}): ${p.title}</option>`).join('')}
                </optgroup>
                <optgroup label="35 Template thuật toán C++">
                  ${store.getAllAlgos().map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
                </optgroup>
              </select>
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Ngày gặp lỗi</label>
              <input id="input-mistake-date" type="date" value="${new Date().toISOString().slice(0, 10)}" class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
            </div>

            <div>
              <label class="block font-medium text-slate-700 mb-1">Mô tả cụ thể sai lầm & cách khắc phục:</label>
              <textarea id="input-mistake-note" rows="4" placeholder="Ví dụ: Đọc sót điều kiện A[i] có thể âm nên khởi tạo ans = 0 thay vì -INF, dẫn đến WA test 5..." class="w-full p-2.5 border rounded text-xs focus:outline-blue-700"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t">
            <button id="btn-cancel-mistake" class="px-4 py-2 border rounded text-slate-700 text-sm hover:bg-slate-100 cursor-pointer">Hủy</button>
            <button id="btn-save-mistake" class="px-4 py-2 bg-rose-800 text-white rounded text-sm hover:bg-rose-700 cursor-pointer">Lưu vào sổ lỗi</button>
          </div>
        </div>
      </div>
    `;

    // Filter binding
    container.querySelector('#select-category-filter')?.addEventListener('change', e => {
      selectedCategoryFilter = e.target.value;
      render();
    });

    // Delete mistake
    container.querySelectorAll('.btn-delete-mistake').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Xóa mục lỗi này?')) {
          store.deleteMistake(id);
          render();
        }
      });
    });

    // Modal bindings
    const modal = container.querySelector('#modal-add-mistake');
    container.querySelector('#btn-open-add-mistake')?.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
    container.querySelector('#btn-close-mistake-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    container.querySelector('#btn-cancel-mistake')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    container.querySelector('#btn-save-mistake')?.addEventListener('click', () => {
      const category = container.querySelector('#input-mistake-category').value;
      const refId = container.querySelector('#input-mistake-ref').value;
      const date = container.querySelector('#input-mistake-date').value;
      const note = container.querySelector('#input-mistake-note').value;

      if (!note.trim()) {
        alert('Vui lòng nhập mô tả lỗi!');
        return;
      }

      store.addMistake({ category, refId, date, note });
      modal.classList.add('hidden');
      render();
    });
  }

  render();
}
