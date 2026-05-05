import { z } from "zod";

const schema = z.object({
  SLACK_WEBHOOK_URL: z.string().url(),
  CRON_SECRET: z.string().min(8)
});

export function readConfig() {
  return schema.parse(process.env);
}
