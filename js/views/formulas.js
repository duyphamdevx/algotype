// View: Sổ công thức tra nhanh (Quick Formula Handbook)
// Định lý Lucas, Legendre, fib(gcd), Zeckendorf, Modular Inverse & Chế độ in tra cứu

import { store } from '../store.js';

export function renderFormulasView(container) {
  let selectedCategory = 'ALL';
  let searchQuery = '';

  function render() {
    const formulas = store.getFormulas();
    const categories = ['ALL', ...new Set(formulas.map(f => f.category))];

    const filtered = formulas.filter(f => {
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
      const matchSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.latex.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Sổ Công Thức Tra Nhanh</h2>
            <p class="text-sm text-slate-600 mt-1">
              Các đẳng thức, định lý toán học và tính chất bitwise kinh điển hay xuất hiện trong các bài thi Olympic Tin học.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-print-formulas" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors cursor-pointer border border-slate-300 flex items-center gap-1.5">
              <span>🖨️ In tài liệu tra cứu</span>
            </button>
            <button id="btn-add-formula" class="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer shadow-xs">
              + Thêm công thức
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <input
            id="search-formula-input"
            type="text"
            placeholder="Tìm kiếm công thức theo tên, tính chất, từ khóa..."
            value="${searchQuery}"
            class="px-3.5 py-2 bg-white border border-slate-300 rounded text-sm w-full sm:max-w-md focus:outline-none focus:border-blue-700"
          />
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            ${categories
              .map(
                c => `
              <button data-cat="${c}" class="btn-formula-cat px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === c
                  ? 'bg-blue-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }">
                ${c === 'ALL' ? 'Tất cả' : c}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Formulas Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${
            filtered.length === 0
              ? `<div class="col-span-full py-12 text-center text-slate-500">Không tìm thấy công thức nào.</div>`
              : filtered
                  .map(f => {
                    return `
                    <div class="bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between hover:shadow-xs transition-shadow space-y-3">
                      <div>
                        <div class="flex items-center justify-between text-xs mb-1">
                          <span class="bg-blue-50 text-blue-900 font-semibold px-2 py-0.5 rounded border border-blue-200">
                            ${f.category}
                          </span>
                          <button data-formula-id="${f.id}" class="btn-delete-formula text-slate-400 hover:text-rose-700 text-xs cursor-pointer p-1" title="Xóa công thức này">
                            ✕
                          </button>
                        </div>

                        <h3 class="font-bold text-slate-900 text-base leading-snug">${f.title}</h3>

                        <!-- Formula Math Box -->
                        <div class="mt-2 p-3 bg-slate-50 border border-slate-200 rounded font-mono text-sm text-center text-blue-950 font-bold overflow-x-auto select-all">
                          ${f.latex}
                        </div>

                        <p class="mt-2.5 text-xs text-slate-700 leading-relaxed">${f.description}</p>

                        ${
                          f.example
                            ? `
                          <div class="mt-2 text-[11px] bg-amber-50/60 border border-amber-200 p-2 rounded text-slate-800">
                            <strong>Ví dụ:</strong> ${f.example}
                          </div>
                        `
                            : ''
                        }
                      </div>

                      ${
                        f.cppSnippet
                          ? `
                        <details class="pt-2 border-t border-slate-100 text-xs">
                          <summary class="font-mono text-blue-900 font-semibold cursor-pointer select-none hover:underline">
                            💻 C++ Snippet cài đặt nhanh
                          </summary>
                          <pre class="mt-2 p-2.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded overflow-x-auto">${escapeHtml(f.cppSnippet)}</pre>
                        </details>
                      `
                          : ''
                      }
                    </div>
                  `;
                  })
                  .join('')
          }
        </div>
      </div>

      <!-- Add Formula Modal -->
      <div id="modal-add-formula" class="hidden fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
        <div class="bg-white border border-slate-300 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b pb-2">
            <h3 class="font-bold text-lg text-slate-900">Thêm Công thức / Tính chất mới</h3>
            <button id="btn-close-formula-modal" class="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer">✕</button>
          </div>
          <div class="space-y-3 text-sm">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tên công thức / định lý</label>
              <input id="input-f-title" type="text" placeholder="Ví dụ: Công thức số Catalan, Định lý Wilson..." class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Chủ đề (Category)</label>
              <input id="input-f-cat" type="text" placeholder="Tổ hợp, Số học, Bitwise, Hình học..." class="w-full px-3 py-1.5 border rounded focus:outline-blue-700" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Biểu thức toán học (Dạng text hoặc LaTeX)</label>
              <input id="input-f-latex" type="text" placeholder="C_n = 1/(n+1) * C(2n, n)" class="w-full px-3 py-1.5 border rounded font-mono text-xs focus:outline-blue-700" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Ý nghĩa & Cách áp dụng</label>
              <textarea id="input-f-desc" rows="3" placeholder="Đếm số cách chia đa giác, số dãy ngoặc đúng..." class="w-full p-2.5 border rounded text-xs focus:outline-blue-700"></textarea>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mã C++ mẫu (tùy chọn)</label>
              <textarea id="input-f-cpp" rows="3" placeholder="// Snippet C++..." class="w-full p-2.5 font-mono border rounded text-xs focus:outline-blue-700"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t">
            <button id="btn-cancel-f-modal" class="px-4 py-2 border rounded text-slate-700 text-sm hover:bg-slate-100 cursor-pointer">Hủy</button>
            <button id="btn-save-f-modal" class="px-4 py-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800 cursor-pointer">Lưu công thức</button>
          </div>
        </div>
      </div>
    `;

    // Bindings
    container.querySelector('#search-formula-input')?.addEventListener('input', e => {
      searchQuery = e.target.value;
      render();
    });

    container.querySelectorAll('.btn-formula-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-cat');
        render();
      });
    });

    container.querySelectorAll('.btn-delete-formula').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-formula-id');
        if (confirm('Xóa công thức này khỏi sổ tay?')) {
          store.deleteFormula(id);
          render();
        }
      });
    });

    container.querySelector('#btn-print-formulas')?.addEventListener('click', () => {
      window.print();
    });

    // Add Modal Bindings
    const modal = container.querySelector('#modal-add-formula');
    container.querySelector('#btn-add-formula')?.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
    container.querySelector('#btn-close-formula-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    container.querySelector('#btn-cancel-f-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    container.querySelector('#btn-save-f-modal')?.addEventListener('click', () => {
      const title = container.querySelector('#input-f-title').value;
      const category = container.querySelector('#input-f-cat').value;
      const latex = container.querySelector('#input-f-latex').value;
      const description = container.querySelector('#input-f-desc').value;
      const cppSnippet = container.querySelector('#input-f-cpp').value;

      if (!title.trim() || !latex.trim()) {
        alert('Vui lòng nhập tên và biểu thức công thức!');
        return;
      }

      store.addFormula({ title, category, latex, description, cppSnippet });
      modal.classList.add('hidden');
      render();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  render();
}
