'use client';
import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface SprayPaintTextProps {
  text: string;
}

interface Drip {
  x: number;
  startY: number;
  currentLen: number;
  maxLen: number;
  speed: number;
  wobblePhase: number;
  color: [number, number, number];
}

const SprayPaintText: React.FC<SprayPaintTextProps> = ({ text }) => {
  const outerRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animId = 0;
    let cancelled = false;

    const run = () => {
      if (cancelled || !containerRef.current || !canvasRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const computed = getComputedStyle(container);
      const fontSize = parseFloat(computed.fontSize);
      const fontWeight = computed.fontWeight || '600';
      const fontFamily = computed.fontFamily;
      const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;

      const tmpC = document.createElement('canvas');
      const tmpCtx = tmpC.getContext('2d')!;
      tmpCtx.font = fontStr;
      const textW = tmpCtx.measureText(text).width;

      const padX = fontSize * 0.55;
      const padY = fontSize * 0.85;
      const cssW = textW + padX * 2;
      const cssH = fontSize * 1.8 + padY * 2;

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      const textCX = cssW / 2;
      const textCY = cssH / 2;

      // --- Pixel masks ---
      const buildMask = (draw: (cx: CanvasRenderingContext2D) => void): ImageData => {
        const c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        const cx = c.getContext('2d')!;
        cx.scale(dpr, dpr);
        cx.font = fontStr;
        cx.textBaseline = 'middle';
        cx.textAlign = 'center';
        draw(cx);
        return cx.getImageData(0, 0, c.width, c.height);
      };

      const fillMask = buildMask(cx => {
        cx.fillStyle = '#000';
        cx.fillText(text, textCX, textCY);
      });

      // Wider stroke for bold white graffiti outline
      const strokeW = Math.max(fontSize * 0.18, 9);
      const strokeMask = buildMask(cx => {
        cx.strokeStyle = '#000';
        cx.lineWidth = strokeW;
        cx.lineJoin = 'round';
        cx.strokeText(text, textCX, textCY);
        cx.fillStyle = '#000';
        cx.fillText(text, textCX, textCY);
      });

      const getAlpha = (mask: ImageData, x: number, y: number): number => {
        const ix = Math.round(x * dpr);
        const iy = Math.round(y * dpr);
        if (ix < 0 || ix >= mask.width || iy < 0 || iy >= mask.height) return 0;
        return mask.data[(iy * mask.width + ix) * 4 + 3];
      };

      const isFill = (x: number, y: number) => getAlpha(fillMask, x, y) > 50;
      const isStroke = (x: number, y: number) => getAlpha(strokeMask, x, y) > 50;

      const textLeft = textCX - textW / 2;

      // Chrome / silver: bright highlight in the center of the text width,
      // steel-dark at the edges — classic NYC chrome throw-up.
      const getFillColor = (x: number): [number, number, number] => {
        const t = Math.max(0, Math.min(1, (x - textLeft) / textW));
        const mirror = 1 - Math.abs(t * 2 - 1); // 0→1→0 across width
        const base = 68;
        const peak = 218;
        const v = Math.round(base + mirror * (peak - base));
        return [v, v, Math.min(255, Math.round(v + 14))]; // cool silver-blue tint
      };

      // --- Animation phases ---
      const FILL_FRAMES = 88;
      const OUTLINE_START = 78;
      const OUTLINE_FRAMES = 58;
      const DRIP_START = 35;
      const TOTAL = OUTLINE_START + OUTLINE_FRAMES + 6;

      const fillSprayR = fontSize * 0.44;
      const outlineSprayR = fontSize * 0.06;
      const FILL_PPS = 140;
      const OUTLINE_PPS = 115;

      const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      const x0 = textLeft - fontSize * 0.28;
      const x1 = textLeft + textW + fontSize * 0.28;

      const getFillNozzle = (f: number) => {
        const split = FILL_FRAMES * 0.56;
        if (f < split) {
          const t = f / split;
          return {
            x: x0 + (x1 - x0) * ease(t),
            y: textCY + Math.sin(t * Math.PI) * fontSize * 0.08
              + Math.sin(t * 19.7) * 1.8 + Math.sin(t * 8.3) * 2.6,
          };
        }
        const t = (f - split) / (FILL_FRAMES - split);
        return {
          x: x1 + (x0 - x1) * ease(t),
          y: textCY - Math.sin(t * Math.PI) * fontSize * 0.06
            + Math.cos(t * 23.1) * 1.5 + Math.cos(t * 9.7) * 2.3,
        };
      };

      const getOutlineNozzle = (f: number) => {
        const t = f / OUTLINE_FRAMES;
        return {
          x: x0 + (x1 - x0) * ease(t),
          y: textCY + Math.sin(t * 41.3) * 0.7 + Math.sin(t * 17.1) * 1.0,
        };
      };

      // Offset of canvas top-left within the outer span
      const outer = outerRef.current;
      const outerW = outer ? outer.offsetWidth : textW;
      const outerH = outer ? outer.offsetHeight : fontSize * 1.2;
      const canvasOffX = outerW / 2 - cssW / 2;
      const canvasOffY = outerH / 2 - cssH / 2;

      // Spray can SVG dimensions — horizontal layout, nozzle tip at right edge
      const CAN_W = 72;   // SVG viewBox width
      const CAN_NOZZLE_X = 70; // nozzle tip x within the SVG
      const CAN_NOZZLE_Y = 15; // nozzle tip y within the SVG

      // --- Drips (silver/grey tones) ---
      const drips: Drip[] = [];
      const dripSamples = 20;
      for (let i = 0; i < dripSamples; i++) {
        const sX = textLeft + (textW / (dripSamples - 1)) * i;
        let bottomY = -1;
        for (let sY = textCY + fontSize; sY >= textCY - fontSize; sY -= 0.5) {
          if (isFill(sX, sY)) { bottomY = sY; break; }
        }
        if (bottomY < 0 || Math.random() > 0.65) continue;
        drips.push({
          x: sX + (Math.random() - 0.5) * 4,
          startY: bottomY + 2,
          currentLen: 0,
          maxLen: fontSize * (0.3 + Math.random() * 0.75),
          speed: 0.42 + Math.random() * 0.78,
          wobblePhase: Math.random() * Math.PI * 2,
          color: getFillColor(sX),
        });
      }

      let frame = 0;

      const tick = () => {
        if (cancelled) return;

        if (frame >= TOTAL) {
          if (canRef.current) canRef.current.style.opacity = '0';
          return;
        }

        // --- Animate spray can during fill phase ---
        if (canRef.current) {
          if (frame < FILL_FRAMES) {
            const { x: nx, y: ny } = getFillNozzle(frame);
            const nozzleX = canvasOffX + nx;
            const nozzleY = canvasOffY + ny;
            const canLeft = nozzleX - CAN_NOZZLE_X;
            const canTop = nozzleY - CAN_NOZZLE_Y - 8;
            canRef.current.style.left = `${canLeft}px`;
            canRef.current.style.top = `${canTop}px`;
            canRef.current.style.opacity = frame < 10 ? `${frame / 10}` : '1';
          } else {
            canRef.current.style.opacity = '0';
          }
        }

        // --- Fill spray (silver/chrome) ---
        if (frame < FILL_FRAMES) {
          const { x: nx, y: ny } = getFillNozzle(frame);

          // Background haze
          for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * fillSprayR * 1.6;
            const px = nx + Math.cos(angle) * dist;
            const py = ny + Math.sin(angle) * dist;
            if (!isFill(px, py)) continue;
            const [pr, pg, pb] = getFillColor(px);
            ctx.beginPath();
            ctx.arc(px, py, Math.random() * 3.5 + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${pr},${pg},${pb},${(0.04 + Math.random() * 0.07).toFixed(3)})`;
            ctx.fill();
          }

          // Dense fill particles
          for (let i = 0; i < FILL_PPS; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * fillSprayR;
            const px = nx + Math.cos(angle) * dist;
            const py = ny + Math.sin(angle) * dist;
            const onFill = isFill(px, py);
            const nd = dist / fillSprayR;
            const [pr, pg, pb] = getFillColor(px);
            const j = Math.floor(Math.random() * 32) - 16;

            let alpha: number;
            let size: number;
            if (onFill) {
              alpha = (1 - nd * 0.5) * (0.76 + Math.random() * 0.24);
              size = Math.random() * 2.4 + 0.5;
            } else {
              alpha = Math.pow(1 - nd, 1.8) * 0.22 * Math.random();
              if (alpha < 0.03) continue;
              size = Math.random() * 1.5 + 0.25;
            }
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.min(255, Math.max(0, pr + j))},${Math.min(255, Math.max(0, pg + j))},${Math.min(255, Math.max(0, pb + j))},${alpha.toFixed(3)})`;
            ctx.fill();
          }

          // Stray splatter drops
          if (Math.random() < 0.08) {
            const sd = fillSprayR * (0.7 + Math.random());
            const sa = Math.random() * Math.PI * 2;
            const sx = nx + Math.cos(sa) * sd;
            const [sr, sg, sb] = getFillColor(sx);
            ctx.beginPath();
            ctx.arc(sx, ny + Math.sin(sa) * sd, Math.random() * 3.2 + 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${sr},${sg},${sb},${(0.2 + Math.random() * 0.4).toFixed(3)})`;
            ctx.fill();
          }
        }

        // --- White hard-line outline ---
        if (frame >= OUTLINE_START && frame < OUTLINE_START + OUTLINE_FRAMES) {
          const { x: nx, y: ny } = getOutlineNozzle(frame - OUTLINE_START);
          for (let i = 0; i < OUTLINE_PPS; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * outlineSprayR;
            const px = nx + Math.cos(angle) * dist;
            const py = ny + Math.sin(angle) * dist;
            if (!isStroke(px, py)) continue;
            const nd = dist / outlineSprayR;
            const alpha = (1 - nd * 0.25) * (0.90 + Math.random() * 0.10);
            const v = 228 + Math.floor(Math.random() * 27);
            ctx.beginPath();
            ctx.arc(px, py, Math.random() * 1.6 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${v},${v},${v},${alpha.toFixed(3)})`;
            ctx.fill();
          }
        }

        // --- Drips ---
        if (frame >= DRIP_START) {
          for (const drip of drips) {
            if (drip.currentLen >= drip.maxLen) continue;
            const prev = drip.currentLen;
            drip.currentLen = Math.min(drip.currentLen + drip.speed, drip.maxLen);
            const [dr, dg, db] = drip.color;

            for (let d = prev; d <= drip.currentLen; d += 0.3) {
              const prog = d / drip.maxLen;
              const wobble = Math.sin(drip.wobblePhase + d * 0.16) * 1.5;
              const r = Math.max(0.5, (1 - prog * 0.62) * 3.2);
              const a = 0.95 - prog * 0.2;
              ctx.beginPath();
              ctx.arc(drip.x + wobble, drip.startY + d, r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${dr},${dg},${db},${a.toFixed(2)})`;
              ctx.fill();
            }

            const tipProg = drip.currentLen / drip.maxLen;
            const tipWobble = Math.sin(drip.wobblePhase + drip.currentLen * 0.16) * 1.5;
            const tipR = Math.max(1.8, (1 - tipProg * 0.35) * 5.0);
            ctx.beginPath();
            ctx.arc(drip.x + tipWobble, drip.startY + drip.currentLen, tipR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${dr},${dg},${db},0.97)`;
            ctx.fill();
            // Glossy highlight on teardrop
            ctx.beginPath();
            ctx.arc(
              drip.x + tipWobble - tipR * 0.3,
              drip.startY + drip.currentLen - tipR * 0.3,
              tipR * 0.35,
              0, Math.PI * 2
            );
            ctx.fillStyle = `rgba(255,255,255,0.50)`;
            ctx.fill();
          }
        }

        frame++;
        animId = requestAnimationFrame(tick);
      };

      animId = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => document.fonts.ready.then(run), 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [text, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <>{text}</>;
  }

  return (
    <span ref={outerRef} className="relative inline-block" style={{ whiteSpace: 'nowrap' }}>
      <span ref={containerRef} className="invisible" aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
        {text}
      </span>
      <span className="sr-only">{text}</span>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        aria-hidden="true"
      />
      {/* Spray can — horizontal, nozzle tip at right edge, follows the fill nozzle */}
      <div
        ref={canRef}
        className="pointer-events-none absolute"
        style={{
          opacity: 0,
          transition: 'opacity 0.35s ease',
          transform: 'rotate(-12deg)',
          transformOrigin: 'right center',
          zIndex: 20,
        }}
        aria-hidden="true"
      >
        <svg
          width="72"
          height="30"
          viewBox="0 0 72 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="can-body-v" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#aaa" />
              <stop offset="30%" stopColor="#666" />
              <stop offset="100%" stopColor="#1c1c1c" />
            </linearGradient>
            <linearGradient id="can-cap-v" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#555" />
              <stop offset="100%" stopColor="#111" />
            </linearGradient>
          </defs>

          {/* Left end-cap of can */}
          <ellipse cx="6" cy="15" rx="6" ry="11" fill="#111" />

          {/* Main cylindrical body */}
          <rect x="6" y="4" width="42" height="22" fill="url(#can-body-v)" />

          {/* Metallic top sheen */}
          <rect x="6" y="4" width="42" height="6" rx="0" fill="rgba(255,255,255,0.14)" />

          {/* Bottom shadow */}
          <rect x="6" y="22" width="42" height="4" fill="rgba(0,0,0,0.35)" />

          {/* Label area */}
          <rect x="12" y="8" width="28" height="14" rx="2" fill="#111" opacity="0.88" />

          {/* Label stripe decorations */}
          <rect x="14" y="11" width="16" height="2" rx="1" fill="#333" />
          <rect x="14" y="15" width="22" height="2" rx="1" fill="#2a2a2a" />

          {/* Right shoulder taper */}
          <path d="M48 4 Q54 4 56 8 L56 22 Q54 26 48 26" fill="#3a3a3a" />

          {/* Valve / neck */}
          <rect x="56" y="10" width="5" height="10" rx="2" fill="#222" />

          {/* Nozzle block */}
          <rect x="58" y="9" width="8" height="12" rx="2" fill="url(#can-cap-v)" />

          {/* Nozzle button top sheen */}
          <rect x="58" y="9" width="8" height="3" rx="1" fill="rgba(255,255,255,0.1)" />

          {/* Nozzle tip orifice */}
          <rect x="64" y="12" width="7" height="6" rx="1.5" fill="#0a0a0a" />

          {/* Nozzle tip hole */}
          <circle cx="70" cy="15" r="1.2" fill="#1a1a1a" />
        </svg>
      </div>
    </span>
  );
};

export default SprayPaintText;
