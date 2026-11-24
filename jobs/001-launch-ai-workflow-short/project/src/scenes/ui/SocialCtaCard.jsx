import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FileText, CheckCircle2} from 'lucide-react';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';
import {HostAvatar} from './HostAvatar.jsx';

// Animated Comment-to-DM outro: a generic profile card (name/handle/bio — NEVER a real photo; a simple
// initial-letter avatar, trademark/privacy-safe by the same rule as ToolBadge's generic glyphs), a
// simulated comment box where `commentWord` types itself in and gets "sent", and an optional top
// notification banner sliding down ("Sent! Check your DMs").
// params:
//   handle, name, bio  — e.g. "@AIGraphicTV", "AI Graphic TV", "Practical AI tool breakdowns"
//   commentWord        — the word/phrase a viewer is asked to comment, e.g. "GUIDE"
//   dmPreview          — short text shown inside the sliding notification banner
//   notifBanner        — bool, default true — show the top slide-down "Sent!" banner
//   guide              — optional {badge, title, bullets:[...]} — renders a 3D-tilted frosted-glass
//                         preview of the companion PDF guide alongside the comment card, e.g.
//                         {badge:'FREE 6-PAGE BLUEPRINT', title:'The Agent Setup Guide', bullets:[...]}
//   avatar             — bool, default true — HostAvatar in 'pointing' pose aimed at the comment box
//   polarity           — 'dark' (default) | 'light'
export const SocialCtaCard = ({handle = '@AIGraphicTV', name = 'AI Graphic TV', bio = '', commentWord = 'GUIDE', dmPreview, notifBanner = true, guide, avatar = true, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  const light = t.card === '#FFFFFF';
  // narrow (Shorts) canvas: the profile card + comment card together fill the middle ~55-65% vertical
  // hero stage (~1050px of 1920), with 2x-scaled typography, instead of one small card floating in
  // dead space. When a `guide` panel is also present, that panel shares the fill job, so the
  // comment card itself must NOT be stretched tall too — otherwise it reproduces the exact
  // large-empty-box problem this upgrade exists to kill. Row layout (profile+comment column next to
  // the guide column) is used whenever `guide` is set, even on the narrow Shorts canvas, so nothing
  // is ever alone in the middle of the frame.
  const rowLayout = guide || !narrow;
  const profileMinH = narrow && !guide ? Math.round(h * 0.2) : undefined;
  const commentMinH = narrow && !guide ? Math.round(h * 0.32) : undefined;
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
          <GlassPanel radius={14} pad={narrow ? '18px 24px' : '14px 20px'} glow={t.accent} tn={tName}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: narrow ? 14 : 10, height: narrow ? 14 : 10, borderRadius: '50%', background: '#34d399', flex: '0 0 auto'}} />
              <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 16, color: t.fg}}>
                {dmPreview || 'Sent! Check your DMs'}
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? (guide ? '0 36px' : '0 46px') : '0 90px'}}>
       <div style={{display: 'flex', flexDirection: rowLayout ? 'row' : 'column', alignItems: 'center', gap: narrow ? (guide ? 18 : 26) : 56}}>
        <div style={{width: narrow ? (guide ? '58%' : '100%') : 560, maxWidth: 640, flex: narrow && guide ? '1 1 58%' : undefined, opacity: Math.min(1, profileK * 1.3), transform: `translateY(${(1 - Math.min(1, profileK)) * 24}px)`, position: 'relative'}}>
          <GlassPanel radius={22} pad={narrow ? '34px 30px' : '26px 32px'} glow={t.accent} tn={tName}
            style={{minHeight: profileMinH, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: narrow ? 24 : 16}}>
              <div style={{
                width: narrow ? 100 : 60, height: narrow ? 100 : 60, borderRadius: '50%', flex: '0 0 auto',
                background: `linear-gradient(135deg, ${t.accent}, ${t.accent2 || t.gold || t.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: F.display, fontSize: narrow ? 42 : 26, color: '#071018',
              }}>{(name[0] || 'A').toUpperCase()}</div>
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 34 : 21, color: t.fg}}>
                  {name} <span style={{color: t.accent}}>✓</span>
                </div>
                <div style={{fontFamily: F.sans, fontSize: narrow ? 24 : 15, color: t.sub, marginTop: narrow ? 4 : 0}}>{handle}{bio ? ` · ${bio}` : ''}</div>
              </div>
            </div>
          </GlassPanel>
          <div style={{marginTop: narrow ? 28 : 16}}>
            <GlassPanel radius={22} pad={narrow ? '28px 26px' : '20px 26px'} glow={t.accent2 || t.accent} tn={tName}
              style={{minHeight: commentMinH, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: narrow ? 18 : 12}}>
                <div style={{
                  flex: 1, background: light ? 'rgba(15,23,42,.045)' : 'rgba(255,255,255,.06)',
                  border: light ? '1px solid rgba(15,23,42,.08)' : 'none',
                  borderRadius: 10, padding: narrow ? '20px 22px' : '12px 16px',
                  fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 18, color: t.fg, minHeight: narrow ? 40 : 24,
                }}>
                  {typed}<span style={{opacity: typeK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
                </div>
                <div style={{
                  width: narrow ? 64 : 40, height: narrow ? 64 : 40, borderRadius: '50%', flex: '0 0 auto',
                  background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: narrow ? 26 : 16,
                  transform: `scale(${1 + springPop(f, sendClickAt, {damping: 10}) * 0.15})`, color: '#071018', fontWeight: 900,
                }}>➤</div>
              </div>
              {sentK > 0 && (
                <div style={{marginTop: narrow ? 20 : 10, opacity: sentK, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 24 : 16, color: '#34d399'}}>
                  ✓ Sent! Check your DMs
                </div>
              )}
            </GlassPanel>
          </div>
          {avatar && (
            <div style={{position: 'absolute', right: guide ? -36 : (narrow ? -20 : -70), bottom: guide ? -24 : (narrow ? -30 : -40), opacity: prog(f, 10, 14), zIndex: 5}}>
              <HostAvatar pose="pointing" size={guide ? (narrow ? 110 : 150) : (narrow ? 180 : 200)} delay={10} />
            </div>
          )}
        </div>
        {guide && (
          <div style={{
            width: narrow ? '38%' : 340, flex: narrow ? '1 1 38%' : undefined, opacity: prog(f, 14, 16, ease),
            transform: `perspective(1000px) rotateY(${narrow ? -6 : -10}deg) rotateX(4deg) translateY(${(1 - prog(f, 14, 16, ease)) * 20}px)`,
          }}>
            <GlassPanel radius={18} pad={narrow ? '18px 16px' : '22px 24px'} glow={t.gold || t.accent2 || t.accent} tn={tName}>
              <div style={{display: 'inline-block', background: t.gold || '#F59E0B', color: '#1a1203', fontFamily: F.display,
                fontSize: narrow ? 12 : 14, letterSpacing: 0.5, padding: '5px 10px', borderRadius: 7, marginBottom: 12}}>
                {guide.badge || 'FREE GUIDE'}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12}}>
                <FileText size={narrow ? 18 : 22} color={t.accent} />
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 17 : 19, color: t.fg, lineHeight: 1.15}}>{guide.title || 'The Setup Guide'}</div>
              </div>
              {(guide.bullets || []).slice(0, 3).map((b, i) => {
                const k = prog(f, 24 + i * 6, 10, ease);
                return (
                  <div key={i} style={{opacity: k, display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9}}>
                    <CheckCircle2 size={narrow ? 15 : 18} color={'#34d399'} style={{flexShrink: 0, marginTop: 2}} />
                    <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 13.5 : 15, color: t.sub, lineHeight: 1.25}}>{b}</div>
                  </div>
                );
              })}
            </GlassPanel>
          </div>
        )}
       </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
