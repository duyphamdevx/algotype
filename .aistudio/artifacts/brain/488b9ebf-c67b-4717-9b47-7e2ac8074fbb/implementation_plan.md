# AlgoType - Nền tảng ôn thi Olympic Tin học Sinh viên (Chuyên tin C++) - Giai đoạn 1

Mở rộng ứng dụng AlgoType từ một công cụ luyện gõ template thuần túy thành một nền tảng ôn thi toàn diện cho sinh viên Olympic Tin học: kết hợp ghi nhớ phản xạ code, sổ điều then chốt (flashcards), ngân hàng 24 bài đề thi 2020-2025 kèm subtask, sổ lỗi thực chiến, và luyện sửa bài biến thể.

## Quyết định cốt lõi đã xác nhận

> [!IMPORTANT]
> Dựa trên phản hồi làm rõ yêu cầu:
> - **Kiến trúc mã nguồn**: Sử dụng **ES Modules thuần (Vanilla JS/HTML/CSS)** chạy trực tiếp trên GitHub Pages không cần build pipeline, đồng thời tương thích hoàn hảo với môi trường Vite dev server.
> - **Màn hình "Ôn hôm nay"**: Bố cục phân chia **2 tab rõ ràng**: Tab 1 dành cho **Template code đến hạn gõ** (theo 5 mức Leitner), Tab 2 dành cho **Thẻ điều then chốt đến hạn lặp lại** (tự đánh giá Nhớ / Chưa nhớ).
> - **Chế độ "Bài biến thể"**: Cung cấp giao diện **So sánh song song (Side-by-side Diff)** giữa mã nguồn biến thể do thí sinh tự gõ và mã nguồn giải mẫu chuẩn, giúp nhận diện ngay điểm khác biệt logic trước khi bước sang thuật toán so khớp lỏng ở Giai đoạn 2.
> - **An toàn dữ liệu**: Tự động chuyển đổi `algotype-v1` sang `algotype-v2`, kèm nút tải bản sao lưu dự phòng JSON trước khi cập nhật.

---

## 1. Tổng quan & Khái niệm cốt lõi

- **Mục tiêu**: Giúp thí sinh khối Chuyên tin không chỉ gõ thuộc template chuẩn C++ mà còn rèn luyện tư duy nhận diện tính chất bài toán, tối ưu subtask, lưu vết bẫy đề thi và các kỹ thuật sửa template theo yêu cầu đề bài.
- **Đối tượng**: Sinh viên ôn thi Olympic Tin học Sinh viên (OLP) khối Chuyên tin và lập trình thi đấu (ICPC, VNOI).
- **Trọng tâm Giai đoạn 1**:
  1. **Bảo tồn toàn vẹn**: Bộ máy gõ ký tự phím, con trỏ bút dạ vàng, mực xanh đậm, bút đỏ báo lỗi, nền giấy kẻ ô li caro, phím Tab nhảy indent, Esc hiện 12 ký tự gợi ý, hệ thống 5 hộp Leitner `INT = [0, 1, 3, 7, 14, 30]`.
  2. **Sổ "Điều then chốt" (Key Insights)**: Quản lý ghi chú tính chất toán học / thuật toán theo từng bài hoặc từng template, gắn liền thuật toán lặp lại ngắt quãng.
  3. **Kho đề 24 bài Olympic Tin học (2020 - 2025)**: Đầy đủ 6 năm (Lần 29 đến 34), thông tin subtasks, trạng thái làm bài, liên kết 2 chiều với thuật toán.
  4. **Sổ lỗi (Mistake Tracker)**: Phân loại sai lầm kinh điển (đọc sai đề, thiếu mod, tràn số, TLE, sai thuật toán, thiếu biên, lỗi cài đặt, chưa hiểu đề) kèm bảng thống kê tuần.
  5. **Bài biến thể (Variant Drills)**: Đề bài yêu cầu sửa đổi thuật toán cơ sở, khung gõ tự do và bộ so sánh song song trực quan.

---

## 2. Trải nghiệm người dùng & Thiết kế giao diện (UI/UX)

### Phong cách thẩm mỹ (Notebook Paper & Engineering Ink)
- **Nền giấy kẻ ô caro**: Pattern lưới giấy vở học sinh (`linear-gradient` kẻ ô nhạt `#e5e7eb` trên nền `#fbfbfa`), mang lại cảm giác tập trung và quen thuộc của sổ tay ôn luyện.
- **Mực viết**: Màu mực xanh bút máy đậm (`#1e3a8a` / `#172554`), sắc nét và có độ tương phản WCAG AAA.
- **Bút dạ vàng (Con trỏ)**: Highlight vàng ấm mềm mại (`rgba(250, 204, 21, 0.45)`) cho ký tự đang gõ, tạo nhịp gõ mượt mà.
- **Bút đỏ chấm lỗi**: Đánh dấu đỏ cam nổi bật (`#dc2626`) khi gõ sai ký tự, con trỏ đứng yên ép sửa phản xạ.
- **Font chữ**: Kết hợp `JetBrains Mono` / `IBM Plex Mono` cho mã nguồn và phím bấm; font hệ thống tiếng Việt sạch sẽ (`Plus Jakarta Sans` / System Sans) cho các tiêu đề và ghi chú.

### Các luồng thao tác chính
```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALGO-TYPE CHUYÊN TIN                            │
│  [ Ôn hôm nay (3) ] [ Luyện gõ (35) ] [ Kho đề 20-25 ] [ Sổ lỗi ] [ Biến thể ] │
└────────────────────────────────────────────────────────────────────────┘
```
1. **Màn hình "Ôn hôm nay" (Daily Review)**:
   - Header hiển thị số mục cần ôn trong ngày.
   - 2 Tab chuyển đổi:
     - **Code đến hạn**: Danh sách các template đã đến hạn theo chu kỳ Leitner, bấm là vào phòng gõ ngay với chế độ "Nhớ" (ẩn code, phím Esc trợ giúp).
     - **Điều then chốt đến hạn**: Thẻ lật flashcard hiện câu hỏi / gợi ý bài toán; thí sinh tự nhẩm rồi bấm "Hiện đáp án", sau đó đánh giá "Đã nhớ" (lên hộp) hoặc "Chưa nhớ" (về hộp 0).
2. **Màn hình Kho đề cũ (Problems Bank)**:
   - Bộ lọc đa năng: Theo Lần thi (Lần 29-34 / Năm 2020-2025), theo Dạng kỹ thuật (Toán, DP, Đồ thị, Cây, Hình học, Xâu, v.v.), theo Trạng thái (`Chưa làm`, `Chỉ lấy subtask`, `Đã AC`, `Chưa hiểu đề`).
   - Thẻ bài thi hiển thị bảng subtask chi tiết (phần trăm điểm + giới hạn), ghi chú cá nhân, và các thuật toán liên quan được gắn thẻ liên kết 2 chiều.
3. **Màn hình Sổ lỗi (Mistake Log)**:
   - Nút bấm thêm nhanh lỗi gặp phải khi giải đề hoặc luyện tập.
   - Thống kê tỷ lệ lỗi thường gặp nhất trong tuần và toàn bộ thời gian.
4. **Màn hình Bài biến thể (Variants)**:
   - Chọn bài tập biến thể (ví dụ: "Dijkstra thêm trạng thái năng lượng", "Segment Tree lưu chỉ số min", "Mo hoán đổi cập nhật").
   - Xem code gốc mẫu -> Đọc yêu cầu biến thể -> Tự gõ code sửa đổi vào editor -> Bấm "Đối chiếu song song" để so từng dòng với đáp án chuẩn.

---

## 3. Kiến trúc kỹ thuật & Cấu trúc dữ liệu

### Sơ đồ kiến trúc mô-đun
```
┌───────────────────────────────────────────────────────────────┐
│                          index.html                           │
│     (Giao diện giấy kẻ ô, thanh điều hướng, container chính)    │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
┌──────────────┐        ┌──────────────┐         ┌──────────────┐
│  js/store.js │        │ js/engine.js │         │ js/views/    │
│  - migrate() │        │ - TypingCore │         │ - today.js   │
│  - db: v2    │        │ - Leitner    │         │ - practice.js│
│  - export/imp│        │ - DiffEngine │         │ - problems.js│
└───────┬──────┘        └──────────────┘         │ - mistakes.js│
        │                                        │ - variants.js│
        ▼                                        └──────────────┘
┌────────────────────────────────────────────────────────┐
│ data/                                                  │
│  - builtins.js  (35 template C++17 chuẩn có comment)  │
│  - problems.js  (24 bài đề thi OLP 2020-2025)          │
│  - variants.js  (Bộ bài tập biến thể kinh điển OLP)     │
└────────────────────────────────────────────────────────┘
```

### Cấu trúc dữ liệu `algotype-v2` (localStorage)
```typescript
interface AlgoTypeDB_V2 {
  version: 2;
  // Dữ liệu template thuật toán
  custom: Array<{ id: string; title: string; tag: string; code: string }>;
  stats: Record<string, { box: number; last: number; runs: number; bw: number; bt: number }>;
  hist: Array<{ d: string; id: string; mode: 'copy' | 'recall'; wpm: number; acc: number }>;
  
  // 1. Sổ điều then chốt
  notes: Array<{
    id: string;
    refType: 'algo' | 'problem';
    refId: string;
    text: string;
    box: number;
    last: number;
    createdAt: number;
  }>;

  // 2. Trạng thái và ghi chú kho đề
  problemStates: Record<string, {
    status: 'unsolved' | 'subtask_only' | 'ac' | 'not_understood';
    userNote: string;
    updatedAt: number;
  }>;

  // 3. Sổ lỗi thực chiến
  mistakes: Array<{
    id: string;
    date: string;
    refId?: string; // ID bài hoặc thuật toán liên quan
    category: 'read_wrong' | 'mod_missing' | 'overflow' | 'tle' | 'wrong_algo' | 'edge_case' | 'impl_bug' | 'not_understood';
    note: string;
    createdAt: number;
  }>;

  // Cấu hình người dùng
  set: {
    auto: boolean; // Tự indent sau Enter
    mode: 'copy' | 'recall';
    fs: number; // Cỡ chữ
    last: string;
    examDate?: string;
  };
}
```

### Quy trình di chuyển dữ liệu (Migration V1 -> V2)
1. Kiểm tra khóa `algotype-v2` trong localStorage.
2. Nếu chưa có, kiểm tra khóa `algotype-v1`:
   - Nếu có: Nạp dữ liệu cũ, tự động sao chép `custom`, `stats`, `hist`, `set`, khởi tạo mảng rỗng cho `notes`, `mistakes`, và nạp mặc định cho `problemStates`.
   - Lưu vào `algotype-v2` mà **không xóa** `algotype-v1` để đảm bảo an toàn tuyệt đối.
3. Cung cấp nút "Sao lưu JSON" ngay tại giao diện cài đặt để thí sinh có thể tải về máy bất kỳ lúc nào.

---

## 4. Kế hoạch triển khai Giai đoạn 1

1. **Chuẩn bị dữ liệu mẫu chuẩn (Static Data)**:
   - Soạn thảo `data/builtins.js`: 35 thuật toán C++17 phổ biến trong OLP Chuyên tin (Segment Tree, DSU, Fenwick, Dijkstra, Bellman-Ford, Floyd-Warshall, Tarjan SCC, Bridges, Dinic, Hopcroft-Karp, Convex Hull, KMP, Z-algo, Manacher, Matrix Exp, Sieve, nCr Lucas, Mo's algo, v.v.) với comment tiếng Anh ASCII ngắn gọn, không dấu.
   - Soạn thảo `data/problems.js`: 24 bài đề thi OLP Lần 29-34 (2020-2025) với đầy đủ subtask mẫu và tag kỹ thuật.
   - Soạn thảo `data/variants.js`: Các biến thể thuật toán kinh điển phục vụ luyện tập.
2. **Mô-đun lưu trữ & Di trú (Store & Migration)**:
   - Xây dựng `js/store.js` quản lý đọc/ghi localStorage `algotype-v2`, hàm migrate an toàn từ v1, hàm xuất/nhập JSON.
3. **Bộ máy gõ & Spaced Repetition (Typing Engine)**:
   - Kế thừa và chuẩn hóa `js/engine.js`: Xử lý gõ ký tự, con trỏ highlighter, nhảy Tab, tự động thụt lề, đếm WPM/Accuracy, tính toán Leitner 5 hộp.
4. **Màn hình Ôn hôm nay & Sổ điều then chốt**:
   - Giao diện 2 tab lọc ra các template code và các thẻ điều then chốt có ngày ôn <= ngày hiện tại.
   - Trình lật thẻ flashcard điều then chốt kèm đánh giá "Nhớ" / "Chưa nhớ".
5. **Màn hình Kho đề cũ & Sổ lỗi**:
   - Danh sách 24 bài đề, bộ lọc, xem chi tiết subtask, đổi trạng thái và ghi chú.
   - Form ghi nhận lỗi, bộ lọc danh mục và thống kê tuần.
6. **Màn hình Bài biến thể**:
   - Giao diện 2 cột: Đề bài + Code gốc mẫu bên trái, Khung gõ sửa bên phải, nút so sánh Side-by-side Diff.

Sau khi hoàn tất Giai đoạn 1, tôi sẽ dừng lại báo cáo để bạn kiểm thử thực tế trên máy tính trước khi chuyển sang Giai đoạn 2.
