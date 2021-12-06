---
title: SwiftUIでURLから画像を読み込む最適な方法を考える
date: 2021-12-06
categoriy: プログラミング
tags:
  - SwiftUI
  - Swift
---

## SwiftUI + Image

SwiftUI では Image を利用すると Bundle か SystemImage からしか画像を初期化することができない。

つまり、URL を指定して画像を読み込むことができないのである。それはそれで困るので、有志がいろいろとライブラリを開発しており、Salmonia3 実装時などにお世話になったりした。

ようやく SwiftUI3.0 では AsyncImage というコンポーネントが実装され、外部ライブラリなしでも画像を読み込むことができるようになった。

となれば、どの方法が最も優れているのかを調べたくなるわけです。

本記事では「メモリ消費量」「動作の快適性」「使いやすさ」の三つの観点からライブラリを評価することにしました。

### 検証方法

200 件の画像を読み込んで List に表示する。重複があるので、バカ正直に全部の URL にアクセスするかキャッシュを利用するかで大きく性能に違いがでそうな気はする。

サムネイルのような小さい画像と、生データの大きい画像の二つでパフォーマンスを評価した。

## 比較ライブラリ

GitHub である程度 Star を獲得しているライブラリを選択した。

### [URLImage](https://github.com/dmytro-anokhin/url-image)

```swift
URLImage(content.profileImageURL, content: { image in
    image
})
```

地味に宣言がめんどくさいので何度も使うならラッパーの構造体を作ったほうが良い。

設定できることは多くないが、シンプル故に使いやすいとも言える。

### [Kingfihser](https://github.com/onevcat/Kingfisher)

```swift
KFImage(content.profileImageURL)
```

シンプルかつ高機能。

### [AsyncImage](https://developer.apple.com/documentation/swiftui/asyncimage)

```swift
AsyncImage(url: url, content: { image in
    image
})
```

使い方は`URLImage`とほとんど同じ。

ただ、カスタマイズ性が皆無なのでライブラリをどうしても使いたくない方向けかも知れない。

### [CachedAsyncImage](https://github.com/lorenzofiamingo/SwiftUI-CachedAsyncImage)

```swift
CachedAsyncImage(url: content.profileImageURL)
```

公式の`AsyncImage`にキャッシュを効かせるようにしたもの。

何もしなくてもキャッシュが効いているが、結局は`AsyncImage`を単純にラップしているだけなので細かい設定はできない。

### [SDWebImageSwiftUI](https://github.com/SDWebImage/SDWebImageSwiftUI)

```swift
WebImage(url: content.profileImageURL)
```

APNG を表示できるということで利用したライブラリ。ドキュメントをすべて読めているわけではないのだが`Kingfisher`と同じくらい高機能。

## 結果

とりあえず`AsyncImage`をそのまま`ForEach`でループさせることは全く推奨できないということがわかりました。

### サムネイル

`AsyncImage`はリストをスクロールしているだけで CPU 使用率が 70%を超えることも珍しくなく、明らかに他のライブラリと比べて動作が緩慢でした。

|    ライブラリ     | 起動時 | 全件読み込み時 |
| :---------------: | :----: | :------------: |
|     URLImage      | 18.6MB |     26.5MB     |
|    Kingfisher     | 17.5MB |     21.0MB     |
|    AsyncImage     | 23.6MB |     34.5MB     |
| CachedAsyncImage  | 17.0MB |     27.1MB     |
| SDWebImageSwiftUI | 22.7MB |     22.9MB     |

### 生データ

大きい画像を読み込ませた場合は`URLImage`もかなり重くなりました。なのでこちらもあまり利用は推奨されないかも知れません。

|    ライブラリ     | 起動時 | 全件読み込み時 |
| :---------------: | :----: | :------------: |
|     URLImage      | 40.2MB |    134.5MB     |
|    Kingfisher     | 25.9MB |     52.9MB     |
|    AsyncImage     | 31.2MB |    103.1MB     |
| CachedAsyncImage  | 28.6MB |    132.7MB     |
| SDWebImageSwiftUI | 28.3MB |     29.2MB     |

驚くべきは`SDWebImageSwiftUI`のメモリ消費量の低さでした。どれだけ読み込んでも全く変化しないので、List で範囲外になった場合にメモリを開放するような仕組みが働いているとしか思えないです。

`Kingfisher`の性能も十分すごいのだが`SDWebImageSwiftUI`の前では正直見劣りしてしまいますね。これで APNG にも対応しているというのだから、SwiftUI のアプリ開発者は何も考えずに`SDWebImageSwiftUI`を使うべきかと思います。

## まとめ

ライブラリをどうしても使いたくない、または ForEach で利用する予定がないというのであれば`AsyncImage`をそのまま使っても問題ない。

::: tip 自作ライブラリ

[How to display Image from a url in SwiftUI](https://stackoverflow.com/questions/60677622/how-to-display-image-from-a-url-in-swiftui)を参考に自作ライブラリを作っても良いかも知れない。車輪の再発明になるかもしれないが。

:::

ライブラリの利用に制限がないのであれば`KingFisher`か`SDWebImageSwiftUI`を選んでおけば間違いがない。
