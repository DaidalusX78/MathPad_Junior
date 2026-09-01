/**
 * History & Undo/Redo State Manager for Canvas
 */

import { audioManager } from './audioManager.js';

export class HistoryManager {
  constructor(maxStates = 20) {
    this.maxStates = maxStates;
    this.undoStack = [];
    this.drawingHistory = {};
    this.inkHistory = {};
  }

  saveUndoState(canvas) {
    if (this.undoStack.length >= this.maxStates) {
      this.undoStack.shift();
    }
    this.undoStack.push(canvas.toDataURL());
  }

  saveQuestionState(index, canvas, inkStrokes) {
    this.drawingHistory[index] = canvas.toDataURL();
    this.inkHistory[index] = [...inkStrokes];
  }

  restoreQuestionState(index, canvas, ctx, onComplete) {
    const strokes = this.inkHistory[index] ? [...this.inkHistory[index]] : [];
    if (this.drawingHistory[index]) {
      const img = new Image();
      img.src = this.drawingHistory[index];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        if (onComplete) onComplete(strokes);
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onComplete) onComplete(strokes);
    }
    this.undoStack = [];
  }

  undo(canvas, ctx, inkStrokes, onRestored) {
    if (inkStrokes.length > 0) {
      inkStrokes.pop();
    }

    if (this.undoStack.length > 0) {
      const prev = this.undoStack.pop();
      const img = new Image();
      img.src = prev;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        if (onRestored) onRestored();
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onRestored) onRestored();
    }
    audioManager.playSound('click');
  }

  clearSession() {
    this.undoStack = [];
    this.drawingHistory = {};
    this.inkHistory = {};
  }
}

export const historyManager = new HistoryManager();
