import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FileText, CheckCircle2} from 'lucide-react';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {StudioBg, StudioCard, springPop} from '../common.jsx';

// `CommentTriggerOutro` (docs/style_reference.md): the studio-era comment-to-DM closing beat.
// A clean typing animation inside a social comment bar ('Comment "SYSTEM"'), the channel's exact
// unaltered brand_logo.png (object-fit: contain, zero distortion), and an optional free-PDF-guide
// preview card — built for the sand/studio/obsidian themes, with ZERO mascot/avatar (the one thing
// the old SocialCtaCard always carried). This is the sole closing beat on a Short.
// params: handle, name, bio, commentWord, dmPreview, notifBanner, guide:{badge,title,bullets}, theme
export const CommentTriggerOutro = ({handle = '@AIGraphicTV', name = 'AI Graphic TV', bio = '', commentWord = 'GUIDE', dmPreview, notifBanner = true, guide, theme}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  const rowLayout = !!guide || !narrow;
  const profileK = springPop(f, 0, {damping: 16});
  const typeK = prog(f, 20, Math.max(10, commentWord.length * 3), ease);
  const typed = commentWord.slice(0, Math.round(commentWord.length * typeK));
  const sendClickAt = 20 + Math.max(10, commentWord.length * 3) + 4;
  const sentK = prog(f, sendClickAt + 6, 10, ease);
  const bannerK = notifBanner ? prog(f, sendClickAt + 16, 14, ease) : 0;
  const commentMinH = narrow ? Math.round(h * (guide ? 0.3 : 0.32)) : undefined;
  const guideMinH = guide ? Math.round(h * (narrow ? 0.46 : 0.5)) : undefined;

  const logoSize = narrow ? 240 : 230; // style_reference.md fix #3: 220-260px real logo, no fake avatar
  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      {notifBanner && (
        <div style={{position: 'absolute', left: '50%', top: narrow ? 90 - (1 - bannerK) * 140 : 60 - (1 - bannerK) * 140, transform: 'translateX(-50%)', opacity: bannerK, width: narrow ? '82%' : 520, maxWidth: 560, zIndex: 6}}>
          <StudioCard radius={14} pad={narrow ? '18px 24px' : '14px 20px'} tn={tn} glow={t.accent}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: narrow ? 14 : 10, height: narrow ? 14 : 10, borderRadius: '50%', background: '#34d399', flex: '0 0 auto'}} />
              <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 16, color: t.fg}}>{dmPreview || 'Sent! Check your DMs'}</div>
            </div>
          </StudioCard>
        </div>
      )}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? (guide ? '0 36px' : '0 46px') : '0 90px'}}>
        <div style={{display: 'flex', flexDirection: rowLayout ? 'row' : 'column', alignItems: 'center', gap: narrow ? (guide ? 18 : 26) : 56}}>
          <div style={{width: narrow ? (guide ? '58%' : '100%') : 560, maxWidth: 640, flex: narrow && guide ? '1 1 58%' : undefined, opacity: Math.min(1, profileK * 1.3), transform: `translateY(${(1 - Math.min(1, profileK)) * 24}px)`}}>
            <StudioCard radius={22} pad={narrow ? '34px 30px' : '26px 32px'} tn={tn} glow={t.accent} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
              <div style={{width: logoSize, height: logoSize, flex: '0 0 auto', marginBottom: narrow ? 20 : 16}}>
                <Img src={staticFile('brand_logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 34 : 21, color: t.fg}}>
                {name} <span style={{color: t.accent}}>✓</span>
              </div>
              <div style={{fontFamily: F.sans, fontSize: narrow ? 24 : 15, color: t.sub, marginTop: narrow ? 4 : 0}}>{handle}{bio ? ` · ${bio}` : ''}</div>
            </StudioCard>
            <div style={{marginTop: narrow ? 28 : 16}}>
              <StudioCard radius={22} pad={narrow ? '28px 26px' : '20px 26px'} tn={tn} glow={t.accent2 || t.accent} style={{minHeight: commentMinH, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: narrow ? 18 : 12}}>
                  <div style={{
                    flex: 1, background: t.light ? 'rgba(15,23,42,.045)' : 'rgba(255,255,255,.06)',
                    border: t.light ? '1px solid rgba(15,23,42,.08)' : 'none', borderRadius: 10,
                    padding: narrow ? '20px 22px' : '12px 16px', fontFamily: F.sans, fontWeight: 700,
                    fontSize: narrow ? 30 : 18, color: t.fg, minHeight: narrow ? 40 : 24,
                  }}>
                    {typed}<span style={{opacity: typeK < 1 ? (f % 20 < 10 ? 1 : 0) : 0}}>|</span>
                  </div>
                  <div style={{
                    width: narrow ? 64 : 40, height: narrow ? 64 : 40, borderRadius: '50%', flex: '0 0 auto',
                    background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: narrow ? 26 : 16, transform: `scale(${1 + springPop(f, sendClickAt, {damping: 10}) * 0.15})`,
                    color: t.onAccent, fontWeight: 900,
                  }}>➤</div>
                </div>
                {sentK > 0 && (
                  <div style={{marginTop: narrow ? 20 : 10, opacity: sentK, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 24 : 16, color: '#34d399'}}>
                    ✓ Sent! Check your DMs
                  </div>
                )}
              </StudioCard>
            </div>
          </div>
          {guide && (
            <div style={{
              width: narrow ? '38%' : 340, flex: narrow ? '1 1 38%' : undefined, opacity: prog(f, 14, 16, ease),
              transform: `perspective(1000px) rotateY(${narrow ? -6 : -10}deg) rotateX(4deg) translateY(${(1 - prog(f, 14, 16, ease)) * 20}px)`,
            }}>
              <StudioCard radius={18} pad={narrow ? '18px 16px' : '22px 24px'} tn={tn} glow={t.accent} style={{minHeight: guideMinH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                <div style={{display: 'inline-block', background: t.accent, color: t.onAccent, fontFamily: F.display, fontSize: narrow ? 12 : 14, letterSpacing: 0.5, padding: '5px 10px', borderRadius: 7, marginBottom: 12}}>
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
                      <CheckCircle2 size={narrow ? 15 : 18} color="#34d399" style={{flexShrink: 0, marginTop: 2}} />
                      <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 13.5 : 15, color: t.sub, lineHeight: 1.25}}>{b}</div>
                    </div>
                  );
                })}
              </StudioCard>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
