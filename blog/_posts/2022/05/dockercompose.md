---
title: Docker+Prisma+PostgresSQL+NestJS
date: 2022-05-18
categoriy: プログラミング
tags:
  - Typescript
  - NestJS
  - Prisma
  - Docker
---

## タイトルについて

今回構築した環境は以下の通り。

- Docker を使って動作する
- NestJS で API を書く
- Prisma でデータベースに接続する
- PostgresSQL にデータを書き込む

更にこれに加えて、

- nginx のリバースプロキシを利用してサイトを公開する

というのも付け加えておく。

さて、この要件を満たすためにどのような実装をしたら良いだろうか。

### 実装

まずはディレクトリ構成について。\