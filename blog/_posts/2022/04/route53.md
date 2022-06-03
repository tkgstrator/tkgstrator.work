---
title: Route53+Docker+CertbotでSSL対応したい
date: 2022-04-04
category: プログラミング
tags:
  - AWS
---

## HP の SSL 対応

さて、うちの LanPlay のサーバなどは AWS で稼働しているのだが、LanPlay は通常 11451 ポートを使っているので、サーバの情報を見たいときに`http://52.194.225.81:11451/info`のようにアクセスしなければならず、なんとなく気分がよろしくない。

どうせなら、HTTPS でポート番号を気にすることなくアクセスしたいのである。

が、443 ポートなどの若い番号のポートは簡単にソフト側から利用することができない。443 は基本的に HTTPS として使う、ということが決められているからだ。なのでソフトから 443 ポートを使うことを明示することはできない。

ではどうするかというと、nginx をリバースプロキシとして動作させるのである。

これについては以前に書いた記事が多分参考になるので、参考にしていただきたい。

で、結局何がしたいのかというと、EC2 インスタンスを踏み台にして RDS のデータベースにアクセスしてデータを返す API と、LanPlay の API を立てたいわけである。

### 求められる仕様

- salmonrun.splatnet2.com
  - Salmonia3 で利用する API
- lanplay.splatnet2.com
  - LanPlay で利用する API
    というふうな感じである。

`splatnet2.com`というドメインは悪名高きお名前ドットコムで取得しておき、管理を Route53 でしている感じである。で、`splatnet2.com`というホストゾーンに対して`lanplay.splatnet2.com`と`salmonrun.splatnet2.com`を立てていくというイメージ。

とここまで書いてもよくわからないと思うので図解してみました。

![](https://pbs.twimg.com/media/FPdY007VsAgbvIR?format=png&name=large)

要するにどちらの API を叩いてもはどちらも同一の EC2 インスタンスで動いている Docker コンテナの nginx で受け取り、それをリバースプロクシして裏で動いている NodeJS(NestJS)と SwitchLanPlay の Docker コンテナで処理するという感じです。

NodeJS は更に裏で RDS と連携していますが、RDS と EC2 はセキュリティポリシーを設定することで共通の VPC 以外からはアクセスできないようにできます。よって、RDS 自体は単純なパスワード認証しか持たないにも関わらず、EC2 を経由してしかアクセスすることができないため EC2 の秘密鍵が洩れない限りは RDS は安全ということになります。

::: tip セキュリティポリシー

ちなみに現在は自宅の IP からでもアクセス可能にしているが、将来的にはこちらも閉じる予定です。

:::

よりセキュリティが求められる環境ではこれでも不十分だが、うちの RDS はパスワードなどの保護されるべき個人データは一切持たないため（せいぜいユーザの固有 ID 程度で、これは誰でも閲覧できる）、この程度のセキュリティで十分であろうとの判断をした。

そして、nginx, NodeJS,SwitchLanPlay のすべてが Docker コンテナで動作しているので環境依存とは無縁である。

## Route53 + お名前.com

毎回設定方法を忘れてしまうので、参考にした記事を載せておきます。

[Route53 を使用して EC2 にドメイン名を紐づける](https://qiita.com/yuichi1992_west/items/e842d8ee50c4afd88775)

大変参考になるのでしっかりと読むように。

## Docker Image

この中で一番用意するのがめんどくさいのが LanPlay の Docker なのだが、最新版である[Switch-Lan-Play の Rust 版](https://github.com/spacemeowx2/slp-server-rust)を[Docker コンテナにしたもの](https://hub.docker.com/repository/docker/tkgling/switch-lan-play-rust)を配布しているのでそれを利用してもらうのが楽で早い。

もしも Docker が実行できる環境であれば、

`docker run -d -p 11451:11451/udp -p 11451:11451/tcp tkgling/switch-lan-play-rust`

のコマンド一発で LanPlay のサーバを立てることができる。

::: tip ポート開放について

AWS を利用している場合はセキュリティポリシーで UDP と TCP の 11451 をポートフォワードするようにしておくこと（でないと通信できない）

:::

で、このままだと単に Docker イメージを実行しているだけなので、docker-compose で利用できるようにする。

ディレクトリ構成は以下のような感じで、app 内で NodeJS を動かすイメージである。nginx と lanplay については流石にわかると思うので割愛。

```
.
├── app/
│   └── Dockerfile
├── nginx/
│   └── Dockerfile
├── lanplay/
│   └── Dockerfile
└── docker-compose.yml
```

## Dockerfile

### app

```dockerfile
FROM node:17-alpine3.14
WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .
RUN yarn build
EXPOSE 5000
CMD ["yarn", "start:prod"]
```

`package.json`をコピーして環境構築をした後に`yarn build`でビルドしたものを実行するという感じ。

特に難しいこともなく、わかりやすい手順だと思われる。NodeJS でどんなコードを書くのかはおいといて前回も紹介した[NGINX with Docker and Node.js — a Beginner’s guide](https://ashwin9798.medium.com/nginx-with-docker-and-node-js-a-beginners-guide-434fe1216b6b)が非常にわかりやすいと思うので熟読しておくこと。

### lanplay

```dockerfile
FROM tkgling/switch-lan-play-rust:latest
```

公開されている Docker イメージをそのまま利用するだけ。

### nginx

```dockerfile
FROM nginx:1.21.6
COPY default.conf /etc/nginx/conf.d/default.conf
```

こちらは`default.conf`をコピーして独自の設定を反映できるようにする。

`default.conf`には以下のような内容を記述しておく。まだ Let's Encrypt による SSL 化ができていないのと、ローカル環境での開発なので`server_name`には`localhost`を割り当てている。

そのためサーバが区別できないので一時的に app 側にはポート 3000 を割り当てているが、最終的にはどちらも 443 でアクセスできるようにする。

```
server {
    listen 80;
    server_name  localhost;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
        proxy_pass http://lanplay:11451/;
    }
}

server {
    listen 3000;
    server_name  localhost;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
        proxy_pass http://app:5000;
    }
}
```

さて、ここまで書いた段階で SSL 化以外のすべての手順は終了した。

## SSL 化しよう

SSL 化には Let's Encrypt を使うのはもはや当たり前だと思われるのだが、その手順がいろいろとめんどくさいので備忘録としてまとめておく。

### HTTP-01

あるドメインに認証用のファイルを生成し、そのファイルにアクセスすることで認証を行う。ファイルにアクセスする、という仕様上、予めそのサーバは HTTP でアクセス可能になっていなければならない。

しかも、その段階では SSL 証明書がないため、

1. HTTP だけでサーバ起動
2. 証明書取得
3. SSL 化
4. HTTPS としてサーバ起動

のような手順が発生する。これは少々めんどくさい。

### DNS-01

DNS サーバに TXT レコードをセットして認証する方法。これならば予め HTTP サーバを建てる必要がなくて楽。

ただし、証明書更新のたびに TXT レコードを切り替える必要があるため、TXT レコードをスクリプトで自動で設定できる仕組みがない場合はこの方式を利用するメリットは 0 である。

## dns-route53

そこで利用したいのが dns-route53 という認証方式。これ自体は特別な認証方式ではなく、DNS-01 を Route53 上で扱いやすくしたライブラリというイメージ。

具体的には Route53 への権限を付与したアクセスキーを設定したコンフィグファイルを読み込ませることにより、自動的に TXT レコードを書き換えつつ certbot で証明書を更新する仕組みを提供している。

### Route53 + certbot

で、ここの使い方がよくわからないまま記事を書いています。

Ubuntu ではなく AmazonLinux で認証するための方法は[AmazonLinux+Route53 で LetsEncrypt の DNS-01 認証する](https://qiita.com/tektoh/items/1973cf28e2a52abbb2ae)の記事で書かれているので、これを参考にしつつ書いていきます。
