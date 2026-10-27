// Thư viện Stress Test cho thi đấu Olympic Tin học (Chuyên tin C++)
// Giúp tìm ca test nhỏ nhất gây sai khác (WA) giữa lời giải chính và vét cạn

export const STRESS_TEST_SNIPPETS = [
  {
    id: "stress_gen_cpp",
    title: "Bộ sinh test ngẫu nhiên C++ (gen.cpp)",
    tag: "Stress Test",
    code: `// Random Test Generator using mt19937_64
#include <bits/stdc++.h>
using namespace std;

mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());

long long rand_range(long long l, long long r) {
    return uniform_int_distribution<long long>(l, r)(rng);
}

int main() {
    int n = rand_range(1, 10); // Small N to debug easily
    cout << n << "\\n";
    for (int i = 0; i < n; ++i) {
        cout << rand_range(1, 100) << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`
  },
  {
    id: "stress_checker_bash",
    title: "Script chạy đối chiếu tự động Bash (checker.sh)",
    tag: "Stress Test",
    code: `#!/usr/bin/env bash
# Compile all 3 programs
g++ -O2 -std=c++17 gen.cpp -o gen
g++ -O2 -std=c++17 sol.cpp -o sol
g++ -O2 -std=c++17 brute.cpp -o brute

for ((i = 1; i <= 1000; ++i)); do
    ./gen > input.txt
    ./sol < input.txt > out_sol.txt
    ./brute < input.txt > out_brute.txt

    if diff -w out_sol.txt out_brute.txt > /dev/null; then
        echo "Test $i: PASSED"
    else
        echo "Test $i: WRONG ANSWER!"
        echo "=== Input ==="
        cat input.txt
        echo "=== Output of sol ==="
        cat out_sol.txt
        echo "=== Output of brute ==="
        cat out_brute.txt
        break
    fi
done`
  },
  {
    id: "stress_runner_cpp",
    title: "Bộ đối chiếu viết bằng C++ (stress_runner.cpp)",
    tag: "Stress Test",
    code: `// Single-file Stress Test Runner in C++ (Cross-platform)
#include <bits/stdc++.h>
using namespace std;

// Paste your Brute Force solution here
long long solve_brute(int n, const vector<long long>& a) {
    long long ans = 0;
    // ... Brute force O(N^2) ...
    return ans;
}

// Paste your Optimized solution here
long long solve_optimized(int n, const vector<long long>& a) {
    long long ans = 0;
    // ... Segment tree / DP O(N log N) ...
    return ans;
}

int main() {
    mt19937_64 rng(1337);
    int tests = 10000;

    for (int t = 1; t <= tests; ++t) {
        int n = uniform_int_distribution<int>(1, 15)(rng);
        vector<long long> a(n);
        for (int i = 0; i < n; ++i) {
            a[i] = uniform_int_distribution<long long>(1, 50)(rng);
        }

        long long ans_brute = solve_brute(n, a);
        long long ans_opt = solve_optimized(n, a);

        if (ans_brute != ans_opt) {
            cout << "FAILED AT TEST " << t << "\\n";
            cout << "Input: N = " << n << "\\nArray: ";
            for (auto x : a) cout << x << " ";
            cout << "\\nExpected (Brute): " << ans_brute;
            cout << "\\nGot (Optimized):  " << ans_opt << "\\n";
            return 0;
        }
    }
    cout << "All " << tests << " stress tests passed successfully!\\n";
    return 0;
}`
  }
];
