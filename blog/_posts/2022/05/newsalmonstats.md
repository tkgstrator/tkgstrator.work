---
title: New Salmon Stats進捗状況
date: 2022-05-16
category: プログラミング
tags:
  - 話題
  - Typescript
  - NestJS
  - Prisma
---

## New Salmon Stats

さて、旧 Stats がお亡くなりになってから二週間ほど経ちました。それから OSS で改修しやすいことを目的として Typescript で書き直した New Salmon Stats を開発中なのですが、どこまで進んだか知りたい方もいると思うのでご報告します。

## 構成

Salmon Stats をつくるにあたって、必要なのは以下のコンポーネントです。

- データベース
  - 送られてきたリザルトを保存する
- サーバー
  - 送られてきたリザルトを受け取ってデータベースに保存する
  - 要求されたリクエストに従ってデータベースからリザルトを取得する
- フロントエンド
  - サーバーにリザルトを要求する
  - 受け取ったデータを表示する
- クライアント
  - イカリング 2 からリザルトを取得する
  - サーバーにリザルトを送る

::: tip フロントエンドとバックエンド

データベースとサーバーを合わせてバックエンド、（わかりやすくいうと）ホームページのことをフロントエンドという。

:::

と、簡単に見える Salmon Stats 構築ですが、実はこのように三つの構成で成り立っていることがわかります。

主に Salmon Stats 関連で使われているツール、アプリは以下の三つですが、表にしたようにそれぞれ役割が異なります。

|                | Salmon Stats | Salmonia | Salmonia3 |
| :------------: | :----------: | :------: | :-------: |
|  データベース  |     Yes      |    No    |    Yes    |
|    サーバー    |     Yes      |    No    |    No     |
| フロントエンド |     Yes      |    No    |    Yes    |
|  クライアント  |      No      |   Yes    |    Yes    |

### Salmon Stats

送られてきたデータを保存するデータベースと、それらのデータから計算された統計などを表示するウェブサイトとしての機能を持ちます。

### Salmonia

PC で動作する Salmonia は Salmon Stats へデータを送信する機能とローカルにデータを保存する機能しか持ちません。

使ったことがある方はわかるかもしれませんが、黒い画面が表示されるだけの無機質なプログラムです。

### Salmonia3

Salmonia3 はサーバー以外の全機能を持ちます。データを保存することも、データを表示することも、Salmon Stats にデータを送信することもできます。

ただ、データベースは持つもののサーバーとしての機能がないのでアプリ内でしかデータベースは利用していません。

### New Salmon Stats

じゃあ New Salmon Stats はどんな機能を持つのかが気になりますよね？

|                | New Salmon Stats | Salmonia | Salmonia3 |
| :------------: | :--------------: | :------: | :-------: |
|  データベース  |       Yes        |    No    |    Yes    |
|    サーバー    |       Yes        |    No    |    No     |
| フロントエンド |        No        |    No    |    Yes    |
|  クライアント  |        No        |   Yes    |    Yes    |

こんな感じで旧 Salmon Stats からフロントエンドの機能がなくなったものになります。何故フロントエンドの機能を搭載しなかったかというと、単に手間だからです。

詳しく話すとプログラムの深い内容になるのですが、旧 Stats はデータベースとサーバー機能を持つ A とフロントエンドの機能を持つ B のハイブリッド式でした。

で、今回動作しなくなったのが A なので、B であるホームページ自体は閲覧できるもののデータが見れなくなってしまったというわけです。

そして、New Salmon Stats がフロントエンドの機能を持たないということは、ブラウザで手軽に閲覧できる（わかりやすく言えばホームページ）的な機能は一切持たないということです。

ブラウザでアクセスしても無機質な文字列が返ってくるだけです。

じゃあ何故フロントエンドを作らなかったかというと、本来、開発する上でバックエンドとフロントエンドは切り離されるべきだからです。そして、旧 Stats でもこれらは切り離されて開発され、それをハイブリッドにしたものがサービスとして運用されていました。

ここで旧 Stats の問題点はバックエンド側の仕様がドキュメントとして公開されなかったという点にあります。どんなデータが受け取れるのか、どんなデータが登録されているのかがひと目でわからなかったのでフロントエンド側として Salmon Stats を利用するしかありませんでした。

が、新 Stats ではどんなデータが受け取れるのかなどを全て公開しているので、そのドキュメントを読んで誰もがフロントエンドをつくることができます。

もっとかっこいい UI にしたいとか、デザインを自分で決めたいとか、そういうことが可能になるわけです。正直、ぼくはデザインや UI に関してはバックエンド以上に素人なので（それは Salmonia3 のデザインをみてもらえばわかると思いますが）、作りたい人がフロントエンドを作れば良いと思っています。

## 進捗状況

長々となりましたが、結局どのくらい進んでるんだということが気になる人はここから読んでください。

|                | New Salmon Stats | New Salmonia |
| :------------: | :--------------: | :----------: |
|  データベース  |       80%        |      -       |
|    サーバー    |       35%        |      -       |
| フロントエンド |        0%        |      -       |
|  クライアント  |        -         |     80%      |

Salmon Stats が変更になったので、Salmonia 側も当然変更になります。iOS 版の開発はちょっとめんどくさいのですが、Salmonia はただデータを取得して送るだけなので簡単に更新することができます。

これは土日で開発して無事更新することができました。

[ツール自体](https://github.com/tkgstrator/Salmonia/tree/develop)は表にもあるように八割ほど開発が完了しています。

最新のリザルト ID を取得して、アップロードすることができます。ただ、サーバー自体がまだ稼働していないので、ローカル環境で試すことになります。

これはちょっと難しいので、まだエンドユーザーが使える状況ではありません。しかしながら、サーバーが完成すれば一応すぐ使える状況にある、ということです。

ちなみに、旧 Stats では任天堂のサーバーがアップデートされるたびに Salmonia の更新が必要でしたが、New Salmonia ではこれを自動で更新するようにしました。

なのでかなり便利になったのではないかと思います。

### サーバー側の問題

となると最後はサーバー自体が完成すれば良いことになります。

で、こちらなのですが実は基本的な機能はある程度完成しています。

- リザルト登録
- リザルト取得

についてはほぼ完璧に動作します。唯一まだ完成していないのはアップロードされたリザルトのスケジュール ID を連携するところですが、やろうと思えば多分いつでもできます。

- スケジュールごとのリザルト取得
- ユーザごとのリザルト取得
- ランキング
- フィルタリング

などについてはまだ実装できていませんが、これはサーバーのコードを書き換えるだけなのでアップデート自体は比較的簡単です。

じゃあ何が問題なんだよ、となるわけですが......

### Docker で起動しない問題

New Salmon Stats は旧 Stats と同じように Docker という仕組みを使っています。この Docker が上手く動作していません。

ちなみに、Docker を使わなければ今すぐにでもサービスを動かすことはできます。でも、それじゃ意味がないわけなんですよね。

#### よくわかっていない点

NestJS + Prisma + PostgresSQL + Nginx という構成。Nginx 自体はプロクシサーバとしての機能しか持たない。

docker-compose up をしたときに、PostgresSQL が立ち上がってから NestJS を立ち上げてそのときに Prisma でデータベースのマイグレーションを行う必要がある。

PostgresSQL が立ち上がっていないと Prisma でアクセスできないのだが`depends_on`を使えば逐次立ち上げが可能らしいので、これで回避できそうな気はする。

で、Prisma でマイグレーションが失敗する原因なのだが Apple Silicon が原因ナノではないかという説がある。そうなるとローカル環境でテストするのが大変難しくなる。

なんとかしたいのだが、自分がよく理解できていない分野だけに時間がかかってしまうかもしれない。

## ハッシュサーバー

ログイン時に必要なハッシュを計算するサーバーがここ最近よく落ちていたので自前で用意しました。

SSL 非対応なのですが、一応動作します。AWS 上で動いているのですが、どうやれば一番簡単に SSL 対応できるかを考えています。

ちなみにハッシュサーバーは[ここ](http://api.splatnet2.com/documents)で動作確認ができます。たくさんアクセスしても現時点ではある程度対応できると思います（まあ連打は辞めてほしいですが）
