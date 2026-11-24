// Rule-based, weighted-scoring recommendation engine.
//
// Pure functions only: no database, no Express. Give it products and answers,
// get ranked results back. That makes it easy to test and to explain.
//
//   score = sum(weight_i * component_i) / sum(weights in use)   (+ relationship bonus)
//
// Each component is a number from 0 to 1:
//   interest    how well the product covers the recipient's interests
//   personality how well it suits their personality traits
//   budget      1 inside the range, falling to 0 as the price moves away from it
//   occasion    1 for an exact occasion, partial credit for "Just Because"
//   style       1 if the product has the chosen gift style
// A component with no input from the user (for example no interests chosen) is
// left out and the remaining weights are rescaled, so it never drags a score down.

const defaultConfig = require('../config/recommendationWeights');
const { BUDGETS } = require('../config/constants');

// ---------- small helpers ----------

const uniq = (list) => [...new Set((list || []).filter(Boolean))];
const intersect = (selected, available) => {
  const set = new Set(available || []);
  return selected.filter((x) => set.has(x));
};
const round2 = (n) => Math.round(n * 100) / 100;

const normaliseWeights = (weights) => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (!(total > 0)) throw new Error('Recommendation weights must add up to more than 0');
  return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / total]));
};

const findBudget = (budget) => {
  if (!budget) return null;
  if (typeof budget === 'object') return budget;
  return BUDGETS.find((b) => b.id === budget) || null;
};

// Tags that count as "suited to this relationship".
const RELATIONSHIP_TAGS = {
  'Best Friend': ['best friend'],
  Partner: ['partner'],
  Mother: ['mother', 'parents'],
  Father: ['father', 'parents'],
  Sibling: ['sibling'],
  Colleague: ['colleague'],
  Teacher: ['teacher'],
  Other: [],
};

// ---------- scoring components (each returns 0..1, or null if not applicable) ----------

// Matching `matchCap` of the user's picks is a full match; the ratio adds fine ranking.
const coverageScore = (selected, matched, cfg) => {
  if (!selected.length) return null;
  const needed = Math.min(selected.length, cfg.matchCap);
  const capped = Math.min(1, matched.length / needed);
  const ratio = matched.length / selected.length;
  return (1 - cfg.ratioBlend) * capped + cfg.ratioBlend * ratio;
};

// Returns { score, fit } where fit is one of:
//   'within' | 'near-under' | 'near-over' | 'far-under' | 'far-over'
// Over budget is penalised strictly, under budget gently (see config).
const budgetScore = (price, budget, cfg) => {
  if (!budget) return null;

  if (budget.min > 0 && price < budget.min) {
    const distance = (budget.min - price) / budget.min;
    const score = Math.max(0, 1 - distance / cfg.budgetToleranceUnder);
    return { score, fit: score > 0 ? 'near-under' : 'far-under' };
  }
  if (budget.max != null && price > budget.max) {
    const distance = (price - budget.max) / budget.max;
    const score = Math.max(0, 1 - distance / cfg.budgetToleranceOver);
    return { score, fit: score > 0 ? 'near-over' : 'far-over' };
  }
  return { score: 1, fit: 'within' };
};

const occasionScore = (product, occasion, cfg) => {
  if (!occasion) return null;
  const list = product.occasions || [];
  if (list.includes(occasion)) return { score: 1, match: 'exact' };
  if (occasion !== 'Just Because' && list.includes('Just Because')) {
    return { score: cfg.justBecauseCredit, match: 'partial' };
  }
  return { score: 0, match: 'none' };
};

// ---------- explanation text ----------

const soft = (label) => label.toLowerCase().replace(/ and /g, ' & ');

const joinList = (items) => {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

const OCCASION_PHRASES = {
  Birthday: 'a birthday',
  Anniversary: 'an anniversary',
  Graduation: 'a graduation',
  "Valentine's Day": "Valentine's Day",
  Wedding: 'a wedding',
  Festival: 'the festive season',
  Appreciation: 'saying thank you',
  'Just Because': 'a just-because surprise',
};

const buildExplanation = (product, matchedOn, answers, budget) => {
  // Sentence 1: why it suits the person.
  let lead;
  const persList = joinList(matchedOn.personalities.map(soft));
  const intList = joinList(matchedOn.interests.map(soft));
  const side = matchedOn.personalities.length > 1 ? 'sides' : 'side';

  if (matchedOn.personalities.length && matchedOn.interests.length) {
    lead = `Speaks to their ${persList} ${side} and is perfect for someone who enjoys ${intList}.`;
  } else if (matchedOn.interests.length) {
    lead = `Perfect for someone who enjoys ${intList}.`;
  } else if (matchedOn.personalities.length) {
    lead = `Speaks to their ${persList} ${side}.`;
  } else {
    lead = product.whyGreatGift
      ? `One of the closest matches we have for your answers. ${product.whyGreatGift}`
      : 'One of the closest matches we have for your answers.';
  }

  // Sentence 2: how it fits the occasion, style, relationship and budget.
  const predicates = [];
  if (matchedOn.occasion === 'exact') {
    predicates.push(`is a thoughtful choice for ${OCCASION_PHRASES[answers.occasion] || answers.occasion.toLowerCase()}`);
  } else if (matchedOn.occasion === 'partial') {
    predicates.push('also works as an any-time surprise');
  }
  if (matchedOn.giftStyle) {
    predicates.push(`matches the ${soft(answers.giftStyle)} feel you wanted`);
  }
  if (budget) {
    const budgetText = {
      within: `fits your ${budget.label} budget`,
      'near-under': 'comes in a little under your budget',
      'near-over': 'sits just above your budget but is close enough to consider',
      'far-under': 'is well under your budget, so you could add a card or a small extra',
      'far-over': 'is priced above your budget',
    }[matchedOn.budget];
    if (budgetText) predicates.push(budgetText);
  }
  // Keep the sentence readable: only mention the relationship if there is room.
  if (matchedOn.relationship && predicates.length < 3) {
    predicates.push(`is a popular pick when gifting your ${answers.relationship.toLowerCase()}`);
  }

  return predicates.length ? `${lead} It ${joinList(predicates)}.` : lead;
};

// ---------- main entry point ----------

/**
 * @param {Array} products  plain product objects (lean documents)
 * @param {Object} answers  { relationship, occasion, personalities[], interests[], budget, giftStyle }
 * @param {Object} options  optional overrides of the config (for tests and demos)
 */
const recommend = (products, answers, options = {}) => {
  const cfg = { ...defaultConfig, ...options, weights: { ...defaultConfig.weights, ...(options.weights || {}) } };
  const weights = normaliseWeights(cfg.weights);

  const personalities = uniq(answers.personalities);
  const interests = uniq(answers.interests);
  const budget = findBudget(answers.budget);
  const relationshipTags = RELATIONSHIP_TAGS[answers.relationship] || [];

  const scored = products
    .filter((p) => p.stock > 0)
    .map((product) => {
      const matchedInterests = intersect(interests, product.interests);
      const matchedPersonalities = intersect(personalities, product.personalities);

      const components = {
        interest: coverageScore(interests, matchedInterests, cfg),
        personality: coverageScore(personalities, matchedPersonalities, cfg),
        budget: null,
        occasion: null,
        style: null,
      };

      const budgetResult = budgetScore(product.price, budget, cfg);
      if (budgetResult) components.budget = budgetResult.score;

      const occasionResult = occasionScore(product, answers.occasion, cfg);
      if (occasionResult) components.occasion = occasionResult.score;

      const styleMatch = Boolean(answers.giftStyle) && (product.giftStyles || []).includes(answers.giftStyle);
      if (answers.giftStyle) components.style = styleMatch ? 1 : 0;

      // Weighted sum over the components that apply, rescaled to 0..1.
      let weightUsed = 0;
      let weighted = 0;
      const breakdown = {};
      for (const [key, value] of Object.entries(components)) {
        if (value === null) continue;
        weightUsed += weights[key];
        weighted += weights[key] * value;
      }
      for (const [key, value] of Object.entries(components)) {
        breakdown[key] = value === null ? null : round2((weights[key] * value) / (weightUsed || 1));
      }
      const base = weightUsed > 0 ? weighted / weightUsed : 0;

      const relationshipMatch = relationshipTags.some((t) => (product.tags || []).includes(t));
      // rawScore is deliberately NOT capped at 1, so products that are tied at the
      // top still rank by how well they really fit (for example, exactly in budget).
      let rawScore = base + (relationshipMatch ? cfg.relationshipBonus : 0);
      if (budgetResult && budgetResult.fit === 'far-over') rawScore *= cfg.farOverBudgetPenalty;
      if (budgetResult && budgetResult.fit === 'far-under') rawScore *= cfg.farUnderBudgetPenalty;
      const score = Math.min(1, rawScore);

      const matchedOn = {
        interests: matchedInterests,
        personalities: matchedPersonalities,
        occasion: occasionResult ? occasionResult.match : null,
        budget: budgetResult ? budgetResult.fit : null,
        giftStyle: styleMatch,
        relationship: relationshipMatch,
      };

      return { product, score, rawScore, breakdown, matchedOn };
    });

  // Highest score first; ties broken by popularity, rating and name so results are stable.
  scored.sort(
    (a, b) =>
      b.rawScore - a.rawScore ||
      (b.product.popularity || 0) - (a.product.popularity || 0) ||
      (b.product.rating || 0) - (a.product.rating || 0) ||
      String(a.product.name).localeCompare(String(b.product.name))
  );

  const goodCount = scored.filter((s) => s.score >= cfg.closestMatchThreshold).length;
  const closestMatch = goodCount < cfg.minGoodResults;

  const results = scored.slice(0, cfg.resultLimit).map((s, index) => {
    const p = s.product;
    return {
      rank: index + 1,
      isBestMatch: index === 0,
      isCloseMatch: s.score < cfg.closestMatchThreshold,
      matchPercent: Math.min(cfg.maxMatchPercent, Math.round(s.score * 100)),
      score: round2(s.score),
      explanation: buildExplanation(p, s.matchedOn, answers, budget),
      matchedOn: s.matchedOn,
      breakdown: s.breakdown,
      product: {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        category: p.category,
        rating: p.rating,
        numReviews: p.numReviews,
        stock: p.stock,
      },
    };
  });

  return {
    closestMatch,
    totalConsidered: scored.length,
    criteria: {
      relationship: answers.relationship || null,
      occasion: answers.occasion || null,
      personalities,
      interests,
      budget: budget ? { id: budget.id, label: budget.label } : null,
      giftStyle: answers.giftStyle || null,
    },
    results,
  };
};

module.exports = { recommend, normaliseWeights };
