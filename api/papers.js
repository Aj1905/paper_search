import { fetchTrendingPapers } from "./lib/hf.js";

export default async function handler(req, res) {
  try {
    const period = req.query.period || "daily";
    const field = req.query.field;
    const papers = await fetchTrendingPapers({ period, field });
    return res.status(200).json({ period, field: field || null, papers });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
