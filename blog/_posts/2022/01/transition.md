---
title: SwiftUIのTransitionでProgressView
date: 2022-01-13
categoriy: プログラミング
tags:
  - Swift
  - SwiftUI
---

##

```swift
Color.black
    .opacity(0.5)
    .edgesIgnoringSafeArea(.all)
    .overlay(ProgressView()
        .scaleEffect(x: 2, y: 2, anchor: .center)
        .progressViewStyle(CircularProgressViewStyle(tint: .white))
    )
```
