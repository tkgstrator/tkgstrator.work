---
title: EnumをRawValue以外でCodable準拠したい
date: 2022-01-01
category: プログラミング
tags:
  - Swift
---

## あけましておめでとうございます

といっても特に面白いことはありませんでした。家の鍵を取り替えてみて、鍵を取り替えるのって面白いなってなったくらいです。

あと、ドラム式乾燥機能がついた洗濯機が欲しいです。あと、もうすぐ HMD が届くと思うので楽しみです。出荷連絡早くこないかな。

## Enum+Codable

Enum は RawValue をもたせてやれば Codable に準拠させて簡単に変換することができる。

例えば以下のようなレスポンスを受け取るとしよう。

```json
[
  {
    "staffType": "1",
    "storeType": "1"
  },
  {
    "staffType": "2",
    "storeType": "2"
  },
  {
    "staffType": "3",
    "storeType": "4"
  }
]
```

するとこれは、次のような構造体で受け取ることができる。

```swift
struct Response: Codable {
    let staffType: String
    let storeType: String
}
```

ここでもし、staffType と storeType が 1, 2, 3 以外の値を取らない Enum 値だったとしよう。すると、わざわざ String で受けるよりもわかりやすい Enum で受けとるほうが良い。

```swift
struct Response: Codable {
    let staffType: StaffType
    let storeType: StoreType
}

enum StaffType: String, Codable {
    case admin      = "1"
    case parttime   = "2"
    case fulltime   = "3"
}

enum StoreType: String, Codable {
    case personal   = "1"
    case market     = "2"
    case department = "3"
}
```

すると例えば上のように表現可能になる。

::: tip Enum の値について

今回は適当に`admin`などの名前をつけているが、区別できるなら何でも良い。

:::

### この仕様の弊害

しかし、実際に使ってみるとこのコードでは若干不満が残ることがわかる。というのも、このようなケースの場合 Enum は整数値で定義されるべきなのに文字列で返ってきて気持ちが悪い。

ところが、整数値で定義をすると Enum はきれいになるが Codable で変換するときにエラーが発生するのでこれでは意味がない。

### 解決策

なので以下のようなプロパティラッパーを定義する。Enum を拡張するプロパティラッパーである。

なお、このコードを考えるにあたって [NullCodable](https://github.com/g-mark/NullCodable) と [[Swift] JSON がパースできないだと?! そういうときは・・・? そうだね! LosslessStringConvertible だね!](https://dev.classmethod.jp/articles/json-parse-with-lossless-string-convertible/)を参考にさせていただきました。

特別な型を使わずにプロパティラッパーを使えるのは便利だと思いました。

```swift
@propertyWrapper
struct LosslessEnum<T: RawRepresentable> where T.RawValue: LosslessStringConvertible {
    var wrappedValue: T

    init(wrappedValue: T) {
        self.wrappedValue = wrappedValue
    }
}

extension LosslessEnum: Codable {
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let stringValue = try container.decode(String.self)
        // リテラルの型に変換する
        guard let rawValue = T.RawValue(stringValue) else {
            // 変換できない場合はエラーを返す
            throw DecodingError.typeMismatch(Int.self, DecodingError.Context(codingPath: container.codingPath, debugDescription: "Could not decode `\(stringValue)` to `\(T.RawValue.self)`", underlyingError: nil))
        }
        // Enumに変換する
        guard let wrappedValue = T(rawValue: rawValue) else {
            // 該当するリテラルがない場合はエラーを返す
            throw DecodingError.valueNotFound(Int.self, DecodingError.Context(codingPath: container.codingPath, debugDescription: "Not defined rawValue `\(rawValue)` on `\(T.self)`"))
        }
        self.wrappedValue = wrappedValue
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        // 文字列としてエンコードする
        try container.encode(String(self.wrappedValue.rawValue))
    }
}
```

これを踏まえた上で

```swift
struct Response: Codable {
    @LosslessEnum var staffType: StaffType
    @LosslessEnum var storeType: StoreType
}
```

と定義すれば、RawValue は Int のままで JSON に突っ込まれた String から自動で変換してくれる。変換不能な場合は、

1. そもそもリテラルに変換できない
2. リテラルに変換できたが対応する Enum がない

の二パターンが考えられる。どちらが発生したかは throw で正しく返しているのでデバッグも問題ないと思われる。

## 未知の Enum に対応するには

ところが API のレスポンスを Decodable で受け取ることを考える上で、これだけだと不十分なケースがある。

それは[Decodable で未知の enum の値がきたときの対策(https://qiita.com/yanamura/items/45993a1ddaada10e1631)の記事でも書かれているように、APIがアップデートして未知のEnumレスポンスを含むようになった場合である。Codableはその仕様上、未知のEnumに対してはErrorを出力し`nil`を返すようなことはしない。

これは極めて自然であり、ないものに対しては`nil`ではなくエラーを返すのが正しい設計である。未知の値に`nil`を割り当ててしまうとその Enum が設定されていないのか未知の値なのかが判断できなくなります。

また厄介なことに Decodable は一つでも Decode できないキーがあると全体として Decode に失敗して値を受け取れなくなってしまいます。知らない値が突っ込まれているのはわかるので、そこだけは無視して〜みたいな器用なことができません。

で、参考文献にもあるようにこれを解決するには`unknown`のような`case`を追加する方法があります。

ただしこれをやろうとすると全ての Enum に対して実装を書かねばならず、コストが高くなるというデメリットがあります。

### 既知の問題

現在の定義では`T`が`RawRepresentable`に適合していて、`wrappedValue`が`T`である必要があるのでオプショナルな値を保存することができません。

```swift
@propertyWrapper
struct LosslessEnum<T: RawRepresentable> where T.RawValue: LosslessStringConvertible {
    var wrappedValue: T

    init(wrappedValue: T) {
        self.wrappedValue = wrappedValue
    }
}
```

つまり、Enum には何かしらの値が入っていなければいけないことになります。

これに対応するためには、

```swift
@propertyWrapper
struct LosslessEnum<T: RawRepresentable> where T.RawValue: LosslessStringConvertible {
    var wrappedValue: T?

    init(wrappedValue: T?) {
        self.wrappedValue = wrappedValue
    }
}
```

とすればいいのですが、そうなると他のところもコードを変えなければいけなくなります。

そのうち対応しようと思います。
