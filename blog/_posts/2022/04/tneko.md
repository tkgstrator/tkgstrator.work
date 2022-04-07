---
title: NestJSでクロネコヤマトの追跡APIを作成する
date: 2022-04-04
categoriy: プログラミング
tags:
  - NestJS
  - Typescript
---

## クロネコヤマトの API

クロネコヤマトには[荷物お問い合わせシステム](https://toi.kuronekoyamato.co.jp/cgi-bin/tneko)なるものがあります。中身を覗いてみたところ、自身に対して POST リクエストをすることで荷物情報を取得して、そのデータを表示している感じでした。

### 仕様

- URL: `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko`
- Method: `POST`
- RequestHeader: `Content-Type: application/x-www-form-urlencoded`

となり、RequestBody には Postman だと例えば

```
number01:0000-0000-0000
backrequest:get
category:1
```

というキーと値を割り当ててやればよいです。追跡は一度に 10 件までできるので`number01`から`number10`まで利用可能です。

この仕様でリクエストを送ると、何故かレスポンスを HTML で受け取ります。

何故 HTML が返ってくるのかは謎です。JSON にしたほうが明らかにデータ通信量が軽いはずですよね。これが API と呼べるのかは非常に微妙なので、もっと良い API を考えます。

## クロネコ API を考える

まず、リクエストは JSON で受け付けるようにします。`x-www-form-urlencoded`とかってどこに使いみちあるのかよくわかりません。

普通に`application/json`で良い気がします。`number01`とかいうキー名もダサいので、`tracking_id`というキー名で配列で受け取れるようにします。ハイフンは不要なので`number`で受け取るのが良いかと思いますね。

で、レスポンスなんですが具体的にどんな情報が見れるのかがわかっていないので何を返せば良いかがわかりません。HTML でレスポンスが返ってきている以上、スクレイピングするしかないとは思うのですが、お届予定日時と商品名くらいを返せばいい感じでしょうか。

## NestJS

NestJS や TS は初学者なのですが、ドキュメントを参考に頑張って書いていこうと思います。

### CLI のインストール

yarn を使う前提なので yarn のコマンドのみ載せます。

```
yarn global add @nestjs/cli
```

### プロジェクトの作成

プロジェクト名を決めて作成します。今回は`tneko-tracking-api`にしました。

```
nest new tneko-tracking-api
```

コマンド実行後に yarn か npm のどちらを使うかきかれるのでとりあえず yarn にしましょう。

### ファイルの作成

```
nest g module api/tracking
nest g service api/tracking
nest g controller api/tracking
nest g interface api/tracking
```

という感じでまずは必要なファイルを作成します。コマンドが自動でやってくれるので楽です。

```
.
└── src/
    └── api/
        ├── tracking/
        │   ├── tracking.controller.spec.ts
        │   ├── tracking.controller.ts
        │   ├── tracking.module.ts
        │   ├── tracking.service.spec.ts
        │   └── tracking.service.ts
        ├── app.controller.spec.ts
        ├── app.controller.ts
        ├── app.module.ts
        ├── app.service.ts
        ├── main.ts
        └── tracking.interface.ts
```

あとはこれにゴリゴリコードを実装していきます。

## Swagger

Swagger を使えば API ドキュメントが一瞬で作れます。

大きなメリットとしては実装がそのままドキュメントになるので、実装とドキュメントの差異がなくなるということがあります。要するに、実装が間違っていたらドキュメントも間違えているし、実装が正しければドキュメントも正しくなります。

つまり、整合性をチェックする手間が省けます。うーん、これは便利ですね。

ちなみに、導入にあたっては[NestJS の @nestjs/swagger でコントローラーから Open API(Swagger) の定義書を生成する](https://qiita.com/odanado/items/60456ab3388f834dc9ca)の記事を参考にさせていただきました。

例えば今回作成した API のドキュメントは次のリンクで見ることができて、実際に API を叩いてみることができます。

`https://tneko-tracking-api.herokuapp.com/api/`

### Heroku

[The Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)を読んで CLI を導入して連携するだけです。NodeJS のアプリのルートフォルダに紐付けないとデプロイするときにちょっとややこしくなります。

NestJS のアプリをそのままデプロイすると 503 エラーがでるので[Deploy NestJS typescript app to Heroku (Solved: 503 Error)](https://dev.to/rosyshrestha/deploy-nestjs-typescript-app-to-heroku-27e)を参考に対応しました。なんでこれで解決するのかよくわかっていないのですが、まあ多分 Netlify でエラーが直接ルーティングしたときにエラーが出る問題と似たような感じなのだと思います。

ちなみに API 自体は Heroku で公開することにしました。独自ドメインを指定するにはもうワンステップ必要なのですが、デフォルトで SSL 対応していてクレジットカード情報を登録するだけで一ヶ月あたり 1000 時間の無料枠が使えるのはなかなかに便利だと思います。

不便な点といえばリージョンが日本が利用できないので API のレスポンスがどうしても遅くなります。今回作ったクロネコヤマトの API だとリクエストを送ってから返ってくるまでにインスタンスが起動した状態で 1.5 秒くらいかかります。

無料枠だと 30 分放置するとインスタンスを再起動する必要があるのでこれよりもさらに遅くなります。まあでも今回作ったものはそんなにシビアなレイテンシが要求されるものではないので、無料でこのレベルが使えるのであれば特に不満はありません。

問題なのは有料枠を使っても日本リージョンが選べないということなんですよね......（商用のプライベートなものを使うしかない模様

## 利用方法

エンドポイントはたった一つしかないので困ることはないと思うのですが、`https://tneko-tracking-api.herokuapp.com/api/tracking`に対して追跡 ID を含む POST リクエストを送ればデータが返ってきます。

公式 API と違ってまともなレスポンスが返ってくるので使い勝手は良いのではないかと思います。

商用利用として使う人がいるとは思わないのですが、商用利用以外であれば自由に使っていただいて結構です。

```json
{
  "results": [
    {
      "tracking_id": 000000000000,
      "product_name": "-",
      "estimate_arrival_date": "-",
      "details": [
        {
          "title": "海外荷物受付",
          "arrival_date": "03月28日 21:45",
          "branch_name": "上海支店（中国）"
        }
      ]
    }
  ]
}
```

なお、ソースコード全体は[GitHub](https://github.com/tkgstrator/TNeko-Trakcing-API)で公開しています。Docker が実行できる環境であれば`docker-compose up`で一瞬でローカルサーバを立てることができます。

::: warning エラー判定

入力のバリデーションがへんてこなので直したいなと思っていたりします。

:::

これでいつでも Mac studio の現在地を知ることができますね（血の涙

Discord か Twitter や Slack などに通知を投げる仕組みも作ってみよう思います。記事は以上。
