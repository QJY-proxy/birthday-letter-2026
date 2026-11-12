/* =========================================================
   草莓奶油友谊档案馆 · 交互脚本
   原生 JS，无外部依赖
   ========================================================= */
(function () {
  "use strict";

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const canHover = () => canHoverQuery.matches;

  /* -------------------------------------------------------
     小吐司
     ------------------------------------------------------- */
  const toastEl = $("#toast");
  const toastTextEl = $("#toastText");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastTextEl || !message) return;
    toastTextEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2700);
  }

  /* -------------------------------------------------------
     纸屑 / 爱心动画
     ------------------------------------------------------- */
  class CelebrationFX {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext("2d") : null;
      this.particles = [];
      this.frame = null;
      this.lastTimestamp = 0;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.colors = ["#ff8ea9", "#f3688d", "#ffd47d", "#ffe9a8", "#a8dfca", "#b9a7e8", "#fffaf0", "#ffc3d2"];
      this.hovering = canHover();
      this.bindEvents();
      this.resize();
    }

    bindEvents() {
      window.addEventListener("resize", () => this.resize(), { passive: true });
      if (canHover()) {
        let lastTrail = 0;
        window.addEventListener(
          "pointermove",
          (event) => {
            if (prefersReducedMotion() || event.pointerType === "touch") return;
            const now = performance.now();
            if (now - lastTrail < 80) return;
            lastTrail = now;
            this.spawnTrail(event.clientX, event.clientY);
          },
          { passive: true }
        );
      }
    }

    resize() {
      if (!this.canvas || !this.ctx) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    start() {
      if (this.frame || !this.ctx) return;
      this.lastTimestamp = performance.now();
      this.frame = requestAnimationFrame((timestamp) => this.tick(timestamp));
    }

    add(particle) {
      if (prefersReducedMotion()) return;
      if (this.particles.length > 440) this.particles.splice(0, this.particles.length - 440);
      this.particles.push(particle);
      this.start();
    }

    spawnTrail(x, y) {
      const shape = Math.random() > 0.45 ? "heart" : "dot";
      this.add({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.6,
        gravity: 0.012,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.06,
        size: 3.5 + Math.random() * 4.5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape,
        life: 680 + Math.random() * 420,
        ttl: 1100,
        wobble: Math.random() * Math.PI * 2
      });
    }

    burst(x, y, count = 38, options = {}) {
      if (prefersReducedMotion()) return;
      const power = options.power || 1;
      const palette = options.colors || this.colors;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.42;
        const speed = (2.3 + Math.random() * 7.4) * power;
        const shapeRoll = Math.random();
        const shape =
          shapeRoll > 0.7 ? "heart" : shapeRoll > 0.45 ? "star" : shapeRoll > 0.2 ? "rect" : "dot";
        const ttl = 1450 + Math.random() * 1050;
        this.add({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (options.upBias === false ? 0 : 2.6),
          gravity: 0.13 + Math.random() * 0.06,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.25,
          size: 4.5 + Math.random() * (options.big ? 10 : 6),
          color: palette[Math.floor(Math.random() * palette.length)],
          shape,
          life: ttl,
          ttl,
          wobble: Math.random() * Math.PI * 2
        });
      }
    }

    rain(count = 70, options = {}) {
      if (prefersReducedMotion()) return;
      const palette = options.colors || this.colors;
      for (let i = 0; i < count; i += 1) {
        const shapeRoll = Math.random();
        const shape =
          shapeRoll > 0.65 ? "heart" : shapeRoll > 0.35 ? "rect" : shapeRoll > 0.15 ? "dot" : "star";
        const ttl = 3100 + Math.random() * 2100;
        this.add({
          x: Math.random() * this.width,
          y: -30 - Math.random() * this.height * 0.4,
          vx: (Math.random() - 0.5) * 1.7,
          vy: 1.1 + Math.random() * 2.8,
          gravity: 0.024,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.13,
          size: 5 + Math.random() * 8,
          color: palette[Math.floor(Math.random() * palette.length)],
          shape,
          life: ttl,
          ttl,
          wobble: Math.random() * Math.PI * 2
        });
      }
    }

    heartsAt(x, y, count = 9) {
      if (prefersReducedMotion()) return;
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
        const speed = 0.8 + Math.random() * 2.2;
        const ttl = 950 + Math.random() * 700;
        this.add({
          x: x + (Math.random() - 0.5) * 18,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: -0.004,
          rotation: (Math.random() - 0.5) * 0.8,
          spin: (Math.random() - 0.5) * 0.04,
          size: 5 + Math.random() * 8,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          shape: "heart",
          life: ttl,
          ttl,
          wobble: Math.random() * Math.PI * 2
        });
      }
    }

    tick(timestamp) {
      if (!this.ctx) return;
      const rawDelta = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      const delta = clamp(rawDelta / 16.667, 0.1, 2.4);
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const particle = this.particles[i];
        particle.life -= rawDelta;
        if (particle.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        particle.vy += particle.gravity * delta;
        particle.vx *= 0.997;
        particle.vy *= 0.998;
        particle.x += (particle.vx + Math.sin((particle.life + particle.wobble) / 170) * 0.24) * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;
        const alpha = clamp(particle.life / Math.min(particle.ttl * 0.38, 700), 0, 1);
        this.drawParticle(particle, alpha);
        if (particle.y > this.height + 70 && particle.vy > 0) {
          this.particles.splice(i, 1);
        }
      }

      if (this.particles.length > 0) {
        this.frame = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
      } else {
        this.frame = null;
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }

    drawParticle(particle, alpha) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;

      if (particle.shape === "heart") {
        const size = particle.size / 10;
        ctx.scale(size, size);
        ctx.beginPath();
        ctx.moveTo(0, 4.3);
        ctx.bezierCurveTo(-1.1, 1.1, -5.7, 0.2, -5.7, -3);
        ctx.bezierCurveTo(-5.7, -5.7, -2, -6.8, 0, -3.7);
        ctx.bezierCurveTo(2, -6.8, 5.7, -5.7, 5.7, -3);
        ctx.bezierCurveTo(5.7, 0.2, 1.1, 1.1, 0, 4.3);
        ctx.fill();
      } else if (particle.shape === "star") {
        const outer = particle.size;
        const inner = outer * 0.45;
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const radius = i % 2 === 0 ? outer : inner;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (particle.shape === "rect") {
        const width = particle.size * 0.66;
        const height = particle.size * 1.25;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(-width / 2, -height / 2, width, height, 2);
        } else {
          ctx.rect(-width / 2, -height / 2, width, height);
        }
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.46, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const fx = new CelebrationFX($("#fxCanvas"));

  /* -------------------------------------------------------
     音乐盒 + 音效
     ------------------------------------------------------- */
  class BirthdaySound {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.sfxBus = null;
      this.enabled = false;
      this.noiseBuffer = null;
      this.audio = null;
      this.audioFadeTimer = null;
      this.audioPauseTimer = null;
      this.audioTargetVolume = 0.46;
      this.audioSource = "assets/audio/bgm-xiangjianni-v2.mp3";
      this.fallbackAudioSource = "assets/audio/xiangjianni-piano.mp3";
      this.usingFallbackAudio = false;
      this.audioErrorShown = false;
      this.wasPlayingBeforeHidden = false;
    }

    init() {
      if (this.ctx) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      try {
        const context = new AudioContextClass();
        this.ctx = context;
        this.master = context.createGain();
        this.master.gain.value = 0;
        this.master.connect(context.destination);

        this.sfxBus = context.createGain();
        this.sfxBus.gain.value = 0.66;
        this.sfxBus.connect(this.master);

        this.noiseBuffer = this.createNoiseBuffer();
        this.createBackgroundAudio();
        return true;
      } catch (error) {
        this.ctx = null;
        return false;
      }
    }

    createBackgroundAudio() {
      if (this.audio) return;
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = "none";
      this.audio.src = window.__birthdayBgmBlobUrl || this.audioSource;
      this.audio.volume = 0;
      this.audio.setAttribute("aria-hidden", "true");
      this.audio.style.display = "none";
      document.body.appendChild(this.audio);
      this.audio.addEventListener("error", () => {
        if (!this.usingFallbackAudio && this.fallbackAudioSource) {
          this.usingFallbackAudio = true;
          this.audio.src = this.fallbackAudioSource;
          this.audio.load();
          if (this.enabled) this.playMusic();
          return;
        }
        if (this.audioErrorShown) return;
        this.audioErrorShown = true;
        showToast("背景音乐加载失败，检查一下音频文件还在不在呀。");
      });
    }

    createNoiseBuffer() {
      if (!this.ctx) return null;
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    async enable() {
      if (!this.init()) return false;
      if (!this.ctx) return false;
      this.enabled = true;
      // Start the BGM in the same gesture turn so Safari/Chrome allow playback.
      this.playMusic();
      if (this.ctx.state === "suspended") {
        try {
          await this.ctx.resume();
        } catch (error) {
          // Effects can stay quiet; the BGM is still independent.
        }
      }
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.001), now);
      this.master.gain.exponentialRampToValueAtTime(0.9, now + 0.55);
      this.syncUI(true);
      return true;
    }

    disable() {
      this.enabled = false;
      this.stopMusic();
      if (this.ctx && this.master) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.001), now);
        this.master.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      }
      this.syncUI(false);
    }

    async toggle() {
      if (this.enabled) {
        this.disable();
        return false;
      }
      const enabled = await this.enable();
      if (!enabled) showToast("音乐暂时不肯出来，再点一次试试呀。");
      return enabled;
    }

    syncUI(enabled) {
      const button = $("#musicToggle");
      if (button) {
        button.setAttribute("aria-pressed", String(enabled));
        button.setAttribute(
          "aria-label",
          enabled ? "暂停背景音乐《想见你》" : "播放背景音乐《想见你》"
        );
        button.title = enabled ? "背景音乐：想见你（播放中）" : "背景音乐：想见你（已暂停）";
      }
      const footerButton = $("#footerMusic");
      if (footerButton) {
        footerButton.textContent = enabled ? "暂停《想见你》" : "播放《想见你》";
        footerButton.setAttribute(
          "aria-label",
          enabled ? "暂停背景音乐《想见你》" : "播放背景音乐《想见你》"
        );
      }
    }

    playMusic() {
      if (!this.audio) return;
      window.clearTimeout(this.audioPauseTimer);
      this.audioPauseTimer = null;
      this.fadeMusicTo(this.audioTargetVolume, 2000);
      if (this.audio.paused) {
        // On iOS, an audio element whose source was assigned with
        // preload="none" may need an explicit load() inside the gesture.
        if (this.audio.readyState === 0) this.audio.load();
        const playPromise = this.audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            this.enabled = false;
            this.syncUI(false);
            showToast("音乐还没准备好，再点一下播放键试试呀。");
          });
        }
      } else {
        this.audio.volume = Math.min(this.audio.volume, this.audioTargetVolume);
      }
    }

    duckForLetter() {
      if (!this.audio || !this.enabled) return;
      this.fadeMusicTo(0.2, 350);
    }

    restoreAfterLetter() {
      if (!this.audio || !this.enabled) return;
      this.fadeMusicTo(this.audioTargetVolume, 700);
      if (this.audio.paused) this.audio.play().catch(() => {});
    }

    fadeMusicTo(target, duration, onDone) {
      if (!this.audio) return;
      window.clearInterval(this.audioFadeTimer);
      const start = this.audio.volume;
      const durationMs = Math.max(60, duration);
      const startedAt = window.performance.now();
      this.audioFadeTimer = window.setInterval(() => {
        const progress = clamp((window.performance.now() - startedAt) / durationMs, 0, 1);
        this.audio.volume = clamp(start + (target - start) * progress, 0, 1);
        if (progress >= 1) {
          window.clearInterval(this.audioFadeTimer);
          this.audioFadeTimer = null;
          if (typeof onDone === "function") onDone();
        }
      }, 40);
    }

    stopMusic() {
      if (!this.audio) return;
      window.clearTimeout(this.audioPauseTimer);
      this.fadeMusicTo(0, 380, () => {
        this.audioPauseTimer = window.setTimeout(() => {
          if (!this.enabled && this.audio) this.audio.pause();
        }, 30);
      });
    }

    stopMusicImmediately() {
      window.clearInterval(this.audioFadeTimer);
      window.clearTimeout(this.audioPauseTimer);
      if (this.audio) this.audio.pause();
    }

    pauseForBackground() {
      if (!this.audio) return;
      this.wasPlayingBeforeHidden = !this.audio.paused;
      if (this.wasPlayingBeforeHidden) this.audio.pause();
    }

    resumeFromBackground() {
      if (!this.enabled || !this.audio || !this.wasPlayingBeforeHidden) return;
      this.wasPlayingBeforeHidden = false;
      this.playMusic();
    }

    midiToFrequency(midi) {
      return 440 * 2 ** ((midi - 69) / 12);
    }

    effect(type) {
      if (!this.enabled || !this.ctx || !this.sfxBus) return;
      const now = this.ctx.currentTime;
      if (type === "chime") {
        [84, 88, 91].forEach((midi, index) => {
          this.playEffectTone(midi, now + index * 0.075, 0.7, 0.12, "sine");
        });
      } else if (type === "sparkle") {
        this.playEffectTone(96, now, 0.45, 0.045, "sine");
        this.playEffectTone(100, now + 0.08, 0.4, 0.035, "sine");
      } else if (type === "pop") {
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(620, now);
        oscillator.frequency.exponentialRampToValueAtTime(230, now + 0.11);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
        oscillator.connect(gain);
        gain.connect(this.sfxBus);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
      } else if (type === "paper") {
        this.playNoise(now, 0.16, 0.06, 1800, "highpass");
      } else if (type === "whoosh") {
        this.playNoise(now, 0.7, 0.14, 700, "bandpass");
      } else if (type === "tick") {
        this.playEffectTone(76, now, 0.22, 0.05, "triangle");
      } else if (type === "hug") {
        [79, 83, 86, 91].forEach((midi, index) => {
          this.playEffectTone(midi, now + index * 0.09, 0.9, 0.08, "sine");
        });
      }
    }

    playEffectTone(midi, when, duration, peak, type) {
      if (!this.ctx || !this.sfxBus) return;
      const oscillator = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = this.midiToFrequency(midi);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(peak, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      oscillator.connect(gain);
      gain.connect(this.sfxBus);
      oscillator.start(when);
      oscillator.stop(when + duration + 0.05);
    }

    playNoise(when, duration, peak, frequency, filterType) {
      if (!this.ctx || !this.sfxBus || !this.noiseBuffer) return;
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType || "bandpass";
      filter.frequency.setValueAtTime(frequency || 800, when);
      filter.frequency.exponentialRampToValueAtTime(Math.max(180, (frequency || 800) * 0.35), when + duration);
      filter.Q.value = 0.9;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(peak, when + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxBus);
      source.start(when);
      source.stop(when + duration + 0.05);
    }
  }

  const sound = new BirthdaySound();

  // iOS/Safari needs a real gesture to start media. Start the BGM on the
  // first user click, even if the visitor skips the gift button.
  let ambientStartAttempted = false;
  const startAmbientOnFirstGesture = () => {
    if (ambientStartAttempted) return;
    ambientStartAttempted = true;
    if (!sound.enabled) sound.enable().catch(() => {});
  };
  document.addEventListener("click", startAmbientOnFirstGesture, { once: true });
  document.addEventListener("keydown", startAmbientOnFirstGesture, { once: true });

  /* -------------------------------------------------------
     开场：拆礼物
     ------------------------------------------------------- */
  const intro = $("#intro");
  const openGiftButton = $("#openGiftBtn");
  const skipIntroButton = $("#skipIntro");
  const giftScene = $("#giftScene");
  const musicToggle = $("#musicToggle");
  let introFinished = false;
  let introOpening = false;

  function openPage(reason) {
    if (introFinished) return;
    introFinished = true;
    window.clearTimeout(openPage.timeout);
    if (intro) {
      intro.classList.add("is-leaving");
      intro.setAttribute("aria-hidden", "true");
      intro.setAttribute("inert", "");
    }
    document.body.classList.remove("is-intro-open");
    document.body.classList.add("is-ready");
    if (intro) {
      window.setTimeout(() => {
        intro.hidden = true;
      }, prefersReducedMotion() ? 80 : 750);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    if (reason === "gift") {
      sound.enable();
    }
    // 把焦点交给页面开头，避免键盘焦点留在已经隐藏的开场里
    window.setTimeout(() => {
      const heroTitle = $("#heroTitle");
      if (heroTitle) {
        heroTitle.setAttribute("tabindex", "-1");
        heroTitle.focus({ preventScroll: true });
      }
    }, prefersReducedMotion() ? 100 : 900);
  }

  function openGift() {
    if (introOpening || introFinished) return;
    introOpening = true;
    if (intro) intro.classList.add("is-open");
    if (giftScene) giftScene.classList.add("is-open");
    if (openGiftButton) {
      openGiftButton.disabled = true;
      openGiftButton.style.opacity = "0";
      openGiftButton.style.pointerEvents = "none";
    }
    sound.enable();
    sound.effect("chime");

    const burstX = window.innerWidth * 0.7;
    const burstY = window.innerHeight * 0.49;
    fx.burst(burstX, burstY, 60, { power: 1.1, big: true });
    fx.rain(42);
    window.setTimeout(() => {
      fx.heartsAt(window.innerWidth * 0.5, window.innerHeight * 0.38, 18);
    }, 320);
    window.setTimeout(() => {
      openPage("gift");
    }, prefersReducedMotion() ? 130 : 1120);
  }

  function skipIntro() {
    if (introOpening || introFinished) return;
    introOpening = true;
    if (intro) intro.classList.add("is-leaving");
    openPage("skip");
  }

  if (openGiftButton) openGiftButton.addEventListener("click", openGift);
  if (giftScene) {
    giftScene.addEventListener("click", openGift);
    giftScene.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGift();
      }
    });
  }
  if (skipIntroButton) skipIntroButton.addEventListener("click", skipIntro);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && introOpening && !introFinished) {
      skipIntro();
    }
  });

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      sound.toggle();
    });
  }

  const footerMusic = $("#footerMusic");
  if (footerMusic) {
    footerMusic.addEventListener("click", () => {
      sound.toggle();
    });
  }

  /* -------------------------------------------------------
     星空
     ------------------------------------------------------- */
  const starField = $("#starField");
  if (starField) {
    const starCount = 72;
    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement("span");
      const isCross = i % 17 === 0;
      const isBig = i % 11 === 0;
      star.className = `star${isBig ? " star--big" : ""}${isCross ? " star--cross" : ""}`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 82}%`;
      star.style.setProperty("--star-size", `${isBig ? 3.5 : 1.2 + Math.random() * 1.6}px`);
      star.style.setProperty("--star-duration", `${2.8 + Math.random() * 4.8}s`);
      star.style.setProperty("--star-delay", `${Math.random() * -6}s`);
      star.style.setProperty("--star-opacity", `${0.3 + Math.random() * 0.65}`);
      starField.appendChild(star);
    }
  }

  /* -------------------------------------------------------
     滚动进度 / 导航 / 时间轴小伙伴
     ------------------------------------------------------- */
  const progressBar = $("#progressBar");
  const topbar = $("#topbar");
  const timeline = $("#timeline");
  const timelineBuddy = $("#timelineBuddy");
  const navLinks = $$(".main-nav a");
  const navSections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return null;
      const target = document.getElementById(href.slice(1));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  let scrollTicking = false;

  function updateScrollUI() {
    scrollTicking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(scrollTop / maxScroll, 0, 1);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (topbar) topbar.classList.toggle("is-scrolled", scrollTop > 45);

    let activeIndex = -1;
    navSections.forEach((item, index) => {
      if (item.target.getBoundingClientRect().top <= window.innerHeight * 0.34) {
        activeIndex = index;
      }
    });
    navLinks.forEach((link, index) => {
      link.classList.toggle("is-active", index === activeIndex);
    });

    if (timeline && timelineBuddy) {
      const rect = timeline.getBoundingClientRect();
      const travelStart = window.innerHeight * 0.35;
      const travelEnd = window.innerHeight * 0.7;
      const raw = (travelStart - rect.top) / Math.max(1, rect.height - 80);
      const progressOnLine = clamp(raw, 0, 1);
      const lineHeight = Math.max(40, rect.height - 90);
      timelineBuddy.style.top = `${18 + lineHeight * progressOnLine}px`;
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrollUI();

  /* -------------------------------------------------------
     入场观察
     ------------------------------------------------------- */
  const revealSelectors = [
    ".section-head",
    ".cuties-head",
    ".cuties-stage",
    ".cuties-note",
    ".certificate",
    ".stat-card",
    ".sugar-card",
    ".memory",
    ".beijing-board",
    ".life-board",
    ".coupon-board",
    ".cake-stage",
    ".blow-control",
    ".envelope-stage",
    ".future-note",
    ".finale-title",
    ".finale-copy",
    ".finale-actions",
    ".finale-photos",
    ".finale-signature"
  ];

  const revealElements = [];
  revealSelectors.forEach((selector) => {
    $$(selector).forEach((element) => {
      if (element.dataset.revealBound === "true") return;
      element.dataset.revealBound = "true";
      element.classList.add("will-reveal");
      revealElements.push(element);
    });
  });

  $$(".stat-card").forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${index * 70}ms`);
  });
  $$(".memory").forEach((memory, index) => {
    memory.style.setProperty("--reveal-delay", `${Math.min(index * 45, 140)}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* -------------------------------------------------------
     首屏照片轻微跟手
     ------------------------------------------------------- */
  const heroPhotos = $(".hero-photos");
  const photoBloom = $(".photo-bloom");
  if (heroPhotos && photoBloom && canHover()) {
    heroPhotos.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion()) return;
      const rect = heroPhotos.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      photoBloom.style.transform = `rotate(1.5deg) rotateX(${(-y * 3.8).toFixed(2)}deg) rotateY(${(x * 4.6).toFixed(2)}deg)`;
    });
    heroPhotos.addEventListener("pointerleave", () => {
      photoBloom.style.transform = "";
    });
  }

  /* -------------------------------------------------------
     抱抱彩蛋
     ------------------------------------------------------- */
  const hugMoment = $("#hugMoment");
  let hugTimer = null;

  function sendHug(originButton) {
    if (originButton) {
      const rect = originButton.getBoundingClientRect();
      fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 24, {
        power: 0.8,
        colors: ["#ff8ea9", "#f3688d", "#ffd47d", "#ffe9a8", "#fffaf0"]
      });
    }
    fx.rain(30, { colors: ["#ff8ea9", "#f3688d", "#ffd47d", "#fffaf0"] });
    sound.effect("hug");
    showToast("抱抱已送达，请注意查收 ♡");
    if (!hugMoment || prefersReducedMotion()) return;
    window.clearTimeout(hugTimer);
    hugMoment.classList.remove("is-active");
    void hugMoment.offsetWidth;
    hugMoment.classList.add("is-active");
    hugTimer = window.setTimeout(() => {
      hugMoment.classList.remove("is-active");
    }, 2600);
  }

  const heroHug = $("#heroHug");
  const finalHug = $("#finalHug");
  if (heroHug) heroHug.addEventListener("click", () => sendHug(heroHug));
  if (finalHug) finalHug.addEventListener("click", () => sendHug(finalHug));

  /* -------------------------------------------------------
     闺蜜证书盖章
     ------------------------------------------------------- */
  const certSeal = $("#certSeal");
  const certHint = $(".cert-hint");
  if (certSeal) {
    certSeal.addEventListener("click", () => {
      if (certSeal.getAttribute("aria-pressed") === "true") {
        showToast("已经盖好章啦，这份友谊永久有效。");
        return;
      }
      certSeal.setAttribute("aria-pressed", "true");
      certSeal.classList.add("is-stamped");
      certSeal.setAttribute("aria-label", "已盖章，友谊证书永久有效");
      const rect = certSeal.getBoundingClientRect();
      fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 34, { power: 0.75 });
      sound.effect("chime");
      sound.effect("pop");
      showToast("盖章成功：我们的友谊，永久有效！");
      if (certHint) certHint.textContent = "认证成功，不可以反悔哦 ♡";
    });
  }

  /* -------------------------------------------------------
     甜甜的话
     ------------------------------------------------------- */
  const compliments = [
    "你是我自己选的家人，<br>这件事我每天都很得意。",
    "你一笑，<br>我这边天气都晴了。",
    "全世界只有一个你，<br>所以我可珍惜了。",
    "你值得被偏心，<br>也值得所有好事。",
    "和你在一起，<br>连发呆都很有趣。",
    "今天的你，<br>比蛋糕还甜一点点。",
    "不管几岁，<br>你都可以在我这里当小孩。"
  ];
  const complimentText = $("#complimentText");
  const complimentBtn = $("#complimentBtn");
  let complimentIndex = 0;
  if (complimentText) complimentText.setAttribute("aria-live", "polite");
  if (complimentBtn && complimentText) {
    complimentBtn.addEventListener("click", () => {
      complimentIndex = (complimentIndex + 1) % compliments.length;
      complimentText.innerHTML = compliments[complimentIndex];
      complimentText.classList.remove("is-swapping");
      void complimentText.offsetWidth;
      complimentText.classList.add("is-swapping");
      const rect = complimentBtn.getBoundingClientRect();
      fx.heartsAt(rect.left + rect.width / 2, rect.top, 5);
      sound.effect("sparkle");
    });
  }

  /* -------------------------------------------------------
     可爱应援团：点一点听悄悄话
     ------------------------------------------------------- */
  const cuties = $$(".cutie");
  const cutieSpeech = $("#cutieSpeech");
  const cutieSpeaker = $("#cutieSpeaker");
  const cutiesBubble = $(".cuties-bubble");

  cuties.forEach((cutie) => {
    cutie.addEventListener("click", () => {
      if (!cutieSpeech) return;
      const name = cutie.dataset.name || "小可爱";
      const line = cutie.dataset.line || "今天也要超级开心呀。";
      cutieSpeech.textContent = line;
      if (cutieSpeaker) cutieSpeaker.textContent = `${name}小声说`;
      if (cutiesBubble) {
        cutiesBubble.classList.remove("is-talking");
        void cutiesBubble.offsetWidth;
        cutiesBubble.classList.add("is-talking");
      }
      cuties.forEach((item) => item.classList.remove("is-talking"));
      cutie.classList.add("is-talking");
      window.setTimeout(() => cutie.classList.remove("is-talking"), 620);
      const art = cutie.querySelector(".cutie-art");
      if (art) {
        const rect = art.getBoundingClientRect();
        fx.heartsAt(rect.left + rect.width / 2, rect.top + rect.height * 0.35, 5);
      }
      sound.effect("tick");
    });
  });

  /* -------------------------------------------------------
     回忆照片弹窗
     ------------------------------------------------------- */
  const memoryDialog = $("#memoryDialog");
  const memoryDialogImg = $("#memoryDialogImg");
  const memoryDialogFallback = memoryDialog ? memoryDialog.querySelector(".dialog-photo-fallback") : null;
  const memoryDialogTitle = $("#memoryDialogTitle");
  const memoryDialogChapter = $("#memoryDialogChapter");
  const memoryDialogText = $("#memoryDialogText");
  let memoryDialogLoadToken = 0;

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    document.body.classList.add("is-dialog-open");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-dialog-open");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    if (!document.querySelector("dialog[open]")) {
      document.body.classList.remove("is-dialog-open");
    }
  }

  $$("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      closeDialog(dialog);
    });
  });

  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]")) {
        document.body.classList.remove("is-dialog-open");
      }
    });
  });

  $$(".memory-photo, .gallery-photo").forEach((photoButton) => {
    photoButton.addEventListener("click", () => {
      if (!memoryDialog) return;
      const title = photoButton.dataset.title || "我们的回忆";
      const chapter = photoButton.dataset.chapter || "OUR MEMORY";
      const caption = photoButton.dataset.caption || "";
      const src = photoButton.dataset.src || "";
      if (memoryDialogTitle) memoryDialogTitle.textContent = title;
      if (memoryDialogChapter) memoryDialogChapter.textContent = chapter;
      if (memoryDialogText) memoryDialogText.textContent = caption;
      if (memoryDialogImg) {
        const sourceImg = photoButton.querySelector("img");
        const thumbSrc = sourceImg ? sourceImg.currentSrc || sourceImg.src : "";
        const token = ++memoryDialogLoadToken;
        memoryDialogImg.classList.add("is-missing");
        if (memoryDialogFallback) memoryDialogFallback.hidden = false;
        memoryDialogImg.alt = sourceImg?.alt || title;
        memoryDialogImg.onload = () => {
          if (token !== memoryDialogLoadToken) return;
          memoryDialogImg.classList.remove("is-missing");
          if (memoryDialogFallback) memoryDialogFallback.hidden = true;
        };
        memoryDialogImg.onerror = () => {
          if (token !== memoryDialogLoadToken) return;
          memoryDialogImg.classList.add("is-missing");
          if (memoryDialogFallback) memoryDialogFallback.hidden = false;
        };

        if (thumbSrc) {
          memoryDialogImg.src = thumbSrc;
          if (sourceImg && sourceImg.complete && sourceImg.naturalWidth) {
            memoryDialogImg.classList.remove("is-missing");
            if (memoryDialogFallback) memoryDialogFallback.hidden = true;
          }
        } else if (src) {
          memoryDialogImg.src = src;
        } else {
          memoryDialogImg.removeAttribute("src");
          if (memoryDialogFallback) memoryDialogFallback.hidden = false;
        }

        // The card thumbnail shows instantly; upgrade to the full-resolution
        // photo quietly once it is ready, without hiding the dialog again.
        if (src && src !== thumbSrc) {
          const fullImage = new Image();
          fullImage.onload = () => {
            if (token !== memoryDialogLoadToken) return;
            memoryDialogImg.src = src;
            memoryDialogImg.classList.remove("is-missing");
            if (memoryDialogFallback) memoryDialogFallback.hidden = true;
          };
          fullImage.src = src;
        }
      }
      memoryDialog.scrollTop = 0;
      openDialog(memoryDialog);
      sound.effect("paper");
    });
  });

  /* -------------------------------------------------------
     兑换券
     ------------------------------------------------------- */
  const coupons = $$(".coupon");
  const couponSecret = $("#couponSecret");
  let couponCelebrated = false;

  function updateCouponSecret() {
    if (!couponSecret) return;
    const allClaimed = coupons.length > 0 && coupons.every((coupon) => coupon.getAttribute("aria-pressed") === "true");
    couponSecret.classList.toggle("is-visible", allClaimed);
    couponSecret.setAttribute("aria-hidden", String(!allClaimed));
    if (allClaimed && !couponCelebrated) {
      couponCelebrated = true;
      window.setTimeout(() => {
        fx.rain(55);
        sound.effect("chime");
        showToast("四张券都收好啦，那就赖着你一辈子喽。");
      }, 240);
    }
    if (!allClaimed) couponCelebrated = false;
  }

  coupons.forEach((coupon) => {
    coupon.addEventListener("click", () => {
      if (coupon.getAttribute("aria-pressed") === "true") {
        showToast("这张券已经放进口袋啦，随时可以找我兑现。");
        return;
      }
      coupon.setAttribute("aria-pressed", "true");
      coupon.classList.add("is-claimed");
      const rect = coupon.getBoundingClientRect();
      fx.heartsAt(rect.left + rect.width * 0.72, rect.top + rect.height * 0.45, 8);
      fx.burst(rect.left + rect.width * 0.74, rect.top + rect.height * 0.5, 12, { power: 0.55 });
      sound.effect("paper");
      sound.effect("pop");
      if (coupon.dataset.message) showToast(coupon.dataset.message);
      updateCouponSecret();
    });
  });

  updateCouponSecret();

  /* -------------------------------------------------------
     生日蛋糕：吹蜡烛
     ------------------------------------------------------- */
  const wishSection = $("#wish");
  const candles = $$(".candle");
  const blowButton = $("#blowBtn");
  const wishReveal = $("#wishReveal");
  let candlesOut = 0;
  let wishCompleted = false;
  let isBlowing = false;

  if (wishReveal) wishReveal.setAttribute("aria-hidden", "true");

  function extinguishCandle(candle, silent) {
    if (!candle || candle.classList.contains("is-out") || wishCompleted) return;
    candle.classList.add("is-out");
    candlesOut += 1;
    if (!silent) {
      sound.effect("pop");
      const rect = candle.getBoundingClientRect();
      if (rect.width > 0) {
        const tinyPuff = document.createRange;
        fx.heartsAt(rect.left + rect.width / 2, rect.top + rect.height * 0.2, 2);
      }
    }
    if (candlesOut >= candles.length) completeWish();
  }

  function completeWish() {
    if (wishCompleted) return;
    wishCompleted = true;
    if (wishSection) wishSection.classList.add("is-wished");
    if (wishReveal) wishReveal.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      sound.effect("chime");
      sound.effect("sparkle");
      fx.rain(90);
      fx.burst(window.innerWidth * 0.5, window.innerHeight * 0.42, 45, { power: 0.9, big: true });
      showToast("愿望已经被星星签收啦，生日快乐！");
    }, 450);
  }

  candles.forEach((candle) => {
    candle.setAttribute("focusable", "true");
    candle.addEventListener("click", () => extinguishCandle(candle, false));
    candle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        extinguishCandle(candle, false);
      }
    });
  });

  if (blowButton) {
    blowButton.addEventListener("click", () => {
      if (wishCompleted || isBlowing) return;
      isBlowing = true;
      let index = 0;
      sound.effect("whoosh");
      const interval = window.setInterval(() => {
        if (index >= candles.length) {
          window.clearInterval(interval);
          isBlowing = false;
          return;
        }
        const candle = candles.find((item) => !item.classList.contains("is-out"));
        if (candle) extinguishCandle(candle, index > 0);
        index += 1;
        if (candlesOut >= candles.length) {
          window.clearInterval(interval);
          isBlowing = false;
        }
      }, 230);
    });
  }

  /* -------------------------------------------------------
     信封与信
     ------------------------------------------------------- */
  const letterDialog = $("#letterDialog");
  const openLetterBtn = $("#openLetterBtn");
  const letterHug = $("#letterHug");
  const letterHugMsg = $("#letterHugMsg");

  if (openLetterBtn) {
    openLetterBtn.addEventListener("click", () => {
      if (!letterDialog) return;
      letterDialog.scrollTop = 0;
      openDialog(letterDialog);
      sound.effect("paper");
      sound.effect("sparkle");
      const letterSheet = $(".letter-sheet", letterDialog);
      if (letterSheet) letterSheet.scrollTop = 0;
    });
  }

  if (letterHug) {
    letterHug.addEventListener("click", () => {
      const hugs = [
        "抱紧啦，不许松手。",
        "抱抱已经送到你怀里了，记得签收。",
        "再抱一下，这次抱久一点。",
        "抱好啦。今天的份量是：超级多。"
      ];
      const message = hugs[Math.floor(Math.random() * hugs.length)];
      if (letterHugMsg) letterHugMsg.textContent = message;
      letterHug.classList.add("is-hugging");
      window.setTimeout(() => letterHug.classList.remove("is-hugging"), 500);
      sound.effect("hug");
    });
  }

  /* -------------------------------------------------------
     未来清单
     ------------------------------------------------------- */
  const futureItems = $$(".future-item");
  const futureCount = $("#futureCount");
  const futureComplete = $("#futureComplete");
  let futureCelebrated = false;

  if (futureComplete) {
    futureComplete.setAttribute("aria-live", "polite");
  }

  function updateFutureList() {
    const doneCount = futureItems.filter((item) => item.classList.contains("is-done")).length;
    if (futureCount) futureCount.textContent = String(doneCount);
    const allDone = futureItems.length > 0 && doneCount === futureItems.length;
    if (futureComplete) futureComplete.classList.toggle("is-visible", allDone);
    if (allDone && !futureCelebrated) {
      futureCelebrated = true;
      window.setTimeout(() => {
        fx.rain(60);
        sound.effect("chime");
        showToast("六个未来都预约好啦，一个都不许反悔。");
      }, 220);
    }
    if (!allDone) futureCelebrated = false;
  }

  futureItems.forEach((item) => {
    item.addEventListener("click", () => {
      const nowPressed = item.getAttribute("aria-pressed") !== "true";
      item.setAttribute("aria-pressed", String(nowPressed));
      item.classList.toggle("is-done", nowPressed);
      if (nowPressed) {
        const rect = item.getBoundingClientRect();
        fx.heartsAt(rect.left + 15, rect.top + rect.height / 2, 3);
        sound.effect("tick");
      }
      updateFutureList();
    });
  });

  updateFutureList();

  /* -------------------------------------------------------
     小按钮上的碎屑反馈
     ------------------------------------------------------- */
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-primary, .btn-glow, .sugar-btn, .skip-link");
    if (!button || button.disabled) return;
    if (prefersReducedMotion()) return;
    if (!button.classList.contains("btn-open")) {
      const rect = button.getBoundingClientRect();
      fx.heartsAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 3);
    }
  });

  /* -------------------------------------------------------
     页面关闭特效前顺手处理一下
     ------------------------------------------------------- */
  let bgmWasPlayingBeforeLetter = false;

  window.addEventListener("lettervoice-bgm-duck", () => {
    bgmWasPlayingBeforeLetter = Boolean(sound.enabled && sound.audio && !sound.audio.paused);
    if (bgmWasPlayingBeforeLetter) sound.duckForLetter();
  });

  window.addEventListener("lettervoice-bgm-restore", () => {
    if (!bgmWasPlayingBeforeLetter) return;
    bgmWasPlayingBeforeLetter = false;
    sound.restoreAfterLetter();
  });

  window.addEventListener("pagehide", () => {
    sound.stopMusicImmediately();
  });

  // Do not pause the BGM when the tab loses focus or an in-page dialog
  // opens. The letter voice only ducks it, then restores it on close.
})();
