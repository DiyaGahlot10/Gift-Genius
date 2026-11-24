import {
  Cake,
  HeartHandshake,
  GraduationCap,
  Heart,
  Gem,
  Sparkles,
  Star,
  Gift,
  PenTool,
  Shirt,
  BookOpen,
  Flower2,
  Home,
  Headphones,
  Palette,
} from 'lucide-react';

// `value` must match the server vocabulary (server/config/constants.js).
export const OCCASIONS = [
  { value: 'Birthday', label: 'Birthday', icon: Cake, tint: 'bg-blush-100 text-blush-400', featured: true,
    blurb: 'Make their day unforgettable with something chosen just for them.' },
  { value: 'Anniversary', label: 'Anniversary', icon: HeartHandshake, tint: 'bg-lavender-100 text-lavender-600', featured: true,
    blurb: 'Celebrate the years together with a gift that tells your story.' },
  { value: 'Graduation', label: 'Graduation', icon: GraduationCap, tint: 'bg-lavender-100 text-lavender-600', featured: true,
    blurb: 'Mark a big milestone with something they will keep for years.' },
  { value: "Valentine's Day", label: "Valentine's Day", icon: Heart, tint: 'bg-blush-100 text-blush-400', featured: true,
    blurb: 'Romantic, thoughtful and a little bit playful.' },
  { value: 'Festival', label: 'Festivals', icon: Sparkles, tint: 'bg-lavender-100 text-lavender-600', featured: true,
    blurb: 'Diwali, Raksha Bandhan and every celebration in between.' },
  { value: 'Just Because', label: 'Just Because', icon: Gift, tint: 'bg-blush-100 text-blush-400', featured: true,
    blurb: 'No reason needed. The best surprises are unexpected.' },
  { value: 'Wedding', label: 'Wedding', icon: Gem, tint: 'bg-lavender-100 text-lavender-600',
    blurb: 'Gifts for the couple that start their new home beautifully.' },
  { value: 'Appreciation', label: 'Appreciation', icon: Star, tint: 'bg-blush-100 text-blush-400',
    blurb: 'Say thank you to a teacher, mentor or colleague.' },
];

export const CATEGORIES = [
  { value: 'Personalized Gifts', icon: PenTool, blurb: 'Made with their name or photo' },
  { value: 'Fashion and Accessories', icon: Shirt, blurb: 'Wearable and giftable' },
  { value: 'Books and Stationery', icon: BookOpen, blurb: 'For readers and planners' },
  { value: 'Beauty and Self-Care', icon: Flower2, blurb: 'Pamper them a little' },
  { value: 'Home Decor', icon: Home, blurb: 'Make a space feel theirs' },
  { value: 'Tech Accessories', icon: Headphones, blurb: 'Smart, useful upgrades' },
  { value: 'Art and DIY Kits', icon: Palette, blurb: 'Hands-on and creative' },
];

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export const PRICE_FILTERS = [
  { id: 'any', label: 'Any price' },
  { id: 'u500', label: 'Under ₹500', max: 500 },
  { id: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { id: '1000-2000', label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { id: '2000+', label: '₹2,000 and above', min: 2000 },
];

export const ORDER_STATUSES = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

export const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  'demo-online': 'Online payment (demo)',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pay on delivery',
  paid: 'Paid',
  'paid-demo': 'Paid (demo, no real money)',
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
