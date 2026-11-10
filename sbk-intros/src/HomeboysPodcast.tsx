import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BLACK, EndFade, FONT, Mark, ORANGE, Vignette, Wordmark, backOut, outExpo, prog, useBrandFont} from './brand';

const BEAT = (60 / 104) * 30; // frames per beat @104 bpm
const WORDS = ['RELATIONSHIPS', 'MONEY', 'HUSTLE', 'CAMPUS LIFE', 'FAMILY', 'EVERYTHING'];
const TITLE_AT = Math.round(7 * BEAT); // 121

export const HomeboysPodcast: React.FC = () => {
  useBrandFont();
  const f = useCurrentFrame();

  const idx = Math.floor((f - BEAT) / BEAT); // which word is live
  const inWords = f >= BEAT && f < TITLE_AT;
  const sinceBeat = (f - BEAT) % BEAT;

  // title scene
  const t = f - TITLE_AT;
  const slam = prog(f, TITLE_AT, 9, backOut);
  const shake = t >= 0 && t < 10 ? Math.sin(t * 3) * (10 - t) * 1.6 : 0;
  const bar = prog(f, TITLE_AT + 10, 14, backOut);
  const tag = prog(f, TITLE_AT + 34, 22);
  const brand = prog(f, 205, 24);

  return (
    <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/homeboys.wav')} />

      {/* intro pop */}
      {f < BEAT && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{transform: `scale(${0.4 + 0.6 * prog(f, 0, 10, backOut)})`, opacity: prog(f, 0, 4, (n) => n)}}>
            <Mark height={460} />
          </div>
        </AbsoluteFill>
      )}

      {/* kinetic topics */}
      {inWords && idx >= 0 && (
        <AbsoluteFill style={{background: idx % 2 === 0 ? ORANGE : BLACK, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{
            fontFamily: FONT, fontWeight: 900, fontSize: WORDS[idx].length > 9 ? 190 : 330, letterSpacing: '-0.03em',
            color: idx % 2 === 0 ? BLACK : '#fff',
            transform: `scale(${1.28 - 0.28 * prog(sinceBeat, 0, 6, outExpo)}) skewX(-8deg)`,
            opacity: prog(sinceBeat, 0, 2, (n) => n),
          }}>
            {WORDS[idx]}
          </div>
          <div style={{position: 'absolute', bottom: 70, fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: '0.45em', color: idx % 2 === 0 ? BLACK : ORANGE, opacity: 0.9}}>
            WE TALK ABOUT
          </div>
        </AbsoluteFill>
      )}

      {/* title */}
      {f >= TITLE_AT && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(252,85,19,0.35), rgba(252,85,19,0) 60%)`}} />
          <div style={{position: 'absolute', top: 62, opacity: brand}}>
            <Wordmark width={230} tone="white" />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translate(${shake}px, ${-shake * 0.5}px) skewX(-8deg)`}}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 262, lineHeight: 0.95, letterSpacing: '-0.03em', color: '#fff', transform: `scale(${2.2 - 1.2 * slam})`, opacity: Math.min(1, slam * 3)}}>
              HOMEBOYS
            </div>
            <div style={{marginTop: 14, background: ORANGE, padding: '6px 70px 14px', transform: `scaleX(${bar})`, transformOrigin: 'left'}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 122, lineHeight: 1, letterSpacing: "0.14em", color: BLACK}}>PODCAST</div>
            </div>
          </div>
          <div style={{position: 'absolute', top: '77%', fontFamily: FONT, fontWeight: 900, fontSize: 42, letterSpacing: '0.3em', color: '#fff', opacity: tag * 0.92, transform: `translateY(${(1 - tag) * 20}px)`}}>
            NO TOPIC OFF LIMITS
          </div>
          {/* equalizer */}
          <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 20px'}}>
            {Array.from({length: 48}).map((_, i) => {
              const pulse = Math.pow(Math.max(0, Math.cos(((f - TITLE_AT) / BEAT) * Math.PI)), 3);
              const h = 20 + (Math.abs(Math.sin(i * 1.7 + f * 0.35)) * 0.6 + pulse * 0.4) * 120;
              return <div key={i} style={{flex: 1, height: h * prog(f, TITLE_AT + 20 + i * 0.5, 14), background: ORANGE, opacity: 0.9, borderRadius: 3}} />;
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* beat flash */}
      {inWords && <AbsoluteFill style={{background: '#fff', opacity: 0.22 * (1 - prog(sinceBeat, 0, 4, (n) => n))}} />}
      <Vignette strength={0.4} />
      <EndFade frame={f} />
    </AbsoluteFill>
  );
};
