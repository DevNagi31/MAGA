export const parseReceiptText = (rawText) => {
  if (!rawText) return { items: [], total: null };

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items = [];
  let total = null;

  // Only match decimal amounts (requires dot or comma + 2 digits) — avoids matching codes/quantities
  // Handles: 12.99  $12.99  12,99  $1,234.56
  const amountAtEnd = /\$?\s*([\d,]+[.,]\d{2})\s*$/;

  const skipKeywords = /^(receipt|thank you|welcome|cashier|server|table|check|order|date|time|visa|master|credit|debit|approved|auth|ref|trans|acct|entry|invoice|reference|application|aid|tvr|tsi|customer|signature|agree|merchant|issuer|phone|address|www\.|http|store|change|balance|payment|cash|member)/i;
  const subtotalKeywords = /subtotal|sub-total|sub total/i;
  const taxKeywords = /\btax\b|\bvat\b|\bgst\b|\bhst\b/i;
  const tipKeywords = /\btip\b|gratuity|service charge/i;
  const totalKeywords = /\btotal\b|amount due|balance due|grand total/i;
  const discountKeywords = /discount|coupon|savings|promo/i;

  const parseAmount = (str) => parseFloat(str.replace(/,(?=\d{3})/g, '').replace(',', '.'));

  lines.forEach((line) => {
    if (skipKeywords.test(line)) return;

    const match = line.match(amountAtEnd);
    if (!match) return;

    const amount = parseAmount(match[1]);
    if (amount <= 0 || amount > 9999) return;

    // Name is everything before the matched amount
    let name = line.slice(0, line.length - match[0].length).trim();

    // Strip leading item codes (digits, dashes, dots at start)
    name = name.replace(/^[\d\-#.*\s]+/, '').replace(/\s{2,}/g, ' ').trim();
    if (!name || name.length < 2 || name.length > 60) return;

    if (totalKeywords.test(line)) { if (!total) total = amount; return; }
    if (subtotalKeywords.test(line) || taxKeywords.test(line) || tipKeywords.test(line) || discountKeywords.test(line)) return;

    items.push({ id: `item-${Date.now()}-${Math.random()}`, name, amount, assigned: null });
  });

  if (!total && items.length > 0) {
    total = parseFloat(items.reduce((s, i) => s + i.amount, 0).toFixed(2));
  }

  return { items, total };
};

export const getMockReceiptItems = () => ({
  items: [
    { id: 'item-1', name: "Margherita Pizza", amount: 14.99, assigned: null },
    { id: 'item-2', name: "Caesar Salad", amount: 8.50, assigned: null },
    { id: 'item-3', name: "Sparkling Water", amount: 3.00, assigned: null },
    { id: 'item-4', name: "Tiramisu", amount: 6.50, assigned: null },
  ],
  total: 32.99,
});

export const runVisionOCR = async (base64Image) => {
  const API_KEY = 'AIzaSyBS0IrA69fifurWa2vf-93ALRfeTaQRqgY';
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
      }],
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const msg = data.error?.message || `API error ${response.status}`;
    throw new Error(msg);
  }

  const rawText = data.responses?.[0]?.fullTextAnnotation?.text || '';
  if (!rawText) throw new Error('No text detected in image. Try a clearer photo.');

  const result = parseReceiptText(rawText);
  if (result.items.length === 0) throw new Error('Could not find any line items. Try a clearer photo of the receipt.');

  return result;
};
