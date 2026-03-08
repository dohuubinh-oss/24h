import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Cấu hình an toàn chung - chặn các nội dung không phù hợp ở mức độ vừa và cao
const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

/**
 * Nhận dạng văn bản (chữ viết tay và chữ in) từ hình ảnh bằng Gemini Vision.
 * @param {Buffer} imageBuffer - Buffer của file ảnh.
 * @param {string} mimeType - Loại MIME của ảnh (ví dụ: 'image/jpeg', 'image/png').
 * @returns {Promise<string>} - Văn bản đã được nhận dạng.
 */
export const getTextFromImage = async (imageBuffer, mimeType) => {
  const visionModel = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const imageBase64 = imageBuffer.toString('base64');

  const prompt = "Hãy trích xuất chính xác toàn bộ văn bản từ hình ảnh được cung cấp. Giữ nguyên các định dạng, ký hiệu toán học và cấu trúc gốc. Chỉ trả về duy nhất phần văn bản đã nhận dạng, không thêm bất kỳ lời dẫn hay giải thích nào.";

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  try {
    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response;
    
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts.length > 0) {
        return response.candidates[0].content.parts[0].text;
    } else {
        return ""; 
    }
  } catch (error) {
    console.error("Lỗi khi gọi API Gemini Vision:", error);
    throw new Error("Lỗi kết nối đến dịch vụ nhận dạng của Google.");
  }
};


// --- CÁC HÀM XỬ LÝ VĂN BẢN (Text-only) ---

/**
 * Chấm điểm một câu trả lời tự luận bằng Gemini AI.
 * @param {string} question - Nội dung câu hỏi.
 * @param {string} studentAnswer - Câu trả lời của học sinh.
 * @param {string} modelAnswer - Đáp án mẫu (lời giải chi tiết).
 * @param {number} maxPoints - Thang điểm tối đa cho câu hỏi.
 * @returns {Promise<{score: number, feedback: string}>} - Điểm số và nhận xét từ AI.
 */
export const gradeEssayByAI = async ({ question, studentAnswer, modelAnswer, maxPoints }) => {
  if (!studentAnswer || studentAnswer.trim() === '') {
    return { score: 0, feedback: 'Học sinh không trả lời.' };
  }

  const textModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings,
    generationConfig: {
      responseMimeType: 'application/json', // Yêu cầu trả về JSON
    }
  });

  const prompt = `
    Bạn là một trợ lý giáo dục AI chuyên nghiệp, nhiệm vụ của bạn là chấm điểm và đưa ra nhận xét cho bài làm của học sinh một cách khách quan dựa trên đáp án mẫu.

    **BỐI CẢNH:**
    - **Đề bài:** ${question}
    - **Đáp án mẫu (lời giải chi tiết):** ${modelAnswer}
    - **Bài làm của học sinh:** ${studentAnswer}
    - **Thang điểm tối đa:** ${maxPoints}

    **YÊU CẦU:**
    1.  **Phân tích & So sánh:** So sánh từng bước, từng luận điểm trong bài làm của học sinh với đáp án mẫu.
    2.  **Chấm điểm:** Dựa trên sự so sánh, hãy cho một điểm số hợp lý trong khoảng từ 0 đến ${maxPoints}. Điểm số phải là một con số (integer hoặc float).
    3.  **Viết nhận xét:** Đưa ra nhận xét chi tiết, mang tính xây dựng. Chỉ ra những điểm làm đúng, những điểm sai hoặc thiếu sót. Nếu học sinh làm sai, hãy giải thích tại sao họ sai và hướng dẫn họ cách làm đúng dựa trên đáp án mẫu. Nhận xét cần được viết bằng Markdown để dễ đọc.

    **ĐỊNH DẠNG ĐẦU RA:**
    Chỉ trả về một đối tượng JSON duy nhất có cấu trúc như sau:
    {
      "score": <điểm số là một con số>,
      "feedback": "<nhận xét chi tiết bằng Markdown>"
    }
    Tuyệt đối không trả về bất cứ thứ gì khác ngoài đối tượng JSON này.
  `;

  try {
    const result = await textModel.generateContent(prompt);
    const responseText = result.response.text();
    const parsedResult = JSON.parse(responseText);

    // Đảm bảo điểm số không vượt quá thang điểm
    if (parsedResult.score > maxPoints) {
        parsedResult.score = maxPoints;
    }
    if (parsedResult.score < 0) {
        parsedResult.score = 0;
    }

    return parsedResult;

  } catch (error) {
    console.error("Lỗi khi chấm điểm bằng AI:", error);
    return {
      score: 0,
      feedback: "Đã có lỗi xảy ra trong quá trình chấm điểm tự động. Vui lòng thử lại sau."
    };
  }
};
