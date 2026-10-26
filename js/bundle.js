// ==========================================================================
// EGYPT: THE LAND OF ETERNAL WONDER
// Complete Standalone Bundle (Compatible with file://, http://, and Vite)
// ==========================================================================

(function() {
  'use strict';

  // 1. EXPEDITION DATA
  const EXPEDITION_DATA = {
    totalGizaFrames: 600,
    totalConstructionFrames: 192,
    gizaPathPattern: function(index) {
      return 'assets/frames/giza/frame_' + String(index).padStart(4, '0') + '.jpg';
    },
    constructionPathPattern: function(index) {
      return 'assets/frames/construction/construction_' + String(index).padStart(4, '0') + '.jpg';
    },
    audio: {
      src: 'assets/audio/egypt_ambient.mp3',
      title: 'Ancient Egypt Atmosphere'
    },
    video: {
      src: 'assets/video/Building_the_Great_Pyramid_of_20261026164155.mp4',
      title: 'Building the Great Pyramid of Giza'
    },
    images: {
      dendera: {
        src: 'assets/images/0c012c790161efe92b2af750530d4527.jpg',
        title: 'Hypostyle Hall of Dendera Temple',
        caption: 'Spectacular Hathor-headed stone pillars and celestial astronomical ceiling preserved with original ancient lapis and ochre pigments.'
      },
      tombSanctuary: {
        src: 'assets/images/f6c47d05680dc898be8042e3cd65ad6b.jpg',
        title: 'The Subterranean Sarcophagus Chamber',
        caption: 'Sacred limestone crypt guarded by carved wall reliefs, hieroglyphic door jambs, and the statue of the pharaoh looking into eternity.'
      }
    },
    scenes: [
      { id: 'scene-01', index: 0, roman: 'I', number: '01', name: 'Giza at Dawn', headline: 'EGYPT — A CIVILIZATION THAT LIVES FOREVER', frameStart: 1, frameEnd: 155 },
      { id: 'scene-02', index: 1, roman: 'II', number: '02', name: 'The Sacred Nile', headline: 'BORN FROM THE NILE', frameStart: 156, frameEnd: 230 },
      { id: 'scene-03', index: 2, roman: 'III', number: '03', name: 'Monumental Vision', headline: 'A VISION CARVED IN STONE', frameStart: 231, frameEnd: 315 },
      { id: 'scene-04', index: 3, roman: 'IV', number: '04', name: 'The Builders', headline: 'THE HANDS THAT SHAPED HISTORY', frameStart: 316, frameEnd: 380 },
      { id: 'scene-05', index: 4, roman: 'V', number: '05', name: 'Knowledge & Art', headline: 'WHERE ART BECAME ETERNITY', frameStart: 381, frameEnd: 450 },
      { id: 'scene-06', index: 5, roman: 'VI', number: '06', name: 'Sacred Temples', headline: 'MONUMENTS TO THE DIVINE', frameStart: 451, frameEnd: 510 },
      { id: 'scene-07', index: 6, roman: 'VII', number: '07', name: 'Living Soul', headline: 'AN ANCIENT SOUL. A LIVING WORLD.', frameStart: 511, frameEnd: 560 },
      { id: 'scene-08', index: 7, roman: 'VIII', number: '08', name: 'Eternal Legacy', headline: 'SOME WONDERS ARE NEVER FORGOTTEN.', frameStart: 561, frameEnd: 600 }
    ]
  };

  // 2. AUDIO ATMOSPHERE CONTROLLER
  class AudioAtmosphere {
    constructor(audioElementId, toggleButtonId) {
      this.audio = document.getElementById(audioElementId);
      this.btnToggle = document.getElementById(toggleButtonId);
      this.soundLabel = document.getElementById('sound-label');

      this.targetVolume = 0.45;
      this.isMuted = false;
      this.isPlaying = false;
      this.fadeInterval = null;

      if (this.btnToggle) {
        this.btnToggle.addEventListener('click', () => this.toggle());
      }
    }

    async startWithSound() {
      this.isMuted = false;
      if (!this.audio) return;
      this.audio.volume = 0;
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.fadeIn();
        this.updateUI(true);
      } catch (err) {
        console.warn('Autoplay prevented by browser', err);
        this.updateUI(false);
      }
    }

    startMuted() {
      this.isMuted = true;
      this.isPlaying = false;
      if (this.audio) {
        this.audio.volume = 0;
        this.audio.pause();
      }
      this.updateUI(false);
    }

    fadeIn(durationMs = 1500) {
      clearInterval(this.fadeInterval);
      const steps = 30;
      const stepTime = durationMs / steps;
      const volInc = this.targetVolume / steps;

      this.fadeInterval = setInterval(() => {
        if (!this.audio) { clearInterval(this.fadeInterval); return; }
        if (this.audio.volume + volInc < this.targetVolume) {
          this.audio.volume += volInc;
        } else {
          this.audio.volume = this.targetVolume;
          clearInterval(this.fadeInterval);
        }
      }, stepTime);
    }

    fadeOut(durationMs = 800) {
      clearInterval(this.fadeInterval);
      const steps = 20;
      const stepTime = durationMs / steps;
      const volDec = (this.audio ? this.audio.volume : 0.4) / steps;

      return new Promise((resolve) => {
        this.fadeInterval = setInterval(() => {
          if (!this.audio) { clearInterval(this.fadeInterval); resolve(); return; }
          if (this.audio.volume - volDec > 0.02) {
            this.audio.volume -= volDec;
          } else {
            this.audio.volume = 0;
            clearInterval(this.fadeInterval);
            resolve();
          }
        }, stepTime);
      });
    }

    async toggle() {
      if (this.isMuted || !this.isPlaying) {
        this.isMuted = false;
        try {
          if (this.audio) await this.audio.play();
          this.isPlaying = true;
          this.fadeIn();
          this.updateUI(true);
        } catch (err) {
          console.warn('Playback error', err);
        }
      } else {
        await this.fadeOut();
        if (this.audio) this.audio.pause();
        this.isPlaying = false;
        this.isMuted = true;
        this.updateUI(false);
      }
    }

    updateUI(playing) {
      if (this.btnToggle) {
        if (playing) {
          this.btnToggle.classList.add('is-playing');
          if (this.soundLabel) this.soundLabel.textContent = 'Audio On';
        } else {
          this.btnToggle.classList.remove('is-playing');
          if (this.soundLabel) this.soundLabel.textContent = 'Muted';
        }
      }
    }
  }

  // 3. ATMOSPHERIC PARTICLES CONTROLLER
  class AtmosphericParticles {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.particleCount = 55;
      this.isRunning = false;

      this.initCanvasSize();
      this.createParticles();

      window.addEventListener('resize', () => {
        this.initCanvasSize();
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    initCanvasSize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      if (this.canvas) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.2 + 0.6,
          alpha: Math.random() * 0.6 + 0.2,
          speedX: (Math.random() - 0.45) * 0.4,
          speedY: (Math.random() - 0.6) * 0.35,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseVal: Math.random() * Math.PI * 2
        });
      }
    }

    start() {
      if (this.isRunning || !this.ctx) return;
      this.isRunning = true;
      this.animate();
    }

    stop() {
      this.isRunning = false;
    }

    animate() {
      if (!this.isRunning || !this.ctx) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(223, 188, 127, ' + currentAlpha + ')';
        this.ctx.shadowBlur = p.radius * 3;
        this.ctx.shadowColor = 'rgba(199, 164, 106, 0.8)';
        this.ctx.fill();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // 4. CINEMATIC SCROLLER ENGINE
  class CinematicScroller {
    constructor(canvasElement, onProgressUpdate) {
      this.canvas = canvasElement;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.onProgressUpdate = onProgressUpdate || function() {};

      this.totalFrames = EXPEDITION_DATA.totalGizaFrames;
      this.framePathFn = EXPEDITION_DATA.gizaPathPattern;

      this.cache = new Map();
      this.loading = new Set();
      this.maxCacheSize = 250;

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
      if (this.canvas) {
        this.canvas.width = Math.round(this.viewportWidth * this.dpr);
        this.canvas.height = Math.round(this.viewportHeight * this.dpr);
        this.canvas.style.width = this.viewportWidth + 'px';
        this.canvas.style.height = this.viewportHeight + 'px';
      }
    }

    handleResize() {
      this.initCanvasSize();
      this.renderFrame(Math.round(this.currentFrame), true);
    }

    async preloadInitialBatch(initialCount = 20) {
      let loadedCount = 0;
      const promises = [];

      for (let i = 1; i <= initialCount; i++) {
        const p = this.loadFrame(i).then(() => {
          loadedCount++;
          const pct = Math.round((loadedCount / initialCount) * 100);
          this.onProgressUpdate(pct);
        }).catch(() => {});
        promises.push(p);
      }

      // Safety timeout: don't let slow network hold up the entrance forever
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3500));
      await Promise.race([Promise.all(promises), timeoutPromise]);

      this.targetFrame = 1;
      this.currentFrame = 1;
      this.renderFrame(1, true);

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

    async startBackgroundPreload(startFrom = 21) {
      for (let i = startFrom; i <= this.totalFrames; i += 4) {
        if (!this.cache.has(i)) {
          await this.loadFrame(i);
        }
      }
      for (let i = startFrom; i <= this.totalFrames; i++) {
        if (!this.cache.has(i)) {
          await this.loadFrame(i);
        }
      }
    }

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

    getNearestAvailableFrame(targetNum) {
      if (this.cache.has(targetNum)) {
        return this.cache.get(targetNum);
      }

      for (let offset = 1; offset <= 35; offset++) {
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
      if (!this.ctx || (!force && frameNumber === this.lastRenderedFrame)) return;

      const img = this.getNearestAvailableFrame(frameNumber);
      if (!img) return;

      this.lastRenderedFrame = frameNumber;

      const canvasW = this.canvas.width;
      const canvasH = this.canvas.height;
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      const scale = Math.max(canvasW / imgW, canvasH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = (canvasW - drawW) * 0.5;
      const offsetY = (canvasH - drawH) * 0.5;

      this.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }
  }

  // 5. BOOTSTRAP FUNCTION
  async function initEgyptExperience() {
    const introScreen = document.getElementById('experience-intro');
    const introProgressFill = document.getElementById('intro-progress-fill');
    const introStatusText = document.getElementById('intro-status-text');
    const btnEnter = document.getElementById('btn-enter');
    const btnEnterMuted = document.getElementById('btn-enter-muted');

    const scrollCanvas = document.getElementById('scroll-canvas');
    const dustCanvas = document.getElementById('dust-canvas');

    const chapterNumPill = document.getElementById('chapter-number-pill');
    const chapterNamePill = document.getElementById('chapter-name-pill');

    const timelineFill = document.getElementById('timeline-fill');
    const timelineMarker = document.getElementById('timeline-marker');
    const timelineNodes = document.getElementById('timeline-nodes');

    const navDrawer = document.getElementById('nav-drawer');
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const btnDrawerClose = document.getElementById('btn-drawer-close');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerMenuList = document.getElementById('drawer-menu-list');

    // Modals
    const photoModal = document.getElementById('photo-modal');
    const modalImgElement = document.getElementById('modal-img-element');
    const modalImgTitle = document.getElementById('modal-img-title');
    const modalImgDesc = document.getElementById('modal-img-desc');
    const btnClosePhotoModal = document.getElementById('btn-close-photo-modal');
    const modalBackdropPhoto = document.getElementById('modal-backdrop-photo');

    const videoModal = document.getElementById('video-modal');
    const constructionVideoPlayer = document.getElementById('construction-video-player');
    const btnCloseVideoModal = document.getElementById('btn-close-video-modal');
    const modalBackdropVideo = document.getElementById('modal-backdrop-video');
    const btnConstructionModal = document.getElementById('btn-construction-modal');
    const btnTriggerFilmModal = document.getElementById('btn-trigger-film-modal');
    const btnViewConstructionFinale = document.getElementById('btn-view-construction-finale');
    const btnRestartJourney = document.getElementById('btn-restart-journey');

    // Initialize systems
    const audioAtmosphere = new AudioAtmosphere('ambient-audio', 'btn-sound-toggle');
    const particles = new AtmosphericParticles(dustCanvas);

    // Initialize scroller
    const scroller = new CinematicScroller(scrollCanvas, (progressPct) => {
      if (introProgressFill) {
        introProgressFill.style.width = progressPct + '%';
      }
      if (introStatusText) {
        introStatusText.textContent = 'Summoning the Sands of Time (' + progressPct + '%)';
      }
    });

    // Preload
    await scroller.preloadInitialBatch(25);

    if (introProgressFill) introProgressFill.style.width = '100%';
    if (introStatusText) introStatusText.textContent = 'The Gates of Kemet are Open';
    if (btnEnter) btnEnter.disabled = false;
    if (btnEnterMuted) btnEnterMuted.disabled = false;

    // Enter experience
    const enterExperience = async (withSound) => {
      if (introScreen) introScreen.classList.add('is-hidden');
      document.body.classList.remove('is-loading');

      if (withSound) {
        await audioAtmosphere.startWithSound();
      } else {
        audioAtmosphere.startMuted();
      }

      particles.start();
    };

    if (btnEnter) btnEnter.addEventListener('click', () => enterExperience(true));
    if (btnEnterMuted) btnEnterMuted.addEventListener('click', () => enterExperience(false));

    // Timeline rail & drawer items
    if (timelineNodes && drawerMenuList) {
      timelineNodes.innerHTML = '';
      drawerMenuList.innerHTML = '';

      EXPEDITION_DATA.scenes.forEach((scene, idx) => {
        const nodeBtn = document.createElement('button');
        nodeBtn.className = 'timeline-node' + (idx === 0 ? ' is-active' : '');
        nodeBtn.dataset.targetScene = scene.id;
        nodeBtn.setAttribute('aria-label', 'Navigate to ' + scene.name);
        nodeBtn.innerHTML = '<span class="node-dot">' + scene.roman + '</span>' +
                            '<span class="node-label">' + scene.name + '</span>';
        nodeBtn.addEventListener('click', () => {
          const targetEl = document.getElementById(scene.id);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        });
        timelineNodes.appendChild(nodeBtn);

        const menuItem = document.createElement('li');
        menuItem.innerHTML = '<a href="#' + scene.id + '" class="drawer-item-link">' +
                             '<span class="drawer-item-num">' + scene.number + '</span>' +
                             '<span class="drawer-item-name">' + scene.name + '</span></a>';
        menuItem.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
          const targetEl = document.getElementById(scene.id);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        });
        drawerMenuList.appendChild(menuItem);
      });
    }

    // Scroll tracking
    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      scroller.setScrollProgress(progress);

      if (timelineFill) timelineFill.style.height = (progress * 100) + '%';
      if (timelineMarker) timelineMarker.style.top = (progress * 100) + '%';
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    // Intersection observer
    const sceneElements = document.querySelectorAll('.story-scene');
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.25
    };

    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const content = entry.target.querySelector('.scene-content');
        if (entry.isIntersecting) {
          if (content) content.classList.add('is-in-view');

          const sceneIdx = parseInt(entry.target.dataset.scene, 10);
          const sceneData = EXPEDITION_DATA.scenes[sceneIdx];

          if (sceneData) {
            if (chapterNumPill) chapterNumPill.textContent = 'SCENE ' + sceneData.number;
            if (chapterNamePill) chapterNamePill.textContent = sceneData.name;

            document.querySelectorAll('.timeline-node').forEach((node) => {
              node.classList.toggle('is-active', node.dataset.targetScene === sceneData.id);
            });
          }
        }
      });
    }, observerOptions);

    sceneElements.forEach((el) => sceneObserver.observe(el));

    // Drawer controls
    const openDrawer = () => {
      if (navDrawer) {
        navDrawer.classList.add('is-open');
        navDrawer.setAttribute('aria-hidden', 'false');
      }
    };

    const closeDrawer = () => {
      if (navDrawer) {
        navDrawer.classList.remove('is-open');
        navDrawer.setAttribute('aria-hidden', 'true');
      }
    };

    if (btnMenuToggle) btnMenuToggle.addEventListener('click', openDrawer);
    if (btnDrawerClose) btnDrawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // Photo lightbox
    const openPhotoModal = (imageKey) => {
      const data = EXPEDITION_DATA.images[imageKey];
      if (!data || !photoModal) return;

      if (modalImgElement) modalImgElement.src = data.src;
      if (modalImgTitle) modalImgTitle.textContent = data.title;
      if (modalImgDesc) modalImgDesc.textContent = data.caption;

      photoModal.classList.add('is-active');
      photoModal.setAttribute('aria-hidden', 'false');
    };

    const closePhotoModal = () => {
      if (photoModal) {
        photoModal.classList.remove('is-active');
        photoModal.setAttribute('aria-hidden', 'true');
      }
      if (modalImgElement) modalImgElement.src = '';
    };

    document.getElementById('inspect-dendera-card')?.addEventListener('click', () => openPhotoModal('dendera'));
    document.getElementById('inspect-tomb-card')?.addEventListener('click', () => openPhotoModal('tombSanctuary'));
    if (btnClosePhotoModal) btnClosePhotoModal.addEventListener('click', closePhotoModal);
    if (modalBackdropPhoto) modalBackdropPhoto.addEventListener('click', closePhotoModal);

    // Video modal
    const openVideoModal = () => {
      if (!videoModal) return;
      videoModal.classList.add('is-active');
      videoModal.setAttribute('aria-hidden', 'false');
      if (audioAtmosphere.isPlaying && audioAtmosphere.audio) {
        audioAtmosphere.audio.pause();
      }
      if (constructionVideoPlayer) {
        constructionVideoPlayer.currentTime = 0;
        constructionVideoPlayer.play().catch(() => {});
      }
    };

    const closeVideoModal = () => {
      if (videoModal) {
        videoModal.classList.remove('is-active');
        videoModal.setAttribute('aria-hidden', 'true');
      }
      if (constructionVideoPlayer) constructionVideoPlayer.pause();
      if (!audioAtmosphere.isMuted && audioAtmosphere.audio) {
        audioAtmosphere.audio.play().catch(() => {});
      }
    };

    if (btnConstructionModal) btnConstructionModal.addEventListener('click', openVideoModal);
    if (btnTriggerFilmModal) btnTriggerFilmModal.addEventListener('click', openVideoModal);
    if (btnViewConstructionFinale) btnViewConstructionFinale.addEventListener('click', openVideoModal);
    if (btnCloseVideoModal) btnCloseVideoModal.addEventListener('click', closeVideoModal);
    if (modalBackdropVideo) modalBackdropVideo.addEventListener('click', closeVideoModal);

    // Restart
    if (btnRestartJourney) {
      btnRestartJourney.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePhotoModal();
        closeVideoModal();
        closeDrawer();
      } else if (e.key === 'm' || e.key === 'M') {
        audioAtmosphere.toggle();
      }
    });
  }

  // Trigger on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEgyptExperience);
  } else {
    initEgyptExperience();
  }
})();
