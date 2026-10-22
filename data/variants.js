// Algorithm Variant Drills (Bài biến thể)
// Practice modifying standard CP templates for custom problem constraints

export const BUILTIN_VARIANTS = [
  {
    id: "var_segtree_min_idx",
    baseAlgoId: "segtree_point_range",
    title: "Segment Tree: Lưu giá trị min và chỉ số xuất hiện đầu tiên",
    prompt: `Yêu cầu sửa template Segment Tree cơ sở:
1. Thay vì tính Range Sum, mỗi nút lưu một cặp {min_val, min_idx}.
2. Hàm gộp 2 nút con (combine): chọn con có min_val nhỏ hơn; nếu hai con có min_val bằng nhau thì ưu tiên chọn chỉ số min_idx nhỏ hơn (đứng trước).
3. Query trả về pair<long long, int> trên đoạn [ql, qr]. Nếu ngoài đoạn trả về {INF, -1}.`,
    solution: `// Segment Tree: Min value and first minimum index
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;
const int MAXN = 200005;

pair<long long, int> tree[4 * MAXN];

pair<long long, int> combine(pair<long long, int> a, pair<long long, int> b) {
    if (a.first < b.first) return a;
    if (b.first < a.first) return b;
    return (a.second <= b.second) ? a : b;
}

void update(int node, int l, int r, int idx, long long val) {
    if (l == r) {
        tree[node] = {val, idx};
        return;
    }
    int mid = (l + r) / 2;
    if (idx <= mid) update(2 * node, l, mid, idx, val);
    else update(2 * node + 1, mid + 1, r, idx, val);
    tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
}

pair<long long, int> query(int node, int l, int r, int ql, int qr) {
    if (ql > r || qr < l) return {INF, -1};
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2;
    return combine(query(2 * node, l, mid, ql, qr), query(2 * node + 1, mid + 1, r, ql, qr));
}`
  },
  {
    id: "var_dijkstra_2d_state",
    baseAlgoId: "dijkstra",
    title: "Dijkstra: Thêm trạng thái số vé giảm giá k (k <= K)",
    prompt: `Yêu cầu sửa template Dijkstra cơ sở:
1. Mỗi đỉnh mở rộng thành trạng thái dist[u][k]: khoảng cách ngắn nhất đến đỉnh u khi đã dùng k vé giảm nửa giá tiền (w / 2).
2. Priority queue lưu tuple/struct {d, u, k}.
3. Khi duyệt cạnh (u, v, w):
   - Nhánh 1: Không dùng vé: dist[u][k] + w -> cập nhật dist[v][k].
   - Nhánh 2: Nếu k < K, dùng thêm 1 vé: dist[u][k] + w / 2 -> cập nhật dist[v][k + 1].`,
    solution: `// Dijkstra with 2D state: using at most K discount tickets
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

struct State {
    long long d;
    int u, k;
    bool operator>(const State& other) const {
        return d > other.d;
    }
};

vector<vector<long long>> dijkstra_discount(int n, int start, int max_k, const vector<vector<pair<int, long long>>>& adj) {
    vector<vector<long long>> dist(n + 1, vector<long long>(max_k + 1, INF));
    priority_queue<State, vector<State>, greater<State>> pq;

    dist[start][0] = 0;
    pq.push({0, start, 0});

    while (!pq.empty()) {
        auto [d, u, k] = pq.top();
        pq.pop();
        if (d > dist[u][k]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            long long w = edge.second;

            // Option 1: Normal move (no ticket used)
            if (dist[u][k] + w < dist[v][k]) {
                dist[v][k] = dist[u][k] + w;
                pq.push({dist[v][k], v, k});
            }

            // Option 2: Use 1 discount ticket (w / 2)
            if (k < max_k && dist[u][k] + w / 2 < dist[v][k + 1]) {
                dist[v][k + 1] = dist[u][k] + w / 2;
                pq.push({dist[v][k + 1], v, k + 1});
            }
        }
    }
    return dist;
}`
  },
  {
    id: "var_mo_freq_count",
    baseAlgoId: "mos_algorithm",
    title: "Mo's Algorithm: Đếm số phần tử xuất hiện đúng K lần",
    prompt: `Yêu cầu sửa hàm add() và del() của thuật toán Mo:
1. Mảng cnt[x] đếm tần số xuất hiện của giá trị x trong cửa sổ [L, R].
2. Biến current_answer lưu số lượng giá trị x thỏa mãn cnt[x] == K.
3. Trong add(idx):
   - Nếu cnt[x] == K, việc tăng lên làm nó không còn đúng K lần nữa -> current_answer--.
   - cnt[x]++.
   - Nếu cnt[x] == K, nó trở thành phần tử thỏa mãn -> current_answer++.
4. Viết hàm del(idx) đối ứng chính xác.`,
    solution: `// Mo's algorithm: Count distinct values appearing exactly K times
#include <bits/stdc++.h>
using namespace std;

const int MAXA = 1000005;
int cnt[MAXA];
int a[MAXA];
int K_TARGET = 1;
long long current_answer = 0;

void add(int idx) {
    int x = a[idx];
    if (cnt[x] == K_TARGET) current_answer--;
    cnt[x]++;
    if (cnt[x] == K_TARGET) current_answer++;
}

void del(int idx) {
    int x = a[idx];
    if (cnt[x] == K_TARGET) current_answer--;
    cnt[x]--;
    if (cnt[x] == K_TARGET) current_answer++;
}`
  },
  {
    id: "var_dsu_rollback",
    baseAlgoId: "dsu",
    title: "DSU có thể Rollback (Undo) phục vụ chia để trị / Offline Dynamic Connectivity",
    prompt: `Yêu cầu sửa DSU:
1. KHÔNG dùng nén đường đi (Path compression) vì nén đường đi làm hỏng lịch sử cấu trúc cây. Chỉ dùng hợp theo kích thước (Union by size/rank).
2. Dùng một stack lưu vết các thay đổi: {u, v, sz_u_cu} mỗi khi thực hiện gộp thành công.
3. Hàm rollback() khôi phục lại trạng thái của phép unite gần nhất: trả lại parent[v] = v và sz[u] = sz_u_cu.`,
    solution: `// DSU with Rollback (No path compression, Union by size)
#include <bits/stdc++.h>
using namespace std;

struct DSU_Rollback {
    vector<int> parent, sz;
    struct History {
        int u, v, old_sz_u;
    };
    stack<History> history;

    DSU_Rollback(int n) {
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);
        sz.assign(n + 1, 1);
    }

    int find(int u) {
        while (u != parent[u]) u = parent[u];
        return u;
    }

    bool unite(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) {
            history.push({-1, -1, -1}); // No-op marker
            return false;
        }
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
        if (u == -1) return; // No change was made
        parent[v] = v;
        sz[u] = old_sz;
    }
};`
  }
];
