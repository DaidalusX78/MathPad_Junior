/**
 * High-Precision Canvas Drawing & Stylus Engine
 */

import { historyManager } from './historyManager.js';
import { audioManager } from './audioManager.js';
import { studentProgress } from '../data/studentProgress.js';

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

    // Palm Rest shield touch protection & draggable resizing
    const palmShield = document.getElementById('palmShield');
    const dragHandle = document.getElementById('palmDragHandle');

    if (palmShield) {
      if (studentProgress.palmHeight) {
        palmShield.style.height = `${studentProgress.palmHeight}px`;
      }

      palmShield.addEventListener('pointerdown', (e) => {
        if (e.target.closest('#palmDragHandle')) return;
        e.stopPropagation();
      });

      const hintPill = document.getElementById('palmHintPill');
      if (hintPill) {
        setTimeout(() => {
          hintPill.style.opacity = '0';
          setTimeout(() => { if (hintPill) hintPill.style.display = 'none'; }, 400);
        }, 5500);
      }

      if (dragHandle) {
        let isDragging = false;
        let startY = 0;
        let startHeight = 140;
        let startX = 0;
        let startLeft = 0;

        const dismissHint = () => {
          const hint = document.getElementById('palmHintPill');
          if (hint) {
            hint.style.opacity = '0';
            setTimeout(() => { if (hint) hint.style.display = 'none'; }, 300);
          }
        };

        dragHandle.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          dismissHint();
          isDragging = true;
          startY = e.clientY;
          startX = e.clientX;
          startHeight = parseInt(palmShield.style.height || '140', 10);
          startLeft = dragHandle.offsetLeft;
          dragHandle.setPointerCapture(e.pointerId);
        });

        dragHandle.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          e.stopPropagation();
          e.preventDefault();

          // Vertical height resize
          const deltaY = startY - e.clientY;
          const newHeight = Math.max(80, Math.min(340, startHeight + deltaY));
          palmShield.style.height = `${newHeight}px`;
          studentProgress.setPalmHeight(newHeight);

          // Horizontal slide repositioning
          const deltaX = e.clientX - startX;
          const containerWidth = palmShield.offsetWidth || window.innerWidth;
          const newLeft = Math.max(70, Math.min(containerWidth - 70, startLeft + deltaX));
          const leftPct = (newLeft / containerWidth) * 100;
          dragHandle.style.left = `${leftPct}%`;
        });

        const stopDrag = (e) => {
          if (isDragging) {
            isDragging = false;
            try { dragHandle.releasePointerCapture(e.pointerId); } catch (err) {}
          }
        };

        dragHandle.addEventListener('pointerup', stopDrag);
        dragHandle.addEventListener('pointercancel', stopDrag);
      }
    }
  }

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const targetW = Math.floor(rect.width);
      const targetH = Math.floor(rect.height);

      if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
        let tempCanvas = null;
        if (this.canvas.width > 0 && this.canvas.height > 0) {
          tempCanvas = document.createElement('canvas');
          tempCanvas.width = this.canvas.width;
          tempCanvas.height = this.canvas.height;
          try {
            tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
          } catch (e) {}
        }

        this.canvas.width = targetW;
        this.canvas.height = targetH;
        if (tempCanvas && tempCanvas.width > 0 && tempCanvas.height > 0) {
          try {
            this.ctx.drawImage(tempCanvas, 0, 0);
          } catch (e) {}
        }
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
    document.documentElement.style.setProperty('--active-ink-color', color);
    document.documentElement.style.setProperty('--active-swatch-ring', color);

    const preview = document.getElementById('penActivePreview');
    if (preview) {
      preview.style.backgroundColor = color;
    }

    document.querySelectorAll('.color-swatch-btn').forEach((btn) => {
      const isActive = btn.dataset.color === color;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.style.boxShadow = `0 0 0 2.5px #ffffff, 0 0 0 5px ${color}, 0 3px 8px rgba(0, 0, 0, 0.18)`;
      } else {
        btn.style.boxShadow = '';
      }
    });

    this.setTool('pen');
  }

  setStrokeSize(size) {
    const numSize = parseFloat(size);
    this.currentStrokeWidth = numSize;

    const label = document.getElementById('penSizePreviewLabel');
    if (label) {
      label.innerText = `${numSize}px`;
    }

    document.querySelectorAll('.stroke-btn').forEach((btn) => {
      btn.classList.toggle('active', parseFloat(btn.dataset.size) === numSize);
    });

    this.setTool('pen');
    audioManager.playSound('click');
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
