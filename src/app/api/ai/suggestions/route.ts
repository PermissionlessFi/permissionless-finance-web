import { ai, MODEL } from "@/lib/ai";
import { guardAiRequest, recordUsage } from "@/lib/ai-guard";

export async function POST(req: Request) {
  const blocked = guardAiRequest(req);
  if (blocked) return blocked;

  try {
    const { lang, sectionText } = await req.json();

    const response = await ai.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            lang === "zh"
              ? "基于给定的章节内容，生成2-3个有深度的讨论问题。每个问题一行，用编号列出。问题要能引发思考，不要太简单。只输出问题，不要其他文字。"
              : "Based on the given chapter content, generate 2-3 thought-provoking discussion questions. One question per line, numbered. Questions should be insightful and challenging. Output only the questions, nothing else.",
        },
        { role: "user", content: String(sectionText ?? "").slice(0, 3000) },
      ],
    });
    if (response.usage) {
      recordUsage({ input_tokens: response.usage.prompt_tokens, output_tokens: response.usage.completion_tokens });
    }

    const text = response.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: "model returned empty response" }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const questions = text
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((l) => l.replace(/^\d+[.)]\s*/, "").trim());

    return Response.json({ questions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return Response.json({ error: message }, { status: 500 });
  }
}
