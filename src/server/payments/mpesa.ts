/** M-Pesa helpers shared by whichever STK Push provider we use. */

/** 07XX / 01XX / +2547XX → 2547XXXXXXXX. Returns null if it isn't a Kenyan mobile number. */
export function normaliseKenyanPhone(input: string): string | null {
  const d = input.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const m = d.match(/^(?:254|0)?([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
}

/** M-Pesa result codes, in words a customer understands. */
export function friendlyMpesaReason(code: string | number | null | undefined, desc?: string | null) {
  switch (String(code ?? "")) {
    case "1032":
      return "The M-Pesa prompt was cancelled.";
    case "1037":
      return "The M-Pesa prompt timed out before a PIN was entered.";
    case "1":
      return "There wasn't enough in the M-Pesa account.";
    case "2001":
      return "The M-Pesa PIN was incorrect.";
    case "1025":
    case "9999":
      return "M-Pesa couldn't send the prompt. Check the number and try again.";
    default:
      return desc?.trim() || "M-Pesa didn't complete the payment.";
  }
}
