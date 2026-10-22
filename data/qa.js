// Câu hỏi tự kiểm (Self-check Questions & Answers) cho 12 thuật toán then chốt
// Đánh dấu rõ: "do AI soạn, cần tôi duyệt"

export const BUILTIN_QA = {
  segtree_point_range: [
    {
      q: "Nút `node` quản lý đoạn `[l, r]`. Khi `l == r`, vì sao gán trực tiếp `tree[node] = val` mà không cộng dồn?",
      a: "Vì đây là truy vấn gán giá trị tại điểm (point update), `l == r` ứng với vị trí `idx` của mảng, nên giá trị tại nút lá chính là giá trị mới của phần tử đó.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Điều kiện dừng `if (ql <= l && r <= qr)` trong hàm query có ý nghĩa gì?",
      a: "Nút hiện tại nằm trọn vẹn bên trong đoạn truy vấn `[ql, qr]`, do đó giá trị `tree[node]` chính là tổng của cả đoạn `[l, r]` mà không cần đệ quy xuống các nút con.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao mảng `tree` cần kích thước tối thiểu là `4 * MAXN`?",
      a: "Cây phân đoạn là cây nhị phân gần đầy đủ. Với N lá, số nút tối đa của cây có thể lên tới 2^(ceil(log2(N)) + 1) - 1, trường hợp xấu nhất xấp xỉ 4N (ví dụ khi N = 2^k + 1).",
      status: "ai_generated_pending_review"
    }
  ],
  segtree_lazy: [
    {
      q: "Mục đích của hàm `push(node, l, r)` là gì và vì sao cần nhân `(mid - l + 1)`?",
      a: "Đẩy giá trị gắn cờ lười `lazy[node]` xuống hai con trước khi đệ quy sâu hơn. Nhân với `(mid - l + 1)` vì cây con trái chứa `mid - l + 1` phần tử, mỗi phần tử đều được cộng thêm `lazy[node]`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao sau khi cập nhật cây con, ta phải gán `lazy[node] = 0`?",
      a: "Để tránh áp dụng giá trị cập nhật lặp lại nhiều lần cho các con ở những lần đệ quy sau.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Tại sao hàm `query_range` cũng phải gọi `push(node, l, r)` trước khi đệ quy?",
      a: "Vì các nút con có thể đang giữ thông tin cũ chưa được cập nhật từ các lệnh update trước đó, cần push xuống để con có giá trị đúng trước khi tính tổng.",
      status: "ai_generated_pending_review"
    }
  ],
  fenwick_tree: [
    {
      q: "Phép toán `idx += idx & -idx` trong hàm `add` hoạt động như thế nào?",
      a: "`idx & -idx` cô lập bit 1 nhỏ nhất (LSB). Cộng thêm LSB giúp nhảy lên chỉ số của nút cha quản lý khoảng chứa `idx` trong cây Fenwick.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao cây Fenwick đánh chỉ số từ 1 thay vì 0?",
      a: "Vì nếu `idx = 0`, `0 & -0 = 0`, vòng lặp `idx += idx & -idx` sẽ bị lặp vô tận.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Độ phức tạp bộ nhớ và thời gian của Fenwick Tree so với Segment Tree có ưu thế gì?",
      a: "Fenwick chỉ cần đúng mảng kích thước N (tiết kiệm 4 lần bộ nhớ) và hằng số tính toán nhỏ hơn 2-3 lần nhờ các phép toán bitwise cực nhanh.",
      status: "ai_generated_pending_review"
    }
  ],
  dsu: [
    {
      q: "Trong hàm `find(u)`, phép gán `parent[u] = find(parent[u])` có tác dụng gì?",
      a: "Đây là kỹ thuật nén đường đi (path compression), nối trực tiếp đỉnh `u` (và các đỉnh trên đường đi) vào gốc của tập hợp, giảm chiều cao cây xuống O(1) trung bình.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Tại sao hàm `unite` lại kiểm tra `if (sz[u] < sz[v]) swap(u, v);`?",
      a: "Kỹ thuật gộp theo kích thước (union by size): luôn gộp cây nhỏ hơn vào cây lớn hơn, đảm bảo độ sâu tối đa của cây không quá O(log N).",
      status: "ai_generated_pending_review"
    },
    {
      q: "Khi nào KHÔNG ĐƯỢC dùng nén đường đi trong DSU?",
      a: "Khi bài toán yêu cầu quay lui / hoàn tác phép gộp (DSU with rollback) như trong chia để trị theo thời gian (dynamic connectivity), vì nén đường làm mất lịch sử cấu trúc cây.",
      status: "ai_generated_pending_review"
    }
  ],
  dijkstra: [
    {
      q: "Dòng `if (d > dist[u]) continue;` trong vòng lặp Dijkstra có ý nghĩa sống còn gì?",
      a: "Bỏ qua các trạng thái cũ/thừa trong priority queue khi đỉnh `u` đã được tối ưu hóa với khoảng cách ngắn hơn, tránh TLE.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao thuật toán Dijkstra không áp dụng được cho đồ thị có trọng số âm?",
      a: "Vì Dijkstra dựa trên nguyên lý tham lam: một đỉnh khi lấy ra từ priority_queue được coi là đã tìm được đường đi ngắn nhất vĩnh viễn. Nếu có cạnh âm, giả định này bị vi phạm.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Khai báo `priority_queue<pli, vector<pli>, greater<pli>>` làm nhiệm vụ gì?",
      a: "Tạo Min-Heap để lấy ra phần tử có khoảng cách `d` nhỏ nhất ở đỉnh hàng đợi trong O(1).",
      status: "ai_generated_pending_review"
    }
  ],
  tarjan_scc: [
    {
      q: "Biến `low[u]` lưu trữ đại lượng bất biến nào?",
      a: "`low[u]` là `tin` nhỏ nhất của đỉnh mà từ cây con DFS gốc `u` có thể đi tới qua các cạnh xuôi và nhiều nhất 1 cạnh ngược lên các đỉnh vẫn đang nằm trong ngăn xếp.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Mảng `on_stack[u]` dùng để làm gì và khác gì so với mảng `visited`?",
      a: "Đánh dấu đỉnh `u` có thuộc cây DFS hiện tại để hình thành chu trình hay không. Cạnh tới đỉnh đã thăm nhưng KHÔNG nằm trên stack là cạnh chéo sang SCC khác, không được cập nhật `low`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Khi nào một thành phần liên thông mạnh (SCC) được phát hiện đầy đủ?",
      a: "Khi `low[u] == tin[u]`, đỉnh `u` là gốc của SCC. Pop tất cả các đỉnh từ stack ra cho tới khi gặp lại `u`.",
      status: "ai_generated_pending_review"
    }
  ],
  dinic_max_flow: [
    {
      q: "Giai đoạn BFS trong Dinic có nhiệm vụ gì?",
      a: "Xây dựng đồ thị phân tầng (level graph), trong đó `level[v] = level[u] + 1`, đảm bảo đường tăng luồng luôn đi theo hướng ngắn nhất từ S tới T.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Mảng `ptr[v]` dùng để làm gì trong hàm DFS?",
      a: "Tối ưu con trỏ cạnh hiện tại (current edge optimization): bỏ qua các cạnh đã bão hòa luồng trong pha tăng luồng hiện tại, giúp đạt độ phức tạp O(V^2 * E).",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao mỗi cạnh ngược (residual edge) ban đầu có dung lượng bằng 0?",
      a: "Để cho phép dòng chảy có thể 'hủy' hoặc chuyển hướng lưu lượng đã gửi trước đó nếu tìm thấy lộ trình tối ưu hơn qua đỉnh khác.",
      status: "ai_generated_pending_review"
    }
  ],
  lca_binary_lifting: [
    {
      q: "Bảng `up[u][j]` lưu trữ thông tin gì?",
      a: "Đỉnh tổ tiên thứ 2^j của đỉnh `u`. Xây dựng theo công thức hồi quy `up[u][j] = up[up[u][j-1]][j-1]`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Trong hàm `get_lca`, bước đầu tiên nhảy 2 đỉnh về cùng độ sâu hoạt động ra sao?",
      a: "Giả sử depth[u] >= depth[v], duyệt j từ LOGN-1 về 0. Nếu khoảng cách chênh lệch depth[u] - depth[v] có bit j bật thì nhảy `u = up[u][j]`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Tại sao bước 2 nhảy đồng thời `u` và `v` chỉ nhảy khi `up[u][j] != up[v][j]`?",
      a: "Để dừng lại ở đúng vị trí con trực tiếp của LCA (ngay dưới LCA). Khi đó `up[u][0]` chính là LCA cần tìm.",
      status: "ai_generated_pending_review"
    }
  ],
  kmp_string_matching: [
    {
      q: "Mảng tiền tố `pi[i]` định nghĩa như thế nào?",
      a: "Độ dài của tiền tố thực sự dài nhất của đoạn xâu con `s[0..i]` đồng thời cũng là hậu tố của đoạn đó.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vì sao nối `pat + '#' + text` lại giúp tìm kiếm mà không bị tràn khớp qua biên?",
      a: "Ký tự `#` không xuất hiện trong cả mẫu và văn bản, đảm bảo giá trị `pi[i]` không bao giờ vượt quá độ dài của `pat`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Vòng lặp `while (j > 0 && s[i] != s[j]) j = pi[j - 1];` có độ phức tạp tổng cộng là bao nhiêu?",
      a: "Tổng thời gian của cả thuật toán là O(N + M) tuyến tính, vì biến `j` tăng tối đa 1 mỗi bước và mỗi lần lùi trong while làm giảm `j` ít nhất 1.",
      status: "ai_generated_pending_review"
    }
  ],
  matrix_exponentiation: [
    {
      q: "Vì sao lũy thừa ma trận có thể tính ma trận A^N trong thời gian O(K^3 * log N)?",
      a: "Sử dụng thuật toán lũy thừa nhị phân (binary exponentiation): nếu N lẻ nhân thêm A, nếu N chẵn bình phương ma trận A.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Ma trận đơn vị (Identity Matrix) có vai trò gì trong khởi tạo?",
      a: "Là phần tử trung hòa của phép nhân ma trận (I * A = A), khởi tạo đường chéo chính bằng 1 và các ô còn lại bằng 0.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Khi modulo P lên tới 10^18, cần xử lý phép nhân các phần tử ma trận như thế nào?",
      a: "Phép nhân hai số 64-bit có thể vượt quá giới hạn `long long` (10^36 > 10^18), bắt buộc phải dùng `__int128` hoặc hàm nhân cộng dồn `mulmod`.",
      status: "ai_generated_pending_review"
    }
  ],
  lucas_theorem_mod_p: [
    {
      q: "Định lý Lucas phát biểu mối quan hệ giữa nCr mod p với hệ cơ số p như thế nào?",
      a: "C(n, r) mod p = tích các C(n_i, r_i) mod p, với n_i và r_i là các chữ số của n và r khi biểu diễn trong hệ cơ số p.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Trường hợp đặc biệt p = 2 (Lucas mod 2) được tính nhanh bằng phép bitwise nào?",
      a: "C(n, r) lẻ (đồng dư 1 mod 2) khi và chỉ khi tất cả các bit của r đều nằm trong n, tức là `(n & r) == r`.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Điều kiện áp dụng bắt buộc của định lý Lucas là gì?",
      a: "Số chia `p` bắt buộc phải là số NGUYÊN TỐ. Nếu p là hợp số không áp dụng được định lý Lucas.",
      status: "ai_generated_pending_review"
    }
  ],
  mos_algorithm: [
    {
      q: "Tại sao kích thước block tối ưu trong thuật toán Mo là `N / sqrt(Q)` hoặc xấp xỉ `sqrt(N)`?",
      a: "Giúp cân bằng tổng số bước di chuyển của 2 con trỏ: con trỏ L di chuyển tối đa Q * B, con trỏ R di chuyển tối đa (N / B) * N. Đặt B = N / sqrt(Q) cho tổng chi phí tối thiểu O(N * sqrt(Q)).",
      status: "ai_generated_pending_review"
    },
    {
      q: "Mục đích của việc sắp xếp zic-zac `(b1 & 1) ? r < other.r : r > other.r` là gì?",
      a: "Giúp con trỏ R di chuyển xuôi rồi ngược lại ở các block kề nhau thay vì nhảy đột ngột từ cuối mảng về đầu mảng, giảm một nửa số phép dịch chuyển.",
      status: "ai_generated_pending_review"
    },
    {
      q: "Khi nào KHÔNG THỂ áp dụng thuật toán Mo chuẩn?",
      a: "Khi bài toán có thao tác cập nhật (update) xen kẽ giữa các truy vấn (phải dùng Mo có cập nhật 3D với block N^(2/3)), hoặc phép toán không thể mở rộng/thu hẹp trong O(1).",
      status: "ai_generated_pending_review"
    }
  ]
};
