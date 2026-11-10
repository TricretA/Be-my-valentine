import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {BLACK, CREAM, EndFade, FONT, Mark, ORANGE, SplitText, Wordmark, inOutCubic, outExpo, prog, useBrandFont} from './brand';

const TICKS = 60;
const R = 330;

export const StoryHour: React.FC = () => {
  useBrandFont();
  const f = useCurrentFrame();

  // clock sweep (accelerating): f10→84
  const sweep = prog(f, 10, 74, (n) => n * n * (3 - 2 * n) * 0.6 + n * 0.4);
  const markIn = prog(f, 4, 30);
  const presents = prog(f, 40, 22);

  // iris wipe to orange: f80→104
  const iris = prog(f, 80, 24, inOutCubic);
  const irisR = iris * 1500;

  // title
  const tag = prog(f, 150, 28);
  const brand = prog(f, 212, 26);
  const quote = prog(f, 104, 40);

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/story.wav')} />

      {/* Scene A: the "hour" ticking round */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: f < 110 ? 1 : 0}}>
        <svg width={1000} height={1000} viewBox="-500 -500 1000 1000" style={{position: 'absolute', transform: `scale(${0.92 + 0.08 * markIn})`, opacity: markIn}}>
          {Array.from({length: TICKS}).map((_, i) => {
            const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
            const lit = sweep * TICKS > i;
            const major = i % 5 === 0;
            const r1 = R - (major ? 58 : 34);
            return (
              <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke={lit ? ORANGE : BLACK} strokeOpacity={lit ? 1 : 0.18} strokeWidth={major ? 9 : 5} strokeLinecap="round" />
            );
          })}
        </svg>
        <div style={{transform: `scale(${0.85 + 0.15 * markIn})`, opacity: markIn}}>
          <Mark height={270} />
        </div>
        <div style={{position: 'absolute', top: "89%", fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: '0.5em', color: BLACK, opacity: presents * 0.85}}>
          SBK MEDIA TV PRESENTS
        </div>
      </AbsoluteFill>

      {/* Iris wipe */}
      <AbsoluteFill style={{background: ORANGE, clipPath: `circle(${irisR}px at 50% 50%)`}} />

      {/* Scene B: title on orange */}
      {f >= 92 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', left: '6%', top: '-6%', fontFamily: 'Georgia, serif', fontSize: 1100, lineHeight: 1, color: BLACK, opacity: quote * 0.09, transform: `translateY(${(1 - quote) * 80}px)`}}>“</div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: -30}}>
            <SplitText text="STORY" frame={f} start={100} size={300} color={BLACK} stagger={2.2} tracking="-0.03em" />
            <SplitText text="HOUR" frame={f} start={114} size={300} color={CREAM} stagger={2.2} tracking="-0.03em" />
            <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: "0.2em", color: BLACK, opacity: tag, transform: `translateY(${(1 - tag) * 22}px)`}}>
              REAL PEOPLE. REAL STORIES. REAL INSPIRATION.
            </div>
          </div>
          <div style={{position: 'absolute', bottom: 62, opacity: brand, transform: `translateY(${(1 - brand) * 14}px)`}}>
            <Wordmark width={240} tone="black" />
          </div>
        </AbsoluteFill>
      )}
      <EndFade frame={f} />
    </AbsoluteFill>
  );
};
