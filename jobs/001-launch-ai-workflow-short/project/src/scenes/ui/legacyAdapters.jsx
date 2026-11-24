import React from 'react';
import {BrowserSim} from './BrowserSim.jsx';
import {DataVizCard} from './DataVizCard.jsx';
import {WorkflowStepper} from './WorkflowStepper.jsx';

// Safe legacy aliases (per confirmed safeguard #2): older jobs' scenes.json may still use the old
// type strings (`mockup`, `statcounter`, `comparecard`, `stepflow`). Rather than keep the old
// components rendering forever, each old type string is pointed at the new component through a thin
// prop-adapting wrapper here, so every existing job keeps rendering correctly with zero changes to
// its scenes.json, while new jobs write directly to the new richer components/schemas.

// mockup -> BrowserSim (mode:"app"): old MockupWindow took `response` (string | string[]), BrowserSim
// takes `responseLines` (always an array).
export const MockupLegacy = ({title, prompt, chips, response, tone, polarity}) => {
  const responseLines = Array.isArray(response) ? response : response ? [response] : [];
  return <BrowserSim mode="app" title={title} prompt={prompt} chips={chips} responseLines={responseLines} tone={tone} polarity={polarity} />;
};

// statcounter -> DataVizCard (mode:"gauge"): old StatCounter took {from,to,prefix,suffix,decimals,
// label,sub,bar,color,tone} where `bar` was boolean or {max}. DataVizCard always wants an explicit
// values:[{name,value,max,color}] — this is exactly the schema fix the "stuck at 0" bug called for.
export const StatCounterLegacy = ({from = 0, to = 0, prefix = '', suffix = '', decimals = 0, label, sub, bar, color, tone, polarity}) => {
  const max = bar && typeof bar === 'object' && typeof bar.max === 'number' ? bar.max : Math.max(to, from, 1);
  return (
    <DataVizCard
      mode="gauge"
      label={label}
      sub={sub}
      tone={tone}
      polarity={polarity}
      values={[{name: label || '', value: to, max, color, prefix, suffix, decimals}]}
    />
  );
};

// comparecard -> DataVizCard (mode:"bars"): old ComparisonCard compared two named sides (a/b) across
// several numeric/text rows. DataVizCard's bars mode wants one flat values list, so each numeric row
// becomes two bars (one per side), carrying the side's own name/color forward; non-numeric rows (plain
// text "wins" like "Yes"/"No") have no numeric bar equivalent and are dropped — identical in spirit to
// how DataVizCard already requires explicit numbers everywhere, never an implied/inferred value.
export const ComparisonCardLegacy = ({title, a = {name: 'Before'}, b = {name: 'After'}, rows = [], tone, polarity}) => {
  const values = [];
  rows.forEach((r) => {
    if (typeof r.a === 'number') values.push({name: `${r.label} · ${a.name}`, value: r.a, max: Math.max(r.a, typeof r.b === 'number' ? r.b : r.a, 1), color: a.color});
    if (typeof r.b === 'number') values.push({name: `${r.label} · ${b.name}`, value: r.b, max: Math.max(r.b, typeof r.a === 'number' ? r.a : r.b, 1), color: b.color});
  });
  return <DataVizCard mode="bars" label={title} values={values} tone={tone} polarity={polarity} />;
};

// stepflow -> WorkflowStepper: old StepFlow took {title, steps:[{n,title,sub}], tone}. WorkflowStepper
// wants {steps:[{icon,label}], body:{type,items}}; each step's old `sub` line (if any) becomes a
// checklist row in the body panel underneath, so no detail from the old shape is silently dropped.
export const StepFlowLegacy = ({title, steps = [], tone, polarity, frames}) => {
  const mapped = steps.map((s) => ({icon: s.n, label: s.title}));
  const subItems = steps.filter((s) => s.sub).map((s) => ({text: s.sub}));
  return (
    <WorkflowStepper
      steps={mapped}
      body={subItems.length ? {type: 'checklist', items: subItems} : undefined}
      tone={tone}
      polarity={polarity}
      frames={frames}
    />
  );
};
