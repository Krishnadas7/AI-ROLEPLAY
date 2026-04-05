import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const generateInitialMessage = async (scenario) => {
  const firstMessageText = scenario.title.includes("Network")
    ? "My network is very bad, calls are dropping."
    : "My mobile is stolen what will I do?";

  const systemPrompt = `You are ${scenario.aiPersona?.name || 'a customer'}, a telecom customer.

Context:
- ${scenario.description}

Behavior:
- Ask questions about process and resolution
- Show ${scenario.aiPersona?.tone || 'slight frustration'}
- Do NOT guide the store executive
- Respond naturally like a real customer
- IMPORTANT: ONLY output the spoken words. Do NOT include any stage directions, asterisks, brackets, or tone descriptions (e.g. *speaks in a concerned tone*).

Please begin the roleplay by saying exactly "${firstMessageText}". Keep your first message strictly related to this.`;

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
  const systemPrompt = `You are ${scenario.aiPersona?.name || 'a customer'}, a telecom customer.

Context:
- ${scenario.description}

Behavior:
- Ask questions about process and resolution
- Show ${scenario.aiPersona?.tone || 'slight frustration'}
- Do NOT guide the store executive
- Respond naturally like a real customer
- IMPORTANT: ONLY output the spoken words. Do NOT include any stage directions, asterisks, brackets, or tone descriptions (e.g. *speaks in a concerned tone*).`;

  const msg = await anthropic.messages.create({
    model: process.env.AI_MODEL,
    max_tokens: 350,
    system: systemPrompt,
    messages: claudeMessages,
  });

  return msg.content[0].text;
};

export const evaluateSession = async (scenario, messages) => {
  // Separate executive messages so evaluator cannot confuse AI customer's knowledge
  // with the executive's actual responses
  const executiveMessages = messages
    .filter(m => m.sender === 'user')
    .map((m, i) => `Executive Reply ${i + 1}: "${m.text}"`)
    .join('\n');

  const customerMessages = messages
    .filter(m => m.sender === 'ai')
    .map((m, i) => `Customer Message ${i + 1}: "${m.text}"`)
    .join('\n');

  const systemPrompt = `You are a strict telecom training evaluator. Output ONLY valid JSON — no preamble, no markdown, no explanation. Start with { and end with }.

You are evaluating a STORE EXECUTIVE's performance during a customer service roleplay.

IMPORTANT: You must ONLY evaluate what the EXECUTIVE said. Do NOT give credit for information mentioned by the Customer. The Customer's messages are provided only for context.

CUSTOMER MESSAGES (context only — do NOT score these):
${customerMessages || '(none)'}

EXECUTIVE MESSAGES (score ONLY these):
${executiveMessages || '(none — executive gave no response)'}

STRICT SCORING RULES — violations are non-negotiable:
1. If the executive said NOTHING or gave only filler words ("hi", "hello", "ok", "hmm") → overallScore MUST be 0-5
2. If the executive's reply is completely unrelated to the customer's issue → overallScore MUST be 5-15
3. If the executive reply is less than 10 meaningful words → overallScore CANNOT exceed 25
4. If the executive repeated the customer's words back without adding value → overallScore CANNOT exceed 20
5. If partially helpful but missing key steps/protocol → overallScore 40-60
6. If mostly correct but not fully professional or complete → overallScore 60-75
7. ONLY give 85-100 if the executive clearly identified the issue, explained steps correctly, and spoke professionally

You are STRICT. You do NOT assume the executive knows something just because the customer mentioned it.

Output EXACTLY this JSON (no other text):
{"overallScore":0,"criteria":{"relevance":0,"clarity":0,"completeness":0,"confidence":0},"feedback":{"relevance":"...","clarity":"...","completeness":"...","confidence":"..."},"summary":"..."}`;

  const msg = await anthropic.messages.create({
    model: process.env.AI_MODEL || "claude-3-haiku-20240307",
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      { role: "user", content: "Evaluate the executive's performance now." }
    ],
  });

  const raw = msg.content[0].text;
  console.log('=== AI EVALUATION RAW RESULT ===');
  console.log(raw);
  console.log('================================');

  // Robust JSON extractor — handles preamble text, markdown fences, etc.
  const extractJSON = (text) => {
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try { return JSON.parse(cleaned); } catch (_) {}
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) {}
    }
    console.error('[Evaluation] Could not parse AI response as JSON, using fallback score');
    return {
      overallScore: 0,
      criteria: { relevance: 0, clarity: 0, completeness: 0, confidence: 0 },
      feedback: {
        relevance: 'Evaluation could not be completed.',
        clarity: 'Evaluation could not be completed.',
        completeness: 'Evaluation could not be completed.',
        confidence: 'Evaluation could not be completed.',
      },
      summary: 'The AI evaluator returned an unexpected format. Please retry the session.'
    };
  };

  return extractJSON(raw);
};
