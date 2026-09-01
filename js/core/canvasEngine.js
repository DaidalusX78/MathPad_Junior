/**
 * High-Precision Canvas Drawing & Stylus Engine
 */

import { historyManager } from './historyManager.js';
import { audioManager } from './audioManager.js';

export class CanvasEngine {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.container = document.getElementById(containerId);

    this.currentTool = 'pen';
    this.currentColor = '#b57edc';
    this.currentStrokeWidth = 2.5;

    this.isDrawing = false;
    this.activePointerId = null;
    this.lastPoint = null;
    this.currentStroke = null;
    this.inkStrokes = [];

    this.initEvents();
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: (e.pressure && e.pressure > 0) ? e.pressure : 0.5,
      t: Date.now()
    };
  }

  initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.isDrawing) return;
      e.preventDefault();
      this.activePointerId = e.pointerId;
      this.canvas.setPointerCapture(e.pointerId);
      historyManager.saveUndoState(this.canvas);
      this.isDrawing = true;

      const pt = this.getPointerPos(e);
      this.lastPoint = pt;

      if (this.currentTool === 'pen') {
        this.currentStroke = [[Math.round(pt.x)], [Math.round(pt.y)], [pt.t]];
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing || e.pointerId !== this.activePointerId) return;
      e.preventDefault();
      const currentPoint = this.getPointerPos(e);

      this.ctx.save();
      if (this.currentTool === 'eraser') {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(currentPoint.x, currentPoint.y, this.currentStrokeWidth * 3.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const width = (e.pointerType === 'pen' && e.pressure > 0)
          ? Math.max(1.5, currentPoint.pressure * 6)
          : this.currentStrokeWidth;
        this.ctx.lineWidth = width;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
        this.ctx.lineTo(currentPoint.x, currentPoint.y);
        this.ctx.stroke();

        if (this.currentStroke) {
          this.currentStroke[0].push(Math.round(currentPoint.x));
          this.currentStroke[1].push(Math.round(currentPoint.y));
          this.currentStroke[2].push(currentPoint.t);
        }
      }
      this.ctx.restore();
      this.lastPoint = currentPoint;
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (!this.isDrawing || e.pointerId !== this.activePointerId) return;
      this.isDrawing = false;
      this.activePointerId = null;

      if (this.currentStroke && this.currentStroke[0].length > 1) {
        this.inkStrokes.push(this.currentStroke);
      }
      this.currentStroke = null;

      try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    this.canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerId === this.activePointerId) {
        this.isDrawing = false;
        this.activePointerId = null;
        this.currentStroke = null;
        try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    });

    // Palm Rest shield touch protection
    const palmShield = document.getElementById('palmShield');
    if (palmShield) {
      ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend'].forEach((evt) => {
        palmShield.addEventListener(evt, (e) => {
          e.stopPropagation();
        }, { passive: false });
      });
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (this.canvas.width !== Math.floor(rect.width) || this.canvas.height !== Math.floor(rect.height)) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);

        this.canvas.width = Math.floor(rect.width);
        this.canvas.height = Math.floor(rect.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    document.getElementById('penTool')?.classList.toggle('active', tool === 'pen');
    document.getElementById('eraserTool')?.classList.toggle('active', tool === 'eraser');
    audioManager.playSound('click');
  }

  setColor(color) {
    this.currentColor = color;
    this.setTool('pen');
  }

  setStrokeSize(size) {
    this.currentStrokeWidth = parseFloat(size);
  }

  clear() {
    historyManager.saveUndoState(this.canvas);
    this.inkStrokes = [];
    const recognizedElem = document.getElementById('recognizedVal');
    if (recognizedElem) recognizedElem.innerText = '--';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    audioManager.playSound('click');
  }
}
