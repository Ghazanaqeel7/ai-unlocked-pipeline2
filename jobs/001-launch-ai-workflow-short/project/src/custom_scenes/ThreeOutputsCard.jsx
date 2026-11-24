import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FileText, Headphones, Presentation, Network, ArrowDown} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel, springPop, HostAvatarPiP} from '../scenes/common.jsx';

// Bespoke "key twist" hero for 001-launch-ai-workflow-short (render_guide.md "bespoke per-job scenes
// are now the default"): 1 PDF -> 3 outputs, laid out as a DENSE VERTICAL FLOW (hub, a connector, then
// 3 full-width output rows stacked top to bottom) so the beat genuinely fills the 55-65% vertical hero
// stage with real content -- not a few small tiles spread thin across empty space (the earlier
// "space-evenly across the whole canvas" attempt here still left most of the frame empty; stacking
// full-width rows is what actually makes a beat read as dense). HostAvatar docked bottom-right in
// 'explaining' pose (render_guide.md: HostAvatar should show up on Hook, Key Twist, and CTA beats --
// this is the Key Twist beat).
export const ThreeOutputsCard = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const hubK = springPop(f, 0, {damping: 15});
  const outputs = [
    {Icon: Headphones, label: 'Podcast', sub: 'Audio Overview'},
    {Icon: Presentation, label: 'Slide deck', sub: 'Studio panel'},
    {Icon: Network, label: 'Mind map', sub: 'Studio panel'},
  ];
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 14 : 10, padding: narrow ? '0 56px' : '0 90px'}}>
        <div style={{opacity: Math.min(1, hubK * 1.3), transform: `scale(${0.9 + Math.min(1, hubK) * 0.1})`}}>
          <GlassPanel radius={26} pad={narrow ? '28px 44px' : '20px 32px'} glow={t.accent} tn={tName}
            style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <FileText size={narrow ? 48 : 38} color={t.accent} strokeWidth={2} />
            <div style={{fontFamily: F.display, fontSize: narrow ? 28 : 20, color: t.fg, letterSpacing: 1}}>1 PDF</div>
          </GlassPanel>
        </div>
        <ArrowDown size={narrow ? 34 : 26} color={t.sub} style={{opacity: prog(f, 8, 12, ease)}} />
        {outputs.map(({Icon, label, sub}, i) => {
          const k = prog(f, 12 + i * 11, 16, ease);
          return (
            <GlassPanel key={label} radius={20} pad={narrow ? '22px 28px' : '16px 22px'} glow={t.accent2 || t.accent} tn={tName}
              style={{
                opacity: k, transform: `translateX(${(1 - k) * 40}px)`, width: '100%', maxWidth: narrow ? 880 : 680,
                display: 'flex', alignItems: 'center', gap: narrow ? 22 : 16,
              }}>
              <div style={{
                width: narrow ? 72 : 56, height: narrow ? 72 : 56, borderRadius: 16, flex: '0 0 auto',
                background: `${t.accent2 || t.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={narrow ? 38 : 30} color={t.accent2 || t.accent} strokeWidth={2.1} />
              </div>
              <div>
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 30 : 21, color: t.fg}}>{label}</div>
                <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 19 : 14, color: t.sub}}>{sub}</div>
              </div>
            </GlassPanel>
          );
        })}
        <div style={{marginTop: narrow ? 10 : 6, opacity: prog(f, 48, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 28 : 20, color: t.sub, textAlign: 'center', maxWidth: '86%'}}>
          Same upload. One Studio panel. Three finished outputs.
        </div>
      </div>
      <HostAvatarPiP frame={f} narrow={narrow} pose="explaining" at={24} />
    </>
  );
};
