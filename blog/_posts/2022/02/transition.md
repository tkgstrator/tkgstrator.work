---
title: SwiftUIのTransitionでProgressView
date: 2022-01-13
category: プログラミング
tags:
  - Swift
  - SwiftUI
---

## ローディング画面を出したい

```swift
Color.black
    .opacity(0.5)
    .edgesIgnoringSafeArea(.all)
    .overlay(ProgressView()
        .scaleEffect(x: 2, y: 2, anchor: .center)
        .progressViewStyle(CircularProgressViewStyle(tint: .white))
    )
```
