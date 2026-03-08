import { GOOGLE_VISION_API_KEY } from '../config/keys';
import { parseReceiptText } from './ocrParser';

/**
 * Sends a base64 image to Google Cloud Vision API
 * and returns parsed receipt items.
 */
export const runVisionOCR = async (base64Image) => {
  if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('No API key set. Add your Google Vision API key to src/config/keys.js');
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Vision API request failed');
  }

  const data = await response.json();
  const rawText = data?.responses?.[0]?.textAnnotations?.[0]?.description || '';

  if (!rawText) {
    throw new Error('No text detected in image');
  }

  const parsed = parseReceiptText(rawText);

  // If parser found nothing, return the raw total if detectable
  if (parsed.items.length === 0 && parsed.total) {
    parsed.items.push({
      id: `item-${Date.now()}`,
      name: 'Receipt item',
      amount: parsed.total,
      assigned: null,
    });
  }

  return parsed;
};
