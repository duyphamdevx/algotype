// View: Thống kê tiến độ ôn tập, Chuỗi ngày (Streak), Biểu đồ 14 ngày & Sao lưu dữ liệu

import { store, LEITNER_INTERVALS } from '../store.js';

export function renderStatsView(container) {
  function render() {
    const db = store.db;
    const hist = db.hist || [];
    const stats = db.stats || {};
    const allAlgos = store.getAllAlgos();

    // Box distribution
    const boxCounts = [0, 0, 0, 0, 0, 0];
    allAlgos.forEach(a => {
      const b = (stats[a.id]?.box || 0);
      boxCounts[Math.min(5, Math.max(0, b))]++;
    });

    // 14-day history tally
    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      const runs = hist.filter(h => h.d === dateStr);
      const avgWpm = runs.length > 0 ? Math.round(runs.reduce((acc, r) => acc + (r.wpm || 0), 0) / runs.length) : 0;
      last14Days.push({
        date: dateStr,
        label: dateStr.slice(5),
        count: runs.length,
        avgWpm
      });
    }

    // Streak calculation (consecutive active days)
    let streak = 0;
    const activeDates = new Set(hist.map(h => h.d));
    let checkDate = new Date();
    while (true) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (activeDates.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow checking yesterday if user hasn't typed yet today
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yStr = checkDate.toISOString().slice(0, 10);
          if (activeDates.has(yStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    const maxDayCount = Math.max(1, ...last14Days.map(d => d.count));

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="border-b border-slate-300 pb-4">
          <h2 class="text-2xl font-bold tracking-tight text-slate-900 font-serif">Thống Kê & Cài Đặt</h2>
          <p class="text-sm text-slate-600 mt-1">
            Theo dõi nhịp độ luyện tập, phân bố 5 hộp Leitner, chuỗi ngày liên tiếp và xuất/nhập sao lưu an toàn.
          </p>
        </div>

        <!-- Top KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="bg-white border border-slate-300 p-4 rounded shadow-xs">
            <div class="text-xs text-slate-500">Chuỗi ngày liên tục</div>
            <div class="text-2xl font-bold font-mono text-amber-700 mt-1">${streak} ngày 🔥</div>
          </div>
          <div class="bg-white border border-slate-300 p-4 rounded shadow-xs">
            <div class="text-xs text-slate-500">Tổng lượt gõ code</div>
            <div class="text-2xl font-bold font-mono text-slate-800 mt-1">${hist.length}</div>
          </div>
          <div class="bg-white border border-slate-300 p-4 rounded shadow-xs">
            <div class="text-xs text-slate-500">Template ở Hộp 4 - 5</div>
            <div class="text-2xl font-bold font-mono text-emerald-700 mt-1">${boxCounts[4] + boxCounts[5]}</div>
          </div>
          <div class="bg-white border border-slate-300 p-4 rounded shadow-xs">
            <div class="text-xs text-slate-500">Điều then chốt đã lưu</div>
            <div class="text-2xl font-bold font-mono text-blue-900 mt-1">${(db.notes || []).length}</div>
          </div>
        </div>

        <!-- Leitner Box Distribution Bar -->
        <div class="bg-white border border-slate-300 rounded p-5 space-y-3">
          <h3 class="font-bold text-slate-900 text-base">Phân bố 5 Hộp Leitner (Spaced Repetition)</h3>
          <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            ${boxCounts
              .map((count, boxNum) => {
                const interval = LEITNER_INTERVALS[boxNum];
                return `
                <div class="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div class="font-semibold text-slate-700">Hộp ${boxNum}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${interval} ngày</div>
                  <div class="text-xl font-bold font-mono text-blue-900 mt-1">${count}</div>
                  <div class="text-[10px] text-slate-500">thuật toán</div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- 14 Days Activity Chart -->
        <div class="bg-white border border-slate-300 rounded p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-base">Biểu đồ hoạt động 14 ngày gần nhất</h3>
            <span class="text-xs text-slate-500">Số bài gõ mỗi ngày</span>
          </div>

          <div class="flex items-end gap-1.5 h-36 pt-4 px-2 border-b border-slate-200">
            ${last14Days
              .map(d => {
                const heightPct = Math.max(8, Math.round((d.count / maxDayCount) * 100));
                return `
                <div class="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                  <!-- Tooltip -->
                  <div class="hidden group-hover:block absolute bottom-full mb-1 z-10 bg-slate-900 text-white text-[10px] p-1.5 rounded whitespace-nowrap shadow">
                    <div>Ngày: ${d.date}</div>
                    <div>Đã gõ: <strong>${d.count}</strong> bài</div>
                    ${d.avgWpm > 0 ? `<div>TB: <strong>${d.avgWpm}</strong> WPM</div>` : ''}
                  </div>
                  <div class="w-full bg-blue-900 hover:bg-blue-700 transition-all rounded-t" style="height: ${d.count > 0 ? heightPct : 4}%"></div>
                  <span class="text-[9px] text-slate-400 font-mono mt-1 select-none">${d.label}</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Backup, Import, Export Section -->
        <div class="bg-white border border-slate-300 rounded p-5 space-y-4">
          <div class="border-b pb-2">
            <h3 class="font-bold text-slate-900 text-base">Quản lý Dữ liệu & Sao lưu An toàn</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Dữ liệu được lưu trong trình duyệt tại khóa <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-900">algotype-v2</code> (giữ nguyên bản gốc v1 làm dự phòng).
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a href="./algotype-v2-full.zip" download="algotype-v2-full.zip" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs no-underline">
              <span>📦 Tải trọn bộ mã nguồn (.ZIP) để đưa lên GitHub</span>
            </a>
            <button id="btn-export-backup" class="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded hover:bg-blue-800 transition-colors cursor-pointer flex items-center gap-1.5">
              <span>💾 Tải bản sao lưu JSON (Backup)</span>
            </button>
            <label class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-300">
              <span>📂 Phục hồi từ tệp JSON</span>
              <input id="input-import-file" type="file" accept=".json" class="hidden" />
            </label>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-export-backup')?.addEventListener('click', () => {
      store.exportBackupJSON();
    });

    container.querySelector('#input-import-file')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        const res = store.importJSON(event.target.result);
        if (res.success) {
          alert('Khôi phục dữ liệu thành công!');
          render();
        } else {
          alert('Lỗi khi nạp dữ liệu: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  render();
}
