// AlgoType C++17 Templates for Olympic Informatics (Chuyen Tin & ICPC)
// English comments in ASCII only

// 17 Thuat toan co ban va quan trong nhat
export const CORE_BUILTIN_ALGOS = [
  {
    id: "fast_io",
    titleVi: "Đọc ghi nhanh Fast I/O & Phép tính số học Modulo",
    title: "Fast I/O & Modular Arithmetic Helpers",
    tag: "Utility",
    code: `// Fast I/O and Standard Competitive Programming Template
#include <bits/stdc++.h>
using namespace std;

void fast_io() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
}

long long add_mod(long long a, long long b, long long m) {
    return (a + b) % m;
}

long long mul_mod(long long a, long long b, long long m) {
    return (long long)((__int128)a * b % m);
}`
  },
  {
    id: "dsu",
    titleVi: "Tập hợp rời nhau DSU (Nén đường đi & Gộp hạng)",
    title: "Disjoint Set Union (DSU with Path Compression & Rank)",
    tag: "Data Structures",
    code: `// Disjoint Set Union
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    DSU(int n) {
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);
        sz.assign(n + 1, 1);
    }

    int find(int u) {
        if (u == parent[u]) return u;
        return parent[u] = find(parent[u]);
    }

    bool unite(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) return false;
        if (sz[u] < sz[v]) swap(u, v);
        parent[v] = u;
        sz[u] += sz[v];
        return true;
    }
};`
  },
  {
    id: "fenwick_tree",
    titleVi: "Cây Fenwick (Cây chỉ số nhị phân - BIT)",
    title: "Fenwick Tree (Binary Indexed Tree)",
    tag: "Data Structures",
    code: `// Fenwick Tree (Point Add, Prefix Sum)
#include <bits/stdc++.h>
using namespace std;

struct Fenwick {
    int n;
    vector<long long> bit;
    Fenwick(int n) : n(n), bit(n + 1, 0) {}

    void add(int idx, long long val) {
        for (; idx <= n; idx += idx & -idx)
            bit[idx] += val;
    }

    long long query(int idx) {
        long long sum = 0;
        for (; idx > 0; idx -= idx & -idx)
            sum += bit[idx];
        return sum;
    }

    long long query_range(int l, int r) {
        if (l > r) return 0;
        return query(r) - query(l - 1);
    }
};`
  },
  {
    id: "segtree_point_range",
    titleVi: "Cây phân đoạn (Cập nhật điểm, Tính tổng đoạn)",
    title: "Segment Tree (Point Update, Range Sum)",
    tag: "Data Structures",
    code: `// Segment Tree with point update and range sum query
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
long long tree[4 * MAXN];

void update(int node, int l, int r, int idx, long long val) {
    if (l == r) {
        tree[node] = val;
        return;
    }
    int mid = (l + r) / 2;
    if (idx <= mid) update(2 * node, l, mid, idx, val);
    else update(2 * node + 1, mid + 1, r, idx, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}

long long query(int node, int l, int r, int ql, int qr) {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return tree[node];
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr) + query(2 * node + 1, mid + 1, r, ql, qr);
}`
  },
  {
    id: "segtree_lazy",
    titleVi: "Cây phân đoạn Lazy (Cập nhật đoạn, Truy vấn đoạn)",
    title: "Segment Tree (Lazy Propagation)",
    tag: "Data Structures",
    code: `// Segment Tree with lazy propagation (Range Add, Range Sum)
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
long long tree[4 * MAXN], lazy[4 * MAXN];

void push(int node, int l, int r) {
    if (lazy[node] == 0) return;
    int mid = (l + r) / 2;
    lazy[2 * node] += lazy[node];
    tree[2 * node] += lazy[node] * (mid - l + 1);
    lazy[2 * node + 1] += lazy[node];
    tree[2 * node + 1] += lazy[node] * (r - mid);
    lazy[node] = 0;
}

void update_range(int node, int l, int r, int ql, int qr, long long val) {
    if (ql > r || qr < l) return;
    if (ql <= l && r <= qr) {
        lazy[node] += val;
        tree[node] += val * (r - l + 1);
        return;
    }
    push(node, l, r);
    int mid = (l + r) / 2;
    update_range(2 * node, l, mid, ql, qr, val);
    update_range(2 * node + 1, mid + 1, r, ql, qr, val);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}

long long query_range(int node, int l, int r, int ql, int qr) {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return tree[node];
    push(node, l, r);
    int mid = (l + r) / 2;
    return query_range(2 * node, l, mid, ql, qr) + query_range(2 * node + 1, mid + 1, r, ql, qr);
}`
  },
  {
    id: "dijkstra",
    titleVi: "Thuật toán Dijkstra (Tìm đường đi ngắn nhất)",
    title: "Dijkstra (Shortest Path)",
    tag: "Graph",
    code: `// Dijkstra Algorithm with priority_queue
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;
typedef pair<long long, int> pli;

vector<long long> dijkstra(int n, int start, const vector<vector<pair<int, long long>>>& adj) {
    vector<long long> dist(n + 1, INF);
    priority_queue<pli, vector<pli>, greater<pli>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            long long w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`
  },
  {
    id: "floyd_warshall",
    titleVi: "Thuật toán Floyd-Warshall (Đường đi ngắn nhất mọi cặp đỉnh)",
    title: "Floyd-Warshall (All Pairs Shortest Paths)",
    tag: "Graph",
    code: `// Floyd-Warshall Algorithm
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

void floyd_warshall(int n, vector<vector<long long>>& dist) {
    for (int k = 1; k <= n; ++k) {
        for (int i = 1; i <= n; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (dist[i][k] < INF && dist[k][j] < INF) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }
}`
  },
  {
    id: "tarjan_scc",
    titleVi: "Thuật toán Tarjan (Thành phần liên thông mạnh SCC)",
    title: "Tarjan's Strongly Connected Components (SCC)",
    tag: "Graph",
    code: `// Tarjan algorithm for Strongly Connected Components
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int tin[MAXN], low[MAXN], timer = 0;
bool on_stack[MAXN];
stack<int> st;
vector<vector<int>> sccs;

void dfs(int u) {
    tin[u] = low[u] = ++timer;
    st.push(u);
    on_stack[u] = true;

    for (int v : adj[u]) {
        if (!tin[v]) {
            dfs(v);
            low[u] = min(low[u], low[v]);
        } else if (on_stack[v]) {
            low[u] = min(low[u], tin[v]);
        }
    }

    if (low[u] == tin[u]) {
        vector<int> component;
        while (true) {
            int v = st.top();
            st.pop();
            on_stack[v] = false;
            component.push_back(v);
            if (u == v) break;
        }
        sccs.push_back(component);
    }
}`
  },
  {
    id: "bridges_articulations",
    titleVi: "Tìm Cầu và Khớp trên đồ thị",
    title: "Bridges and Articulation Points",
    tag: "Graph",
    code: `// Find bridges and articulation points in an undirected graph
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
int tin[MAXN], low[MAXN], timer = 0;
bool is_cut[MAXN];
vector<pair<int, int>> bridges;

void dfs(int u, int p = -1) {
    tin[u] = low[u] = ++timer;
    int children = 0;

    for (int v : adj[u]) {
        if (v == p) continue;
        if (tin[v]) {
            low[u] = min(low[u], tin[v]);
        } else {
            dfs(v, u);
            low[u] = min(low[u], low[v]);
            if (low[v] > tin[u]) {
                bridges.push_back({u, v});
            }
            if (low[v] >= tin[u] && p != -1) {
                is_cut[u] = true;
            }
            ++children;
        }
    }
    if (p == -1 && children > 1) {
        is_cut[u] = true;
    }
}`
  },
  {
    id: "lca_binary_lifting",
    titleVi: "Tổ tiên chung gần nhất LCA (Nhảy nhị phân)",
    title: "Lowest Common Ancestor (Binary Lifting)",
    tag: "Trees",
    code: `// LCA using Binary Lifting
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
const int LOGN = 19;
vector<int> adj[MAXN];
int up[MAXN][LOGN];
int depth[MAXN];

void dfs(int u, int p, int d) {
    depth[u] = d;
    up[u][0] = p;
    for (int j = 1; j < LOGN; ++j) {
        up[u][j] = up[up[u][j - 1]][j - 1];
    }
    for (int v : adj[u]) {
        if (v != p) dfs(v, u, d + 1);
    }
}

int get_lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    for (int j = LOGN - 1; j >= 0; --j) {
        if (depth[u] - (1 << j) >= depth[v]) {
            u = up[u][j];
        }
    }
    if (u == v) return u;
    for (int j = LOGN - 1; j >= 0; --j) {
        if (up[u][j] != up[v][j]) {
            u = up[u][j];
            v = up[v][j];
        }
    }
    return up[u][0];
}`
  },
  {
    id: "hash_string_double",
    titleVi: "Băm chuỗi kép (Double Rolling Hash chống tràn đụng độ)",
    title: "Double String Hash (Rolling Hash)",
    tag: "Strings",
    code: `// Double Rolling Hash for fast substring equality
#include <bits/stdc++.h>
using namespace std;

const long long BASE1 = 311, MOD1 = 1e9 + 7;
const long long BASE2 = 317, MOD2 = 1e9 + 9;

struct StringHash {
    int n;
    vector<long long> h1, h2, p1, p2;

    StringHash(const string& s) : n(s.size()), h1(n + 1), h2(n + 1), p1(n + 1), p2(n + 1) {
        p1[0] = p2[0] = 1;
        for (int i = 0; i < n; ++i) {
            p1[i + 1] = (p1[i] * BASE1) % MOD1;
            p2[i + 1] = (p2[i] * BASE2) % MOD2;
            h1[i + 1] = (h1[i] * BASE1 + s[i]) % MOD1;
            h2[i + 1] = (h2[i] * BASE2 + s[i]) % MOD2;
        }
    }

    pair<long long, long long> get_hash(int l, int r) { // 1-indexed [l, r]
        long long hash1 = (h1[r] - h1[l - 1] * p1[r - l + 1]) % MOD1;
        if (hash1 < 0) hash1 += MOD1;
        long long hash2 = (h2[r] - h2[l - 1] * p2[r - l + 1]) % MOD2;
        if (hash2 < 0) hash2 += MOD2;
        return {hash1, hash2};
    }
};`
  },
  {
    id: "trie",
    titleVi: "Cây tiền tố Trie (Tra cứu & Thêm xâu ký tự)",
    title: "Trie (Prefix Tree)",
    tag: "Strings",
    code: `// Prefix Tree (Trie)
#include <bits/stdc++.h>
using namespace std;

struct TrieNode {
    int next_node[26];
    bool is_end = false;
    TrieNode() {
        memset(next_node, -1, sizeof(next_node));
    }
};

struct Trie {
    vector<TrieNode> nodes;
    Trie() { nodes.emplace_back(); }

    void insert(const string& s) {
        int u = 0;
        for (char c : s) {
            int ch = c - 'a';
            if (nodes[u].next_node[ch] == -1) {
                nodes[u].next_node[ch] = nodes.size();
                nodes.emplace_back();
            }
            u = nodes[u].next_node[ch];
        }
        nodes[u].is_end = true;
    }

    bool search(const string& s) {
        int u = 0;
        for (char c : s) {
            int ch = c - 'a';
            if (nodes[u].next_node[ch] == -1) return false;
            u = nodes[u].next_node[ch];
        }
        return nodes[u].is_end;
    }
};`
  },
  {
    id: "kmp_string_matching",
    titleVi: "Thuật toán khớp chuỗi KMP (Knuth-Morris-Pratt)",
    title: "KMP String Matching",
    tag: "Strings",
    code: `// Knuth-Morris-Pratt Algorithm
#include <bits/stdc++.h>
using namespace std;

vector<int> compute_pi(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; ++i) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) ++j;
        pi[i] = j;
    }
    return pi;
}

vector<int> kmp_search(const string& text, const string& pat) {
    string combined = pat + "#" + text;
    vector<int> pi = compute_pi(combined);
    vector<int> matches;
    int m = pat.size();
    for (int i = m + 1; i < (int)combined.size(); ++i) {
        if (pi[i] == m) {
            matches.push_back(i - 2 * m);
        }
    }
    return matches;
}`
  },
  {
    id: "linear_sieve",
    titleVi: "Sàng nguyên tố tuyến tính (Sàng Euler & Ước nguyên tố nhỏ nhất)",
    title: "Linear Sieve (Euler Sieve & Smallest Prime Factor)",
    tag: "Math",
    code: `// Linear Sieve O(N) with SPF (Smallest Prime Factor)
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10000005;
int spf[MAXN];
vector<int> primes;

void linear_sieve(int n) {
    for (int i = 2; i <= n; ++i) {
        if (spf[i] == 0) {
            spf[i] = i;
            primes.push_back(i);
        }
        for (int p : primes) {
            if (p > spf[i] || (long long)i * p > n) break;
            spf[i * p] = p;
        }
    }
}`
  },
  {
    id: "extended_gcd_mod_inverse",
    titleVi: "Euclid mở rộng & Nghịch đảo Modulo (Extended GCD)",
    title: "Extended GCD and Modular Inverse",
    tag: "Math",
    code: `// Extended Euclidean Algorithm and Modular Inverse
#include <bits/stdc++.h>
using namespace std;

long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long x1, y1;
    long long d = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - y1 * (a / b);
    return d;
}

long long mod_inverse(long long a, long long m) {
    long long x, y;
    long long g = extgcd(a, m, x, y);
    if (g != 1) return -1; // Inverse does not exist
    return (x % m + m) % m;
}`
  },
  {
    id: "knapsack_01_space_opt",
    titleVi: "Quy hoạch động Ba lô 0-1 (Tối ưu mảng 1 chiều)",
    title: "0-1 Knapsack (1D Space Optimized)",
    tag: "Dynamic Programming",
    code: `// 0-1 Knapsack with 1D DP Array
#include <bits/stdc++.h>
using namespace std;

long long knapsack(int n, int max_w, const vector<int>& weight, const vector<long long>& val) {
    vector<long long> dp(max_w + 1, 0);
    for (int i = 0; i < n; ++i) {
        for (int w = max_w; w >= weight[i]; --w) {
            dp[w] = max(dp[w], dp[w - weight[i]] + val[i]);
        }
    }
    return dp[max_w];
}`
  },
  {
    id: "lis_nlogn",
    titleVi: "Dãy con tăng dài nhất LIS O(N log N)",
    title: "Longest Increasing Subsequence O(N log N)",
    tag: "Dynamic Programming",
    code: `// LIS in O(N log N) using patience sorting / lower_bound
#include <bits/stdc++.h>
using namespace std;

int longest_increasing_subsequence(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }
    return tails.size();
}`
  }
];

// 18 Thuat toan nang cao (Tam thoi cat rieng / mo rong khi can)
export const ADVANCED_BUILTIN_ALGOS = [
  {
    id: "bellman_ford",
    titleVi: "Thuật toán Bellman-Ford (Cạnh âm & Chu trình âm)",
    title: "Bellman-Ford (Negative Edge & Cycle Detection)",
    tag: "Graph",
    code: `// Bellman-Ford algorithm
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int u, v;
    long long w;
};

const long long INF = 1e18;

bool bellman_ford(int n, int start, const vector<Edge>& edges, vector<long long>& dist) {
    dist.assign(n + 1, INF);
    dist[start] = 0;

    for (int i = 1; i <= n - 1; ++i) {
        for (const auto& e : edges) {
            if (dist[e.u] < INF && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
            }
        }
    }

    // Check negative cycle
    for (const auto& e : edges) {
        if (dist[e.u] < INF && dist[e.u] + e.w < dist[e.v]) {
            return true; // Negative cycle reachable
        }
    }
    return false;
}`
  },
  {
    id: "dinic_max_flow",
    titleVi: "Thuật toán Dinic (Luồng cực đại trên đồ thị)",
    title: "Dinic Max Flow",
    tag: "Graph",
    code: `// Dinic Maximum Flow Algorithm
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int to;
    long long cap, flow;
    int rev;
};

struct Dinic {
    int n;
    vector<vector<Edge>> adj;
    vector<int> level, ptr;

    Dinic(int n) : n(n), adj(n + 1), level(n + 1), ptr(n + 1) {}

    void add_edge(int from, int to, long long cap) {
        adj[from].push_back({to, cap, 0, (int)adj[to].size()});
        adj[to].push_back({from, 0, 0, (int)adj[from].size() - 1});
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        level[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int v = q.front();
            q.pop();
            for (auto& edge : adj[v]) {
                if (edge.cap - edge.flow > 0 && level[edge.to] == -1) {
                    level[edge.to] = level[v] + 1;
                    q.push(edge.to);
                }
            }
        }
        return level[t] != -1;
    }

    long long dfs(int v, int t, long long pushed) {
        if (pushed == 0 || v == t) return pushed;
        for (int& cid = ptr[v]; cid < adj[v].size(); ++cid) {
            auto& edge = adj[v][cid];
            int tr = edge.to;
            if (level[v] + 1 != level[tr] || edge.cap - edge.flow == 0) continue;
            long long tr_pushed = dfs(tr, t, min(pushed, edge.cap - edge.flow));
            if (tr_pushed == 0) continue;
            edge.flow += tr_pushed;
            adj[tr][edge.rev].flow -= tr_pushed;
            return tr_pushed;
        }
        return 0;
    }

    long long max_flow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(ptr.begin(), ptr.end(), 0);
            while (long long pushed = dfs(s, t, 1e18)) {
                flow += pushed;
            }
        }
        return flow;
    }
};`
  },
  {
    id: "heavy_light_decomposition",
    titleVi: "Phân rã cây nặng nhẹ HLD (Heavy-Light Decomposition)",
    title: "Heavy-Light Decomposition (HLD)",
    tag: "Trees",
    code: `// Heavy-Light Decomposition
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
vector<int> adj[MAXN];
int parent_node[MAXN], depth[MAXN], heavy[MAXN], head[MAXN], pos[MAXN];
int cur_pos = 0;

int dfs_sz(int u, int p, int d) {
    int sz = 1, max_c_sz = 0;
    parent_node[u] = p;
    depth[u] = d;
    heavy[u] = -1;
    for (int v : adj[u]) {
        if (v != p) {
            int c_sz = dfs_sz(v, u, d + 1);
            sz += c_sz;
            if (c_sz > max_c_sz) {
                max_c_sz = c_sz;
                heavy[u] = v;
            }
        }
    }
    return sz;
}

void decompose(int u, int h) {
    head[u] = h;
    pos[u] = ++cur_pos;
    if (heavy[u] != -1) decompose(heavy[u], h);
    for (int v : adj[u]) {
        if (v != parent_node[u] && v != heavy[u]) {
            decompose(v, v);
        }
    }
}`
  },
  {
    id: "centroid_decomposition",
    titleVi: "Phân rã trọng tâm cây (Centroid Decomposition)",
    title: "Centroid Decomposition",
    tag: "Trees",
    code: `// Centroid Decomposition of a Tree
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
vector<int> adj[MAXN];
bool removed[MAXN];
int sz[MAXN];

int get_sizes(int u, int p) {
    sz[u] = 1;
    for (int v : adj[u]) {
        if (v != p && !removed[v]) {
            sz[u] += get_sizes(v, u);
        }
    }
    return sz[u];
}

int get_centroid(int u, int p, int total) {
    for (int v : adj[u]) {
        if (v != p && !removed[v] && sz[v] > total / 2) {
            return get_centroid(v, u, total);
        }
    }
    return u;
}

void build_centroid_tree(int u) {
    get_sizes(u, -1);
    int c = get_centroid(u, -1, sz[u]);
    removed[c] = true;

    for (int v : adj[c]) {
        if (!removed[v]) {
            build_centroid_tree(v);
        }
    }
}`
  },
  {
    id: "z_algorithm",
    titleVi: "Mảng Z & Thuật toán so khớp chuỗi Z-Algorithm",
    title: "Z-Algorithm",
    tag: "Strings",
    code: `// Z-Algorithm for string matching
#include <bits/stdc++.h>
using namespace std;

vector<int> compute_z(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; ++i) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}`
  },
  {
    id: "manacher",
    titleVi: "Thuật toán Manacher (Tìm chuỗi đối xứng con dài nhất)",
    title: "Manacher's Algorithm (Palindromic Substrings)",
    tag: "Strings",
    code: `// Manacher's Algorithm for Longest Palindromic Substrings
#include <bits/stdc++.h>
using namespace std;

vector<int> manacher(const string& s) {
    string t = "^";
    for (char c : s) {
        t += '#';
        t += c;
    }
    t += "#$";

    int n = t.size();
    vector<int> p(n, 0);
    int c = 0, r = 0;

    for (int i = 1; i < n - 1; ++i) {
        int i_mirror = 2 * c - i;
        if (r > i) p[i] = min(r - i, p[i_mirror]);
        while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) ++p[i];
        if (i + p[i] > r) {
            c = i;
            r = i + p[i];
        }
    }
    return p;
}`
  },
  {
    id: "aho_corasick",
    titleVi: "Tự động hóa Aho-Corasick (Khớp nhiều mẫu chuỗi)",
    title: "Aho-Corasick Automaton",
    tag: "Strings",
    code: `// Aho-Corasick Multiple Pattern String Matching
#include <bits/stdc++.h>
using namespace std;

const int ALPHABET = 26;

struct Vertex {
    int next_node[ALPHABET];
    bool output = false;
    int link = -1;
    int next_match = -1;
    Vertex() {
        memset(next_node, -1, sizeof(next_node));
    }
};

vector<Vertex> t(1);

void insert(const string& s) {
    int v = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (t[v].next_node[c] == -1) {
            t[v].next_node[c] = t.size();
            t.emplace_back();
        }
        v = t[v].next_node[c];
    }
    t[v].output = true;
}

void build_automaton() {
    queue<int> q;
    q.push(0);
    while (!q.empty()) {
        int v = q.front();
        q.pop();
        for (int c = 0; c < ALPHABET; ++c) {
            int u = t[v].next_node[c];
            if (u != -1) {
                t[u].link = (v == 0) ? 0 : t[t[v].link].next_node[c];
                t[u].next_match = t[t[u].link].output ? t[u].link : t[t[u].link].next_match;
                q.push(u);
            } else {
                t[v].next_node[c] = (v == 0) ? 0 : t[t[v].link].next_node[c];
            }
        }
    }
}`
  },
  {
    id: "matrix_exponentiation",
    titleVi: "Lũy thừa ma trận (Nhân ma trận & Fibonacci lớn)",
    title: "Matrix Exponentiation",
    tag: "Math",
    code: `// Matrix Exponentiation for Linear Recurrences
#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1e9 + 7;

typedef vector<vector<long long>> Matrix;

Matrix multiply(const Matrix& a, const Matrix& b) {
    int n = a.size();
    Matrix c(n, vector<long long>(n, 0));
    for (int i = 0; i < n; ++i) {
        for (int k = 0; k < n; ++k) {
            for (int j = 0; j < n; ++j) {
                c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
            }
        }
    }
    return c;
}

Matrix power(Matrix a, long long exp) {
    int n = a.size();
    Matrix res(n, vector<long long>(n, 0));
    for (int i = 0; i < n; ++i) res[i][i] = 1;

    while (exp > 0) {
        if (exp & 1) res = multiply(res, a);
        a = multiply(a, a);
        exp >>= 1;
    }
    return res;
}`
  },
  {
    id: "combinatorics_ncr",
    titleVi: "Tổ hợp chập K (nCr tiền xử lý giai thừa & Modulo)",
    title: "Combinatorics (nCr with Precomputed Factorials)",
    tag: "Math",
    code: `// Precompute factorials and inverses for combinations nCr mod P
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1000005;
const long long MOD = 1e9 + 7;
long long fact[MAXN], inv_fact[MAXN];

long long power(long long base, long long exp) {
    long long res = 1;
    base %= MOD;
    while (exp > 0) {
        if (exp & 1) res = (res * base) % MOD;
        base = (base * base) % MOD;
        exp >>= 1;
    }
    return res;
}

void precompute() {
    fact[0] = 1;
    for (int i = 1; i < MAXN; ++i) fact[i] = (fact[i - 1] * i) % MOD;
    inv_fact[MAXN - 1] = power(fact[MAXN - 1], MOD - 2);
    for (int i = MAXN - 2; i >= 0; --i) inv_fact[i] = (inv_fact[i + 1] * (i + 1)) % MOD;
}

long long nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}`
  },
  {
    id: "lucas_theorem_mod_p",
    titleVi: "Định lý Lucas (Tính nCr theo Modulo nguyên tố P nhỏ)",
    title: "Lucas Theorem (nCr mod Prime P)",
    tag: "Math",
    code: `// Lucas Theorem for nCr mod prime P
#include <bits/stdc++.h>
using namespace std;

long long small_nCr(long long n, long long r, long long p) {
    if (r < 0 || r > n) return 0;
    long long num = 1, den = 1;
    for (long long i = 0; i < r; ++i) {
        num = (num * (n - i)) % p;
        den = (den * (i + 1)) % p;
    }
    // Fermat Little Theorem for mod inverse
    long long inv_den = 1, exp = p - 2;
    while (exp > 0) {
        if (exp & 1) inv_den = (inv_den * den) % p;
        den = (den * den) % p;
        exp >>= 1;
    }
    return (num * inv_den) % p;
}

long long lucas(long long n, long long r, long long p) {
    if (r == 0) return 1;
    int ni = n % p;
    int ri = r % p;
    if (ri > ni) return 0;
    return (lucas(n / p, r / p, p) * small_nCr(ni, ri, p)) % p;
}`
  },
  {
    id: "miller_rabin_pollard_rho",
    titleVi: "Kiểm tra số nguyên tố Miller-Rabin & Phân tích Pollard Rho",
    title: "Miller-Rabin Primality Test",
    tag: "Math",
    code: `// Deterministic Miller-Rabin Primality Test for 64-bit int
#include <bits/stdc++.h>
using namespace std;

using u64 = unsigned long long;
using u128 = __uint128_t;

u64 power(u64 base, u64 exp, u64 mod) {
    u64 res = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) res = (u128)res * base % mod;
        base = (u128)base * base % mod;
        exp >>= 1;
    }
    return res;
}

bool miller_rabin(u64 n) {
    if (n < 2) return false;
    for (u64 p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
        if (n <= p) return n == p;
        if (n % p == 0) return false;
    }

    int r = __builtin_ctzll(n - 1);
    u64 d = (n - 1) >> r;

    for (u64 a : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
        u64 x = power(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (int i = 0; i < r - 1; ++i) {
            x = (u128)x * x % n;
            if (x == n - 1) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }
    return true;
}`
  },
  {
    id: "mos_algorithm",
    titleVi: "Thuật toán Mo (Xử lý truy vấn đoạn Offline)",
    title: "Mo's Algorithm (Offline Range Queries)",
    tag: "Advanced",
    code: `// Mo's Algorithm with Hilbert / Block ordering
#include <bits/stdc++.h>
using namespace std;

const int BLOCK_SIZE = 450;

struct Query {
    int l, r, id;
    bool operator<(const Query& other) const {
        int b1 = l / BLOCK_SIZE;
        int b2 = other.l / BLOCK_SIZE;
        if (b1 != b2) return b1 < b2;
        return (b1 & 1) ? r < other.r : r > other.r;
    }
};

long long current_answer = 0;

void add(int idx) {
    // Modify current_answer when adding element
}

void del(int idx) {
    // Modify current_answer when removing element
}

void process_queries(vector<Query>& queries, vector<long long>& answers) {
    sort(queries.begin(), queries.end());
    int cur_l = 0, cur_r = -1;

    for (const auto& q : queries) {
        while (cur_l > q.l) add(--cur_l);
        while (cur_r < q.r) add(++cur_r);
        while (cur_l < q.l) del(cur_l++);
        while (cur_r > q.r) del(cur_r--);
        answers[q.id] = current_answer;
    }
}`
  },
  {
    id: "two_sat",
    titleVi: "Bài toán 2-SAT (Thỏa mãn 2 biến qua liên thông mạnh)",
    title: "2-SAT (2-Satisfiability via SCC)",
    tag: "Graph",
    code: `// 2-SAT Solver using Kosaraju / Tarjan
#include <bits/stdc++.h>
using namespace std;

struct TwoSat {
    int n;
    vector<vector<int>> adj, adj_rev;
    vector<int> order, comp;
    vector<bool> visited, assignment;

    TwoSat(int n) : n(n), adj(2 * n), adj_rev(2 * n), comp(2 * n, -1), assignment(n) {}

    // Add clause (x or y). Note: variable x is 0-indexed; negated x is x + n
    void add_clause(int u, bool val_u, int v, bool val_v) {
        int from_u = val_u ? u : u + n;
        int to_u = val_u ? u + n : u;
        int from_v = val_v ? v : v + n;
        int to_v = val_v ? v + n : v;

        adj[to_u].push_back(from_v);
        adj[to_v].push_back(from_u);
        adj_rev[from_v].push_back(to_u);
        adj_rev[from_u].push_back(to_v);
    }

    void dfs1(int u) {
        visited[u] = true;
        for (int v : adj[u]) if (!visited[v]) dfs1(v);
        order.push_back(u);
    }

    void dfs2(int u, int c) {
        comp[u] = c;
        for (int v : adj_rev[u]) if (comp[v] == -1) dfs2(v, c);
    }

    bool solve() {
        visited.assign(2 * n, false);
        for (int i = 0; i < 2 * n; ++i) if (!visited[i]) dfs1(i);
        int c = 0;
        for (int i = 2 * n - 1; i >= 0; --i) {
            int u = order[i];
            if (comp[u] == -1) dfs2(u, c++);
        }
        for (int i = 0; i < n; ++i) {
            if (comp[i] == comp[i + n]) return false;
            assignment[i] = comp[i] > comp[i + n];
        }
        return true;
    }
};`
  },
  {
    id: "convex_hull_graham",
    titleVi: "Bao lồi tập điểm (Thuật toán Andrew Monotone Chain / Graham)",
    title: "Convex Hull (Monotone Chain / Graham Scan)",
    tag: "Geometry",
    code: `// Convex Hull (Andrew's Monotone Chain)
#include <bits/stdc++.h>
using namespace std;

struct Point {
    long long x, y;
    bool operator<(const Point& p) const {
        return x < p.x || (x == p.x && y < p.y);
    }
};

long long cross_product(Point o, Point a, Point b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

vector<Point> convex_hull(vector<Point>& pts) {
    int n = pts.size(), k = 0;
    if (n <= 2) return pts;
    vector<Point> h(2 * n);
    sort(pts.begin(), pts.end());

    // Lower hull
    for (int i = 0; i < n; ++i) {
        while (k >= 2 && cross_product(h[k - 2], h[k - 1], pts[i]) <= 0) --k;
        h[k++] = pts[i];
    }
    // Upper hull
    for (int i = n - 2, t = k + 1; i >= 0; --i) {
        while (k >= t && cross_product(h[k - 2], h[k - 1], pts[i]) <= 0) --k;
        h[k++] = pts[i];
    }
    h.resize(k - 1);
    return h;
}`
  },
  {
    id: "point_in_polygon",
    titleVi: "Kiểm tra điểm nằm trong đa giác (Chiếu tia Ray Casting)",
    title: "Point in Polygon (Ray Casting & Winding Number)",
    tag: "Geometry",
    code: `// Check if point is inside, on boundary, or outside polygon
#include <bits/stdc++.h>
using namespace std;

struct Point {
    long long x, y;
};

long long cross_product(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

bool on_segment(Point p, Point a, Point b) {
    return cross_product(a, b, p) == 0 &&
           p.x >= min(a.x, b.x) && p.x <= max(a.x, b.x) &&
           p.y >= min(a.y, b.y) && p.y <= max(a.y, b.y);
}

int point_in_polygon(Point p, const vector<Point>& poly) {
    int n = poly.size();
    bool inside = false;
    for (int i = 0; i < n; ++i) {
        Point a = poly[i];
        Point b = poly[(i + 1) % n];
        if (on_segment(p, a, b)) return 0; // On boundary
        if ((a.y > p.y) != (b.y > p.y)) {
            double x_intersect = (double)(b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x;
            if (p.x < x_intersect) inside = !inside;
        }
    }
    return inside ? 1 : -1; // 1 = inside, -1 = outside
}`
  },
  {
    id: "bitset_optimizations",
    titleVi: "Tối ưu Bitset (Khả năng đến được & Đếm tập con)",
    title: "Bitset Graph Reachability & Subsets",
    tag: "Advanced",
    code: `// Bitset Transitive Closure and Subset Counting
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 2005;
bitset<MAXN> reach[MAXN];

void transitive_closure(int n) {
    for (int i = 1; i <= n; ++i) reach[i][i] = 1;
    for (int k = 1; k <= n; ++k) {
        for (int i = 1; i <= n; ++i) {
            if (reach[i][k]) reach[i] |= reach[k];
        }
    }
}`
  },
  {
    id: "sos_dp",
    titleVi: "Quy hoạch động SOS DP (Sum Over Subsets - Tổng tập con)",
    title: "Sum Over Subsets (SOS) DP",
    tag: "Dynamic Programming",
    code: `// SOS DP: Compute sum of submasks in O(N * 2^N)
#include <bits/stdc++.h>
using namespace std;

void sos_dp(int n, vector<long long>& f) {
    int total_masks = 1 << n;
    for (int i = 0; i < n; ++i) {
        for (int mask = 0; mask < total_masks; ++mask) {
            if (mask & (1 << i)) {
                f[mask] += f[mask ^ (1 << i)];
            }
        }
    }
}`
  },
  {
    id: "dp_digit",
    titleVi: "Quy hoạch động chữ số (Digit DP)",
    title: "Digit DP (Counting Numbers with Properties)",
    tag: "Dynamic Programming",
    code: `// Digit DP template: count valid integers in range [0, S]
#include <bits/stdc++.h>
using namespace std;

string S;
long long memo[20][2][2]; // [pos][is_tight][is_leading_zero]

long long dp(int pos, bool is_tight, bool is_leading_zero) {
    if (pos == S.size()) return 1; // Valid number formed
    if (memo[pos][is_tight][is_leading_zero] != -1)
        return memo[pos][is_tight][is_leading_zero];

    long long ans = 0;
    int limit = is_tight ? (S[pos] - '0') : 9;

    for (int dig = 0; dig <= limit; ++dig) {
        bool next_tight = is_tight && (dig == limit);
        bool next_lz = is_leading_zero && (dig == 0);
        ans += dp(pos + 1, next_tight, next_lz);
    }
    return memo[pos][is_tight][is_leading_zero] = ans;
}`
  }
];

// All 35 Algorithms
export const ALL_BUILTIN_ALGOS = [...CORE_BUILTIN_ALGOS, ...ADVANCED_BUILTIN_ALGOS];

// Default Active Library: 17 Core Algorithms
export const BUILTIN_ALGOS = CORE_BUILTIN_ALGOS;
