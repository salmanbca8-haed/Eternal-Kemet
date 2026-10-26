// Main Application Coordinator
import '../css/style.css';
import { EXPEDITION_DATA } from './manifest.js';
import { CinematicScroller } from './scroller.js';
import { AtmosphericParticles } from './particles.js';
import { AudioAtmosphere } from './audio.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Elements
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

  // 2. Initialize Subsystems
  const audioAtmosphere = new AudioAtmosphere('ambient-audio', 'btn-sound-toggle');
  const particles = new AtmosphericParticles(dustCanvas);

  // 3. Initialize Scroller with Progress Updates
  const scroller = new CinematicScroller(scrollCanvas, (progressPct) => {
    if (introProgressFill) {
      introProgressFill.style.width = `${progressPct}%`;
    }
    if (introStatusText) {
      introStatusText.textContent = `Summoning the Sands of Time (${progressPct}%)`;
    }
  });

  // Preload initial frames batch
  await scroller.preloadInitialBatch(25);

  if (introStatusText) {
    introStatusText.textContent = 'The Gates of Kemet are Open';
  }
  if (btnEnter) btnEnter.disabled = false;
  if (btnEnterMuted) btnEnterMuted.disabled = false;

  // 4. Enter Buttons Handling
  const enterExperience = async (withSound) => {
    introScreen.classList.add('is-hidden');
    document.body.classList.remove('is-loading');

    if (withSound) {
      await audioAtmosphere.startWithSound();
    } else {
      audioAtmosphere.startMuted();
    }

    particles.start();
  };

  btnEnter.addEventListener('click', () => enterExperience(true));
  btnEnterMuted.addEventListener('click', () => enterExperience(false));

  // 5. Build Timeline Rail Nodes & Drawer Menu Items
  EXPEDITION_DATA.scenes.forEach((scene, idx) => {
    // Side Timeline node
    const nodeBtn = document.createElement('button');
    nodeBtn.className = `timeline-node ${idx === 0 ? 'is-active' : ''}`;
    nodeBtn.dataset.targetScene = scene.id;
    nodeBtn.setAttribute('aria-label', `Navigate to ${scene.name}`);
    nodeBtn.innerHTML = `
      <span class="node-dot">${scene.roman}</span>
      <span class="node-label">${scene.name}</span>
    `;
    nodeBtn.addEventListener('click', () => {
      const targetEl = document.getElementById(scene.id);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    });
    timelineNodes.appendChild(nodeBtn);

    // Drawer menu item
    const menuItem = document.createElement('li');
    menuItem.innerHTML = `
      <a href="#${scene.id}" class="drawer-item-link">
        <span class="drawer-item-num">${scene.number}</span>
        <span class="drawer-item-name">${scene.name}</span>
      </a>
    `;
    menuItem.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
      const targetEl = document.getElementById(scene.id);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    });
    drawerMenuList.appendChild(menuItem);
  });

  // 6. Scroll Tracking & Scroller Sync
  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

    scroller.setScrollProgress(progress);

    // Update side timeline progress line
    if (timelineFill) {
      timelineFill.style.height = `${progress * 100}%`;
    }
    if (timelineMarker) {
      timelineMarker.style.top = `${progress * 100}%`;
    }
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // 7. Intersection Observer for Scene Reveals & Active Chapter Indicators
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
          if (chapterNumPill) chapterNumPill.textContent = `SCENE ${sceneData.number}`;
          if (chapterNamePill) chapterNamePill.textContent = sceneData.name;

          // Update side rail active node
          document.querySelectorAll('.timeline-node').forEach((node) => {
            node.classList.toggle('is-active', node.dataset.targetScene === sceneData.id);
          });
        }
      }
    });
  }, observerOptions);

  sceneElements.forEach((el) => sceneObserver.observe(el));

  // 8. Drawer Toggle Controls
  const openDrawer = () => {
    navDrawer.classList.add('is-open');
    navDrawer.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    navDrawer.classList.remove('is-open');
    navDrawer.setAttribute('aria-hidden', 'true');
  };

  btnMenuToggle.addEventListener('click', openDrawer);
  btnDrawerClose.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  // 9. Photo Lightbox Functionality
  const openPhotoModal = (imageKey) => {
    const data = EXPEDITION_DATA.images[imageKey];
    if (!data) return;

    modalImgElement.src = data.src;
    modalImgTitle.textContent = data.title;
    modalImgDesc.textContent = data.caption;

    photoModal.classList.add('is-active');
    photoModal.setAttribute('aria-hidden', 'false');
  };

  const closePhotoModal = () => {
    photoModal.classList.remove('is-active');
    photoModal.setAttribute('aria-hidden', 'true');
    modalImgElement.src = '';
  };

  document.getElementById('inspect-dendera-card')?.addEventListener('click', () => openPhotoModal('dendera'));
  document.getElementById('inspect-tomb-card')?.addEventListener('click', () => openPhotoModal('tombSanctuary'));
  btnClosePhotoModal.addEventListener('click', closePhotoModal);
  modalBackdropPhoto.addEventListener('click', closePhotoModal);

  // 10. Pyramid Construction Video Modal
  const openVideoModal = () => {
    videoModal.classList.add('is-active');
    videoModal.setAttribute('aria-hidden', 'false');
    // Pause background audio to let documentary sound play cleanly
    if (audioAtmosphere.isPlaying) {
      audioAtmosphere.audio.pause();
    }
    constructionVideoPlayer.currentTime = 0;
    constructionVideoPlayer.play().catch(() => {});
  };

  const closeVideoModal = () => {
    videoModal.classList.remove('is-active');
    videoModal.setAttribute('aria-hidden', 'true');
    constructionVideoPlayer.pause();
    // Resume background audio if not muted
    if (!audioAtmosphere.isMuted) {
      audioAtmosphere.audio.play().catch(() => {});
    }
  };

  btnConstructionModal?.addEventListener('click', openVideoModal);
  btnTriggerFilmModal?.addEventListener('click', openVideoModal);
  btnViewConstructionFinale?.addEventListener('click', openVideoModal);
  btnCloseVideoModal?.addEventListener('click', closeVideoModal);
  modalBackdropVideo?.addEventListener('click', closeVideoModal);

  // 11. Restart Journey Action
  btnRestartJourney?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 12. Keyboard Controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePhotoModal();
      closeVideoModal();
      closeDrawer();
    } else if (e.key === 'm' || e.key === 'M') {
      audioAtmosphere.toggle();
    }
  });
});
