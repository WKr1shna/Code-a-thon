const axios = require('axios');
const prisma = require('../configs/db');

exports.generateSafetyInstructions = async ({ incidentId, incidentType, severity, language }) => {
  try {
    const prompt = `You are a disaster response expert. Given the following disaster incident:
    Type: ${incidentType}
    Severity: ${severity}
    Language: ${language}
    Provide exactly 3 short, actionable safety instructions for civilians in the area. Do not include any other text or introductions.`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 10000 // 10s timeout
      }
    );

    const content = response.data?.content?.[0]?.text;
    
    if (content) {
      await prisma.aiInstruction.create({
        data: {
          incidentId,
          language,
          content
        }
      });
      return content;
    }
  } catch (error) {
    console.error('[AI SERVICE ERROR]', error.response?.data || error.message);
    throw new Error('Failed to generate AI instructions');
  }
};

exports.analyzeSpam = async (title, description) => {
  try {
    const prompt = `You are an AI verification system for a disaster response platform. 
    Evaluate the following incident report for being a fake, spam, hoax, or prank.
    Title: "${title}"
    Description: "${description}"
    
    Return a single JSON object (nothing else) with a "spamProbability" field between 0.0 (completely genuine) and 1.0 (completely fake). Do not output markdown code blocks. Just output the raw JSON string.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return parsed.spamProbability || 0;
    }
    return 0;
  } catch (error) {
    console.error('[AI SPAM ANALYSIS ERROR]', error.response?.data || error.message);
    return 0; 
  }
};
