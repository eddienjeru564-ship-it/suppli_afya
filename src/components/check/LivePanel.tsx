"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import type { Distributor } from "@/config/distributors";
import {
  deriveProfile,
  distributorBrief,
  goalLabel,
  profileFlags,
  pruneAnswers,
  whatsappMessage,
  type Answers,
  type EngineResult,
} from "@/engine";
import { LeadCard } from "./LeadCard";
import { WhatsAppPreview } from "./WhatsAppPreview";

/**
 * The distributor's side of the demo. While the customer answers, their lead
 * card fills in. When they finish, the WhatsApp message and full brief appear.
 */
export function LivePanel({
  answers,
  result,
  distributor,
}: {
  answers: Answers;
  result: EngineResult | null;
  distributor: Distributor;
}) {
  const partial = useMemo(() => {
    const p = deriveProfile(pruneAnswers(answers));
    return {
      title: [p.name || "Someone new", p.age].filter(Boolean).join(", "),
      subtitle: p.goals.map(goalLabel).join(" · ") || undefined,
      flags: profileFlags(p),
    };
  }, [answers]);

  const done = useMemo(() => {
    if (!result) return null;
    return {
      brief: distributorBrief(result),
      message: whatsappMessage(result, {
        distributorName: distributor.name,
        distributorFirstName: distributor.firstName,
      }),
    };
  }, [result, distributor]);

  return (
    <div className="grid gap-4">
      <AnimatePresence mode="popLayout">
        {done && (
          <motion.div
            key="wa"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-2 text-[0.8rem] font-semibold text-sage">On your WhatsApp</div>
            <WhatsAppPreview message={done.message} contactName={result?.profile.name || "Customer"} compact />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div layout transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className="mb-2 text-[0.8rem] font-semibold text-sage">In your Suppli Afya portal</div>
        {done ? (
          <LeadCard brief={done.brief} refCode={result?.ref} />
        ) : (
          <LeadCard brief={partial} live />
        )}
      </motion.div>
    </div>
  );
}
