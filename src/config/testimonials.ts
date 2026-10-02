/**
 * Real words from real distributors, shown on the homepage right after "How it works". Only add a
 * quote someone actually said, with their permission to use their name and title. While this is
 * empty nothing is shown, and the homepage proves itself with the live demo instead
 * (docs/DECISIONS.md, "Testimonials").
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** What they do, as they'd say it: "BF Suma distributor, Nakuru". */
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [];
