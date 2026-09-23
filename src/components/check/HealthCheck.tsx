"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Distributor } from "@/config/distributors";
import {
  QUESTIONS_BY_ID,
  SECTIONS,
  isAnswered,
  nextQuestionId,
  previousQuestionId,
  recommend,
  resolveText,
  toggleOption,
  visibleOptions,
  visibleQuestions,
  type Answers,
  type EngineResult,
  type Question,
} from "@/engine";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Shield } from "@/components/ui/icons";
import { MultiChoice, Scale, SingleChoice, TextField } from "./inputs";
import { ResultPlan } from "./ResultPlan";

type Mode = "embedded" | "page";

interface Saved {
  answers: Answers;
  currentId: string;
}

const FIRST = "welcome";
const LAST = "plan_size";

export function HealthCheck({
  distributor,
  mode,
  onAnswersChange,
  onResult,
  className,
}: {
  distributor: Distributor;
  mode: Mode;
  onAnswersChange?: (answers: Answers) => void;
  onResult?: (result: EngineResult | null) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const storageKey = `sa-check:${distributor.slug}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [currentId, setCurrentId] = useState(FIRST);
  const [result, setResult] = useState<EngineResult | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ctx = useMemo(
    () => ({ distributorName: distributor.name, distributorFirstName: distributor.firstName }),
    [distributor],
  );

  // Restore an unfinished check (full-page mode only).
  useEffect(() => {
    if (mode !== "page") return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Saved;
      if (saved?.answers && QUESTIONS_BY_ID[saved.currentId]) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
        setAnswers(saved.answers);
        setCurrentId(saved.currentId);
      }
    } catch {
      /* storage unavailable */
    }
  }, [mode, storageKey]);

  useEffect(() => {
    onAnswersChange?.(answers);
    if (mode !== "page") return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, currentId } satisfies Saved));
    } catch {
      /* storage unavailable */
    }
  }, [answers, currentId, mode, storageKey, onAnswersChange]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const q = QUESTIONS_BY_ID[currentId];

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (mode === "page") window.scrollTo({ top: 0 });
    else if (rootRef.current && window.innerWidth < 1024) {
      // On phones the check isn't framed, so bring its top back into view under the nav.
      const top = rootRef.current.getBoundingClientRect().top;
      if (top < 72) window.scrollTo({ top: window.scrollY + top - 80 });
    }
  }, [mode]);

  const goTo = useCallback(
    (id: string, direction: 1 | -1) => {
      setDir(direction);
      setError(null);
      setCurrentId(id);
      setTouched(true);
      scrollTop();
    },
    [scrollTop],
  );

  const finish = useCallback(
    (final: Answers) => {
      const r = recommend(final, { salt: String(Date.now()) });
      setDir(1);
      setResult(r);
      onResult?.(r);
      scrollTop();
      if (mode === "page") {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
      }
    },
    [mode, onResult, scrollTop, storageKey],
  );

  const next = useCallback(
    (a: Answers = answers) => {
      const question = QUESTIONS_BY_ID[currentId];
      if (!isAnswered(question, a)) {
        if (question.kind === "number") setError(`Please enter an age between ${question.range?.min} and ${question.range?.max}.`);
        if (question.kind === "text") setError("Please enter a name, even a nickname.");
        return;
      }
      const nextId = nextQuestionId(currentId, a);
      if (!nextId || currentId === LAST) finish(a);
      else goTo(nextId, 1);
    },
    [answers, currentId, finish, goTo],
  );

  const back = useCallback(() => {
    if (result) {
      setResult(null);
      onResult?.(null);
      goTo(LAST, -1);
      return;
    }
    const prev = previousQuestionId(currentId, answers);
    if (prev) goTo(prev, -1);
  }, [answers, currentId, goTo, onResult, result]);

  const restart = useCallback(() => {
    setAnswers({});
    setResult(null);
    onResult?.(null);
    goTo(FIRST, -1);
  }, [goTo, onResult]);

  const setValue = (id: string, value: Answers[string]) => {
    setError(null);
    setAnswers((a) => ({ ...a, [id]: value }));
  };

  const selectAndAdvance = (id: string, value: string | number) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => next(updated), reduce ? 0 : 280);
  };

  // Progress by section.
  const sectionProgress = useMemo(() => {
    const list = visibleQuestions(answers).filter((x) => x.section !== "intro");
    return SECTIONS.map((s) => {
      const inSection = list.filter((x) => x.section === s.id);
      const idx = inSection.findIndex((x) => x.id === currentId);
      const currentSectionIndex = SECTIONS.findIndex((x) => x.id === q?.section);
      const thisIndex = SECTIONS.findIndex((x) => x.id === s.id);
      let fill = 0;
      if (result) fill = 1;
      else if (thisIndex < currentSectionIndex) fill = 1;
      else if (thisIndex === currentSectionIndex && idx >= 0) fill = (idx + 1) / inSection.length;
      return { ...s, fill };
    });
  }, [answers, currentId, q?.section, result]);

  const showHeader = result !== null || q?.section !== "intro";
  const canGoBack = result !== null || previousQuestionId(currentId, answers) !== null;

  return (
    <div
      ref={rootRef}
      className={clsx(
        "flex flex-col bg-cream text-ink",
        mode === "page" ? "min-h-dvh" : "h-full",
        className,
      )}
    >
      {/* header */}
      <div
        className={clsx(
          "z-10 bg-cream/90 backdrop-blur",
          mode === "page" ? "sticky top-0 px-5 pt-4 sm:px-8" : "px-5 pt-4 lg:sticky lg:top-0",
        )}
      >
        <div className={clsx("mx-auto flex items-center gap-3", mode === "page" && "max-w-xl")}>
          <button
            type="button"
            onClick={back}
            disabled={!canGoBack}
            aria-label="Back"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-0"
          >
            <ChevronLeft />
          </button>
          <div className={clsx("flex flex-1 gap-1.5 transition-opacity duration-500", showHeader ? "opacity-100" : "opacity-0")} aria-hidden={!showHeader}>
            {sectionProgress.map((s) => (
              <div key={s.id} className="flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    className="h-full rounded-full bg-forest"
                    initial={false}
                    animate={{ width: `${Math.round(s.fill * 100)}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="mt-1.5 hidden text-[0.68rem] font-semibold text-ink-mute sm:block">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="w-9 shrink-0" />
        </div>
      </div>

      {/* body */}
      <div
        ref={scrollRef}
        className={clsx(
          "relative min-h-0 flex-1",
          mode === "embedded" && "thin-scrollbar lg:overflow-y-auto lg:overscroll-contain",
        )}
      >
        <div className={clsx("mx-auto px-5 pb-6 pt-6", mode === "page" ? "max-w-xl sm:px-8 sm:pt-10" : "")}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {result ? (
              <motion.div
                key="result"
                custom={dir}
                initial={{ opacity: 0, x: reduce ? 0 : 28 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : -28 * dir }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ResultPlan
                  result={result}
                  distributor={distributor}
                  onRestart={restart}
                  onEdit={back}
                  embedded={mode === "embedded"}
                />
              </motion.div>
            ) : (
              q && (
                <motion.div
                  key={q.id}
                  custom={dir}
                  initial={{ opacity: 0, x: reduce ? 0 : 28 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduce ? 0 : -28 * dir }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <QuestionView
                    q={q}
                    answers={answers}
                    distributor={distributor}
                    ctx={ctx}
                    mode={mode}
                    touched={touched}
                    error={error}
                    onValue={setValue}
                    onSelectAdvance={selectAndAdvance}
                    onNext={() => next()}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function QuestionView({
  q,
  answers,
  distributor,
  ctx,
  mode,
  touched,
  error,
  onValue,
  onSelectAdvance,
  onNext,
}: {
  q: Question;
  answers: Answers;
  distributor: Distributor;
  ctx: { distributorName: string; distributorFirstName: string };
  mode: Mode;
  touched: boolean;
  error: string | null;
  onValue: (id: string, v: Answers[string]) => void;
  onSelectAdvance: (id: string, v: string | number) => void;
  onNext: () => void;
}) {
  const prompt = resolveText(q.prompt, answers, ctx);
  const helper = resolveText(q.helper, answers, ctx);
  const options = visibleOptions(q, answers);
  const value = answers[q.id];
  const needsContinue = ["text", "number", "multi", "ranked"].includes(q.kind);
  const answered = isAnswered(q, answers);

  if (q.kind === "section") {
    const isWelcome = q.id === "welcome";
    return (
      <div className={clsx("flex flex-col", mode === "page" ? "min-h-[60dvh] justify-center" : "min-h-[26rem] justify-center")}>
        {isWelcome && (
          <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-ink/10 bg-paper py-1.5 pl-1.5 pr-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest font-display text-cream">
              {distributor.firstName.charAt(0)}
            </span>
            <span className="text-[0.82rem] leading-tight">
              <span className="block font-semibold text-ink">{distributor.name}</span>
              <span className="block text-ink-mute">BF Suma distributor · {distributor.area}</span>
            </span>
          </div>
        )}
        {q.badge && (
          <span className="mb-4 w-fit rounded-full bg-sage-soft px-3 py-1 text-[0.75rem] font-semibold text-forest">{q.badge}</span>
        )}
        <h2
          className={clsx(
            "font-display leading-[1.05] tracking-[-0.025em] text-ink",
            isWelcome ? "text-[2.5rem] sm:text-[3.1rem]" : "text-[2.2rem] sm:text-[2.6rem]",
          )}
        >
          {prompt}
        </h2>
        {helper && (
          <div className="mt-4 grid gap-3 text-[1.02rem] leading-relaxed text-ink-soft">
            {helper.split("\n\n").map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Button size="lg" onClick={onNext} arrow>
            {q.cta ?? "Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-[1.75rem] leading-[1.12] tracking-[-0.02em] text-ink sm:text-[2rem]">{prompt}</h2>
      {helper && <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{helper}</p>}

      <div className="mt-6">
        {q.kind === "single" && (
          <SingleChoice options={options} value={value as string | undefined} onSelect={(id) => onSelectAdvance(q.id, id)} />
        )}
        {q.kind === "scale" && (
          <Scale
            value={typeof value === "number" ? value : undefined}
            labels={q.scaleLabels ?? ["Low", "High"]}
            onSelect={(n) => onSelectAdvance(q.id, n)}
          />
        )}
        {(q.kind === "multi" || q.kind === "ranked") && (
          <MultiChoice
            q={q}
            options={options}
            value={Array.isArray(value) ? value : []}
            ranked={q.kind === "ranked"}
            onToggle={(id) => onValue(q.id, toggleOption(q, Array.isArray(value) ? value : [], id))}
          />
        )}
        {(q.kind === "text" || q.kind === "number") && (
          <TextField
            value={value === undefined ? "" : String(value)}
            numeric={q.kind === "number"}
            maxLength={q.range?.max}
            placeholder={q.placeholder}
            autoFocus={mode === "page" || touched}
            invalid={error}
            onChange={(v) => onValue(q.id, q.kind === "number" ? (v === "" ? undefined : Number(v)) : v)}
            onSubmit={onNext}
          />
        )}
      </div>

      {q.why && (
        <p className="mt-5 flex items-start gap-2 text-[0.82rem] leading-snug text-ink-mute">
          <Shield className="mt-px h-3.5 w-3.5 shrink-0 text-moss" />
          <span>
            <span className="font-semibold text-ink-soft">Why we ask: </span>
            {q.why}
          </span>
        </p>
      )}

      {needsContinue && (
        <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-cream via-cream to-cream/0 px-5 pb-2 pt-4">
          <Button size="lg" className="w-full sm:w-auto" onClick={onNext} disabled={!answered} arrow>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
