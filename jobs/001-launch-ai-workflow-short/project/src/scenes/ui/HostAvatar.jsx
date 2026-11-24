import React from 'react';
import {useCurrentFrame} from 'remotion';

// AI Graphic TV's animated 2D editorial host character — a flat-vector tech-analyst, pure SVG (no raster
// assets, so it's crisp at any size and trademark-safe by construction: an original invented character,
// never a real person or a licensed mascot). Palette: high-contrast dark-navy #0A1220 body/hair, electric
// cyan #06B6D4 jacket trim, warm orange/gold #FF7A1A accent (tie / collar stripe).
//
// `pose`: 'alert' | 'explaining' | 'pointing' | 'celebrate' — arm position + eyebrow/mouth shape change.
// `size`: rendered height in px (width auto at 0.72 aspect). `delay`: frame offset so a PiP entrance can
// stagger after its parent scene's own intro. Idle motion (blink, breathing, head micro-bob) runs
// continuously off useCurrentFrame so the character never looks like a frozen sticker.
const NAVY = '#0A1220', CYAN = '#06B6D4', GOLD = '#FF7A1A', SKIN = '#E8B894', SKIN_SH = '#D29E72';

export const HostAvatar = ({pose = 'explaining', size = 220, delay = 0, style, sticker = true}) => {
  const f = Math.max(0, useCurrentFrame() - delay);
  // idle breathing: slow torso scale
  const breathe = 1 + Math.sin(f / 22) * 0.012;
  // idle head micro-bob, a little livelier on 'celebrate'
  const bobAmp = pose === 'celebrate' ? 4.5 : 2.2;
  const headY = Math.sin(f / (pose === 'celebrate' ? 9 : 16)) * bobAmp;
  const headTilt = Math.sin(f / 28) * (pose === 'alert' ? 1.5 : 3);
  // blink: closed for ~4 frames every ~95 frames, phase-seeded so it's not perfectly metronomic
  const cyclePos = f % 97;
  const blink = cyclePos > 90 && cyclePos < 96;
  // alert pose gets a subtle shake/pulse on the frame it starts
  const shakeT = f;
  const shakeX = pose === 'alert' ? Math.sin(shakeT * 1.6) * Math.max(0, 3 - shakeT * 0.15) : 0;

  const armPaths = {
    // both arms down/relaxed, slightly tense (crossed-ish) for alert
    alert: {
      left: 'M98,230 Q78,255 82,285 Q84,300 100,302',
      right: 'M202,230 Q222,255 218,285 Q216,300 200,302',
    },
    explaining: {
      left: 'M98,230 Q70,245 64,270 Q60,286 74,292',
      right: 'M202,230 Q236,238 248,218 Q254,206 244,196',
    },
    pointing: {
      left: 'M98,230 Q80,248 80,272 Q80,288 94,292',
      right: 'M202,228 Q244,210 276,176 Q284,168 278,160',
    },
    celebrate: {
      left: 'M98,228 Q68,196 58,152 Q54,136 64,126',
      right: 'M202,228 Q232,196 242,152 Q246,136 236,126',
    },
  }[pose] || armPaths_fallback();
  function armPaths_fallback() { return {left: 'M98,230 Q78,255 82,285 Q84,300 100,302', right: 'M202,230 Q222,255 218,285 Q216,300 200,302'}; }

  const brow = {
    alert: {ly: 150, ry: 150, angle: 8},      // furrowed, angled in (worry/urgency)
    explaining: {ly: 146, ry: 146, angle: 0},
    pointing: {ly: 144, ry: 148, angle: 2},
    celebrate: {ly: 140, ry: 140, angle: -4}, // raised
  }[pose];

  const mouth = {
    alert: 'M138,196 Q150,190 162,196',               // tense flat-ish
    explaining: 'M136,194 Q150,210 164,194',           // open, mid-speech
    pointing: 'M138,196 Q150,206 162,196',
    celebrate: 'M132,190 Q150,216 168,190',            // big grin
  }[pose];

  return (
    <div style={{
      width: size * 0.72, height: size, position: 'relative', ...style,
      // crisp white die-cut sticker border + drop shadow (high-budget SaaS-launch finish): a thin
      // white outline "cut" around the character plus a soft multi-layer shadow, same look as a
      // printed sticker peeled off a sheet — never a flat floating SVG with no ground beneath it.
      filter: sticker
        ? 'drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 10px 18px rgba(0,0,0,.35)) drop-shadow(0 2px 4px rgba(0,0,0,.25))'
        : undefined,
    }}>
      <svg viewBox="0 0 300 400" width="100%" height="100%" style={{overflow: 'visible'}}>
        <g transform={`translate(${shakeX},0)`}>
          {/* soft ambient glow behind the character */}
          <ellipse cx="150" cy="330" rx="88" ry="20" fill={CYAN} opacity="0.12" />

          {/* torso / jacket */}
          <g transform={`scale(1,${breathe}) translate(0, ${(1 - breathe) * -260})`}>
            <path d="M150,210 C112,210 90,236 86,280 L84,340 Q150,356 216,340 L214,280 C210,236 188,210 150,210 Z" fill={NAVY} />
            <path d="M150,210 C130,210 114,220 104,236 L150,268 L196,236 C186,220 170,210 150,210 Z" fill={CYAN} opacity="0.9" />
            <path d="M138,228 L150,268 L162,228 Z" fill={GOLD} />
            {/* arms */}
            <path d={armPaths.left} stroke={NAVY} strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d={armPaths.right} stroke={NAVY} strokeWidth="26" fill="none" strokeLinecap="round" />
            <circle cx={pose === 'pointing' ? 282 : pose === 'celebrate' ? 237 : pose === 'explaining' ? 246 : 218} cy={pose === 'pointing' ? 158 : pose === 'celebrate' ? 123 : pose === 'explaining' ? 194 : 302} r="13" fill={SKIN} />
            <circle cx={pose === 'alert' ? 100 : pose === 'celebrate' ? 63 : pose === 'pointing' ? 94 : 74} cy={pose === 'alert' ? 302 : pose === 'celebrate' ? 123 : pose === 'pointing' ? 292 : 292} r="13" fill={SKIN} />
          </g>

          {/* head group: bob + tilt */}
          <g transform={`translate(150, ${150 + headY}) rotate(${headTilt})`}>
            <g transform="translate(-150,-150)">
              <circle cx="150" cy="150" r="64" fill={SKIN} />
              <ellipse cx="150" cy="168" rx="58" ry="40" fill={SKIN_SH} opacity="0.25" />
              {/* hair */}
              <path d="M90,132 Q86,78 150,74 Q214,78 210,132 Q210,96 150,96 Q90,96 90,132 Z" fill={NAVY} />
              <path d="M90,132 Q84,150 92,168 L100,160 Q92,146 96,128 Z" fill={NAVY} />
              <path d="M210,132 Q216,150 208,168 L200,160 Q208,146 204,128 Z" fill={NAVY} />
              {/* glasses (tech-analyst signature prop) */}
              <rect x="110" y="140" width="34" height="24" rx="8" fill="none" stroke={NAVY} strokeWidth="4" />
              <rect x="156" y="140" width="34" height="24" rx="8" fill="none" stroke={NAVY} strokeWidth="4" />
              <line x1="144" y1="150" x2="156" y2="150" stroke={NAVY} strokeWidth="4" />
              {/* eyebrows */}
              <path d={`M112,${brow.ly} q14,${-brow.angle} 26,0`} stroke={NAVY} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d={`M162,${brow.ry} q14,${-brow.angle} 26,0`} stroke={NAVY} strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* eyes (blink = thin closed line) */}
              {blink ? (
                <>
                  <line x1="118" y1="152" x2="138" y2="152" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
                  <line x1="168" y1="152" x2="188" y2="152" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="128" cy="152" r="5.5" fill={NAVY} />
                  <circle cx="178" cy="152" r="5.5" fill={NAVY} />
                </>
              )}
              {/* mouth */}
              <path d={mouth} stroke={NAVY} strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
