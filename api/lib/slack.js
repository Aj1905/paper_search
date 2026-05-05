export async function postToSlack({ webhookUrl, text, blocks }) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack notification failed: ${response.status} ${body}`);
  }
}

export function toSlackBlocks({ title, period, papers }) {
  const header = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${title}*\n対象: ${period}`
    }
  };

  const items = papers.flatMap((paper, index) => {
    const tags = paper.tags.length ? `\nタグ: ${paper.tags.join(", ")}` : "";
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*${index + 1}. <${paper.url}|${paper.title}>*` +
            `\n${paper.summary.slice(0, 280)}${paper.summary.length > 280 ? "…" : ""}` +
            tags
        }
      },
      { type: "divider" }
    ];
  });

  return [header, ...items].slice(0, 50);
}
