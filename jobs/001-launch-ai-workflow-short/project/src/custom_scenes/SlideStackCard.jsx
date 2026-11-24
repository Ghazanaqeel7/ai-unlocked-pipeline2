import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Presentation, BarChart3, List, Quote} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Output #2 zoom-in: NotebookLM's real Studio "Slide Deck" output.
// REDESIGN (high-budget SaaS-launch polish pass): the original fanned-stack layout rotated 3 copies
// of the SAME full-size glass panel around a shared center -- each one fully covered the last, so only
// the frontmost card's icon/label was ever visible (check_s5_settled.jpg confirmed this: a single flat
// dark slab, unreadable as "3 slides"). Replaced with the same dense-vertical-list pattern that fixed
// ThreeOutputsCard.jsx: a thin mini-slide "preview" strip at top (all 3 slide thumbnails visible at
// once, left-to-right, so the deck reads as a deck) plus 3 full-width label rows revealing in sequence
// below it -- genuinely distinct content per row, no overlap, no hidden labels.
const SLIDES = [
  {Icon: List, label: 'Key points'},
  {Icon: BarChart3, label: 'The numbers'},
  {Icon: Quote, label: 'Sourced quote'},
];

export const SlideStackCard = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const thumbK = prog(f, 0, 14, ease);

  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 18 : 14, padding: narrow ? '0 56px' : '0 90px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: narrow ? 6 : 4}}>
          <Presentation size={narrow ? 34 : 28} color={t.accent} strokeWidth={2.2} />
          <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 24 : 18, color: t.fg, letterSpacing: 1}}>SLIDE DECK</div>
        </div>

        {/* mini thumbnail strip: all 3 slides visible side by side, proving it's a deck not one card */}
        <div style={{display: 'flex', gap: narrow ? 16 : 10, opacity: Math.min(1, thumbK * 1.3)}}>
          {SLIDES.map(({Icon}, i) => (
            <div key={i} style={{
              width: narrow ? 118 : 86, height: narrow ? 160 : 118, borderRadius: 12,
              background: t.card || 'rgba(16,26,46,.75)', border: `2px solid ${t.accent2 || t.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `translateY(${(1 - thumbK) * 20}px)`, opacity: prog(f, i * 4, 10, ease),
            }}>
              <Icon size={narrow ? 38 : 28} color={t.accent2 || t.accent} strokeWidth={2} />
            </div>
          ))}
        </div>

        {/* full-width rows, each its own distinct slide, revealing in sequence -- dense, legible, no overlap */}
        {SLIDES.map(({Icon, label}, i) => {
          const k = prog(f, 20 + i * 11, 16, ease);
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
                <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 19 : 14, color: t.sub}}>Slide {i + 1} of {SLIDES.length}</div>
              </div>
            </GlassPanel>
          );
        })}

        <div style={{marginTop: narrow ? 10 : 6, opacity: prog(f, 56, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 28 : 20, color: t.sub, textAlign: 'center', maxWidth: '86%'}}>
          Output #2: a presentation-ready deck.
        </div>
      </div>
    </>
  );
};
