"""Shared scene/beat rules for validate_long.py and validate_short.py — keep in one place so both
formats enforce the same REGISTRY and no-repeat policy from docs/render_guide.md.
"""

# Must match REGISTRY in pipeline/template/src/Doc.jsx exactly.
# PRIMARY_NEW are the current component schemas new jobs should write to; PRIMARY_LEGACY are the old
# type strings (mockup/statcounter/comparecard/stepflow), kept only as safe aliases (routed through
# legacyAdapters.jsx) so older jobs' scenes.json never break. New jobs should use PRIMARY_NEW.
PRIMARY_NEW = {'hookcard', 'toolgrid', 'browsersim', 'dochighlighter', 'workflowstepper', 'datavizcard', 'socialctacard', 'liveclipcard'}
PRIMARY_LEGACY = {'mockup', 'statcounter', 'comparecard', 'stepflow'}
PRIMARY = PRIMARY_NEW | PRIMARY_LEGACY
SECONDARY = {'title', 'chapter', 'photo', 'stat', 'chart', 'timeline', 'map', 'headline', 'compare', 'list', 'quote', 'illustration', 'endcard'}
TYPES = PRIMARY | SECONDARY

# Required-prop schema enforcement (safeguard #1, confirmed by the user): a lightweight/free LLM
# (Gemini Flash / Groq) can write malformed scenes.json for these richer components; catching a
# missing required prop here at validate-time means a validator ERROR instead of a blank/zero frame
# at render-time. Keys are REGISTRY type strings; values are required top-level prop names.
REQUIRED_PROPS = {
    'hookcard': ['text'],
    'datavizcard': ['values'],
    'browsersim': [],  # mode-dependent — checked specially below, no single universal required prop
    'dochighlighter': ['content'],
    'workflowstepper': ['steps'],
    'socialctacard': [],  # every prop has a sane default
    'liveclipcard': ['url'],
}


def check_required_props(b):
    """b: one visual-beat dict (already confirmed to have a valid 'type'). Returns a list of error
    strings (empty if the beat's required props are present and well-formed)."""
    errs = []
    t = b.get('type')
    for prop in REQUIRED_PROPS.get(t, []):
        v = b.get(prop)
        if v is None or (isinstance(v, (list, str, dict)) and len(v) == 0):
            errs.append(f'{t}: missing required prop "{prop}"')
    if t == 'datavizcard':
        for v in b.get('values') or []:
            if not isinstance(v, dict) or 'value' not in v or 'max' not in v:
                errs.append(f'datavizcard: each values[] entry needs explicit "value" and "max" numbers (never a bare fraction) — got {v!r}'[:160])
    if t == 'browsersim':
        mode = b.get('mode', 'app')
        if mode == 'app' and not b.get('prompt'): errs.append('browsersim (mode:"app"): missing "prompt"')
        if mode == 'repo' and not b.get('title'): errs.append('browsersim (mode:"repo"): missing "title"')
        if mode == 'terminal' and not b.get('lines'): errs.append('browsersim (mode:"terminal"): missing "lines"')
    if t == 'workflowstepper':
        steps = b.get('steps') or []
        if len(steps) < 2: errs.append('workflowstepper: needs at least 2 steps')
        for s in steps:
            if not isinstance(s, dict) or not s.get('label'): errs.append(f'workflowstepper: step missing "label" — {s!r}'[:100])
    if t == 'dochighlighter' and not b.get('kind'):
        errs.append('dochighlighter: missing "kind" ("article"|"tweet"|"code")')
    return errs


def load_custom_types(job):
    """A job's project/src/custom_scenes/index.js (render_guide.md "Custom per-job scenes") can define
    bespoke `visual.type` strings the shared TYPES enum above knows nothing about. Rather than hardcode
    or guess them, read the object keys straight out of that job's own index.js default-export literal
    — regex, not a JS parser, since the file is always written in the one constrained shape the docs
    show (`export default {key: Comp, key2: Comp2}`). Returns a set (empty if the file is missing, the
    default empty `{}`, or anything unparseable — never raises, so a malformed custom file just means
    no extra types are allow-listed, not a crash)."""
    import os as _os, re as _re
    path = _os.path.join(job, 'project', 'src', 'custom_scenes', 'index.js')
    try:
        src = open(path, encoding='utf-8').read()
    except OSError:
        return set()
    # strip // line comments first — the template's own index.js documents the convention with an
    # example `export default {...}` line inside a comment, which would otherwise be matched instead
    # of (or alongside) the real code below it.
    src = _re.sub(r'//.*', '', src)
    m = _re.search(r'export\s+default\s*\{([^}]*)\}', src, _re.S)
    if not m:
        return set()
    return set(_re.findall(r'([A-Za-z_][A-Za-z0-9_]*)\s*:', m.group(1)))


def flatten_beats(scenes):
    """scenes: the 'scenes' list from scenes.json. Returns a flat list of visual.type strings, in
    narration order, the same order Doc.jsx's buildBeats() will play them in."""
    out = []
    for s in scenes:
        beats = s['visual'] if isinstance(s.get('visual'), list) else [s.get('visual')]
        for b in beats:
            if isinstance(b, dict) and b.get('type'):
                out.append(b['type'])
    return out


def check_no_repeat(types, max_run=2):
    """render_guide.md: don't use the same visual.type more than `max_run` times in a row.
    Returns a list of warning strings (empty if the sequence is fine)."""
    warns = []
    run_type, run_len, run_start = None, 0, 0
    for i, t in enumerate(types):
        if t == run_type:
            run_len += 1
        else:
            run_type, run_len, run_start = t, 1, i
        if run_len == max_run + 1:  # report once, right when the run first crosses the limit
            warns.append(f'"{t}" repeats more than {max_run}x in a row starting at beat {run_start + 1}; vary the visual type (render_guide.md no-repeat rule)')
    return warns
