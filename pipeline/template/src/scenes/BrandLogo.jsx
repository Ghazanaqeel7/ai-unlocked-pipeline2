import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {F} from '../theme.js';

// AI Graphic TV brand pieces. BrandLogo = the real channel logo (public/brand_logo.png) with a spring entrance,
// used prominently on every outro. BrandMark = compact vector watermark (no box, no border) for 16:9 long videos.
export const BrandLogo = ({size = 140, delay = 0}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const s = Math.min(1, Math.max(0, spring({frame: f - delay, fps, config: {damping: 14, stiffness: 120, mass: 0.9}})));
  return (
    <div style={{width: size, height: size, flex: '0 0 auto', borderRadius: Math.round(size * 0.22), overflow: 'hidden', opacity: Math.min(1, s * 1.5), transform: `scale(${0.7 + 0.3 * s})`, boxShadow: '0 0 36px rgba(56,189,248,.35), 0 0 0 2px rgba(245,158,11,.55)'}}>
      <Img src={staticFile('brand_logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}} />
    </div>
  );
};

export const BrandMark = ({height = 46, opacity = 0.62}) => {
  const w = Math.round(height * 4.9);
  return (
    <svg width={w} height={height} viewBox="0 0 245 50" style={{display: 'block', opacity, overflow: 'visible'}}>
      <defs><linearGradient id="bmg" x1="0" x2="1"><stop offset="0" stopColor="#38BDF8" /><stop offset="1" stopColor="#F59E0B" /></linearGradient></defs>
      <circle cx="25" cy="25" r="17" fill="none" stroke="url(#bmg)" strokeWidth="3.2" />
      <ellipse cx="25" cy="25" rx="24" ry="8" fill="none" stroke="#F59E0B" strokeWidth="2.2" transform="rotate(-24 25 25)" opacity=".9" />
      <circle cx="25" cy="25" r="4.5" fill="#38BDF8" />
      <text x="60" y="22" fill="#E8EEF7" fontSize="19" fontWeight="700" letterSpacing="0.5" fontFamily={F.head}>AI GRAPHIC</text>
      <text x="60" y="43" fill="#38BDF8" fontSize="17" fontWeight="700" letterSpacing="5" fontFamily={F.head}>TV</text>
    </svg>
  );
};
