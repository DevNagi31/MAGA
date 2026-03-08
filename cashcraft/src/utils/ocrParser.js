/**
 * Parses raw OCR text from a receipt into structured line items.
 */
export const parseReceiptText = (rawText) => {
  if (!rawText) return { items: [], subtotal: null, tax: null, tip: null, total: null };

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items = [];
  let subtotal = null;
  let tax = null;
  let tip = null;
  let total = null;

  // Regex to detect a dollar amount at the end of a line
  const amountPattern = /\$?\s*(\d{1,4}[.,]\d{2})\s*$/;
  // Common receipt keywords to skip or categorize
  const skipKeywords = /^(receipt|thank you|welcome|cashier|server|table|check|order|date|time|visa|mastercard|credit|debit|card|approved|auth|ref|trans|acct|entry|invoice|reference|application|aid|tvr|tsi|customer copy|signature|agree|merchant|issuer)/i;
  const subtotalKeywords = /subtotal|sub-total|sub total/i;
  const taxKeywords = /^tax|gst|hst|vat/i;
  const tipKeywords = /tip|gratuity|service charge/i;
  const totalKeywords = /^total$|^total:|total charge|pre auth/i;

  lines.forEach((line) => {
    if (skipKeywords.test(line)) return;

    const match = line.match(amountPattern);
    if (!match) return;

    const amount = parseFloat(match[1].replace(',', '.'));
    // Strip amount from end to get item name
    const name = line.replace(amountPattern, '').trim();

    if (!name || amount <= 0 || amount > 9999) return;

    if (subtotalKeywords.test(name)) {
      subtotal = amount;
    } else if (taxKeywords.test(name)) {
      tax = amount;
    } else if (tipKeywords.test(name)) {
      tip = amount;
    } else if (totalKeywords.test(name)) {
      total = amount;
    } else {
      // Filter out lines that look like dates or IDs
      if (name.length >= 2 && name.length <= 40) {
        items.push({
          id: `item-${Date.now()}-${Math.random()}`,
          name: cleanItemName(name),
          amount,
          assigned: null,
        });
      }
    }
  });

  // If no total found, calculate from items + tax + tip
  if (!total && items.length > 0) {
    const itemSum = items.reduce((s, i) => s + i.amount, 0);
    total = parseFloat((itemSum + (tax || 0) + (tip || 0)).toFixed(2));
  }

  return { items, subtotal, tax, tip, total };
};

const cleanItemName = (name) => {
  // Remove leading/trailing special chars, normalize whitespace
  return name
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9\s&'()-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// Mock OCR result — parsed from Nirchi's Pizza receipt (3/6/2026, $7.43)
export const getMockReceiptItems = () => ({
  items: [
    { id: 'item-1', name: "Nirchi's Pizza", amount: 7.43, assigned: null },
  ],
  subtotal: 7.43,
  tax: null,
  tip: null,
  total: 7.43,
});
