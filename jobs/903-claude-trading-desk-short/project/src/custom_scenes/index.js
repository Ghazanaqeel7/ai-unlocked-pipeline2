// Per-job custom scene registry (render_guide.md "Custom per-job scenes"). This job
// (903-claude-trading-desk-short) is the first real-topic test of the "bespoke scenes by default" rule:
// 5 bespoke components cover most of the primary beats instead of the generic REGISTRY templates.
import {TradingDeskHero} from './TradingDeskHero.jsx';
import {ScheduleLoop} from './ScheduleLoop.jsx';
import {CandleChart} from './CandleChart.jsx';
import {AutonomyTiers} from './AutonomyTiers.jsx';
import {JournalCard} from './JournalCard.jsx';
import {CodeCard} from './CodeCard.jsx';
export default {
  tradingdeskhero: TradingDeskHero,
  scheduleloop: ScheduleLoop,
  candlechart: CandleChart,
  autonomytiers: AutonomyTiers,
  journalcard: JournalCard,
  codecard: CodeCard,
};
