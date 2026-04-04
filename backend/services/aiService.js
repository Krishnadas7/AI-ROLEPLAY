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
Review the following conversation between a Customer and a Store Executive.
Provide a detailed score based on these 4 criteria: Protocol Adherence, Problem Solving, Empathy & Tone, Time Efficiency.
Your output MUST be a valid JSON object matching exactly this structure:
{
  "overallScore": 85,
  "criteria": {
    "protocolAdherence": 90,
    "problemSolving": 85,
    "empathyAndTone": 80,
    "timeEfficiency": 90
  },
  "feedback": {
    "protocolAdherence": "Verified ID perfectly.",
    "problemSolving": "Provided quick workaround.",
    "empathyAndTone": "Slightly robotic initially.",
    "timeEfficiency": "Handled within 2 mins."
  },
  "summary": "Overall good job..."
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
