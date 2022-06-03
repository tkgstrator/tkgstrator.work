---
title: SwiftPackageManagerに複数のライブラリを同梱する
date: 2022-02-07
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## SwiftPackageManage

SwiftPackageManager(以下 SPM)の仕様はわからないところが多い。というのも、ドキュメントを見てもよくわからないからだ。

例えば、ライブラリによっては取り込んだときに複数のモジュールが同梱されている場合がある。アレはどのように実装されているのか考えてみよう。

### Package.swift

例えば、CocoaLumberjack というログライブラリを見てみる。

### Products

```swift
products: [
    // Products define the executables and libraries produced by a package, and make them visible to other packages.
    .library(
        name: "CocoaLumberjack",
        targets: ["CocoaLumberjack"]),
    .library(
        name: "CocoaLumberjackSwift",
        targets: ["CocoaLumberjackSwift"]),
    .library(
        name: "CocoaLumberjackSwiftLogBackend",
        targets: ["CocoaLumberjackSwiftLogBackend"]),
],
```

するとこんな感じで一つの Package.swift の中に三つのライブラリが同梱されていることがわかる。よって、この Package.swift を Xcode で読み込むと三つの選択肢が表示されて、どれを組み込むかを選ぶことができるわけである。

### Dependencies

```swift
dependencies: [
    .package(url: "https://github.com/apple/swift-log.git", from: "1.4.0"),
],
```

その下には`dependencies`を記述する。ここに書かれるのは各プロダクトが利用する依存関係である。

例えば、A というプロダクトが AA というパッケージに依存し、B というプロダクトが BB というパッケージに依存するなら、ここには AA と BB の両方のパッケージの参照先を書かなければいけない。

### Targets

最後にそれぞれのプロダクトで利用する依存関係や、ディレクトリの位置などを記述する。何もしなければ Target 名のディレクトリが使われるので、変えたい場合はここに書いておくこと。

```swift
targets: [
    .target(name: "CocoaLumberjack",
            exclude: ["Supporting Files"]),
    .target(name: "CocoaLumberjackSwiftSupport",
            dependencies: ["CocoaLumberjack"]),
    .target(name: "CocoaLumberjackSwift",
            dependencies: ["CocoaLumberjack", "CocoaLumberjackSwiftSupport"],
            exclude: ["Supporting Files"]),
```

## ライブラリの作成

単純に一つのパッケージの中にライブラリをそのまま突っ込むだけでは芸がないので、実際に自分の使い勝手が良いように変更してみた。

要件としては、

- ある共通ライブラリ`Common`がある
- `Common`は`Alamofire`に依存する
- それを利用する`Twitter`と`Nintendo`というライブラリがある
- `Common`だけで利用することはないので、公開するのは`Twitter`と`Nintendo`だけにしたい
- `Common`のコードもパッケージ内から読み込みたい

というような状況である。

### Package.swift

これを満たすように`Package.swift`を考えてみた結果、以下のような書き方でなんとかなる気がしてきました。

ちなみに、各パラメータの意味なのですが、

- .library
  - name > SPM でパッケージを追加したときに表示されるライブラリ名
  - targets > そのライブラリが使用するモジュール名(.target から指定)
- .target
  - name > モジュール名(`import XXXXXX`として利用される)
  - dependencies > 依存関係(他の.target > name を指定しても良い)

```swift
// swift-tools-version:5.5
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "OAuthClient",
    platforms: [.iOS(.v14)],
    products: [
        // Products define the executables and libraries a package produces, and make them visible to other packages.
        .library(
            name: "Twitter",
            targets: ["Twitter", "Common"]),
        .library(
            name: "Nintendo",
            targets: ["Nintendo", "Common"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        // .package(url: /* package url */, from: "1.0.0"),
        .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.5.0"))
    ],
    targets: [
        // Targets are the basic building blocks of a package. A target can define a module or a test suite.
        // Targets can depend on other targets in this package, and on products in packages this package depends on.
        .target(
            name: "Nintendo",
            dependencies: []),
        .target(
            name: "Common",
            dependencies: ["Alamofire"]),
        .target(
            name: "Twitter",
            dependencies: []),
        .testTarget(
            name: "OAuthClientTests",
            dependencies: ["Nintendo", "Twitter"]),
    ]
)
```

```
Package.swift
Sources
├── Common
│ └── Common.swift
├── Nintendo
│ └── Nintendo.swift
└── Twitter
└── Twitter.swift
Tests
```

大雑把にディレクトリ構成を書くとこんな感じになる。特にソースコードのパスを指定しないのであれば、`Target`名がそのままディレクトリ名になります。
