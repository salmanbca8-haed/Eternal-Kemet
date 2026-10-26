// Ancient Egypt Ambient Soundtrack Controller
export class AudioAtmosphere {
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

  // Called when user clicks "Enter Egypt with Sound"
  async startWithSound() {
    this.isMuted = false;
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

  // Called if user clicks "Explore Muted"
  startMuted() {
    this.isMuted = true;
    this.isPlaying = false;
    this.audio.volume = 0;
    this.updateUI(false);
  }

  fadeIn(durationMs = 1500) {
    clearInterval(this.fadeInterval);
    const steps = 30;
    const stepTime = durationMs / steps;
    const volInc = this.targetVolume / steps;

    this.fadeInterval = setInterval(() => {
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
    const volDec = this.audio.volume / steps;

    return new Promise((resolve) => {
      this.fadeInterval = setInterval(() => {
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
        await this.audio.play();
        this.isPlaying = true;
        this.fadeIn();
        this.updateUI(true);
      } catch (err) {
        console.warn('Playback error', err);
      }
    } else {
      await this.fadeOut();
      this.audio.pause();
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
