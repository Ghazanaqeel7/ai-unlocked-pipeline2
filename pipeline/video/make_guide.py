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

    def banner(canvas, doc):
        canvas.saveState()
        w, h = A4
        canvas.setFillColor(HexColor(NAVY))
        canvas.rect(0, h - 28 * mm, w, 28 * mm, fill=1, stroke=0)
        canvas.setFillColor(HexColor(GOLD))
        canvas.rect(0, h - 28 * mm, w, 1.2 * mm, fill=1, stroke=0)
        canvas.setFillColor(HexColor(CYAN))
        canvas.setFont('Helvetica-Bold', 9)
        canvas.drawString(18 * mm, h - 10 * mm, 'AI GRAPHIC TV')
        canvas.setFillColor(HexColor(WHITE))
        canvas.setFont('Helvetica-Bold', 15)
        canvas.drawString(18 * mm, h - 20 * mm, _wrap_one_line(title, 70))
        canvas.setFillColor(HexColor(MUTE))
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(w - 18 * mm, 10 * mm, '@AIGraphicTV — youtube.com/@AIGraphicTV')
        canvas.restoreState()

    doc = SimpleDocTemplate(out_path, pagesize=A4, topMargin=36 * mm, bottomMargin=18 * mm,
                             leftMargin=18 * mm, rightMargin=18 * mm)
    flow = []
    if tldr:
        flow.append(Paragraph('<b>TL;DR</b><br/>' + '<br/>'.join(_escape(t) for t in tldr[:2]), tldr_style))
        flow.append(Spacer(1, 10))
    if tools:
        flow.append(Paragraph('Tools &amp; Resources Required', h2))
        rows = [[Paragraph(f"<b>{_escape(t.get('name', 'Tool'))}</b>", body),
                 Paragraph(_escape(t.get('link', '[TOOL_LINK]')), body),
                 Paragraph(_escape(t.get('note', '')), body)] for t in tools]
        tbl = Table(rows, colWidths=[40 * mm, 45 * mm, None])
        tbl.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                                  ('LINEBELOW', (0, 0), (-1, -1), 0.4, HexColor('#d8dee8'))]))
        flow.append(tbl)
        flow.append(Spacer(1, 10))
    if steps:
        flow.append(Paragraph('Step-by-Step Implementation Checklist', h2))
        for i, s in enumerate(steps, 1):
            st = _escape(s.get('title', f'Step {i}')); detail = _escape(s.get('detail', ''))
            txt = f'<b>☐ {i}. {st}</b>' + (f' — {detail}' if detail else '')
            flow.append(Paragraph(txt, body))
            flow.append(Spacer(1, 4))
        flow.append(Spacer(1, 8))
    if snippets:
        flow.append(Paragraph('Copy-Paste Prompts / Config Snippets', h2))
        for s in snippets:
            flow.append(Paragraph(f"<b>{_escape(s.get('label', 'Snippet'))}</b>", body))
            flow.append(Spacer(1, 3))
            flow.append(Preformatted(s.get('code', ''), code_style))
            flow.append(Spacer(1, 8))
    if tips or mistakes:
        flow.append(Paragraph('Pro Tips &amp; Common Mistakes to Avoid', h2))
        for t in tips:
            flow.append(Paragraph('✅ ' + _escape(t), body))
        for m in mistakes:
            flow.append(Paragraph('⚠️ ' + _escape(m), body))
    doc.build(flow, onFirstPage=banner, onLaterPages=banner)


def _escape(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _wrap_one_line(s, maxlen):
    return s if len(s) <= maxlen else s[:maxlen - 1] + '…'


def render_social_copy(guide, meta):
    title = guide.get('title') or meta.get('title', 'Untitled')
    tldr = ' '.join((guide.get('tldr') or [])[:2])
    cta = guide.get('cta') or {}
    word = cta.get('comment_word', 'GUIDE')
    affiliate = cta.get('affiliate_link', '[AFFILIATE_LINK]')
    tags = meta.get('tags') or []
    hashtags = ' '.join('#' + str(t).replace(' ', '') for t in tags[:8])

    yt_desc = textwrap.dedent(f"""\
        {title}

        {tldr}

        🔗 Tools mentioned: see the free step-by-step guide — comment "{word}" below and we'll send it to you.
        🔗 Get started: {affiliate}

        {hashtags}

        Subscribe for more AI tool breakdowns: https://youtube.com/@AIGraphicTV
    """).strip() + '\n'

    ig_caption = textwrap.dedent(f"""\
        {title} 🤯

        {tldr}

        💬 Comment "{word}" and we'll DM you the free PDF guide.
        🔗 Link in bio: {affiliate}

        {hashtags}
    """).strip() + '\n'

    pinned = textwrap.dedent(f"""\
        📌 Free step-by-step PDF guide for this video — comment "{word}" and we'll send it your way!
        Tools/links: {affiliate}
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
