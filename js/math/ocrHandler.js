/**
 * Google Handwriting Recognition (OCR) Service Handler
 */

export class OCRHandler {
  /**
   * Normalizes stroke coordinates to start near (0, 0) with padding and calculates tight bounding box.
   */
  static normalizeStrokes(strokes, padding = 20) {
    if (!strokes || strokes.length === 0) {
      return { normalizedStrokes: [], width: 300, height: 200 };
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    strokes.forEach((stroke) => {
      if (!stroke || !stroke[0] || !stroke[1]) return;
      stroke[0].forEach((x) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      });
      stroke[1].forEach((y) => {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    if (!isFinite(minX) || !isFinite(minY)) {
      return { normalizedStrokes: strokes, width: 300, height: 200 };
    }

    const baseTime = (strokes[0] && strokes[0][2] && strokes[0][2][0]) ? strokes[0][2][0] : Date.now();

    const normalizedStrokes = strokes.map((stroke) => {
      const xs = stroke[0].map((x) => Math.round(x - minX + padding));
      const ys = stroke[1].map((y) => Math.round(y - minY + padding));
      const ts = stroke[2] ? stroke[2].map((t) => Math.max(0, Math.round(t - baseTime))) : [];
      return [xs, ys, ts];
    });

    const width = Math.max(120, Math.round(maxX - minX + padding * 2));
    const height = Math.max(120, Math.round(maxY - minY + padding * 2));

    return { normalizedStrokes, width, height };
  }

  /**
   * Extracts strokes written inside or near the Target Answer Box.
   * If no strokes are in the box, falls back to all strokes on the canvas.
   */
  static extractTargetBoxStrokes(inkStrokes, canvas, boxElemId = 'targetAnswerBox') {
    if (!inkStrokes || inkStrokes.length === 0) return { boxStrokes: [], scratchStrokes: [] };
    const boxElem = document.getElementById(boxElemId);
    if (!boxElem) return { boxStrokes: inkStrokes, scratchStrokes: [] };

    const boxRect = boxElem.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const margin = 20 * scaleX;
    const minX = (boxRect.left - canvasRect.left) * scaleX - margin;
    const maxX = (boxRect.right - canvasRect.left) * scaleX + margin;
    const minY = (boxRect.top - canvasRect.top) * scaleY - margin;
    const maxY = (boxRect.bottom - canvasRect.top) * scaleY + margin;

    const boxStrokes = [];
    const scratchStrokes = [];

    inkStrokes.forEach((stroke) => {
      if (!stroke || !stroke[0] || !stroke[1]) return;
      const isInBox = stroke[0].some((x, i) => {
        const y = stroke[1][i];
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      });
      if (isInBox) {
        boxStrokes.push(stroke);
      } else {
        scratchStrokes.push(stroke);
      }
    });

    return { boxStrokes, scratchStrokes };
  }

  /**
   * Sends normalized ink strokes to Google Handwriting OCR service.
   */
  static async recognizeStrokes(strokes, canvasWidth, canvasHeight, language = 'en') {
    if (!strokes || strokes.length === 0) return [];

    const { normalizedStrokes, width, height } = this.normalizeStrokes(strokes);

    const requestPayload = {
      app_version: 0.4,
      api_level: '533.0',
      device: navigator.userAgent || 'Mozilla/5.0',
      input_type: '0',
      options: 'enable_pre_space',
      requests: [
        {
          writing_guide: {
            writing_area_width: width,
            writing_area_height: height
          },
          ink: normalizedStrokes,
          language: (language === 'es') ? 'es' : 'en'
        }
      ]
    };

    const res = await fetch('https://inputtools.google.com/request?ime=handwriting&app=autopen&cs=1&oe=UTF-8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    if (!res.ok) {
      throw new Error(`OCR service returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && data[1] && data[1][0] && data[1][0][1] && data[1][0][1].length > 0) {
      const rawCandidates = data[1][0][1];
      const candidateSet = new Set();

      rawCandidates.forEach((c) => {
        const trimmed = c.trim();
        if (trimmed) {
          candidateSet.add(trimmed);

          // Extract isolated numeric sequences (e.g. "= 42" -> "42", "42." -> "42")
          const digitMatch = trimmed.match(/\d+/g);
          if (digitMatch) {
            candidateSet.add(digitMatch.join(''));
          }
        }
      });

      return Array.from(candidateSet);
    }

    return [];
  }
}
