# 010-n8n-first-ai-automation-long: script

Target 490s (~1389 words at 170 wpm). Markers drive the retention rules (pipeline/script/README.md).

[HOOK 0:00] You copy and paste between apps all day. In the next nine minutes you will build an AI automation in n8n that does that work for you, and you will not write a single line of code.

[REHOOK 0:13] But first, the one mistake that makes most beginners quit in the first ten minutes. I will show you exactly where it hides.

[CHAPTER 1 0:21] What n8n actually is

[REHOOK 0:21] n8n is a workflow automation tool. A workflow is a chain of nodes. A trigger node starts it, the other nodes each do one job, and the output of one node becomes the input of the next. That is the whole idea.

[REHOOK 0:36] Here is a way to picture it so it sticks.

Think of a recipe. The trigger is you walking into the kitchen. Each node is one step, chop, mix, bake, and each step hands its result to the next one. If the cake goes wrong, you do not throw out the kitchen. You find the one step that failed. Workflows in n8n work the same way, and you can open any node to see what it did.

[REHOOK 1:04] You can run it two ways, and one of them costs nothing. Here is the choice.

You can use n8n Cloud, which has a free trial that, at the time of recording, needs no credit card. Or you can self-host the Community Edition, which n8n describes as free and running without a license key. For your first build, cloud is faster, so open your dashboard and click Create Workflow.

[REHOOK 1:29] Before we build anything, learn one word, because it controls your bill. Execution.

An execution is one run of your whole workflow, no matter how many steps it has. And only production runs, the automatic ones, count toward your plan's quota. When you test by hand, that is a manual execution, and it does not count.

[CHAPTER 2 1:49] Build the brain

[REHOOK 1:49] Click Add first step and choose the trigger called On chat message. This is the Chat Trigger node. Every time someone sends a message, your workflow runs. n8n even gives you a hosted chat window for it, so you can talk to your workflow without building any interface.

[REHOOK 2:06] Now the part that turns a plain workflow into an AI automation.

Click the plus after the trigger and add the AI Agent node. The agent is the brain. You connect a chat model to it, and it decides which tools to use to finish the task you give it.

[REHOOK 2:24] But right now the brain has nothing to think with, because it has no model.

Under Chat Model, add the OpenAI Chat Model node, or a Google Gemini chat model if you want to start with a free Google AI key. n8n's own beginner template uses a free Google AI key for exactly that reason.

[REHOOK 2:44] Here is the mistake I promised, and it takes five seconds to avoid.

In the model node, open the credential dropdown, choose Create New Credential, and paste your API key. Skip this and the node fails on its first run, and it looks like n8n is broken when it is only missing a key. Keep that key private. Never paste it into a chat or a public screenshot.

[REHOOK 3:08] Now you have a trigger, a brain and a model. Here is what each one is really doing.

The Chat Trigger listens and passes the message along. The model reads it and writes language. The agent sits in the middle and decides what happens next. Three nodes, three jobs. When you build bigger automations later, you will keep asking the same question: which node owns this job?

[CHAPTER 3 3:32] Give it hands

[REHOOK 3:32] A chatbot only talks. An agent acts. To make that happen you attach tools. Click the plus under Tool on the AI Agent node and add something simple first, like the Date and Time tool.

[REHOOK 3:44] Watch what changes when you add that one tool.

Ask the agent: what is the date three days from now? Without a tool, a language model has to guess. With the tool, the agent decides to call it, gets the real date, and answers from that. That decision is what makes it an agent.

[REHOOK 4:03] Next, tell the agent who it is, because a vague agent gives vague answers.

In the agent's options, add instructions: its job, its tone, and what it must never do. One clear sentence beats a long paragraph. For example: you are an assistant for my small business, answer in two sentences, and if you do not know, say so.

[CHAPTER 4 4:24] Test it like a pro

[REHOOK 4:24] Click Execute Workflow, or open the chat and send a message. That is a manual execution, made for testing. Open each node and read its output panel. You see exactly what went in and what came out, so debugging becomes reading instead of guessing.

[REHOOK 4:39] This is the habit that separates beginners from people who ship.

Before you change anything, read the output of the node before the problem. Most mistakes are not clever. A field is empty, a connection is missing, or the wrong thing was passed in. Check what went in, check what came out, then change one thing at a time. If you change three things at once, you will never know which one fixed it.

[REHOOK 5:05] When something breaks, it breaks in one node, and n8n shows you which one.

A red node means open it and read the error. Start with the basics: credentials, missing connections, and empty fields. Fix one thing, run it again, and watch the output change.

[REHOOK 5:22] One more habit before we make this run on its own.

Change the question and run it again. Try five very different questions. If the answers stay useful across all five, your agent is ready. If one answer is wrong, fix the instructions, not the model.

[REHOOK 5:38] Pause here, because this is where people over-build.

You do not need ten nodes. You need one workflow that works from start to finish. A small automation that runs every day beats a giant one that never leaves your screen. Finish the loop first: message in, thought, tool call, answer out. Then, and only then, add the next idea on top of it.

[CHAPTER 5 6:01] Make it run on its own

[REHOOK 6:01] A chat workflow waits for you. To run on a clock, use the Schedule Trigger node. Pick seconds, minutes, hours, days, weeks or months, or type a custom cron expression. It uses the workflow's timezone if one is set, and otherwise the n8n instance timezone.

[REHOOK 6:17] Two details here save you from a very annoying surprise.

First, check the timezone, because a nine in the morning schedule means nothing if the workflow thinks it is somewhere else. Second, use a cron expression when the preset options are not enough. For example, zero nine star star star means every day at nine, and star slash fifteen means every fifteen minutes. The guide has a cheat sheet.

[REHOOK 6:41] But a schedule does nothing until you do one last thing.

You must publish the workflow. Saving alone is not enough. Published workflows run automatically from their triggers and schedules, and those production runs are the ones that count toward your execution quota.

[REHOOK 6:56] Here is the safest way to start, and it is smaller than you think.

Keep your first scheduled automation tiny: one trigger, one agent, one output, running once a day. You learn how it behaves before you scale it. And if you want a head start, n8n's template library has a build your first AI agent template you can open and study.

[REHOOK 7:19] And here is how to keep this going after today.

Pick one boring task you repeat every week. Write it as a sentence: when this happens, do that. The first half is your trigger and the second half is your agent and tools. If you can say it as one sentence, you can almost certainly build it as a workflow. Start there, and keep it small.

[REHOOK 7:42] So what did you just build?

A trigger that listens, an agent that thinks, a model that powers it, a tool that lets it act, tested by hand, then published to run alone. That is the pattern behind almost every AI automation you will see.

[REHOOK 7:58] Comment GUIDE and the full step-by-step PDF with the checklist, prompts and a seven-day action plan is yours. And watch tomorrow's Short for day two of the seven-day workflow series.

## Fact map

(see factmap.md)
