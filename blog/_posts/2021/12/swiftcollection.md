---
title: SwiftにおけるCollection型を理解する
date: 2021-12-15
category: プログラミング
tags:
  - Swift
---

## Collection 型とは

数学で言うところの有限集合の概念。

- ユニークなデータを保存
- 順序関係がない

というのが特徴。ユニークなデータを保存というところが便利だったりするので、配列から重複を取り除きたい場合は一度`Collection`型に変換してやるといいことがある。

ただし`Collection`は各要素として`Hashable`なものしか持てないのでそこだけは注意。

## 論理演算

見たほうが早いと思うのでまずは図解から。

![](https://docs.swift.org/swift-book/_images/setVennDiagram_2x.png)

### Intersection

積集合のこと。

### SymmetricDifference

対称差のこと。

### Union

和集合のこと。

### Subtracting

補集合のこと。
