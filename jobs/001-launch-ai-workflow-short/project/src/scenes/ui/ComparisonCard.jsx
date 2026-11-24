import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, C, tone} from '../../theme.js';
import {prog, ease, fmtNum} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';

const isNum = (x) => typeof x === 'number' && isFinite(x);

// Two glass cards side by side ("Old Way" vs "AI Way" or Tool A vs Tool B), each row either a counting
// number + bar, or a short text value with a check/cross dot. Replaces Compare.jsx's VS-badge split-screen
// with the channel's glass-card language; same row data shape so writers barely need to relearn anything.
// params:
//   title           — small kicker above the two cards
//   a / b           — {name, color?} — card headers ("Old Way"/"AI Way", "ChatGPT"/"Claude", etc.)
//   rows            — [{label, a, b, unit, dec, win:'a'|'b'}] — a/b values: number (bar+count) or short text
//   tone
export const ComparisonCard = ({title, a = {name: 'Before'}, b = {name: 'After'}, rows = [], tone: tn = 'glass'}) => {
  const f = useCurrentFrame(); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const ca = a.color || t.sub, cb = b.color || t.accent2 || t.accent;
  const kIn = springPop(f, 0, {damping: 18});
  const Card = ({side, color, align}) => (
    <div style={{flex: 1, opacity: Math.min(1, kIn * 1.3), transform: `translateY(${(1 - Math.min(1, kIn)) * 30}px)`}}>
      <GlassPanel radius={24} pad={narrow ? '24px 24px' : '32px 36px'} glow={color} style={{height: '100%'}}>
        <div style={{fontFamily: F.display, fontSize: narrow ? 36 : 48, color, textTransform: 'uppercase', marginBottom: 20, textAlign: align}}>{side.name}</div>
        {rows.map((r, i) => {
          const at = 16 + i * 12; const k = prog(f, at, 14, ease);
          const v = side === a ? r.a : r.b;
          const other = side === a ? r.b : r.a;
          const won = r.win ? (side === a ? r.win === 'a' : r.win === 'b') : null;
          return (
            <div key={i} style={{marginBottom: narrow ? 18 : 24, opacity: k}}>
              <div style={{fontFamily: F.mono, fontSize: narrow ? 16 : 20, color: t.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6}}>{r.label}</div>
              {isNum(v) ? (
                <>
                  <div style={{fontFamily: F.display, fontSize: narrow ? 34 : 44, color: t.fg}}>{fmtNum(v * k, r.dec || 0)}{r.unit || ''}</div>
                  <div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', marginTop: 8, overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${Math.min(100, (Math.abs(v) / Math.max(Math.abs(v), isNum(other) ? Math.abs(other) : 1, 1)) * 100 * k)}%`, background: color, borderRadius: 4}} />
                  </div>
                </>
              ) : (
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  {won != null && <span style={{width: 26, height: 26, borderRadius: 13, flex: '0 0 auto', background: won ? '#22b07d' : '#e0432f', display: 'inline-block'}} />}
                  <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 30, color: t.fg}}>{String(v)}</span>
                </div>
              )}
            </div>
          );
        })}
      </GlassPanel>
    </div>
  );
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      {title && <div style={{position: 'absolute', left: 0, right: 0, top: narrow ? 70 : 90, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 22 : 30, letterSpacing: 6, color: t.sub, textTransform: 'uppercase', opacity: prog(f, 0, 12)}}>{title}</div>}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? '140px 40px 60px' : '170px 120px 90px'}}>
        <div style={{display: 'flex', flexDirection: narrow ? 'column' : 'row', gap: narrow ? 20 : 36, width: '100%', maxWidth: narrow ? 900 : 1700}}>
          <Card side={a} color={ca} align="left" />
          <Card side={b} color={cb} align="left" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
