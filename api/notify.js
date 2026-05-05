import { readConfig } from "./lib/config.js";
import { fetchTrendingPapers } from "./lib/hf.js";
import { postToSlack, toSlackBlocks } from "./lib/slack.js";

export default async function handler(req, res) {
  try {
    const { CRON_SECRET, SLACK_WEBHOOK_URL } = readConfig();
    const token = req.query.token || req.headers["x-trigger-token"];
    if (token !== CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const period = req.query.period || "weekly";
    const field = req.query.field;
    const selected = req.query.select ? String(req.query.select).split(",") : null;

    let papers = await fetchTrendingPapers({ period, field });
    if (selected?.length) {
      papers = papers.filter((paper) => selected.includes(paper.id));
    }

    await postToSlack({
      webhookUrl: SLACK_WEBHOOK_URL,
      text: `Hugging Face ${period} featured papers`,
      blocks: toSlackBlocks({
        title: `${period} の注目論文`,
        period,
        papers
      })
    });

    return res.status(200).json({ ok: true, period, count: papers.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
