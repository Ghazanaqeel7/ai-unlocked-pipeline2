// Per-job custom scene registry (render_guide.md "Custom per-job scenes"). This job
// (001-launch-ai-workflow-short) is the channel's first official launch Short: 4 bespoke components
// cover the "1 PDF -> 3 real outputs" core of the video instead of the generic REGISTRY templates.
import {ThreeOutputsCard} from './ThreeOutputsCard.jsx';
import {AudioWaveCard} from './AudioWaveCard.jsx';
import {SlideStackCard} from './SlideStackCard.jsx';
import {MindMapCard} from './MindMapCard.jsx';
export default {
  threeoutputscard: ThreeOutputsCard,
  audiowavecard: AudioWaveCard,
  slidestackcard: SlideStackCard,
  mindmapcard: MindMapCard,
};
