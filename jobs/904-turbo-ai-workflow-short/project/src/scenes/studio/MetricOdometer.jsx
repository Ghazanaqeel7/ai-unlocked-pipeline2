import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Easing} from 'remotion';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, fmtNum} from '../../util.js';
import {StudioBg, StudioCard} from '../common.jsx';
import {StudioHeadline} from './StudioHeadline.jsx';

// `MetricOdometer`: a fast rolling-number counter (0 -> 1,000,000 style) OR a flip-clock digit counter,
// with a spring overshoot as it lands on the final value. docs/style_reference.md's signature
// "big number pays off the hook" beat.
// params:
//   label, sub      — small caption above/below the number
//   value, prefix, suffix — the number to count up to, e.g. value:1000000, prefix:'', suffix:'+'
//   mode            — 'roll' (default, smooth count-up) | 'flip' (per-digit flip-clock tiles)
//   duration        — frames to count over (default 60)
//   theme
export const MetricOdometer = ({kicker, label, sub, value = 0, prefix = '', suffix = '', mode = 'roll', duration = 60, theme}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const kRaw = prog(f, 10, duration, Easing.out(Easing.cubic));
  const overshoot = f > 10 + duration ? 1 + Math.max(0, Math.sin((f - 10 - duration) / 4)) * 0.04 * Math.exp(-(f - 10 - duration) / 14) : 1;
  const shown = Math.round(value * kRaw);
  const str = String(shown);

  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 30 : 36, padding: '0 60px'}}>
        {(kicker || label) && (
          <div style={{textAlign: 'center'}}>
            {kicker && <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 20 : 22, letterSpacing: 3, textTransform: 'uppercase', color: t.accent, marginBottom: 10, opacity: prog(f, 0, 10)}}>{kicker}</div>}
            {label && <StudioHeadline text={label} theme={tn} size={narrow ? 40 : 54} />}
          </div>
        )}
        <StudioCard radius={28} pad={narrow ? '40px 50px' : '46px 70px'} glow={t.accent} style={{transform: `scale(${overshoot})`}}>
          {mode === 'flip' ? (
            <div style={{display: 'flex', gap: 10}}>
              {str.split('').map((d, i) => <Digit key={i} d={d} tn={tn} narrow={narrow} />)}
            </div>
          ) : (
            <div style={{fontFamily: F.display, fontSize: narrow ? 96 : 150, color: t.accent, letterSpacing: 1, lineHeight: 1}}>
              {prefix}{fmtNum(shown)}{suffix}
            </div>
          )}
        </StudioCard>
        {sub && <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 26 : 30, color: t.sub, opacity: prog(f, 16 + duration, 14), textAlign: 'center'}}>{sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Digit = ({d, tn, narrow}) => {
  const t = tone(tn);
  return (
    <div style={{
      width: narrow ? 56 : 78, height: narrow ? 78 : 108, borderRadius: 10, background: t.light ? '#0F172A' : 'rgba(255,255,255,.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.line}`,
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.25)',
    }}>
      <div style={{fontFamily: F.display, fontSize: narrow ? 44 : 60, color: t.light ? '#FFFFFF' : t.fg}}>{d}</div>
    </div>
  );
};
