// Tunable settings for the recommendation engine.
// Change a number here and the rankings change; no other code needs to be touched.

module.exports = {
  // Relative importance of each factor. They are re-normalised to sum to 1,
  // so you can write them as percentages, fractions or any ratio.
  weights: {
    interest: 0.35,
    personality: 0.25,
    budget: 0.2,
    occasion: 0.15,
    style: 0.05,
  },

  // For interests and personalities: matching this many of the user's picks
  // counts as a full match. Without this, someone who ticks 5 interests could
  // never get a high score, because no single product covers all 5.
  matchCap: 2,

  // Share of the interest/personality score that comes from the plain ratio
  // (matched / selected). The rest comes from the capped score above. This keeps
  // a product that matches 3 of 4 picks ahead of one that matches 2 of 4.
  ratioBlend: 0.3,

  // Budget fit falls linearly to 0 as a price moves outside the chosen range.
  // The value is how far away (as a fraction of the range edge) the score hits 0.
  // Going OVER budget is a real problem, so it is strict: 0.5 means 50 percent over.
  budgetToleranceOver: 0.5,
  // Coming in UNDER budget is usually fine (you save money), so it is gentler:
  // 0.75 means a price 75 percent below the range minimum scores 0 for budget.
  budgetToleranceUnder: 0.75,

  // A product priced far above the budget (budget score of 0) also has its final
  // score multiplied by this, because no amount of interest match makes a
  // far-too-expensive gift a good recommendation.
  farOverBudgetPenalty: 0.6,

  // A much cheaper product than the chosen range gets a small nudge down, so a
  // premium budget favours premium gifts when match quality is otherwise similar.
  farUnderBudgetPenalty: 0.85,

  // Credit for a product marked "Just Because" when the exact occasion is not listed.
  justBecauseCredit: 0.4,

  // Extra score when the product's tags include the chosen relationship
  // (for example "mother"). Acts as a tie-breaker between recipients.
  relationshipBonus: 0.05,

  // "100% match" is rarely believable, so displayed percentages stop here.
  maxMatchPercent: 99,

  // If fewer than minGoodResults products score at or above this threshold,
  // the response is flagged closestMatch and the UI says "closest matches".
  closestMatchThreshold: 0.45,
  minGoodResults: 5,

  // How many results to return.
  resultLimit: 12,
};
