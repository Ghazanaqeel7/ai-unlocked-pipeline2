import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import scenesData from './scenes.json';
import timing from './timing.json';
import {FPS} from './theme.js';
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
import {Grain, Sfx} from './scenes/common.jsx';
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
import customScenes from './custom_scenes/index.js';

// Primary UI-card types are this channel's main visual language (see docs/render_guide.md):
// hookcard, toolgrid, browsersim, dochighlighter, workflowstepper, datavizcard, socialctacard,
// liveclipcard. Old type strings (mockup/statcounter/comparecard/stepflow) are kept as safe legacy
// aliases, each routed through a prop-adapting wrapper to the new component — so older jobs'
// scenes.json keep rendering unchanged even though the underlying component is new (see
// legacyAdapters.jsx). The rest (photo/stat/chart/timeline/map/headline/compare/list/illustration)
// stay registered for variety/legacy jobs but are secondary now.
export const REGISTRY = {
  title: Title, chapter: Chapter, endcard: EndCard, quote: Quote,
  hookcard: HookCard, toolgrid: ToolGrid,
  browsersim: BrowserSim, dochighlighter: DocHighlighter, workflowstepper: WorkflowStepper, datavizcard: DataVizCard, socialctacard: SocialCtaCard,
  liveclipcard: LiveClipCard,
  // legacy aliases — safeguard #2: never break an older job
  mockup: MockupLegacy, statcounter: StatCounterLegacy, comparecard: ComparisonCardLegacy, stepflow: StepFlowLegacy,
  photo: Photo, stat: Stat, chart: Chart, timeline: Timeline, map: MapScene, headline: Headline, compare: Compare, list: ListScene, illustration: Illustration,
};
// Per-job bespoke scenes (render_guide.md "Custom per-job scenes") layer on top of — and can override —
// the shared REGISTRY above. customScenes defaults to {} for any job that hasn't written one; Doc.jsx
// always imports this same file path so the import itself never fails even when a job has nothing here.
const FULL_REGISTRY = {...REGISTRY, ...customScenes};
const OVERLAP = 9;   // frames: a beat keeps showing this long after its end so the next one cross-fades in

// `dur` is this beat's OWN Sequence duration (passed explicitly rather than read off useVideoConfig,
// which reflects the whole composition, not the current Sequence).
const Fade = ({children, first, last, dur}) => {
  const f = useCurrentFrame();
  const a = first ? 1 : interpolate(f, [0, OVERLAP], [0, 1], {extrapolateRight: 'clamp'});
  const b = last ? 1 : interpolate(f, [dur - OVERLAP, dur], [1, 0], {extrapolateLeft: 'clamp'});
  const entrance = first ? 1 : 1 + 0.08 * (1 - a);
  // render_guide.md pacing rule: a subtle continuous zoom across the WHOLE beat (not just the entrance)
  // so nothing ever sits fully static for its 2-4s on screen.
  const zoom = interpolate(f, [0, Math.max(1, dur)], [1.0, 1.04], {extrapolateRight: 'clamp'});
  const s = entrance * zoom;
  return <AbsoluteFill style={{opacity: Math.min(a, b), transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

// A beat's effective light/dark polarity, for the Captions overlay: explicit `polarity` wins; else an
// explicit legacy `tone` of 'alabaster' counts as light; everything else defaults dark.
const resolvePolarity = (visual) => (visual.polarity || (visual.tone === 'alabaster' ? 'light' : 'dark'));

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
      out.push({key: `${sc.id}-${bi}`, from: a, dur: Math.max(10, z - a), visual: {tone: sc.tone, ...b}, si, bi});
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
    () => beats.map((b) => ({from: b.from, dur: b.dur, polarity: resolvePolarity(b.visual)})),
    [beats]
  );
  const lastIdx = beats.length - 1;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {beats.map((b, i) => {
        const Comp = FULL_REGISTRY[b.visual.type] || Title;
        const isLast = i === lastIdx;
        const seqDur = b.dur + (isLast ? 0 : OVERLAP);
        return (
          <Sequence key={b.key} from={b.from} durationInFrames={seqDur}>
            <Fade first={i === 0} last={isLast} dur={seqDur}><Comp {...b.visual} frames={b.dur} /></Fade>
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
