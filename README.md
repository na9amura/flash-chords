# Flash Chords

ランダムに鳴るコードを聞いて、ルート音とコードタイプを当てる耳トレーニングWebアプリ。
静的サイトで、サーバー不要・データ永続化なし(セッションはメモリ上のみ)。

- 1セッション10問 / 採点: ルート・タイプ両方正解=1点、片方=0.5点、両方不正解=0点
- Web Audio API による加算合成(外部音源ファイルなし)
- Vite + React + TypeScript、テストは Vitest

## セットアップ

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # ユニットテスト
npm run build      # 型チェック + 本番ビルド(dist/)
npm run preview    # ビルド結果の確認
```

## スマホで確認する

PC とスマホを同じ Wi-Fi に接続し、`--host` 付きで起動します。

```sh
npm run dev -- --host
```

表示された `Network: http://192.168.x.x:5173/` をスマホのブラウザで開きます。

- iOS Safari ではマナーモード(消音スイッチ)がオンだと Web Audio の音が出ないことがあります。オフにしてください。
- 音声は「セッション開始」タップ時に有効化されます。

## コード種類の追加

`src/core/chords.ts` の `CHORD_TYPES` に1行追加するだけで、出題・回答ボタン・採点・再生に反映されます。

```ts
{ id: '6', label: '6', intervals: [0, 4, 7, 9] },
```

`intervals` はルートからの半音数(ルート=0)。12以上を指定すると1オクターブ上の音になります(add9 は 14)。

## 構成

```
src/core/        UI非依存のロジック(コード定義、ボイシング、出題、採点、セッション状態)とテスト
src/audio/       Web Audio による和音再生
src/components/  画面コンポーネント
```
