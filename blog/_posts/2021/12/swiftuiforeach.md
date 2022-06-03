---
title: 迂闊にSwiftUIでForEachをまわしてはいけない
date: 2021-12-16
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## SwiftUI + ForEach

`ForEach`を SwiftUI で使うと再帰的に View を構築できるので非常に便利で、特に List や Form などでは SwiftUI の子コンポーネントは 10 個までという制限を無視していくらでもコンポーネントを追加することができる。

ScrollView だと View を一度にレンダリングしてしまうので、めちゃくちゃ大きい配列を`ForEach`するとメモリをバカみたいに消費してしまうのだが、`List`や`Form`では基本的に画面に表示されている View しかメモリを消費しないので非常に軽い。

::: tip メモリ消費

`List`や`Form`は子コンポーネントが非表示になると自動的にメモリが開放される、賢い。

:::

基本的に、と書いたのはコーディングによっては強参照の状態になってしまいいつまでもメモリが開放されず、循環参照のような状態になってアプリ自体がクラッシュしてしまう。

どのようなコーディングをするとダメなのかを考えてみよう。

### インデックス vs オブジェクト

```swift
// オブジェクトの定義
struct Tweet: Codable, Identifiable {
    let text: String
    // 中略
    let idStr: String
    let createdAt: String
}
```

こんな感じの`Tweet`構造体を作成し、それを 200 件表示することを考えよう。このとき、`let tweets = [Tweet]`のような変数をループしたときに、メモリ消費がどのように変わるのかを観察する。

```swift
// Object
ForEach(tweets) { tweet in
    TweetView(tweet: tweet)
}

// Index
ForEach(tweets.indices) { index in
    TweetView(tweet: tweets[index])
}
```

今回はオブジェクト自体をループするものと、インデックスでループするものの二種類を考えた。オブジェクトを回すと都度コピーが作成されて重そうな気がするのだが、どうだろうか。

|    ループ    | 起動時 | 全件読み込み時 |
| :----------: | :----: | :------------: |
| インデックス | 40.6MB |     71.6MB     |
| オブジェクト | 35.7MB |     67.4MB     |

予想に反してオブジェクトを回したほうがメモリ消費が少ないという結果が得られた。

::: warning 結果に関して

あくまでも実験環境ではオブジェクトの方が軽かったというだけなので、あまり信用しないように。

:::

#### ID を割り当てる

では次にユニークな ID を割り当てて`ScrollViewReader`で遷移できるようにしてみる。

```swift
// Object
ForEach(tweets) { tweet in
    TweetView(tweet: tweet)
        .id(tweet.idStr)
}

// Index
ForEach(tweets.indices) { index in
    TweetView(tweet: tweets[index])
        .id(index)
}
```

するとインデックスでループした場合に起動時に CPU 使用率が 100%になるという現象が発生した。更に、メモリ消費量も 95.3MB と異常に消費していることがわかる。

|    ループ    | 起動時 | 全件読み込み時 |
| :----------: | :----: | :------------: |
| インデックス | 95.3MB |    124.5MB     |
| オブジェクト | 36.1MB |     67.4MB     |

何故こうなるのか、思い当たる理由がいくつかあるのだが断定ができないのが難しいところ。とりあえずわかるのは、オブジェクトを回したいならインデックスではなくオブジェクトをループする方針をまずは考えたほうが良いということだろうか。

#### EnvironmentValue

次に`EnvironmentValue`を割り当ててみた。

これを上手く利用できれば`Binding`のバケツリレー地獄から抜け出せるのだが、今回は適当に`idStr`をわたしてみることにした。独自`EnvironmnetValue`は以下のように定義できる。

```swift
struct TweetId: EnvironmentKey {
    static var defaultValue: String = "0"
}

extension EnvironmentValues {
    var tweetIdStr: String {
        get {
            self[TweetId.self]
        }
        set {
            self[TweetId.self] = newValue
        }
    }
}
```

```swift
// Index
ForEach(manager.timeline.indices) { index in
    TweetView(tweet: manager.timeline[index])
        .listRowInsets(.init(top: 4, leading: 8, bottom: 8, trailing: 4))
        .environment(\.tweetIdStr, manager.timeline[index].idStr)
}
// Object
ForEach(manager.timeline) { tweet in
    TweetView(tweet: tweet)
        .listRowInsets(.init(top: 4, leading: 8, bottom: 8, trailing: 4))
        .environment(\.tweetIdStr, tweet.idStr)
}
```

あとは同じようにアプリを実行してどのくらいメモリを消費するかを確かめる。

|    ループ    | 起動時 | 全件読み込み時 |
| :----------: | :----: | :------------: |
| インデックス | 44.5MB |     76.8MB     |
| オブジェクト | 35.2MB |     65.1MB     |

するとやはり、オブジェクトの方が軽くなるという結果が得られた。

## 子コンポーネントの変化を伝える

試しに以下のようなコンポーネントを作ってみる。

```swift
import SwiftUI

// 親コンポーネント
struct ContentView: View {
    @EnvironmentObject var manager: TweetManager

    var body: some View {
        List(content: {
            ForEach(manager.tweets) { tweet in
                // POINT 1
                TweetView(tweet: tweet)
            }
            Button(action: {
                // 実際の値を表示
                print(manager.tweets.map({ $0.retweeted }))
            }, label: {
                Text("Retweeted")
            })
        })
    }
}

// 子コンポーネント
struct TweetView: View {
    // POINT 2
    let tweet: Tweet

    var body: some View {
        HStack(content: {
            Text(tweet.idStr)
            Spacer()
            Button(action: {
                // POINT3
                tweet.retweeted.toggle()
            }, label: {
                Text("Retweet")
                    .foregroundColor(tweet.retweeted ? .blue : .secondary)
            })
                .buttonStyle(.plain)
        })
    }
}
```

要するにオブジェクトの`retweeted`のプロパティで文字の色が変化するだけの View です。

```swift
// オブジェクト
class Tweet { // POINT 4
    internal init(idStr: String, text: String, retweeted: Bool = false) {
        self.idStr = idStr
        self.text = text
        self.retweeted = retweeted
    }

    var idStr: String
    var text: String
    var retweeted: Bool = false

}

// IdentifiableにするためのExtension
extension Tweet: Identifiable {
    public var id: String { idStr }
}
```

そしてオブジェクト自体は上のように定義しました。

最後にこれらのデータを管轄する`ObservableObject`を定義します。

```swift
class TweetManager: ObservableObject {
    @Published var tweets: [Tweet] = [
        Tweet(idStr: "0", text: "AAA"),
        Tweet(idStr: "1", text: "BBB"),
        Tweet(idStr: "2", text: "CCC"),
        Tweet(idStr: "3", text: "DDD"),
        Tweet(idStr: "4", text: "EEE")
    ]
}
```

で、変化させられるポイントは四つあります。

### POINT 1

```swift
// ContentView
TweetView(tweet: tweet)
```

一つ目は`TweetView`へのオブジェクトの渡し方です。ここでは単純に渡していますが、

1. 単純に渡す
2. `Binding`で渡す
3. `Environment`で渡す
4. `Environment` + `Binding`で渡す
5. `ObseravableObject`で渡す

の五つのパターンがあります。今書いているコードは一番上の単純に渡すものです。

### POINT 2

```swift
// TweetView
let tweet: Tweet
```

二つ目は子コンポーネントでの受け取り方です。

1. 単純に受け取る
2. `State`で受け取る
3. `Binding`で受け取る
4. `Environment`で受け取る
5. `Environment` + `Binding`で受け取る
6. `ObservedObject`で受け取る

の六つのパターンがあります。今書いているコードは一番上の単純に受け取るものです。

### POINT 3

```swift
// TweetView
tweet.retweeted.toggle()
```

SwiftUI では immutable なので普通は中身を変更するような上のコードが書けません。

これが書けるのは、

1. `Tweet`がクラスである
2. `tweet`が`@State`または`@Binding`または`ObservedObject`である

のどちらかです。今回は`Tweet`をクラスとして定義しているので変更可能だということです。

### POINT 4

```swift
class Tweet {
    // 中略
}
```

四つ目はオブジェクトの定義の仕方です。

1. クラスとして定義
2. 構造体として定義

の二つのパターンが考えられます。

実質的に 3 と 4 はほとんど同じなので、今回は同じものとして考えます。

すると、以下のような表が考えられます。

| 動作 | メモリ消費量 | 子への渡し方 | 親からの受け取り方 | 定義 |
| :--: | :----------: | :----------: | :----------------: | :--: |
|      |              |              |                    |      |

ポイントは三つあるので、それぞれどのパターンを使ったかを書きます。その上で、動作したかしなかったか、メモリをどのくらい使ったかを記録します。

これで、最良の方法が見つかるはずです。

## 検証してみる

まずは子への渡し方として`ObservableObject`を利用して`@Published`のプロパティを使ったものを検証しました。

| 動作 | メモリ消費量 | 子への渡し方 | 親からの受け取り方 |  定義  |
| :--: | :----------: | :----------: | :----------------: | :----: |
| 不可 |    16.6MB    |  @Published  |        let         | class  |
| 不可 |    16.4MB    |  @Published  |       @State       | class  |
|  -   |      -       |  @Published  |      @Binding      | class  |
|  -   |      -       |  @Published  |        let         | struct |
|  可  |    16.8MB    |  @Published  |       @State       | struct |
|  -   |      -       |  @Published  |      @Binding      | struct |

すると上のような結果になりました。クラスで渡した場合は SwiftUI のフレームワークを通さずに値が変更されてしまうため、コンパイルが通った場合でもボタンを押して View を再レンダリングすることができませんでした。

構造体で渡した場合は`@State`をつけることであっさりと目的の動作を達成しました。ちなみに`@Published`がついていなくてもしっかりと反映されました。これは`@State`がついているのが`[Tweet]`ではなく`Tweet`だからだと思われます。

### Environment を利用する

単純に`Environment`を利用した場合では先程使えた構造体が動作しなくなります。

というのも`Environment`で単純に渡すと値が変更不可能なためです。

よって、`tweet.retweeted.toggle()`が実行不可能なのでコンパイルエラーになります。

| 動作 | メモリ消費量 | 子への渡し方 | 親からの受け取り方 |  定義  |
| :--: | :----------: | :----------: | :----------------: | :----: |
| 不可 |    16.6MB    | Environment  |    Environment     | class  |
|  -   |      -       | Environment  |    Environment     | struct |

### Environment + Binding を利用する

これが使えたら良かったのですが`ObservableObject`に突っ込んだ段階で`@State`が使えないため`@Published`しか利用できません。

また`@Published`は`RandomAccessCollection`に適合していないため`ForEach`で回すことができません。あれ、ダメじゃん？

## State で受け取ってから Environment で回す

というわけでこれだけがちゃんと動きました。`@State`で受け取ってからわざわざ`Environment`で渡すのがダサい気もするのですが`Binding`のバケツリレー地獄を防ぐためには仕方ないのかなあとか思いました。

しかも値を変更可能にするために`Binding`にしているせいでややこしくなってます。うーん、めんどくさいなこれ。計算プロパティとかを利用するようにすればいいんでしょうか？

少なくとも自分の環境ではちゃんと動きました。ただ`EnvironmentValue`自体は`@State`ではないので`@Binding`であることを明示して渡さないといけません。なのでそれがちょっぴりめんどくさいです。

```swift
struct TweetStatus: EnvironmentKey {
    static var defaultValue: Binding<Tweet> = .constant(Tweet(idStr: "", text: ""))
}

extension EnvironmentValues {
    var tweetStatus: Binding<Tweet> {
        get {
            self[TweetStatus.self]
        }
        set {
            self[TweetStatus.self] = newValue
        }
    }
}
```

なのでこんな感じで`EnvironmentKey`と`EnvironmentValues`を定義するとよいかと思います。

記事は以上。
