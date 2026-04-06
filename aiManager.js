// AI平台管理模块 - 支持多个AI平台
const axios = require('axios');

class AIManager {
  constructor(config) {
    this.config = config;
    this.currentPlatform = config.ai?.defaultPlatform || 'openai';
    this.platforms = {
      openai: this.openaiHandler.bind(this),
      claude: this.claudeHandler.bind(this),
      gemini: this.geminiHandler.bind(this),
      ollama: this.ollamaHandler.bind(this),
      qwen: this.qwenHandler.bind(this), // 通义千问
      moonshot: this.moonshotHandler.bind(this), // 月之暗面
      zhipu: this.zhipuHandler.bind(this), // 智谱AI
      baichuan: this.baichuanHandler.bind(this), // 百川AI
      minimax: this.minimaxHandler.bind(this) // MiniMax
    };
  }

  // 设置当前AI平台
  setCurrentPlatform(platform) {
    if (this.platforms[platform]) {
      this.currentPlatform = platform;
      console.log(`[AI] 已切换到 ${platform} 平台`);
      return true;
    } else {
      console.error(`[AI] 不支持的AI平台: ${platform}`);
      return false;
    }
  }

  // 获取当前AI平台
  getCurrentPlatform() {
    return this.currentPlatform;
  }

  // 获取支持的平台列表
  getSupportedPlatforms() {
    return Object.keys(this.platforms);
  }

  // 主要的AI响应函数
  async getAIResponse(message, options = {}) {
    const platform = options.platform || this.currentPlatform;
    
    if (!this.platforms[platform]) {
      return `不支持的AI平台: ${platform}`;
    }

    // 检查平台配置是否存在
    if (!this.config.ai || !this.config.ai[platform]) {
      return `平台 ${platform} 未配置，请在config.json中设置相关参数。`;
    }

    try {
      return await this.platforms[platform](message, options);
    } catch (error) {
      console.error(`${platform.toUpperCase()} API调用失败:`, error.message);
      if (error.response) {
        console.error('API响应错误:', error.response.status, error.response.data);
      }
      return '抱歉，AI服务暂时无法响应，请稍后再试。';
    }
  }

  // OpenAI平台处理
  async openaiHandler(message, options = {}) {
    const aiConfig = this.config.ai.openai;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return 'OpenAI API密钥未配置，请在config.json中设置。';
    }

    const response = await axios.post(aiConfig.apiUrl || 'https://api.openai.com/v1/chat/completions', {
      model: aiConfig.model || 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('OpenAI API响应结构错误');
    }
  }

  // Claude (Anthropic) 平台处理
  async claudeHandler(message, options = {}) {
    const aiConfig = this.config.ai.claude;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return 'Claude API密钥未配置，请在config.json中设置。';
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: aiConfig.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || 1024,
      system: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。',
      messages: [
        { role: 'user', content: message }
      ],
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': aiConfig.apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    });

    if (response.data && response.data.content && response.data.content[0]) {
      return response.data.content[0].text;
    } else {
      throw new Error('Claude API响应结构错误');
    }
  }

  // Gemini (Google) 平台处理
  async geminiHandler(message, options = {}) {
    const aiConfig = this.config.ai.gemini;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return 'Gemini API密钥未配置，请在config.json中设置。';
    }

    const model = aiConfig.model || 'gemini-pro';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: message
        }]
      }],
      systemInstruction: {
        parts: [{
          text: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。'
        }]
      },
      generationConfig: {
        maxOutputTokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7
      }
    };

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.candidates && response.data.candidates[0].content.parts) {
      return response.data.candidates[0].content.parts.map(part => part.text).join('');
    } else {
      throw new Error('Gemini API响应结构错误');
    }
  }

  // Ollama 本地模型处理
  async ollamaHandler(message, options = {}) {
    const aiConfig = this.config.ai.ollama;
    
    const apiUrl = aiConfig.apiUrl || 'http://localhost:11434/api/chat';
    const model = aiConfig.model || 'llama2';

    const requestBody = {
      model: model,
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 150
      }
    };

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.message) {
      return response.data.message.content;
    } else {
      throw new Error('Ollama API响应结构错误');
    }
  }

  // 通义千问 (Alibaba Cloud) 平台处理
  async qwenHandler(message, options = {}) {
    const aiConfig = this.config.ai.qwen;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return '通义千问 API密钥未配置，请在config.json中设置。';
    }

    // 使用DashScope API
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: aiConfig.model || 'qwen-max',
      input: {
        messages: [
          { 
            role: 'system', 
            content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
          },
          { role: 'user', content: message }
        ]
      },
      parameters: {
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'X-DashScope-SSE': 'disable'
      },
      timeout: 30000
    });

    if (response.data && response.data.output && response.data.output.text) {
      return response.data.output.text;
    } else {
      throw new Error('通义千问 API响应结构错误');
    }
  }

  // 月之暗面 (Moonshot AI) 平台处理
  async moonshotHandler(message, options = {}) {
    const aiConfig = this.config.ai.moonshot;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return '月之暗面 API密钥未配置，请在config.json中设置。';
    }

    const response = await axios.post(aiConfig.apiUrl || 'https://api.moonshot.cn/v1/chat/completions', {
      model: aiConfig.model || 'moonshot-v1-8k',
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('月之暗面 API响应结构错误');
    }
  }

  // 智谱AI (Zhipu AI) 平台处理
  async zhipuHandler(message, options = {}) {
    const aiConfig = this.config.ai.zhipu;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return '智谱AI API密钥未配置，请在config.json中设置。';
    }

    // 分离API Key和Secret
    const [apiKey, apiSecret] = aiConfig.apiKey.split(':');
    if (!apiSecret) {
      return '智谱AI API密钥格式错误，应为 "api_key:api_secret" 格式';
    }

    // 对于智谱AI，我们使用标准格式
    const response = await axios.post(aiConfig.apiUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: aiConfig.model || 'glm-4',
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('智谱AI API响应结构错误');
    }
  }

  // 百川AI (Baichuan) 平台处理
  async baichuanHandler(message, options = {}) {
    const aiConfig = this.config.ai.baichuan;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return '百川AI API密钥未配置，请在config.json中设置。';
    }

    const response = await axios.post(aiConfig.apiUrl || 'https://api.baichuan-ai.com/v1/chat/completions', {
      model: aiConfig.model || 'Baichuan2-Turbo',
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('百川AI API响应结构错误');
    }
  }

  // MiniMax 平台处理
  async minimaxHandler(message, options = {}) {
    const aiConfig = this.config.ai.minimax;
    
    if (!aiConfig.apiKey || aiConfig.apiKey === 'your-api-key-here') {
      return 'MiniMax API密钥未配置，请在config.json中设置。';
    }

    const response = await axios.post(aiConfig.apiUrl || 'https://api.minimaxi.chat/v1/text/chatcompletion_pro', {
      model: aiConfig.model || 'abab5.5-chat',
      messages: [
        { 
          role: 'system', 
          content: options.systemPrompt || '你是一个Minecraft游戏中的AI助手，名叫Lzdqesj_BOT。你需要用简洁友好的语言回答玩家的问题。' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('MiniMax API响应结构错误');
    }
  }
}

module.exports = AIManager;