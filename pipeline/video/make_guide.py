#!/usr/bin/env python3
"""Companion guide + social-copy generator. usage: make_guide.py jobs/<id>
Zero LLM calls here — this is pure templating/rendering. The content itself (title, steps, snippets,
tips, CTA) comes from project/src/guide.json, which the SAME pass that writes scenes.json should also
write (a lightweight/free LLM can produce both in one structured call — see docs/render_guide.md for
the schema). Writes, into project/out/:
  - guide.md          clean Markdown, Notion/web/copy-paste ready
  - guide.pdf         styled printable A4 PDF, AI Graphic TV brand theme (navy/cyan/gold)
  - social_copy.txt   YouTube description + IG/FB Reel caption (Comment-to-DM CTA) + pinned comment
Works for both type:long and type:short jobs — nothing here is format-specific.
If project/src/guide.json is missing, this script is a no-op (prints a notice, exits 0) so it never
blocks a render that predates the guide system."""
import json, os, sys, textwrap

NAVY = '#060B14'
CYAN = '#22D3EE'
GOLD = '#F59E0B'
WHITE = '#FFFFFF'
MUTE = '#AAB7CF'


def load(job):
    p = os.path.join(job, 'project', 'src', 'guide.json')
    if not os.path.exists(p):
        print(f'no guide.json at {p} — skipping companion guide (ok for jobs predating this feature)')
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def monetization():
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'monetization.json')
    try:
        return json.load(open(p, encoding='utf-8'))
    except Exception:
        return {}


def conversion_lines(mon, word='GUIDE'):
    """Plain-text conversion block. Only offers/affiliates with live:true and a url are shown."""
    vault = mon.get('vault_url', '')
    out = []
    if vault:
        out.append(f'Free PDF vault (every episode playbook): {vault}')
    for o in mon.get('offers', []):
        if o.get('live') and o.get('url'):
            out.append(f"{o['name']} ({o.get('price', '')}): {o['url']}")
    aff = [a for a in mon.get('affiliates', []) if a.get('live') and a.get('url')]
    for a in aff:
        out.append(f"{a['tool']}: {a['url']}")
    if aff and mon.get('disclosure'):
        out.append(mon['disclosure'])
    return out


def render_markdown(guide, meta):
    title = guide.get('title') or meta.get('title', 'Untitled')
    tldr = guide.get('tldr') or []
    tools = guide.get('tools') or []
    steps = guide.get('steps') or []
    snippets = guide.get('snippets') or []
    tips = guide.get('tips') or []
    mistakes = guide.get('mistakes') or []

    lines = [f'# {title}', '']
    if tldr:
        lines += ['**TL;DR**', '']
        for l in tldr[:2]:
            lines.append(f'> {l}')
        lines.append('')
    if tools:
        lines += ['## Tools & Resources Required', '']
        for t in tools:
            name = t.get('name', 'Tool')
            link = t.get('link', '[TOOL_LINK]')
            note = t.get('note', '')
            suffix = f' — {note}' if note else ''
            lines.append(f'- **{name}** ({link}){suffix}')
        lines.append('')
    if steps:
        lines += ['## Step-by-Step Implementation Checklist', '']
        for i, s in enumerate(steps, 1):
            st = s.get('title', f'Step {i}')
            detail = s.get('detail', '')
            lines.append(f'- [ ] **{i}. {st}**' + (f' — {detail}' if detail else ''))
        lines.append('')
    if snippets:
        lines += ['## Copy-Paste Prompts / Config Snippets', '']
        for s in snippets:
            label = s.get('label', 'Snippet')
            lang = s.get('lang', '')
            code = s.get('code', '')
            lines += [f'**{label}**', '', f'```{lang}', code, '```', '']
    if tips or mistakes:
        lines += ['## Pro Tips & Common Mistakes to Avoid', '']
        for t in tips:
            lines.append(f'- ✅ {t}')
        for m in mistakes:
            lines.append(f'- ⚠️ {m}')
        lines.append('')
    cl = conversion_lines(monetization())
    if cl:
        lines += ['## Keep going', ''] + [f'- {c}' for c in cl] + ['']
    lines += ['---', '', '*From [AI Graphic TV](https://youtube.com/@AIGraphicTV) — subscribe for more.*', '']
    return '\n'.join(lines)


def render_pdf(guide, meta, out_path):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT

    title = guide.get('title') or meta.get('title', 'Untitled')
    tldr = guide.get('tldr') or []
    tools = guide.get('tools') or []
    steps = guide.get('steps') or []
    snippets = guide.get('snippets') or []
    tips = guide.get('tips') or []
    mistakes = guide.get('mistakes') or []

    styles = getSampleStyleSheet()
    body = ParagraphStyle('body', parent=styles['Normal'], fontSize=10.5, leading=15, textColor=HexColor('#1a2235'))
    h2 = ParagraphStyle('h2', parent=styles['Heading2'], textColor=HexColor(NAVY), spaceBefore=14, spaceAfter=6)
    tldr_style = ParagraphStyle('tldr', parent=body, textColor=HexColor('#0b3a44'), backColor=HexColor('#e7fbff'),
                                 borderPadding=8, leading=15)
    code_style = ParagraphStyle('code', fontName='Courier', fontSize=9, leading=12, textColor=HexColor('#0b1526'),
                                 backColor=HexColor('#eef3f8'), borderPadding=8, alignment=TA_LEFT)

    # exact, unaltered brand logo (no recolor/crop/distortion) on the cover banner — drawImage with
    # preserveAspectRatio + mask='auto' keeps the source PNG's own pixels and alpha untouched.
    _logo_path = os.path.join(os.path.dirname(__file__), '..', 'template', 'public', 'brand_logo.png')
    _logo_path = os.path.abspath(_logo_path)
    _has_logo = os.path.exists(_logo_path)

    def banner(canvas, doc):
        canvas.saveState()
        w, h = A4
        canvas.setFillColor(HexColor(NAVY))
        canvas.rect(0, h - 28 * mm, w, 28 * mm, fill=1, stroke=0)
        canvas.setFillColor(HexColor(GOLD))
        canvas.rect(0, h - 28 * mm, w, 1.2 * mm, fill=1, stroke=0)
        text_x = 18 * mm
        if _has_logo:
            logo_size = 18 * mm
            canvas.drawImage(_logo_path, 18 * mm, h - 25 * mm, width=logo_size, height=logo_size,
                              preserveAspectRatio=True, mask='auto')
            text_x = 18 * mm + logo_size + 5 * mm
        canvas.setFillColor(HexColor(CYAN))
        canvas.setFont('Helvetica-Bold', 9)
        canvas.drawString(text_x, h - 10 * mm, 'AI GRAPHIC TV')
        canvas.setFillColor(HexColor(WHITE))
        canvas.setFont('Helvetica-Bold', 15)
        canvas.drawString(text_x, h - 20 * mm, _wrap_one_line(title, 70))
        canvas.setFillColor(HexColor(MUTE))
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(w - 18 * mm, 10 * mm, '@AIGraphicTV — youtube.com/@AIGraphicTV')
        canvas.restoreState()

    from reportlab.platypus import PageBreak
    big = ParagraphStyle('big', parent=styles['Title'], fontSize=30, leading=36, textColor=HexColor(NAVY), alignment=TA_LEFT)
    sub = ParagraphStyle('sub', parent=body, fontSize=13, leading=18, textColor=HexColor('#334155'))
    mon = monetization()
    word = (guide.get('cta') or {}).get('comment_word', mon.get('comment_word_default', 'GUIDE'))

    def build(extra_pages):
        doc = SimpleDocTemplate(out_path, pagesize=A4, topMargin=36 * mm, bottomMargin=18 * mm,
                                 leftMargin=18 * mm, rightMargin=18 * mm)
        flow = [Spacer(1, 40 * mm), Paragraph('EPISODE PLAYBOOK', ParagraphStyle('k', parent=body, textColor=HexColor(GOLD), fontSize=12)),
                Paragraph(_escape(title), big), Spacer(1, 8),
                Paragraph(_escape(' '.join(tldr[:2]) or 'Your step-by-step implementation guide.'), sub), PageBreak(),
                Paragraph('How to use this guide', h2),
                Paragraph('1. Watch the episode once, then follow this guide with the tool open.<br/>'
                          '2. Tick every checkbox in order: each step builds on the last.<br/>'
                          '3. Copy the prompts and settings exactly first, then adapt them to your own work.<br/>'
                          '4. Finish the 7-day action plan on the last pages: one small win per day.', body), PageBreak()]
        if tools:
            flow.append(Paragraph('Tools &amp; Resources Required', h2))
            rows = [[Paragraph(f"<b>{_escape(t.get('name', 'Tool'))}</b>", body),
                     Paragraph(_escape(t.get('link', '')), body),
                     Paragraph(_escape(t.get('note', '')), body)] for t in tools]
            tbl = Table(rows, colWidths=[40 * mm, 45 * mm, None])
            tbl.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, -1), 0.4, HexColor('#d8dee8'))]))
            flow += [tbl, Spacer(1, 10)]
        if steps:
            flow.append(Paragraph('Step-by-Step Implementation Checklist', h2))
            for i, st_ in enumerate(steps, 1):
                st = _escape(st_.get('title', f'Step {i}')); detail = _escape(st_.get('detail', ''))
                flow += [Paragraph(f'<b>☐ {i}. {st}</b>' + (f' — {detail}' if detail else ''), body), Spacer(1, 6)]
            flow.append(PageBreak())
        if snippets:
            flow.append(Paragraph('Copy-Paste Prompts / Config Snippets', h2))
            for sn in snippets:
                flow += [Paragraph(f"<b>{_escape(sn.get('label', 'Snippet'))}</b>", body), Spacer(1, 3),
                         Preformatted(sn.get('code', ''), code_style), Spacer(1, 8)]
            flow.append(PageBreak())
        if tips or mistakes:
            flow.append(Paragraph('Pro Tips &amp; Common Mistakes to Avoid', h2))
            for t in tips:
                flow += [Paragraph('✅ ' + _escape(t), body), Spacer(1, 4)]
            for m in mistakes:
                flow += [Paragraph('⚠️ ' + _escape(m), body), Spacer(1, 4)]
            flow.append(PageBreak())
        plan = guide.get('action_plan') or [f"Day {d}: " + (steps[(d - 1) % len(steps)].get('title', 'Practice a step') if steps else 'Practice one step')
                                           for d in range(1, 8)]
        flow.append(Paragraph('Your 7-day action plan', h2))
        for line in plan[:7]:
            flow += [Paragraph('☐ ' + _escape(line), body), Spacer(1, 8)]
        flow.append(PageBreak())
        for n in range(extra_pages):
            flow += [Paragraph('Practice &amp; notes', h2), Paragraph('Write what you tried, what worked and what to change next time.', body),
                     Spacer(1, 6)] + [Paragraph('_' * 70, body) for _ in range(18)] + [PageBreak()]
        flow.append(Paragraph('Keep going', h2))
        flow.append(Paragraph(f'Comment "{_escape(word)}" on the video and we will send you the next playbook.', body))
        flow.append(Spacer(1, 8))
        for c in conversion_lines(mon, word):
            flow += [Paragraph('• ' + _escape(c), body), Spacer(1, 5)]
        doc.build(flow, onFirstPage=banner, onLaterPages=banner)
        return doc.page

    pages = build(0)
    if pages < 6:
        pages = build(6 - pages)
    if pages > 10:
        print(f'WARNING: guide.pdf has {pages} pages (target 6-10): trim snippets/steps in guide.json')
    print(f'guide.pdf: {pages} pages')


def _escape(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _wrap_one_line(s, maxlen):
    return s if len(s) <= maxlen else s[:maxlen - 1] + '…'


def render_social_copy(guide, meta):
    title = guide.get('title') or meta.get('title', 'Untitled')
    tldr = ' '.join((guide.get('tldr') or [])[:2])
    cta = guide.get('cta') or {}
    word = cta.get('comment_word', 'GUIDE')
    conv = '\n        '.join(conversion_lines(monetization(), word))
    tags = meta.get('tags') or []
    hashtags = ' '.join('#' + str(t).replace(' ', '') for t in tags[:8])

    yt_desc = textwrap.dedent(f"""\
        {title}

        {tldr}

        🔗 Tools mentioned: see the free step-by-step guide — comment "{word}" below and we'll send it to you.
        {conv}

        {hashtags}

        Subscribe for more AI tool breakdowns: https://youtube.com/@AIGraphicTV
    """).strip() + '\n'

    ig_caption = textwrap.dedent(f"""\
        {title} 🤯

        {tldr}

        💬 Comment "{word}" and we'll DM you the free PDF guide.
        {conv}

        {hashtags}
    """).strip() + '\n'

    pinned = textwrap.dedent(f"""\
        📌 Free step-by-step PDF guide for this video — comment "{word}" and we'll send it your way!
        {conv}
    """).strip() + '\n'

    return (
        '=== YouTube description ===\n' + yt_desc + '\n'
        '=== Instagram/Facebook Reel caption ===\n' + ig_caption + '\n'
        '=== Pinned comment ===\n' + pinned
    )


def main():
    job = sys.argv[1].rstrip('/')
    guide = load(job)
    if guide is None:
        return
    meta = json.load(open(os.path.join(job, 'meta.json'), encoding='utf-8'))
    out = os.path.join(job, 'project', 'out')
    os.makedirs(out, exist_ok=True)

    md = render_markdown(guide, meta)
    open(os.path.join(out, 'guide.md'), 'w', encoding='utf-8').write(md)

    render_pdf(guide, meta, os.path.join(out, 'guide.pdf'))

    social = render_social_copy(guide, meta)
    open(os.path.join(out, 'social_copy.txt'), 'w', encoding='utf-8').write(social)

    print('wrote guide.md, guide.pdf, social_copy.txt to', out)


main()
