# AlgoType v2 - Nền Tảng Ôn Thi Olympic Tin Học Sinh Viên (Chuyên Tin C++)

AlgoType v2 mở rộng từ công cụ gõ template C++ thành nền tảng ôn luyện toàn diện cho sinh viên ôn thi **Olympic Tin học Sinh viên (Khối Chuyên tin)** và lập trình thi đấu ICPC / VNOI.

---

## 🚀 Các Tính Năng Chính

1. **Bộ máy gõ C++ & Spaced Repetition**:
   - Giao diện giấy kẻ ô caro, mực xanh đậm, con trỏ bút dạ vàng, bút đỏ báo lỗi.
   - Phím `Tab` nhảy qua thụt lề; tự thụt lề sau `Enter`; phím `Esc` hiện gợi ý 12 ký tự (chế độ Nhớ).
   - Hệ thống 5 hộp Leitner: `[0, 1, 3, 7, 14, 30 ngày]`.
   - Quản lý linh hoạt: **Thêm mới, Sửa mã nguồn trực tiếp, hoặc Xóa bất kỳ thuật toán nào ngay trên web**.
   - Hỗ trợ **nhập từ file .cpp** tự động nhận diện và tách từng thuật toán.
2. **Sổ "Điều then chốt" (Key Insights)**:
   - Lưu trữ các nhận xét, bẫy đề thi và tính chất toán học then chốt gắn liền với từng bài đề hoặc thuật toán.
   - Màn hình *Ôn hôm nay* chia 2 tab: *Code đến hạn* và *Thẻ flashcard đến hạn*.
3. **Kho Đề 24 Bài Olympic Tin Học (2020 - 2025)**:
   - Đầy đủ 6 năm (Lần 29 đến 34) kèm bảng subtask chi tiết, phân loại dạng bài, trạng thái giải bài và liên kết hai chiều trực tiếp sang template tương ứng.
4. **⏱️ Thi Thử Bấm Giờ 180 Phút**:
   - Chọn bộ đề 4 bài, đồng hồ đếm ngược 180 phút lưu vào `localStorage` (đóng tab/tải lại trang vẫn đếm tiếp chính xác).
   - Tự chấm điểm trên thang 400 và lưu lịch sử thi thử.
5. **Chế độ Bài Biến Thể & So Khớp Lỏng (Loose Token Matcher)**:
   - Ô gõ tự do sửa đổi template theo yêu cầu bài toán.
   - Bỏ qua khoảng trắng và chú thích (`//`, `/* */`), tách token C++.
   - **Tự động nhận diện đổi tên biến nhất quán (Bijective 1-to-1 Mapping)**: Cho phép đổi tên biến thoải mái mà vẫn ghi nhận đúng cấu trúc!
   - Bảng đối chiếu song song (Side-by-side Diff).
6. **✍️ Chế độ Điền Khuyết**:
   - Điền khuyết theo cú pháp `«...»` hoặc tự động ẩn 30% dòng vòng lặp / toán tử.
7. **❓ Bộ Câu Hỏi Tự Kiểm**:
   - 3 câu hỏi sâu bản chất cho 12 thuật toán quan trọng nhất (đánh dấu cờ *Do AI soạn, cần tôi duyệt*).
8. **📖 Sổ Công Thức Tra Nhanh**:
   - Tra cứu Lucas mod 2, Legendre, fib(gcd), quan hệ Tổng vs XOR vs AND, Zeckendorf, Nghịch đảo Modulo.
   - Chế độ **In tài liệu tra cứu (Print view)** mang theo ôn thi.
9. **Sổ Lỗi Thực Chiến**:
   - Thống kê tuần theo 8 loại lỗi kinh điển (tràn số, thiếu mod, thiếu biên, TLE, lỗi cài đặt...).

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Kích Hoạt GitHub Pages

### Bước 1: Tạo Repository mới trên GitHub
1. Vào [github.com/new](https://github.com/new) và tạo một repo mới (ví dụ đặt tên: `algotype`).
2. Chọn chế độ **Public**.

### Bước 2: Đẩy mã nguồn lên GitHub
Mở terminal tại thư mục dự án và chạy các lệnh sau:
```bash
# 1. Thêm link remote đến repository GitHub của bạn
git remote add origin https://github.com/<ten-tai-khoan-cua-ban>/<ten-repo>.git

# 2. Đặt nhánh chính là main
git branch -M main

# 3. Đẩy toàn bộ mã nguồn lên GitHub
git push -u origin main
```

### Bước 3: Bật GitHub Pages
1. Trên GitHub, vào tab **Settings** của repository -> mục **Pages** (ở cột bên trái).
2. Tại mục **Build and deployment** -> **Source**:
   - Chọn **Deploy from a branch**.
   - Mục **Branch**: Chọn **main** và thư mục **/ (root)**.
   - Bấm **Save**.
3. Sau khoảng 1 phút, trang web của bạn sẽ hoạt động tại địa chỉ:
   `https://duyphamdevx.github.io/algotype/`

---

## 💻 Chạy Thử Cục Bộ Trên Máy Tính (Local)

### Cách 1: Dùng Python (Không cần Node.js)
Do dự án sử dụng chuẩn ES Modules thuần:
```bash
python3 -m http.server 3000
```
Mở trình duyệt tại: `http://localhost:3000`

### Cách 2: Dùng Vite Dev Server
```bash
npm install
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`
