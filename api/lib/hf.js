import * as cheerio from "cheerio";

const BASE_URL = "https://huggingface.co";

const PERIOD_PATH = {
  daily: "/papers",
  weekly: "/papers?date=weekly",
  monthly: "/papers?date=monthly"
};

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function includesField(item, field) {
  if (!field) return true;
  const f = field.toLowerCase();
  return [item.title, item.summary, item.tags.join(" ")].some((v) =>
    v.toLowerCase().includes(f)
  );
}

export async function fetchTrendingPapers({ period = "daily", field }) {
  const path = PERIOD_PATH[period] ?? PERIOD_PATH.daily;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "User-Agent": "paper-search-bot/0.1" }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Hugging Face Papers (${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const papers = [];

  $("article, main a").each((idx, el) => {
    const node = $(el);
    const href = node.attr("href") || node.find("a").attr("href");
    if (!href || !href.startsWith("/papers/")) return;

    const titleCandidate = normalizeText(
      node.find("h3,h2").first().text() || node.text().split("\n")[0] || ""
    );
    if (!titleCandidate || titleCandidate.length < 8) return;

    const summary = normalizeText(
      node.find("p").first().text() || node.text().split("\n").slice(1).join(" ")
    );

    const tags = node
      .find("a[href*='?tag='], span")
      .map((_, tag) => normalizeText($(tag).text()))
      .get()
      .filter(Boolean)
      .slice(0, 6);

    papers.push({
      id: `${idx}-${href}`,
      title: titleCandidate,
      summary: summary || "(要約は取得できませんでした)",
      url: `${BASE_URL}${href}`,
      tags
    });
  });

  const deduped = Array.from(new Map(papers.map((p) => [p.url, p])).values());

  return deduped.filter((p) => includesField(p, field)).slice(0, 20);
}
