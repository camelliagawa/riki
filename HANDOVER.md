# 引き継ぎ書：力覚センサ CSV グラフビューア（camelliagawa/riki）

> 新しいチャットの最初のメッセージに、この内容をそのまま貼り付けて継続してください。
> （新セッションはリポジトリを再クローンするので、この文書の内容が最新状況の要約になります）

---

## 1. プロジェクト概要
- 力覚センサ（ZEF / DynPick 6軸、型番 ZEF-6A100-4＝定格 ±100N / ±4Nm）の CSV
  （DPViewer 出力）を**ドラッグ＆ドロップ**で読み込み、力（Force, N）／モーメント
  （Moment, Nm）の 2 段時系列グラフを表示する**単一 HTML アプリ**。
- Plotly を同梱（`vendor/plotly.min.js`）し**オフライン動作**。ビルド工程なしの素の HTML/JS。

## 2. リポジトリ／ブランチ／デプロイ
- リポジトリ: `camelliagawa/riki`（Public）
- **開発ブランチ**: `claude/funny-goodall-4vkf4q`（※以前は `claude/tender-euler-lxuglu` を使用。現行はこちら）
- **公開用**: `main`。運用は「feature ブランチにコミット → `main` に fast-forward マージ → 両方 push」。
- **公開 URL**: https://camelliagawa.github.io/riki/
- **Pages 配信方式**: GitHub Actions（`.github/workflows/pages.yml`）。
  以前は「main ブランチ直接配信」だったが、本セッションで **GitHub Actions 配信へ切替済み**
  （`actions/configure-pages@v5` の `enablement: true` により自動切替された）。
- main HEAD（最新コミット）: `222eee2`（本セッション終了時点）

## 3. ファイル構成
```
index.html            本体（Plotly 同梱の単一アプリ、約1060行）
sw.js                 Service Worker（HTMLはネットワーク優先／静的はキャッシュ優先）
vendor/plotly.min.js  Plotly 同梱
sample/               サンプルCSV
README.md
.github/workflows/pages.yml   GitHub Pages 自動デプロイ（コミット時刻埋め込み）
```

## 4. 主な実装済み機能
- ①無効データ(0 LSB)除外
- ②工程ごとの自動ゼロ（ドリフト補正。境界で区切り各工程の無負荷区間から零点算出）
- ③向き補正（選んだ軸を各工程で自動＋向きに揃える。反転境界は自動検出、手入力も可）
- ④反転中区間の非表示（境界±s／範囲指定）
- ⑤縦軸の基準（自動／ゼロ中心／ゼロ起点）
- サイドバー先頭の「★ おすすめ整形ガイド」：①〜⑤のチェックリスト（✓/○）＋
  「①〜⑤をまとめて実行」＋「元データを表示（加工オフ）」トグル（設定保持のまま加工ON/OFF）
- 色＝PowerPoint「テーマの色」パレット／線種（実線・破線・点線ほか、モノクロ対応）
- 画像出力：力／モーメント別・1枚、PNG(2倍)/SVG、背景＝透明(既定)/白
- ヘッダー右に**バージョンと最終更新日時**を表示

## 5. 本セッションで対応した内容（新しい順）
1. **不具合修正**：「元データを表示（加工オフ）」中（`cfg.showRaw=true`）は ②③④⑤ の加工が
   すべて無効化される。この状態で整形ステップを押しても `showRaw` が解除されず「反応しない」
   ように見えた（報告は②だが③④⑤も同根の不具合）。
   → `gStep()` と `applyRecommended()` の冒頭で `cfg.showRaw=false` に戻すよう修正。（commit 98afd05）
2. **バージョン表示**：ヘッダーに `APP_VERSION` と最終更新日時（分単位）を表示。（commit b2bc3d6）
3. **コミット時刻の自動埋め込み**：`.github/workflows/pages.yml` を追加。`main` への push 毎に
   コミット日時(JST・分単位)とコミットSHAを `index.html` に埋め込んで Pages へデプロイ。（commit 222eee2）

## 6. バージョン表示の仕組み（重要）
`index.html` 冒頭付近の定数：
```js
const APP_VERSION = "v1.1.0";   // 手動のセマンティックバージョン（リリース時に更新）
const APP_COMMIT  = "local";    // デプロイ時にコミットSHAへ自動置換
const APP_UPDATED = "2026-07-07 11:31";  // デプロイ時にコミット日時(JST)へ自動置換
```
- ヘッダー表示：`v1.1.0 (222eee2) ・ 更新 2026-07-07 11:49`
- `pages.yml` のビルドステップが sed で `APP_COMMIT` / `APP_UPDATED` を実値へ置換。
- ローカルで直接開いた場合は既定値（`local` と手動日時）を表示。
- **`APP_VERSION` だけは手動管理**。日時とSHAは push のたび自動更新される。

## 7. キャッシュ／更新反映
- `index.html` はネットワーク優先配信なので、通常リロード(Ctrl+R)で最新反映。`?v=N` 不要。
- 静的アセット(vendor/sample)はキャッシュ優先。それらを変えたときは sw.js の
  `CACHE = "riki-cache-v1"` の版数を上げると確実（今回は不要だった）。

## 8. コミット／作業の作法
- feature ブランチにコミット → `main` に `git merge --ff-only` → `git push -u origin` を両ブランチへ。
- コミットメッセージ末尾に付与：
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: <セッションURL>
  ```
- モデル識別子（claude-opus-4-8 等）は成果物（コミット/コード/PR）に書かない。
- PR はユーザーが明示的に依頼した時のみ作成。

## 9. 検証方法
- jsdom は当環境で利用不可だったため、ロジック抽出＋最小 node スクリプトで再現検証した。
- CI（pages.yml）は成功を GitHub MCP（actions_get / get_job_logs）で確認できる。
  ビルドステップが埋め込み後の該当行を grep 出力するので、実値の確認が可能。

## 10. データ特性メモ（サンプル解析より）
- 2000Hz。過去サンプルは 36万行/180秒だが有効は最初の約67.8秒（以降は全軸0 LSB＝未取得）。
  今回アップの USBOSC-07071119.csv は 60万行/300s、有効 186.8s まで。
- 作業は複数工程に分かれ、工程間で力の向きが逆・零点がドリフトする（包丁把持ツール反転＋自重）。
  → ②工程別自動ゼロ・③向き補正が効く前提。

## 11. 未対応の拡張候補（依頼があれば）
- 完全モノクロ（全系列黒）ワンクリック
- 複数センサの感度プリセット、列マッピングUI
- matplotlib 風の見た目寄せ
- `APP_VERSION` の自動バンプ（タグ連動など）
