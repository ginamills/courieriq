
/*
  CourierIQ
  AI-powered delivery operations intelligence

  All operational records are fictional demonstration data.
  The existing dashboard delivery KPIs are preserved.

  Gemini: gemini-3.5-flash-lite
*/

// =====================================================
// 1. DEMONSTRATION DATA
// =====================================================

const regions = [
  {
    region: "Auckland",
    deliveries: 4200,
    late: 210,
    couriersScheduled: 74,
    couriersAvailable: 69,
    dailyCapacity: 4500,
    depotBacklog: 145,
    averageSortDelayMinutes: 24,
    routesAtRisk: 7,
    failedDeliveryAttempts: 86,
    customerEnquiries: 118,
    weather: {
      condition: "Heavy rain",
      severity: "high",
      estimatedAffectedRoutes: 9
    },
    events: [
      {
        type: "Weather",
        severity: "high",
        description:
          "Heavy rain affecting exposed collection and delivery routes.",
        affectedRoutes: 9,
        status: "Active"
      },
      {
        type: "Traffic",
        severity: "medium",
        description:
          "Congestion affecting selected urban delivery corridors.",
        affectedRoutes: 6,
        status: "Active"
      },
      {
        type: "Depot",
        severity: "medium",
        description:
          "Inbound sorting backlog at the regional depot.",
        affectedRoutes: 4,
        status: "Under review"
      }
    ]
  },
  {
    region: "Wellington",
    deliveries: 2800,
    late: 196,
    couriersScheduled: 52,
    couriersAvailable: 47,
    dailyCapacity: 3000,
    depotBacklog: 180,
    averageSortDelayMinutes: 42,
    routesAtRisk: 11,
    failedDeliveryAttempts: 63,
    customerEnquiries: 104,
    weather: {
      condition: "Strong winds",
      severity: "high",
      estimatedAffectedRoutes: 8
    },
    events: [
      {
        type: "Weather",
        severity: "high",
        description:
          "Strong winds affecting exposed transport corridors.",
        affectedRoutes: 8,
        status: "Active"
      },
      {
        type: "Transport",
        severity: "high",
        description:
          "Inter-island freight connection experiencing disruption.",
        affectedRoutes: 5,
        status: "Active"
      },
      {
        type: "Depot",
        severity: "high",
        description:
          "Sorting delays and an elevated depot backlog.",
        affectedRoutes: 7,
        status: "Active"
      }
    ]
  },
  {
    region: "Christchurch",
    deliveries: 2400,
    late: 96,
    couriersScheduled: 45,
    couriersAvailable: 44,
    dailyCapacity: 2700,
    depotBacklog: 55,
    averageSortDelayMinutes: 12,
    routesAtRisk: 2,
    failedDeliveryAttempts: 38,
    customerEnquiries: 45,
    weather: {
      condition: "Clear",
      severity: "low",
      estimatedAffectedRoutes: 0
    },
    events: [
      {
        type: "Depot",
        severity: "low",
        description:
          "Minor sorting delays, with no major disruption recorded.",
        affectedRoutes: 2,
        status: "Monitoring"
      }
    ]
  },
  {
    region: "Hamilton",
    deliveries: 1500,
    late: 120,
    couriersScheduled: 30,
    couriersAvailable: 24,
    dailyCapacity: 1600,
    depotBacklog: 160,
    averageSortDelayMinutes: 48,
    routesAtRisk: 10,
    failedDeliveryAttempts: 47,
    customerEnquiries: 92,
    weather: {
      condition: "Heavy rain",
      severity: "high",
      estimatedAffectedRoutes: 7
    },
    events: [
      {
        type: "Workforce",
        severity: "high",
        description:
          "Courier availability below the scheduled staffing level.",
        affectedRoutes: 8,
        status: "Active"
      },
      {
        type: "Weather",
        severity: "high",
        description:
          "Heavy rain affecting several delivery routes.",
        affectedRoutes: 7,
        status: "Active"
      },
      {
        type: "Depot",
        severity: "high",
        description:
          "Elevated backlog and extended sorting times.",
        affectedRoutes: 6,
        status: "Active"
      },
      {
        type: "Fleet",
        severity: "medium",
        description:
          "Vehicle availability issue affecting route allocation.",
        affectedRoutes: 2,
        status: "Under review"
      }
    ]
  }
];

// =====================================================
// 2. CALCULATED BUSINESS METRICS
// =====================================================

function percent(numerator, denominator) {
  if (!denominator) return 0;

  return Number(
    ((numerator / denominator) * 100).toFixed(2)
  );
}

function sum(items, key) {
  return items.reduce(
    (total, item) => total + item[key],
    0
  );
}

function calculateRegion(region) {
  const onTime = region.deliveries - region.late;

  const staffShortfall =
    region.couriersScheduled -
    region.couriersAvailable;

  const staffAvailabilityPercent = percent(
    region.couriersAvailable,
    region.couriersScheduled
  );

  const capacityUtilisationPercent = percent(
    region.deliveries,
    region.dailyCapacity
  );

  const backlogPercent = percent(
    region.depotBacklog,
    region.deliveries
  );

  const highSeverityEvents = region.events.filter(
    event => event.severity === "high"
  ).length;

  // Transparent demonstration risk model.
  // These weights are illustrative, not calibrated
  // using historical operational outcomes.

  let riskScore = 0;

  riskScore += Math.min(
    40,
    percent(region.late, region.deliveries) * 4
  );

  riskScore += Math.min(
    20,
    (100 - staffAvailabilityPercent) * 0.8
  );

  riskScore += Math.min(
    15,
    backlogPercent * 1.5
  );

  riskScore += Math.min(
    15,
    highSeverityEvents * 5
  );

  riskScore += Math.min(
    10,
    region.routesAtRisk
  );

  riskScore = Math.round(
    Math.min(100, riskScore)
  );

  const riskLevel =
    riskScore >= 70 ? "High" :
    riskScore >= 40 ? "Elevated" :
    "Lower";

  return {
    ...region,

    onTime,
    lateRatePercent: percent(
      region.late,
      region.deliveries
    ),
    onTimeRatePercent: percent(
      onTime,
      region.deliveries
    ),

    staffShortfall,
    staffAvailabilityPercent,
    capacityUtilisationPercent,
    backlogPercent,

    highSeverityEvents,
    riskScore,
    riskLevel
  };
}

const calculatedRegions = regions.map(
  calculateRegion
);

const totalDeliveries = sum(
  calculatedRegions,
  "deliveries"
);

const totalLate = sum(
  calculatedRegions,
  "late"
);

const totalOnTime =
  totalDeliveries - totalLate;

const totalScheduledCouriers = sum(
  calculatedRegions,
  "couriersScheduled"
);

const totalAvailableCouriers = sum(
  calculatedRegions,
  "couriersAvailable"
);

const overall = {
  totalDeliveries,
  lateDeliveries: totalLate,
  onTimeDeliveries: totalOnTime,

  overallLateRatePercent: percent(
    totalLate,
    totalDeliveries
  ),

  overallOnTimeRatePercent: percent(
    totalOnTime,
    totalDeliveries
  ),

  scheduledCouriers: totalScheduledCouriers,
  availableCouriers: totalAvailableCouriers,

  courierShortfall:
    totalScheduledCouriers -
    totalAvailableCouriers,

  totalDepotBacklog: sum(
    calculatedRegions,
    "depotBacklog"
  ),

  totalRoutesAtRisk: sum(
    calculatedRegions,
    "routesAtRisk"
  ),

  totalFailedDeliveryAttempts: sum(
    calculatedRegions,
    "failedDeliveryAttempts"
  ),

  totalCustomerEnquiries: sum(
    calculatedRegions,
    "customerEnquiries"
  )
};

// =====================================================
// 3. OPERATIONAL RISK PRIORITIES
// =====================================================

const riskRanking = [...calculatedRegions]
  .sort((a, b) => b.riskScore - a.riskScore);

function buildRiskAssessment() {
  return riskRanking.map(region => {
    const factors = [];

    if (region.lateRatePercent >= 7) {
      factors.push(
        "Elevated late-delivery rate"
      );
    }

    if (region.staffShortfall >= 4) {
      factors.push(
        "Courier staffing shortfall"
      );
    }

    if (region.depotBacklog >= 150) {
      factors.push(
        "Elevated depot backlog"
      );
    }

    if (
      region.averageSortDelayMinutes >= 40
    ) {
      factors.push(
        "Extended sorting delays"
      );
    }

    if (
      region.weather.severity === "high"
    ) {
      factors.push(
        "Adverse weather"
      );
    }

    if (region.routesAtRisk >= 8) {
      factors.push(
        "Multiple routes at risk"
      );
    }

    return {
      region: region.region,
      riskLevel: region.riskLevel,
      riskScore: region.riskScore,
      lateRatePercent:
        region.lateRatePercent,
      contributingSignals: factors,
      activeEvents: region.events.filter(
        event => event.status === "Active"
      )
    };
  });
}

const businessData = {
  dataType:
    "Fictional regional operational snapshot",

  importantLimitations: [
    "Not live operational data",
    "No historical time series",
    "No individual parcel tracking",
    "No confirmed causal attribution",
    "No actual weather service integration",
    "No verified NZ Couriers policy database",
    "No current financial or hiring forecast"
  ],

  overall,
  regions: calculatedRegions,
  riskAssessment: buildRiskAssessment(),

  riskMethodology: {
    description:
      "Illustrative weighted operational risk score.",
    components: [
      "Late-delivery rate",
      "Courier availability",
      "Depot backlog",
      "High-severity events",
      "Routes at risk"
    ],
    caution:
      "Risk scores indicate prioritisation, not predicted probability of failure."
  }
};

// =====================================================
// 4. NUMERICAL ACCURACY SAFEGUARDS
// =====================================================

// Verified numerical values from the dataset.
// Include values from all computed metrics.

function collectNumbers(value, output = []) {
  if (typeof value === "number") {
    output.push(value);
  } else if (Array.isArray(value)) {
    value.forEach(item =>
      collectNumbers(item, output)
    );
  } else if (
    value &&
    typeof value === "object"
  ) {
    Object.values(value).forEach(item =>
      collectNumbers(item, output)
    );
  }

  return output;
}

const verifiedNumbers = new Set(
  [
    ...collectNumbers(businessData),
    0, 1, 2, 3, 4, 5, 10, 12, 100
  ].map(number =>
    Number(number).toFixed(2)
  )
);

function extractNumbers(text) {
  const matches = text.match(
    /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b/g
  ) || [];

  return matches.map(value =>
    Number(value.replace(/,/g, ""))
  );
}

function hasUnknownDatasetNumber(answer, question) {
  // Numbers in the user's question may be legitimate
  // hypothetical inputs rather than dataset facts.
  const questionNumbers = new Set(
    extractNumbers(question).map(number =>
      number.toFixed(2)
    )
  );

  return extractNumbers(answer).some(number => {
    const key = number.toFixed(2);

    return (
      !verifiedNumbers.has(key) &&
      !questionNumbers.has(key)
    );
  });
}

// =====================================================
// 5. GEMINI INSTRUCTIONS
// =====================================================

const systemPrompt = `
You are CourierIQ, an intelligent, friendly and
professional courier operations and business
intelligence assistant.

You are powered by Gemini.

YOUR ROLE

You support:
- Regional delivery performance analysis
- Operational risk identification
- Weather and disruption impact assessment
- Workforce and capacity planning
- Business intelligence investigations
- Scenario analysis and forecasting methods
- Courier operations questions
- General parcel and shipping questions

You are not limited to repeating the dataset.

DATA

The following JSON is the authoritative
demonstration dataset:

${JSON.stringify(businessData)}

IMPORTANT RULES

1. All operational records are fictional demo data.
   Do not describe them as live NZ Couriers records.

2. When analysing dataset metrics, use the exact
   supplied figures and calculated percentages.

3. Never invent observed delivery counts, staffing
   figures, weather events, depot incidents or
   historical trends.

4. You may discuss general industry knowledge,
   plausible explanations and hypothetical
   scenarios, but distinguish these from
   observed dataset facts.

5. Do not assume correlation proves causation.
   An event coinciding with delays is a possible
   contributor, not a confirmed root cause.

6. For "Identify risks", give a meaningful
   operational risk assessment. Consider weather,
   staffing, sorting, backlog, fleet, transport
   and regional performance. Prioritise the most
   important risks and suggest practical actions.

7. For "Why are deliveries late?", explain the
   relevant recorded warning signals and what
   should be investigated next. Do not just
   repeat the late-delivery percentages.

8. For hiring forecasts, explain the necessary
   inputs, assumptions and calculation method.
   Ask for missing information. Never invent
   a definitive headcount forecast.

9. For parcel-specific questions, explain that
   you have no live tracking integration.
   Ask a useful follow-up question when needed.
   Never claim to have checked a parcel.

10. For shipping restrictions, use general
    knowledge cautiously. Do not invent specific
    NZ Couriers rules or promise acceptance.

11. When information is incomplete, still help
    the user think through the problem.
    Explain what can be inferred, what cannot
    be established, and the next useful step.

12. Ask one relevant follow-up question when
    additional information would materially
    improve the answer.

13. For questions about "today", clarify that
    the dataset is a snapshot and does not
    establish current real-world conditions.

14. If the user asks about a hypothetical,
    you may reason using explicitly labelled
    assumptions and scenario values.

RESPONSE STYLE

- Start with the direct answer.
- Be analytical, helpful and conversational.
- Keep responses concise and mobile-friendly.
- Use short paragraphs.
- Use up to three bullets when useful.
- Prefer concrete insights over generic statements.
- Clearly distinguish findings, possible causes
  and recommendations.
- Do not produce tables.
- Avoid unnecessary disclaimers.
- Do not repeatedly use the word "simulated".
- Do not say "information is missing from the
  dataset" as your entire answer.
- If the user needs to supply information,
  end with one useful follow-up question.
`;

// =====================================================
// 6. QUESTION CLASSIFICATION
// =====================================================

// Classification is used for response validation.
// Gemini still performs the actual reasoning.

function isDatasetAnalysisQuestion(question) {
  const text = question.toLowerCase();

  const datasetTerms = [
    "kpi",
    "late rate",
    "on-time",
    "on time",
    "regional",
    "regions",
    "auckland",
    "wellington",
    "christchurch",
    "hamilton",
    "compare",
    "executive summary",
    "identify risks",
    "delivery risks",
    "operational risks",
    "depot backlog",
    "courier availability",
    "staffing shortfall",
    "deliveries",
    "risk score"
  ];

  return datasetTerms.some(term =>
    text.includes(term)
  );
}

// =====================================================
// 7. GEMINI REQUEST
// =====================================================

async function askGemini(question, extraInstruction = "") {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key":
          process.env.GEMINI_API_KEY
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text:
              systemPrompt + "\n" +
              extraInstruction
          }]
        },

        contents: [{
          role: "user",
          parts: [{
            text: question
          }]
        }],

        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700
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

    throw new Error(
      "AI service unavailable"
    );
  }

  return (
    data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim() || ""
  );
}

// =====================================================
// 8. FALLBACK RESPONSE
// =====================================================

function buildVerifiedFallback() {
  const lines = [
    "I couldn't verify every figure in the AI analysis. Here are the checked operational findings:",
    ""
  ];

  for (const region of riskRanking) {
    lines.push(
      `- ${region.region}: ` +
      `${region.lateRatePercent}% late, ` +
      `${region.riskLevel.toLowerCase()} risk, ` +
      `${region.depotBacklog} parcels in backlog.`
    );
  }

  lines.push("");
  lines.push(
    "Suggested next step: Review staffing, " +
    "depot delays and active operational events " +
    "in the highest-risk regions."
  );

  return lines.join("\n");
}

// =====================================================
// 9. SERVERLESS API HANDLER
// =====================================================

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

  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "Missing GEMINI_API_KEY"
    );

    return res.status(500).json({
      error: "AI configuration unavailable."
    });
  }

  try {
    let answer = await askGemini(
      question.trim()
    );

    if (!answer) {
      return res.status(200).json({
        answer:
          "I couldn't generate an answer. " +
          "Could you try rephrasing your question?"
      });
    }

    // Apply numeric checking to questions about
    // the actual demonstration dataset.
    //
    // General courier questions and hypotheticals
    // are not restricted to the dataset's numbers.

    const checkNumbers =
      isDatasetAnalysisQuestion(question);

    if (
      checkNumbers &&
      hasUnknownDatasetNumber(answer, question)
    ) {
      console.warn(
        "Unverified number detected. Retrying."
      );

      answer = await askGemini(
        question.trim(),
        `
        Your previous answer included a number
        not verified by the demonstration dataset.

        Recheck every numerical dataset claim.
        Use only exact values from the supplied
        JSON for observed operational metrics.

        Do not invent numerical facts.
        Answer the user's question directly.
        `
      );
    }

    if (
      checkNumbers &&
      hasUnknownDatasetNumber(answer, question)
    ) {
      return res.status(200).json({
        answer: buildVerifiedFallback()
      });
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error(
      "CourierIQ request failed:",
      error.message
    );

    return res.status(502).json({
      error:
        "The AI service is temporarily unavailable. " +
        "Please try again."
    });
  }
}
