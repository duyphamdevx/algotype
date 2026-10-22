// View: Chế độ Bài biến thể (Algorithm Variant Drills)
// Đối chiếu Side-by-side Diff và So khớp lỏng cú pháp & Đổi tên biến 1-1 (Feature 5)

import { BUILTIN_VARIANTS } from '../../data/variants.js';
import { store } from '../store.js';
import { computeSideBySideDiff } from '../engine.js';
import { looseMatchCpp } from '../loose_matcher.js';

export function renderVariantsView(container) {
  let selectedVariantId = BUILTIN_VARIANTS[0].id;
  let userCodes = {};
  let isDiffMode = false;
  let activeDiffTab = 'loose'; // 'loose' | 'sidebyside'
  let diffResult = null;
  let looseResult = null;

  function render() {
    const currentVariant = BUILTIN_VARIANTS.find(v => v.id === selectedVariantId) || BUILTIN_VARIANTS[0];
    const baseAlgo = store.getAlgoById(currentVariant.baseAlgoId);
    const currentUserCode = userCodes[currentVariant.id] ?? baseAlgo?.code ?? '';

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Bài Tập Biến Thể</h2>
            <p class="text-sm text-slate-600 mt-1">
              Rèn luyện sửa đổi template C++ theo yêu cầu đặc thù của bài toán. Hỗ trợ <strong>so khớp lỏng bỏ qua khoảng trắng/comment và chấp nhận đổi tên biến nhất quán</strong>.
            </p>
          </div>
          <div class="text-xs text-slate-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
            Đang chọn: <strong class="text-blue-900">${currentVariant.title}</strong>
          </div>
        </div>

        <!-- Variant Selector Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          ${BUILTIN_VARIANTS.map(
            v => `
            <button data-variant-id="${v.id}" class="btn-select-variant px-3 py-2 rounded transition-colors whitespace-nowrap cursor-pointer ${
              v.id === selectedVariantId
                ? 'bg-blue-900 text-white font-medium shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }">
              ${v.title}
            </button>
          `
          ).join('')}
        </div>

        <!-- Requirement Box -->
        <div class="bg-amber-50/80 border border-amber-200 rounded-lg p-4 space-y-2 text-sm">
          <div class="font-bold text-amber-950 flex items-center gap-2">
            <span>📋 Yêu cầu biến thể từ đề bài:</span>
          </div>
          <pre class="text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed bg-white/70 p-3 rounded border border-amber-200">${currentVariant.prompt}</pre>
        </div>

        <!-- Main Workspace (Editor Mode vs Diff Mode) -->
        ${
          !isDiffMode
            ? `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Left: Base Template Reference -->
            <div class="bg-white border border-slate-300 rounded p-4 flex flex-col">
              <div class="flex items-center justify-between border-b pb-2 mb-2 text-xs">
                <span class="font-bold text-slate-700">Mã nguồn gốc tham khảo (${baseAlgo ? baseAlgo.title : 'Template'})</span>
                <span class="text-slate-400">Chỉ đọc</span>
              </div>
              <textarea
                readonly
                rows="22"
                class="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded p-3 text-slate-700 focus:outline-none select-all leading-relaxed"
              >${baseAlgo ? baseAlgo.code : ''}</textarea>
            </div>

            <!-- Right: Freeform User Code Editor -->
            <div class="bg-white border border-slate-300 rounded p-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between border-b pb-2 mb-2 text-xs">
                  <span class="font-bold text-blue-900">Bản sửa đổi của bạn:</span>
                  <span class="text-slate-500">Tự do chỉnh sửa mã nguồn</span>
                </div>
                <textarea
                  id="textarea-user-code"
                  rows="22"
                  placeholder="// Hãy sửa template để đáp ứng yêu cầu biến thể..."
                  class="w-full font-mono text-xs bg-white border border-slate-300 rounded p-3 text-slate-900 focus:outline-none focus:border-blue-700 leading-relaxed"
                >${currentUserCode}</textarea>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button id="btn-reset-to-base" class="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border rounded cursor-pointer">
                  Khôi phục code gốc
                </button>
                <button id="btn-run-diff" class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded transition-colors cursor-pointer flex items-center gap-2">
                  <span>Đối chiếu & So khớp lỏng</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        `
            : `
          <!-- Comparison & Loose Match Analysis View -->
          <div class="bg-white border border-slate-300 rounded-lg p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 class="font-bold text-slate-900 text-lg">Kết quả Đối chiếu & Phân tích cú pháp</h3>
                <div class="flex items-center gap-3 text-xs mt-1">
                  <span>Khớp lỏng token: <strong class="text-blue-900 font-mono text-sm">${looseResult?.similarityPct}%</strong></span>
                  <span>Khớp dòng trực quan: <strong class="text-slate-700 font-mono text-sm">${diffResult?.similarityPct}%</strong></span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Tab switchers -->
                <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
                  <button id="btn-tab-loose" class="px-3 py-1 rounded transition-colors ${
                    activeDiffTab === 'loose' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }">
                    🔍 So khớp lỏng & Đổi tên biến
                  </button>
                  <button id="btn-tab-sidebyside" class="px-3 py-1 rounded transition-colors ${
                    activeDiffTab === 'sidebyside' ? 'bg-blue-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }">
                    📑 So sánh song song
                  </button>
                </div>
                <button id="btn-back-to-edit" class="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-medium rounded hover:bg-slate-300 cursor-pointer">
                  ← Sửa tiếp
                </button>
              </div>
            </div>

            <!-- Tab 1: Loose Matcher Analysis (Feature 5) -->
            <div class="${activeDiffTab === 'loose' ? 'block' : 'hidden'} space-y-4">
              <!-- Summary Card -->
              <div class="p-4 rounded-lg border ${
                looseResult?.isStructurallyIdentical
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : looseResult?.similarityPct >= 85
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }">
                <div class="font-bold text-sm flex items-center gap-2">
                  <span>${looseResult?.isStructurallyIdentical ? '🎉 Khớp cấu trúc hoàn hảo!' : 'Đánh giá so khớp lỏng:'}</span>
                </div>
                <div class="text-xs mt-1 leading-relaxed">
                  Đã chuẩn hóa khoảng trắng, loại bỏ chú thích (comments), tách token C++.
                  ${
                    looseResult?.isStructurallyIdentical
                      ? 'Mọi từ khóa, toán tử, logic điều khiển và tên biến đều khớp chính xác (hoặc được đổi tên một cách nhất quán 1-1).'
                      : `Đạt ${looseResult?.similarityPct}% độ tương đồng cấu trúc token (${looseResult?.matchedTokens}/${looseResult?.totalExpectedTokens} token khớp).`
                  }
                </div>
              </div>

              <!-- Bijective Renaming Table -->
              <div class="border border-slate-200 rounded p-4 space-y-2 bg-slate-50/50">
                <div class="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Bảng ánh xạ đổi tên biến nhận diện được (Bijective 1-to-1 Mapping):</span>
                  <span class="text-slate-500 font-normal">
                    ${looseResult?.renamingList.length === 0 ? 'Dùng đúng tên gốc' : `${looseResult?.renamingList.length} biến đổi tên`}
                  </span>
                </div>
                ${
                  looseResult?.renamingList.length === 0
                    ? `<div class="text-xs text-slate-500 italic">Bạn dùng đúng toàn bộ tên định danh như trong lời giải mẫu (không đổi tên).</div>`
                    : `
                  <div class="flex flex-wrap gap-2 text-xs">
                    ${looseResult.renamingList
                      .map(
                        r => `
                      <span class="bg-white border border-slate-300 px-2.5 py-1 rounded font-mono shadow-2xs">
                        <span class="text-slate-500">${r.solVar}</span>
                        <span class="text-blue-900 font-bold mx-1">↔</span>
                        <span class="text-emerald-700 font-semibold">${r.userVar}</span>
                      </span>
                    `
                      )
                      .join('')}
                  </div>
                `
                }
              </div>

              <!-- Discrepancies Details -->
              ${
                looseResult?.discrepancies.length > 0
                  ? `
                <div class="border border-slate-200 rounded p-4 space-y-2">
                  <div class="font-bold text-slate-900 text-xs">Các điểm sai lệch phát hiện (${looseResult.discrepancies.length} điểm):</div>
                  <div class="space-y-1.5 text-xs">
                    ${looseResult.discrepancies
                      .map(
                        d => `
                      <div class="p-2 bg-rose-50 border border-rose-200 rounded flex items-start gap-2">
                        <span class="font-mono text-rose-700 font-bold">#${d.pos}</span>
                        <span class="text-rose-950">${d.reason}</span>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }
            </div>

            <!-- Tab 2: Side-by-side Diff View -->
            <div class="${activeDiffTab === 'sidebyside' ? 'block' : 'hidden'} space-y-2">
              <div class="grid grid-cols-2 gap-2 text-xs font-mono border border-slate-200 rounded overflow-hidden">
                <div class="bg-slate-100 p-2 font-bold text-slate-800 border-b border-r border-slate-200">
                  Đáp án chuẩn tham khảo
                </div>
                <div class="bg-slate-100 p-2 font-bold text-blue-900 border-b border-slate-200">
                  Mã nguồn bạn đã gõ
                </div>

                <div class="col-span-2 max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                  ${diffResult?.pairs
                    .map(p => {
                      let leftBg = 'bg-white';
                      let rightBg = 'bg-white';
                      if (p.type === 'sol_only') {
                        leftBg = 'bg-amber-50 text-amber-950 font-medium';
                        rightBg = 'bg-slate-50 text-slate-300';
                      } else if (p.type === 'user_only') {
                        leftBg = 'bg-slate-50 text-slate-300';
                        rightBg = 'bg-rose-50 text-rose-950 font-medium';
                      } else {
                        leftBg = 'text-slate-800';
                        rightBg = 'text-slate-800';
                      }

                      return `
                      <div class="grid grid-cols-2 divide-x divide-slate-200">
                        <div class="p-1.5 px-3 flex items-start gap-2 ${leftBg}">
                          <span class="w-6 text-slate-400 select-none text-[10px] text-right">${p.solLineNum ?? ''}</span>
                          <pre class="whitespace-pre-wrap flex-1">${escapeHtml(p.solText)}</pre>
                        </div>
                        <div class="p-1.5 px-3 flex items-start gap-2 ${rightBg}">
                          <span class="w-6 text-slate-400 select-none text-[10px] text-right">${p.userLineNum ?? ''}</span>
                          <pre class="whitespace-pre-wrap flex-1">${escapeHtml(p.userText)}</pre>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </div>
            </div>
          </div>
        `
        }
      </div>
    `;

    // Event Bindings
    container.querySelectorAll('.btn-select-variant').forEach(btn => {
      btn.addEventListener('click', () => {
        saveCurrentUserText();
        selectedVariantId = btn.getAttribute('data-variant-id');
        isDiffMode = false;
        render();
      });
    });

    const textarea = container.querySelector('#textarea-user-code');
    if (textarea) {
      textarea.addEventListener('input', e => {
        userCodes[currentVariant.id] = e.target.value;
      });
    }

    container.querySelector('#btn-reset-to-base')?.addEventListener('click', () => {
      if (confirm('Khôi phục lại code gốc chưa chỉnh sửa?')) {
        userCodes[currentVariant.id] = baseAlgo ? baseAlgo.code : '';
        render();
      }
    });

    container.querySelector('#btn-run-diff')?.addEventListener('click', () => {
      saveCurrentUserText();
      const userText = userCodes[currentVariant.id] || '';
      diffResult = computeSideBySideDiff(userText, currentVariant.solution);
      looseResult = looseMatchCpp(userText, currentVariant.solution);
      isDiffMode = true;
      activeDiffTab = 'loose';
      render();
    });

    container.querySelector('#btn-back-to-edit')?.addEventListener('click', () => {
      isDiffMode = false;
      render();
    });

    container.querySelector('#btn-tab-loose')?.addEventListener('click', () => {
      activeDiffTab = 'loose';
      render();
    });

    container.querySelector('#btn-tab-sidebyside')?.addEventListener('click', () => {
      activeDiffTab = 'sidebyside';
      render();
    });
  }

  function saveCurrentUserText() {
    const textarea = container.querySelector('#textarea-user-code');
    if (textarea) {
      userCodes[selectedVariantId] = textarea.value;
    }
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
