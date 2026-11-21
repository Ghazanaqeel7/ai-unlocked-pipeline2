import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Zap, GitBranch, Sparkles} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel, springPop} from '../scenes/common.jsx';

// Bespoke one-off scene for job 902 ONLY (render_guide.md "Custom per-job scenes"): a three-icon
// "RECORD -> CODE -> SHIP" badge row demonstrating lucide-react in a custom_scenes component. Lives
// outside the shared REGISTRY on purpose — not generic enough to be worth adding there.
export const HybridBadge = ({text = 'Real clips. Real code. Zero manual recording.', polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const kIn = springPop(f, 0, {damping: 16});
  const steps = [
    {Icon: GitBranch, label: 'Record'},
    {Icon: Zap, label: 'Patch'},
    {Icon: Sparkles, label: 'Ship'},
  ];
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 40 : 30, padding: 40}}>
        <div style={{opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.92 + Math.min(1, kIn) * 0.08})`, display: 'flex', gap: narrow ? 30 : 36}}>
          {steps.map(({Icon, label}, i) => {
            const k = prog(f, 8 + i * 10, 16, ease);
            return (
              <GlassPanel key={label} radius={22} pad={narrow ? '28px 32px' : '22px 28px'} glow={t.accent} tn={tName}
                style={{opacity: k, transform: `translateY(${(1 - k) * 18}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                <Icon size={narrow ? 64 : 48} color={t.accent} strokeWidth={2.2} />
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 26 : 20, color: t.fg, textTransform: 'uppercase', letterSpacing: 1}}>{label}</div>
              </GlassPanel>
            );
          })}
        </div>
        <div style={{opacity: prog(f, 36, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 32 : 24, color: t.fg, textAlign: 'center', maxWidth: '82%'}}>
          {text}
        </div>
      </div>
    </>
  );
};
