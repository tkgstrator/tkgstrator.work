---
title: Delegateパターンを理解する
date: 2022-02-07
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## Delegate とは

Delegate とはあるクラスからの処理の一部を別のクラスに委譲するための仕組みのこと。

何かをすることは決まっているけれど、何をするかは時と場合によって変更したいときに使えます。なお、ここで紹介しているコードは全て Playground 上で動作します。チェックに使ってみてください。

### Delegate を定義しよう

基本的には Delegate はプロトコルで定義されます。変数や関数を定義しておくと良いです。

```swift
protocol SessionDelegate: AnyObject {
    func beginSession()
    func endSession()
}
```

今回はこんな感じで二つの関数を定義しました。

プロトコルに`AnyObject`を適合させておくと`weak`をつけられるようになったりする上に、class でしか継承できなくなるので便利です。

### 子クラスの定義

次に、Delegate のプロパティを持つクラスを定義します。この場合、子クラスは`SesseionDelegate`のプロパティを持っているので`beginSession()`と`endSession()`の二つの関数があることは知っているが、その中でどんな処理をするのかは知らない、という状態です。

で、その処理を親クラスに委譲しようというわけですね。

```swift
class Session {
    /// Delegateをメンバ変数に持たせる
    weak var delegate: SessionDelegate?

    init() {}
    init(delegate: SessionDelegate) {
        self.delegate = delegate
    }

    func start() {
        delegate?.beginSession()
        // 処理
        delegate?.endSession()
    }
}
```

ちなみにですが、delegate は必ず`weak`をつけなければいけません。そうしないとお互いがお互いを強参照してしまうので、どちらかのインスタンスが消えてももう一方が参照を持ち続けてしまい、循環参照に陥るためです。

### 親クラス

さて、最後に親クラスですが、ここは子クラスを継承した場合と、インスタンスとして持つ場合の二通りが考えられます。

個人的には継承するのが正しい使い方だと思うのですが、多分どちらもできます。

#### 継承する場合

```swift
class Service: Session, SessionDelegate {
    func beginSession() {
        print("Delegate Session Start")
    }

    func endSession() {
        print("Delegate Session End")
    }

    override init() {
        super.init()
        self.delegate = self
    }
}
```

`Session`と`SessionDelegate`の二つを継承、適合し、`super.init()`実行後に`self.delegate = self`で自分自身を Delegate として設定します。

```swift
let service: Service = Service()
service.start()
```

この状態で上のように Service クラスのインスタンスを作成して実行すると`beginSession()`として Service クラスの`beginSession()`が Session クラスの`start()`内で呼ばれます。Session クラスは Service クラスの情報を全く知らない(子クラスなので)のに、不思議ですね。

これが Delegate というやつらしいです。

#### インスタンスとして持つ場合

```swift
class Service: SessionDelegate {
    func beginSession() {
        print("Delegate Session Start")
    }

    func endSession() {
        print("Delegate Session End")
    }

    let session: Session

    init() {
        self.session = Session()
        self.session.delegate = self
    }
}
```

基本は同じような感じです。

```swift
let service: Service = Service()
service.session.start()
```

## Delegate で@escaping できるか

結論から言えば、もちろんできる。

```swift
protocol SessionDelegate: AnyObject {
    func beginSession()
    func endSession()
    func closure(completion: @escaping (String) -> Void)
}
```

例えば上のように定義すれば、親クラス側で`closure()`の処理を決めた上で子クラスに`String`を返すことができる。こんなの動くのかと思うかもしれないが、動く。

何故なら、子クラスの`delegate`プロパティは`SessionDelegate`に準拠しているので、何かしらの処理が実行されたあとに`String`型が返ってくることを知っているからだ。

```swift
protocol SessionDelegate: AnyObject {
    func beginSession()
    func endSession()
    func closure(completion: (String) -> Void)
}
```

ちなみに`@escaping`を利用しない場合の書き方もできる。
