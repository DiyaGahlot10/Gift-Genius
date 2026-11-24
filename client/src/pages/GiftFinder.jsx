import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import {
  EMPTY_ANSWERS,
  STEPS,
  clearFinder,
  isComplete,
  isStepValid,
  loadFinder,
  saveFinder,
} from '../utils/giftFinder.js';
import usePageTitle from '../hooks/usePageTitle.js';

function OptionCard({ option, selected, multi, onClick }) {
  const Icon = option.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 p-5 text-center transition ${
        selected
          ? 'border-plum-600 bg-lavender-50 shadow-lift'
          : 'border-transparent bg-white shadow-soft hover:-translate-y-0.5 hover:border-lavender-300'
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-plum-600 text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
          selected ? 'bg-plum-600 text-white' : 'bg-lavender-100 text-lavender-600'
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-semibold leading-tight text-plum-700">{option.label || option.value}</span>
      {option.sub && <span className="-mt-1 text-xs text-ink/60">{option.sub}</span>}
    </motion.button>
  );
}

export default function GiftFinder() {
  usePageTitle('Find the perfect gift');
  const navigate = useNavigate();
  const [{ answers, step }, setState] = useState(loadFinder);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState('');

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  // Keep answers and position safe across refreshes.
  useEffect(() => saveFinder(answers, step), [answers, step]);

  const choose = (value) => {
    setError('');
    setState((s) => {
      const key = current.key;
      if (current.multi) {
        const list = s.answers[key];
        const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
        return { ...s, answers: { ...s.answers, [key]: next } };
      }
      return { ...s, answers: { ...s.answers, [key]: value } };
    });
  };

  const goTo = (n) => {
    setDirection(n > step ? 1 : -1);
    setError('');
    setState((s) => ({ ...s, step: n }));
  };

  const next = () => {
    if (!isStepValid(current, answers)) {
      setError(current.error);
      return;
    }
    if (!isLast) return goTo(step + 1);
    if (!isComplete(answers)) {
      setError('Some answers are missing. Please go back and complete every step.');
      return;
    }
    // Results page asks the server for recommendations using these saved answers.
    saveFinder(answers, 0);
    navigate('/find-a-gift/results');
  };

  const startOver = () => {
    clearFinder();
    setDirection(-1);
    setError('');
    setState({ answers: { ...EMPTY_ANSWERS }, step: 0 });
  };

  const selectedCount = current.multi ? answers[current.key].length : 0;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-blush-200/50 blur-3xl" />
      <div className="container-page relative max-w-4xl py-10 sm:py-14">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-plum-600 shadow-soft">
            <Sparkles className="h-4 w-4 text-lavender-500" /> The Gift Finder
          </p>
          <h1 className="text-3xl sm:text-5xl">Let&apos;s Find Their Perfect Gift!</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            A few details about your special person will help us find something they&apos;ll love.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Gift finder progress">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-plum-700">
              Step {step + 1} of {STEPS.length}
            </span>
            <button onClick={startOver} className="inline-flex items-center gap-1.5 text-ink/60 hover:text-plum-600">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-lavender-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-lavender-400 to-blush-300"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <ol className="mt-4 hidden justify-between sm:flex">
            {STEPS.map((s, i) => {
              const done = isStepValid(s, answers) && i < step;
              const active = i === step;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => i < step && goTo(i)}
                    disabled={i > step}
                    aria-label={`Step ${i + 1}`}
                    aria-current={active ? 'step' : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                      active
                        ? 'bg-plum-600 text-white shadow-soft'
                        : done
                        ? 'bg-lavender-400 text-white hover:bg-lavender-500'
                        : 'bg-lavender-100 text-plum-500'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Step content */}
        <div className="card min-h-[22rem] p-6 sm:p-10">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="text-2xl sm:text-3xl">{current.title}</h2>
              <p className="mt-1.5 text-ink/60">
                {current.hint}
                {current.multi && selectedCount > 0 && (
                  <span className="ml-2 rounded-full bg-lavender-100 px-2.5 py-0.5 text-xs font-semibold text-plum-700">
                    {selectedCount} selected
                  </span>
                )}
              </p>

              <div
                role={current.multi ? 'group' : 'radiogroup'}
                aria-label={current.title}
                className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
              >
                {current.options.map((o) => {
                  const selected = current.multi
                    ? answers[current.key].includes(o.value)
                    : answers[current.key] === o.value;
                  return (
                    <OptionCard key={o.value} option={o} selected={selected} multi={current.multi} onClick={() => choose(o.value)} />
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => goTo(step - 1)} disabled={step === 0} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={next} className="btn-primary !px-8">
            {isLast ? (
              <>
                Find their gifts <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
