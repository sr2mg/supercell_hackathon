Newsopoly MVP Task Breakdown (v0.3)

目的
仕様 v0.3 に対して「できているところ」と「これから実装するところ」を明確化し、実装順序を揃える。

できているところ（現状）
1. ゲーム状態管理の基盤（Zustand）
2. ダイスロール→移動→次ターン
3. 16タイル盤面と描画の土台
4. プロパティ購入（単一オーナー前提）
5. RSSニュース取得と表示（簡易分類）
6. 一部タイル効果（SKIP_TURN等）
7. 勝利判定の一部（独自条件）

これから実装するところ（v0.3差分）
1. 仕様の基本条件反映
2. 盤面・タグ・配当仕様の差し替え
3. 株（最大3株）と配当分配ロジック
4. 自動売却と破産処理
5. ニュース→タグ影響への統合
6. 倒産とIPO差し替え
7. UI要件（株主ドット、倒産表示、資産内訳、ログ強化）
8. CPU購入ロジック（確定版）
9. フォールバック仕様（LLM失敗、News Deck補充）

実装優先順（推奨）
1. データ構造と定数（タグ、盤面、価格、IPOリスト）
2. コアロジック（配当分配、株管理、破産処理）
3. News Phase 統合（market/noise, major/minor）
4. 倒産・IPO
5. UI更新（盤面・プレイヤーパネル・ログ）
6. チューニングとテスト

具体タスク（ファイル単位）
1. 盤面データ置き換え
  - /Users/yasunamiura/project/supercell_hackathon/src/data/boardData.ts を v0.3 仕様の16銘柄に差し替え
  - Tag（AI/CHIPS/ENERGY/GOV/CRYPTO/MEDIA）と配当初期値を持つ構造へ変更
  - Chance/Tax/Special系のタイル効果を撤廃（Payday以外はAsset）

2. データ型の刷新
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts の型を v0.3 に合わせて定義変更
  - Asset, Player, NewsCard, Tag, LogEvent の型追加
  - 既存の Tile 型は不要なら整理

3. プレイヤー初期化変更
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts で Human1 + CPU3
  - 初期現金 $10000、順序固定

4. ターンフローの再実装
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts に News Phase / Move / Land / Buy / Bankruptcy / Win を実装
  - 1d6 移動、Payday通過で +$200
  - 15ターン上限、勝利条件を仕様通りに

5. 株の購入・保有・残株管理
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts で sharesRemaining / shareholders を管理
  - 1ターン1株購入、$500支払い

6. 配当支払い・分配
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts
  - 着地プレイヤーが配当を支払う
  - 株数比率で分配、端数切り捨て

7. 自動売却と破産処理
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts
  - 配当支払い前に不足があれば売却
  - 売却優先順位（低配当→下落タグ→ランダム）
  - 補填不可なら即脱落

8. ニュース処理の刷新
  - /Users/yasunamiura/project/supercell_hackathon/src/app/api/news/route.ts を NewsCard 形式に変更
  - market/noise, tag, titleJP/EN, reasonJP/EN, direction(optional)
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts で News Deck を保持し毎ターン適用
  - Minor/Major（±100/±200）、3ターンに1回Major

9. 倒産とIPO
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts
  - 配当0で倒産 → IPO差し替え
  - IPOリスト循環、初期配当200、株主リセット

10. CPU購入ロジック更新
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts
  - 基本条件 + 確率（CRYPTO/MEDIA 70%、その他50%）

11. UI更新（盤面）
  - /Users/yasunamiura/project/supercell_hackathon/src/components/Tile.tsx
  - 銘柄名、タグ、配当、株主ドット表示
  - 倒産表示（BANKRUPT）

12. UI更新（プレイヤーパネル）
  - /Users/yasunamiura/project/supercell_hackathon/src/components/ControlPanel.tsx
  - Cash / Stock Value / Net Worth
  - 保有銘柄一覧（株数・配当・清算価値）

13. UI更新（ニュース・ログ）
  - /Users/yasunamiura/project/supercell_hackathon/src/components/NewsTicker.tsx
  - NewsCardのJP/ENタイトルと理由
  - タグと変動量表示
  - /Users/yasunamiura/project/supercell_hackathon/src/store/gameStore.ts にログ配列を追加し順序を固定

14. Human購入UIのタイムアウト
  - /Users/yasunamiura/project/supercell_hackathon/src/components/ControlPanel.tsx
  - 10秒でSkip（デフォルト）

15. フォールバック仕様
  - /Users/yasunamiura/project/supercell_hackathon/src/app/api/news/route.ts
  - RSS失敗時にローカルニュースを返す
  - LLM失敗時は noise にフォールバック
  - News Deck 補充ロジック

16. テスト最小セット（任意）
  - /Users/yasunamiura/project/supercell_hackathon/src/lib か /Users/yasunamiura/project/supercell_hackathon/src/store に簡易ユニットテスト
  - 配当分配、倒産→IPO、15ターン終了
