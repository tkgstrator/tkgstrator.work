---
title: Combineを理解しよう
date: 2022-02-28
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## Combine

Combine とは Apple 公式の非同期処理のフレームワークのこと。

使い方がさっぱりわからなかったのだが、最近ようやくちょっと理解できてきたので忘れないために書いておく。

## Combine の基本

`Publishers`で非同期処理を定義して、それを`Subscribers`で購読することで実行されます。また、出力される値などを加工することができる`Operators`もあります。

`Publishers`を定義した時点では実行されないというところがポイントです。`Subscribers`にはいろいろ種類があって独自`Subscribers`を定義することができるのですが、公式が用意した`Subscribers`でも十分実用的なのでまずはそちらを紹介します。

### Publishers

Publishers には、

- Future
- Just
- Fail
- Deferred
- Empty
- Record

の六つが用意されています。六つ用意されてはいるのですが、基本的には上の三つを使えば大体なんでもできます。

::: tip Publishers について

というよりも、他の三つを利用するうまいやり方が思いついていないと言っても良い

:::

#### Future

最も基本となる`Publishers`です。

- 値を出力して終了
- エラーを出力して終了

のどちらかを実行できます。

#### Just

- 値を出力して終了

ができます。エラーが発生することは想定されません。

#### Fail

- エラーを出力して終了

ができます。

### Subscribers

`Publishers`は六種類もあったのですが、`Subscribers`は二つしかありません。

#### Sink

`sink`は最もよく使われる`Subscribers`です。

- エラーを受け取って処理する
- 値を受け取って処理する

ができます。

```swift
publish() // Publishers
    .sink(receiveCompletion: { completion in
        switch completion {
            case .finished:
                // 処理A
            case .failure(let error):
                // 処理B
        }
    }, receiveValue: { response in
        // 処理C
    })
    .store(in: &cancellable)
```

ライフサイクルとしては、

1. エラーが発生しなかった場合
   - 処理 C > 処理 A
2. エラーが発生した場合
   - 処理 B

という感じになっています。エラーが発生した場合はそもそも値を受け取れず、処理 A では何の値を受け取ったかわからないというのがポイントです。

#### Assign

- 値を受け取ってオブジェクトに代入する

```swift
class Clock: ObservableObject {
    var lastUpdated: TimeInterval = TimeInterval()
    @Published var cancellable: AnyCancellable?

    func subscribe() {
        cancellable = Timer.publish(every: 1, on: .main, in: .default)
            .autoconnect()
            .map(\.timeIntervalSince1970)
            .assign(to: \.lastUpdated, on: self)
    }
}
```

なかなかいい例が思いつかなかったので苦心して考えたのがこれ。

Timer で一秒ごとに`Publishers`を受け取って、それを`TimeIntervalSince1970`に変換して直接`lastUpdated`に代入している。

### Operators

最もややこしくて、理解が必要なのがこれ。

現状、自分もよくわかっていないので、将来的にこの記事を見て何書いてるんだこいつと思えるようになりたい所存。

- Map
  - flatMap
  - map
  - tryMap
- Error
  - replaceError
  - mapError
- Others
  - handleEvents
  - retry
- Values
  - prepend
  - append
  - merge
  - collect

テンプレートとして以下のコードを考えます。

このコードはランダムに 0~10 の整数を生成し、0 だったらエラーを返すような`Publisher`です。

```swift
import Foundation
import Combine

enum CustomError: Error {
    case isZero
    case isNull
    case isOdd
    case isEven
}

private var cancellable: Set<AnyCancellable> = Set<AnyCancellable>()

func publish() -> AnyPublisher<Int, Error> {
    let number: Int = Int.random(in: 0 ... 10)
    if number == 0 {
        return Fail(outputType: Int.self, failure: CustomError.isZero)
            .eraseToAnyPublisher()
    }
    return Future { promise in
        promise(.success(number))
    }
    .eraseToAnyPublisher()
}

publish()
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

## Operators 一覧

### Map 系

Map 系は基本的に何らかの変換をする`Operators`です。

#### Map

- 変換した値を返す

`map`の使い所は失敗しない変換です。

例えば、以下のようにすれば返り値を二倍にすることができます。

```swift
publish()
    .map({ $0 * 2 }) // 返り値を2倍にする
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

#### FlatMap

- 変換した Publisher を返す

一方、`flatMap`は返り値ではなく Publisher 自体を変換します。

```swift
/// 受け取った値を二倍にするPublisherを定義
func publisher2(value: Int) -> AnyPublisher<Int, Never> {
    Just(value * 2)
        .eraseToAnyPublisher()
}

publish()
    .flatMap({ publisher2(value: $0) })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

このようにして実装することができます。

#### TryMap

- 変換した値を返す
- エラーを返す

`tryMap`はエラーもしくは値を返すことができる`Operators`です。

```swift
publish()
    .tryMap({ value throws -> Int in
        // 偶数ならその値を返す
        if value % 2 == 0 {
            return value
        }
        // 奇数なら奇数エラーを返す
        throw CustomError.isOdd
    })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

上のようなコードを書けば受け取った値が偶数ならそのまま返し、奇数の場合はエラーを出力することができます。

### Error 系

Error 系ではエラー処理をするための`Operators`を紹介します。

#### replaceError

- エラーを正常な値に置き換える

```swift
publish()
    .replaceError(with: 0)
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

本来のコードは`Publisher`が 0 の値を出す場合には代わりにエラーを出力していたのですが`replaceError`は受け取ったエラーを何らかの定数値に置き換えることができます。

似たような`Operators`として`nil`を置き換える`replaceNil`と空を置き換える`replaceEmpty`があります。

#### mapError

- エラーを別のエラーに変換

```swift
publish()
    .mapError({ error -> CustomError in
        CustomError.isNull
    })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

このようなコードを書けば何らかのエラーを受け取ればそれを全て`CustomError.isNull`に置き換えることができます。`mapError`はエラー以外のものは返せないのでそこだけ注意しましょう。

#### Catch

- エラーを Publisher に置き換える

```swift
publish()
    .catch({ error -> AnyPublisher<Int, Never> in
        Just(100)
            .eraseToAnyPublisher()
    })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

出力される型が同じであれば好きな`Publishers`に変換することができます。

上のコードはエラーを受け取ったら（出力された値が 0 なら）それを 100 に置き換えるコードです。

一方、エラーをなかったことにできてしまうコードは以下の通り。

```swift
publish()
    .catch({ error in
        Empty(outputType: Int.self, failureType: CustomError.self)
            .eraseToAnyPublisher()
    })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

`Empty`はエラーを秘匿するためなどに使うといいんじゃないかと思います。この場合、エラーは発生しているのですが`completion`で`failure`には入らず`finished`が呼ばれます。

ただし、Empty なので`outputValue`はないという感じです。

### Others

#### HandleEvents

`HandleEvents`は何でもできる万能な`Operators`です。

```swift
publish()
    .handleEvents(
        receiveSubscription: { subscription in
            // Sink/Assignが呼ばれたときに実行
        },
        receiveOutput: { output in
            // 値を受け取ったときに実行
        },
        receiveCompletion: { completion in
            // 購読が終わったときに実行
        },
        receiveCancel: {
            // 購読がキャンセルされたときに実行
        },
        receiveRequest: { request in
            // リクエストを受け取った時に実行
        })
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

こんな感じで何でもできます。

#### Retry

エラーが発生した場合、再実行します。初回の一回に加えて、引数の回数だけ繰り返します。

```swift
publish()
    .retry(5)
    .sink(receiveCompletion: { completion in
        switch completion {
        case .finished:
            print("Finished")
        case .failure(let error):
            print(error)
        }
    }, receiveValue: { response in
        print(response)
    })
    .store(in: &cancellable)
```

こう書けば全部で六回実行されることになります。

### Values

この章では複数 Publisher からの出力される値をまとめる方法について解説します。

#### Prepend

- 指定された Publishers より先に値を出力

```swift
import Combine

var cancellable: AnyCancellable?
let dataElements = (0...10)
cancellable = dataElements.publisher
    .prepend(0, 1, 255)
    .sink { print("\($0)", terminator: " ") }
```

最初に宣言されているのは`0, 1, ... 10`を出力する Publisher なのですが、`prepend`でこの Publisher よりも先に`0, 1, 255`を出力するようになっています。

```swift
// Output
0 1 255 0 1 2 3 4 5 6 7 8 9 10
```

よって、出力は上のようになります。

#### Append

- 指定された Publishers より後に値を出力

```swift
import Combine

var cancellable: AnyCancellable?
let dataElements = (0...10)
cancellable = dataElements.publisher
    .append(0, 1, 255)
    .sink { print("\($0)", terminator: " ") }
```

こちらは後ろに繋げる形で出力されます。

```swift
// Output
0 1 2 3 4 5 6 7 8 9 10 0 1 255
```

#### Merge

- 複数(最大 8 つ)の Publisher を連結して一つにして出力

`merge`はちょっと違う感じで`PassthroughSubject`の`Publisher`を利用するときに使います。

```swift
import Combine

var cancellable: AnyCancellable?
let publisher = PassthroughSubject<Int, Never>()
let pub2 = PassthroughSubject<Int, Never>()

cancellable = publisher
    .merge(with: pub2)
    .sink { print("\($0)", terminator: " " )}
```

この宣言をした時点では`Publisher`にはまだ何も値が入っていないので`sink`をしても値は出力されません。

そこで`send()`を使って`Publisher`にタスクを与えます。また、タスク完了時には`send(completion: .finished)`を与える必要があります。

連結している全ての Publisher が`completion`を出力したとき、全体として`completion`になります。

```swift
publisher.send(0)   // -> 0
publisher.send(1)   // -> 1
publisher.send(completion: .finished)
pub2.send(2)        // -> 2
pub2.send(3)        // -> 3
pub2.send(completion: .finished)    // -> finished

// Output
0 1 2 3 finished
```

#### SwitchToLatest

- 複数の Publisher を 1 つの Publisher として出力
  - 常に最新の Publisher の値を出力する

`Publisher`をまとめるという点では`merge`に似ていますが、`switchToLatest`では常に最新の一つの Publisher からしか値を受け付けません。

```swift
import Combine
import Foundation
import PlaygroundSupport
PlaygroundPage.current.needsIndefiniteExecution = true

let subject = PassthroughSubject<Int, Never>()

cancellable = subject
    .map({ URLSession.shared.dataTaskPublisher(for: URL(string: "https://example.org/get?index=\($0)")!) })
    .switchToLatest()
    .sink(receiveCompletion: { completion in
        print(completion)
    }, receiveValue: { data, response in
        print(response.url)
    })

// 0.1秒ごとにURLリクエストを生成する
for index in 1...5 {
    DispatchQueue.main.asyncAfter(deadline: .now() + TimeInterval(index/10)) {
        subject.send(index)
    }
}
```

例えばこのコードは 1 秒ごとに URLSession を実行します。従来の Publisher であれば値が 5 回返ってくるはずなのですが、この場合は最後の 1 回しか値が返ってきません。

何故なら URLSession は値を返すまでに 0.1 秒以上かかるため、値を返す前に新しくきた URLSession で Publisher が上書きされてしまうためです。よって、最初の 4 回の Publisher はすべて値を返す前に最後の Publisher によって上書きされます。

用途としてはボタンを押したときに何らかの URL リクエストを実行する場合、ボタンを連打されてもリクエストが何度もとんでいかないというメリットがあります。それ以外に用途あるかな（わからん

::: tip PassthroughSubject について

というか PassthroughSubject を学んだのがつい最近なので使い方がよくわかっていなかったりする。Publisher を予め宣言しておいて、そこにタスクを投げていく感じというイメージであっているのだろうか。

:::

ちなみに、十分な間隔をあけてリクエストを実行すればちゃんと全ての値が返ってきます。この場合、0.1 秒間隔というのが短すぎたということです。

#### CombineLatest

- 複数の Publisher を 1 つの Publisher として出力
  - タプルとして出力される
  - 複数の Publisher が全て新しい値を出力すると全体として出力
  - 複数の Publisher が全て completion を出力すると全体として completion を出力

`merge`に似ているのですが、`merge`は一方が出力されると全体として出力されたのに対して、こちらは連結している全ての Publisher が新しい値を出力しないと全体として出力されません。

```swift

```

###
