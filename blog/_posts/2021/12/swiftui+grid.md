---
title: SwiftUIのGridの使い方
date: 2021-12-23
categoriy: プログラミング
tags:
  - Swift
  - SwiftUI
---

## LazyVGrid

SwiftUI には`LazyVGrid`と`LazyHGrid`の UIKit でいうところの`CollectionView`と同様の働きをするコンポーネントがある。

で、これの使い方をしょっちゅう忘れてしまうので備忘録として残しておくことにする。

## イニシャライザから学ぶ

LazyVGrid でイニシャライザを呼ぶと以下のようなパラメータがある。

```swift
LazyVGrid(columns: COLUMNS, alignment: ALIGNMENT, spacing: SPACING, pinnedViews: PINNEDVIEWS, content: {
})
```

- COLUMNS
  - 横に埋めるコンポーネントのパラメータを定義する
- ALIGNMENT
  - 要素をどの方向から埋めていくかを指定する
  - `.leading`, `.center`, `.trailing`から選択可能
- SPACING
  - 行間のサイズを指定する
- PINNEDVIEWS
  - 一番上に常に表示しておく View を指定できる
  - `.sectionHeader`か`.sectionFooter`またはその両方

::: tip Spacing について

`spacing`は実は各コンポーネント間の間隔ではなく、行の間隔(なので`LazyVGrid`の場合は縦)を指定する。

なので、隙間なくタイルのように敷き詰めたい場合はこちらを 0 にするだけではダメ。

:::

で、一番大事になってくるのは`COLUMNS`なので今回はそれについて解説する。

### Columns の定義方法

一般的には`Array`のイニシャライザを利用したものが使われることが多い。

```swift
Array(repeating: .init(SIZE, spacing: SPACING, alignment: ALIGNMENT), count: COUNT)
```

- SIZE
  - そのままの意味で横幅のサイズを決める
  - 固定値の`.fixed()`, 最大まで大きくする`.adaptive()`, 可変サイズの`.flexible()`がある
- SPACING
  - 各コンポーネント間の間隔を指定する

::: tip Spacing

こちらで使う`spacing`は各コンポーネント間の間隔なので、タイルのように敷き詰めたい場合はこちらも 0 にすること。

:::

### 長方形を敷き詰めてみる

```swift
struct TileView: View {
    var body: some View {
        LazyVGrid(columns: Array(repeating: .init(.flexible(), spacing: 0), count: 4), spacing: 0, content: {
            ForEach(Range(0 ..< 19)) { _ in
                Rectangle()
                    .stroke(Color.secondary, lineWidth: 3)
                    .aspectRatio(16/9, contentMode: .fill)
            }
        })
    }
}
```
