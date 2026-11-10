import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {BAR1_D, BAR2_D, BOTTOM_D, CAPSULE, MARK_CENTER, TOP_D} from './logoPaths';
import {FONT, ORANGE, inOutCubic, outExpo, backOut, prog, useBrandFont} from './brand';
import SPEC from '../public/data/spectrum.json';

/* =====================================================================================
   SBK MEDIA TV – channel intro  (1920x1080 @ 60fps, 10s)
   Timeline (frames @60):
     0-126   audio-reactive waveform  ->  collapses into the mic capsule (trim-path outline)
     112-150 the two S halves slam in (echo trails, motion blur) and LOCK at f146 (impact)
     178-205 grille bars click into the mic
     216-282 mark glides left/scales into the lockup
     252-300 orange slab wipe reveals the SBK / MEDIA TV wordmark
     318-400 programme ticker (Wisdom Chronicles / Story Hour / Homeboys Podcast)
     400-585 hold with live idle motion, light sweeps, audio-reactive glow
     585-600 fade out
   ===================================================================================== */

const W = 1920, H = 1080, DUR = 600;
const BG = '#FDF8F2';      // light-mode canvas (matches the client's cream logo board)
const INK = '#0A0A0A';
const FI = 146; // impact frame

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const sstep = Easing.bezier(0.77, 0, 0.18, 1);
// frames can be fractional (motion-blur sub-samples) -> interpolate between analysed frames
const idx = (f: number) => {
  const c = Math.min(DUR - 1, Math.max(0, f));
  const i = Math.floor(c);
  return {i, j: Math.min(DUR - 1, i + 1), t: c - i};
};
const spec = (f: number): number[] => {
  const {i, j, t} = idx(f);
  const a = (SPEC.spec as number[][])[i], b = (SPEC.spec as number[][])[j];
  return a.map((v, k) => v + (b[k] - v) * t);
};
const level = (f: number) => {
  const {i, j, t} = idx(f);
  const L = SPEC.level as number[];
  return L[i] + (L[j] - L[i]) * t;
};

/* ---------- layout ---------- */
const S_HERO = 0.62, S_LOCK = 0.5;
const MARK_W = 952, MARK_H = 874;
const H_M = MARK_H * S_LOCK, W_M = MARK_W * S_LOCK;
const Q = H_M / 340;                 // wordmark scale relative to the supplied lockup
const TEXT_W = 640 * Q;
const GAP = 26;
const LOCK_W = W_M + GAP + TEXT_W;
const LOCK_LEFT = (W - LOCK_W) / 2;
const BLOCK_TOP = 236;
const MARK_LOCK_CX = LOCK_LEFT + W_M / 2;
const MARK_LOCK_CY = BLOCK_TOP + H_M / 2;
const TEXT_LEFT = LOCK_LEFT + W_M + GAP;
const SBK_TOP = BLOCK_TOP + 63 * Q, SBK_H = 197 * Q;
const MEDIA_TOP = BLOCK_TOP + 285 * Q, MEDIA_H = 54 * Q;
const TEXT_TOP = SBK_TOP, TEXT_H = MEDIA_TOP + MEDIA_H - SBK_TOP;
const TICKER_Y = BLOCK_TOP + H_M + 96;

const pose = (f: number) => {
  const m = prog(f, 216, 66, sstep);
  const live = prog(f, 150, 40);
  return {
    cx: lerp(W / 2, MARK_LOCK_CX, m),
    cy: lerp(515, MARK_LOCK_CY, m) + live * 5 * Math.sin(f / 46),
    s: lerp(S_HERO, S_LOCK, m) * (1 + live * 0.007 * Math.sin(f / 31)),
  };
};
const toScreen = (x: number, y: number, p: ReturnType<typeof pose>) => ({x: p.cx + (x - MARK_CENTER.x) * p.s, y: p.cy + (y - MARK_CENTER.y) * p.s});
const MIC_HERO = toScreen(CAPSULE.x + CAPSULE.w / 2, CAPSULE.y + CAPSULE.h / 2, pose(FI));

/* ---------- background ---------- */
const Background: React.FC<{f: number}> = ({f}) => {
  const lv = level(f);
  const hit = Math.exp(-Math.max(0, f - FI) / 22) * (f >= FI ? 1 : 0);
  const glow = 0.1 + lv * 0.22 + hit * 0.35 + prog(f, 0, 90) * 0.05;
  const p = pose(f);
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${p.cx}px ${p.cy}px, rgba(252,85,19,${glow * 0.7}) 0%, rgba(252,85,19,${glow * 0.25}) 30%, rgba(252,85,19,0) 64%)`}} />
      {/* slanted shape-layer bands (echo the S slant) drifting at different speeds */}
      {[0, 1, 2, 3, 4].map((i) => {
        const w = 150 + i * 70, speed = 0.35 + i * 0.22;
        const x = ((i * 540 + f * speed * (i % 2 ? -1 : 1)) % (W + 800)) - 400;
        const a = (0.018 + i * 0.005) * prog(f, 20 + i * 8, 40);
        return <div key={i} style={{position: 'absolute', top: -100, left: x, width: w, height: H + 200, background: i % 2 ? `rgba(252,85,19,${a * 1.5})` : `rgba(10,10,10,${a})`, transform: 'skewX(-32deg)'}} />;
      })}
    </AbsoluteFill>
  );
};

const Dust: React.FC<{f: number}> = ({f}) => (
  <g>
    {Array.from({length: 70}).map((_, i) => {
      const z = 0.3 + random(`dz${i}`) * 0.9;
      const x = (random(`dx${i}`) * W + f * (0.15 + z * 0.3)) % W;
      const y = (((random(`dy${i}`) * H - f * (0.25 + z * 0.55)) % H) + H) % H;
      const tw = 0.5 + 0.5 * Math.sin(f / (14 + i % 9) + i);
      return <circle key={i} cx={x} cy={y} r={0.8 + z * 2.2} fill={i % 4 ? INK : ORANGE} opacity={(0.08 + z * 0.3) * tw * prog(f, 10, 60)} />;
    })}
  </g>
);

/* ---------- waveform (audio reactive) ---------- */
const NBARS = 49, MID = 24;
const Waveform: React.FC<{f: number}> = ({f}) => {
  if (f > 132) return null;
  const sp = spec(f);
  const fade = 1 - prog(f, 108, 20, (n) => n);
  const p0 = pose(0);
  return (
    <g opacity={fade}>
      {[true, false].map((halo) => Array.from({length: NBARS}).map((_, i) => {
        const d = Math.abs(i - MID);
        const band = Math.min(47, Math.round((d / MID) * 40));
        const amp = sp[band] * 0.75 + sp[Math.min(47, band + 1)] * 0.25;
        const shape = 0.3 + 0.7 * Math.pow(Math.cos((d / MID) * (Math.PI / 2) * 0.96), 1.3);
        const grow = prog(f, 3 + d * 0.7, 34);
        let h = (10 + amp * 380 * shape + 7 * Math.sin(f / 5 + i * 0.7)) * grow;
        const x0 = W / 2 + (i - MID) * 30;
        const c = prog(f, 80 + d * 0.35, 34, inOutCubic);
        const x = lerp(x0, W / 2 + ((i - MID) / MID) * 66, c);
        h = lerp(h, CAPSULE.h * S_HERO * 0.94, c);
        const w = lerp(11, 6, c);
        const hh = Math.max(h, 2);
        return halo ? (
          <rect key={`h${i}`} x={x - w * 1.6} y={p0.cy - hh / 2 - 8} width={w * 3.2} height={hh + 16} rx={w * 1.6} fill={ORANGE} opacity={0.16} />
        ) : (
          <rect key={i} x={x - w / 2} y={p0.cy - hh / 2} width={w} height={hh} rx={w / 2} fill={d < 3 || i % 7 === 0 ? '#FF8A4C' : ORANGE} />
        );
      }))}
    </g>
  );
};

/* ---------- the logo, as animatable vector parts ---------- */
const flyIn = (fe: number, start: number, dx: number, dy: number) => {
  const p = prog(fe, start, 36, outExpo);
  const inv = 1 - p;
  return {tf: `translate(${dx * inv} ${dy * inv}) rotate(${14 * inv} ${MARK_CENTER.x} ${MARK_CENTER.y}) translate(${MARK_CENTER.x} ${MARK_CENTER.y}) scale(${1 + 0.35 * inv}) translate(${-MARK_CENTER.x} ${-MARK_CENTER.y})`, op: prog(fe, start - 1, 4, (n) => n), moving: p < 0.995};
};

const shinePos = (f: number) => {
  // sweeps at f=190, 292, 470, 548
  const starts = [190, 292, 470, 548];
  for (const s of starts) if (f >= s && f <= s + 52) return lerp(-150, 1450, prog(f, s, 52, Easing.bezier(0.4, 0, 0.2, 1)));
  return -999;
};

const Logo: React.FC<{f: number; fill: string; withEcho?: boolean; bars?: boolean}> = ({f, fill, withEcho = true, bars = true}) => {
  const bar1 = prog(f, 178, 26, backOut), bar2 = prog(f, 186, 26, backOut);
  const sp = spec(f);
  const settle = 1 - prog(f, 545, 40);                       // reactive until the very end, then exact logo
  const m1 = lerp(1, 0.92 + 0.08 * sp[30], settle * prog(f, 215, 20));
  const m2 = lerp(1, 0.9 + 0.1 * sp[36], settle * prog(f, 215, 20));
  const piece = (fe: number, op: number, key: string) => {
    const t = flyIn(fe, 112, 1500, -1000), b = flyIn(fe, 116, -1500, 1000);
    return (
      <g key={key} opacity={op}>
        <path d={TOP_D} fill={fill} transform={t.tf} opacity={t.op} />
        <path d={BOTTOM_D} fill={fill} transform={b.tf} opacity={b.op} />
      </g>
    );
  };
  const moving = f >= 108 && f <= 156;
  return (
    <g>
      {withEcho && moving && [7, 6, 5, 4, 3, 2, 1].map((k) => piece(f - k * 1.2, 0.05 + (7 - k) * 0.035, `e${k}`))}
      {piece(f, 1, 'main')}
      {bars && (
        <>
          <g transform={`translate(504 0) scale(${bar1 * m1} 1) translate(-504 0)`} opacity={clamp01(bar1 * 3)}><path d={BAR1_D} fill={fill} /></g>
          <g transform={`translate(504 0) scale(${bar2 * m2} 1) translate(-504 0)`} opacity={clamp01(bar2 * 3)}><path d={BAR2_D} fill={fill} /></g>
        </>
      )}
    </g>
  );
};

const LogoStage: React.FC<{f: number}> = ({f}) => {
  const p = pose(f);
  const e = f - FI;
  const punch = e >= 0 ? 1 + 0.07 * Math.exp(-e / 9) * Math.cos(e / 4) : 1;
  const ca = e >= 0 && e < 22 ? 16 * Math.exp(-e / 6) : 0;
  const draw = prog(f, 100, 30, inOutCubic);
  const capFill = prog(f, 112, 36);
  const capStrokeOut = 1 - prog(f, 150, 26, (n) => n);
  const lv = level(f);
  const sh = shinePos(f);
  const capHot = f >= FI ? Math.exp(-(f - FI) / 40) : 0;
  const cap = CAPSULE;
  const group = `translate(${p.cx} ${p.cy}) scale(${p.s * punch}) translate(${-MARK_CENTER.x} ${-MARK_CENTER.y})`;
  return (
    <g transform={group}>
      <defs>
        <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="300" y2="0" gradientTransform={`translate(${sh} 642) rotate(-32)`}>
          <stop offset="0" stopColor={ORANGE} />
          <stop offset="0.3" stopColor={ORANGE} />
          <stop offset="0.5" stopColor="#FFD0B0" />
          <stop offset="0.7" stopColor={ORANGE} />
          <stop offset="1" stopColor={ORANGE} />
        </linearGradient>
        <radialGradient id="micwin" cx="50%" cy="65%" r="70%">
          <stop offset="0" stopColor={ORANGE} stopOpacity={0.14 + lv * 0.22 + capHot * 0.4} />
          <stop offset="1" stopColor={ORANGE} stopOpacity={0.02} />
        </radialGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(252,85,19,0.55)" />
          <stop offset="0.55" stopColor="rgba(252,85,19,0.18)" />
          <stop offset="1" stopColor="rgba(252,85,19,0)" />
        </radialGradient>
      </defs>

      {/* soft glow behind the mark */}
      {f > 100 && (
        <ellipse cx={MARK_CENTER.x} cy={MARK_CENTER.y} rx={640} ry={600} fill="url(#halo)" opacity={(0.3 + lv * 0.3 + capHot * 0.5) * prog(f, 112, 40)} />
      )}

      {/* mic capsule: dark window + trim-path outline */}
      <rect x={cap.x} y={cap.y} width={cap.w} height={cap.h} rx={cap.r} fill={BG} opacity={capFill} />
      <rect x={cap.x} y={cap.y} width={cap.w} height={cap.h} rx={cap.r} fill="url(#micwin)" opacity={capFill} />
      <rect x={cap.x} y={cap.y} width={cap.w} height={cap.h} rx={cap.r} fill="none" stroke={ORANGE} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={capStrokeOut} />
      <rect x={cap.x} y={cap.y} width={cap.w} height={cap.h} rx={cap.r} fill="none" stroke={ORANGE} strokeWidth={34} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={capStrokeOut * 0.18} />

      {/* the mark, with RGB split on impact */}
      {ca > 0.4 ? (
        <g>
          <g transform={`translate(${-ca * 1.3} ${-ca * 0.3})`} opacity={0.65} style={{mixBlendMode: 'multiply'}}><Logo f={f} fill="#12C4F0" withEcho={false} bars={false} /></g>
          <g transform={`translate(${ca * 1.3} ${ca * 0.3})`} opacity={0.65} style={{mixBlendMode: 'multiply'}}><Logo f={f} fill="#FF2E7E" withEcho={false} bars={false} /></g>
          <Logo f={f} fill={ORANGE} withEcho={false} />
        </g>
      ) : (
        <Logo f={f} fill={sh > -900 && f > 160 ? 'url(#shine)' : ORANGE} />
      )}
    </g>
  );
};

/* ---------- impact FX ---------- */
const Rings: React.FC<{f: number}> = ({f}) => {
  const e = f - FI;
  if (e < 0 || e > 70) return null;
  return (
    <g fill="none">
      {[0, 6, 13].map((d, i) => {
        const p = prog(f, FI + d, 52, outExpo);
        return <circle key={i} cx={MIC_HERO.x} cy={MIC_HERO.y} r={50 + p * 1000} stroke={i === 1 ? '#FF9A63' : ORANGE} strokeWidth={Math.max(1, 16 * (1 - p))} opacity={Math.pow(1 - p, 1.5) * 0.85} />;
      })}
    </g>
  );
};

const Sparks: React.FC<{f: number}> = ({f}) => {
  const e = f - FI;
  if (e < 0 || e > 110) return null;
  return (
    <g>
      {Array.from({length: 100}).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const sp = 7 + random(`s${i}`) * 28;
        const life = 30 + random(`l${i}`) * 70;
        if (e > life) return null;
        const drag = 0.935;
        const dist = (sp * (1 - Math.pow(drag, e))) / (1 - drag);
        const grav = 0.05 * e * e * (0.4 + random(`g${i}`));
        const x = MIC_HERO.x + Math.cos(ang) * dist, y = MIC_HERO.y + Math.sin(ang) * dist + grav;
        const tail = Math.min(dist, sp * Math.pow(drag, e) * 2.6);
        return <line key={i} x1={x - Math.cos(ang) * tail} y1={y - Math.sin(ang) * tail - grav * 0.1} x2={x} y2={y} stroke={i % 3 ? ORANGE : '#2A1206'} strokeWidth={1.4 + random(`w${i}`) * 3.2} strokeLinecap="round" opacity={Math.pow(1 - e / life, 1.2)} />;
      })}
    </g>
  );
};

/* ---------- wordmark with slab wipe ---------- */
const SLAB_W = 200, SLANT = 80;
const Wordmark: React.FC<{f: number}> = ({f}) => {
  const t0 = 252;
  const p = prog(f, t0, 46, Easing.bezier(0.65, 0, 0.2, 1));
  const lead = lerp(-SLAB_W, TEXT_W + SLAB_W + SLANT, p);
  const leadM = lead - 70;
  const clip = (L: number) => `polygon(0px 0px, ${Math.max(0, L + SLANT)}px 0px, ${Math.max(0, L)}px ${TEXT_H}px, 0px ${TEXT_H}px)`;
  const settled = p >= 1;
  const par = (1 - prog(f, t0 + 6, 52)) * 46;
  return (
    <div style={{position: 'absolute', left: TEXT_LEFT, top: TEXT_TOP, width: TEXT_W, height: TEXT_H, overflow: 'visible'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: settled ? undefined : clip(lead)}}>
        <Img src={staticFile('word-sbk-black.png')} style={{position: 'absolute', left: par, top: 0, width: TEXT_W, height: SBK_H}} />
      </div>
      <div style={{position: 'absolute', inset: 0, clipPath: settled ? undefined : clip(leadM)}}>
        <Img src={staticFile('word-media-black.png')} style={{position: 'absolute', left: par * 1.5, top: MEDIA_TOP - SBK_TOP, width: TEXT_W, height: MEDIA_H}} />
      </div>
      {f >= t0 && !settled && (
        <>
          {[3, 2, 1].map((k) => {
            const L = lerp(-SLAB_W, TEXT_W + SLAB_W + SLANT, prog(f - k * 1.6, t0, 46, Easing.bezier(0.65, 0, 0.2, 1)));
            return <div key={k} style={{position: 'absolute', left: -60, top: -26, width: TEXT_W + 400, height: TEXT_H + 52, clipPath: `polygon(${L - SLAB_W + SLANT + 60}px 0px, ${L + SLANT + 60}px 0px, ${L + 60}px 100%, ${L - SLAB_W + 60}px 100%)`, background: ORANGE, opacity: 0.14 + (3 - k) * 0.06}} />;
          })}
          <div style={{position: 'absolute', left: -60, top: -26, width: TEXT_W + 400, height: TEXT_H + 52, clipPath: `polygon(${lead - SLAB_W + SLANT + 60}px 0px, ${lead + SLANT + 60}px 0px, ${lead + 60}px 100%, ${lead - SLAB_W + 60}px 100%)`, background: `linear-gradient(90deg, ${ORANGE}, #FF7A3C)`}} />
        </>
      )}
    </div>
  );
};

/* ---------- programme ticker ---------- */
const PROGRAMMES = ['WISDOM CHRONICLES', 'STORY HOUR', 'HOMEBOYS PODCAST'];
const Ticker: React.FC<{f: number}> = ({f}) => {
  const line = prog(f, 304, 44, inOutCubic);
  return (
    <>
      <div style={{position: 'absolute', left: LOCK_LEFT, width: LOCK_W, top: TICKER_Y - 44, height: 2, background: 'rgba(10,10,10,0.28)', transform: `scaleX(${line})`, transformOrigin: 'center'}} />
      <div style={{position: 'absolute', left: W / 2 - 8, top: TICKER_Y - 52, width: 16, height: 16, background: ORANGE, transform: `rotate(45deg) scale(${prog(f, 330, 20, backOut)})`}} />
      <div style={{position: 'absolute', left: 0, width: W, top: TICKER_Y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 38, fontFamily: FONT, fontWeight: 900, fontSize: 32, letterSpacing: '0.24em', color: INK}}>
        {PROGRAMMES.map((name, i) => {
          const st = 322 + i * 24;
          const pp = prog(f, st, 30);
          const hl = interpolate(Math.sin(f / 40 - i * 1.3), [-1, 1], [0.78, 1]);
          return (
            <React.Fragment key={name}>
              {i > 0 && <div style={{width: 10, height: 10, borderRadius: 5, background: ORANGE, transform: `scale(${prog(f, st - 6, 16, backOut)})`}} />}
              <span style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 10, marginBottom: -10}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - pp) * 120}%)`, opacity: hl}}>{name}</span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

const LockupSweep: React.FC<{f: number}> = ({f}) => {
  const starts = [300, 476, 552];
  const s = starts.find((x) => f >= x && f <= x + 50);
  if (s === undefined) return null;
  const p = prog(f, s, 50, Easing.bezier(0.4, 0, 0.2, 1));
  const x = lerp(LOCK_LEFT - 260, LOCK_LEFT + LOCK_W + 120, p);
  return (
    <div style={{position: 'absolute', left: LOCK_LEFT - 60, top: BLOCK_TOP - 30, width: LOCK_W + 120, height: H_M + 60, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -40, height: H_M + 140, left: x - (LOCK_LEFT - 60), width: 170, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))', transform: 'skewX(-32deg)'}} />
    </div>
  );
};

/* ---------- flash / streak / vignette / grain / fade ---------- */
const Overlays: React.FC<{f: number}> = ({f}) => {
  const e = f - FI;
  const flash = e >= 0 ? 0.32 * Math.exp(-e / 4) : 0;
  const streak = e >= 0 ? prog(f, FI, 14, outExpo) : 0;
  const so = e >= 0 ? Math.exp(-e / 22) : 0;
  const g = Math.floor(f % 4);
  const gx = [0, 173, 331, 97][g], gy = [0, 211, 59, 307][g];
  return (
    <>
      <AbsoluteFill style={{background: ORANGE, opacity: flash}} />
      {e >= 0 && (
        <>
          <div style={{position: 'absolute', left: W / 2 - 1000 * streak, width: 2000 * streak, top: MIC_HERO.y - 3, height: 6, background: 'linear-gradient(90deg, rgba(252,85,19,0), #FF5A14 50%, rgba(252,85,19,0))', opacity: so}} />
          <div style={{position: 'absolute', left: W / 2 - 1100 * streak, width: 2200 * streak, top: MIC_HERO.y - 40, height: 80, background: 'radial-gradient(ellipse at center, rgba(252,85,19,0.35), rgba(252,85,19,0) 70%)', opacity: so}} />
        </>
      )}
      <LockupSweep f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(150,80,30,0) 55%, rgba(150,80,30,0.2) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${gx}px ${gy}px`, opacity: 0.1, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: BG, opacity: prog(f, DUR - 16, 15, (n) => n)}} />
    </>
  );
};

/* ---------- scene ---------- */
const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const e = f - FI;
  const shake = e >= 0 && e < 40 ? Math.exp(-e / 9) : 0;
  const sx = shake * 18 * Math.sin(e * 2.4), sy = shake * 14 * Math.sin(e * 3.1 + 1);
  const punch = e >= 0 ? 1 + 0.045 * Math.exp(-e / 12) : 1;
  const push = 1 + 0.05 * (f / DUR) + 0.02 * prog(f, 0, 126, (n) => n);
  const rotZ = 0.3 * Math.sin(f / 80);
  const ry = 2.2 * Math.sin(f / 110), rx = 1.2 * Math.sin(f / 140 + 1);
  return (
    <AbsoluteFill>
      <Background f={f} />
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${push * punch}) rotate(${rotZ}deg) skewX(${ry * 0.25}deg)`, transformOrigin: '50% 48%'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <Dust f={f} />
            <Waveform f={f} />
            <LogoStage f={f} />
            <Rings f={f} />
            <Sparks f={f} />
          </svg>
          <Wordmark f={f} />
          <Ticker f={f} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Overlays f={f} />
    </AbsoluteFill>
  );
};

export const SBKIntro: React.FC = () => {
  useBrandFont();
  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('audio/sbk-intro.wav')} />
      <Scene />
    </AbsoluteFill>
  );
};
