// 24 Past Exam Problems from Olympic Informatics (Chuyen Tin) 2020-2025
// Subtasks, techniques, and bi-directional links to built-in algorithm templates

export const PAST_PROBLEMS = [
  // --- Lần 29 (2020) ---
  {
    id: "olp29_p1",
    lan: 29,
    year: 2020,
    date: "2020",
    title: "Sơn phản quang",
    tags: ["Toán", "Bitwise"],
    techniques: ["Đếm bit", "Nhị phân"],
    subtasks: [
      { pct: 30, desc: "N <= 10^3: Vét cạn và đếm trực tiếp từng số" },
      { pct: 40, desc: "N <= 10^6: Mảng đếm hoặc duyệt bit O(N log N)" },
      { pct: 30, desc: "N <= 10^18: Tách từng bit 2^k, tính đóng góp chu kỳ" }
    ],
    algoIds: ["fast_io"],
    notesDefault: "Tách độc lập từng vị trí bit 2^k. Trong đoạn [0, N], bit thứ k bật tuần hoàn chu kỳ 2^(k+1)."
  },
  {
    id: "olp29_p2",
    lan: 29,
    year: 2020,
    date: "2020",
    title: "VCA",
    tags: ["Xâu ký tự"],
    techniques: ["Tiền tố", "Đếm tần số"],
    subtasks: [
      { pct: 40, desc: "|S| <= 1000: Duyệt 2 con trỏ hoặc vét cạn xâu con" },
      { pct: 60, desc: "|S| <= 10^6: Tổng tiền tố lưu vị trí các ký tự V, C, A" }
    ],
    algoIds: ["kmp_string_matching"],
    notesDefault: "Sử dụng prefix sum đếm số lượng 'V', 'C', 'A' để tính nhanh tần số trong O(1)."
  },
  {
    id: "olp29_p3",
    lan: 29,
    year: 2020,
    date: "2020",
    title: "Đường đi",
    tags: ["Quy hoạch động", "Lưới ô vuông"],
    techniques: ["DP lưới", "Thừa số 2 và 5", "Truy vết từ điển"],
    subtasks: [
      { pct: 30, desc: "M, N <= 20: Nhánh cận hoặc DFS vét cạn mọi đường đi" },
      { pct: 40, desc: "M, N <= 200: DP tính số thừa số 2 và thừa số 5 riêng lẻ" },
      { pct: 30, desc: "M, N <= 1000: Tối ưu bộ nhớ O(N), kết hợp truy vết nhỏ nhất từ điển" }
    ],
    algoIds: ["fast_io"],
    notesDefault: "Số chữ số 0 tận cùng là min(thừa số 2, thừa số 5). Làm 2 bảng DP riêng: min 2 và min 5 rồi chọn đường tốt hơn."
  },
  {
    id: "olp29_p4",
    lan: 29,
    year: 2020,
    date: "2020",
    title: "Giãn cách xã hội",
    tags: ["Hình học"],
    techniques: ["Điểm trong đa giác", "Ray casting"],
    subtasks: [
      { pct: 30, desc: "N <= 100, đa giác lồi: Tích có hướng cùng chiều" },
      { pct: 40, desc: "N <= 2000, đa giác đơn: Ray casting bắn tia ngang" },
      { pct: 30, desc: "N <= 10^5: Chia đa giác thành hình thang / quét biến cố" }
    ],
    algoIds: ["point_in_polygon", "convex_hull_graham"],
    notesDefault: "Bắn tia theo phương ngang, đếm số giao điểm với các cạnh. Cần xử lý kỹ điểm rơi đúng đỉnh hoặc cạnh nằm ngang."
  },

  // --- Lần 30 (23/03/2022) ---
  {
    id: "olp30_p1",
    lan: 30,
    year: 2022,
    date: "23/03/2022",
    title: "Truy vết",
    tags: ["Vét cạn", "Mảng"],
    techniques: ["Vét cạn O(N^2)", "Tối ưu hằng số"],
    subtasks: [
      { pct: 50, desc: "N <= 1000: Duyệt 2 vòng lặp O(N^2)" },
      { pct: 50, desc: "N <= 5000: Tối ưu mảng phẳng và bẻ nhánh sớm" }
    ],
    algoIds: ["fast_io"],
    notesDefault: "Chú ý giới hạn N = 5000, chạy O(N^2) mất ~2.5*10^7 phép tính, cần fast I/O và tối ưu cache dòng."
  },
  {
    id: "olp30_p2",
    lan: 30,
    year: 2022,
    date: "23/03/2022",
    title: "Năng lượng mặt trời",
    tags: ["Cấu trúc dữ liệu"],
    techniques: ["Segment Tree (tổng và vị trí min)", "Mảng vòng (Circular array)"],
    subtasks: [
      { pct: 30, desc: "N <= 1000, Q <= 1000: Mô phỏng trực tiếp O(N * Q)" },
      { pct: 40, desc: "Mảng thẳng (không vòng): Segment Tree quản lý sum và pair<val, index>" },
      { pct: 30, desc: "Mảng vòng N <= 10^5, Q <= 10^5: Nhân đôi mảng 2*N, truy vấn đoạn [l, r] hoặc tách [l, N] và [1, r]" }
    ],
    algoIds: ["segtree_point_range", "segtree_lazy"],
    notesDefault: "Segment Tree mỗi nút lưu pair<long long, int> {min_val, min_idx}. Phép hợp chọn giá trị nhỏ hơn, nếu bằng nhau lấy index nhỏ hơn."
  },
  {
    id: "olp30_p3",
    lan: 30,
    year: 2022,
    date: "23/03/2022",
    title: "Cầu kính",
    tags: ["Toán", "Tổ hợp"],
    techniques: ["Đếm", "Lũy thừa nhanh", "Nhị phân"],
    subtasks: [
      { pct: 40, desc: "N <= 30: Đệ quy hoặc sinh nhị phân vét cạn" },
      { pct: 60, desc: "N <= 10^18: Công thức tổ hợp kết hợp tính lũy thừa nhanh mod 10^9+7" }
    ],
    algoIds: ["fast_io", "matrix_exponentiation"],
    notesDefault: "Dạng bài đếm số cấu hình qua cầu kính; quy về nhân lũy thừa 2^N hoặc ma trận chuyển trạng thái."
  },
  {
    id: "olp30_p4",
    lan: 30,
    year: 2022,
    date: "23/03/2022",
    title: "Sạc ắc quy",
    tags: ["Quy hoạch động"],
    techniques: ["DP đếm", "Tổng tiền tố"],
    subtasks: [
      { pct: 30, desc: "N <= 20, tổng dung lượng nhỏ: Vét cạn tập con" },
      { pct: 40, desc: "N <= 500, K <= 500: DP trạng thái O(N * K)" },
      { pct: 30, desc: "N <= 5000, K <= 10^5: Tối ưu chuyển trạng thái bằng tổng tiền tố rolling sum" }
    ],
    algoIds: ["knapsack_01_space_opt"],
    notesDefault: "Chuyển trạng thái dp[i][j] = sum(dp[i-1][j - k]). Dùng prefix sum để chuyển trong O(1)."
  },

  // --- Lần 31 (07/12/2022) ---
  {
    id: "olp31_p1",
    lan: 31,
    year: 2022,
    date: "07/12/2022",
    title: "Chuỗi hạt",
    tags: ["Xâu ký tự", "Quy hoạch động"],
    techniques: ["Hash palindrome", "Bitmask DP", "Manacher"],
    subtasks: [
      { pct: 30, desc: "N <= 20: Bitmask DP hoặc nhánh cận" },
      { pct: 40, desc: "N <= 2000: Tiền xử lý hash kiểm tra đối xứng O(1), DP O(N^2)" },
      { pct: 30, desc: "N <= 10^5: Manacher hoặc Segment Tree tối ưu DP" }
    ],
    algoIds: ["hash_string_double", "manacher"],
    notesDefault: "Kiểm tra palindrome nhanh bằng Double Rolling Hash hoặc Manacher để tối ưu các bước chuyển DP."
  },
  {
    id: "olp31_p2",
    lan: 31,
    year: 2022,
    date: "07/12/2022",
    title: "Dãy chữ số",
    tags: ["Toán", "Xử lý xâu"],
    techniques: ["Số lớn", "Tách 3 số", "Tham lam"],
    subtasks: [
      { pct: 40, desc: "|S| <= 18: Ép kiểu long long, duyệt vị trí 2 vách ngăn" },
      { pct: 30, desc: "|S| <= 1000: Cộng trừ số lớn cài bằng std::string" },
      { pct: 30, desc: "|S| <= 10^5: Bất đẳng thức tam giác và tính chất độ dài chênh lệch không quá 1 chữ số" }
    ],
    algoIds: ["fast_io"],
    notesDefault: "Độ dài tổng A + B = C thì len(C) chỉ có thể bằng max(len(A), len(B)) hoặc max(...) + 1. Thu hẹp không gian tìm kiếm."
  },
  {
    id: "olp31_p3",
    lan: 31,
    year: 2022,
    date: "07/12/2022",
    title: "Khôi phục dữ liệu",
    tags: ["Quy hoạch động", "Toán"],
    techniques: ["DP đếm", "Lũy thừa ma trận"],
    subtasks: [
      { pct: 30, desc: "N <= 1000: DP mảng 1D/2D bình thường mod P" },
      { pct: 40, desc: "N <= 10^5: DP tối ưu chuyển trạng thái" },
      { pct: 30, desc: "N <= 10^18: Thiết lập ma trận vuông k x k và nhân lũy thừa ma trận nhị phân" }
    ],
    algoIds: ["matrix_exponentiation"],
    notesDefault: "Hàm hồi quy tuyến tính cấp K: F(n) = c1*F(n-1) + ... + ck*F(n-k) chuyển thành nhân ma trận cấp KxK, tính trong O(K^3 * log N)."
  },
  {
    id: "olp31_p4",
    lan: 31,
    year: 2022,
    date: "07/12/2022",
    title: "Nâng cấp tuyến đường",
    tags: ["Đồ thị"],
    techniques: ["Dijkstra", "Truy vấn", "Cây đường đi ngắn nhất (SPT)"],
    subtasks: [
      { pct: 30, desc: "N, M <= 100, Q <= 100: Chạy lại Dijkstra mỗi truy vấn" },
      { pct: 40, desc: "Q <= 1000: Chạy Dijkstra từ nguồn 1 và đích N, kiểm tra cạnh thuộc SPT" },
      { pct: 30, desc: "N, M <= 10^5, Q <= 10^5: Cầu trên đồ thị DAG của các đường đi ngắn nhất" }
    ],
    algoIds: ["dijkstra", "bridges_articulations"],
    notesDefault: "Chạy Dijkstra 2 chiều: distS[u] từ 1 và distT[u] từ N. Cạnh (u, v, w) nằm trên đường ngắn nhất khi distS[u] + w + distT[v] == distS[N]."
  },

  // --- Lần 32 (06/12/2023) ---
  {
    id: "olp32_p1",
    lan: 32,
    year: 2023,
    date: "06/12/2023",
    title: "Ước số",
    tags: ["Toán", "Số học"],
    techniques: ["fib(gcd)", "mulmod", "Lũy thừa ma trận"],
    subtasks: [
      { pct: 30, desc: "A, B <= 10^6: Tính trực tiếp Fibonacci bằng mảng" },
      { pct: 40, desc: "A, B <= 10^18, MOD <= 10^9: Áp dụng gcd(Fib(A), Fib(B)) = Fib(gcd(A, B)), tính bằng ma trận" },
      { pct: 30, desc: "MOD lớn lên tới 10^18: Nhân mulmod __int128 tránh tràn số 64-bit" }
    ],
    algoIds: ["matrix_exponentiation", "fast_io"],
    notesDefault: "Định lý then chốt: gcd(F_a, F_b) = F_{gcd(a, b)}. Với MOD lên tới 10^18, phép nhân ma trận phải dùng __int128 mulmod."
  },
  {
    id: "olp32_p2",
    lan: 32,
    year: 2023,
    date: "06/12/2023",
    title: "Phát kẹo",
    tags: ["Cấu trúc dữ liệu"],
    techniques: ["Segment Tree (9 cây)", "Chia modulo", "Đếm tần số"],
    subtasks: [
      { pct: 30, desc: "N, Q <= 1000: Mảng duyệt trâu O(N * Q)" },
      { pct: 40, desc: "Giá trị chia k nhỏ (k <= 9): Dựng 9 Segment Tree riêng lẻ cho từng số dư mod 1..9" },
      { pct: 30, desc: "N, Q <= 10^5: Kết hợp lazy update hoặc bitwise query" }
    ],
    algoIds: ["segtree_point_range", "segtree_lazy"],
    notesDefault: "Khi k chỉ từ 1 đến 9, ta có thể xây dựng 9 cây Segment Tree độc lập, mỗi cây quản lý mảng với quy tắc chia tương ứng."
  },
  {
    id: "olp32_p3",
    lan: 32,
    year: 2023,
    date: "06/12/2023",
    title: "Đường chạy",
    tags: ["Cây", "Tổ hợp"],
    techniques: ["Đếm đóng góp từng cạnh", "Quy hoạch động trên cây", "Tổ hợp"],
    subtasks: [
      { pct: 30, desc: "N <= 1000: DFS từ mọi đỉnh tính khoảng cách" },
      { pct: 40, desc: "Cây có dạng đường thẳng hoặc ngôi sao: Công thức giải tích" },
      { pct: 30, desc: "N <= 2*10^5: Mỗi cạnh (u, v) chia cây thành 2 phần kích thước S và (N - S). Đóng góp của cạnh = S * (N - S) * w." }
    ],
    algoIds: ["lca_binary_lifting"],
    notesDefault: "Kỹ thuật đếm đóng góp: Thay vì đếm tổng khoảng cách mọi cặp (u, v), hãy đếm mỗi cạnh e xuất hiện trong bao nhiêu cặp đường đi."
  },
  {
    id: "olp32_p4",
    lan: 32,
    year: 2023,
    date: "06/12/2023",
    title: "Chỉ số hấp dẫn",
    tags: ["Cấu trúc dữ liệu nâng cao"],
    techniques: ["Thuật toán Mo", "Số dư", "Two pointers"],
    subtasks: [
      { pct: 30, desc: "N, Q <= 2000: Duyệt trâu từng đoạn [L, R]" },
      { pct: 40, desc: "Các truy vấn không có update, mảng tĩnh: Thuật toán Mo chuẩn block sqrt(N)" },
      { pct: 30, desc: "N, Q <= 10^5: Sắp xếp truy vấn theo đường cong Hilbert / chặn zic-zac" }
    ],
    algoIds: ["mos_algorithm"],
    notesDefault: "Dùng Mo's algorithm: sắp xếp các query theo block L / B, nếu cùng block sort R. Hàm add(x) và del(x) cập nhật số dư trong O(1)."
  },

  // --- Lần 33 (11/12/2024) ---
  {
    id: "olp33_p1",
    lan: 33,
    year: 2024,
    date: "11/12/2024",
    title: "Đường đi",
    tags: ["Tổ hợp", "Quy hoạch động"],
    techniques: ["Tổ hợp nCr", "Ô cấm", "Bao hàm loại trừ (Inclusion-Exclusion)"],
    subtasks: [
      { pct: 30, desc: "M, N <= 1000: Bảng DP lưới O(M * N)" },
      { pct: 40, desc: "Số ô cấm K <= 20: Bao hàm loại trừ 2^K" },
      { pct: 30, desc: "M, N <= 10^6, K <= 2000: Sắp xếp các ô cấm theo tọa độ, DP O(K^2) trừ các đường đi chạm ô cấm đầu tiên" }
    ],
    algoIds: ["combinatorics_ncr"],
    notesDefault: "Số đường từ (r1, c1) đến (r2, c2) là C(dr + dc, dr). Sắp xếp K điểm cấm, dp[i] là số đường đến điểm cấm i mà không qua điểm cấm nào trước đó."
  },
  {
    id: "olp33_p2",
    lan: 33,
    year: 2024,
    date: "11/12/2024",
    title: "Nén dãy",
    tags: ["Toán", "Bitwise"],
    techniques: ["Lucas mod 2", "XOR", "Tam giác Pascal lẻ chẵn"],
    subtasks: [
      { pct: 30, desc: "N <= 1000: Mô phỏng nén từng bước O(N^2)" },
      { pct: 40, desc: "N <= 10^5: Hệ số của a[i] sau khi nén là C(N - 1, i) mod 2" },
      { pct: 30, desc: "N <= 10^7: C(N-1, i) lẻ <=> ((N - 1) & i) == i (Định lý Lucas mod 2)" }
    ],
    algoIds: ["lucas_theorem_mod_p"],
    notesDefault: "Then chốt: Phép XOR có tính chất a XOR a = 0. Phần tử a[i] xuất hiện C(N-1, i) lần. Theo định lý Lucas, C(n, k) lẻ khi và chỉ khi (n & k) == k."
  },
  {
    id: "olp33_p3",
    lan: 33,
    year: 2024,
    date: "11/12/2024",
    title: "Giàn đèn tam giác",
    tags: ["Hình học", "Bitwise"],
    techniques: ["Đếm tam giác đều", "std::bitset", "Tọa độ 60 độ"],
    subtasks: [
      { pct: 30, desc: "N <= 300: Vét cạn 3 đỉnh O(N^3)" },
      { pct: 40, desc: "N <= 2000: Cố định 2 đỉnh, tìm đỉnh thứ 3 qua hash hoặc mảng bool O(N^2)" },
      { pct: 30, desc: "N <= 5000: Dùng std::bitset đếm giao tập điểm trong O(N^2 / 64)" }
    ],
    algoIds: ["bitset_optimizations"],
    notesDefault: "Chuyển hệ tọa độ tam giác (trục nghiêng 60 độ). Dùng bitset để AND các hàng điểm, đếm bit bật bằng __builtin_popcount."
  },
  {
    id: "olp33_p4",
    lan: 33,
    year: 2024,
    date: "11/12/2024",
    title: "Biến đổi xâu",
    tags: ["Xâu ký tự", "Tham lam"],
    techniques: ["Xây dựng", "Chuẩn hóa", "Bất biến"],
    subtasks: [
      { pct: 30, desc: "|S| <= 10: BFS mọi trạng thái hoán đổi" },
      { pct: 40, desc: "|S| <= 1000: Tìm đại diện chuẩn hóa (canonical form) của xâu" },
      { pct: 30, desc: "|S| <= 10^5: Chứng minh đại lượng bất biến (tổng parity hoặc số lượng ký tự chẵn lẻ)" }
    ],
    algoIds: ["fast_io"],
    notesDefault: "Tìm đại lượng bất biến (invariant) không đổi qua các phép biến đổi. Nếu 2 xâu có cùng đại lượng bất biến thì có thể biến đổi thành nhau."
  },

  // --- Lần 34 (2025) ---
  {
    id: "olp34_p1",
    lan: 34,
    year: 2025,
    date: "2025",
    title: "Cặp số",
    tags: ["Toán", "Số học"],
    techniques: ["Số học", "Phần không chứa bình phương (Square-free)", "Sàng nguyên tố"],
    subtasks: [
      { pct: 30, desc: "N <= 1000, A[i] <= 10^6: Vét cạn O(N^2) kiểm tra a * b là số chính phương" },
      { pct: 40, desc: "N <= 10^5, A[i] <= 10^6: Rút gọn mỗi số về square-free part qua sàng O(maxA)" },
      { pct: 30, desc: "A[i] <= 10^12: Phân tích thừa số bằng Pollard-Rho hoặc căn bậc hai" }
    ],
    algoIds: ["linear_sieve", "miller_rabin_pollard_rho"],
    notesDefault: "a * b là số chính phương <=> square_free(a) == square_free(b). Phân tích a = s^2 * k (k không chứa thừa số mũ >= 2). Đếm số lượng k."
  },
  {
    id: "olp34_p2",
    lan: 34,
    year: 2025,
    date: "2025",
    title: "Bút chì màu",
    tags: ["Cấu trúc dữ liệu", "Mảng"],
    techniques: ["Mảng hiệu 2D", "Hash", "Prefix 2D"],
    subtasks: [
      { pct: 30, desc: "M, N, Q <= 500: Cập nhật trực tiếp trên ma trận" },
      { pct: 40, desc: "Chỉ cập nhật hình chữ nhật: Mảng hiệu 2D (2D Difference Array)" },
      { pct: 30, desc: "M, N <= 2000, Q <= 10^5: Gán mỗi màu một số ngẫu nhiên 64-bit (XOR Hash) để kiểm tra tập màu" }
    ],
    algoIds: ["fast_io", "hash_string_double"],
    notesDefault: "Cập nhật hình chữ nhật [r1, c1] đến [r2, c2] bằng mảng hiệu diff[r1][c1] += v, diff[r1][c2+1] -= v... Kết hợp XOR hash để kiểm tra tập màu."
  },
  {
    id: "olp34_p3",
    lan: 34,
    year: 2025,
    date: "2025",
    title: "Dãy ngắn nhất",
    tags: ["Toán", "Bitwise"],
    techniques: ["Fibonacci", "Tổng và XOR", "Hệ cơ số GF(2)"],
    subtasks: [
      { pct: 30, desc: "N <= 20: Sinh vét cạn" },
      { pct: 40, desc: "Biết quan hệ a + b = (a XOR b) + 2*(a AND b)" },
      { pct: 30, desc: "Khử Gauss trên GF(2) hoặc định lý Zeckendorf cho dãy Fibonacci" }
    ],
    algoIds: ["matrix_exponentiation"],
    notesDefault: "Đẳng thức then chốt: a + b = (a ^ b) + 2 * (a & b). Suy ra a ^ b = (a + b) - 2 * (a & b). Phân tích tính chẵn lẻ của tổng."
  },
  {
    id: "olp34_p4",
    lan: 34,
    year: 2025,
    date: "2025",
    title: "Đường hoa",
    tags: ["Quy hoạch động", "Đồ thị"],
    techniques: ["Khôi phục dãy từ bảng", "Tô màu đồ thị / Topo sort", "Tham lam"],
    subtasks: [
      { pct: 30, desc: "N <= 8: Quay lui hoán vị N!" },
      { pct: 40, desc: "N <= 1000: Xây dựng đồ thị có hướng u -> v nếu u phải đứng trước v, chạy Kahn topo sort" },
      { pct: 30, desc: "N <= 10^5: Cây phân đoạn hoặc hàng đợi ưu tiên chọn phần tử từ điển nhỏ nhất" }
    ],
    algoIds: ["tarjan_scc", "dsu"],
    notesDefault: "Từ bảng quan hệ so sánh, dựng đồ thị có hướng quan hệ thứ tự. Nếu có chu trình => vô nghiệm. Ngược lại Topo sort bằng priority_queue."
  }
];
