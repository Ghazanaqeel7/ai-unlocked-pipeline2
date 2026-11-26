#!/usr/bin/env python3
"""Build / refresh research/backlog.json: 100 deduplicated, scored video ideas.
score = 100 * (0.4*demand + 0.3*visual + 0.3*ctr) / 10, each part 1-10.
 demand = estimated English search demand (US/UK + Pakistan/India); visual = motion-graphic potential;
 ctr = pain-point urgency. Demand is an ESTIMATE; --refresh adds up to +8 when the tool is rising in docs/research/trends.json.
Every idea is a BRIEF: verified=false, the script pass must fact-check it (PIPELINE.md Never list).
usage: build_backlog.py [--refresh]   (keeps status/used flags of ideas already in the file)"""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'research', 'backlog.json')
# tools | topic | pain-point hook | demand | visual | ctr
RAW = """
NotebookLM|Turn one PDF into a podcast, slide deck and mind map|You read 50 pages and remember nothing|9|9|9
NotebookLM|Study for an exam from your own notes with NotebookLM|Cramming the night before again|9|7|9
NotebookLM|Build a personal research assistant from 20 sources|Too many tabs, zero answers|8|8|8
NotebookLM|Summarise a YouTube playlist into one study guide|No time to watch 40 videos|8|7|8
NotebookLM|Turn meeting notes into action items automatically|Meetings that produce nothing|7|7|8
NotebookLM|Make a podcast from your own business docs|Nobody reads your documentation|7|8|7
ChatGPT|Custom GPT that answers like your best employee|Answering the same questions daily|9|8|8
ChatGPT|Prompt pattern that stops generic answers|ChatGPT keeps giving boring answers|10|8|9
ChatGPT|Use memory and custom instructions properly|It forgets everything you told it|9|7|8
ChatGPT|Analyse a spreadsheet with ChatGPT in 2 minutes|Excel takes your whole afternoon|9|9|9
ChatGPT|Voice mode as a language tutor|Language apps are not working for you|8|7|8
ChatGPT|Write a full week of LinkedIn posts in 10 minutes|Posting consistently feels impossible|8|7|8
ChatGPT|Turn a messy brain dump into a clean plan|Overwhelmed with too many tasks|8|8|8
ChatGPT|Projects feature to organise client work|Chats everywhere, nothing findable|7|7|7
ChatGPT|Make ChatGPT critique your work harshly|Friends only say it's good|7|7|8
ChatGPT|Use ChatGPT to negotiate a bill or salary|Overpaying and afraid to ask|8|7|9
ChatGPT|Build a simple app without coding using ChatGPT|You have an idea but cannot code|9|8|9
ChatGPT|Create a daily briefing automatically|Starting every day in the inbox swamp|7|7|7
Claude|Claude Projects for long documents|Long documents break your workflow|8|8|8
Claude|Claude artifacts: build tools by chatting|Needing a tool that does not exist|8|9|8
Claude|Write like you with Claude styles|AI writing sounds robotic|8|7|9
Claude|Claude Code for non-developers|Terminal looks scary but saves hours|8|8|8
Claude|Review a contract with Claude before you sign|Signing things you did not understand|8|7|9
Claude|Analyse PDFs and charts with Claude|Reports you cannot read fast enough|7|8|7
Claude|Claude for research with web search|Research takes days|8|7|8
Claude|Turn Claude into a coding tutor|Tutorials that never stick|7|7|7
Claude|Claude connectors: calendar, docs, email|Switching apps all day|7|8|8
Claude|Automate weekly reports with Claude|Friday report you hate writing|7|7|8
Gemini|Gemini in Google Docs and Gmail time savers|Inbox and docs eat your day|8|7|8
Gemini|Gemini Deep Research for a full report|Hours of Googling for one answer|8|8|8
Gemini|Gemini Live: talk to your screen|Stuck and explaining takes forever|7|8|7
Gemini|Google AI Studio free app prototypes|Paying for tools you can get free|8|7|8
Gemini|Gemini for Sheets formulas|Formulas you can never remember|8|8|8
Gemini|Gems: build your own assistants|Repeating the same prompts|7|7|7
Gemini|Analyse a video with Gemini|Long videos you cannot watch|7|8|7
Gemini|Make images and edit photos with Gemini|Needing a designer for small jobs|8|9|8
Perplexity|Perplexity vs Google for research|Google results full of ads|8|7|8
Perplexity|Perplexity Spaces for a research workflow|Notes scattered everywhere|7|7|7
Perplexity|Fact-check anything in 30 seconds|Fake claims everywhere|7|7|8
Perplexity|Shopping and travel planning with AI|Planning a trip takes weeks|8|8|8
Perplexity|Competitor research in 10 minutes|Not knowing what rivals do|7|7|8
n8n|Build your first AI automation in n8n|Copy-pasting between apps all day|9|10|9
n8n|Auto-post content from one idea to 5 platforms|Posting manually everywhere|8|9|8
n8n|Email triage agent with n8n|Inbox zero never happens|8|9|9
n8n|Lead capture to CRM automatically|Leads falling through cracks|7|9|8
n8n|Self-host n8n for free|Paying for automation limits|7|8|7
n8n|Telegram bot that answers questions|Support messages at midnight|7|9|8
Zapier|Zapier AI agents for small business|Small tasks eating your week|7|8|7
Zapier|5 Zaps that save 5 hours a week|Repetitive admin|8|9|9
Make|Make.com scenarios for beginners|Automation tools feel confusing|7|9|7
Make|Auto-generate invoices and reminders|Chasing clients for payment|7|8|8
Cursor|Build an app with Cursor in one hour|Coding projects never finished|9|9|9
Cursor|Cursor rules that stop messy code|AI code is a mess to maintain|7|7|7
GitHub Copilot|Copilot agent mode explained|Pull requests piling up|7|7|7
Replit|Replit Agent: idea to live app|Hosting seems too hard|8|9|8
Lovable|Lovable: build a landing page by chatting|Paying agencies for simple sites|8|9|8
Bolt|Bolt.new to prototype a SaaS idea|Idea stuck in your head|8|9|8
v0|v0 to design a UI from a prompt|Cannot design to save your life|7|9|7
Midjourney|Midjourney prompts for product photos|Product photos cost too much|8|10|8
Midjourney|Consistent characters in Midjourney|Every image looks different|8|10|8
Canva|Canva AI: a week of posts in 20 minutes|Social posts take forever|9|10|9
Canva|Magic Design for presentations|Hours on slides|8|9|8
Canva|Brand kit for a business in 15 minutes|Looking unprofessional online|7|9|8
Gamma|Gamma: full presentation from a prompt|Presentation due tomorrow|8|9|9
Gamma|Turn a document into a website with Gamma|Needing a site fast|6|8|7
ElevenLabs|Clone your voice for narration|Hating the sound of your voice|8|8|8
ElevenLabs|AI voiceover for faceless videos|Faceless channels need a voice|8|8|8
Suno|Make a song from a text prompt|Music licensing is a headache|8|8|8
Runway|Runway: turn a photo into a video clip|Stock footage looks fake|8|10|8
Runway|AI video editing for beginners|Editing takes days|8|10|8
Pika|Pika effects for short videos|Shorts need fresh visuals|6|10|7
CapCut|CapCut AI captions and auto-cut|Captions take hours|9|9|9
CapCut|Repurpose one long video into 10 shorts|One video is not enough content|8|9|8
Descript|Edit video by editing text|Editing timelines confuse you|7|9|8
Descript|Remove filler words and fix audio|Audio sounds amateur|7|8|7
Notion|Notion AI second brain setup|Notes you never find again|8|8|8
Notion|Notion AI meeting notes to tasks|Meetings with no follow-up|7|8|8
Obsidian|Obsidian plus AI for notes|Notes stuck in silos|6|8|6
Ollama|Run AI locally for free with Ollama|Subscription costs adding up|8|8|8
LM Studio|LM Studio: private AI on your laptop|Worried about privacy|7|8|8
DeepSeek|DeepSeek vs ChatGPT for daily tasks|Which AI is worth using|8|7|8
Grok|Grok features worth knowing|Not sure what Grok adds|6|7|7
Copilot|Microsoft Copilot in Word and Excel|Office work drags on|8|7|8
Whisper|Transcribe any audio for free|Typing out interviews|7|7|7
Excel|AI formulas that replace hours of Excel|Formulas that break everything|9|9|9
Google Sheets|AI in Sheets: clean data fast|Messy data|8|9|8
Gmail|AI email replies in your own tone|Writing the same emails|8|7|8
Resume|Tailor a resume to each job with AI|Applying and hearing nothing|9|7|9
Interview|AI mock interviews that feel real|Interview nerves|8|7|8
LinkedIn|AI to grow a LinkedIn profile|Invisible profile|8|7|8
Freelancing|Win Upwork proposals with AI|Proposals ignored|8|7|9
Freelancing|Productise one AI service for clients|Selling hours not outcomes|8|7|8
Freelancing|Find leads with AI research|Cold outreach with no leads|7|8|8
Faceless|Build a faceless channel workflow with AI|Not wanting to be on camera|8|8|9
Study|AI study plan from your syllabus|Exams and no plan|9|7|9
Study|Learn any language with AI conversations|Not speaking after months|8|7|8
Productivity|One AI morning routine that saves an hour|Slow starts|7|8|8
Productivity|Build your own AI agent without code|Hearing about agents but not sure|9|9|9
Productivity|AI agents vs automations: what to use|Choosing the wrong tool|8|9|8
Productivity|Voice-to-text workflows to write 3x faster|Typing is slow|7|7|8
SEO|AI blog workflow that ranks|Content not ranking|8|7|8
SEO|Keyword research with free AI tools|Paying for SEO tools|8|8|8
Support|AI chatbot for your website in 20 minutes|Answering customers at 2am|8|9|8
Data|Build a dashboard with AI and no code|Data you cannot visualise|7|9|7
Privacy|What not to paste into AI tools|Leaking work data by accident|8|7|9
Prompting|Prompt templates for any task|Blank prompt box paralysis|9|8|9
Prompting|Chain prompts to get expert results|One prompt is never enough|8|8|8
Image|Remove backgrounds and edit photos free with AI|Editing software is complex|8|9|8
Image|Restore old family photos with AI|Faded photos need saving|7|10|8
Meta|AI tools that replaced my paid subscriptions|Subscriptions piling up|8|8|9
Meta|Free AI stack for a student|No budget for tools|9|8|9
Meta|AI mistakes beginners make in week one|Wasting time on bad habits|8|8|8
""".strip().splitlines()

def key(t): return re.sub(r'[^a-z0-9]+', ' ', t.lower()).strip()

def main():
    old = {}
    if os.path.exists(OUT):
        try: old = {i['key']: i for i in json.load(open(OUT, encoding='utf-8'))['ideas']}
        except Exception: pass
    boost = {}
    if '--refresh' in sys.argv:
        try:
            tr = json.dumps(json.load(open(os.path.join(ROOT, 'docs', 'research', 'trends.json')))).lower()
            boost = {'_blob': tr}
        except Exception: pass
    ideas, seen = [], set()
    for ln in RAW:
        tool, topic, pain, d, v, c = ln.split('|'); d, v, c = int(d), int(v), int(c)
        k = key(topic)
        if k in seen: continue
        seen.add(k)
        bonus = min(8, boost.get('_blob', '').count(tool.lower())) if boost else 0
        score = round(100 * (0.4 * d + 0.3 * v + 0.3 * c) / 10 + bonus, 1)
        prev = old.get(k, {})
        ideas.append({'key': k, 'tool': tool, 'topic': topic, 'pain_hook': pain, 'demand': d, 'visual': v, 'ctr': c,
                      'trend_bonus': bonus, 'score': score, 'verified': False,
                      'status': prev.get('status', 'idea'), 'job': prev.get('job')})
    ideas.sort(key=lambda i: -i['score']); ideas = ideas[:100]
    for n, i in enumerate(ideas, 1): i['rank'] = n
    json.dump({'_help': 'Top-100 ranked backlog. status: idea -> scheduled -> used. See pipeline/research/build_backlog.py',
               'ideas': ideas}, open(OUT, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f'{len(ideas)} ideas -> research/backlog.json (top: {ideas[0]["topic"]})')

if __name__ == '__main__': main()
