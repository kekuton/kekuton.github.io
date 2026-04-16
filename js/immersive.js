import { app } from './core.js';

const { ui, state } = app;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

function seededColor(index, alpha = 0.26) {
  const darkPalette = [
    `rgba(255,255,255,${alpha})`,
    `rgba(255,210,238,${alpha * 0.95})`,
    `rgba(197,208,255,${alpha * 0.92})`,
    `rgba(196,168,255,${alpha * 0.9})`,
    `rgba(167,243,255,${alpha * 0.9})`
  ];
  const lightPalette = [
    `rgba(139,92,246,${alpha * 0.85})`,
    `rgba(236,72,153,${alpha * 0.72})`,
    `rgba(59,130,246,${alpha * 0.68})`,
    `rgba(255,255,255,${alpha * 1.2})`
  ];
  return (document.body.classList.contains('light') ? lightPalette : darkPalette)[index % (document.body.classList.contains('light') ? lightPalette.length : darkPalette.length)];
}

export const audio = {
  ctx: null,
  masterGain: null,
  ambientNodes: null,
  unlocked: false,
  init() {
    const unlock = () => this.unlock();
    ['pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
      window.addEventListener(eventName, unlock, { passive: true, once: true });
    });
    document.addEventListener('visibilitychange', () => this.syncAmbient());
  },
  ensureContext() {
    if (this.ctx) return this.ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.14;
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  },
  async unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      this.unlocked = ctx.state === 'running';
      this.syncAmbient();
    } catch {
      this.unlocked = false;
    }
  },
  setEnabled(enabled) {
    if (!enabled) {
      this.stopAmbient();
      return;
    }
    this.unlock();
  },
  syncAmbient() {
    if (!state.settings.sound || document.hidden) {
      this.stopAmbient();
      return;
    }
    if (!this.unlocked || !this.ctx || this.ctx.state !== 'running') return;
    if (this.ambientNodes) return;
    this.startAmbient();
  },
  startAmbient() {
    const ctx = this.ctx;
    if (!ctx || this.ambientNodes) return;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.6;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.0001;
    padGain.connect(filter);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 196;
    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = 293.66;
    const oscC = ctx.createOscillator();
    oscC.type = 'sine';
    oscC.frequency.value = 392;

    const gainA = ctx.createGain(); gainA.gain.value = 0.015;
    const gainB = ctx.createGain(); gainB.gain.value = 0.011;
    const gainC = ctx.createGain(); gainC.gain.value = 0.006;

    oscA.connect(gainA).connect(padGain);
    oscB.connect(gainB).connect(padGain);
    oscC.connect(gainC).connect(padGain);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(padGain.gain);

    filter.connect(this.masterGain);

    const now = ctx.currentTime;
    padGain.gain.cancelScheduledValues(now);
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.linearRampToValueAtTime(0.048, now + 2.4);

    [oscA, oscB, oscC, lfo].forEach((node) => node.start());
    this.ambientNodes = { oscA, oscB, oscC, lfo, padGain, filter, lfoGain };
  },
  stopAmbient() {
    const nodes = this.ambientNodes;
    if (!nodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      nodes.padGain.gain.cancelScheduledValues(now);
      nodes.padGain.gain.setValueAtTime(nodes.padGain.gain.value, now);
      nodes.padGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      [nodes.oscA, nodes.oscB, nodes.oscC, nodes.lfo].forEach((node) => node.stop(now + 0.4));
    } catch {}
    this.ambientNodes = null;
  },
  playCardTransition(kind = 'question') {
    if (!state.settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      this.unlock();
      if (ctx.state === 'suspended') return;
    }
    const now = ctx.currentTime;
    const shimmer = ctx.createOscillator();
    shimmer.type = kind === 'blitz' ? 'triangle' : 'sine';
    shimmer.frequency.setValueAtTime(kind === 'blitz' ? 420 : 360, now);
    shimmer.frequency.exponentialRampToValueAtTime(kind === 'blitz' ? 690 : 540, now + 0.24);

    const accent = ctx.createOscillator();
    accent.type = 'triangle';
    accent.frequency.setValueAtTime(kind === 'blitz' ? 580 : 490, now);
    accent.frequency.exponentialRampToValueAtTime(kind === 'blitz' ? 920 : 760, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(kind === 'blitz' ? 0.04 : 0.026, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = kind === 'blitz' ? 1500 : 1100;
    filter.Q.value = 0.9;

    shimmer.connect(gain);
    accent.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    shimmer.start(now);
    accent.start(now + 0.015);
    shimmer.stop(now + 0.45);
    accent.stop(now + 0.32);
  }
};

export const motionFx = {
  canvas: ui.motionCanvas,
  ctx: null,
  width: 0,
  height: 0,
  raf: 0,
  particles: [],
  tiltX: 0,
  tiltY: 0,
  targetTiltX: 0,
  targetTiltY: 0,
  lastFrame: 0,
  permissionRequested: false,
  orientationBound: false,
  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.resize();
    this.seedParticles();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (event) => this.onPointerMove(event), { passive: true });
    window.addEventListener('pointerleave', () => this.resetTilt(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
    ['pointerdown', 'touchstart'].forEach((eventName) => {
      window.addEventListener(eventName, () => this.enableOrientation(), { passive: true, once: true });
    });
    this.setEnabled(state.settings.motionFx !== false);
    this.start();
  },
  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.particles.length) this.seedParticles();
  },
  seedParticles() {
    const count = Math.max(22, Math.min(40, Math.round((window.innerWidth || 360) / 18)));
    this.particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * (this.width || window.innerWidth || 360),
      y: Math.random() * (this.height || window.innerHeight || 640),
      size: 5 + Math.random() * 15,
      speed: 0.16 + Math.random() * 0.42,
      drift: (Math.random() - 0.5) * 0.7,
      sway: 0.5 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.014,
      depth: 0.55 + Math.random() * 0.9,
      alpha: 0.12 + Math.random() * 0.22,
      shape: ['petal', 'star', 'diamond', 'orb'][index % 4],
      colorIndex: index
    }));
  },
  setEnabled(enabled) {
    const active = enabled !== false;
    if (this.canvas) this.canvas.classList.toggle('is-hidden', !active);
    state.settings.motionFx = active;
    if (!active) {
      this.stop();
      this.clear();
      return;
    }
    this.start();
  },
  enableOrientation() {
    if (this.permissionRequested || !state.settings.motionFx) return;
    this.permissionRequested = true;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then((result) => {
            if (result === 'granted') this.attachOrientation();
          })
          .catch(() => {});
        return;
      }
      if ('DeviceOrientationEvent' in window) this.attachOrientation();
    } catch {}
  },
  attachOrientation() {
    if (this.orientationBound) return;
    this.orientationBound = true;
    window.addEventListener('deviceorientation', (event) => this.onOrientation(event), true);
  },
  onOrientation(event) {
    if (!state.settings.motionFx) return;
    if (typeof event.gamma !== 'number' && typeof event.beta !== 'number') return;
    this.targetTiltX = clamp((event.gamma || 0) / 28, -1.25, 1.25);
    this.targetTiltY = clamp((event.beta || 0) / 42, -1.0, 1.0);
  },
  onPointerMove(event) {
    if (!state.settings.motionFx || this.orientationBound) return;
    this.targetTiltX = clamp(((event.clientX / Math.max(this.width, 1)) - 0.5) * 1.6, -0.9, 0.9);
    this.targetTiltY = clamp(((event.clientY / Math.max(this.height, 1)) - 0.5) * 1.2, -0.7, 0.7);
  },
  resetTilt() {
    if (this.orientationBound) return;
    this.targetTiltX = 0;
    this.targetTiltY = 0;
  },
  clear() {
    this.ctx?.clearRect(0, 0, this.width, this.height);
  },
  drawParticle(particle, time) {
    const ctx = this.ctx;
    const offsetX = this.tiltX * 14 * particle.depth;
    const offsetY = this.tiltY * 9 * particle.depth;
    const x = particle.x + offsetX + Math.sin(time * 0.00075 * particle.sway + particle.phase) * 10 * particle.depth;
    const y = particle.y + offsetY;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(particle.rot);
    ctx.fillStyle = seededColor(particle.colorIndex, particle.alpha);
    ctx.strokeStyle = seededColor(particle.colorIndex + 1, particle.alpha * 0.9);
    ctx.lineWidth = 1;
    switch (particle.shape) {
      case 'petal':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 0.8);
        ctx.quadraticCurveTo(particle.size * 0.55, -particle.size * 0.2, 0, particle.size * 0.95);
        ctx.quadraticCurveTo(-particle.size * 0.7, -particle.size * 0.15, 0, -particle.size * 0.8);
        ctx.fill();
        break;
      case 'star':
        ctx.beginPath();
        for (let index = 0; index < 4; index += 1) {
          const angle = (Math.PI / 2) * index;
          const outer = particle.size;
          const inner = particle.size * 0.34;
          ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
          ctx.lineTo(Math.cos(angle + Math.PI / 4) * inner, Math.sin(angle + Math.PI / 4) * inner);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size);
        ctx.lineTo(particle.size * 0.7, 0);
        ctx.lineTo(0, particle.size);
        ctx.lineTo(-particle.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.44, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  },
  frame(timestamp) {
    if (!state.settings.motionFx || document.hidden || !this.ctx) {
      this.raf = 0;
      return;
    }
    const dt = Math.min(32, Math.max(10, timestamp - (this.lastFrame || timestamp)));
    this.lastFrame = timestamp;
    this.tiltX = lerp(this.tiltX, this.targetTiltX, 0.06);
    this.tiltY = lerp(this.tiltY, this.targetTiltY, 0.06);
    this.clear();
    this.particles.forEach((particle, index) => {
      particle.y += particle.speed * (dt * 0.06) * (1 + particle.depth * 0.5);
      particle.x += particle.drift + Math.sin(timestamp * 0.00055 + particle.phase) * 0.06 * particle.sway;
      particle.rot += particle.rotSpeed * dt;
      if (particle.y - particle.size > this.height + 24) {
        particle.y = -20 - particle.size;
        particle.x = Math.random() * this.width;
      }
      if (particle.x < -40) particle.x = this.width + 20;
      if (particle.x > this.width + 40) particle.x = -20;
      this.drawParticle(particle, timestamp + index * 12);
    });
    this.raf = window.requestAnimationFrame((next) => this.frame(next));
  },
  start() {
    if (this.raf || !state.settings.motionFx || document.hidden || !this.ctx) return;
    this.lastFrame = performance.now();
    this.raf = window.requestAnimationFrame((timestamp) => this.frame(timestamp));
  },
  stop() {
    if (!this.raf) return;
    window.cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
};

Object.assign(app, { audio, motionFx });
