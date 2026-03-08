import { GOOGLE_VISION_API_KEY } from '../config/keys';
import { parseReceiptText } from './ocrParser';

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
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    const msg = data.error?.message || `API error ${response.status}`;
    throw new Error(msg);
  }

  const rawText =
    data.responses?.[0]?.fullTextAnnotation?.text ||
    data.responses?.[0]?.textAnnotations?.[0]?.description ||
    '';
  if (!rawText) throw new Error('No text detected in image. Try a clearer photo.');

  const result = parseReceiptText(rawText);
  if (result.items.length === 0) throw new Error('Could not find any line items. Try a clearer photo of the receipt.');

  return result;
};
