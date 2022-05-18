---
title: Salmonia 2.1.0リリースした
date: 2022-05-18
categoriy: プログラミング
tags:
  - Python
---

## Salmonia 2.1.0

いつの間にか API のバージョンが 2.1.0 になっていたので対応しました。

[ソースコードはいつもどおり公開](https://github.com/tkgstrator/Salmonia)されているので、ご自由にご利用ください。

動作保証はしないのですが[Windows 版](https://github.com/tkgstrator/Salmonia/releases/tag/v2.1.0)もリリースしています（いや、多分これ動かねえな？

### 仕様

基本的には今までと同じですが、ちょっとだけ違うところを解説。

- イカリング 2 のログインのみ
  - Salmon Stats のログイン機能は消滅
- 自動でブラウザが開かないように修正
  - 要望があったら開くようにするけど
- 自動でバージョンアップを行うように修正
  - ちょっとだけ便利だと思う
- フレンドコードの取得に対応
  - 取得するだけ、何かに使えるかは不明
- アップロードできるサーバを指定できるように変更
  - デフォルトだと本番環境
  - つまり、動かない

#### 詳細な使い方

まずはクローンしてきて、設定ファイルをコピー。

```zsh
git clone https://github.com/tkgstrator/Salmonia
cd Salmonia
cp .env.sample .env
```

.env ファイルを適当なエディタで開いて`LAUNCH_MODE`を 1 に切り替え。

```zsh
# 0: Production
# 1: Development
# 2: Sandbox
# 3: Local

LAUNCH_MODE = 1
```

次に必要なパッケージをインストール。でもあれだ、多分`python_dotenv`だけ忘れてるわこれ...

```zsh
python3 -m pip install -r requirements.txt
python3 -m pip install python_dotenv
```

二行目に関してはひょっとしたら要らないかもだけど、動かなかったら入れてください。

```zsh
python3 main.py
```

これであとは自動的にデータを取得してくれます。

アップロードされているかどうかは[このサイト](http://api-dev.splatnet2.com:5555/)を見ればわかります。

なお、これは開発環境で誰でもデータを弄れてしまうので、動作確認用みたいなものです。実際のデータは`results`のディレクトリに保存されているので、これを消してしまわないように注意しましょう。

記事は以上。
