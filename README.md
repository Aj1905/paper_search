# Hugging Face Papers → Slack 通知アプリ

Hugging Face Papers の話題論文を取得し、Slack に通知する Vercel 向けサーバーレスアプリです。

## 機能

- 毎日定時（UTC 0:00）で `/papers` の話題論文を Slack に自動通知
- 手動トリガーで週次・月次の注目論文を Slack に通知
- 分野キーワード（例: `vision`, `llm`, `biology`）でフィルタリング
- 事前に論文一覧を API で取得し、ID 指定で送信対象の論文を選択可能

## エンドポイント

- `GET /api/papers?period=daily|weekly|monthly&field=<keyword>`
  - 論文一覧を取得
- `GET /api/cron-daily?token=<CRON_SECRET>&field=<keyword>`
  - 毎日通知（Vercel Cron から呼び出し）
- `GET /api/notify?token=<CRON_SECRET>&period=weekly|monthly&field=<keyword>&select=id1,id2`
  - 手動通知（Slack に投稿）

## 必要な環境変数

- `SLACK_WEBHOOK_URL`: Slack Incoming Webhook URL
- `CRON_SECRET`: API 保護用トークン

## デプロイ

1. Vercel にこのリポジトリを接続
2. Environment Variables に上記2つを設定
3. デプロイ後、`/api/papers` で取得確認
4. `vercel.json` の Cron は UTC 0:00（日本時間 9:00）

## 使い方例

### 毎日通知（自動）
Vercel Cron が `/api/cron-daily` を実行。

### 週次通知（手動ボタン想定）
フロントエンドや Slack Workflow から以下を叩く:

```bash
curl "https://<your-app>.vercel.app/api/notify?token=<CRON_SECRET>&period=weekly&field=llm"
```

### 論文選択して送信
1. `/api/papers?period=monthly` で id を取得
2. `select=idA,idB` を指定して `/api/notify` を呼ぶ

## 今後の拡張案

- 小さな Web UI（選択チェックボックス + ボタン）
- 通知フォーマットの改善（著者や投票数の表示）
- DB 保存（既送信の重複排除）
