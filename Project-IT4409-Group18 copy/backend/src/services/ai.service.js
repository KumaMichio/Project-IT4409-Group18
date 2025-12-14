const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

/**
 * Get AI response from Ollama
 */
async function getAIResponse(userId, userMessage, conversationHistory = []) {
  try {
    // Build messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: `Bạn là trợ lý AI tư vấn cho một nền tảng học tập trực tuyến. 
Hãy trả lời câu hỏi của học viên một cách thân thiện, chuyên nghiệp và hữu ích bằng tiếng Việt.
Bạn có thể tư vấn về:
- Khóa học và lộ trình học tập
- Cách sử dụng nền tảng
- Câu hỏi thường gặp
- Hướng dẫn học tập hiệu quả

Nếu không biết câu trả lời, hãy đề nghị học viên liên hệ với giảng viên.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false, // Set true nếu muốn streaming response
        options: {
          temperature: 0.7, // Độ sáng tạo (0-1)
          top_p: 0.9,
        }
      },
      {
        timeout: 30000 // 30 seconds timeout
      }
    );

    return response.data.message.content;
  } catch (error) {
    console.error('Ollama API error:', error.message);
    
    // Fallback response nếu Ollama không hoạt động
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Chatbot service đang tạm thời không khả dụng. Vui lòng thử lại sau.');
    }
    
    if (error.response) {
      console.error('Ollama response error:', error.response.data);
    }
    
    throw new Error('Không thể tạo phản hồi từ chatbot. Vui lòng thử lại.');
  }
}

/**
 * Check if Ollama is running
 */
async function checkOllamaHealth() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    });
    return { available: true, models: response.data.models || [] };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

module.exports = {
  getAIResponse,
  checkOllamaHealth,
};

