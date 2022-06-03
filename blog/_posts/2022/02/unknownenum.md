---
title: 未知の値に対応したEnumを考えるとややこしい問題
date: 2022-02-22
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## Codable + Enum

Swift の Codable では Enum の値も直接変換することができます。

```swift
enum PaymentType: Int, CaseIterable, Codable {
    case クレジット = 0
    case 現金 = 1
}

struct Transaction: Codable {
    let payment: PaymentType
    let subtotal: Int
}
```

のような感じで定義しておけば、

```json
{
  "payment": 1,
  "subtotal": 1500
}
```

の JSON を特別なコードを必要とせずに受け取ることができます。

### 文字列+整数

で、こんな感じで簡単に受けられればそれでいいのですが、世の中には世にも奇天烈なレスポンスを返す API が多数存在します。

多分最も多いのが、Enum で整数型しか返さないのにわざわざ文字列で返してくるタイプです。

```json
{
  "payment": "1",
  "subtotal": 1500
}
```

これを受けるには、

```swift
enum PaymentType: String, CaseIterable, Codable {
    case クレジット = "0"
    case 現金 = "1"
}
```

とすればいいのですが、整数型で返ってくるとわかっているものを文字列で受け取るのは違和感があります。

::: tip 要件 1

実質整数型が返ってくるものに対しては文字列型で返ってきたとしても整数型として受け取る。

:::

更に、これだけでなく、

::: tip 要件 2

整数型として返ってきた場合はそのまま整数型として受け取る。

:::

この二つの要件をまとめると、

```json
[
  {
    "payment": "1",
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1500
  }
]
```

のようなデータが来ても正しく受け取りたいということになります。

### Null

次に`null`を許容する Enum を考えます。

Swift の Codable では Value に`nil`が入るパターンは次の二つが考えられます。

1. キーが存在しない場合
2. 値が`null`の場合

これらはそれぞれ、以下の JSON に対応します。

```json
[
  {
    "subtotal": 1500
  },
  {
    "payment": null,
    "subtotal": 1500
  }
]
```

よって、

::: tip 要件 3

キーが存在しない場合は`nil`を割り当てる。

:::

と

::: tip 要件 4

値が`null`の場合は`nil`を割り当てる。

:::

の二つの要件が加わります。

ちなみに、`nil`を受け取る場合には`プロパティ自体`をオプショナルにする必要があります。

```swift
struct Transaction: Codable {
    let payment: PaymentType? // オプショナルに変更
    let subtotal: Int
}
```

よって`Transaction`の定義を上のようにオプショナルに変更する必要があります。

### Encodable

次に Encodable について考えます。

Swift は`nil`が入ったプロパティを Encode するとキー自体が消えてしまうことが知られています。これはつまり、

```swift
struct Transaction: Codable {
    let payment: PaymentType? // オプショナルに変更
    let subtotal: Int
}

let transaction = Transaction(payment: nil, subtotal: 1000)
```

を Encode すると、

```json
{
  "subtotal": 1000
}
```

になってしまうことを意味します。API によってはキーが存在しないと正しいデータとして受け取ってくれない場合があるので、

```json
{
  "payment": null,
  "subtotal": 1000
}
```

と出力されてほしいわけです。

::: tip 要件 5

`nil`が入ったプロパティはエンコードすると`null`が割り当てられる。

:::

### 未知の値

ここまでの話は Enum の値が完全に一対一対応している場合の話でしたが、API のアップデートで急に知らないレスポンスが返ってくることがあります。

例えば、決済方法として交通系 IC が追加されたとしましょう。

```json
{
  "payment": 2, // 交通系ICを意味するEnum
  "subtotal": 1000
}
```

すると、交通系 IC には 2 という値が割り当てられることになります。

これをそのまま`PaymentType`に変換しようとすると`Cannot initialize PaymentType from invalid Int value 2`というエラーが発生し、2 という値に対応する Enum が PaymentType にないとしてデコードすることができません。

::: tip 要件 6

未知の値に対しては`unknown`を割り当てる。

:::

## コードを書いてみよう

では、これらの要件を満たすコードを考えましょう。

条件としては、最終的には整数型として受け取りたいので、Enum の定義は、

```swift
enum PaymentType: Int, CaseIterable, Codable {
    case クレジット = 0
    case 現金 = 1
}
```

となります。

::: warning 定義について

実はこの定義のままでは全ての要件を満たせないが、最初はこれで定義しておきます。

:::

### テンプレート

Playground で以下のようなコードを書けば実際にどのように動作するかが簡単にチェックできます。

```swift
import Foundation

let json = """
[
  {
    "payment": 0,
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1000
  }
]
"""

enum PaymentType: Int, CaseIterable, Codable {
    case クレジット = 0
    case 現金 = 1
}

struct Transaction: Codable {
    let payment: PaymentType
    let subtotal: Int
}

let decoder: JSONDecoder = JSONDecoder()

do {
    let data = json.data(using: .utf8)!
    let response = try decoder.decode([Transaction].self, from: data)
    print(response)
} catch {
    print(error)
}
```

これを実行すると、正しく

```swift
[
    Page_Contents.Transaction(payment: Page_Contents.PaymentType.クレジット, subtotal: 1500),
    Page_Contents.Transaction(payment: Page_Contents.PaymentType.現金, subtotal: 1000)
]
```

という結果が得られると思います。では一方を文字列にしてしまうとどうなるでしょうか？

```swift
let json = """
[
  {
    "payment": "0",
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1000
  }
]
"""
```

つまり、上のように JSON の中身を書き換えるということになります。

```swift
typeMismatch(Swift.Int, Swift.DecodingError.Context(codingPath: [_JSONKey(stringValue: "Index 0", intValue: 0), CodingKeys(stringValue: "payment", intValue: nil)], debugDescription: "Expected to decode Int but found a string/data instead.", underlyingError: nil))
```

すると上のようなエラーが発生して、デコードすることができません。エラーの内容は Int 型だと思っていたら String 型が入っていたぞ、というようなものになります。

さて、これをどうやって対応するかを考えます。

### 独自イニシャライザの実装

一つ目の対応方法は、独自イニシャライザの実装です。

```swift
extension PaymentType {
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        /// Int -> PaymentType
        if let intValue = try? container.decode(Int.self) {
            if let rawValue = PaymentType(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> PaymentTypeに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }

        /// String -> Int -> PaymentType
        let stringValue = try container.decode(String.self)
        if let intValue = Int(stringValue) {
            if let rawValue = PaymentType(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> PaymentTypeに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }
        /// String -> Intに失敗
        throw DecodingError.typeMismatch(PaymentType.self, DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot convert to Int from String value \(stringValue)"))
    }
}
```

これに対応するには例えば上のようなコードを書きます。

こうすれば受け取った方が Int に変換可能ならそのまま PaymentType への変換を行い、String なら Int に一度変換してから PaymentType に変換を行います。

```swift
[
    Page_Contents.Transaction(payment: Page_Contents.PaymentType.クレジット, subtotal: 1500),
    Page_Contents.Transaction(payment: Page_Contents.PaymentType.現金, subtotal: 1000)
]
```

なのでこのコードは正しく動作します。

ちなみに、これだけだと PaymentType にしか適応できませんが、次のようにジェネリクスを使って改良することで RawValue が Int のものであればすべての Enum に対応できます。

```swift
extension RawRepresentable where RawValue == Int, Self: Codable {
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        /// Int -> PaymentType
        if let intValue = try? container.decode(Int.self) {
            if let rawValue = Self(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> RawRepresentableに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize RawRepresentable from invalid Int value \(intValue)"))
        }

        /// String -> Int -> RawRepresentable
        let stringValue = try container.decode(String.self)
        if let intValue = Int(stringValue) {
            if let rawValue = Self(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> RawRepresentableに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize RawRepresentable from invalid Int value \(intValue)"))
        }
        /// String -> Intに失敗
        throw DecodingError.typeMismatch(Self.self, DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot convert to Int from String value \(stringValue)"))
    }
}
```

これで要件 1 と要件 2 は満たすことができました。

### KeyedDecodingContainer

独自イニシャライザ以外の方法として、`decode`の関数を自作してしまう方法があります。

```swift
extension KeyedDecodingContainer {
    func decode(_ type: PaymentType.Type, forKey key: KeyedDecodingContainer<K>.Key) throws -> PaymentType {
        if let intValue = try? decode(Int.self, forKey: key) {
            if let rawValue = PaymentType(rawValue: intValue) {
                return rawValue
            }
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }

        let stringValue = try decode(String.self, forKey: key)
        if let intValue = Int(stringValue) {
            if let rawValue = PaymentType(rawValue: intValue) {
                return rawValue
            }
            /// Int -> PaymentTypeに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }
        /// String -> Intに失敗
        throw DecodingError.typeMismatch(PaymentType.self, DecodingError.Context.init(codingPath: codingPath, debugDescription: "Cannot convert to Int from String value \(stringValue)"))
    }
}
```

やっていることは同じなので好みの方で良いと思います。こちらの手法の良いところはオプショナルにも簡単に対応できて、

```swift
extension KeyedDecodingContainer {
    func decodeIfPresent(_ type: PaymentType.Type, forKey key: KeyedDecodingContainer<K>.Key) throws -> PaymentType? {
        // 処理
    }
}
```

を定義すればオプショナルの場合でも正しく変換できます。

### オプショナルに対応

次はオプショナルに対応させましょう。

要件 1 と 2 を満たしつつ、3 と 4 を満たすには以下の JSON を正しくデコードできれば良いことになります。

```swift
let json = """
[
  {
    "payment": 0,
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1000
  },
  {
    "payment": "1",
    "subtotal": 1000
  },
  {
    "payment": null,
    "subtotal": 1000
  },
  {
    "subtotal": 1000
  }
]
"""
```

先程のコードに対してこの JSON を与えるとそれぞれ、

1. `null`の場合
   - `Expected String but found null value instead.`
2. キーが存在しない場合
   - `No value associated with key CodingKeys(stringValue: \"payment\", intValue: nil) (\"payment\").`

というエラーが発生します。

::: tip `null`の場合のエラー

`Expected Int but found null value instead.`ではなく、何故`String`なのだろうかと気になるかもしれないが、`Int`への変換は`try?`でエラーが`nil`に置き換えられているため発生しない。

:::

これに対応するのは簡単で、単に`Transaction`構造体のプロパティをオプショナルに変更するだけで良い。

```swift
struct Transaction: Codable {
    let payment: PaymentType? // オプショナルに変更
    let subtotal: Int
}
```

こうしてやればエラーなくデータを変換できて、

```swift
[
    Page_Contents.Transaction(payment: Optional(Page_Contents.PaymentType.クレジット), subtotal: 1500),
    Page_Contents.Transaction(payment: Optional(Page_Contents.PaymentType.現金), subtotal: 1000),
    Page_Contents.Transaction(payment: Optional(Page_Contents.PaymentType.現金), subtotal: 1000),
    Page_Contents.Transaction(payment: nil, subtotal: 1000),
    Page_Contents.Transaction(payment: nil, subtotal: 1000)
]
```

というふうにデコードすることができました。

### エンコードに対応

エンコードしたデータを見るには以下のコードが便利です。

```swift
let encoder: JSONEncoder = {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
    return encoder
}()

/// String -> Data
let data = json.data(using: .utf8)!
/// Data -> [Transaction] Decode
let response = try decoder.decode([Transaction].self, from: data)
/// [Transaction] -> Data -> String Encode
print(String(data: try encoder.encode(response), encoding: .utf8)!)
```

すると結果として、

```json
[
  {
    "payment": 0,
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1000
  },
  {
    "payment": 1,
    "subtotal": 1000
  },
  {
    "subtotal": 1000
  },
  {
    "subtotal": 1000
  }
]
```

が得られます。やはり普通に実装しただけでは`null`を値に持つキーが消えてしまいます。

#### KeyedEncodingContainer

この Extension は`encode`が実行されたときに呼ばれます。

プロパティがオプショナルなら常に`encodeIfPresent`が呼ばれ、そうでない場合は`encode`が呼ばれます。

```swift
extension KeyedEncodingContainer {
    mutating func encodeIfPresent(_ value: PaymentType?, forKey key: KeyedEncodingContainer<K>.Key) throws {
        switch value {
        case .some(let value):
            try encode(value, forKey: key)
        case .none:
            try encodeNil(forKey: key)
        }
    }
}
```

このように書けば値が`Optional<PaymentType>`のときにこの`encode`が実行されます。

本来であれば`nil`が入った場合には`encode`自体が`nil`を返してしまうのですが、こうすればキーが保持されたまま値として`nil`が返るので JSON になったときに`null`が入ります。

```json
[
  {
    "payment": 0,
    "subtotal": 1500
  },
  {
    "payment": 1,
    "subtotal": 1000
  },
  {
    "payment": null,
    "subtotal": 1000
  }
]
```

無事に`null`が出力でき、要件 5 を満たすことができました。

## ここまでのまとめ

要件 5 までを満たすコードの全文はこちら。

ジェネリクス対応のコードを書いても良かったのですが、めんどくさいので`PaymentType`に対応したものだけを載せておきます。

```swift
extension PaymentType {
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        /// Int -> PaymentType
        if let intValue = try? container.decode(Int.self) {
            if let rawValue = PaymentType(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> PaymentTypeに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }

        /// String -> Int -> PaymentType
        let stringValue = try container.decode(String.self)
        if let intValue = Int(stringValue) {
            if let rawValue = PaymentType(rawValue: intValue) {
                self = rawValue
                return
            }
            /// Int -> PaymentTypeに失敗
            throw DecodingError.dataCorrupted(DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot initialize PaymentType from invalid Int value \(intValue)"))
        }
        /// String -> Intに失敗
        throw DecodingError.typeMismatch(PaymentType.self, DecodingError.Context.init(codingPath: container.codingPath, debugDescription: "Cannot convert to Int from String value \(stringValue)"))
    }
}

extension KeyedEncodingContainer {
    mutating func encodeIfPresent(_ value: PaymentType?, forKey key: KeyedEncodingContainer<K>.Key) throws {
        switch value {
        case .some(let value):
            try encode(value, forKey: key)
        case .none:
            try encodeNil(forKey: key)
        }
    }
}
```

### 未知の値に対応する

未知の Enum の値に対応するためには`PaymentType`に変更を加えるしかありません。

この先はまだちょっと長いので一旦ここまで。
