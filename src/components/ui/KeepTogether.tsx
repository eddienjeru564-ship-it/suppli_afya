import { Fragment, type ReactNode } from "react";

// Words browsers would otherwise break at their hyphen, leaving "M-" at the end of a line.
const UNBREAKABLE = /(M-Pesa)/g;

/**
 * Plain text with "M-Pesa" kept on one line. Returned as one inline element, so inside a flex row
 * the text stays a single item instead of splitting into columns at "M-Pesa".
 */
export function keepTogether(text: string): ReactNode {
  const parts = text.split(UNBREAKABLE);
  if (parts.length === 1) return text;
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

/** "M-Pesa" as a word that never splits across lines, for use inside JSX text. */
export function MPesa() {
  return <span className="whitespace-nowrap">M-Pesa</span>;
}
