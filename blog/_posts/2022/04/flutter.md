---
title: Flutterでクロスコンパイル
date: 2022-04-16
category: プログラミング
tags:
  - Swift
  - iOS
  - Android
---

## Flutter

[Flutter](https://flutter.dev/)は iOS と Android 向けアプリを同時に開発できるモバイル向けフレームワークです。実はウェブ向けも同時に作れたりします。

## Get started

必要なもの

- [Flutter SDK](https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_2.10.4-stable.zip)
- Xcode
- VSCode
- [Android Studio](https://redirector.gvt1.com/edgedl/android/studio/install/2021.1.1.23/android-studio-2021.1.1.23-mac_arm.dmg)

Intel CPU を使っている方は[こちら](https://redirector.gvt1.com/edgedl/android/studio/install/2021.1.1.23/android-studio-2021.1.1.23-mac.dmg)

### Install

[Install](https://docs.flutter.dev/get-started/install)はここの手順通りに行います。自分は何も読まずに Flutter SDK をそのまま使ったのですが、Git を使う方法もアリだと思います。

```
export PATH="$PATH:`pwd`/flutter/bin"
```

ドキュメントにはこう書かれているのですが、自分は DevkitPro と同じように`/opt`に flutter 自体を移動させたので、

```
export PATH="$PATH:/opt/flutter/bin"
```

というふうに設定しました。ぶっちゃけ、パスが通っていればどこでも良いと思います。

```
flutter doctor
```

とすればチェックが走って、足りないコンポーネントなどを教えてくれます。

![](https://pbs.twimg.com/media/FQbvJi7VsAMEyfP?format=jpg&name=large)

### Android SDK

Android toolchain と Android Studio がちょっとハマるかもしれないので、備忘録として残しておきます。

![](https://pbs.twimg.com/media/FQc1D1lVQAE00QP?format=jpg&name=4096x4096)

ここからチェックを入れてインストールする必要があります。

![](https://pbs.twimg.com/media/FQc0vG8VsAcnWkL?format=jpg&name=4096x4096)

ここで Dart や Elutter をインストールしておけという記事も見かけたのですが、インストールしても全然反映されませんでした（なぜ）

## プロジェクトの作成

サンプルプロジェクトを起動するだけなら以下のコマンドでできます。

```
flutter create hello_world
cd hello_world
flutter run
```

![](https://pbs.twimg.com/media/FQcTWf-UcAED0HS?format=jpg&name=large)

すると macOS 向けにアプリがビルドされて立ち上がります。

```
open -a Simulator
```

で iOS Simulator が立ち上がるので、その後`flutter run`とすれば iOS Simulator でもテストができます。

![](https://pbs.twimg.com/media/FQc2UDUVQAEsrzJ?format=jpg&name=large)

ところで、Android デバイス持ってないんですけどどうやって Android のテストしたらいいんでしょう（わからない

記事は以上。
