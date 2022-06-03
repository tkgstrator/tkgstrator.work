---
title: SwiftUIのレイアウトで使えるテクニック
date: 2022-03-14
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## SwiftUI のレイアウトテクニック

SwiftUI では UIKit と違って直接的な制約条件などがない。

よって相対座標や絶対座標によってフレーム内にオブジェクトを配置していくのだが、ここの理解がかなり曖昧だったのでそこをしっかりと理解していく。

### GeometryReader

本ブログで何回も登場しているよくわからないコンポーネント。

大事なのはこれ自体はフレームサイズを提供しないということ。何もしなければ横幅も縦幅も可能な限り大きくなる。要するに基本は全体をカバーするようなフレームが与えられる。

なのでとりあえず大きくなるコンポーネントなのかと思いきや、`LazyVGrid`や`LazyHGrid`などのように`Lazy`にコンポーネントのサイズに制限を与えるようなコンポーネントに突っ込むと突然可能な限り小さくなる（最小 10px の模様）という謎の挙動を見せる。

よく考えれば謎でもなんでもないのだが`Lazy`のコンポーネントの中に`GeometryReader`を突っ込む際は注意していたい。

::: tip Lazy+GeometryReader

Lazy 的なコンポーネントと併用して利用する場合は`.scaleToFit()`や`.scaleToFill()`や`.aspectRatio()`などを利用しないといけないことに注意しよう。

:::

GeometryReader にツッコまれたコンポーネントは何もしなければ常に左上を`(0,0)`として積み重なるようにレイアウトされる。要するに`ZStack`のような役割を持つ。

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(content: {
            GeometryView()
        })
    }
}

struct GeometryView: View {
    var body: some View {
        GeometryReader(content: { geometry in
            Text("ContetntA")
                .background(Color.red.opacity(0.3))
            Text("ContetntB")
                .background(Color.red.opacity(0.3))
        })
            .background(Color.blue.opacity(0.3))
    }
}
```

なのでこのようなコードを書くと二つのコンポーネントが重なったものが左上に表示されるというわけだ。何もしなければ GeometryReader のフレームは最大まで広がるので`GeometryProxy`を利用して自分の好きな位置にコンポーネントを配置すれば良い。

## 二つのコンポーネントを組み合わせる

単独のレイアウトだけであれば簡単なことがわかったが、二つのコンポーネントを組み合わせる場合はどうだろう？例えば、何らかのデータを表示したい場合に左側には A というデータの概要を表示して、右側には A の詳細データを表示するような場合が考えられる。

### アスペクト比重視

アスペクト比重視のレイアウトとは、本記事ではデバイスサイズによってレイアウトが変わらないデザインのことを指す。

ただし、iPad の解像度はそれぞれのデバイスでアスペクト比が一致していない。

#### iPad のアスペクト比

| iPad Pro | アスペクト比 |
| :------: | :----------: |
|   9.7    |     4:3      |
|   10.5   |     4:3      |
|    11    |   199:139    |
|   12.9   |     4:3      |

例えば iPad Pro はほとんど 4:3 だが 11 インチモデルだけは 199:139 になっている。11 インチは現行モデルなのでこの違いは無視できないが、4:3 というのは 200:150 であるため大きな差があるわけではない。

余程ギリギリの UI 設計をしない限り、この程度の違いであれば許容できるだろう。

以下、ほとんどの iPad はアスペクト比が 4:3 であることがわかる。

| iPad Air | アスペクト比 |
| :------: | :----------: |
|   9.7    |     4:3      |
|   10.5   |     4:3      |
|   10.9   |    59:41     |

| iPad mini | アスペクト比 |
| :-------: | :----------: |
|    7.9    |     4:3      |
|    8.3    |   1133:744   |

| iPad | アスペクト比 |
| :--: | :----------: |
| 9.7  |     4:3      |
| 10.2 |     4:3      |

iPad は 9.7 インチモデルも 10.2 インチモデルも 4:3 である。唯一奇抜なアスペクト比をしているのが最新の iPad mini でこれは 1133:744 というのは 4:2.627 くらいのアスペクト比ということになる。

これだと他の iPad と同じ UI を採用するのは少し難しいかもしれない。

話がそれてしまったので二つのコンポーネント組み合わせる方法について考えたい。

ようはこんな感じで左側のエリアと右側のエリアに分けたいわけである。

```swift
struct ContentView: View {
    var body: some View {
        HStack(spacing: 0, content: {
            Content()
                .background(Color.red)
            Content()
                .background(Color.blue)
        })
    }
}

struct Content: View {
    var body: some View {
        GeometryReader(content: { geometry in
        })
    }
}
```

単に二つに分けたいだけなら上のようにすれば良い。こうすれば左半分が赤、右半分が青になる。

ちょうど半分にしたくないなら GeometryReader は何もしなければ最大まで大きくなることを利用して、一方に`.frame(width: XXX)`というようにフレームサイズに制限をつければ良い。

しかし、これだと表示される全体のフレームサイズが異なる場合、アスペクト比が保存されない。仮に左側のコンポーネントを横幅 200 にしたとしたら、全体の横幅が 1000 のデバイスなら 1:4 の分割になるが、1200 のデバイスなら 1:5 の分割になってしまう。

そこで GeometryReader を使って動的にフレームサイズを取得し、解像度に関わらず同一の UI が提供されるように修正してみる。

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        GeometryReader(content: { geometry in
            // 横幅を動的に取得する
            let width: CGFloat = geometry.frame(in: .local).maxX
            HStack(spacing: 0, content: {
                Content()
                    .background(Color.red)
                    .frame(width: width * 0.25)
                Content()
                    .background(Color.blue)
            })
        })
    }
}

struct Content: View {
    var body: some View {
        GeometryReader(content: { geometry in
        })
    }
}

/// プレビュー
struct ContentView_Previews: PreviewProvider {
    static let frameSize: [CGSize] = [
        CGSize(width: 900, height: 520),
        CGSize(width: 540, height: 312)
    ]

    static var previews: some View {
        ForEach(frameSize, id:\.self) { frame in
            ContentView()
                .previewLayout(.fixed(width: frame.width, height: frame.height))
        }
    }
}

/// Hashableに適合させる
extension CGSize: Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(width)
        hasher.combine(height)
    }
}
```

つまり、GeometryReader を利用することによって元のアスペクト比が一致しているなら解像度に関わらず同じ UI を提供することができるというわけである。
