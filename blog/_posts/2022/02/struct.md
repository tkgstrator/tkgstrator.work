---
title: 構造体をEquatableに準拠させる
date: 2022-02-07
category: プログラミング
tags:
  - Swift
  - SwiftUI
---

## 構造体と Equatable

構造体は便利なのだが、何かしらの処理をするときにそういう処理が定義されていないことが多い。

例えば、以下のような構造体を定義したとしよう。

```swift
struct Person {
    let name: String
    let age: Int
}
```

そして、今回は名前は全てユニークで重複がないものとして考える。もしも名前がユニークでないのであれば適当にユーザ ID などを割り当てれば良い話なので、ここでは割愛する。

```swift
let mike: Person = Person(name: "Mike", age: 20)
let john: Person = Person(name: "John", age: 30)
```

そして、二人分のインスタンスを作成したところを考えよう。

```swift
let mike: Person = Person(name: "Mike", age: 20)
let john: Person = Person(name: "John", age: 30)

let tom: Person = mike + john // Error
```

Mike と John のこれら二人を融合して新たな人間を作成しようという試みは失敗する。何故なら Person 型では+という演算子に対する処理が定義されていないからだ。

## Equatable

`Equatable`とは二つのインスタンスが等しいかどうかを判定可能であるプロトコルである。もし、構造体の全てのプロパティが Equatable に準拠している場合は、

```swift
struct Person: Equatable {
    let name: String
    let age: Int
}
```

とすることで実装できる。この場合は String も Int も Equatable に準拠しているので特別なコードを書く必要はないというわけである。

ただしこの場合だと、`name`も`age`も等しくないと同じものだと判定されない。もしも独自に等しいための条件を書きたいのであれば、

```swift
struct Person: Equatable {
    let name: String
    let age: Int

    static func == (lhs: Person, rhs: Person) -> Bool{
        return lhs.name == rhs.name
    }
}
```

とすれば、名前が同じであれば年齢が違っても同じだと判定されるようになる。

### Comparable

Comparable は Equatable に加えて大小関係が比較できるプロトコルです。

```swift
struct Person: Equatable, Comparable {
    let name: String
    let age: Int

    static func == (lhs: Person, rhs: Person) -> Bool{
        return lhs.name == rhs.name
    }

    static func < (lhs: Person, rhs: Person) -> Bool {
        return lhs.age < rhs.age
    }
}
```

今回は適当に、若いほうが小さいというように判定しましたが、名前をアルファベット順に並べたときに若いほうが小さいというふうにしてしまっても構いません。ここを定義しておけばソートができるようになるので、ソートしたいもので大小関係を比較すると良いかもしれませんね。
