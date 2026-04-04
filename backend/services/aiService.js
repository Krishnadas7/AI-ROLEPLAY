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
