---
title: 自作Formatterでテキストに社会性のフィルターを実装する
date: 2021-12-13
category: プログラミング
tags:
  - SwiftUI
---

## 社会性のフィルター

社会性フィルターについてググると以下のような記述がヒットする。

> 「社会性フィルター」とは、SNS 上で世間一般に公開するにははばかられる“本音”をぼかすため、「にゃーん」といった一語に置き換えて投稿することで、2016 年に Twitter 上で話題となって以降よく使われている。

つまり、言ってはならないあの方の名前などをそのまま SNS に投稿してしまってはよろしくないので、別の言葉に置き換えるというわけである。

本来であれば、投稿する前に文章を遂行するなりして自分でチェックするのが正しい SNS 運用なのだが、人間なのでチェック漏れもするだろうし、投稿するアカウントを間違えたり、酔っ払うなどして正常な判断力がない状態でチェックし忘れたりするようなケースが考えられる。

なので、現在作成中のツイッタークライアントである NyamoTwi には社会性フィルターとして、自動でツイート内容を置換するような仕組みが備わっている。

ただ、その仕組も若干適当なので今回は Formatter を利用してよりしっかりとしたフィルターに変えたいわけである。

### 仕様を決める

さて、どのように社会性フィルターを実装するかなのだが、次のような仕様にしたいと考えている。

- フィルターはユーザが自身で設定できる
- フィルターには正規表現が利用できる
- 置換先の文字列は「にゃーん」のみとする

本来であればユーザが設定できる方がいいのだが、せっかく NyamoTwi なのだから「にゃーん」にしか置換できないと考えよう。

正規表現を使った置換は`replacingOccurrences`を使えば問題なく実装できる。

例えば「わんわん」を「にゃーん」に置換するためのコードは以下の通り。

```swift
extension String {
    var socializedTex: String {
        self.replacingOccurrences(
            of: "わんわん",
            with: "にゃーん",
            options: .regularExpression, // 正規表現を利用するオプション
            range: self.range(of: self))
    }
}
```

まあこのコードでは全く正規表現の良さが伝わらないのだが、まあ要するにこのコードを利用すれば社会性フィルターをテキストにかけることは可能である。

### Custom Formatter

```swift
class SocializedFormatter: Formatter {
    // TextFieldに入力された値(obj)をSubmit時にBindingに代入する
    override func string(for obj: Any?) -> String? {
    }

    // TextFieldに何か入力されるたびにStringをobjとBindingに代入する
    override func getObjectValue(_ obj: AutoreleasingUnsafeMutablePointer<AnyObject?>?, for string: String, errorDescription error: AutoreleasingUnsafeMutablePointer<NSString?>?) -> Bool {
    }
}
```

最低限実装すればよいのがこの二つのメソッドです。

### TextField の仕組み

まずは以下のような`ContentView.swift`を定義します。

```swift
import SwiftUI

struct ContentView: View {
    @State var text: String = ""
    var body: some View {
        Form(content: {
            TextField("Hello", value: $text, formatter: SocializedFormatter(), prompt: nil)
                .onSubmit({
                    // Submit時にデータが呼ばれる
                })
            Text(text)
                .foregroundColor(.secondary)
        })
    }
}
```

![](https://pbs.twimg.com/media/FGdLMr5VkAEY1Uj?format=png)

TextField に何かを入力している間は常に入力値の値が更新されています。ただし、この入力値は`@Binding var text`に代入されているわけではありません。

で、入力される値が変わるたびに`getObjectValue`が呼ばれます。入力されているテキストは`string`として渡され、これに対して何らかの処理を行うことが可能です。

そしてこの時点でも`Binding var text`には何もデータが書き込まれていません。データを書き込むためには`obj?.pointee = string as AnyObjct`というコードを書く必要があります。

これを書くと、

1. TextField に入力
2. 謎の変数が更新される
3. `getObjectValue`が呼ばれる
4. 入力中の値`string`を受け取る
5. `obj.pointee`に代入すると`@Binding var text`が更新される

テキストの Validation 等を行いたい場合は入力値を適切な値に変換すれば良いので、`override func string(for obj: Any?) -> String?`の方だけ書き換えればよく、`getObjectValue`は受け取った値をそのままポインタに代入すれば良いです。

|                  | 呼び出しタイミング |       コピー元       |   コピー先   |
| :--------------: | :----------------: | :------------------: | :----------: |
|     string()     |       submit       | TextField への入力値 |   Binding    |
| getObjectValue() |  onEditingChanged  | TextField への入力値 | obj, Binding |

::: tip getObjcetValue()

これで`Binding`が変化するのは`obj`に何らかの代入を行ったときだけなので気をつけること。

:::

```swift
class SocializedFormatter: Formatter {
    override func string(for obj: Any?) -> String? {
        // テキストに変換不可ならnilを返す
        guard let inputText = obj as? String else {
            return nil
        }
        // 文字列置換を行う
        return inputText.replacingOccurrences(of: "Apple", with: "Google", options: .regularExpression, range: inputText.range(of: inputText))
    }

    override func getObjectValue(_ obj: AutoreleasingUnsafeMutablePointer<AnyObject?>?, for string: String, errorDescription error: AutoreleasingUnsafeMutablePointer<NSString?>?) -> Bool {
        obj?.pointee = string as AnyObject
        return true
    }
}
```

例えば上のようなコードを書けば、TextField に適当に文字列を入力して、どこかに`Apple`という文字列があればそれが`Google`に置換されます。

## ツイッター投稿をフォーマットしてみる

タイムラインから得られる情報の一部を表示すると以下のような感じになります。

```json
{
  "created_at": "Mon Dec 13 03:40:51 +0000 2021",
  "id": 1470237251359887363,
  "id_str": "1470237251359887363",
  "text": "@tkgling @tkgstrator  #NyamoTwi #日本二度寝協会\n\nテストツイート\n\nhttps://t.co/pl9bPmu6lQ",
  "truncated": false,
  "entities": {
    "hashtags": [
      {
        "text": "NyamoTwi",
        "indices": [22, 31]
      },
      {
        "text": "日本二度寝協会",
        "indices": [32, 40]
      }
    ],
    "symbols": [],
    "user_mentions": [
      {
        "screen_name": "tkgling",
        "name": "ちひろ@エスパーですから",
        "id": 946312668650004480,
        "id_str": "946312668650004480",
        "indices": [0, 8]
      },
      {
        "screen_name": "tkgstrator",
        "name": "me（あったかインナーガール）",
        "id": 872821322677575680,
        "id_str": "872821322677575680",
        "indices": [9, 20]
      }
    ],
    "urls": [
      {
        "url": "https://t.co/pl9bPmu6lQ",
        "expanded_url": "https://tkgstrator.work/",
        "display_url": "tkgstrator.work",
        "indices": [51, 74]
      }
    ]
  }
}
```

`text`に最大 140 字のテキストが突っ込まれていて、`entities`にハッシュタグやリプライ先の情報と、そのインデックスが入っています。

つまり`text`から`index`を使ってフォーマットしろということですね。

### 構造体を使ってみる

しかしこれ、まずは実際に必要なテキストを抽出するのは Formatter ではなくて構造体などを利用したほうがいい気がします。

```swift
struct Tweet: Codable {
    let plainText: String
    let hashTags: [String]
    let replyTo: [String]
    let url: [URL]

    init(context: String) {
        self.plainText = ..,
        self.hashTags = ...
        self.replyTo = ...
        self.url = ...
    }
}
```

なのでこんな感じでまずは Tweet 構造体を作成します。あとは入力されたテキストから、これらを抜き出せばよいわけですね。

インデックスがわかっていればコレラは簡単に行えます。
