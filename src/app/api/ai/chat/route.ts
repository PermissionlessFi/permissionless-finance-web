import { ai, MODEL } from "@/lib/ai";
import { guardAiRequest, recordUsage } from "@/lib/ai-guard";
import type OpenAI from "openai";
import { getChapterContent } from "@/lib/chapters";
import { getChapterMeta } from "@/lib/toc";

const EXPERT_ROLES: Record<string, { zh: string; en: string; descZh: string; descEn: string }> = {
  M1: { zh: "市场微观结构", en: "Market Microstructure", descZh: "订单簿机制、价格发现、流动性结构", descEn: "Order book mechanics, price discovery, liquidity structure" },
  M2: { zh: "衍生品/永续合约", en: "Derivatives/Perpetuals", descZh: "期货、永续合约、资金费率、基差交易", descEn: "Futures, perpetuals, funding rates, basis trading" },
  M3: { zh: "金融风险", en: "Financial Risk", descZh: "尾部风险、损失分布、风险架构模型", descEn: "Tail risk, loss distribution, risk architecture" },
  M4: { zh: "系统性风险", en: "Systemic Risk", descZh: "传染路径、跨市场传导、系统性失败", descEn: "Contagion pathways, cross-market transmission, systemic failures" },
  M5: { zh: "DEX 专家", en: "DEX Expert", descZh: "去中心化交易所架构、透明度、MEV", descEn: "DEX architecture, transparency, MEV dynamics" },
  M6: { zh: "交易所架构", en: "Exchange Architect", descZh: "结算终局性、清算机制、基础设施设计", descEn: "Settlement finality, clearing mechanisms, infrastructure" },
  E1: { zh: "宏观金融", en: "Macro Finance", descZh: "宏观经济、利率、全球流动性、美元条件", descEn: "Macroeconomic context, interest rates, global liquidity" },
  E2: { zh: "行为金融", en: "Behavioral Finance", descZh: "心理因素、叙事效应、信息不对称、FOMO", descEn: "Psychological factors, narrative effects, information asymmetry" },
  E3: { zh: "合规/法律", en: "Compliance/Legal", descZh: "监管风险、法律定义、证券法、MiCA", descEn: "Regulatory risks, legal definitions, securities law, MiCA" },
  E4: { zh: "安全/运营风险", en: "Security/OpRisk", descZh: "运营安全、基础设施漏洞、智能合约风险", descEn: "Operational security, infrastructure vulnerabilities, smart contract risks" },
  E5: { zh: "交易台负责人", en: "Trading Desk Lead", descZh: "执行约束、滑点、资本效率、市场冲击", descEn: "Execution constraints, slippage, capital efficiency, market impact" },
};

function buildDiscussionPrompt(title: string, lang: string, roles: string[]): string {
  const selectedRoles = roles.length > 0 ? roles : ["M1", "M2", "M3"];
  const roleList = selectedRoles.map((id, i) => {
    const role = EXPERT_ROLES[id];
    if (!role) return "";
    return lang === "zh"
      ? `${i + 1}. 【${role.zh}】- ${role.descZh}`
      : `${i + 1}. [${role.en}] - ${role.descEn}`;
  }).filter(Boolean).join("\n");

  return lang === "zh"
    ? `你是一个学术专家讨论的主持人。当前讨论的章节是"${title}"。

参与讨论的专家：
${roleList}

重要规则：
- 每次回复只由一位专家发言，不要让多位专家同时发言
- 用角色名开头，格式为"【专家名】："，例如"【${EXPERT_ROLES[selectedRoles[0]]?.zh}】："
- 每位专家发言限1-2段（3-5句话），像对话一样简短有力
- 发言结束后，建议下一位应该回应的专家
- 保持学术性，但允许专家之间有分歧和辩论
- 如果用户发送"[继续讨论]"，表示系统自动请求下一位专家发言，请切换到下一位专家继续讨论，回应或反驳前一位专家的观点
- 如果用户插入其他评论，让最相关的专家直接回应用户的观点`
    : `You are a moderator for an academic expert discussion about "${title}".

Participating experts:
${roleList}

Critical rules:
- Each response should be from ONE expert only — do not have multiple experts speak at once
- Start with the expert's name in brackets, e.g. "[${EXPERT_ROLES[selectedRoles[0]]?.en}]:"
- Keep each expert's contribution to 1-2 paragraphs (3-5 sentences) — short and conversational like a real debate
- At the end, suggest which expert should respond next
- Maintain academic rigor but allow disagreements and debate between experts
- If the user sends "[继续讨论]", it means the system is requesting the next expert to speak — switch to the next expert and respond to or challenge the previous expert's points
- If the user sends any other message, have the most relevant expert respond directly to the user's point`;
}

const SYSTEM_PROMPTS: Record<string, (chapterTitle: string, lang: string, roles?: string[]) => string> = {
  discussion: (title, lang, roles) => buildDiscussionPrompt(title, lang, roles || []),

  qa: (title, lang) =>
    lang === "zh"
      ? `你是一位金融市场微观结构领域的专家教授。当前章节是"${title}"。基于章节内容回答用户的问题。引用具体的章节段落和图表。如果问题超出章节范围，说明并给出相关方向。回答简洁、准确、有深度。使用 markdown 格式化你的回答（加粗关键术语、使用列表、适当使用标题）。`
      : `You are an expert professor in financial market microstructure. Current chapter: "${title}". Answer questions based on the chapter content. Reference specific sections and figures. If a question goes beyond the chapter, note this and suggest directions. Be concise, accurate, and insightful. Use markdown formatting in your answers (bold key terms, use lists, use headers where appropriate).`,

  quiz: (title, lang) =>
    lang === "zh"
      ? `你是一位出题老师。当前章节是"${title}"。根据章节内容生成测验题目。

当用户要求出题时，每次只生成一道选择题，格式如下：

**问题：** [问题内容]

A) [选项A]
B) [选项B]
C) [选项C]
D) [选项D]

重要规则：
- 每次只出一道题
- 选项必须严格按照"A) "、"B) "、"C) "、"D) "的格式，每个选项独占一行
- 不要在出题时透露答案
- 用户回答后（发送 A/B/C/D），给出评分并详细解析，引用章节具体内容
- 解析完后，问用户是否要继续下一题`
      : `You are a quiz master for "${title}". Generate quiz questions based on chapter content.

When asked to generate a question, produce exactly ONE multiple choice question in this format:

**Question:** [question text]

A) [option A]
B) [option B]
C) [option C]
D) [option D]

Critical rules:
- Generate only ONE question at a time
- Options must strictly follow the format "A) ", "B) ", "C) ", "D) " — each on its own line
- Do NOT reveal the answer when presenting the question
- When the user answers (sends A/B/C/D), grade their answer and provide a detailed explanation referencing specific chapter content
- After explaining, ask if the user wants another question`,

};

export async function POST(req: Request) {
  const blocked = guardAiRequest(req);
  if (blocked) return blocked;

  try {
    const { messages, chapterNum, lang, mode, roles } = await req.json();

    // Load chapter content as context
    let chapterContent = "";
    let chapterTitle = "";
    try {
      chapterContent = getChapterContent(lang || "en", chapterNum || "01");
      const meta = getChapterMeta(chapterNum || "01", lang || "en");
      chapterTitle = meta?.title || "";
    } catch {
      chapterContent = "Chapter content not available.";
    }

    // Truncate chapter content to fit context window (keep first ~15000 chars)
    if (chapterContent.length > 15000) {
      chapterContent =
        chapterContent.slice(0, 15000) + "\n\n[... chapter content truncated ...]";
    }

    const systemPrompt = (SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.qa)(chapterTitle, lang || "en", roles);
    const fullSystem = `${systemPrompt}\n\n---\nChapter content for reference:\n\n${chapterContent}`;

    // OpenAI-compatible (Kimi/Moonshot): the system prompt is the first message.
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: fullSystem },
      ...((messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[]) || [
        { role: "user", content: "Hello" },
      ]),
    ];

    const stream = await ai.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      stream: true,
      // stream_options.include_usage isn't universally supported yet — read
      // usage opportunistically from the final chunk instead of requesting it.
      messages: chatMessages,
    });

    // Convert to ReadableStream for Next.js streaming.
    // NOTE: this runs AFTER the Response is returned, so mid-stream errors must
    // be surfaced via controller.error() — they can't reach the outer try/catch.
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let errored = false;
        let usage: OpenAI.Completions.CompletionUsage | undefined;
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
            if (chunk.usage) usage = chunk.usage; // some providers send it on the last chunk
          }
          // Best-effort: record token usage for the daily cap.
          if (usage) {
            recordUsage({ input_tokens: usage.prompt_tokens, output_tokens: usage.completion_tokens });
          }
        } catch (err) {
          errored = true;
          controller.error(err);
        } finally {
          // controller.error() already terminates the stream; only close if we
          // completed normally (double-close/close-after-error throws).
          if (!errored) controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
