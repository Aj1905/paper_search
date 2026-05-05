import { readConfig } from "./lib/config.js";
import { fetchTrendingPapers } from "./lib/hf.js";
import { postToSlack, toSlackBlocks } from "./lib/slack.js";

export default async function handler(req, res) {
  try {
    const { CRON_SECRET, SLACK_WEBHOOK_URL } = readConfig();
    const token = req.query.token || req.headers["x-cron-token"];
    if (token !== CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const field = req.query.field;
    const papers = await fetchTrendingPapers({ period: "daily", field });

    await postToSlack({
      webhookUrl: SLACK_WEBHOOK_URL,
      text: "Hugging Face daily trending papers",
      blocks: toSlackBlocks({
        title: "本日の話題論文",
        period: "daily",
        papers
      })
    });

    return res.status(200).json({ ok: true, count: papers.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
