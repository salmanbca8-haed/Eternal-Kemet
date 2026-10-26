// High-Performance Frame-Sequence Canvas Scroller Engine
import { EXPEDITION_DATA } from './manifest.js';

export class CinematicScroller {
  constructor(canvasElement, onProgressUpdate) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.onProgressUpdate = onProgressUpdate || (() => {});
    
    this.totalFrames = EXPEDITION_DATA.totalGizaFrames;
    this.framePathFn = EXPEDITION_DATA.gizaPathPattern;

    this.cache = new Map(); // frameNum -> Image
    this.loading = new Set(); // frameNum currently loading
    this.maxCacheSize = 250; // Keep memory in check

    this.currentFrame = 1;
    this.targetFrame = 1;
    this.lastRenderedFrame = -1;

    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.isRendering = false;
    this.initCanvasSize();

    window.addEventListener('resize', () => this.handleResize(), { passive: true });
  }

  initCanvasSize() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.canvas.width = Math.round(this.viewportWidth * this.dpr);
    this.canvas.height = Math.round(this.viewportHeight * this.dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
  }

  handleResize() {
    this.initCanvasSize();
    this.renderFrame(Math.round(this.currentFrame), true);
  }

  // Preload initial frames to ensure immediate launch
  async preloadInitialBatch(initialCount = 20) {
    let loadedCount = 0;
    const promises = [];

    for (let i = 1; i <= initialCount; i++) {
      const p = this.loadFrame(i).then(() => {
        loadedCount++;
        const pct = Math.round((loadedCount / initialCount) * 100);
        this.onProgressUpdate(pct);
      }).catch(err => {
        console.warn(`Initial frame ${i} load fallback`, err);
      });
      promises.append ? promises.append(p) : promises.push(p);
    }

    await Promise.all(promises);
    this.targetFrame = 1;
    this.currentFrame = 1;
    this.renderFrame(1, true);

    // Start background progressive preload
    this.startBackgroundPreload(initialCount + 1);
    this.startRenderLoop();
  }

  loadFrame(frameNumber) {
    if (frameNumber < 1 || frameNumber > this.totalFrames) {
      return Promise.resolve(null);
    }
    if (this.cache.has(frameNumber)) {
      return Promise.resolve(this.cache.get(frameNumber));
    }
    if (this.loading.has(frameNumber)) {
      return Promise.resolve(null);
    }

    this.loading.add(frameNumber);

    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.loading.delete(frameNumber);
        this.cache.set(frameNumber, img);
        this.trimCache();
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(frameNumber);
        resolve(null);
      };
      img.src = this.framePathFn(frameNumber);
    });
  }

  // Keep cache within safe memory limits around current frame
  trimCache() {
    if (this.cache.size <= this.maxCacheSize) return;

    const current = Math.round(this.currentFrame);
    let farthestDist = -1;
    let farthestKey = null;

    for (const key of this.cache.keys()) {
      const dist = Math.abs(key - current);
      if (dist > farthestDist) {
        farthestDist = dist;
        farthestKey = key;
      }
    }

    if (farthestKey !== null) {
      this.cache.delete(farthestKey);
    }
  }

  // Background progressive preloader
  async startBackgroundPreload(startFrom = 21) {
    // Progressively sample keyframes first across the whole sequence
    for (let i = startFrom; i <= this.totalFrames; i += 4) {
      if (!this.cache.has(i)) {
        await this.loadFrame(i);
      }
    }
    // Then fill remaining frames
    for (let i = startFrom; i <= this.totalFrames; i++) {
      if (!this.cache.has(i)) {
        await this.loadFrame(i);
      }
    }
  }

  // Priority load window around current scroll target
  prioritizeWindow(centerFrame, radius = 25) {
    const start = Math.max(1, centerFrame - radius);
    const end = Math.min(this.totalFrames, centerFrame + radius);

    for (let i = start; i <= end; i++) {
      if (!this.cache.has(i) && !this.loading.has(i)) {
        this.loadFrame(i);
      }
    }
  }

  setScrollProgress(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    this.targetFrame = 1 + clamped * (this.totalFrames - 1);
    this.prioritizeWindow(Math.round(this.targetFrame));
  }

  startRenderLoop() {
    if (this.isRendering) return;
    this.isRendering = true;

    const loop = () => {
      const diff = this.targetFrame - this.currentFrame;

      if (Math.abs(diff) > 0.005) {
        // Smooth lerping interpolation
        this.currentFrame += diff * 0.15;
        this.renderFrame(Math.round(this.currentFrame));
      } else if (this.lastRenderedFrame !== Math.round(this.targetFrame)) {
        this.currentFrame = this.targetFrame;
        this.renderFrame(Math.round(this.currentFrame));
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  // Find closest loaded frame if desired target is still loading
  getNearestAvailableFrame(targetNum) {
    if (this.cache.has(targetNum)) {
      return this.cache.get(targetNum);
    }

    // Search outwards
    for (let offset = 1; offset <= 30; offset++) {
      const prev = targetNum - offset;
      if (prev >= 1 && this.cache.has(prev)) {
        return this.cache.get(prev);
      }
      const next = targetNum + offset;
      if (next <= this.totalFrames && this.cache.has(next)) {
        return this.cache.get(next);
      }
    }

    return null;
  }

  renderFrame(frameNumber, force = false) {
    if (!force && frameNumber === this.lastRenderedFrame) return;

    const img = this.getNearestAvailableFrame(frameNumber);
    if (!img) return;

    this.lastRenderedFrame = frameNumber;

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    // Intelligent Aspect-Fill (Cover) Centering
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) * 0.5;
    const offsetY = (canvasH - drawH) * 0.5;

    this.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }
}
