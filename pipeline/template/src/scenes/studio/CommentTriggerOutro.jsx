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
  const guideMinH = guide ? Math.round(h * 0.4) : (narrow ? Math.round(h * 0.4) : undefined);

  const logoSize = narrow ? 240 : 230; // style_reference.md fix #3: 220-260px real logo, no fake avatar
  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? (guide ? '0 36px' : '0 46px') : '0 90px'}}>
        <div style={{display: 'flex', flexDirection: rowLayout ? 'row' : 'column', alignItems: 'stretch', gap: narrow ? (guide ? 18 : 26) : 56}}>
          <div style={{width: narrow ? (guide ? '54%' : '100%') : 560, maxWidth: 640, flex: narrow && guide ? '1 1 54%' : undefined, display: 'flex', flexDirection: 'column', opacity: Math.min(1, profileK * 1.3), transform: `translateY(${(1 - Math.min(1, profileK)) * 24}px)`}}>
            <StudioCard radius={22} pad={narrow ? '32px 26px' : '26px 32px'} tn={tn} glow={t.accent} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1}}>
              <div style={{width: 200, height: 200, flex: '0 0 auto', marginBottom: 18}}>
                <Img src={staticFile('brand_logo.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
              </div>
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, background: t.accent, color: t.onAccent, fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 26 : 20, padding: '8px 20px', borderRadius: 999}}>
                {handle} <span>✓</span>
              </div>
              {bio && <div style={{fontFamily: F.sans, fontSize: narrow ? 22 : 15, color: t.sub, marginTop: 10}}>{bio}</div>}
              <div style={{width: '100%', marginTop: narrow ? 28 : 20, display: 'flex', alignItems: 'center', gap: narrow ? 14 : 12}}>
                <div style={{
                  flex: 1, textAlign: 'left', background: t.light ? 'rgba(15,23,42,.045)' : 'rgba(255,255,255,.06)',
                  border: `1.5px solid ${t.line}`, borderRadius: 14, padding: narrow ? '20px 20px' : '12px 16px', fontFamily: F.sans, fontWeight: 700,
                  fontSize: narrow ? 28 : 18, color: t.fg, minWidth: 0,
                }}>
                  <span style={{color: t.sub, fontWeight: 600}}>Comment </span>{typed}<span style={{opacity: f % 20 < 10 ? 1 : 0, color: t.accent}}>|</span>
                </div>
                <div style={{
                  width: narrow ? 64 : 40, height: narrow ? 64 : 40, borderRadius: '50%', flex: '0 0 auto',
                  background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: narrow ? 26 : 16, transform: `scale(${1 + springPop(f, sendClickAt, {damping: 10}) * 0.15})`,
                  color: t.onAccent, fontWeight: 900,
                }}>➤</div>
              </div>
              {sentK > 0 && (
                <div style={{marginTop: 16, opacity: sentK, fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 16, color: '#34d399'}}>
                  ✓ {dmPreview || 'Sent! Check your DMs'}
                </div>
              )}
            </StudioCard>
          </div>
          {guide && (
            <div style={{
              width: narrow ? '44%' : 380, flex: narrow ? '1 1 44%' : undefined, opacity: prog(f, 14, 16, ease),
              transform: `perspective(1000px) rotateY(${narrow ? -6 : -10}deg) rotateX(4deg) translateY(${(1 - prog(f, 14, 16, ease)) * 20}px)`,
            }}>
              <StudioCard radius={18} pad="0" tn={tn} glow={t.accent} style={{minHeight: guideMinH, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <div style={{background: t.accent, color: t.onAccent, fontFamily: F.display, fontSize: narrow ? 26 : 22, letterSpacing: 1.5, padding: narrow ? '22px 20px' : '18px 22px', textAlign: 'center'}}>
                  EPISODE PLAYBOOK
                </div>
                <div style={{padding: narrow ? '22px 20px' : '22px 24px', display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div style={{alignSelf: 'flex-start', background: t.light ? '#0F172A' : '#FFFFFF', color: t.light ? '#FFFFFF' : '#0B0C0E', fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 16 : 14, letterSpacing: 1.5, padding: '6px 12px', borderRadius: 999, marginBottom: 16}}>
                    {guide.badge || 'FREE PDF'}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
                    <FileText size={narrow ? 30 : 28} color={t.accent} style={{flexShrink: 0}} />
                    <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 28 : 24, color: t.fg, lineHeight: 1.15}}>{guide.title || 'The Setup Guide'}</div>
                  </div>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 14}}>
                    {(guide.bullets || []).slice(0, 4).map((b, i) => {
                      const k = prog(f, 24 + i * 6, 10, ease);
                      return (
                        <div key={i} style={{opacity: k, display: 'flex', alignItems: 'flex-start', gap: 10}}>
                          <CheckCircle2 size={narrow ? 26 : 24} color="#34d399" style={{flexShrink: 0, marginTop: 2}} />
                          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 23 : 22, color: t.fg, lineHeight: 1.25}}>{b}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </StudioCard>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
