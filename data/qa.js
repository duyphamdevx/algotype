// Kho Dạng Bài Thi Đấu & Cách Làm Mở Rộng Cho Các Thuật Toán C++ (Olympic & Chuyên Tin)
// Cung cấp các biến thể thực chiến, phân tích cách làm, bẫy độ phức tạp và khung code C++17 mẫu

export const BUILTIN_QA = {
  segtree_point_range: [
    {
      title: "Dạng 1: Tìm giá trị Min và Chỉ số xuất hiện đầu tiên",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Cơ bản",
      problemScenario: "Cho mảng A có N phần tử và Q truy vấn: (1) Cập nhật giá trị tại vị trí idx; (2) Tìm giá trị nhỏ nhất trong đoạn [L, R] và nếu có nhiều vị trí cùng đạt giá trị min thì trả về CHỈ SỐ NHỎ NHẤT (xuất hiện sớm nhất).",
      q: "Cần thay đổi kiểu dữ liệu của mảng `tree` và hàm gộp `combine(a, b)` như thế nào? Cần lưu ý giá trị khởi tạo trung hòa ngoài đoạn [L, R] là gì?",
      a: "1. Mỗi nút của Segment Tree không lưu một số đơn lẻ mà lưu một cặp `pair<long long, int>` tương ứng `{min_val, min_idx}`.\n2. Hàm `combine(a, b)`: nếu `a.first < b.first` trả về `a`; nếu `b.first < a.first` trả về `b`; nếu `a.first == b.first` trả về cặp có chỉ số nhỏ hơn `(a.second <= b.second ? a : b)`.\n3. Khi truy vấn ra ngoài đoạn (`ql > r || qr < l`), trả về phần tử trung hòa `{INF, -1}`.\n4. Độ phức tạp: Cập nhật và truy vấn đều đạt O(log N).",
      codeSnippet: `pair<long long, int> tree[4 * MAXN];

pair<long long, int> combine(pair<long long, int> a, pair<long long, int> b) {
    if (a.first < b.first) return a;
    if (b.first < a.first) return b;
    return (a.second <= b.second) ? a : b;
}

void update(int node, int l, int r, int idx, long long val) {
    if (l == r) { tree[node] = {val, idx}; return; }
    int mid = (l + r) / 2;
    if (idx <= mid) update(2 * node, l, mid, idx, val);
    else update(2 * node + 1, mid + 1, r, idx, val);
    tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
}

pair<long long, int> query(int node, int l, int r, int ql, int qr) {
    if (ql > r || qr < l) return {1e18, -1};
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2;
    return combine(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}`,
      classicProblems: "CSES - Dynamic Range Minimum Queries, VNOI - QMAX",
      status: "builtin"
    },
    {
      title: "Dạng 2: Binary Search trên cây Segment Tree (Tìm vị trí đầu tiên >= X)",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Nâng cao",
      problemScenario: "Cho mảng A gồm N phòng khách sạn, phòng i có A[i] chỗ trống. Có M đoàn khách, mỗi đoàn yêu cầu X chỗ. Với mỗi đoàn khách, tìm phòng đầu tiên (chỉ số nhỏ nhất) có ít nhất X chỗ trống, xếp khách vào và giảm chỗ trống đi X. Nếu không có phòng nào đủ chỗ, in ra 0.",
      q: "Tại sao chặt nhị phân kết hợp query đoạn mất O(log^2 N)? Làm thế nào để tận dụng cây Segment Tree lưu Max để tìm trực tiếp phòng thỏa mãn trong O(log N)?",
      a: "1. Nếu chặt nhị phân vị trí mid và gọi `query_max(1, mid)` thì mất O(log N) mỗi lần kiểm tra => tổng thời gian O(log^2 N), dễ bị TLE khi N, M = 2*10^5.\n2. Tối ưu O(log N) bằng 'Walk on Segment Tree':\n   - Tại mỗi nút, ta kiểm tra cây con trái `tree[2*node] >= X` hay không.\n   - Nếu cây con trái có max >= X, chắc chắn phòng đầu tiên thỏa mãn nằm ở nhánh trái -> rẽ đệ quy sang trái.\n   - Ngược lại, nếu cây con trái không đủ chỗ nhưng cây con phải thỏa mãn -> rẽ sang nhánh phải.\n   - Khi chạm đến lá `l == r`, ta tìm thấy phòng chỉ số `l`, cập nhật `tree[node] -= X` và trả về kết quả.",
      codeSnippet: `int find_first(int node, int l, int r, long long x) {
    if (tree[node] < x) return 0; // Không có phòng nào đủ chỗ
    if (l == r) {
        tree[node] -= x; // Trừ số chỗ trống
        return l;
    }
    int mid = (l + r) / 2;
    int res = 0;
    if (tree[2 * node] >= x) {
        res = find_first(2 * node, l, mid, x);
    } else {
        res = find_first(2 * node + 1, mid + 1, r, x);
    }
    tree[node] = max(tree[2 * node], tree[2 * node + 1]);
    return res;
}`,
      classicProblems: "CSES - Hotel Queries, Codeforces 438D",
      status: "builtin"
    },
    {
      title: "Dạng 3: Đếm số cặp nghịch thế (Inversion Counting) & Nén tọa độ",
      category: "Quy hoạch động & Đếm",
      difficulty: "Cơ bản",
      problemScenario: "Cho mảng A có N phần tử (A[i] có thể lên tới 10^9). Đếm số cặp chỉ số (i, j) sao cho i < j và A[i] > A[j].",
      q: "Làm thế nào để áp dụng Segment Tree / Fenwick Tree cho bài toán này khi giá trị A[i] lên tới 10^9? Thứ tự duyệt và truy vấn như thế nào?",
      a: "1. Vì A[i] <= 10^9, ta phải nén tọa độ: sắp xếp các giá trị phân biệt của A và thay thế mỗi A[i] bằng thứ hạng (rank) từ 1 đến K (K <= N).\n2. Duyệt từ phải qua trái (j từ N về 1):\n   - Truy vấn số lượng phần tử đã xuất hiện có giá trị nhỏ hơn A[j]: `query(1, A[j] - 1)` và cộng vào kết quả.\n   - Cập nhật tăng tần số xuất hiện của giá trị A[j] lên 1: `update(A[j], 1)`.\n3. Lưu ý: Tổng số cặp nghịch thế có thể lên tới N*(N-1)/2 ~ 2*10^10 nên biến kết quả phải dùng `long long` để tránh tràn số.",
      codeSnippet: `// Sau khi nén tọa độ các giá trị về [1..K]:
long long inversions = 0;
for (int i = n; i >= 1; --i) {
    inversions += query(1, 1, K, 1, rank_val[i] - 1);
    update(1, 1, K, rank_val[i], 1);
}`,
      classicProblems: "VNOI - NKINV, CSES - Inversion Probability",
      status: "builtin"
    }
  ],

  segtree_lazy: [
    {
      title: "Dạng 1: Vừa Gán Đoạn (Assign) vừa Cộng Đoạn (Add) - Xử lý xung đột Cờ Lười",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Olympic / ICPC",
      problemScenario: "Cho mảng A và 3 loại truy vấn: (1) Gán tất cả phần tử trong đoạn [L, R] bằng X; (2) Cộng thêm X vào tất cả phần tử trong đoạn [L, R]; (3) Tính tổng đoạn [L, R].",
      q: "Khi có cả 2 thao tác gán và cộng trên cùng một cây Segment Tree, thứ tự ưu tiên của lazy tag xử lý thế nào? Hàm push() cần cập nhật ra sao để không bị sai logic?",
      a: "1. Cần lưu 2 cờ lười: `lazy_set` (lưu giá trị gán, dùng cờ đánh dấu `has_set`) và `lazy_add` (lưu giá trị cộng thêm sau khi gán).\n2. Quy tắc đẩy cờ lười (push):\n   - Khi áp dụng lệnh gán mới `set(X)`: lệnh gán sẽ xóa bỏ toàn bộ cờ cộng trước đó (`lazy_add = 0`, `lazy_set = X`, `has_set = true`).\n   - Khi áp dụng lệnh cộng mới `add(Y)`: nếu nút đã có cờ gán thì cộng trực tiếp vào giá trị gán hoặc dồn vào `lazy_add`.\n   - Khi đẩy xuống con: con nhận lệnh gán trước (nếu có), sau đó mới nhận lệnh cộng dồn.",
      codeSnippet: `struct Node {
    long long sum;
    long long set_val, add_val;
    bool has_set;
};

void apply_set(int u, int len, long long v) {
    tree[u].sum = v * len;
    tree[u].set_val = v;
    tree[u].has_set = true;
    tree[u].add_val = 0;
}

void apply_add(int u, int len, long long v) {
    tree[u].sum += v * len;
    tree[u].add_val += v;
}

void push(int u, int l, int r) {
    int mid = (l + r) / 2;
    if (tree[u].has_set) {
        apply_set(2 * u, mid - l + 1, tree[u].set_val);
        apply_set(2 * u + 1, r - mid, tree[u].set_val);
        tree[u].has_set = false;
    }
    if (tree[u].add_val != 0) {
        apply_add(2 * u, mid - l + 1, tree[u].add_val);
        apply_add(2 * u + 1, r - mid, tree[u].add_val);
        tree[u].add_val = 0;
    }
}`,
      classicProblems: "Codeforces 558E, CSES - Range Updates and Sums",
      status: "builtin"
    },
    {
      title: "Dạng 2: Biến đổi Affine (Cập nhật A[i] = (A[i] * mul + add) % MOD)",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Olympic / ICPC",
      problemScenario: "Mỗi phần tử được cập nhật theo dạng biến đổi Affine hàm bậc nhất: nhân với M rồi cộng thêm C theo modulo 10^9+7. Tính tổng đoạn [L, R] mod 10^9+7.",
      q: "Làm thế nào để biểu diễn cờ lười dưới dạng hàm hợp f(g(x))? Công thức kết hợp hai thao tác liên tiếp là gì?",
      a: "1. Mỗi thao tác là một hàm f(x) = (x * a + b) mod MOD. Khởi tạo trung hòa là {a = 1, b = 0}.\n2. Giả sử giá trị hiện tại chịu biến đổi g(x) = x * a1 + b1, sau đó nhận thêm biến đổi f(x) = x * a2 + b2.\n3. Hàm hợp f(g(x)) = (x * a1 + b1) * a2 + b2 = x * (a1 * a2) + (b1 * a2 + b2).\n4. Như vậy cờ lười mới là: `new_a = (a1 * a2) % MOD` và `new_b = (b1 * a2 + b2) % MOD`.\n5. Tổng của đoạn có độ dài len biến đổi thành: `sum = (sum * a2 + b2 * len) % MOD`.",
      codeSnippet: `pair<long long, long long> combine_tags(pair<long long, long long> cur, pair<long long, long long> next_op) {
    // cur = (a1, b1), next_op = (a2, b2)
    long long a = (cur.first * next_op.first) % MOD;
    long long b = (cur.second * next_op.first + next_op.second) % MOD;
    return {a, b};
}`,
      classicProblems: "Library Checker - Range Affine Range Sum, Codeforces 1114F",
      status: "builtin"
    }
  ],

  fenwick_tree: [
    {
      title: "Dạng 1: Range Update & Point Query (Cập nhật đoạn, Truy vấn điểm)",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Cơ bản",
      problemScenario: "Cho mảng A ban đầu gồm N số 0. Có 2 thao tác: (1) Cộng giá trị V vào tất cả phần tử trong đoạn [L, R]; (2) In ra giá trị hiện tại của phần tử tại vị trí P.",
      q: "Fenwick Tree nguyên bản chỉ hỗ trợ Point Add và Prefix Sum. Làm thế nào để giải bài toán này mà KHÔNG cần dùng Segment Tree phức tạp?",
      a: "1. Sử dụng kỹ thuật Mảng Hiệu (Difference Array): Gọi D[i] = A[i] - A[i-1].\n2. Khi đó giá trị A[P] chính là tổng tiền tố: A[P] = D[1] + D[2] + ... + D[P].\n3. Để cộng V vào đoạn [L, R], trên mảng hiệu chỉ cần cập nhật đúng 2 điểm:\n   - `bit.add(L, +V)`\n   - `bit.add(R + 1, -V)`\n4. Để lấy giá trị tại P, chỉ cần gọi `bit.query(P)` trong O(log N).\n5. Mã nguồn ngắn gọn hơn Segment Tree gấp 3 lần và chạy nhanh hơn đáng kể.",
      codeSnippet: `Fenwick bit(n);
// Thao tac 1: Cong V vao [l, r]
void range_add(int l, int r, long long v) {
    bit.add(l, v);
    bit.add(r + 1, -v);
}
// Thao tac 2: Lay gia tri tai diem p
long long point_query(int p) {
    return bit.query(p);
}`,
      classicProblems: "SPOJ - UPDATEIT, VNOI - BITSTR",
      status: "builtin"
    },
    {
      title: "Dạng 2: Tìm phần tử thứ K (K-th element) bằng Binary Lifting trên Fenwick Tree",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Nâng cao",
      problemScenario: "Tập hợp đa tập chứa các số trong khoảng [1..MAXN]. Cho các truy vấn: thêm phần tử X, xóa phần tử X, và tìm số nhỏ thứ K hiện có trong tập hợp.",
      q: "Làm thế nào để tìm vị trí có tổng tiền tố bằng K trong O(log MAXN) thay vì O(log^2 MAXN) khi chặt nhị phân?",
      a: "1. Chặt nhị phân bình thường gọi `query(mid) >= K` mất O(log^2 N).\n2. Ta có thể 'nhảy bit' (Binary Lifting) trực tiếp trên mảng `tree` của Fenwick:\n   - Duyệt các lũy thừa của 2 từ lớn đến nhỏ (ví dụ từ 2^18 về 1).\n   - Nếu vị trí hiện tại `idx + (1<<i)` có tổng tích lũy `bit[idx + (1<<i)] < K`, ta nhảy `idx += (1<<i)` và trừ K đi lượng tương ứng `K -= bit[idx]`.\n   - Kết thúc vòng lặp, `idx + 1` chính là vị trí nhỏ thứ K cần tìm.\n3. Độ phức tạp: Đúng 1 lần duyệt log N bước, mỗi bước O(1) => Tổng O(log N) cực nhanh.",
      codeSnippet: `int find_kth(int k) {
    int idx = 0;
    for (int i = 1 << 18; i > 0; i >>= 1) {
        if (idx + i <= n && bit[idx + i] < k) {
            idx += i;
            k -= bit[idx];
        }
    }
    return idx + 1; // Phan tu thu k
}`,
      classicProblems: "Codeforces 1354D, CSES - List Removals",
      status: "builtin"
    }
  ],

  dsu: [
    {
      title: "Dạng 1: DSU có thể Hoàn Tác (Rollback DSU) phục vụ Chia Để Trị",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Olympic / ICPC",
      problemScenario: "Bài toán Đồ thị động (Dynamic Connectivity Offline): Có các sự kiện thêm cạnh, xóa cạnh theo thời gian và kiểm tra xem hai đỉnh u, v có liên thông tại thời điểm t hay không.",
      q: "Tại sao trong DSU with Rollback ta TUYỆT ĐỐI KHÔNG ĐƯỢC dùng Nén đường đi (Path Compression)? Cấu trúc ngăn xếp lưu vết cần những thông tin gì?",
      a: "1. Nén đường đi thay đổi con trỏ parent của nhiều nút dọc đường đi không dự đoán trước được, phá hủy lịch sử phân cấp của cây khiến ta không thể khôi phục trạng thái cũ.\n2. Vì vậy CHỈ DÙNG Gộp theo kích thước (Union by size/rank), độ sâu cây vẫn được đảm bảo O(log N).\n3. Dùng một `stack<History>` lưu lại 3 thông tin mỗi khi gộp: đỉnh con `v`, đỉnh cha `u`, và kích thước cũ `old_sz_u`.\n4. Khi gọi `rollback()`, ta lấy đỉnh ngăn xếp ra, khôi phục `parent[v] = v` và `sz[u] = old_sz_u`.",
      codeSnippet: `struct DSU_Rollback {
    vector<int> parent, sz;
    struct Step { int u, v, old_sz; };
    stack<Step> history;

    bool unite(int u, int v) {
        u = find(u); v = find(v);
        if (u == v) return false;
        if (sz[u] < sz[v]) swap(u, v);
        history.push({u, v, sz[u]});
        parent[v] = u;
        sz[u] += sz[v];
        return true;
    }

    void rollback() {
        if (history.empty()) return;
        auto [u, v, old_sz] = history.top();
        history.pop();
        parent[v] = v;
        sz[u] = old_sz;
    }
};`,
      classicProblems: "Codeforces 1217F, CSES - Dynamic Connectivity",
      status: "builtin"
    },
    {
      title: "Dạng 2: DSU có Trọng số / Khoảng cách tới Gốc (Parity & Potential DSU)",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Nâng cao",
      problemScenario: "Cho các truy vấn dạng: Biết hiệu giá trị hoặc tính cùng nhóm / khác nhóm giữa 2 phần tử u và v: 'A[u] - A[v] = W' hoặc 'u và v là kẻ thù của nhau'. Kiểm tra xem các khẳng định có mâu thuẫn với nhau không.",
      q: "Làm thế nào để duy trì khoảng cách tương đối hoặc tính chẵn lẻ parity từ mỗi nút lên gốc khi thực hiện nén đường đi?",
      a: "1. Lưu thêm mảng `dist[u]` là hiệu (hoặc khoảng cách modulo 2) giữa u và parent[u].\n2. Trong hàm `find(u)`:\n   - Đệ quy tìm gốc: `int root = find(parent[u]);`\n   - Cập nhật trọng số dồn lên: `dist[u] = (dist[u] + dist[parent[u]]) % MOD;`\n   - Nén đường đi: `parent[u] = root;`\n3. Khi gộp hai cây u và v có chênh lệch W, ta tính toán trọng số giữa hai gốc và nối gốc này vào gốc kia.",
      codeSnippet: `int find(int u) {
    if (u == parent[u]) return u;
    int root = find(parent[u]);
    dist[u] = (dist[u] + dist[parent[u]]) % 2; // mod 2 cho bài toán bạn bè / kẻ thù
    return parent[u] = root;
}`,
      classicProblems: "POJ 1186 - Food Chain, Codeforces 1594D",
      status: "builtin"
    }
  ],

  dijkstra: [
    {
      title: "Dạng 1: Đồ thị Trạng Thái Nhiều Chiều (Dijkstra với K vé giảm giá)",
      category: "Ứng dụng Đồ thị & Đa chiều",
      difficulty: "Nâng cao",
      problemScenario: "Cho đồ thị có hướng N đỉnh, M cạnh có trọng số dương. Bạn được phép chọn tối đa K cạnh trên lộ trình để giảm một nửa chi phí (w / 2). Tìm chi phí tối thiểu đi từ đỉnh 1 tới đỉnh N.",
      q: "Mở rộng mảng khoảng cách `dist` và trạng thái trong hàng đợi ưu tiên như thế nào? Quy tắc duyệt các nhánh cạnh chuyển trạng thái là gì?",
      a: "1. Mở rộng mảng `dist[u][k]`: khoảng cách ngắn nhất đến đỉnh u khi ĐÃ DÙNG đúng k vé giảm giá (0 <= k <= K).\n2. Hàng đợi ưu tiên lưu tuple `{d, u, k}`, sắp xếp theo `d` nhỏ nhất.\n3. Khi xét đỉnh u với k vé đã dùng và cạnh (u, v, w):\n   - Nhánh 1 (Không dùng thêm vé): cập nhật `dist[v][k] = min(dist[v][k], dist[u][k] + w)`.\n   - Nhánh 2 (Nếu k < K, dùng thêm 1 vé cho cạnh này): cập nhật `dist[v][k+1] = min(dist[v][k+1], dist[u][k] + w / 2)`.\n4. Kết quả là `min(dist[N][0..K])`.",
      codeSnippet: `vector<vector<long long>> dist(n + 1, vector<long long>(k + 1, 1e18));
priority_queue<tuple<long long, int, int>, vector<tuple<long long, int, int>>, greater<>> pq;

dist[1][0] = 0;
pq.push({0, 1, 0});

while (!pq.empty()) {
    auto [d, u, used] = pq.top(); pq.pop();
    if (d > dist[u][used]) continue;

    for (auto& [v, w] : adj[u]) {
        if (dist[u][used] + w < dist[v][used]) {
            dist[v][used] = dist[u][used] + w;
            pq.push({dist[v][used], v, used});
        }
        if (used < k && dist[u][used] + w / 2 < dist[v][used + 1]) {
            dist[v][used + 1] = dist[u][used] + w / 2;
            pq.push({dist[v][used + 1], v, used + 1});
        }
    }
}`,
      classicProblems: "CSES - Flight Discount, Codeforces 1163D",
      status: "builtin"
    },
    {
      title: "Dạng 2: 0-1 BFS (Tối ưu Dijkstra khi trọng số chỉ gồm 0 và 1)",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Cơ bản",
      problemScenario: "Đồ thị có các cạnh có trọng số chỉ là 0 hoặc 1 (ví dụ bài toán mê cung xoay hướng mất chi phí 1 hoặc đi thẳng chi phí 0). Tìm đường đi ngắn nhất từ Start đến End.",
      q: "Tại sao không nên dùng `priority_queue` O((V + E) log V)? Cấu trúc dữ liệu nào giúp giảm độ phức tạp xuống O(V + E) tuyến tính?",
      a: "1. Sử dụng hàng đợi hai đầu `std::deque` thay vì `std::priority_queue`.\n2. Tính chất: Hàng đợi luôn duy trì khoảng cách chỉ gồm 2 giá trị liên tiếp {D, D+1}.\n3. Khi nới lỏng cạnh (u, v):\n   - Nếu trọng số w = 0: đẩy đỉnh v vào ĐẦU hàng đợi (`push_front(v)`).\n   - Nếu trọng số w = 1: đẩy đỉnh v vào CUỐI hàng đợi (`push_back(v)`).\n4. Mỗi đỉnh được lấy ra xử lý với khoảng cách tối ưu ngay lập tức trong O(1), tổng thời gian O(V + E).",
      codeSnippet: `deque<int> dq;
dist[start] = 0;
dq.push_back(start);

while (!dq.empty()) {
    int u = dq.front(); dq.pop_front();
    for (auto& [v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            if (w == 0) dq.push_front(v);
            else dq.push_back(v);
        }
    }
}`,
      classicProblems: "Codeforces 1063B, VNOI - REVERSE",
      status: "builtin"
    }
  ],

  tarjan_scc: [
    {
      title: "Dạng 1: Co cụm thành đồ thị DAG (Condensation Graph) & Quy Hoạch Động",
      category: "Ứng dụng Đồ thị & Đa chiều",
      difficulty: "Nâng cao",
      problemScenario: "Mỗi đỉnh trong đồ thị có trọng số tiền vàng. Bạn xuất phát từ đỉnh S, có thể đi qua các đỉnh và thu thập tiền vàng (mỗi đỉnh chỉ nhặt tiền 1 lần). Có thể quay lại đỉnh cũ nếu có chu trình. Tìm số tiền vàng lớn nhất có thể thu thập được.",
      q: "Tại sao không thể DP trực tiếp trên đồ thị ban đầu? Các bước co cụm các SCC thành đỉnh mới và thứ tự DP trên DAG là gì?",
      a: "1. Đồ thị có chu trình có hướng khiến quan hệ thứ tự topo không tồn tại, không thể xác định chiều quy hoạch động.\n2. Bước 1: Dùng Tarjan tìm tất cả các thành phần liên thông mạnh (SCC). Mọi đỉnh trong cùng một SCC đều đi qua lại được lẫn nhau, nên có thể gom toàn bộ tiền vàng của cả SCC vào một 'siêu đỉnh'.\n3. Bước 2: Dựng đồ thị DAG co cụm (Condensation Graph), các cạnh giữa các SCC khác nhau được giữ lại (loại bỏ cạnh lặp).\n4. Bước 3: Đồ thị mới là DAG, có thể tìm đường đi có tổng trọng số lớn nhất bằng quy hoạch động hoặc duyệt thứ tự Topo trong O(V + E).",
      codeSnippet: `// 1. Chay Tarjan xac dinh scc_id[u]
// 2. Tinh tong vang moi SCC: scc_coin[id] += coin[u]
// 3. Xay dung DAG giua cac SCC:
for (int u = 1; u <= n; ++u) {
    for (int v : adj[u]) {
        if (scc_id[u] != scc_id[v]) {
            dag_adj[scc_id[u]].push_back(scc_id[v]);
        }
    }
}
// 4. DP tren DAG theo thu tu Topo`,
      classicProblems: "CSES - Coin Collector, VNOI - ROADS",
      status: "builtin"
    },
    {
      title: "Dạng 2: Bài toán 2-SAT (2-Satisfiability)",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Olympic / ICPC",
      problemScenario: "Cho hệ mệnh đề gồm N biến logic và M điều kiện dạng (x1 OR x2) AND (x3 OR NOT x4) ... Tìm một cách gán giá trị Đúng/Sai cho các biến để thỏa mãn tất cả điều kiện hoặc kết luận vô nghiệm.",
      q: "Mệnh đề logic (u OR v) được chuyển thành 2 cạnh có hướng nào trên đồ thị suy luận? Điều kiện để hệ 2-SAT vô nghiệm là gì?",
      a: "1. Biến đổi logic: (u OR v) tương đương với: (NOT u => v) và (NOT v => u). Đồ thị có 2*N đỉnh: x và NOT x.\n2. Xây dựng đồ thị có hướng gồm các cạnh suy luận tương ứng.\n3. Chạy thuật toán Tarjan tìm SCC.\n4. Điều kiện VÔ NGHIỆM: Nếu tồn tại một biến x sao cho x và NOT x nằm trong CÙNG MỘT SCC (`scc_id[x] == scc_id[NOT x]`), hệ phương trình vô nghiệm.\n5. Nếu có nghiệm: Nếu `scc_id[x] < scc_id[NOT x]`, gán x = FALSE; ngược lại gán x = TRUE (chọn giá trị của đỉnh nằm sau theo thứ tự topo).",
      codeSnippet: `bool solve_2sat() {
    tarjan();
    for (int i = 1; i <= n; ++i) {
        if (scc_id[i] == scc_id[i + n]) return false; // Vo nghiem
        assignment[i] = scc_id[i] < scc_id[i + n];
    }
    return true;
}`,
      classicProblems: "CSES - Giant Pizza, Codeforces 1215F",
      status: "builtin"
    }
  ],

  lca_binary_lifting: [
    {
      title: "Dạng 1: Tìm trọng số cạnh lớn nhất (Max Edge Weight) trên đường đi u -> v",
      category: "Biến thể cấu trúc & Trạng thái",
      difficulty: "Nâng cao",
      problemScenario: "Cho cây có trọng số trên cạnh. Với mỗi truy vấn (u, v), tìm trọng số cạnh lớn nhất trên đường đi đơn giữa u và v.",
      q: "Bảng `max_edge[u][j]` được khởi tạo và cập nhật như thế nào cùng lúc với bảng `up[u][j]` của Binary Lifting?",
      a: "1. Tạo thêm bảng `max_edge[u][j]`: trọng số cạnh lớn nhất trên đường đi từ u nhảy lên 2^j bước.\n2. Cơ sở: `max_edge[u][0] = weight(u, parent[u])`.\n3. Công thức chuyển tiếp đồng thời với `up[u][j]`:\n   - `up[u][j] = up[up[u][j - 1]][j - 1]`\n   - `max_edge[u][j] = max(max_edge[u][j - 1], max_edge[up[u][j - 1]][j - 1])`.\n4. Khi truy vấn LCA giữa u và v, mỗi bước nhảy ta cập nhật `ans = max(ans, max_edge[u][j])`.",
      codeSnippet: `int max_edge[MAXN][LOGN];

void build_lca_max(int root) {
    dfs(root, root, 0, 0);
    for (int j = 1; j < LOGN; ++j) {
        for (int i = 1; i <= n; ++i) {
            up[i][j] = up[up[i][j - 1]][j - 1];
            max_edge[i][j] = max(max_edge[i][j - 1], max_edge[up[i][j - 1]][j - 1]);
        }
    }
}`,
      classicProblems: "SPOJ - DISQUERY, CSES - Company Queries II",
      status: "builtin"
    },
    {
      title: "Dạng 2: Mảng Hiệu trên Cây (Tree Difference Array) để Cộng Đoạn trên Đường Đi",
      category: "Ứng dụng Đồ thị & Đa chiều",
      difficulty: "Olympic / ICPC",
      problemScenario: "Cho cây N đỉnh. Có Q thao tác, mỗi thao tác cộng giá trị V vào tất cả các đỉnh trên đường đi từ u đến v. Sau Q thao tác, in ra giá trị cuối cùng tại mỗi đỉnh.",
      q: "Làm thế nào để cập nhật đường đi u -> v trong O(1) bằng LCA và tính kết quả bằng 1 lần DFS duy nhất?",
      a: "1. Gọi D[x] là mảng hiệu tại nút x.\n2. Với mỗi thao tác (u, v, V), tìm `a = get_lca(u, v)` và `p = parent[a]`.\n3. Cập nhật mảng hiệu tại 4 đỉnh:\n   - `D[u] += V`\n   - `D[v] += V`\n   - `D[a] -= V`\n   - `if (p != 0) D[p] -= V`\n4. Sau khi kết thúc Q truy vấn, chạy 1 lần DFS hậu thứ tự (post-order DFS): Giá trị thực tế của đỉnh u bằng D[u] cộng tổng giá trị của tất cả các con của nó. Tổng thời gian chỉ O(N + Q log N).",
      codeSnippet: `void add_path(int u, int v, long long val) {
    int a = get_lca(u, v);
    diff[u] += val;
    diff[v] += val;
    diff[a] -= val;
    if (up[a][0] != 0) diff[up[a][0]] -= val;
}

void dfs_accumulate(int u, int p) {
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs_accumulate(v, u);
        diff[u] += diff[v]; // Tong don tu cay con len
    }
}`,
      classicProblems: "USACO - Max Flow, CSES - Tree Distances I",
      status: "builtin"
    }
  ],

  knapsack_01: [
    {
      title: "Dạng 1: Ba Lô Giá Trị Nhỏ V, Trọng Số Cực Lớn W (W <= 10^9, V_max <= 5000)",
      category: "Quy hoạch động & Đếm",
      difficulty: "Nâng cao",
      problemScenario: "Có N món đồ, mỗi món có khối lượng w_i lên tới 10^9 và giá trị v_i <= 100. Sức chứa ba lô W lên tới 10^9. Tìm giá trị lớn nhất có thể lấy được.",
      q: "Vì W lên tới 10^9 nên mảng DP theo khối lượng O(N*W) bị tràn bộ nhớ và TLE. Làm thế nào để đảo vai trò của Trọng số và Giá trị trong hàm DP?",
      a: "1. Tổng giá trị tối đa của N món đồ là `V_sum = N * max(v_i) <= 100 * 100 = 10000` (rất nhỏ!).\n2. Ta đảo vai trò: Định nghĩa `dp[v]` là KHỐI LƯỢNG NHỎ NHẤT để đạt được tổng giá trị đúng bằng `v`.\n3. Khởi tạo: `dp[0] = 0`, tất cả `dp[v] = INF`.\n4. Chuyển trạng thái: `dp[v] = min(dp[v], dp[v - val[i]] + weight[i])` (duyệt v ngược từ V_sum về val[i]).\n5. Kết quả là giá trị v lớn nhất thỏa mãn `dp[v] <= W`. Độ phức tạp chỉ O(N * V_sum).",
      codeSnippet: `vector<long long> dp(MAX_V + 1, INF);
dp[0] = 0;

for (int i = 0; i < n; ++i) {
    for (int v = MAX_V; v >= val[i]; --v) {
        if (dp[v - val[i]] != INF) {
            dp[v] = min(dp[v], dp[v - val[i]] + weight[i]);
        }
    }
}

int ans = 0;
for (int v = MAX_V; v >= 0; --v) {
    if (dp[v] <= W) { ans = v; break; }
}`,
      classicProblems: "AtCoder Educational DP Contest - Knapsack 2, VNOI - BAG",
      status: "builtin"
    },
    {
      title: "Dạng 2: Ba Lô Đa Số Lượng (Bounded Knapsack) nén Nhị Phân",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Nâng cao",
      problemScenario: "Mỗi món đồ i có trọng lượng w_i, giá trị v_i và số lượng C_i cái (C_i <= 10^5). Sức chứa ba lô W. Tìm giá trị lớn nhất.",
      q: "Nếu phân tách thành từng món đồ riêng lẻ thì O(W * sum(C_i)) bị TLE. Làm thế nào để phân tách C_i thành các nhóm nhị phân để giảm xuống O(W * sum(log C_i))?",
      a: "1. Bất kỳ số nguyên C nào cũng biểu diễn được thành tổng của các lũy thừa của 2: 1, 2, 4, 8, ..., và phần dư R còn lại.\n2. Ví dụ C = 13: phân rã thành các gói {1, 2, 4, 6}. Mọi số từ 1 đến 13 đều tạo được từ một tổ hợp con của {1, 2, 4, 6}.\n3. Mỗi nhóm k món đồ được gộp thành 1 món đồ mới có khối lượng `k * w_i` và giá trị `k * v_i`.\n4. Sau khi tách, ta chỉ còn O(N * log C) đồ vật và giải bằng Ba lô 0/1 thông thường.",
      codeSnippet: `for (int i = 0; i < n; ++i) {
    int count = c[i];
    for (int k = 1; count > 0; k <<= 1) {
        int take = min(k, count);
        items.push_back({take * w[i], take * v[i]});
        count -= take;
    }
}
// Chay Ba lo 0/1 tren danh sach items`,
      classicProblems: "CSES - Book Shop II, POJ 1742",
      status: "builtin"
    }
  ],

  lis_nlogn: [
    {
      title: "Dạng 1: Dãy Con Tăng Dài Nhất và Khôi Phục Vết (Trace Path)",
      category: "Quy hoạch động & Đếm",
      difficulty: "Cơ bản",
      problemScenario: "Cho mảng A. Tìm Dãy con tăng nghiêm ngặt dài nhất, in ra độ dài và in ra một dãy các phần tử cụ thể đạt độ dài đó.",
      q: "Mảng `tails` trong O(N log N) bị ghi đè giá trị nên không trực tiếp cho ra các phần tử của dãy. Làm thế nào để truy vết chính xác trong O(N)?",
      a: "1. Lưu thêm mảng `pos[i]`: vị trí của phần tử A[i] trong mảng `tails` khi nó được chèn vào.\n2. Lưu mảng `parent[i]` hoặc truy vết ngược từ cuối về đầu:\n   - Giả sử độ dài LIS tìm được là `L`.\n   - Duyệt i từ N về 1: nếu `pos[i] == cur_len` (bắt đầu bằng L), ta lấy phần tử A[i] vào kết quả, giảm `cur_len--` và tiếp tục tìm phần tử có `pos[j] == cur_len` với A[j] < A[i].\n   - Đảo ngược danh sách kết quả để được thứ tự tăng dần.",
      codeSnippet: `int cur = len;
vector<int> result;
for (int i = n - 1; i >= 0; --i) {
    if (pos[i] == cur - 1) {
        result.push_back(a[i]);
        cur--;
    }
}
reverse(result.begin(), result.end());`,
      classicProblems: "LeetCode 300, VNOI - LIQ / LIS",
      status: "builtin"
    },
    {
      title: "Dạng 2: Hộp Lồng Nhau 2 Chiều (Russian Doll Envelopes / 2D LIS)",
      category: "Tìm kiếm & Tối ưu",
      difficulty: "Olympic / ICPC",
      problemScenario: "Cho N phong bì, mỗi phong bì có chiều rộng w và chiều cao h. Phong bì A lồng được vào phong bì B nếu w_A < w_B và h_A < h_B. Tìm số phong bì tối đa có thể lồng vào nhau.",
      q: "Quy tắc sắp xếp 2 chiều (w, h) như thế nào để chuyển bài toán 2 chiều về bài toán LIS 1 chiều chuẩn xác mà không bị lồng sai các phong bì cùng chiều rộng w?",
      a: "1. SẮP XẾP ĐẶC BIỆT: Chiều rộng w sắp TĂNG DẦN; nếu w bằng nhau thì chiều cao h sắp GIẢM DẦN.\n2. Lý do chiều cao h phải giảm dần khi cùng w: Hai phong bì có cùng chiều rộng w không thể lồng vào nhau. Việc sắp h giảm dần đảm bảo trong cùng một nhóm w, ta không bao giờ chọn được nhiều hơn 1 phong bì khi chạy LIS trên h.\n3. Sau khi sắp xếp, chỉ cần lấy mảng chiều cao h và tìm LIS 1 chiều trong O(N log N).",
      codeSnippet: `sort(envelopes.begin(), envelopes.end(), [](const pair<int,int>& a, const pair<int,int>& b) {
    if (a.first != b.first) return a.first < b.first;
    return a.second > b.second; // w bang nhau thi h giam dan!
});

// Chay LIS O(N log N) tren envelopes[i].second`,
      classicProblems: "LeetCode 354 - Russian Doll Envelopes, Codeforces 4D",
      status: "builtin"
    }
  ]
};
