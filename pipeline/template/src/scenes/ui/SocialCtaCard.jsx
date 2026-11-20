import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';

// Animated Comment-to-DM outro: a generic profile card (name/handle/bio — NEVER a real photo; a simple
// initial-letter avatar, trademark/privacy-safe by the same rule as ToolBadge's generic glyphs), a
// simulated comment box where `commentWord` types itself in and gets "sent", and an optional top
// notification banner sliding down ("Sent! Check your DMs").
// params:
//   handle, name, bio  — e.g. "@AIGraphicTV", "AI Graphic TV", "Practical AI tool breakdowns"
//   commentWord        — the word/phrase a viewer is asked to comment, e.g. "GUIDE"
//   dmPreview          — short text shown inside the sliding notification banner
//   notifBanner        — bool, default true — show the top slide-down "Sent!" banner
//   polarity           — 'dark' (default) | 'light'
export const SocialCtaCard = ({handle = '@AIGraphicTV', name = 'AI Graphic TV', bio = '', commentWord = 'GUIDE', dmPreview, notifBanner = true, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const profileK = springPop(f, 0, {damping: 16});
  const typeK = prog(f, 20, Math.max(10, commentWord.length * 3), ease);
  const typed = commentWord.slice(0, Math.round(commentWord.length * typeK));
  const sendClickAt = 20 + Math.max(10, commentWord.length * 3) + 4;
  const sentK = prog(f, sendClickAt + 6, 10, ease);
  const bannerK = notifBanner ? prog(f, sendClickAt + 16, 14, ease) : 0;

  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      {notifBanner && (
        <div style={{position: 'absolute', left: '50%', top: narrow ? 90 - (1 - bannerK) * 140 : 60 - (1 - bannerK) * 140, transform: 'translateX(-50%)', opacity: bannerK, width: narrow ? '82%' : 520, maxWidth: 560}}>
          <GlassPanel radius={14} pad="14px 20px" glow={t.accent}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 10, height: 10, borderRadius: '50%', background: '#34d399', flex: '0 0 auto'}} />
              <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 17 : 16, color: t.fg}}>
                {dmPreview || 'Sent! Check your DMs'}
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? '0 50px' : '0 120px'}}>
        <div style={{width: narrow ? '100%' : 640, maxWidth: 640, opacity: Math.min(1, profileK * 1.3), transform: `translateY(${(1 - Math.min(1, profileK)) * 24}px)`}}>
          <GlassPanel radius={22} pad={narrow ? '22px 24px' : '26px 32px'} glow={t.accent}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{
                width: narrow ? 54 : 60, height: narrow ? 54 : 60, borderRadius: '50%', flex: '0 0 auto',
                background: `linear-gradient(135deg, ${t.accent}, ${t.accent2 || t.gold || t.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: F.display, fontSize: narrow ? 24 : 26, color: '#071018',
              }}>{(name[0] || 'A').toUpperCase()}</div>
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 20 : 21, color: t.fg}}>
                  {name} <span style={{color: t.accent}}>✓</span>
                </div>
                <div style={{fontFamily: F.sans, fontSize: narrow ? 15 : 15, color: t.sub}}>{handle}{bio ? ` · ${bio}` : ''}</div>
              </div>
            </div>
          </GlassPanel>
          <div style={{marginTop: 16}}>
            <GlassPanel radius={22} pad={narrow ? '18px 22px' : '20px 26px'} glow={t.accent2 || t.accent}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{flex: 1, background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: '12px 16px', fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 18 : 18, color: t.fg, minHeight: 24}}>
                  {typed}<span style={{opacity: typeK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flex: '0 0 auto',
                  background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${1 + springPop(f, sendClickAt, {damping: 10}) * 0.15})`, color: '#071018', fontWeight: 900,
                }}>➤</div>
              </div>
              {sentK > 0 && (
                <div style={{marginTop: 10, opacity: sentK, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 16 : 16, color: '#34d399'}}>
                  ✓ Sent! Check your DMs
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
