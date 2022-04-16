---
title: Flutterでアプリを作成してみる
date: 2022-04-15
categoriy: プログラミング
tags:
  - Swift
  - iOS
  - Android
---

## プロジェクトの作成

最新の Flutter では iOS 向けはデフォルトで Swift, Android は Kotlin が指定されています。もし変更したい場合は`flutter create -i objc -a java project_name`のように直接指定しましょう。

### プロジェクトの編集

メインコードは lib にある`main.dart`です。これを変更すればアプリ自体が変わります。ホットリロードなので、変更点を保存すればすぐに確認できるのが良いですね。

ドキュメントは[公式のもの](https://docs.flutter.dev/)か[日本語ドキュメント](https://flutter.ctrnost.com/)が良いのではないかと思います。

ちらっと見た感じは Dart 自体は SwiftUI っぽさがあります。言語自体は Typescript に似ているそうなので学習コスト自体はそこまで高くないかもしれません。ラッパーではない独自のコンポーネントを持っているのも個人的には学習意欲が起きて良い感じです。
