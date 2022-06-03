---
title: SwaggerでSatic HTMLを作成する
date: 2022-04-12
category: 話題
tags:
  - 話題
---

## [NestJS](https://docs.nestjs.com/)

NestJS+Swagger で API ドキュメントを書いたとして、それを公開するには NodeJS が動くサーバが必要になります。

でも NodeJS はバックエンドなので GitHub Pages とか Netlify で公開ができないわけです。なので、一度 static html として変換してしまえばよいわけです。

API ドキュメントをつくるだけならいろいろ方法はあるのですが、NestJS を経由すればドキュメントと実装の差異がなくなるので、メンテナンスが楽になるので自分は採用しています。

### [Swagger](https://swagger.io/)

NestJS と Swagger の導入は済んでいるものとします。

個人的には`class-validator`や`class-transformer`も必須だと思っているので、これらも導入しておきましょう。

別に Swagger 自体は必須ではないと思うのですが、便利だったのでなんとなく導入しました。

### main.ts

Swagger の GitHub でコードが載っていたのでそれをそのまま利用します。

> https://github.com/nestjs/swagger/issues/110

`ValidationPipe`は実装済みですが、不要であれば外してしまっても構いません。

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as path from "path";
import { writeFileSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const options = new DocumentBuilder().setTitle("Documents").build();
  const documents = SwaggerModule.createDocument(app, options);
  const outputPath = path.resolve(process.cwd(), "swagger.json");
  writeFileSync(outputPath, JSON.stringify(documents), { encoding: "utf8" });
  SwaggerModule.setup("documents", app, documents);
  await app.listen(3000);
}
bootstrap();
```

こうすると NestJS が更新されるたびにディレクトリに`swagger.json`が自動で生成されます。この JSON は Open API のフォーマットに対応しているみたいなので、Swagger 以外にも Redoc などでも変換できます。

ちなみに NestJS をホットリロードできる状態で起動するには`yarn start --watch`または`yarn start:dev`が必要になります。

### Redoc-cli

yarn を利用している前提で話を進めます。

```
yarn add redoc
yarn add redoc-cli
```

インストールができたら、ビルドしてみます。`bundle`は`deprecated`になっているので`build`を使えとのこと。

```
npx redoc-cli build swagger.json -o index.html
```

とすれば出力できます。ちなみに直接`redoc-cli`とやるとコマンドがないと言われました。

#### 複数ファイルに実行

[redoc-cli を使って Open API json ファイルから整形された html を生成](https://tech.takarocks.com/2020/05/18/generate-html-from-swagger-json-by-redoc-cli/)

にはこう書いてあるけれど、試していないのでわからない。まあなんとかなるでしょう。

```
for file in */swagger.json;do redoc-cli bundle -o ${file%swagger.json}index.html $file;done
```

## メモ

なにかに使えるかもしれない備忘録

> Swagger のアレコレ
> https://cream-worker.blog.jp/archives/1076313317.html

> swagger-merger + ReDoc + Docker で API ドキュメントを作る
> https://qiita.com/masakurapa/items/447b2f1236bc87226cac#swagger-merger
