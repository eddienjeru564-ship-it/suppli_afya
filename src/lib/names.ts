// Forms of address people are known by, with the name that follows ("Mama Njeri", "Mzee Kamau").
const TITLES = new Set([
  "mama", "baba", "mzee", "cucu", "shosh", "nyanya", "babu", "mwalimu", "shangazi",
  "dr", "doctor", "prof", "eng", "hon", "mr", "mrs", "ms", "miss", "madam",
  "pastor", "rev", "reverend", "bishop", "fr", "father", "sister", "sr", "brother", "auntie", "aunty", "uncle",
]);

/**
 * The name to greet someone by in a message: usually their first word, but a form of address keeps
 * the name after it, because "Hi Mama," to Mama Njeri is wrong. Anything after a comma is dropped
 * ("Wanjiru, 34" gives "Wanjiru").
 */
export function greetingName(full: string | null | undefined): string {
  const words = (full ?? "").split(",")[0].trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const titled = TITLES.has(words[0].toLowerCase().replace(/\.$/, ""));
  return titled && words.length > 1 ? `${words[0]} ${words[1]}` : words[0];
}
