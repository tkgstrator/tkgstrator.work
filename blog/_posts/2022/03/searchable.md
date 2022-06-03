---
title: SwiftUIのSearchableを理解せよ
date: 2022-03-25
category: プログラミング
tags:
  - SwiftUI
  - Swift
---

## SwiftUI3.0 から実装された Searchable

SwiftUI は肝心な機能がなかったりでうーんとなる場面も多かったのですが、SwiftUI3.0 でそれがいくらか改善されています。

例えば、今まではリストを検索するみたいな機能もなかったのですが、それが`Searchable`という機能として実装されています。

詳しくは[公式ドキュメント](<https://developer.apple.com/documentation/swiftui/emptyview/searchable(text:placement:)>)を読んでもらうとして、これがどのように利用可能であるかを調べてみることにしました。

### 利用できるプロパティ

利用できるプロパティは三つです。

- text
  - 検索されるテキスト
  - View 内で変更されるので`@State`または`@Published`が必須
- placement
  - どこに検索バーを置くか
- prompt
  - placeholder のこと

#### SearchFieldPlacement

次の四つが利用できます。

- automatic
- navigationbarDrawer
  - .navigationBarDrawer(displayMode: .always)
  - .navigationBarDrawer(displayMode: .automatic)
- sidebar
- toolbar

ちなみに、公式ドキュメントによると、

- `static let automatic: SearchFieldPlacement`
  > The search field is placed automatically depending on the platform.
- `static let navigationBarDrawer: SearchFieldPlacement`
  > The search field is placed in an drawer of the navigation bar.
- `static let sidebar: SearchFieldPlacement`
  > The search field is placed in the sidebar of a navigation view.
- `static let toolbar: SearchFieldPlacement`
  > The search field is placed in the toolbar.

となっているんですが、iOS で実行してみたところ全部同じ挙動になりました。iPadOS でも同じだったのでこれもうどういうことなんじゃろ。
