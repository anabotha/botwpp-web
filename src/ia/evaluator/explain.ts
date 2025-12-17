export async function explainDecisionWithAI(input: {
     score: number;
     context: any;
     marketSnapshot: any;
}) {
     // TODO: Implement actual AI generation.
     // For now, return a heuristic explanation based on the score and context.

     const reason = input.score > 0.8 ? "High confidence detected" : "Moderate confidence";
     const contextSummary = Array.isArray(input.context)
          ? input.context.map((c: any) => c.metadata?.sentiment).join(", ")
          : "No context";

     return `Decision Explanation: ${reason}. Market is showing ${input.marketSnapshot?.trend || "activity"}. Context sentiment: ${contextSummary}.`;
}
