import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const generateInitialMessage = async (scenario) => {
  const systemPrompt = `You are Rahul Mehta, a telecom customer.

Context:
- Your phone was stolen this morning
- You need a SIM replacement urgently

Behavior:
- Ask questions about process, time, and documents
- Show slight frustration but stay polite
- Do NOT guide the store executive
- Respond naturally like a real customer

Please begin the roleplay by saying exactly "My mobile is stolen what will I do?". Keep your first message strictly related to this.`;

  const msg = await anthropic.messages.create({
    model: process.env.AI_MODEL,
    max_tokens: 250,
    system: systemPrompt,
    messages: [
      { role: "user", content: "Begin the roleplay." }
    ],
  });

  return msg.content[0].text;
};

export const generateNextMessage = async (scenario, claudeMessages) => {
  const systemPrompt = `You are Rahul Mehta, a telecom customer.

Context:
- Your phone was stolen this morning
- You need a SIM replacement urgently

Behavior:
- Ask questions about process, time, and documents
- Show slight frustration but stay polite
- Do NOT guide the store executive
- Respond naturally like a real customer`;

  const msg = await anthropic.messages.create({
    model: process.env.AI_MODEL,
    max_tokens: 350,
    system: systemPrompt,
    messages: claudeMessages,
  });

  return msg.content[0].text;
};

export const evaluateSession = async (scenario, messages) => {
  const systemPrompt = `You are an expert telecom customer service evaluator.
Review the conversation between a Customer and a Store Executive.
You must strictly evaluate the Executive's performance based on their actual words spoken. Do NOT assume intended meaning. Act like a telecom store interviewer evaluating professionalism, clarity, and customer handling.

CRITICAL SCORING RULES (overall score is 0-100):
1. NO ESCAPE RULE: You MUST always return a score. You are NOT allowed to skip scoring or say "I cannot evaluate".
2. ZERO SCORE RULE: If the executive gives empty input, silence, "I don't know", or irrelevant filler words, overallScore MUST be 0. Summary MUST say "No valid response provided".
3. IRRELEVANT ANSWER RULE: If the answer is completely unrelated to the customer's issue, overallScore MUST be 10-20. Feedback MUST clearly mention "The answer is not relevant to the question".
4. MINIMUM LENGTH RULE: If the answer is too short (less than 5 meaningful words), overallScore CANNOT exceed 30.
5. REPETITION RULE: If the executive repeats the same words/sentences, reduce overallScore by at least 20 points.
6. INCOMPLETE ANSWER RULE: If partially correct but missing key points, overallScore MUST be 40-60.
7. GUESSING/UNCLEAR RULE: If response is unclear, broken, or sounds like guessing, reduce score significantly.
8. PERFECT ANSWER RULE: Only give 90-100 if the answer is clear, fully relevant, covers all important points, and sounds confident and professional.

Evaluate based on these 4 criteria (each scored 0-100):
- Relevance (Adherence to customer's needs without irrelevant info)
- Clarity (Speech and explanation quality)
- Completeness (Covering all necessary protocol/process steps)
- Confidence (Professionalism and assured tone)

Your output MUST be a valid JSON object matching exactly this structure:
{
  "overallScore": 85,
  "criteria": {
    "relevance": 90,
    "clarity": 85,
    "completeness": 80,
    "confidence": 90
  },
  "feedback": {
    "relevance": "...",
    "clarity": "...",
    "completeness": "...",
    "confidence": "..."
  },
  "summary": "Overall evaluation summary..."
}
Do NOT include any markdown formatting, backticks, or extra text. Output ONLY the JSON object.`;

  const conversationText = messages.map(m => {
    const roleName = m.sender === 'user' ? 'Executive' : 'Customer';
    return `${roleName}: ${m.text}`;
  }).join('\n\n');

  const msg = await anthropic.messages.create({
    model: process.env.AI_MODEL || "claude-3-haiku-20240307",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Please evaluate this conversation:\n\n${conversationText}` }
    ],
  });

  try {
    return JSON.parse(msg.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Invalid AI JSON format");
  }
};
