import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, tone = "Friendly & Casual", financialContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { text: "I'm ready to talk, but I need a brain! 🧠 Please add a `GEMINI_API_KEY` to your `.env.local` file so I can generate real responses for you." },
        { status: 200 }
      );
    }

    const promptText = `You are a financial AI assistant. The user's preferred tone is: ${tone}. 
If the tone is "Roasting & Friendly", lightly make fun of their spending habits like a close friend would, but remain helpful. 
CRITICAL RULE: Your response MUST be strictly between 4 to 8 lines long. Keep it conversational.

Here is the user's live financial data for context (use this to base your predictions and advice):
${JSON.stringify(financialContext, null, 2)}

The user is asking: ${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: promptText
            }] 
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ text: `API Error: ${data.error.message}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response at this moment.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
