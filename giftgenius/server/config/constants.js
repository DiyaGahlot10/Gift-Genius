// Single source of truth for the vocabulary shared by:
//  - the Product schema (enum validation)
//  - the seed data
//  - the gift-finder questionnaire and recommendation engine
// If a value changes here, products and questionnaire options stay in sync.

const CATEGORIES = [
  'Personalized Gifts',
  'Fashion and Accessories',
  'Books and Stationery',
  'Beauty and Self-Care',
  'Home Decor',
  'Tech Accessories',
  'Art and DIY Kits',
];

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Graduation',
  "Valentine's Day",
  'Wedding',
  'Festival',
  'Appreciation',
  'Just Because',
];

const PERSONALITIES = [
  'Artistic and Creative',
  'Bookworm',
  'Tech Enthusiast',
  'Minimalist',
  'Adventurous',
  'Fashion Lover',
  'Fitness Enthusiast',
  'Sentimental',
  'Nature Lover',
  'Foodie',
];

const INTERESTS = [
  'Reading',
  'Painting and Art',
  'Music',
  'Gaming',
  'Photography',
  'Fashion',
  'Travel',
  'Cooking',
  'Fitness',
  'Skincare',
  'Stationery',
  'Home Decor',
];

const GIFT_STYLES = [
  'Cute and Aesthetic',
  'Personalized and Emotional',
  'Practical and Useful',
  'Luxurious and Premium',
  'Fun and Unusual',
  'Handmade and Thoughtful',
];

const RELATIONSHIPS = [
  'Best Friend',
  'Partner',
  'Mother',
  'Father',
  'Sibling',
  'Colleague',
  'Teacher',
  'Other',
];

// Budget bands from the gift finder. max: null means "no upper limit".
const BUDGETS = [
  { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500-1000', label: '₹500–₹1,000', min: 500, max: 1000 },
  { id: '1000-2000', label: '₹1,000–₹2,000', min: 1000, max: 2000 },
  { id: '2000-5000', label: '₹2,000–₹5,000', min: 2000, max: 5000 },
  { id: 'above-5000', label: 'Above ₹5,000', min: 5000, max: null },
];

const ORDER_STATUSES =['Order Placed', 'Processing', 'Shipped', 'Delivered'];
const PAYMENT_METHODS = ['cod', 'demo-online'];
// pending: cash not yet collected | paid: cash collected on delivery | paid-demo: simulated online payment
const PAYMENT_STATUSES = ['pending', 'paid', 'paid-demo'];

module.exports = {
  CATEGORIES,
  OCCASIONS,
  PERSONALITIES,
  INTERESTS,
  GIFT_STYLES,
  RELATIONSHIPS,
  BUDGETS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
};
