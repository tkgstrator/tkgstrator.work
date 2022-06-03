---
title: Netlifyに代えてFirebase hostingを利用してみる
date: 2021-12-01
category: プログラミング
tags:
  - Firebase
  - GitHub
  - Netlify
---

# Netlify と Firebase hosting の違い

比較には[このサイト](https://bejamas.io/compare/netlify-vs-firebase/)を参考にしました。

## 主な違い

- [Firebase の公式ドキュメント](https://firebase.google.com/pricing/)
- [Netlify の公式ドキュメント](https://www.netlify.com/pricing/)

|          機能          |       Netlify        |          Firebase           |
| :--------------------: | :------------------: | :-------------------------: |
|    継続的なデプロイ    |          可          |            不可             |
|  Git からの自動ビルド  |          可          | 追加の CI/CD サービスが必要 |
| 毎プッシュのプレビュー |          可          |            不可             |
|          通知          |         あり         |            なし             |
|     パスワード保護     | 有料プランに含まれる |            なし             |

## 無料プランでの違い

ざっくり調べたところ、以下のような違いがある模様。

|              機能              |  Netlify  |      Firebase      |
| :----------------------------: | :-------: | :----------------: |
|           ビルド時間           | 300 分/月 |         -          |
|           同時ビルド           |     1     |         -          |
|             転送量             | 100GB/月  | 360MB/日=10.8GB/月 |
|         チームメンバー         |     1     |      制限なし      |
|  1 デプロイあたりのビルド時間  |   30 分   |         -          |
| 1 デプロイあたりのメモリ使用量 |  2048MB   |         -          |

Netlify はサービス自体にビルド機能があるが、Firebase にはないので GitHub Actions などを利用して Deploy する必要があるみたいです。

あとは、Netlify が 100GB まで無料で使えるのに対して、Firebase はその 1/10 の 10.8GB までしか一ヶ月で転送することができません。

調べてみたところ現状の Netlify で 13 のウェブサイトを運営して毎月 10GB くらいの転送量があるっぽいです。ほとんどがブログだとおもうので単に Firebase に移行すると容量がカツカツかもしれません。

## 疑問点

Netlify から Firebase に移行する際にネームサーバがよくわからなくて、結局詰まったままなんですがレコードを追加したら何故かアクセスできるようになりました。

![](https://pbs.twimg.com/media/FFgbwnAVQAI0dAo?format=jpg&name=large)

ただ、設定項目を見ると保留中のままになっていて自分でもなんで繋がっているのかよくわからない状況です。

一応、ちゃんと Firebase の Hosting サーバには繋がっているっぽいのですが（ダウンロード量が増えているので）、いつ切断されてもおかしくないのでビクビクしてます。

めんどくさいからそのうち Google Domains で新しくドメインを取り直すかもしれません。

記事は以上。
