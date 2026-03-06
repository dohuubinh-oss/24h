import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash', // Sử dụng mô hình flash cho tốc độ
});

const generationConfig = {
  temperature: 0.2, // Giảm độ "sáng tạo" để kết quả nhất quán
  topP: 1,
  topK: 1,
  maxOutputTokens: 200,
  responseMimeType: 'application/json', // Yêu cầu Gemini trả về JSON
};

/**
 * Chấm điểm một câu trả lời tự luận bằng Gemini AI.
 * @param {string} question - Nội dung câu hỏi.
 * @param {string} studentAnswer - Câu trả lời của học sinh.
 * @param {string} modelAnswer - Đáp án mẫu (lời giải chi tiết).
 * @param {number} maxPoints - Thang điểm tối đa cho câu hỏi.
 * @returns {Promise<{score: number, feedback: string}>} - Điểm số và nhận xét từ AI.
 */
const gradeEssayByAI = async ({ question, studentAnswer, modelAnswer, maxPoints }) => {
  if (!studentAnswer || studentAnswer.trim() === '') {
    return { score: 0, feedback: 'Học sinh không trả lời.' };
  }

  const prompt = `
    Bạn là một trợ lý giáo viên AI. Nhiệm vụ của bạn là chấm điểm câu trả lời của học sinh cho một câu hỏi tự luận dựa trên đáp án mẫu và thang điểm được cung cấp.

    **Thông tin:**
    - **Câu hỏi:** ${question}
    - **Đáp án mẫu (hướng dẫn chấm):** ${modelAnswer}
    - **Câu trả lời của học sinh:** ${studentAnswer}
    - **Thang điểm tối đa:** ${maxPoints} điểm

    **Yêu cầu:**
    1. So sánh câu trả lời của học sinh với đáp án mẫu.
    2. Đánh giá mức độ chính xác, đầy đủ và hợp lý.
    3. Cho điểm từ 0 đến ${maxPoints}. Điểm phải là một con số.
    4. Cung cấp một nhận xét ngắn gọn (tối đa 20 từ) giải thích cho số điểm bạn cho.

    **Định dạng trả về:**
    Chỉ trả về một đối tượng JSON hợp lệ duy nhất có cấu trúc như sau:
    {
      "score": <số điểm>,
      "feedback": "<nhận xét ngắn gọn>"
    }

    Ví dụ:
    {
      "score": ${maxPoints * 0.8},
      "feedback": "Câu trả lời khá đầy đủ nhưng thiếu một vài ý nhỏ."
    }
  `;

  try {
    const parts = [{ text: prompt }];
    const result = await model.generateContent({ contents: [{ parts }] });
    const responseText = result.response.text();
    
    // Parse chuỗi JSON trả về từ AI
    const gradedResult = JSON.parse(responseText);
    
    // Đảm bảo điểm số không vượt quá thang điểm
    if (gradedResult.score > maxPoints) {
      gradedResult.score = maxPoints;
    }

    return gradedResult;

  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    // Trả về một kết quả mặc định trong trường hợp có lỗi
    return {
      score: 0,
      feedback: 'Không thể chấm điểm tự động do lỗi hệ thống AI.',
    };
  }
};

export { gradeEssayByAI };
