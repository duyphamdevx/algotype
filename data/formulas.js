// Sổ công thức tra nhanh cho Olympic Tin học (Chuyên tin C++)
// LaTeX / ASCII formulas for math, number theory, and combinatorics

export const INITIAL_FORMULAS = [
  {
    id: "f_pascal_lucas_mod2",
    title: "Tam giác Pascal mod 2 & Định lý Lucas",
    category: "Tổ hợp & Bitwise",
    latex: "C(n, k) \\equiv 1 \\pmod 2 \\iff (n \\ \\& \\ k) == k",
    description: "Hệ số nhị thức C(n, k) lẻ khi và chỉ khi trong biểu diễn nhị phân, mọi vị trí bit 1 của k đều là bit 1 của n. Mọi số a XOR a = 0.",
    example: "C(5, 1) = 5 (lẻ) vì 5 = 101_2, 1 = 001_2, (5 & 1) == 1. C(5, 2) = 10 (chẵn) vì 2 = 010_2, (5 & 2) == 0 != 2.",
    cppSnippet: "bool is_odd_nCr(long long n, long long k) {\n    return (n & k) == k;\n}"
  },
  {
    id: "f_legendre_formula",
    title: "Công thức Legendre (Số mũ nguyên tố trong n!)",
    category: "Số học",
    latex: "E_p(n!) = \\sum_{k=1}^{\\infty} \\left\\lfloor \\frac{n}{p^k} \\right\\rfloor = \\frac{n - S_p(n)}{p - 1}",
    description: "Số lần thừa số nguyên tố p xuất hiện trong phân tích thừa số nguyên tố của n!. S_p(n) là tổng các chữ số của n trong hệ cơ số p.",
    example: "Số chữ số 0 tận cùng của 100! là E_5(100!) = 100/5 + 100/25 = 20 + 4 = 24 chữ số 0.",
    cppSnippet: "long long legendre(long long n, long long p) {\n    long long count = 0;\n    while (n > 0) {\n        count += n / p;\n        n /= p;\n    }\n    return count;\n}"
  },
  {
    id: "f_fib_gcd",
    title: "Ước chung lớn nhất của hai số Fibonacci",
    category: "Số học & Dãy số",
    latex: "\\gcd(F_a, F_b) = F_{\\gcd(a, b)}",
    description: "Ước chung lớn nhất của số Fibonacci thứ a và thứ b bằng chính số Fibonacci thứ gcd(a, b).",
    example: "gcd(F_12, F_18) = gcd(144, 2584) = 8 = F_6 = F_{gcd(12, 18)}.",
    cppSnippet: "// Combine with matrix exponentiation for F_gcd in O(log(gcd(a, b)))\nlong long fib_gcd(long long a, long long b) {\n    return fibonacci(std::gcd(a, b));\n}"
  },
  {
    id: "f_sum_xor_and",
    title: "Quan hệ giữa Tổng, XOR và AND",
    category: "Bitwise",
    latex: "a + b = (a \\oplus b) + 2(a \\ \\& \\ b)",
    description: "Tổng thường bằng tổng bit không nhớ (XOR) cộng với phần nhớ được dịch trái 1 bit (2 * AND). Suy ra: (a ^ b) = (a + b) - 2 * (a & b).",
    example: "Nếu a + b = S và a ^ b = X, thì a & b = (S - X) / 2 (điều kiện cần: S >= X và (S - X) chẵn, đồng thời ((S - X)/2 & X) == 0).",
    cppSnippet: "bool find_a_b(long long S, long long X, long long &a, long long &b) {\n    if (S < X || (S - X) % 2 != 0) return false;\n    long long A = (S - X) / 2;\n    if (A & X) return false;\n    a = A | X;\n    b = A;\n    return true;\n}"
  },
  {
    id: "f_zeckendorf",
    title: "Định lý Zeckendorf",
    category: "Dãy số",
    latex: "N = \\sum_{i} F_{k_i} \\quad (k_i \\ge 2, \\ k_{i+1} \\ge k_i + 2)",
    description: "Mọi số nguyên dương đều có thể biểu diễn duy nhất dưới dạng tổng của một hoặc nhiều số Fibonacci phân biệt sao cho không có hai số nào đứng kề nhau.",
    example: "100 = 89 + 8 + 3 = F_11 + F_6 + F_4. Luôn tìm được bằng thuật toán tham lam chọn số Fibonacci lớn nhất <= N.",
    cppSnippet: "vector<long long> zeckendorf(long long n, const vector<long long>& fib) {\n    vector<long long> res;\n    for (int i = fib.size() - 1; i >= 2; --i) {\n        if (n >= fib[i]) {\n            res.push_back(fib[i]);\n            n -= fib[i];\n        }\n    }\n    return res;\n}"
  },
  {
    id: "f_modular_inverse_fermat",
    title: "Nghịch đảo modulo theo định lý Fermat nhỏ & Euler",
    category: "Số học",
    latex: "a^{-1} \\equiv a^{p-2} \\pmod p \\quad (p \\text{ nguyên tố}, \\ \\gcd(a, p) = 1)",
    description: "Với modulo m bất kỳ: a^{phi(m)} = 1 (mod m) => a^{-1} = a^{phi(m)-1} mod m. Hoặc dùng thuật toán Euclid mở rộng khi gcd(a, m) = 1.",
    example: "Nghịch đảo của 3 mod 7: 3^(7-2) = 3^5 = 243 = 5 (mod 7). Thử lại: 3 * 5 = 15 = 1 (mod 7).",
    cppSnippet: "long long mod_inv(long long a, long long p) {\n    return power_mod(a, p - 2, p);\n}"
  }
];
