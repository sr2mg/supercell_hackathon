Newsopoly（株式市場版）MVP 要件定義・実装仕様書 v0.3（確定版）
0. 目的 / MVPゴール
目的
リアルニュース（BBC RSS等）を入力に、LLMでニュースを「市場イベント（タグ影響）」へ変換し、株式（最大3株）×配当分配×倒産/IPOを用いたサバイバル型ボードゲームを成立させる。
MVPゴール（=Peer Reviewで評価される状態）
1ゲームが最初から最後まで破綻なくプレイできる
ニュースが毎ターン発生し、盤面の配当が変化する
株の購入・保有・配当分配が成立する
倒産/IPOが起きて盤面が変化する
CPUが自律的に行動し、ゲームが回る
UIで「何が起きたか」「誰が得したか」が即理解できる


1. ゲーム概要（Core）
ジャンル：AI-native × 株式市場 × モノポリー風サバイバル

プレイヤー構成：Human 1名 + CPU 3名（固定）
初期現金：各プレイヤー $10000

盤面：16マス（投資対象）

タグ：6つ（AI / CHIPS / ENERGY / GOV / CRYPTO / MEDIA）

START：Payday（Market Open）

ニュース：毎ターン必ず発生

所有：各銘柄は最大3株まで発行

着地：配当支払い→株主へ分配

敗北：破産したら脱落

勝利：最後の生存者

最大ターン：15ターン上限（推奨）

15ターン到達時点で生存者が複数なら「総資産1位が勝利」


2. 用語定義
銘柄（Asset）：盤面上の投資対象（会社/市場）
配当（Dividend）：着地時に支払われる金額（家賃の代替）
株（Share）：銘柄の所有権。最大3株。
News Deck：取得ニュースをLLM変換したゲーム用イベントカードの配列
Minor News / Major News：配当変動幅の大小


3. タグ設計（6カテゴリ固定）
以下の6タグを固定で使用する：

AI
CHIPS（半導体）
ENERGY
GOV（政府・金利・規制）
CRYPTO
MEDIA

ニュースは原則タグ単位で配当を動かす。


4. 盤面仕様（16マス固定）
Chanceマスは無し。ニュースは盤面外イベントとして毎ターン発生。
盤面（index順）
Payday / 給料日（Market Open）（GOV）
AI Agent Startup（AI）
Big Tech Cloud（AI）
GPU Maker（CHIPS）
Chip Factory（CHIPS）
Power Company（ENERGY）
Oil & Gas Giant（ENERGY）
Central Bank（GOV）
Government Bonds（GOV）
Crypto Exchange（CRYPTO）
Meme Coin（CRYPTO）
FinTech App（CRYPTO）
Social Media Platform（MEDIA）
Influencer Agency（MEDIA）
Streaming Studio（MEDIA）
Big Law & Compliance（GOV）
配当（Dividend）初期値
Payday：0（イベント枠）
Meme Coin：150
以下は250：
Big Tech Cloud
GPU Maker
Oil & Gas Giant
Central Bank
Social Media Platform
その他：200


5. 現金・株の価格（固定値で単純化）
数値のカオスを避けるため、株価概念は導入しない。
固定価格
購入価格：$500 / 1株
売却価格：$400 / 1株（清算価値）
資産計上価値：$400 / 1株（固定）
総資産（Net Worth）定義
Net Worth = 現金 + Σ(保有株数 × 400)


6. START（Payday）の仕様
Paydayの効果
通過したプレイヤーは 現金 +$200
着地しても追加効果なし（通過と同じ扱いでOK）


7. 株の購入ルール
購入可能条件
プレイヤーが着地した銘柄に「残株」がある場合のみ購入可能
購入可能数
1ターンに最大1株購入（MVPの簡略化）
ただし銘柄の残株が0なら購入不可
購入処理
プレイヤーの現金が$500以上なら購入可能
購入すると現金 -$500
株主情報に反映（playerIdとshares数）


8. 株の売却ルール
売却はプレイヤー操作ではなく、破産回避の自動処理として扱う（テンポ優先）。
自動売却条件
現金がマイナスになった場合に発動
売却価格
1株あたり $400
売却優先順位（簡易AIルール）
配当が低い銘柄の株
直近のニュースで下落したタグの株
残りをランダム

売却しても現金が0以上にならなければ脱落。


9. 配当支払い・分配（ゲームの核）
着地処理（Payday以外）
着地プレイヤーが、その銘柄の現在配当 D を支払う

D を株主へ分配（株数比率）

総株数=0の場合は「銀行に支払い（消滅）」扱い

自分が株主の場合、自分にも分配される（相殺される）

例：

配当300
Aが2株、Bが1株 → A +200, B +100


10. ニュース処理（AI-nativeの中心）
ニュース取得方針（推奨）
ゲーム開始時に一括取得（20〜40件）
取得元：BBC RSSなど
取得失敗に備え、ローカルニュースセットを同梱
LLMの役割（重要）
LLMは「分類と文章生成」だけを担当し、数値計算はさせない。

LLMが返す情報：

market/noise分類
marketならタグ（6つのうち1つ）
表示用の短いJP/ENタイトル
1行の理由（JP/EN）
（任意）上げ/下げ方向


11. ニュース種別と効果
News Type
Market News

タグ判定あり
対象タグの銘柄すべてに影響

Noise News

タグ判定なし
ランダムに影響タグを決める（重み付き）
Noiseのタグ抽選（推奨）
CRYPTO：40%
MEDIA：30%
AI：10%
CHIPS：10%
ENERGY：5%
GOV：5%

※「しょうもないニュースで市場が狂う」体験を強化する


12. Minor / Major News（変動幅固定）
変動量
Minor：±100
Major：±200
Major発生頻度
3ターンに1回 Major（例：turn % 3 == 0）
上げ/下げ方向の決定
MVP推奨（最小実装）：

market: 50%でup/down
noise: 50%でup/down

余裕があれば：

LLMが direction を返す（ただし信用できない場合はルール側で上書き可）
配当の下限
dividendは 0未満にならない（0で止める）


13. 倒産 / IPO（MVP必須）
倒産条件
配当が0になった銘柄は倒産する
倒産した銘柄の扱い
状態：isBankrupt = true
配当：0固定
株価値：0（保有株の資産計上も0にする）
UI上で「BANKRUPT」表示＋灰色化
IPO（倒産枠の差し替え）
倒産したマスは、新銘柄で置き換える（IPO）
IPO銘柄は事前定義リストから順に投入（ランダムでも可）
IPO時の初期配当：200
発行株数：3（残株3）
既存株主はリセット（新規銘柄なので株主なし）


14. IPO銘柄候補（事前定義：5個）
以下を「IPOリスト」として保持する。

AI Safety Auditor（AI）
Chip Packaging Plant（CHIPS）
Battery & Storage（ENERGY）
Stablecoin Bank（CRYPTO）
Short Video Network（MEDIA）

※IPOリストが尽きた場合は、再利用 or ランダム生成でも可


15. ターンフロー（実装の主手順）
ゲーム開始（1回）
Board初期化（16 assets, tags, dividends, sharesRemaining=3）
Players初期化（Human + CPU3）
News Fetch（20〜40 headlines）
LLM変換 → News Deck生成
ターンカウンタ = 1
各ターン（1〜15）
News Phase

News Deckから1枚pop
severity決定（3ターンに1回major）
market/noiseに応じて影響タグ決定
対象タグ銘柄のdividendを±100/±200更新
dividendが0になった銘柄は倒産→IPO差し替え

Move Phase

現在の生存プレイヤー全員が順番に移動（1d6）
Payday通過で +$200

Land Phase

着地銘柄がPayday以外なら配当支払い→株主へ分配
着地銘柄の残株があれば「購入判断」

Buy Phase

Human：UIでBuy/Skip選択
CPU：購入ロジックで自動

Bankruptcy Check

現金 < 0なら自動売却で補填
補填不可なら脱落

Win Check

生存者が1名なら即勝利
15ターン終了ならNet Worth最大が勝利


16. CPU行動仕様（MVP簡易AI）
CPUは以下の意思決定のみ行う：

着地銘柄の株を買うかどうか
CPU購入ロジック（シンプル推奨）
購入条件（全て満たせば買う）：

現金 >= 800（破産しにくいよう余裕を持つ）
着地銘柄の残株 > 0
着地銘柄の配当 >= 200
またはタグがCRYPTO/MEDIAなら配当150でも買う確率を上げる

これで「投資家っぽさ」と「カオス」が出る。


17. データ構造（推奨）
Asset
id: string
nameJa: string
nameEn: string
tag: Tag
dividend: number
sharesTotal: 3
sharesRemaining: number
isBankrupt: boolean
shareholders: { playerId: string, shares: number }[]
Player
id: string
name: string
type: "human"|"cpu"
cash: number
position: number
isAlive: boolean
NewsCard
id: string
sourceTitle: string
type: "market"|"noise"
tag: Tag|null
titleJa: string
titleEn: string
reasonJa: string
reasonEn: string
direction: "up"|"down"|null


18. UI要件（MVPで必須）
必須UI（Peer Reviewで刺さる部分）
ニュース表示（画面上部）

[🔴 BREAKING NEWS]
title（JP/EN併記）
reason（JP/EN併記）
影響タグと変動量（例：CRYPTO -200）

盤面表示（中央）

16マスの銘柄名、タグ、現在配当を大きく表示
株主状況（プレイヤーカラーのドット最大3）
倒産した銘柄は灰色化＋BANKRUPT表示

プレイヤーパネル（右側）

Cash
Stock Value（保有株×400、倒産株は0）
Total Net Worth
保有銘柄一覧（銘柄名/タグ/株数/現在配当/清算価値）

ログ表示

「誰がどこに止まった」
「配当をいくら払った」
「誰がいくら受け取った」
「倒産・IPOが起きた」

Human購入UI

着地時に「Buy 1 share ($500) / Skip」


19. フォールバック仕様（重要）
RSS取得失敗 → ローカルニュースセット使用
LLM失敗 → noiseとして扱い、ランダムタグに影響
News Deckが尽きた → ローカルニュースで補充


20. テスト観点（最低限）
dividend更新が対象タグにのみ適用される
配当支払い→分配が株比率通り
sharesRemainingが0以下にならない
倒産時に株価値が0になり、資産計上から除外される
IPO差し替え後にsharesRemaining=3で復活する
CPUが破産せず一定割合で株を買う
15ターンで必ずゲームが終了する


21. 実装優先順位（推奨）
盤面・プレイヤー・移動・配当分配（ゲームが回る状態）
株購入（Human/CPU）
ニュース取得→LLM変換→毎ターン反映
倒産/IPO
UI（ニュース演出・ログ・資産表示）
チューニング（CPU購入頻度、配当変動幅、noise偏り）


補足（姫様向けの重要判断）
株の資産計上を$400固定にしたことで、勝敗判定・破産処理が極端に簡単になり、MVPの安定性が上がります。
倒産/IPOを入れることで「世界が壊れて再構築される」体験が出て、ニュースゲームとしての説得力が増します。
CPU3固定により、盤面が賑やかでレビュー映えします。


22. 確定ルール（不足点の埋め・実装確定）
このセクションの内容は v0.3 以降の実装で確定とし、曖昧さを排除する。

22.1 初期資金
各プレイヤーの初期現金は $10000。

22.2 プレイヤー順序
順序は固定で Human → CPU1 → CPU2 → CPU3。
ターン内で順序は変更しない。

22.3 盤面の移動（1d6）
各プレイヤーの移動は 1d6 の乱数（1〜6）で決定。
移動は順番に1人ずつ実行。

22.4 配当支払い時の現金不足
着地時に配当を支払う前に、現金が不足している場合は「自動売却」を実行してから支払う。
自動売却後も不足する場合は、支払いは行わず即脱落とする。

22.5 破産判定タイミング
破産判定は Land Phase の配当支払い後に行う。
ただし配当支払い前に不足がある場合は 22.4 を適用。

22.6 配当の端数処理
配当が株比率で割り切れない場合は、全て切り捨て（floor）で支払う。
端数は銀行消滅扱いとする。

22.7 1人あたりの保有上限
1銘柄あたりの保有上限は設定しない。
発行株数3株の範囲で、1人が最大3株を保有できる。

22.8 倒産・IPO差し替えタイミング
ニュース適用直後（News Phase内）に配当が0になった銘柄は即倒産判定し、同フェーズ内でIPO差し替えを行う。

22.9 IPOリスト枯渇時
IPOリストを使い切った場合は、先頭から再利用する（循環）。

22.10 News Deck補充
News Deckが尽きた場合は、ローカルニュースセットを使用し、LLM変換なしで事前生成済みカードを補充する。

22.11 LLM失敗時の定義と扱い
LLM失敗は「JSON不正」「必須フィールド欠落」「タグ外の値」のいずれかが発生した場合とする。
失敗時は noise として扱い、ランダムタグ影響（11章）を適用する。

22.12 ログ出力（最小セット）
以下を必ず順番に記録する：
1) News表示（タグ・変動量含む）
2) 各プレイヤーの移動結果
3) 配当支払い額と受取額
4) 倒産/IPO発生
5) 脱落発生

22.13 Human購入UIの期限
購入判断は10秒以内に入力がない場合、デフォルトで Skip とする。

22.14 CPU購入確率
基本条件を満たした上で、
CRYPTO/MEDIA の場合は 70% で購入、それ以外は 50% で購入。

22.15 複数同時倒産
同ターンに複数倒産が発生した場合は、盤面indexの昇順でIPO差し替えを行う。


姫様、これで開発側は迷いなく走れます。 次に必要なら、LLMに投げるプロンプト（英語）＋出力JSON例10件まで作って「実装即着手パック」にして差し上げます。
