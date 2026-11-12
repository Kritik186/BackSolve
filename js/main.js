/* BackSolve AI — site behaviour.
   No dependencies. Everything here is progressive enhancement:
   the page is fully readable with JavaScript switched off, and every
   animation is skipped for visitors who ask their device to reduce motion. */

(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // CONFIG — fill these in before launch.
  // ---------------------------------------------------------------------
  const CONFIG = {
    // Your business email. The contact form opens the visitor's mail app
    // with a pre-filled message to this address.
    email: '',
    // Optional: a Cal.com / Calendly link. If set, every "Book a call"
    // button opens it in a new tab instead of scrolling to the form.
    bookingUrl: '',
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasObserver = 'IntersectionObserver' in window;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const token = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;

  // --- One frame loop --------------------------------------------------------
  // Everything that draws per frame registers here, so the page runs a single
  // requestAnimationFrame and stops it when nothing needs it.
  const frameTasks = new Set();
  let frameId = 0;
  const runFrame = (now) => {
    frameId = 0;
    frameTasks.forEach((task) => task(now));
    if (frameTasks.size) frameId = requestAnimationFrame(runFrame);
  };
  const startTask = (task) => {
    frameTasks.add(task);
    if (!frameId) frameId = requestAnimationFrame(runFrame);
  };
  const stopTask = (task) => frameTasks.delete(task);

  // --- Scroll state ------------------------------------------------------------
  // Read once per frame and shared: position, viewport height and speed (px/ms).
  const scroll = { y: window.scrollY, viewH: window.innerHeight, velocity: 0 };
  const scrollWatchers = [];
  let scrollQueued = false;
  let lastY = scroll.y;
  let lastT = performance.now();
  const readScroll = () => {
    scrollQueued = false;
    const now = performance.now();
    const y = window.scrollY;
    scroll.velocity = (y - lastY) / Math.max(8, now - lastT);
    lastY = y;
    lastT = now;
    scroll.y = y;
    scroll.viewH = window.innerHeight;
    scrollWatchers.forEach((watcher) => watcher());
  };
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(readScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  const watchScroll = (watcher) => {
    scrollWatchers.push(watcher);
    watcher();
  };

  // --- Scroll progress bar and header state --------------------------------
  const bar = document.getElementById('progress-bar');
  const header = document.getElementById('site-header');
  watchScroll(() => {
    const max = root.scrollHeight - scroll.viewH;
    const progress = max > 0 ? Math.min(1, scroll.y / max) : 0;
    if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    if (header) header.classList.toggle('is-scrolled', scroll.y > 24);
  });

  // --- Header mark ---------------------------------------------------------------
  // The mark spins while the page scrolls (about one turn per 1000px), then
  // comes to rest upright. Hovering the name fires the line out of the loop again.
  const brand = header ? header.querySelector('.brand') : null;
  const mark = brand ? brand.querySelector('.brand__mark') : null;
  if (mark && !reduceMotion) {
    let turn = 0;
    let speed = 0;      // px per ms, copied from the scroll and left to fade
    let lastSpin = 0;
    const spinMark = (now) => {
      const dt = lastSpin ? Math.min(64, now - lastSpin) : 16;
      lastSpin = now;
      if (Math.abs(speed) > 0.02) {
        turn += speed * dt * 0.36;
        speed *= 0.9;
      } else {
        const rest = Math.round(turn / 360) * 360;
        turn += (rest - turn) * 0.12;
        if (Math.abs(rest - turn) < 0.3) {
          turn = 0;
          lastSpin = 0;
          mark.style.transform = '';
          stopTask(spinMark);
          return;
        }
      }
      mark.style.transform = `rotate(${turn.toFixed(1)}deg)`;
    };
    watchScroll(() => {
      if (Math.abs(scroll.velocity) < 0.02) return;
      speed = scroll.velocity;
      startTask(spinMark);
    });

    const beam = brand.querySelector('.brand__beam');
    if (beam && beam.animate) {
      brand.addEventListener('pointerenter', () => {
        beam.animate({ strokeDashoffset: [1, 0] }, { duration: 500, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
      });
    }
  }

  // --- Scroll reveals --------------------------------------------------------
  // [data-reveal]  fades and slides up as a block.
  // [data-stagger] reveals its children one after another.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  const revealTargets = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (reduceMotion || !hasObserver) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  // --- Hero --------------------------------------------------------------------
  // `hero` is the home page's opening section. `sky` is whatever opens the
  // current page (the hero, or the head of an inner page): it gets the stars.
  const hero = document.querySelector('.hero');
  const sky = hero || document.querySelector('.pagehead');

  // Stars drift behind the headline, shift with the pointer, and now and then
  // one shoots across in the same direction as the beam.
  const makeStars = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return null;
    canvas.className = 'hero__stars';
    canvas.setAttribute('aria-hidden', 'true');
    sky.insertBefore(canvas, sky.firstChild);

    const near = token('--ice', '#DCEBFF');
    const far = token('--sky', '#9CC2FF');
    const DIR_X = 0.9703;   // the beam's heading, so shooting stars echo it
    const DIR_Y = -0.2419;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let ratio = 1;
    let stars = [];
    let clearTop = 0;       // px of open sky above the hero text
    let shot = null;
    let nextShot = performance.now() + 2600;
    let last = 0;

    const build = () => {
      width = sky.clientWidth;
      height = sky.clientHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const copy = sky.querySelector('.hero__copy > *');
      clearTop = copy ? copy.getBoundingClientRect().top - sky.getBoundingClientRect().top : 0;
      const count = clamp(Math.round((width * height) / 8000), 50, 200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        depth: 0.25 + Math.random() * 0.75,
        size: 0.6 + Math.random() * 1.1,
        alpha: 0.35 + Math.random() * 0.6,
        phase: Math.random() * 6.283,
        speed: 0.4 + Math.random() * 1.4,
      }));
    };

    const draw = (now) => {
      const time = now / 1000;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const drift = time * 5 * star.depth;
        const x = ((((star.x * width - drift) % width) + width) % width) - pointer.x * 30 * star.depth;
        const y = star.y * height - pointer.y * 20 * star.depth;
        ctx.globalAlpha = star.alpha * (0.6 + 0.4 * Math.sin(time * star.speed + star.phase));
        ctx.fillStyle = star.depth > 0.75 ? near : far;
        ctx.beginPath();
        ctx.arc(x, y, star.size * star.depth, 0, 6.2832);
        ctx.fill();
      }

      // Shooting stars keep to open sky so they never run through the text:
      // the strip above the headline, or the far left and right edges.
      // Phones have no open sky to spare, so they get none.
      if (!shot && now > nextShot && now > 0 && width >= 760) {
        const lane = Math.random();
        if (lane < 0.6 && clearTop > 110) {
          shot = { x: width * (0.05 + Math.random() * 0.65), y: clearTop * 0.55 + Math.random() * (clearTop * 0.45 - 14), travel: 460 };
        } else if (lane < 0.8) {
          shot = { x: width * (0.01 + Math.random() * 0.04), y: height * (0.25 + Math.random() * 0.3), travel: 300 };
        } else {
          shot = { x: width * (0.78 + Math.random() * 0.06), y: height * (0.25 + Math.random() * 0.3), travel: 300 };
        }
        shot.age = 0;
        shot.life = 900 + Math.random() * 500;
        shot.tail = 130 + Math.random() * 110;
      }
      if (shot) {
        shot.age += dt;
        const k = shot.age / shot.life;
        if (k >= 1) {
          shot = null;
          nextShot = now + 3200 + Math.random() * 5200;
        } else {
          const travel = shot.travel * k;
          const headX = shot.x + DIR_X * travel;
          const headY = shot.y + DIR_Y * travel;
          const length = shot.tail * Math.min(1, k * 4);
          const tailX = headX - DIR_X * length;
          const tailY = headY - DIR_Y * length;
          const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(1, '#FFFFFF');
          ctx.globalAlpha = Math.sin(k * Math.PI);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    build();
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        build();
        if (reduceMotion) draw(0);
      }).observe(sky);
    }
    return { draw, pointer };
  };

  // A stream of light particles flows round the ring. Most stay on the loop; a
  // few peel off at the start of the beam and escape along it. The particles
  // part around the pointer, and a burst scatters from the tip of the beam
  // whenever a spark arrives there.
  // Everything is worked out in the ring's own coordinates (see .orbit in the
  // HTML): centre 720,1480, radius 800, beam from 526.5,703.8 to 1302.5,510.2.
  const makeFlow = (orbit) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    const topLayer = orbit.querySelector('.orbit__top');
    if (!ctx || !topLayer) return null;
    canvas.className = 'orbit__flow';
    canvas.setAttribute('aria-hidden', 'true');
    orbit.insertBefore(canvas, topLayer);   // under the beam and the bottom fade

    const CX = 720;
    const CY = 1480;
    const R = 800;
    const START = -14;                      // degrees from the top where the beam leaves the ring
    const OX = 526.5;                       // the beam's origin, direction and length
    const OY = 703.8;
    const UX = 0.9703;
    const UY = -0.2419;
    const LENGTH = 799.8;
    const WINDOW = 52;                      // degrees either side of the top that can be on screen
    const BASE_SPEED = 3.75;                // degrees per second: the same pace as the ring's lights
    const colours = [token('--ice', '#DCEBFF'), token('--sky', '#9CC2FF'), '#FFFFFF'];
    const state = { rate: 1, pointer: null };
    let scale = 1;                          // canvas pixels per ring unit
    let last = 0;
    let particles = [];
    let bursts = [];

    const toRing = (particle, fresh) => {
      const rim = Math.random() < 0.76;     // most ride the rim, the rest drift just inside it
      particle.mode = 'ring';
      particle.angle = fresh ? -WINDOW + Math.random() * WINDOW * 2 : -WINDOW;
      particle.offset = rim ? -5 + Math.random() * 8 : -34 + Math.random() * 28;
      particle.speed = BASE_SPEED * (0.55 + Math.random() * 1.35);
      particle.alpha = rim ? 0.5 + Math.random() * 0.5 : 0.14 + Math.random() * 0.26;
      particle.width = rim ? 1.3 + Math.random() * 1.2 : 0.9 + Math.random() * 0.6;
      particle.glows = rim && Math.random() < 0.35;
      particle.colour = colours[Math.floor(Math.random() * colours.length)];
      particle.phase = Math.random() * 6.283;
      particle.twinkle = 0.8 + Math.random() * 2.2;
      particle.leaves = rim && Math.random() < 0.12;
    };
    const toBeam = (particle, delay) => {
      particle.mode = 'beam';
      particle.along = -delay;              // negative: still waiting its turn at the start
      particle.side = -2.6 + Math.random() * 5.2;
      particle.pace = 250 + Math.random() * 190;
      particle.alpha = 0.65 + Math.random() * 0.35;
      particle.width = 1.4 + Math.random() * 1.1;
      particle.glows = true;
    };

    const build = () => {
      const width = orbit.clientWidth;
      const height = orbit.clientHeight;
      if (!width || !height) return;
      // Cap the pixel count so very large screens do not pay for a huge canvas.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3600000 / (width * height)));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      scale = (width / 1440) * ratio;
      if (!particles.length) {
        particles = Array.from({ length: 240 }, () => {
          const particle = {};
          toRing(particle, true);
          return particle;
        });
      }
    };

    // Send `count` rim particles out along the beam, one after another.
    const release = (count) => {
      let sent = 0;
      for (const particle of particles) {
        if (sent >= count) break;
        if (particle.mode !== 'ring' || particle.offset < -6) continue;
        toBeam(particle, sent * 14 + Math.random() * 10);
        sent += 1;
      }
    };

    // Scatter a few particles from the tip of the beam.
    const burst = () => {
      for (let i = 0; i < 22; i += 1) {
        const heading = Math.atan2(UY, UX) + (Math.random() - 0.5) * 2.6;
        const pace = 50 + Math.random() * 190;
        bursts.push({ x: OX + UX * LENGTH, y: OY + UY * LENGTH, vx: Math.cos(heading) * pace, vy: Math.sin(heading) * pace, age: 0, life: 0.45 + Math.random() * 0.5, colour: colours[i % colours.length] });
      }
    };

    const stroke = (x1, y1, x2, y2, width, alpha, colour) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.strokeStyle = colour;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    // A mote of light: a faint tail behind it, a bright head, and for some a soft halo.
    // (dx, dy) is the tail, pointing back along the way it came.
    const mote = (x, y, dx, dy, width, alpha, colour, glows) => {
      stroke(x - dx, y - dy, x, y, width * 0.8, alpha * 0.35, colour);
      stroke(x - dx * 0.22, y - dy * 0.22, x, y, width * 1.3, alpha, colour);
      if (glows) stroke(x - dx * 0.22, y - dy * 0.22, x, y, width * 4.5, alpha * 0.16, colour);
    };

    const draw = (now) => {
      const dt = last ? Math.min(0.064, (now - last) / 1000) : 0;
      last = now;
      const time = now / 1000;
      const pointer = state.pointer;

      ctx.setTransform(scale, 0, 0, scale, 0, -480 * scale);   // ring units, with the visible strip starting at y = 480
      ctx.clearRect(0, 480, 1440, 420);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const particle of particles) {
        if (particle.mode === 'ring') {
          const before = particle.angle;
          particle.angle += particle.speed * state.rate * dt;
          if (particle.leaves && before < START && particle.angle >= START) {
            toBeam(particle, 0);
            continue;
          }
          if (particle.angle > WINDOW) toRing(particle, false);

          const a = (particle.angle * Math.PI) / 180;
          const sin = Math.sin(a);
          const cos = Math.cos(a);
          const radius = R + particle.offset;
          let x = CX + radius * sin;
          let y = CY - radius * cos;
          let alpha = particle.alpha * (0.55 + 0.45 * Math.sin(time * particle.twinkle + particle.phase));
          alpha *= clamp((WINDOW - Math.abs(particle.angle)) / 9, 0, 1);   // fade in and out at the edges
          let width = particle.width;
          if (pointer) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
              const near = 1 - distance / 150;
              const push = (near * 16) / (distance || 1);
              x += dx * push;
              y += dy * push;
              alpha += near * 0.6;
              width *= 1 + near;
            }
          }
          const tail = 5 + particle.speed * state.rate * 2.2;
          mote(x, y, cos * tail, sin * tail, width, alpha, particle.colour, particle.glows);
        } else {
          particle.along += particle.pace * (0.75 + 0.25 * state.rate) * dt;
          if (particle.along > LENGTH) {
            toRing(particle, false);
            continue;
          }
          if (particle.along < 0) continue;
          const fade = clamp(particle.along / 40, 0, 1) * clamp((LENGTH - particle.along) / 90, 0, 1);
          const x = OX + UX * particle.along - UY * particle.side;
          const y = OY + UY * particle.along + UX * particle.side;
          mote(x, y, UX * 30, UY * 30, particle.width, particle.alpha * fade, particle.colour, true);
        }
      }

      if (bursts.length) {
        bursts = bursts.filter((spark) => {
          spark.age += dt;
          if (spark.age >= spark.life) return false;
          const drag = 1 - 2.2 * dt;
          spark.vx *= drag;
          spark.vy *= drag;
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          mote(spark.x, spark.y, spark.vx * 0.09, spark.vy * 0.09, 1.8, 1 - spark.age / spark.life, spark.colour, true);
          return true;
        });
      }
      ctx.globalAlpha = 1;
    };

    build();
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        build();
        if (reduceMotion) draw(0);
      }).observe(orbit);
    }
    return { draw, release, burst, state };
  };

  // The ring spins faster while the page is being scrolled, then settles. A
  // spark leaves along the beam each time one of the ring's lights passes the
  // point where the beam starts, whatever speed the ring is turning at.
  const makeRing = (flow) => {
    const orbit = document.getElementById('orbit');
    const spinEl = hero.querySelector('.orbit__spin');
    const sparkEl = hero.querySelector('.orbit__spark');
    const flareEl = hero.querySelector('.orbit__flare');
    if (!orbit || !spinEl || !sparkEl || !flareEl || !spinEl.getAnimations || !sparkEl.animate) return null;
    const spin = spinEl.getAnimations().find((animation) => animation.animationName === 'orbit-spin');
    if (!spin) return null;

    orbit.classList.add('orbit--live');   // hands the spark over from the CSS fallback
    const TURN = 96000;     // ms for one full turn at normal speed (matches the CSS)
    const STEP = 22.5;      // degrees between the 16 lights
    const OFFSET = 3.4;     // degrees the ring turns before the first light reaches the beam
    const readyAt = performance.now() + 2600;   // wait for the beam to finish drawing
    const HEADING = 'rotate(-14.01deg)';
    let rate = 1;
    let lastPhase = null;
    let lastSpark = 0;

    // `extra` is how many particles to send out with the spark.
    const fire = (extra) => {
      sparkEl.animate([
        { opacity: 0, transform: `${HEADING} translateX(-30%)` },
        { opacity: 1, offset: 0.08 },
        { opacity: 1, transform: `${HEADING} translateX(789%)`, offset: 0.92 },
        { opacity: 0, transform: `${HEADING} translateX(789%)` },
      ], { duration: 1300, easing: 'cubic-bezier(0.3, 0.6, 0.4, 1)' });
      flareEl.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(1.9)', offset: 0.25 },
        { transform: 'translate(-50%, -50%) scale(1)' },
      ], { duration: 1300, delay: 1050, easing: 'ease-out' });
      if (flow) {
        flow.release(extra);
        window.setTimeout(flow.burst, 1150);   // when the spark reaches the tip
      }
    };

    const tick = (now) => {
      const target = 1 + Math.min(Math.abs(scroll.velocity) * 5, 7);
      rate += (target - rate) * 0.08;
      scroll.velocity *= 0.92;
      if (Math.abs(rate - spin.playbackRate) > 0.02) spin.playbackRate = rate;
      if (flow) flow.state.rate = rate;

      const angle = (((spin.currentTime || 0) % TURN) / TURN) * 360;
      const phase = (((angle - OFFSET) % STEP) + STEP) % STEP;
      if (lastPhase !== null && phase < lastPhase && now > readyAt && now - lastSpark > 900) {
        lastSpark = now;
        fire(5);
      }
      lastPhase = phase;
    };
    return { tick, fire };
  };

  // "the way out" settles out of scrambled letters, like an answer being worked out.
  let scrambling = false;
  const scramble = (element, answer) => {
    if (scrambling) return;
    scrambling = true;
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let began = 0;
    const step = (now) => {
      if (!began) began = now;
      const settled = ((now - began) / 700) * answer.length;
      let text = '';
      for (let i = 0; i < answer.length; i += 1) {
        text += i < settled || answer[i] === ' ' ? answer[i] : letters[Math.floor(Math.random() * letters.length)];
      }
      element.textContent = text;
      if (settled >= answer.length) {
        element.textContent = answer;
        scrambling = false;
        stopTask(step);
      }
    };
    startTask(step);
  };

  if (sky) {
    const stars = makeStars();
    const orbit = hero ? document.getElementById('orbit') : null;
    const flow = orbit ? makeFlow(orbit) : null;
    const ring = hero && !reduceMotion ? makeRing(flow) : null;
    const spot = sky.querySelector('.hero__spot');
    const label = hero ? hero.querySelector('.orbit__label') : null;
    const labelText = label ? label.textContent : '';

    if (reduceMotion) {
      if (stars) stars.draw(0);   // a still sky and a still ring of particles
      if (flow) flow.draw(0);
    } else if (label) {
      window.setTimeout(() => scramble(label, labelText), 2100);   // as the label fades in
    }

    // A soft light and the stars follow the pointer, and the ring's particles part around it.
    if (finePointer && !reduceMotion) {
      sky.addEventListener('pointermove', (event) => {
        const rect = sky.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        if (spot) {
          spot.style.setProperty('--px', `${(x * 260).toFixed(1)}px`);
          spot.style.setProperty('--py', `${(y * 180).toFixed(1)}px`);
        }
        if (stars) {
          stars.pointer.tx = x;
          stars.pointer.ty = y;
        }
        if (flow) {
          const box = orbit.getBoundingClientRect();
          flow.state.pointer = {
            x: ((event.clientX - box.left) / box.width) * 1440,
            y: 480 + ((event.clientY - box.top) / box.height) * 420,
          };
        }
      });
      sky.addEventListener('pointerleave', () => {
        if (spot) {
          spot.style.setProperty('--px', '0px');
          spot.style.setProperty('--py', '0px');
        }
        if (stars) {
          stars.pointer.tx = 0;
          stars.pointer.ty = 0;
        }
        if (flow) flow.state.pointer = null;
      });
    }

    // Clicking or tapping open sky in the hero sends a wave of particles out along the beam.
    if (hero && ring && flow) {
      let lastWave = 0;
      hero.addEventListener('pointerdown', (event) => {
        const now = performance.now();
        if (event.button !== 0 || now - lastWave < 700) return;
        if (event.target.closest('a, button, input, textarea, summary')) return;
        lastWave = now;
        ring.fire(26);
        if (label) scramble(label, labelText);
      });
    }

    // Scrolling away flies into the ring: the headline lifts and fades, the
    // ring grows, the stars lag behind. CSS reads --p (0 at the top, 1 when gone).
    if (hero && !reduceMotion) {
      let lastP = -1;
      watchScroll(() => {
        const p = clamp(scroll.y / (hero.offsetHeight * 0.85), 0, 1);
        if (Math.abs(p - lastP) < 0.001) return;
        lastP = p;
        hero.style.setProperty('--p', p.toFixed(3));
      });
    }

    // Per-frame work runs only while the top of the page is on screen.
    const setRunning = (running) => {
      sky.classList.toggle('is-paused', !running);
      if (reduceMotion) return;
      [stars && stars.draw, flow && flow.draw, ring && ring.tick].forEach((task) => {
        if (!task) return;
        if (running) startTask(task);
        else stopTask(task);
      });
    };
    if (hasObserver) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => setRunning(entry.isIntersecting));
      }).observe(sky);
    } else {
      setRunning(true);
    }
  }

  // --- Buttons: the main buttons lean toward the pointer ----------------------
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn--light, .nav__cta').forEach((button) => {
      let bx = 0;
      let by = 0;
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        // The box has already moved by bx/by, so measure from where it rests.
        bx = (event.clientX - (rect.left - bx) - rect.width / 2) * 0.22;
        by = (event.clientY - (rect.top - by) - rect.height / 2) * 0.3;
        button.style.setProperty('--bx', `${bx.toFixed(1)}px`);
        button.style.setProperty('--by', `${by.toFixed(1)}px`);
      });
      button.addEventListener('pointerleave', () => {
        bx = 0;
        by = 0;
        button.style.setProperty('--bx', '0px');
        button.style.setProperty('--by', '0px');
      });
    });
  }

  // --- Cards: a highlight follows the pointer and the card tilts toward it ----
  if (finePointer) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mx', `${x.toFixed(0)}px`);
        card.style.setProperty('--my', `${y.toFixed(0)}px`);
        if (reduceMotion) return;
        card.style.setProperty('--ry', `${((x / rect.width - 0.5) * 8).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((0.5 - y / rect.height) * 8).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // --- How we backsolve: the line follows the scroll ---------------------------
  // CSS reads --t (0 to 1) for the lit line and the light at its tip; each step
  // lights as the tip reaches it. On phones the steps stack, so each one simply
  // lights when it comes into view.
  const track = document.querySelector('[data-track]');
  if (track) {
    const steps = Array.from(track.querySelectorAll('.track__step'));
    if (reduceMotion) {
      track.style.setProperty('--t', '1');
      steps.forEach((step) => step.classList.add('is-lit'));
    } else {
      const head = document.createElement('li');
      head.className = 'track__head';
      head.setAttribute('aria-hidden', 'true');
      head.setAttribute('role', 'presentation');
      track.appendChild(head);
      const narrow = window.matchMedia('(max-width: 760px)');
      watchScroll(() => {
        if (narrow.matches) {
          steps.forEach((step) => {
            if (step.getBoundingClientRect().top < scroll.viewH * 0.85) step.classList.add('is-lit');
          });
          return;
        }
        const t = clamp((scroll.viewH * 0.82 - track.getBoundingClientRect().top) / (scroll.viewH * 0.42), 0, 1);
        track.style.setProperty('--t', t.toFixed(4));
        head.style.opacity = t > 0.005 && t < 0.995 ? '1' : '0';
        steps.forEach((step, i) => step.classList.toggle('is-lit', t >= i / steps.length + 0.02));
      });
    }
  }

  // --- After the audit: the highlight steps through Audit, Build, Retainer -----
  const path = document.querySelector('.path');
  if (path && !reduceMotion && hasObserver) {
    const items = Array.from(path.querySelectorAll('.path__item'));
    let index = -1;
    let timer = 0;
    const advance = () => {
      index = (index + 1) % items.length;
      items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    };
    path.classList.add('path--live');
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        window.clearInterval(timer);
        timer = 0;
        if (!entry.isIntersecting) return;
        advance();
        timer = window.setInterval(advance, 1800);
      });
    }, { threshold: 0.4 }).observe(path);
  }

  // --- Team: the line lights up word by word as it scrolls into view ----------
  const teamTitle = document.querySelector('.team .h2');
  if (teamTitle && !reduceMotion) {
    const words = teamTitle.textContent.trim().split(/\s+/).map((text) => {
      const span = document.createElement('span');
      span.className = 'glow-word';
      span.textContent = text;
      return span;
    });
    teamTitle.textContent = '';
    words.forEach((span, i) => {
      teamTitle.appendChild(span);
      if (i < words.length - 1) teamTitle.appendChild(document.createTextNode(' '));
    });
    watchScroll(() => {
      const q = clamp((scroll.viewH * 0.88 - teamTitle.getBoundingClientRect().top) / (scroll.viewH * 0.5), 0, 1);
      words.forEach((span, i) => {
        span.style.opacity = (0.22 + 0.78 * clamp(q * (words.length + 1) - i, 0, 1)).toFixed(3);
      });
    });
  }

  // --- Questions: answers open and close smoothly -------------------------------
  if (!reduceMotion) {
    document.querySelectorAll('.faq__item').forEach((item) => {
      const summary = item.querySelector('summary');
      if (!summary || !item.animate) return;
      let running = null;
      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const opening = !item.open || item.classList.contains('is-closing');
        const from = item.offsetHeight;
        if (running) running.cancel();
        item.classList.toggle('is-closing', !opening);
        if (opening) item.open = true;
        const to = opening ? item.offsetHeight : summary.offsetHeight + (item.offsetHeight - item.clientHeight);
        item.style.overflow = 'hidden';
        running = item.animate({ height: [`${from}px`, `${to}px`] }, { duration: 340, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
        running.onfinish = () => {
          if (!opening) item.open = false;
          item.classList.remove('is-closing');
          item.style.overflow = '';
          running = null;
        };
      });
    });
  }

  // --- Header menu on small screens ---------------------------------------------
  const nav = header ? header.querySelector('.nav') : null;
  const menuButton = nav ? nav.querySelector('.nav__toggle') : null;
  if (nav && menuButton) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    };
    menuButton.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('.nav__links a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) setOpen(false);
    });
  }

  // --- Use cases: filter the examples by kind of firm ---------------------------
  const filters = document.querySelector('.filters');
  if (filters) {
    const buttons = Array.from(filters.querySelectorAll('.filter'));
    const cases = Array.from(document.querySelectorAll('.case'));
    const count = filters.querySelector('.filters__count');
    const show = (kind) => {
      let shown = 0;
      cases.forEach((item) => {
        const match = kind === 'all' || item.dataset.kinds.split(' ').includes(kind);
        item.hidden = !match;
        if (!match) return;
        item.classList.add('is-visible');   // filtered rows arrive at once, whether or not they had scrolled into view
        if (!reduceMotion && item.animate) {
          item.animate([
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'none' },
          ], { duration: 450, delay: shown * 45, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'backwards' });
        }
        shown += 1;
      });
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.kind === kind)));
      if (count) count.textContent = `Showing ${shown} of ${cases.length}`;
    };
    buttons.forEach((button) => button.addEventListener('click', () => show(button.dataset.kind)));
  }

  // --- Header links: mark the section currently on screen --------------------
  const navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (hasObserver && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((a) => a.getAttribute('href') === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  // --- "Book a call" buttons ---------------------------------------------------
  if (CONFIG.bookingUrl) {
    document.querySelectorAll('[data-book]').forEach((link) => {
      link.setAttribute('href', CONFIG.bookingUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  }

  // --- Contact form ------------------------------------------------------------
  // There is no server. The form opens the visitor's mail app with the
  // details filled in. Swap this for a form service if you prefer.
  const form = document.getElementById('book-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!CONFIG.email) {
        if (status) status.textContent = 'This form is not connected yet. Add your email or booking link in js/main.js.';
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const firm = String(data.get('firm') || '').trim();
      const subject = `Call request from ${name}${firm ? ` (${firm})` : ''}`;
      const body = [
        `Name: ${name}`,
        `Firm: ${firm}`,
        `Email: ${String(data.get('email') || '').trim()}`,
        '',
        'Most repetitive task on our team:',
        String(data.get('task') || '').trim(),
      ].join('\n');

      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (status) status.textContent = 'Your mail app should open with the message ready to send.';
    });
  }

  // --- Footer year ---------------------------------------------------------------
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
