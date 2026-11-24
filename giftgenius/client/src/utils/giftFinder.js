import {
  Users, Heart, Flower2, Coffee, Smile, Briefcase, GraduationCap, Gift,
  Cake, HeartHandshake, Award, Gem, Sparkles, Star,
  Palette, BookOpen, Laptop, Feather, Mountain, Shirt, Dumbbell, Leaf, Utensils,
  Music, Gamepad2, Camera, Plane, ChefHat, Droplets, PenTool, Home,
  IndianRupee, Crown, CheckCircle2, Scissors,
} from 'lucide-react';
import { storage } from './format.js';

// Values must match server/config/constants.js exactly (budget uses the server's budget ids).
export const STEPS = [
  {
    key: 'relationship',
    title: 'Who are you shopping for?',
    hint: 'This helps us pick gifts that suit the relationship.',
    multi: false,
    error: 'Please choose who you are shopping for.',
    options: [
      { value: 'Best Friend', icon: Users },
      { value: 'Partner', icon: Heart },
      { value: 'Mother', icon: Flower2 },
      { value: 'Father', icon: Coffee },
      { value: 'Sibling', icon: Smile },
      { value: 'Colleague', icon: Briefcase },
      { value: 'Teacher', icon: GraduationCap },
      { value: 'Other', icon: Gift },
    ],
  },
  {
    key: 'occasion',
    title: "What's the occasion?",
    hint: 'Different moments call for different gifts.',
    multi: false,
    error: 'Please choose an occasion.',
    options: [
      { value: 'Birthday', icon: Cake },
      { value: 'Anniversary', icon: HeartHandshake },
      { value: 'Graduation', icon: Award },
      { value: "Valentine's Day", icon: Heart },
      { value: 'Wedding', icon: Gem },
      { value: 'Festival', icon: Sparkles },
      { value: 'Appreciation', icon: Star },
      { value: 'Just Because', icon: Gift },
    ],
  },
  {
    key: 'personalities',
    title: "What's their personality?",
    hint: 'Choose all that fit.',
    multi: true,
    error: 'Please choose at least one personality trait.',
    options: [
      { value: 'Artistic and Creative', icon: Palette },
      { value: 'Bookworm', icon: BookOpen },
      { value: 'Tech Enthusiast', icon: Laptop },
      { value: 'Minimalist', icon: Feather },
      { value: 'Adventurous', icon: Mountain },
      { value: 'Fashion Lover', icon: Shirt },
      { value: 'Fitness Enthusiast', icon: Dumbbell },
      { value: 'Sentimental', icon: Heart },
      { value: 'Nature Lover', icon: Leaf },
      { value: 'Foodie', icon: Utensils },
    ],
  },
  {
    key: 'interests',
    title: 'What are their interests?',
    hint: 'Choose all that apply. The more you pick, the better we match.',
    multi: true,
    error: 'Please choose at least one interest.',
    options: [
      { value: 'Reading', icon: BookOpen },
      { value: 'Painting and Art', icon: Palette },
      { value: 'Music', icon: Music },
      { value: 'Gaming', icon: Gamepad2 },
      { value: 'Photography', icon: Camera },
      { value: 'Fashion', icon: Shirt },
      { value: 'Travel', icon: Plane },
      { value: 'Cooking', icon: ChefHat },
      { value: 'Fitness', icon: Dumbbell },
      { value: 'Skincare', icon: Droplets },
      { value: 'Stationery', icon: PenTool },
      { value: 'Home Decor', icon: Home },
    ],
  },
  {
    key: 'budget',
    title: "What's your budget?",
    hint: 'We will favour gifts that fit comfortably inside it.',
    multi: false,
    error: 'Please choose a budget.',
    options: [
      { value: 'under-500', label: 'Under ₹500', sub: 'Small and sweet', icon: IndianRupee },
      { value: '500-1000', label: '₹500 – ₹1,000', sub: 'The sweet spot', icon: IndianRupee },
      { value: '1000-2000', label: '₹1,000 – ₹2,000', sub: 'Thoughtful and special', icon: IndianRupee },
      { value: '2000-5000', label: '₹2,000 – ₹5,000', sub: 'Premium', icon: IndianRupee },
      { value: 'above-5000', label: 'Above ₹5,000', sub: 'A real splurge', icon: IndianRupee },
    ],
  },
  {
    key: 'giftStyle',
    title: 'What kind of gift would you prefer?',
    hint: 'How should the gift feel?',
    multi: false,
    error: 'Please choose a gift style.',
    options: [
      { value: 'Cute and Aesthetic', icon: Sparkles },
      { value: 'Personalized and Emotional', icon: Heart },
      { value: 'Practical and Useful', icon: CheckCircle2 },
      { value: 'Luxurious and Premium', icon: Crown },
      { value: 'Fun and Unusual', icon: Gift },
      { value: 'Handmade and Thoughtful', icon: Scissors },
    ],
  },
];

export const EMPTY_ANSWERS = {
  relationship: '',
  occasion: '',
  personalities: [],
  interests: [],
  budget: '',
  giftStyle: '',
};

const KEY = 'gg_finder';

export const isStepValid = (step, answers) =>
  step.multi ? answers[step.key].length > 0 : Boolean(answers[step.key]);

export const isComplete = (answers) => STEPS.every((s) => isStepValid(s, answers));

export const budgetLabel = (id) => STEPS[4].options.find((o) => o.value === id)?.label || id;

// Answers survive navigating back, refreshing and "edit answers" (sessionStorage).
export const loadFinder = () => {
  const saved = storage.get(window.sessionStorage, KEY, null);
  if (!saved) return { answers: { ...EMPTY_ANSWERS }, step: 0 };
  return {
    answers: { ...EMPTY_ANSWERS, ...saved.answers },
    step: Math.min(Math.max(saved.step || 0, 0), STEPS.length - 1),
  };
};

export const saveFinder = (answers, step) => storage.set(window.sessionStorage, KEY, { answers, step });
export const clearFinder = () => storage.remove(window.sessionStorage, KEY);
