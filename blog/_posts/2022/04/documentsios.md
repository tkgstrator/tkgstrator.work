---
title: iOSアプリでZipをダウンロードしてプログラム内で利用する
date: 2022-04-13
category: プログラミング
tags:
  - iOS
  - Swift
  - SwiftUI
---

## 背景

iOS アプリ内で例えば画像を利用したい場合は、Assets にファイルを格納してリリースするのが一般だと思われる。

しかし、この方法ではアプリのアップデートなしに Assets を更新することができない。

また、ライセンス上の問題で Assets として同梱できないような場合にも問題が発生する。これを回避するために、インターネットを利用して Assets を取得し、それをアプリ内で利用するような場合を考える。

### 必要な案件

- Assets.zip をダウンロード
  - [Alamofire](https://github.com/Alamofire/Alamofire)を利用
- Assets.zip を Documents に展開
  - [SSZipArchive](https://github.com/ZipArchive/ZipArchive)を利用
- 展開された APNG, PNG を Swift で読み込み
  - 頑張る

## コード

```swift
import SwiftUI
import Alamofire
import Combine
import ZipArchive

struct ContentView: View {
    @State private var cancellable: AnyCancellable?

    var body: some View {
        Button(action: {
            downloadSticker()
        }, label: {
            Text("Download")
        })
    }

    func downloadSticker() {
        let filename = "6701"
        // ドキュメントまでのURL
        let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        // ファイルまでのURL
        let filepath = documentDirectory.appendingPathComponent(filename)

        let url: URL = URL(string: "https://stickershop.line-scdn.net/stickershop/v1/product/\(filename)/iphone/stickers@2x.zip")!
        cancellable = AF.request(url)
            .publishData()
            .value()
            .sink(receiveCompletion: { completion in
                print(completion)
            }, receiveValue: { response in
                // 保存ファイルの拡張子設定
                let destiantion = filepath.appendingPathExtension("zip")
                // データ書き込み
                try? response.write(to: filepath, options: .noFileProtection)
                // チェック
                let isSuccess = SSZipArchive.unzipFile(atPath: destiantion.path, toDestination: filepath.path, delegate: nil)
            })
    }
}
```

`unzipFile`は成功したかどうかを返すので本来はここでしっかり条件分岐しないといけないのですが、今回は簡単なデモアプリなので省略しました。

![](https://pbs.twimg.com/media/FQMI90oaUAIy2di?format=jpg&name=4096x4096)

ディレクトリを確認すると、ちゃんとファイルができていると思います。

あとはこのディレクトリにあるファイルを読み込むだけですね。

### ファイル読み込み

ドキュメントディレクトリ以下のファイルは以下のコードでアクセスできます。

`productId`にはダウンロードした Sticker の ID を指定します。

```swift
FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("\(productId)")
```

APNG 表示は`Image`や`AsyncImage`ではできないので、[`SDWebImageSwiftUI`](https://github.com/SDWebImage/SDWebImageSwiftUI)を利用します。

で、この辺は解説してもしょうがないので完成品を見てもらったほうが早いかな、という気がします。

## 完成品

完成したものが[LineStickersKit](https://github.com/tkgstrator/LineStickersKit)です。

```swift
LineSticker(productId: 6701, bundleId: 11921510, withAnimation: true)
```

とすれば Sticker が表示されます。

### ライセンスについて

Sticker をダウンロードして表示する形式で、Assets として組み込んでいないので権利関係は多分大丈夫。

合法的なリソースなのかという問題がありますが、合法です。何故なら、LINE の Sticker は送られた側に Sticker を表示するためにリソースが誰でもアクセスできる状態になっているからです。

買った人しかアクセスできないのなら、買ってない人に Sticker を送りつけても無が表示されてしまうわけですよね。

よって、Sticker のデータ自体は誰もがアクセスできる必要があります。

誰でもアクセスできるデータを取得して表示しているだけなので問題がなかろうという認識なのですが、何かしらの問題があれば公開を停止するかもしれません。

記事は以上。
