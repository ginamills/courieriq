
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const deliveries = [
    { region: "Auckland", total: 4200, late: 210 },
    { region: "Wellington", total: 2800, late: 196 },
    { region: "Christchurch", total: 2400, late: 96 },
    { region: "Hamilton", total: 1500, late: 120 }
  ];

  const question = req.body?.question;

  if (typeof question !== "string" || !question.trim() ||
      question.length > 500) {
    return res.status(400).json({ error: "Please enter a valid question." });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are CourierIQ, a business intelligence assistant.
              Answer questions using only this fictional dataset:
              ${JSON.stringify(deliveries)}
              Calculate rates accurately.
              If the data cannot answer a question, say so.
              Keep responses clear, concise and helpful.
              Never claim this is real courier company data.`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", response.status, data.error?.message);
      return res.status(502).json({
        error: "AI service unavailable. Please try again."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("");

    return res.status(200).json({
      answer: answer || "I couldn't generate an answer."
    });
  } catch (error) {
    console.error("CourierIQ error:", error);
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
}
