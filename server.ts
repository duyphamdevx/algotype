import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to get GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function generateSmartAnalysis(algoTitle: string, userCode: string, targetCode: string) {
  const userLower = userCode.toLowerCase();
  const potentialBugs: string[] = [];

  // Check long long vs int
  if (targetCode.includes('long long') && !userCode.includes('long long') && !userLower.includes('int64')) {
    potentialBugs.push('Code mẫu sử dụng kiểu "long long" để tránh tràn số, nhưng code của bạn có thể đang dùng int thông thường.');
  }

  // Check modulo edge cases
  if (targetCode.includes('% MOD') || targetCode.includes('%MOD') || targetCode.includes('MOD1')) {
    if (!userCode.includes('%') && !userLower.includes('mod')) {
      potentialBugs.push('Thuật toán liên quan đến số học modulo nhưng chưa thấy phép tính lấy dư % MOD hoặc khai báo hằng số MOD.');
    }
    if (userCode.includes('-') && !userCode.includes('+ MOD') && !userCode.includes('+MOD')) {
      potentialBugs.push('Lưu ý khi trừ modulo: (A - B) % MOD có thể âm, cần cộng thêm MOD trước khi lấy dư: ((A - B) % MOD + MOD) % MOD.');
    }
  }

  // Check boundary condition on segment tree or binary search
  if (userLower.includes('query') && userLower.includes('update')) {
    if (!userCode.includes('ql') && !userCode.includes('qr') && !userCode.includes('l > r')) {
      potentialBugs.push('Kiểm tra kỹ điều kiện dừng truy vấn đoạn (đoạn con nằm ngoài khoảng hoặc hoàn toàn nằm trong khoảng).');
    }
  }

  // Check priority_queue in Dijkstra
  if ((algoTitle || '').toLowerCase().includes('dijkstra') || targetCode.includes('priority_queue')) {
    if (userCode.includes('priority_queue') && !userCode.includes('greater')) {
      potentialBugs.push('priority_queue trong C++ mặc định là Max-Heap. Trong Dijkstra cần dùng "greater<...>" để tạo Min-Heap lấy khoảng cách nhỏ nhất.');
    }
  }

  const userLines = userCode.trim().split('\n').filter(l => l.trim().length > 0);
  const targetLines = (targetCode || '').trim().split('\n').filter(l => l.trim().length > 0);
  const ratio = Math.min(1, userLines.length / Math.max(1, targetLines.length));
  const estimatedScore = Math.max(60, Math.min(98, Math.round(ratio * 95 - potentialBugs.length * 5)));

  let correctness = 'Đúng chuẩn';
  if (estimatedScore >= 85 && potentialBugs.length === 0) {
    correctness = 'Đúng chuẩn';
  } else if (estimatedScore >= 65) {
    correctness = 'Cơ bản đúng, có điểm cần lưu ý';
  } else {
    correctness = 'Chưa hoàn chỉnh hoặc cần bổ sung các hàm thành phần';
  }

  return {
    score: estimatedScore,
    summary: `Mã nguồn bạn tự gõ thể hiện hiểu biết tốt về cấu trúc của "${algoTitle || 'thuật toán'}". Các hàm chính đã được thiết lập đúng tư tưởng thuật toán.`,
    correctness,
    potentialBugs,
    advice: 'Hãy chú ý rà soát các trường hợp biên và kiểm tra kỹ kích thước mảng khai báo (ví dụ 4*MAXN cho Segment Tree) trước khi nộp bài.'
  };
}

// Simple AI Code Analysis API endpoint
app.post('/api/analyze-code', async (req, res) => {
  const { algoTitle, targetCode, userCode } = req.body;

  if (!userCode || typeof userCode !== 'string' || !userCode.trim()) {
    return res.status(400).json({ error: 'Mã nguồn do bạn gõ không được để trống.' });
  }

  try {
    const ai = getAIClient();
    if (!ai) {
      const fallbackAnalysis = generateSmartAnalysis(algoTitle, userCode, targetCode || '');
      return res.json({
        success: true,
        analysis: fallbackAnalysis,
        isFallback: true
      });
    }

    const prompt = `Bạn là chuyên gia huấn luyện đội tuyển Olympic Tin học Sinh viên và Chuyên tin C++.
Thí sinh vừa tự gõ mã nguồn một thuật toán mà không nhìn code mẫu để luyện phản xạ.
Hãy phân tích và nhận xét ngắn gọn, thực tế, đúng trọng tâm kỹ thuật thi đấu:

[TÊN THUẬT TOÁN]: ${algoTitle || 'Thuật toán C++'}

[CODE MẪU CHUẨN C++17]:
\`\`\`cpp
${targetCode || ''}
\`\`\`

[CODE DO THÍ SINH TỰ GÕ]:
\`\`\`cpp
${userCode}
\`\`\`

Yêu cầu phân tích:
1. Đánh giá tính đúng đắn logic của code thí sinh so với bản chất thuật toán (thí sinh có thể đặt tên biến khác hoặc code gọn hơn bản mẫu, miễn là đúng bản chất).
2. Phát hiện các lỗi tiềm ẩn nguy hiểm khi nộp bài thi (ví dụ: tràn số int/long long, thiếu modulo, chia cho 0, trường hợp biên r < l hoặc n <= 1, đệ quy tràn stack, chưa khởi tạo mảng).
3. Chấm điểm trên thang 100 (từ 0 đến 100).
4. Đưa ra 1 lời khuyên ngắn gọn, súc tích để khắc sâu phản xạ khi thi đấu.

Định dạng trả về: Chỉ trả về duy nhất một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json ở ngoài), theo đúng cấu trúc sau:
{
  "score": 95,
  "summary": "Tóm tắt ngắn gọn 1-2 câu về mức độ hoàn thành",
  "correctness": "Đúng chuẩn" | "Cơ bản đúng, có điểm cần lưu ý" | "Chưa đúng bản chất thuật toán",
  "potentialBugs": [
    "Lỗi hoặc lưu ý 1 (nếu có)",
    "Lỗi hoặc lưu ý 2 (nếu có)"
  ],
  "advice": "Lời khuyên thực chiến trong phòng thi"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean possible fences if any
      const cleaned = responseText.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      analysis: parsed
    });
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to built-in heuristic analysis:', error?.message);
    const fallbackAnalysis = generateSmartAnalysis(algoTitle, userCode, targetCode || '');
    return res.json({
      success: true,
      analysis: fallbackAnalysis,
      isFallback: true
    });
  }
});

function generateSmartQAEvaluation(question: string, referenceAnswer: string, userAnswer: string) {
  const userLower = (userAnswer || '').toLowerCase().trim();
  const refLower = (referenceAnswer || '').toLowerCase().trim();

  // Extract key terms from reference answer
  const words = refLower.split(/\s+/).filter(w => w.length > 3 && !['trong', 'không', 'những', 'được', 'người', 'thuật', 'toán', 'chúng', 'phần'].includes(w));
  let matched = 0;
  for (const w of words) {
    if (userLower.includes(w)) matched++;
  }

  const matchRatio = words.length > 0 ? matched / words.length : 0.5;
  const lengthRatio = Math.min(1, userLower.length / Math.max(25, refLower.length * 0.45));
  const estimatedScore = Math.min(100, Math.max(35, Math.round((matchRatio * 0.55 + lengthRatio * 0.45) * 92 + 10)));

  let assessment = 'Đúng bản chất';
  if (estimatedScore >= 85) assessment = 'Xuất sắc! Câu trả lời rất đầy đủ và chính xác';
  else if (estimatedScore >= 65) assessment = 'Cơ bản đúng ý chính, cần giải thích sâu hơn';
  else assessment = 'Chưa đầy đủ ý hoặc chưa đúng trọng tâm';

  return {
    score: estimatedScore,
    assessment,
    feedback: `Bạn đã nêu được các khía cạnh cốt lõi của câu hỏi. ${
      estimatedScore >= 80 ? 'Các lập luận về mặt thuật toán được trình bày sáng rõ.' : 'Nên bổ sung thêm điều kiện biên hoặc tính chất toán học nêu trong đáp án mẫu.'
    }`,
    advice: 'Hãy nhớ các từ khóa chính này để phản xạ trả lời nhanh và chính xác nhất trong phòng thi.'
  };
}

// AI Algorithm Approach & Problem Pattern Grading Endpoint
app.post('/api/grade-qa', async (req, res) => {
  const { question, referenceAnswer, userAnswer, algoTitle, scenario, patternTitle } = req.body;
  if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập phương án / câu trả lời của bạn trước khi chấm.' });
  }

  try {
    const ai = getAIClient();
    if (!ai) {
      const fallback = generateSmartQAEvaluation(question, referenceAnswer, userAnswer);
      return res.json({ success: true, evaluation: fallback, isFallback: true });
    }

    const prompt = `Bạn là huấn luyện viên trưởng Olympic Tin học Sinh viên và Chuyên tin C++.
Thí sinh vừa trình bày phương án giải hoặc cách biến đổi thuật toán cho một DẠNG BÀI THI ĐẤU cụ thể:

[THUẬT TOÁN CƠ SỞ]: ${algoTitle || 'Thuật toán C++'}
[TÊN DẠNG BÀI]: ${patternTitle || 'Dạng bài biến thể'}
[TÌNH HUỐNG / ĐỀ BÀI]: ${scenario || 'Bài toán thi đấu Olympic'}
[YÊU CẦU / CÂU HỎI]: ${question}
[CÁCH TIẾP CẬN & ĐÁP ÁN CHUẨN]: ${referenceAnswer}
[PHƯƠNG ÁN / BÀI LÀM CỦA THÍ SINH]: ${userAnswer}

Yêu cầu phân tích và chấm điểm (thang 100):
1. Đánh giá tính chính xác của ý tưởng: Thí sinh có nhận diện đúng bản chất bài toán không? Cách biến đổi cấu trúc dữ liệu / hàm đệ quy / trạng thái có đúng và tối ưu không?
2. Phân tích độ phức tạp thời gian và bộ nhớ theo cách làm của thí sinh (có nguy cơ TLE hoặc MLE không?).
3. Chỉ ra lỗi tiềm ẩn hoặc trường hợp biên dễ chết test (ví dụ: tràn số, chia 0, vòng lặp vô tận, cập nhật thiếu).
4. Đưa ra lời khuyên ngắn gọn để thí sinh hoàn thiện phản xạ giải dạng bài này trong phòng thi.

Chỉ trả về chuỗi JSON hợp lệ (không kèm markdown \`\`\`json ở ngoài):
{
  "score": 90,
  "assessment": "Xuất sắc! Ý tưởng chuẩn xác và tối ưu" | "Đúng hướng nhưng cần hoàn thiện chi tiết" | "Cách làm chưa tối ưu hoặc dễ TLE/MLE" | "Chưa đúng bản chất thuật toán",
  "feedback": "Nhận xét chi tiết về phương án của thí sinh (ý đúng, ý thiếu, độ phức tạp)",
  "advice": "Lời khuyên thi đấu từ huấn luyện viên"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({ success: true, evaluation: parsed });
  } catch (err: any) {
    console.warn('Gemini grade-qa failed, falling back to smart heuristic:', err?.message);
    const fallback = generateSmartQAEvaluation(question, referenceAnswer, userAnswer);
    return res.json({ success: true, evaluation: fallback, isFallback: true });
  }
});

// Endpoint: AI Automatically Generate a New Problem Pattern & Approach for an Algorithm
app.post('/api/generate-pattern', async (req, res) => {
  const { algoTitle, algoCode } = req.body;

  try {
    const ai = getAIClient();
    if (!ai) {
      // Fallback pattern generator
      const fallbackPattern = {
        title: `Dạng mở rộng: Ứng dụng nâng cao của ${algoTitle || 'thuật toán'}`,
        category: 'Biến thể nâng cao',
        difficulty: 'Nâng cao',
        problemScenario: `Cho bài toán với truy vấn động yêu cầu cập nhật liên tục và trích xuất thông tin tối ưu trên cấu trúc dữ liệu ${algoTitle || 'cơ sở'}.`,
        q: `Làm thế nào để mở rộng trạng thái hoặc cấu trúc của thuật toán ${algoTitle || ''} để giải quyết bài toán trên trong thời gian O(log N) hoặc O(N log N)?`,
        a: `Mở rộng cấu trúc Node hoặc thêm mảng phụ trợ lưu vết. Sử dụng hàm kết hợp (combine) tùy biến để duy trì tính chất bất biến của thuật toán.`,
        codeSnippet: `// Khung mã nguồn mở rộng cho ${algoTitle || 'thuật toán'}\n// Tùy biến hàm combine và cấu trúc node`,
        classicProblems: 'Codeforces Div.2 Problem D/E, CSES Advanced Section'
      };
      return res.json({ success: true, pattern: fallbackPattern, isFallback: true });
    }

    const prompt = `Bạn là chuyên gia ra đề và huấn luyện viên Olympic Tin học (ICPC, VNOI, HSG Quốc Gia).
Hãy sáng tạo 01 DẠNG BÀI THI ĐẤU KINH ĐIỂN MỚI (Problem Pattern) áp dụng hoặc biến đổi thuật toán sau:

[THUẬT TOÁN]: ${algoTitle || 'Thuật toán C++'}
[MÃ NGUỒN CƠ SỞ]:
\`\`\`cpp
${algoCode || ''}
\`\`\`

Yêu cầu tạo 1 dạng bài thực tế thường gặp trong các kỳ thi Codeforces / CSES / VNOI:
1. title: Tên dạng bài rõ ràng, ví dụ "Dạng: Tìm vị trí đầu tiên >= X trên đoạn [L, R]" hoặc "Dạng: Dijkstra kết hợp trạng thái bitmask đồ thị".
2. category: Một trong các thể loại ["Biến thể cấu trúc & Trạng thái", "Tìm kiếm & Tối ưu", "Quy hoạch động phối hợp", "Ứng dụng Đồ thị & Đa chiều"].
3. difficulty: "Cơ bản" | "Nâng cao" | "Olympic / ICPC".
4. problemScenario: Tình huống bài toán cụ thể, rõ ràng điều kiện đầu vào và yêu cầu đầu ra.
5. q: Câu hỏi kiểm tra tư duy: Cần biến đổi thuật toán cơ sở như thế nào (thay đổi node, mảng, hàm merge, thứ tự duyệt)? Cần cẩn thận điều gì?
6. a: Hướng dẫn giải chi tiết, phân tích bản chất toán học/thuật toán và độ phức tạp O(...).
7. codeSnippet: Khung mã nguồn C++17 mẫu (ngắn gọn, chuẩn chỉ, khoảng 20-35 dòng) thể hiện điểm then chốt của biến thể này.
8. classicProblems: Tên 1-2 bài tập kinh điển thực tế (ví dụ: "CSES - Hotel Queries", "Codeforces 438D").

Chỉ trả về duy nhất chuỗi JSON hợp lệ (không kèm markdown \`\`\`json ở ngoài):
{
  "title": "...",
  "category": "...",
  "difficulty": "Nâng cao",
  "problemScenario": "...",
  "q": "...",
  "a": "...",
  "codeSnippet": "...",
  "classicProblems": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({ success: true, pattern: parsed });
  } catch (err: any) {
    console.warn('Gemini generate-pattern failed, using fallback:', err?.message);
    const fallbackPattern = {
      title: `Dạng bài biến thể thực chiến của ${algoTitle || 'thuật toán'}`,
      category: 'Biến thể cấu trúc & Trạng thái',
      difficulty: 'Nâng cao',
      problemScenario: `Cho bài toán đòi hỏi mở rộng thao tác truy vấn và cập nhật trên cấu trúc ${algoTitle || ''} với số truy vấn Q lớn.`,
      q: `Hãy phân tích cách tùy biến cấu trúc dữ liệu và hàm xử lý để bài toán không bị TLE?`,
      a: `Thay đổi cấu trúc thông tin lưu tại mỗi phần tử, thiết kế hàm gộp (combine) có tính kết hợp và áp dụng cập nhật lười nếu cần thiết.`,
      codeSnippet: `// Khung mã nguồn biến thể C++17\n// Tối ưu hóa cho ${algoTitle || 'thuật toán'}`,
      classicProblems: 'CSES Problem Set, VNOI'
    };
    return res.json({ success: true, pattern: fallbackPattern, isFallback: true });
  }
});

// Setup dev server or static file serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlgoType server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
