// Usage:  npm run test:recommend
// Runs the recommendation engine against the seed catalogue (no database needed),
// prints the top picks for several very different recipients, and checks that
// the results genuinely change with the answers.

const assert = require('assert');
const { recommend } = require('../services/recommendationService');
const seedProducts = require('../seed/products');

// Give seed products an _id and stock so they look like database documents.
const products = seedProducts.map((p) => ({ ...p, _id: p.slug }));

const profiles = [
  {
    title: 'Artistic best friend, birthday',
    answers: {
      relationship: 'Best Friend',
      occasion: 'Birthday',
      personalities: ['Artistic and Creative'],
      interests: ['Painting and Art', 'Stationery'],
      budget: '500-1000',
      giftStyle: 'Cute and Aesthetic',
    },
  },
  {
    title: 'Tech-loving colleague, appreciation',
    answers: {
      relationship: 'Colleague',
      occasion: 'Appreciation',
      personalities: ['Tech Enthusiast'],
      interests: ['Gaming', 'Music'],
      budget: '1000-2000',
      giftStyle: 'Practical and Useful',
    },
  },
  {
    title: 'Fitness-minded father, birthday',
    answers: {
      relationship: 'Father',
      occasion: 'Birthday',
      personalities: ['Fitness Enthusiast', 'Minimalist'],
      interests: ['Fitness', 'Fashion'],
      budget: '1000-2000',
      giftStyle: 'Practical and Useful',
    },
  },
  {
    title: 'Sentimental partner, anniversary, premium',
    answers: {
      relationship: 'Partner',
      occasion: 'Anniversary',
      personalities: ['Sentimental'],
      interests: ['Photography', 'Home Decor'],
      budget: '2000-5000',
      giftStyle: 'Luxurious and Premium',
    },
  },
  {
    title: 'Nature-loving mother, festival, handmade',
    answers: {
      relationship: 'Mother',
      occasion: 'Festival',
      personalities: ['Nature Lover', 'Sentimental'],
      interests: ['Home Decor', 'Cooking'],
      budget: '500-1000',
      giftStyle: 'Handmade and Thoughtful',
    },
  },
];

const TOP = 5;
const line = '-'.repeat(78);
const outputs = profiles.map((p) => ({ ...p, out: recommend(products, p.answers) }));

for (const { title, answers, out } of outputs) {
  console.log(`\n${line}\n${title}`);
  console.log(
    `  ${answers.relationship} | ${answers.occasion} | ${answers.personalities.join(', ')} | ` +
      `${answers.interests.join(', ')} | budget ${answers.budget} | ${answers.giftStyle}`
  );
  console.log(`  closestMatch flag: ${out.closestMatch}\n`);
  out.results.slice(0, TOP).forEach((r) => {
    console.log(`  #${r.rank} ${r.product.name}  Rs ${r.product.price}  ${r.matchPercent}% match`);
    console.log(`      ${r.explanation}`);
  });
}

// ---------------- Checks ----------------
console.log(`\n${line}\nChecks`);
let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

const topIds = (out, n = TOP) => out.results.slice(0, n).map((r) => r.product._id);
const overlap = (a, b) => a.filter((x) => b.includes(x)).length;

check('every profile returns results', () => {
  outputs.forEach(({ title, out }) => assert(out.results.length >= TOP, `${title}: too few results`));
});

check('top 5 lists differ between recipients (max 2 shared items per pair)', () => {
  for (let i = 0; i < outputs.length; i += 1) {
    for (let j = i + 1; j < outputs.length; j += 1) {
      const shared = overlap(topIds(outputs[i].out), topIds(outputs[j].out));
      assert(shared <= 2, `"${outputs[i].title}" and "${outputs[j].title}" share ${shared} of top ${TOP}`);
    }
  }
});

check('artistic friend: best match covers art or stationery', () => {
  const best = outputs[0].out.results[0];
  const hit = best.matchedOn.interests.some((i) => ['Painting and Art', 'Stationery'].includes(i));
  assert(hit, `best match was ${best.product.name}`);
});

check('tech colleague: best match covers gaming or music', () => {
  const best = outputs[1].out.results[0];
  const hit = best.matchedOn.interests.some((i) => ['Gaming', 'Music'].includes(i));
  assert(hit, `best match was ${best.product.name}`);
});

check('match percentages are descending, within 0..99 and tied to the score', () => {
  outputs.forEach(({ out }) => {
    out.results.forEach((r, i) => {
      assert(r.matchPercent >= 0 && r.matchPercent <= 99, `percent out of range: ${r.matchPercent}`);
      assert(r.matchPercent === Math.min(99, Math.round(r.score * 100)) || Math.abs(r.matchPercent - r.score * 100) <= 1);
      if (i > 0) assert(out.results[i - 1].score >= r.score, 'results not sorted by score');
    });
  });
});

check('top 5 for each profile are never priced far above the budget', () => {
  outputs.forEach(({ title, out }) => {
    out.results.slice(0, 5).forEach((r) => {
      assert(r.matchedOn.budget !== 'far-over', `${title}: ${r.product.name} is far above budget`);
    });
  });
});

check('changing only the budget changes the results', () => {
  const base = profiles[0].answers;
  const cheap = recommend(products, { ...base, budget: 'under-500' });
  const premium = recommend(products, { ...base, budget: '2000-5000' });
  assert.notDeepStrictEqual(topIds(cheap), topIds(premium));
  assert(cheap.results[0].product.price <= 700, 'cheap budget should surface a low-priced gift');
  assert(
    premium.results[0].product.price > cheap.results[0].product.price,
    'a bigger budget should surface a pricier top pick'
  );
});

check('a great interest match that is far over budget is marked down and flagged', () => {
  const tech = profiles[1].answers;
  const find = (out) => out.results.find((r) => r.product._id === 'wireless-earbuds');
  const fits = find(recommend(products, { ...tech, budget: '1000-2000' }, { resultLimit: 40 }));
  const tooPricey = find(recommend(products, { ...tech, budget: 'under-500' }, { resultLimit: 40 }));
  assert.strictEqual(tooPricey.matchedOn.budget, 'far-over');
  assert(tooPricey.matchPercent <= fits.matchPercent - 30, `${tooPricey.matchPercent}% vs ${fits.matchPercent}%`);
  assert(tooPricey.explanation.includes('above your budget'), 'explanation should be honest about the price');
});

check('no tech gift fits a tiny budget, so the response says "closest matches"', () => {
  const out = recommend(products, { ...profiles[1].answers, budget: 'under-500' });
  assert.strictEqual(out.closestMatch, true);
  assert(out.results[0].matchPercent < 60, 'confidence should be low when nothing fits');
});

check('changing only the interests changes the results', () => {
  const base = profiles[0].answers;
  const a = recommend(products, { ...base, interests: ['Painting and Art'] });
  const b = recommend(products, { ...base, interests: ['Gaming', 'Music'] });
  assert.notDeepStrictEqual(topIds(a), topIds(b));
});

check('changing only the relationship changes some ranking (tie-breaker works)', () => {
  const base = profiles[2].answers;
  const asFather = recommend(products, base);
  const asMother = recommend(products, { ...base, relationship: 'Mother' });
  const scoresFather = asFather.results.map((r) => r.score).join();
  const scoresMother = asMother.results.map((r) => r.score).join();
  assert.notStrictEqual(scoresFather, scoresMother);
});

check('multiple interests are all taken into account', () => {
  const out = recommend(products, {
    ...profiles[0].answers,
    interests: ['Painting and Art', 'Stationery', 'Photography', 'Travel'],
  });
  const best = out.results[0];
  assert(best.matchedOn.interests.length >= 2, `best match only covered ${best.matchedOn.interests.length}`);
});

check('unusual answers fall back to closest matches (flag is set)', () => {
  const out = recommend(products, {
    relationship: 'Teacher',
    occasion: 'Wedding',
    personalities: ['Foodie'],
    interests: ['Music'],
    budget: 'above-5000',
    giftStyle: 'Handmade and Thoughtful',
  });
  assert(out.results.length > 0, 'should still return alternatives');
  assert.strictEqual(out.closestMatch, true);
});

check('out-of-stock products are never recommended', () => {
  const stocked = products.map((p, i) => (i === 0 ? { ...p, stock: 0 } : p));
  const out = recommend(stocked, profiles[0].answers, { resultLimit: 100 });
  assert(!out.results.some((r) => r.product._id === products[0]._id));
});

check('weights are configurable and re-normalised', () => {
  const a = recommend(products, profiles[0].answers, { weights: { interest: 35, personality: 25, budget: 20, occasion: 15, style: 5 } });
  const b = recommend(products, profiles[0].answers);
  assert.deepStrictEqual(topIds(a), topIds(b), 'percent-style weights should equal fractional weights');
  const budgetHeavy = recommend(products, profiles[0].answers, { weights: { budget: 10 } });
  assert.notDeepStrictEqual(topIds(budgetHeavy), topIds(b));
});

check('missing optional answers do not crash the engine', () => {
  const out = recommend(products, { relationship: 'Other', personalities: [], interests: [] });
  assert(Array.isArray(out.results));
});

console.log(`\n${failed ? `${failed} check(s) FAILED` : 'All checks passed'}`);
process.exit(failed ? 1 : 0);
