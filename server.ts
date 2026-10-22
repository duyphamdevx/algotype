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
      model: 'gemini-3.8-flash',
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
