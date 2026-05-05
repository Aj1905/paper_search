# Hugging Face Papers → Slack 通知アプリ

Hugging Face Papers の話題論文を取得し、Slack に通知する Vercel 向けサーバーレスアプリです。

## 機能

- 毎日定時（UTC 0:00）で `/papers` の話題論文を Slack に自動通知
- 手動トリガーで週次・月次の注目論文を Slack に通知
- 分野キーワード（例: `vision`, `llm`, `biology`）でフィルタリング
- 事前に論文一覧を API で取得し、ID 指定で送信対象の論文を選択可能
- GitHub Actions による Vercel への CD（main pushで自動本番デプロイ）

## エンドポイント

- `GET /api/papers?period=daily|weekly|monthly&field=<keyword>`
  - 論文一覧を取得
- `GET /api/cron-daily?token=<CRON_SECRET>&field=<keyword>`
  - 毎日通知（Vercel Cron から呼び出し）
- `GET /api/notify?token=<CRON_SECRET>&period=weekly|monthly&field=<keyword>&select=id1,id2`
  - 手動通知（Slack に投稿）

## 必要な環境変数（Vercel Project）

- `SLACK_WEBHOOK_URL`: Slack Incoming Webhook URL
- `CRON_SECRET`: API 保護用トークン

## CD 用シークレット（GitHub Repository Secrets）

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

> `VERCEL_ORG_ID` と `VERCEL_PROJECT_ID` は `vercel pull` 実行で生成される `.vercel/project.json` から確認できます。

## デプロイ手順

### 1) 初回手動デプロイ（ローカル）

```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

### 2) CD 有効化

1. GitHub の `Settings > Secrets and variables > Actions` で上記3つのシークレットを登録
2. Vercel プロジェクト側に `SLACK_WEBHOOK_URL`, `CRON_SECRET` を登録
3. `main` ブランチへ push すると `.github/workflows/cd-vercel.yml` が本番デプロイ

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

## トラブルシュート

- `conflict` や link エラーが出る場合は、`.vercel` を削除して `vercel link` を再実行してください。
- GitHub Actions のデプロイが失敗する場合は、`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` の3つが正しく設定されているか確認してください。
