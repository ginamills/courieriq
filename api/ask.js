
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const question = req.body?.question;

  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > 500
  ) {
    return res.status(400).json({
      error: "Please enter a valid question."
    });
  }

  // Fictional demonstration dataset
  const deliveries = [
    { region: "Auckland", total: 4200, late: 210 },
    { region: "Wellington", total: 2800, late: 196 },
    { region: "Christchurch", total: 2400, late: 96 },
    { region: "Hamilton", total: 1500, late: 120 }
  ];

  // Calculate verified figures using JavaScript
  const calculated = deliveries.map(d => ({
    region: d.region,
    totalDeliveries: d.total,
    lateDeliveries: d.late,
    onTimeDeliveries: d.total - d.late,
    lateRatePercent: Number(
      (100 * d.late / d.total).toFixed(2)
    ),
    onTimeRatePercent: Number(
      (100 * (d.total - d.late) / d.total).toFixed(2)
    )
  }));

  const total = deliveries.reduce(
    (sum, d) => sum + d.total, 0
  );

  const late = deliveries.reduce(
    (sum, d) => sum + d.late, 0
  );

  const metrics = {
    totalDeliveries: total,
    lateDeliveries: late,
    onTimeDeliveries: total - late,
    overallLateRatePercent: Number(
      (100 * late / total).toFixed(2)
    ),
    overallOnTimeRatePercent: Number(
      (100 * (total - late) / total).toFixed(2)
    ),
    regions: calculated
  };

  // List of verified numerical values
  const knownNumbers = new Set([
    0, 1, 2, 3, 4, 100,
    total,
    late,
    total - late,
    metrics.overallLateRatePercent,
    metrics.overallOnTimeRatePercent,
    ...calculated.flatMap(d => [
      d.totalDeliveries,
      d.lateDeliveries,
      d.onTimeDeliveries,
      d.lateRatePercent,
      d.onTimeRatePercent
    ])
  ].map(n => Number(n).toFixed(2)));

  // Detect numbers not present in the dataset
  function hasUnverifiedNumber(answer) {
    const tokens = answer.match(
      /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b/g
    ) || [];

    return tokens.some(token => {
      const n = Number(token.replace(/,/g, ""));
      return !knownNumbers.has(n.toFixed(2));
    });
  }

  // Safe fallback if AI provides an unknown figure
  const verifiedSnapshot =
    "Verified demo figures: " +
    calculated.map(d =>
      `${d.region}: ` +
      `${d.totalDeliveries.toLocaleString("en-NZ")} deliveries, ` +
      `${d.lateDeliveries} late ` +
      `(${d.lateRatePercent}% late)`
    ).join("; ") + ".";

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
              text:
                "You are CourierIQ, a concise business intelligence assistant for an iPhone demonstration. " +
                "All figures are FICTIONAL demo data. " +
                "The following JSON is computed by JavaScript and is the single source of truth: " +
                JSON.stringify(metrics) +
                ". Use the supplied calculated percentages exactly; do NOT recompute rates or invent metrics, " +
                "time trends, causes, comparisons with previous periods, delivery locations, or operational facts. " +
                "When asked about trends, clarify that only a regional snapshot exists. " +
                "When asked for recommendations, clearly label them as suggestions, not proven causes. " +
                "Only mention numerical values appearing in the verified JSON; do not invent example numbers. " +
                "Always start with the direct correct answer. " +
                "Respond in plain text with short sentences and at most three bullets, " +
                "no Markdown bold, headings or tables. " +
                "If a question cannot be answered from the dataset, say what information is missing."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 450
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini error:",
        response.status,
        data.error?.message
      );

      return res.status(502).json({
        error: "AI service unavailable. Please try again."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("");

    if (!answer) {
      return res.status(200).json({
        answer: verifiedSnapshot
      });
    }

    // Reject responses containing unknown numbers
    if (hasUnverifiedNumber(answer)) {
      console.warn(
        "AI response contained an unverified numeric value."
      );

      return res.status(200).json({
        answer:
          "I couldn't verify all figures in the AI explanation, " +
          "so here's the checked data instead.\n\n" +
          verifiedSnapshot
      });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    console.error("CourierIQ error:", error);

    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
}
