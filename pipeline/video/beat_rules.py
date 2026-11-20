"""Shared scene/beat rules for validate_long.py and validate_short.py — keep in one place so both
formats enforce the same REGISTRY and no-repeat policy from docs/render_guide.md.
"""

# Must match REGISTRY in pipeline/template/src/Doc.jsx exactly.
PRIMARY = {'hookcard', 'mockup', 'toolgrid', 'comparecard', 'statcounter', 'stepflow'}
SECONDARY = {'title', 'chapter', 'photo', 'stat', 'chart', 'timeline', 'map', 'headline', 'compare', 'list', 'quote', 'illustration', 'endcard'}
TYPES = PRIMARY | SECONDARY


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
