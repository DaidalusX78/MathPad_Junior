/**
 * Google Handwriting Recognition (OCR) Service Handler
 */

export class OCRHandler {
  static extractTargetBoxStrokes(inkStrokes, canvas, boxElemId = 'targetAnswerBox') {
    const boxElem = document.getElementById(boxElemId);
    if (!boxElem || inkStrokes.length === 0) return inkStrokes;

    const boxRect = boxElem.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const minX = (boxRect.left - canvasRect.left - 25) * scaleX;
    const maxX = (boxRect.right - canvasRect.left + 25) * scaleX;
    const minY = (boxRect.top - canvasRect.top - 25) * scaleY;
    const maxY = (boxRect.bottom - canvasRect.top + 25) * scaleY;

    const boxStrokes = inkStrokes.filter((stroke) => {
      const startX = stroke[0][0];
      const startY = stroke[1][0];
      return startX >= minX && startX <= maxX && startY >= minY && startY <= maxY;
    });

    return boxStrokes.length > 0 ? boxStrokes : inkStrokes;
  }

  static async recognizeStrokes(strokes, canvasWidth, canvasHeight, language = 'en') {
    const requestPayload = {
      app_version: 0.4,
      api_level: '533.0',
      device: navigator.userAgent,
      input_type: '0',
      options: 'enable_pre_space',
      requests: [
        {
          writing_guide: {
            writing_area_width: Math.floor(canvasWidth),
            writing_area_height: Math.floor(canvasHeight)
          },
          ink: strokes,
          language: language
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
      return data[1][0][1];
    }
    return [];
  }
}
