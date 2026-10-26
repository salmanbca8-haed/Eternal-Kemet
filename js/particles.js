// Atmospheric Dust Particle & Sunlight Shimmer Overlay
export class AtmosphericParticles {
  constructor(canvasElement) {
    this.canvas = canvasElement;
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
    this.canvas.width = this.width;
    this.canvas.height = this.height;
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
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulseVal += p.pulseSpeed;

      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(223, 188, 127, ${currentAlpha})`;
      this.ctx.shadowBlur = p.radius * 3;
      this.ctx.shadowColor = 'rgba(199, 164, 106, 0.8)';
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}
