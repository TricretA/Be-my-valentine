import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BLACK, EndFade, FONT, Mark, ORANGE, SplitText, Vignette, Wordmark, inOutCubic, outExpo, prog, useBrandFont} from './brand';

const WORDS = [
  {t: 'TRUTH', x: 8, y: 22, s: 150, sp: 0.35},
  {t: 'PATIENCE', x: 62, y: 12, s: 120, sp: 0.5},
  {t: 'DISCIPLINE', x: 4, y: 72, s: 130, sp: 0.4},
  {t: 'PURPOSE', x: 58, y: 70, s: 150, sp: 0.3},
  {t: 'GROWTH', x: 36, y: 86, s: 110, sp: 0.55},
];

export const WisdomChronicles: React.FC = () => {
  useBrandFont();
  const f = useCurrentFrame();

  // --- Scene A: brand sting (0–100)
  const markIn = prog(f, 6, 34);
  const markOut = prog(f, 88, 10, inOutCubic);
  const presents = prog(f, 44, 22);
  const sceneA = f < 100;

  // --- flash cut into the title
  const flash = interpolate(f, [92, 98, 118], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // --- Scene B: title (96→)
  const push = 1 + 0.06 * prog(f, 96, 204, (n) => n);
  const bar = prog(f, 126, 26);
  const tag = prog(f, 150, 26);
  const brand = prog(f, 214, 26);
  const glow = 0.28 + 0.1 * Math.sin(f / 22);

  return (
    <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/wisdom.wav')} />

      {/* breathing glow */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(252,85,19,${glow}) 0%, rgba(252,85,19,0) 55%)`, transform: `scale(${1 + f / 900})`}} />

      {/* floating wisdom words */}
      {WORDS.map((w, i) => {
        const a = prog(f, 100 + i * 8, 40) * 0.1;
        return (
          <div key={w.t} style={{position: 'absolute', left: `${w.x}%`, top: `${w.y}%`, fontFamily: FONT, fontWeight: 900, fontSize: w.s, color: 'transparent', WebkitTextStroke: '2px #fff', opacity: a, transform: `translateY(${-(f - 100) * w.sp}px)`, letterSpacing: '0.04em'}}>
            {w.t}
          </div>
        );
      })}

      {/* Scene A */}
      {sceneA && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - markOut}}>
          {[0, 1, 2, 3].map((i) => {
            const p = prog(f, 20 + i * 18, 70, (n) => 1 - Math.pow(1 - n, 2));
            return <div key={i} style={{position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: `4px solid ${ORANGE}`, opacity: (1 - p) * 0.7 * (p > 0 ? 1 : 0), transform: `scale(${0.7 + p * 3.4})`}} />;
          })}
          <div style={{transform: `scale(${0.8 + 0.2 * markIn + markOut * 0.25})`, opacity: markIn, filter: `blur(${(1 - markIn) * 18}px)`}}>
            <Mark height={420} />
          </div>
          <div style={{position: 'absolute', top: '73%', fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: '0.5em', color: '#fff', opacity: presents * 0.9, transform: `translateY(${(1 - presents) * 16}px)`}}>
            SBK MEDIA TV PRESENTS
          </div>
        </AbsoluteFill>
      )}

      {/* Scene B */}
      {f >= 96 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${push})`}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: -60}}>
            <SplitText text="WISDOM" frame={f} start={100} size={300} color="#fff" stagger={2} />
            <SplitText text="CHRONICLES" frame={f} start={112} size={158} color={ORANGE} stagger={1.5} tracking="0.07em" />
            <div style={{marginTop: 34, height: 8, width: 1000, background: ORANGE, transform: `scaleX(${bar})`, transformOrigin: 'center'}} />
            <div style={{marginTop: 34, fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: '0.32em', color: '#fff', opacity: tag * 0.9, transform: `translateY(${(1 - tag) * 22}px)`}}>
              WISDOM FOR EVERY COMRADE
            </div>
          </div>
          <div style={{position: 'absolute', bottom: 62, opacity: brand * 0.95, transform: `translateY(${(1 - brand) * 14}px)`}}>
            <Wordmark width={240} tone="white" />
          </div>
        </AbsoluteFill>
      )}

      <Vignette />
      <AbsoluteFill style={{background: ORANGE, opacity: flash * 0.9}} />
      <EndFade frame={f} />
    </AbsoluteFill>
  );
};
