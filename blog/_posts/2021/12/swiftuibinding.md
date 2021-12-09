---
title: SwiftUIのBindingの理解を深める
date: 2021-12-08
categoriy: プログラミング
tags:
  - SwiftUI
---

## SwiftUI + Binding

SwiftUI では変数を SwiftUI フレームワークで管理するための`@State`, `@Binding`, `@Published`, `@ObservedObject`, `@StateObject`のような仕組みがあります。

で、これを使えば本来値を変えることができない構造体のプロパティを更新して、ビューを再レンダリングできます。

### [@State](https://developer.apple.com/documentation/swiftui/state)

`@State`はわかりやすくて`struct`内で値が変更できる変数です。

```swift
// trueで初期化する場合(通常の利用方法)
@State var isPresented: Bool = true

// 任意の値でStateを初期化する場合
@State var isPresented: Bool

// イニシャライザを利用する
init(isPresented: Bool) {
    self._isPresented = State(initialValue: isPresented)
}
```

### [@Binding](https://developer.apple.com/documentation/swiftui/binding)

`@Binding`は子コンポーネントで変更した場合に親コンポーネントも再レンダリングされるようなプロパティです。

`@State`と違い、親コンポーネントから値を受け取ることを前提としているので初期値の設定は不要です。

```swift
// 通常の利用方法
@Binding var isPresented: Bool

// イニシャライザを利用する
init(isPresented: Bool) {
    self._isPresented = isPresented
}
```

### 結論

このあと、とても長い検証コードが続いて読むのがめんどくさくなると思うので先に結論だけ書いておきます。

- `@State`は配列の中身が変わったときにもビューが再レンダリングされる
- `@State`を用いずに直接中身を書き換えると再レンダリングされない
- `@Binding`のイニシャライザを利用するときには注意

例えば、

```swift
Binding(
    get: {},
    set: {}
)
```

を使うと、set で中身を書き換えても再レンダリングされない（内部的には反映されている）

#### 利用方法

例えば、以下のようなコンポーネントを作ってみる。

```swift
import SwiftUI

struct ContentView: View {
    @State var isEnabled: Bool = false

    var body: some View {
        Form(content: {
            Text(isEnabled ? "Enable" : "Disable")
            ToggleView(isEnabled: $isEnabled)
        })
    }
}

struct ToggleView: View {
    @Binding var isEnabled: Bool

    var body: some View {
        Toggle(isOn: $isEnabled, label: {
            Text("Toggle")
        })
    }
}
```

このとき、親コンポーネントは`ContentView`で、子コンポーネントが`ToggleView`になります。

そして`@Binding`の特性として Toggle の値が変更されると親コンポーネントにもそれが伝わり、テキストの内容が書き換わるというわけです。

ちなみに以下のコードと等価です。

```swift
struct ToggleView: View {
    @Binding var isEnabled: Bool

    init(isEnabled: Binding<Bool>) {
        self._isEnabled = isEnabled // 初期化
    }

    var body: some View {
        Toggle(isOn: $isEnabled, label: {
            Text("Toggle")
        })
    }
}
```

特に Binding の初期値をいじりたいとかそういうことがなければこちらの方式を採用する意味はないです。

で、やっかいになるのがこの`@Binding`の初期化なんです。`@State`は通常の変数から`@State(initialValue: )`を使って初期化できるのですが、`@Binding`はそう簡単にはできません。

そして、やり方が分からなかったので今まで放置していました。

しかしそれではまずかろうということで今回しっかりと`@Binding`について理解を深めようと思いました。

## Binding の初期化

実は`@Binding`は`.constant()`を使うと初期化することができます。

```swift
struct ToggleView: View {
    @Binding var isEnabled: Bool

    var body: some View {
        // .constant()は定数値なのでToggleを切り替えられない
        Toggle(isOn: .constant(true), label: {
            Text("Toggle")
        })
    }
}
```

で、これは問題なくコンパイルが通るのですが実はこれだけでは意味がないです。

というのも、`.constant()`は定数という意味なので値を変化させることができないからです。やればわかりますが、上のコードは常にトグルが有効化されてしまいます。

### 初期化が必要になるパターン

例えば、次のような仕様を考えてみます。

- プロパティ名と有効かどうかのフラグを持つプロパティがある
- それらの配列がある
- その配列から Toggle を ForEach で作成したい

すると、以下のようなコードが思いつくかと思われます。

```swift
struct ToggleType {
    let title: String
    var isEnabled: Bool
}

struct ToggleView: View {
    let toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        ForEach(toggles) { toggle in
            // toggle.isEnabledが@Bindingではないのでエラーが発生
            Toggle(isOn: toggle.isEnabled, label: { // Error!!
                Text(toggle.title)
            })
        }
    }
}

extension ToggleType: Identifiable {
    var id: String { title }
}
```

しかしこれはコンパイルエラーが発生する。何故なら`Toggle`に渡されている値である`toggle.isEnabled`が`@Binding`でないからですね。

かと言って単純に`@Binding`に変換する`.constant()`では値が変更できなくなってやっぱり意味がありません。

```swift
struct ToggleView: View {
    let toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        ForEach(toggles) { toggle in
            // .constant()なので初期値から変えられない
            Toggle(isOn: .constant(toggle.isEnabled), label: {
                Text(toggle.title)
            })
        }
    }
}
```

ではどうすればいいのかといえば、至極シンプルな話で`@Binding`のイニシャライザを使えば良い。

```swift
struct ToggleView: View {
    let toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        ForEach(toggles) { toggle in
            Toggle(isOn: Binding(
                get: { toggle.isEnabled },
                set: { toggle.isEnabled = $0 } // 代入できないエラー
            ), label: {
                Text(toggle.title)
            })
        }
    }
}
```

`@Binding`のイニシャライザは`Computed Property`に近いので、そちらのやり方がわかっている人であれば特に悩むことがないと思います。

要するに値を参照したときにどの値を返すか、値を更新したときにどこにその値をセットするかを記述すれば良いので、今回の場合は`isEnabled`を更新すればよいだけなので上のようなコードになるわけですね。

が、ここで`Cannot assign to property: 'toggle' is a 'let' constant`というエラーが発生します。なんだこれ。

それは`ToggleStyle`が`struct`で定義されていて、構造体のコピーの値を書き換えて元々のデータは書き換えられないことが原因です。

簡単にいうと`ForEach`でループして生成されている`toggle`は`toggles`の要素のコピーなので、`toggle`の中身を書き換えても`toggles`の要素は書き換えられません。

そんな意味のないことをさせないように SwiftUI では構造体をコピーするときは`let`として処理するので、そもそも上書きという操作ができないわけです。じゃあどうすればいいのか。

構造体ではなく、クラスを使おうという話になります。

クラスであればオブジェクトのコピーではなく、参照渡しになるので ForEach でループしている`toggle`の中身を書き換えれば`toggles`の中身も書き換えられます。

```swift
// 構造体だったことが問題なのでクラスに変更
class ToggleType {
    // クラスには必ずイニシャライザが必要なので追加する
    internal init(title: String, isEnabled: Bool) {
        self.title = title
        self.isEnabled = isEnabled
    }

    let title: String
    var isEnabled: Bool
}

struct ToggleView: View {
    let toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        Group(content: {
            ForEach(toggles) { toggle in
                Toggle(isOn: Binding(
                    get: { toggle.isEnabled },
                    // エラーが発生しなくなる
                    set: { toggle.isEnabled = $0 }
                ), label: {
                    Text(toggle.title)
                })
            }
            Button(action: {
                print(toggles.map({ $0.isEnabled }))
            }, label: {
                Text("SHOW")
            })
        })
    }
}
```

で、例えばこのようにかけばビューの中身を切り替えられるようになります。

| ToggleType | イニシャライザ |  コピー  | プロパティの上書き |
| :--------: | :------------: | :------: | :----------------: |
|   struct   |      不要      |  値渡し  |       不可能       |
|   class    |      必要      | 参照渡し |        可能        |

::: tip 構造体のプロパティ上書きについて

実は構造体でも`mutating`を利用すれば値を上書きすることができるのだが、これは`SwiftUI`の View 内では利用できないことを覚えておいて欲しい。

`mutating`をつけろみたいなエラーがでたら、`@State`プロパティをつけるか、`class`にするかのどちらかしか解決手段はないと思う。

:::

### 再レンダリングされない場合

さて、今の仕組みでビューが再レンダリングされたのは`Toggle`の操作自体がビューの再レンダリングがかかるような操作だったためです。それらを伴わないような操作で中身を切り替えた場合には反映されません。

```swift
struct ToggleView: View {
    let toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        Group(content: {
            ForEach(toggles) { toggle in
                Toggle(isOn: Binding(
                    get: { toggle.isEnabled },
                    set: { toggle.isEnabled = $0 }
                ), label: {
                    Text(toggle.title)
                })
            }
            Button(action: {
                print(toggles.map({ $0.isEnabled }))
            }, label: {
                Text("SHOW")
            })
            Button(action: {
                toggles[0].isEnabled.toggle() // ボタンのActionでToggleを切り替え
            }, label: {
                Text("SWITCH")
            })
        })
    }
}
```

たとえばこのような構造では`SWITCH`を押してもビューの再レンダリングはされません。

じゃあ`toggles`を`@State`プロパティにすればいいのかというとそうでもありません。

::: tip 再レンダリング

ちなみに、再レンダリングされていないだけで値自体はしっかり変わっています。

なので、直接変数の中身を見るような`print(toggles.map({ $0.isEnabled }))`を実行すれば中身が書き換わっていることがわかります。この場合の問題は、値が変わっているにも関わらず SwiftUI フレームワークがその変更を検出できずビューが再レンダリングされないというところにあります。

:::

```swift
struct ToggleView: View {
    // @State属性にしてもビューは再レンダリングされない
    @State var toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]
    // 省略
}
```

何故なら`@State`はあくまでも`[ToggleType]`しかみていないからです。`[ToggleType]`が増えたりすれば再レンダリングされますが、プロパティが変わっても再レンダリングはされないというわけです。

```swift
Button(action: {
    // @Stateプロパティ自体が変更されるので再レンダリングされる
    toggles.append(ToggleType(title: "CCC", isEnabled: true))
}, label: {
    Text("APPEND")
})
Button(action: {
    // @Stateプロパティのプロパティが変更されるので再レンダリングされない
    toggles[0].isEnabled.toggle()
    toggles[0].title = "DDD"
}, label: {
    Text("SWITCH")
})
```

::: tip 再レンダリング

ちなみにこれもさっきと同じで、内部的にはちゃんと値が切り替わっているので、APPEND のボタンを押せば正しくその時の`toggles`の中身がビューに反映されます。

:::

### 上手くいかないコード

じゃあ`ToggleType`のプロパティに対して`@State`をつければ良いと考えるかも知れない。

```swift
class ToggleType {
    internal init(title: String, isEnabled: Bool) {
        self.title = title
        self.isEnabled = isEnabled
    }

    @State var title: String
    @State var isEnabled: Bool
}

struct ToggleView: View {
    @State var toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]
    // 省略
}
```

つまり、上のようなコードである。

だが、残念ながらこのコードは正しく動作しない。`ToggleType`の中身を書き換えてもビューは再レンダリングされない。

```swift
class ToggleType: ObservableObject {
    internal init(title: String, isEnabled: Bool) {
        self.title = title
        self.isEnabled = isEnabled
    }

    var title: String
    @Published var isEnabled: Bool
}

struct ToggleView: View {
    @State var toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]
    // 省略
}
```

ちなみに、`@Published`をつけた場合も上手くいかない。

なんとなく長くなりそうなので、表にしてまとめたいと思う。

## 動作する組み合わせ

```swift
struct ContentView: View {
    @State var toggles: [ToggleType] = [
        ToggleType(title: "AAA", isEnabled: true),
        ToggleType(title: "BBB", isEnabled: true)
    ]

    var body: some View {
        Form(content: {
            // コード1
            Section(content: {
                ForEach(toggles) { toggle in
                    Toggle(isOn: Binding(
                        get: { toggle.isEnabled },
                        set: { toggle.isEnabled = $0 }
                    ), label: {
                        Text(toggle.title)
                    })
                }
            })
            // コード2
            Section(content: {
                Toggle(isOn: $toggles[0].isEnabled, label: {
                    Text(toggles[0].title)
                })
                Toggle(isOn: $toggles[1].isEnabled, label: {
                    Text(toggles[1].title)
                })
            })
        })
    }
}

```

一見するとどちらも同じようなことをしているように見えるが、その本質は全く異なることに注意したい。

ちなみに、個人的には ForEach で回せるコード 1 の方を積極的に利用したいと考えている。これらの二つのコードの違いを見てみよう。

まず`ToggleType`の違いからどのような差がでるかを考える。どちらのコードも結局は`isEnabled`の値を変更するので、`let`で宣言されている場合はコンパイルエラーが発生する。

### 構造体の場合

`ToggleType`が構造体の場合はコード 1 は全く動作しない。よって、動作するのはコード 2 のみである。

::: warning 動作しない理由

何度も述べたように構造体は`ForEach`でループさせると値渡しでコピーを作成するため。

よって(`@State`でないかぎり)`toggle`の値を変えても`toggles`の中身は変わらないし、配列自身は`@State`になっていても`ToggleType`自体はただの構造体のまま。よって、`toggle.isEnabled.toggle()`によって値を書き換えることはできないのでコンパイルエラーがでます。

:::

できればコード 1 を使いたいのでそうであれば`ToggleType`を構造体で宣言することのメリットはなにもないということになる。

![](https://pbs.twimg.com/media/FGIt8cIVQAEr73u?format=png)

この時、コード 2 が正しく動くためには`ToggleType`のプロパティが`var`で`toggles`のプロパティが`@State`で宣言する必要があります。

これ以外の組み合わせでは正しく動作しません。

::: tip 理由

`ToggleType`のプロパティは変更可能であるために`var`でなければないらない。`@Published var`でもいけそうなきがするが、これをすると`@State`変数の中の中の`@State`変数という入れ子の状態が発生するため挙動がおかしくなる。

`toggles`を`@State`にしなければいけない理由は`ToggleType`を構造体で宣言しているために`mutating`を使わないと値を上書きできなくなっているためである。SwiftUI の View では基本的に`mutating`は使えないので`@State var`で宣言して SwiftUI フレームワークに値を上書きしてもらう必要がある。逆にいえば`ToggleType`が構造体でないなら`toggles`はどんな宣言をしていても良いことになる。

ただし、コード 2 の場合は`$toggles[0].isEnabled`というコードで参照しているので`ToggleType`が構造体でなくクラスであったとしても`@State var`で宣言しなければならない。

:::

### クラスの場合

クラスの場合でもコード 2 が正しく動作する条件は変わりません。ただし、クラスの場合はコード 1 が動作するようになります。

![](https://pbs.twimg.com/media/FGI0aFFVUAQ8Qun?format=png)

その条件は単純で`ToggleType`のプロパティが`@Published var`もしくは`var`のどちらかであることです。

### 両者の違い

ここで簡単におさらいをしておきます。

```swift
Section(content: {
    ForEach(toggles) { toggle in
        Toggle(isOn: Binding(
            get: { toggle.isEnabled },
            set: { toggle.isEnabled = $0 }
        ), label: {
            Text(toggle.title)
        })
    }
})
// コード2
Section(content: {
    Toggle(isOn: $toggles[0].isEnabled, label: {
        Text(toggles[0].title)
    })
    Toggle(isOn: $toggles[1].isEnabled, label: {
        Text(toggles[1].title)
    })
})
```

一見そっくりのコードですが、意味する内容は全く違います。

コード 1 はクラスのオブジェクトの参照渡しですが、コード 2 はクラスのオブジェクトの配列の構造体を読み込んでいるからです。

なので結局コード 2 は構造体、コード 1 はクラスを扱っていることになります。構造体を扱っているからこそ、コード 2 では`@State`宣言をしなければ値が上書きできなかったのです。

## ForEach をどうやって使うか

::: danger ForEach を利用することの最大のデメリット

ForEach を使って値を変更するようなコードを書くと今回の例でいうと`ToggleType`が SwiftUI 管轄になっていないために、中身のプロパティの値を上書きしてもビューが再レンダリングされないという問題がある。

:::

- ForEach でループさせるとコードが書きやすくスッキリする
- ForEach でループさせるのはクラスでなくてはならない
- クラスは`@State`を持たないので(実装すると普通にバグる)

::: tip @State 中の＠State を定義すると

コンパイルはできるのですが、`Accessing State's value outside of being installed on a View. This will result in a constant Binding of the initial value and will not update.`という表示がでてビューが何も変化しません。そりゃ当たり前かという気もします。

:::

これについては[[SwiftUI] SwiftUI の ForEach 内で Binding 変数を渡したい](https://software.small-desk.com/development/2020/04/13/swiftui-foreach-binding/)や[Binding an element of an array of an ObservableObject : subscript is deprecated](https://stackoverflow.com/questions/57324501/binding-an-element-of-an-array-of-an-observableobject-subscript-is-depre)でも議論されている内容のようで、やはり Binding 属性を持つ配列をループさせてもその要素が Binding にならないようです。

で、解決法も提示されていて（それはあまり使いたくなかったのですが）`@State`属性を持つプロパティを経由して配列にアクセスすれば`@Binding`を使うことができます。

```swift
Section(header: Text("Class + Index"), content: {
    // インデックスでループする
    ForEach(columns.indices) { index in
        // イテレータでアクセスする
        Toggle(isOn: $columns[index].isEnabled, label: {
            Text(columns[index].isEnabled ? "YES" : "NO")
        })
    }
})
```

ただこれ、個人的にはイテレータを使ってアクセスするのって`ForEach`の良さを全部殺してる感じがしてあんまり好きじゃないんですよね。

しかし、どうも現状はこれ以外の解決方法はなさそうな感じです。
