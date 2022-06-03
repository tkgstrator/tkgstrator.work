---
title: Typescript+React+Viteから逃げるな
date: 2022-01-31
category: プログラミング
tags:
  - Vite
  - Typescript
  - React
---

## そろそろ逃げるのをやめたい

何から逃げているのかよくわからないが、今までぼくは Vue+JS という環境でウェブサイトを運営してきました。

で、少なくともそれで特に問題はなかったわけです。

でもやっぱり React も触っておいたほうがいいよなあ、Vue じゃなくて Vite だよなあ、Javascript だけでなく Typescript も扱えないとダメだよなあって言うことで、重い腰を上げて取り組むことにしました。

どの技術も触るのはほとんど初めてなのですが、困ったときはつよつよエンジニアの方々がフォロワーにたくさんいるのでその方々にきけばいいやと大船に乗ったつもりで挑戦したいと思います。

## セットアップ方法

`yarn`がインストールされているのであれば`yarn create vite`でプロジェクトが作成できます。

今回は`Typescript`で実装したかったので`react-ts`を選択しました。

```
$ yarn create vite
yarn create v1.22.17
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Installed "create-vite@2.7.2" with binaries:
      - create-vite
      - cva
✔ Project name: … salmonia3-web
✔ Select a framework: › react
✔ Select a variant: › react-ts
```

これだけでプロジェクトが完成します、楽でいいですね。

プロジェクトができたらディレクトリを移動して`yarn`でパッケージ類をインストールしてから`yarn dev`で実際に動かしてみましょう。

### プロジェクトの実行

```
vite v2.7.13 dev server running at:

> Local: http://localhost:3000/
> Network: use `--host` to expose

ready in 512ms.
```

たったの 512ms で開発環境が立ち上がってしまいます...

## プライバシーポリシーを表示

Apple の審査の規約で、プライバシーポリシーを表示しなければいけない、というのがあります。

なので、プライバシーポリシーを表示できるようにします。

正直、React のポテンシャルを考えると「プライバシーポリシーを表示するだけなの」というきはしなくもないのですが、初心者なので勘弁してください。

この程度であればわざわざ複雑なコードを書かなくても Markdown 形式のファイルを読み込んで DOM なりで描画すればよいだけです。ただ、デフォルトでは React には`raw-loader`が入っていないため、テキストデータをそのまま読み込むことはできません。

読み込ませるようにしてもいいのですが、大した量ではないのでソースコード内にテキストを埋め込むことにします。

### ソースコード

以下のような感じでコードを書きます。

事前に`react-markdown`をインストールするのを忘れないようにしましょう。

コマンドは`yarn add react-markdown`で大丈夫です。

```ts
// Privacy.tsx
import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const md = `MARKDOWN TEXT`;

export default class PrivacyPolicy extends React.Component {
  render() {
    return (
      <div className="App">
        <ReactMarkdown>{md}</ReactMarkdown>
      </div>
    );
  }
}
```

このままだとベタ書きなので CSS を使ってそれっぽくします。

```css
@font-face {
  font-family: "SF Pro Text";
  src: local("SFProText"), url(./fonts/SFProText.woff2) format("woff2");
}

.App {
  max-width: 1280px;
  margin: 0 auto;
  width: 87.5%;
  line-height: 1.47059;
  font-weight: 400;
  font-style: normal;
  font-family: "SF Pro Text";
  color: #1d1d1f;
  font-size: 17px;
  letter-spacing: -0.022em;
}

h2 {
  font-size: 32px;
  font-weight: 600;
}

h3 {
  font-size: 1.17em;
  font-weight: 600;
}

a {
  color: #06c;
  letter-spacing: inherit;
}
```

`SFProText`がかっこいいとのことなので使ってみました。

![](https://pbs.twimg.com/media/FKgLeGLVkAQyCLa?format=png&name=4096x4096)

するとそれっぽいページが完成します。

### ジャンプ機能をつける

SPA でページをジャンプする機能を使うには`react-router-dom`を利用します。

こちらも単純に`yarn add react-router-dom`で問題ないです。

[公式ドキュメント](https://reactrouter.com/docs/en/v6)が大変充実しているので、これを読むと良いでしょう。

```ts
// App.tsx
import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import Privacy from "./Privacy";
import EULA from "./EULA";

function App() {
  return (
    <div className="App">
      <h1>Salmonia3</h1>
      <Routes>
        <Route path="privacy" element={<Privacy />} />
        <Route path="agreement" element={<EULA />} />
      </Routes>
    </div>
  );
}

export default App;
```

今回はプライバシーポリシーと EULA を表示するようにしました。

### リダイレクト問題

Netlify には直接 SPA のルータを踏むと 404 エラーが発生するという問題があります。

`public/_redirects`というファイルを作成して、

```txt
/* /index.html 200
```

と書き込んで保存すれば、自動でトップページにリダイレクトしてくれます。こうすれば 404 エラーが出なくなります。

[完成したもの](https://salmonia3.netlify.app/privacy)はこれです。Vite なのでビルドサクサク、静的サイトなので描画もサクサクでストレスフリーです。
記事は以上。
