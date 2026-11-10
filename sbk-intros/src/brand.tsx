import React, {useEffect, useState} from 'react';
import {Easing, Img, continueRender, delayRender, interpolate, staticFile} from 'remotion';

export const FPS = 30;
export const DURATION = 300; // 10 s
export const ORANGE = '#FC5513';
export const BLACK = '#0A0A0A';
export const CREAM = '#FDF8F2';
export const FONT = "'SBK Display', Inter, 'Helvetica Neue', Arial, sans-serif";

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOutCubic = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 progress between start and start+dur with an easing. */
export const prog = (frame: number, start: number, dur: number, easing: (n: number) => number = outExpo) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Loads the bundled Inter Black so renders never depend on system fonts. */
export const useBrandFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const black = new FontFace('SBK Display', `url(${staticFile('Inter-Black.otf')})`, {weight: '900'});
    black
      .load()
      .then((f) => {
        document.fonts.add(f);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Mark: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <Img src={staticFile('sbk-mark.png')} style={{height, width: 'auto', display: 'block', ...style}} />
);

export const Wordmark: React.FC<{width: number; tone?: 'white' | 'black'; style?: React.CSSProperties}> = ({
  width,
  tone = 'white',
  style,
}) => <Img src={staticFile(`sbk-wordmark-${tone}.png`)} style={{width, height: 'auto', display: 'block', ...style}} />;

/** Letters slide up out of a mask, one after another. */
export const SplitText: React.FC<{
  text: string;
  frame: number;
  start: number;
  size: number;
  color: string;
  stagger?: number;
  tracking?: string;
  weight?: number;
}> = ({text, frame, start, size, color, stagger = 2, tracking = '-0.02em', weight = 900}) => (
  <div style={{display: 'flex', justifyContent: 'center', fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: tracking, color}}>
    {text.split('').map((ch, i) => {
      const p = prog(frame, start + i * stagger, 22);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`, whiteSpace: 'pre'}}>{ch}</span>
        </span>
      );
    })}
  </div>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`}} />
);

/** Fades the whole piece to black in the last frames so editors get a clean cut. */
export const EndFade: React.FC<{frame: number; color?: string}> = ({frame, color = '#000'}) => (
  <div style={{position: 'absolute', inset: 0, background: color, opacity: prog(frame, DURATION - 9, 8, (n) => n), pointerEvents: 'none'}} />
);
