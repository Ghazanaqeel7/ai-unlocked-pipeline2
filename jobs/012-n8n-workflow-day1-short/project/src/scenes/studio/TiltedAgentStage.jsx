import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {StudioBg, StudioCard} from '../common.jsx';
import {StudioHeadline} from './StudioHeadline.jsx';

// `TiltedAgentStage` (docs/style_reference.md, from @crackshash_mod): a 3D-perspective floating
// multi-pane workspace — left agent/step sidebar + center live reasoning/output card + right live
// terminal/code stream — with a smooth automated camera zoom-in/pan that drifts between the panes
// every 2-3 seconds. Essential for 16:9 long-form retention and GitHub/AI-tool breakdowns.
// params:
//   kicker, headline, accent — optional top StudioHeadline
//   steps     — left sidebar: [{label, active}] (3-6 entries)
//   output    — center pane: {title, lines:[string]} — live "reasoning" text that reveals line by line
//   terminal  — right pane: {title, lines:[{text,status:'running'|'ok'}]}
//   focus     — which pane the camera drifts toward, in order, e.g. ['left','center','right'] (defaults
//               to a full left->center->right->center sweep across the beat)
//   theme     — 'sand' | 'studio' | 'obsidian' (default 'obsidian' — this primitive is built for it)
export const TiltedAgentStage = ({kicker, headline, accent = [], steps = [], output, terminal, focus, theme, frames = 150}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme || 'obsidian'); const t = tone(tn); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  // 42-55% vh full-bleed stage (style_reference.md fix #2) — but only for wide/side-by-side layout.
  // In narrow/9:16 mode the 3 panes STACK (flexDirection:'column'), so forcing each to ~48% of
  // the full video height overflows badly (3 x 48% > 100%). Use a content-driven compact height there.
  const paneH = narrow ? Math.round(h * 0.2) : Math.round(h * 0.46);
  const order = focus && focus.length ? focus : ['left', 'center', 'right', 'center'];
  const segDur = frames / order.length;
  const segIdx = Math.min(order.length - 1, Math.floor(f / segDur));
  const segK = prog(f, segIdx * segDur, segDur * 0.7, ease);
  const targets = {left: {x: 6, s: 1.12}, center: {x: 0, s: 1.0}, right: {x: -6, s: 1.12}};
  const prevTarget = targets[order[Math.max(0, segIdx - 1)]] || targets.center;
  const curTarget = targets[order[segIdx]] || targets.center;
  const camX = prevTarget.x + (curTarget.x - prevTarget.x) * segK;
  const camS = prevTarget.s + (curTarget.s - prevTarget.s) * segK;

  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', paddingTop: '12%'}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} />}
        <div style={{
          flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1800,
          marginTop: narrow ? 30 : 16,
        }}>
          <div style={{
            display: 'flex', flexDirection: narrow ? 'column' : 'row', gap: narrow ? 18 : 22,
            transform: `rotateX(8deg) rotateY(${6 - camX * 0.3}deg) translateX(${camX * 10}px) scale(${camS})`,
            transformStyle: 'preserve-3d', width: narrow ? '90%' : '88%',
          }}>
            <Pane w={narrow ? '100%' : '24%'} h={paneH} tn={tn} glow={t.accent2 || t.accent} active={order[segIdx] === 'left'} delay={6}>
              <PaneTitle text="AGENT STEPS" tn={tn} />
              {steps.slice(0, 6).map((s, i) => {
                const k = prog(f, 10 + i * 6, 12, ease);
                const spec = typeof s === 'string' ? {label: s} : s;
                return (
                  <div key={i} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, transform: `translateX(${(1 - k) * -14}px)`}}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flex: '0 0 auto',
                      background: spec.active ? t.accent : 'transparent', border: `2px solid ${t.accent}`,
                    }} />
                    <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 20 : 16, color: spec.active ? t.fg : t.sub}}>{spec.label}</div>
                  </div>
                );
              })}
            </Pane>
            <Pane w={narrow ? '100%' : '38%'} h={paneH} tn={tn} glow={t.accent} active={order[segIdx] === 'center'} delay={14}>
              <PaneTitle text={(output && output.title) || 'LIVE REASONING'} tn={tn} />
              {(output?.lines || []).slice(0, 6).map((line, i) => {
                const k = prog(f, 20 + i * 10, 14, ease);
                return (
                  <div key={i} style={{opacity: k, fontFamily: F.mono, fontSize: narrow ? 17 : 14.5, color: t.fg, marginBottom: 10, lineHeight: 1.4}}>
                    <span style={{color: t.accent}}>{'> '}</span>{line}
                  </div>
                );
              })}
            </Pane>
            <Pane w={narrow ? '100%' : '30%'} h={paneH} tn={tn} glow={t.accent2 || t.accent} active={order[segIdx] === 'right'} delay={22}>
              <PaneTitle text={(terminal && terminal.title) || 'TERMINAL'} tn={tn} />
              {(terminal?.lines || []).slice(0, 6).map((ln, i) => {
                const spec = typeof ln === 'string' ? {text: ln, status: 'ok'} : ln;
                const k = prog(f, 26 + i * 9, 10, ease);
                const okColor = spec.status === 'ok' ? '#34d399' : t.accent;
                return (
                  <div key={i} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.mono, fontSize: narrow ? 16 : 13.5, color: t.fg, marginBottom: 9}}>
                    <span style={{color: okColor}}>{spec.status === 'ok' ? '✓' : '●'}</span>
                    <span style={{opacity: 0.9}}>{spec.text}</span>
                  </div>
                );
              })}
            </Pane>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Pane = ({children, w, h, tn, glow, active, delay}) => {
  const f = useCurrentFrame(); const k = prog(f, delay, 16, ease);
  return (
    <div style={{
      width: w, opacity: k, transform: `translateY(${(1 - k) * 24}px) scale(${active ? 1.02 : 1})`,
      transition: 'none',
    }}>
      <StudioCardFill tn={tn} h={h} glow={active ? glow : undefined}>{children}</StudioCardFill>
    </div>
  );
};
const StudioCardFill = ({children, tn, h, glow}) => (
  <StudioCard radius={18} pad="22px 24px" tn={tn} glow={glow} style={{minHeight: h || 220}}>{children}</StudioCard>
);
const PaneTitle = ({text, tn}) => {
  const t = tone(tn);
  return <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 13, letterSpacing: 2, color: t.sub, marginBottom: 14, textTransform: 'uppercase'}}>{text}</div>;
};
