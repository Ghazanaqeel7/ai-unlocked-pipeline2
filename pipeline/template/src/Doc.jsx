import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import scenesData from './scenes.json';
import timing from './timing.json';
import {FPS, tone, STUDIO_THEMES} from './theme.js';
import {Title, Chapter} from './scenes/Title.jsx';
import {Photo} from './scenes/Photo.jsx';
import {Stat} from './scenes/Stat.jsx';
import {Chart} from './scenes/Chart.jsx';
import {Timeline} from './scenes/Timeline.jsx';
import {MapScene} from './scenes/MapScene.jsx';
import {Headline} from './scenes/Headline.jsx';
import {Compare} from './scenes/Compare.jsx';
import {ListScene} from './scenes/ListScene.jsx';
import {Quote} from './scenes/Quote.jsx';
import {Illustration} from './scenes/Illustration.jsx';
import {EndCard} from './scenes/EndCard.jsx';
import {AutoLayout, planLayouts} from './scenes/AutoLayout.jsx';
import {rnd} from './util.js';
import {Grain, Sfx, AmbientOrbs} from './scenes/common.jsx';
import {HookCard} from './scenes/ui/HookCard.jsx';
import {ToolGrid} from './scenes/ui/ToolGrid.jsx';
import {BrowserSim} from './scenes/ui/BrowserSim.jsx';
import {DocHighlighter} from './scenes/ui/DocHighlighter.jsx';
import {WorkflowStepper} from './scenes/ui/WorkflowStepper.jsx';
import {DataVizCard} from './scenes/ui/DataVizCard.jsx';
import {SocialCtaCard} from './scenes/ui/SocialCtaCard.jsx';
import {LiveClipCard} from './scenes/ui/LiveClipCard.jsx';
import {MockupLegacy, StatCounterLegacy, ComparisonCardLegacy, StepFlowLegacy} from './scenes/ui/legacyAdapters.jsx';
import {Captions} from './scenes/ui/Captions.jsx';
import {TiltedAgentStage} from './scenes/studio/TiltedAgentStage.jsx';
import {MetricOdometer} from './scenes/studio/MetricOdometer.jsx';
import {RetentionGraph} from './scenes/studio/RetentionGraph.jsx';
import {PerspectiveWall} from './scenes/studio/PerspectiveWall.jsx';
import {InteractiveUiCard} from './scenes/studio/InteractiveUiCard.jsx';
import {CommentTriggerOutro} from './scenes/studio/CommentTriggerOutro.jsx';
import customScenes from './custom_scenes/index.js';

// PRIMARY identity (docs/style_reference.md "Studio Editorial" standard — permanently locked):
// tiltedagentstage, metricodometer, retentiongraph, perspectivewall, interactiveuicard,
// commenttriggeroutro, plus `hookcard` (now theme-aware — pass `theme: 'sand'|'studio'|'obsidian'`).
// ZERO cartoon characters/mascots in any of these — HostAvatar was permanently deleted.
//
// Legacy UI-card types (toolgrid, browsersim, dochighlighter, workflowstepper, datavizcard,
// socialctacard, liveclipcard, the old mockup/statcounter/comparecard/stepflow aliases, and the
// secondary photo/stat/chart/... family) are kept registered ONLY so already-rendered or
// already-approved jobs (e.g. 001-launch-ai-workflow-short) never break on a future re-render —
// never reach for them as the default in a new job's scenes.json.
export const REGISTRY = {
  title: Title, chapter: Chapter, endcard: EndCard, quote: Quote,
  hookcard: HookCard,
  auto: AutoLayout, autolayout: AutoLayout,   // 5 rotating layouts, see scenes/AutoLayout.jsx
  // Studio Editorial primary components (docs/style_reference.md)
  tiltedagentstage: TiltedAgentStage, metricodometer: MetricOdometer, retentiongraph: RetentionGraph,
  perspectivewall: PerspectiveWall, interactiveuicard: InteractiveUiCard, commenttriggeroutro: CommentTriggerOutro,
  // legacy UI-card family — back-compat only, see note above
  toolgrid: ToolGrid, browsersim: BrowserSim, dochighlighter: DocHighlighter, workflowstepper: WorkflowStepper,
  datavizcard: DataVizCard, socialctacard: SocialCtaCard, liveclipcard: LiveClipCard,
  mockup: MockupLegacy, statcounter: StatCounterLegacy, comparecard: ComparisonCardLegacy, stepflow: StepFlowLegacy,
  photo: Photo, stat: Stat, chart: Chart, timeline: Timeline, map: MapScene, headline: Headline, compare: Compare, list: ListScene, illustration: Illustration,
};
// Per-job bespoke scenes (render_guide.md "Custom per-job scenes") layer on top of — and can override —
// the shared REGISTRY above. customScenes defaults to {} for any job that hasn't written one; Doc.jsx
// always imports this same file path so the import itself never fails even when a job has nothing here.
const FULL_REGISTRY = {...REGISTRY, ...(customScenes || {})};
// Job seed offset: scenes.json `seed` (number) wins, else derived deterministically from title + first scene id,
// so different videos start on different layouts while one video always renders identically.
const JOB_SEED = Number.isFinite(scenesData.seed) ? Math.abs(Math.floor(scenesData.seed)) : Math.floor(rnd(`${scenesData.title || ''}|${((scenesData.scenes || [])[0] || {}).id || ''}`) * 1000);
// With `"autolayout": true` in scenes.json, plain generic types are rendered by AutoLayout (layout =
// (autoIndex + JOB_SEED) % 5, adjacent beats never repeat). Studio primitives (hookcard, tiltedagentstage,
// metricodometer, ...) and any custom scene are never touched.
const AUTO_TYPES = new Set(['auto', 'autolayout', 'title', 'headline', 'list', 'quote', 'chapter', 'endcard', 'illustration', 'stat', 'compare', 'timeline']);
const isAutoBeat = (b) => !!b && !!b.visual && (b.visual.type === 'auto' || b.visual.type === 'autolayout' || (scenesData.autolayout === true && AUTO_TYPES.has(b.visual.type) && !(customScenes || {})[b.visual.type]));
const OVERLAP = 11;   // frames: a beat keeps showing this long after its end so the next one cross-fades in
                       // (render_guide.md "cinematic scene transitions": 10-12 frame spring slide/zoom/blur-dissolve)

// `dur` is this beat's OWN Sequence duration (passed explicitly rather than read off useVideoConfig,
// which reflects the whole composition, not the current Sequence). Cinematic transition: entrance is a
// combined spring slide (from below) + scale-down-into-place + a short blur-dissolve (blur clears as
// opacity rises), exit is the mirror (slides up slightly, re-blurs) so cuts never feel hard.
const Fade = ({children, first, last, dur, noIn, noOut, flat}) => {
  const f = useCurrentFrame();
  const a = (first || noIn) ? 1 : interpolate(f, [0, OVERLAP], [0, 1], {extrapolateRight: 'clamp'});
  const b = (last || noOut) ? 1 : interpolate(f, [dur - OVERLAP, dur], [1, 0], {extrapolateLeft: 'clamp'});
  const entranceY = (first || noIn) ? 0 : (1 - a) * 26;
  const exitY = (last || noOut) ? 0 : (1 - b) * -18;
  const entrance = (first || noIn) ? 1 : 1 + 0.08 * (1 - a);
  const blurIn = (first || noIn) ? 0 : (1 - a) * 8;
  const blurOut = (last || noOut) ? 0 : (1 - b) * 6;
  // render_guide.md pacing rule: a subtle continuous zoom across the WHOLE beat (not just the entrance)
  // so nothing ever sits fully static for its 2-4s on screen.
  const zoom = flat ? 1 : interpolate(f, [0, Math.max(1, dur)], [1.0, 1.04], {extrapolateRight: 'clamp'});
  const s = entrance * zoom;
  return (
    <AbsoluteFill style={{
      opacity: Math.min(a, b), transform: `translateY(${entranceY + exitY}px) scale(${s})`,
      filter: `blur(${(blurIn + blurOut).toFixed(1)}px)`,
    }}>{children}</AbsoluteFill>
  );
};

// A beat's effective light/dark polarity + accent color, for the bottom Captions pill
// (docs/style_reference.md "Bottom Stage" — the pill flips color with whichever of the 3 signature
// themes the beat is on, and the active word is highlighted in that theme's own accent color):
// a `theme` prop (sand|studio|obsidian) wins; else explicit `polarity`; else a legacy `tone` of
// 'alabaster' counts as light; everything else defaults dark (obsidian-equivalent).
const resolvePolarity = (visual) => {
  if (STUDIO_THEMES.includes(visual.theme)) {
    const t = tone(visual.theme);
    return {polarity: t.light ? 'light' : 'dark', accent: t.accent};
  }
  const polarity = visual.polarity || (visual.tone === 'alabaster' ? 'light' : 'dark');
  return {polarity, accent: polarity === 'light' ? '#D96B43' : '#C8F938'};
};

// scene -> list of beats [{from, dur, visual, scene}] in frames
export const buildBeats = () => {
  const byId = {}; for (const s of timing.scenes) byId[s.id] = s;
  const out = []; const list = scenesData.scenes || [];
  list.forEach((sc, si) => {
    const tm = byId[sc.id]; if (!tm) return;
    const start = Math.round(tm.start * FPS), end = Math.round(tm.end * FPS), total = Math.max(15, end - start);
    const beats = Array.isArray(sc.visual) ? sc.visual : [sc.visual || {type: 'title', text: sc.text}];
    let cuts = beats.map((b, i) => (b.at != null ? b.at : i / beats.length));
    cuts = cuts.map((c, i) => (i === 0 ? 0 : c));
    beats.forEach((b, bi) => {
      const a = Math.round(start + total * cuts[bi]);
      const z = bi + 1 < beats.length ? Math.round(start + total * cuts[bi + 1]) : end;
      out.push({key: `${sc.id}-${bi}`, from: a, dur: Math.max(10, z - a), visual: {tone: sc.tone, narration: sc.text, ...b}, si, bi});
    });
  });
  return out;
};

// Flat, global-timeline word list for the Captions overlay: [{w,start,end}], or [] if a job's
// timing.json predates the word-level split (older jobs still render fine, just without captions).
const buildWords = () => {
  const out = [];
  for (const s of timing.scenes) {
    if (Array.isArray(s.words)) out.push(...s.words);
  }
  return out;
};

// One component serves BOTH the 16:9 `Doc` and the 9:16 `ShortDoc` compositions (Root.jsx registers
// this same component under two Composition ids/sizes) — nothing here hardcodes canvas dimensions,
// every scene reads useVideoConfig() instead, so the only real difference between formats is which
// scenes.json/timing.json a job writes, not the code.
export const Doc = () => {
  const beats = React.useMemo(buildBeats, []);
  const words = React.useMemo(buildWords, []);
  const polaritySegments = React.useMemo(
    () => beats.map((b) => ({from: b.from, dur: b.dur, ...resolvePolarity(b.visual)})),
    [beats]
  );
  const lastIdx = beats.length - 1;
  // content-driven plan over auto-layout beats only (planLayouts: keyword/field analysis + seed, no adjacent repeats)
  const autoPlan = React.useMemo(() => {
    const idxs = []; beats.forEach((b, i) => { if (isAutoBeat(b)) idxs.push(i); });
    const names = planLayouts(idxs.map((i) => ({...beats[i].visual, takeaway: beats[i].visual.takeaway || scenesData.takeaway})), JOB_SEED);
    const m = {}; idxs.forEach((i, k) => { m[i] = names[k]; });
    return {m, lastAuto: idxs.length ? idxs[idxs.length - 1] : -1};
  }, [beats]);
  const f = useCurrentFrame();
  // render_guide.md "ambient light orbs on dark grid beats": active only while the current frame sits
  // inside a 'dark' polarity segment, so light/alabaster editorial beats stay clean.
  const currentPolarity = (polaritySegments.find((seg) => f >= seg.from && f < seg.from + seg.dur) || {}).polarity;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AmbientOrbs active={currentPolarity !== 'light'} />
      {beats.map((b, i) => {
        const isLast = i === lastIdx;
        let Comp = FULL_REGISTRY[b.visual.type] || Title;
        let extra = {};
        if (isAutoBeat(b)) {
          Comp = AutoLayout;
          extra = {layout: autoPlan.m[i], seed: JOB_SEED, t0: b.from, isLast: i === autoPlan.lastAuto && isLast, takeaway: b.visual.takeaway || scenesData.takeaway};
        }
        const seqDur = b.dur + (isLast ? 0 : OVERLAP);
        return (
          <Sequence key={b.key} from={b.from} durationInFrames={seqDur}>
            <Fade first={i === 0} last={isLast} dur={seqDur} flat={isAutoBeat(b)} noIn={isAutoBeat(b) && i > 0 && isAutoBeat(beats[i - 1])} noOut={isAutoBeat(b) && !isLast && isAutoBeat(beats[i + 1])}><Comp {...b.visual} {...extra} frames={b.dur} /></Fade>
            {i > 0 && <Sfx type="whoosh" at={0} volume={0.45} />}
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 85% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,.35) 100%)', pointerEvents: 'none'}} />
      <Grain />
      <Captions words={words} polaritySegments={polaritySegments} />
    </AbsoluteFill>
  );
};
