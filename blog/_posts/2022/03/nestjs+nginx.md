---
title: NestJS+Nginxで爆速APIを立てるチュートリアル
date: 2022-03-23
category: プログラミング
tags:
  - NestJS
  - Typescript
---

## API の立て方

自分専用の API が欲しいなと思ったとき、どうやって API を立てるべきだろうか。

いろいろやり方はあると思うのだが、自分は NodeJS を使って NestJS で API を立てることにした。厳密な型付けができる Typescript を勉強してみたかったのというのもあるし、Python などで API を書くのもなんか違う気がしたためだ。

なんとなくだが、Python は実務というか、機械学習させたり何らかを計算するために使うのが良いのであって、ずっと動きっぱなしの API に使うのは本来の目的ではないような気がした。

ちなみに参考文献は[NGINX with Docker and Node.js — a Beginner’s guide](https://ashwin9798.medium.com/nginx-with-docker-and-node-js-a-beginners-guide-434fe1216b6b)です。非常にわかりやすい。

ちなみに最終的に必要なものは以下の通り。

- docker
- yarn
- VSCode(あると良い)

以上。

環境に対する依存を 0 にするために（要するに誰が動かしても全く同じように動くようにするため）、環境構築には Docker を利用します。チームで開発するときなどは必須だと思います、はい。

[Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04-ja)向けと[macOS](https://docs.docker.jp/docker-for-mac/install.html)向けにドキュメントを置いておきます。この通りにやれば Docker の導入はおしまいです。

### NestJS

[NestJS](https://nestjs.com/)はとてもわかりやすいフレームワークで、TS 初学者のぼくでもチュートリアルを読めば簡単に API を立てることができた。

何より便利だと思ったのが Validation を定義できるところで、例えば配列の長さが一定以上のリクエスト、などは NesJS 側で拒否してエラーを返すことができるのだ。うーん、便利すぎる。

Validation については`class-validator`や`class-transformer`などのドキュメントを読めばわかるのでここでは割愛する。今回はどうやって音速で API を立てるかということだけを考える。

なお、めんどくさいので SSL 化については今回は考えない。let's encrypt を使えばなんとかなるでしょう、多分。

## NestJS の導入

まずはなんでもいいので適当なディレクトリを作成します。ディレクトリの中で以下のコマンドを実行します。

```
yarn global add @nestjs/cli
nest new api
```

するとなんかいろいろ作成されます。

あとは、

```
yarn
yarn start
```

とすれば`localhost:3000`で NestJS の API にアクセスできます。

ただ、これだと単純にローカルで NodeJS を動かしているだけなので、Docker コンテナ内で動作するようにします。なので Dockerfile というファイルを作成します。

```dockerfile
# Dockerfile
# pull the Node.js Docker image
FROM node:17-alpine3.14

# create the directory inside the container
WORKDIR /app

# copy the package.json files from local machine to the workdir in container
COPY package.json ./

# run npm install in our local machine
RUN yarn

# copy the generated modules and all other files to the container
COPY . .

RUN yarn build

# our app is running on port 5000 within the container, so need to expose it
EXPOSE 3000

# the command that starts our app
CMD ["yarn", "start:prod"]
```

これをこのままコピペで作成します。

```
.
└── app/
    ├── dist/
    ├── node_modules/
    ├── src/
    ├── .dockerignore
    ├── .eslintrc.js
    ├── .prettierrc
    ├── Dockerfile
    ├── nest-cli.json
    ├── package.json
    ├── tsconfig.build.json
    ├── tsconfig.json
    └── yarn.lock
```

するとディレクトリ構造は多分上のような感じになっています(dist はビルドしていなければ作成されませんが)。

これで NestJS 側の設定は終わりです。

### nginx の導入

ここまでやればわかると思うのですが、NestJS はポート 3000 しか開放していません。よって、ブラウザからアクセスしようとしたら`:3000`をつけなければいけないことになります。でもこれ、ちょっとめんどくさいですよね。無理やりポート 80 や 443 を利用することもできるのですが、このようなポート番号は利用できないようにされているので NodeJS 自体を root 権限で動かさないといけなくなります。

それはあまりよろしくないので、ポート 80 にアクセスされたら、内部的にポート 3000 にアクセスするようにプロクシを設定してあげます。

それが proxy_pass という仕組みで、これを利用するためだけに nginx を利用します。

といっても、こちらもすぐ終わります。

```
.
├── app/
│   ├── dist/
│   ├── node_modules/
│   ├── src/
│   ├── .dockerignore
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.build.json
│   ├── tsconfig.json
│   └── yarn.lock
└── nginx/
    ├── default.conf
    └── Dockerfile
```

nginx というディレクトリを作成し、中に`default.conf`と`Dockerfile`を作成します。

```nginx
server {
    listen 80;
    server_name  localhost;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location /api {
        proxy_pass http://app:3000/;
    }
}
```

こう書くことで`localhost/api`にアクセスすれば`localhost:3000`にアクセスされたように振る舞うことができます。

```dockerfile
# pull the nginx Docker image
FROM nginx:1.21.6

# copy the default.conf files from local machine to the nginx conf.d directory in container
COPY default.conf /etc/nginx/conf.d/default.conf
```

Dockerfile にはこのように書きます。イメージは nginx のバージョン 1.21.6 を利用していますが、ここは各自でバージョン指定してもらえばよいかと思います。`nginx:latest`としても基本は問題ないと思うのですが、こうしてしまうと常に最新のバージョンが使われてしまうので、互換性の問題などが発生する可能性があります。

## Dockerfile をまとめる

ここまででほとんどすべての作業は終わったのですが、このままだと二つの Dockerfile を手動で立ち上げなければいけません。

それはめんどくさいので Docker-compose という仕組みを使ってそれらをくっつけて一度に起動できるようにします。

`docker-compose.yml`というファイルを作成し、以下の内容を書き込みます。

`XXXXXXXXXX`, `YYYYYYYYYY`, `ZZZZZZZZZZ`には各自好きな値を入れて下さい（識別できれば何でも良いです）

```yml
version: "3.8"
services:
  app:
    container_name: XXXXXXXXXX
    build:
      context: ./app
    ports:
      - "5000:5000"
    networks:
      - ZZZZZZZZZZ
    tty: true
  nginx:
    container_name: YYYYYYYYYY
    restart: always
    build:
      context: ./nginx
    ports:
      - "80:80"
    networks:
      - ZZZZZZZZZZ
    depends_on:
      - app

networks:
  ZZZZZZZZZZ:
    external: true
```

最終的に以下のような構成になれば大丈夫です。

```
.
├── app/
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   ├── default.conf
│   └── Dockerfile
├── docker-compose.yml
└── .gitignore
```

多分、`.dockerignore`というファイルはないので、作成しておくと良いでしょう（自分でも意味がよくわかっていないが）

```
node_modules
npm-debug.log
```

ちなみに、`.gitignore`は以下のような感じです。

```
# compiled output
dist
node_modules

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
```

ここまでできれば`docker-compose up --build`で Dockerfile を起動することができ、`localhost/api`でアクセスすることができるようになります。

## やってみた感想

環境に依存しない構築は一度やってみたかったのですが、基本的にはチュートリアル通りに進めて上手く動作させることができました。

一部詰まったところがあったのですが[@ckoshien_tech](https://twitter.com/ckoshien_tech)さんがよしなにやってくれました、とても助かる。

NestJS を MySQL などと接続できるとそれっぽくなるのでオススメ。あとは dev 環境と prod 環境を切り替えられるような仕組みを作りたいと思いました。

記事は以上。
