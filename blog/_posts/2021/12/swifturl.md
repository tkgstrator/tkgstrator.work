---
title: よく使うURLのExtensionまとめ
date: 2021-12-06
category: プログラミング
tags:
  - Swift
---

## URL + Extension

Swift の URL の定義はいろいろ抜けているところがある。本記事はあれってどうやるんだっけという Swift の URL の抜けているところを補うことを目的としたものである。

### URL

URL は String からインスタンスを生成することが多いと思うのだが、URL に変換不可能な文字列が存在するせいで`Optional<URL>`を返す。そのせいでいちいちオプショナルを外さなければならないので、定数値で確実初期化が成功するとわかっている場合にはアンラップしてしまうのが良い。

ただし、あちこちでアンラップしていると万が一クラッシュしたときにわけがわからなくなるので、アンラップしたイニシャライザを定義してそれを使い回すと良い。

```swift
extension URL {
    public init(unsafeString: String) {
        // swiftlint:disable:next force_unwrapping
        self.init(string: unsafeString)!
    }
}
```

### URLEncoding

URL エンコードした文字列が欲しい場合があるが、URL エンコードは String に対してしか有効でない。

OAuth の署名を作成するときなどは URL 自体を URL エンコードしないといけない場合があるので、覚えておくと良いかも知れない。

```swift
extension URL {
    func percentEncodedString(with: CharacterSet) -> String {
        // swiftlint:disable:next force_unwrapping
        self.absoluteString.addingPercentEncoding(withAllowedCharacters: with)!
    }
}
```

### QueryParameters

GET リクエストなどでクエリにパラメータを埋め込む場合に使える。

辞書を`URLQueryItem`に変換して`URLComponents`に追加してからその URL だけを返す。

URLQueryItem は自動で URL エンコードされるので安全である。

```swift
extension URL {
    /// URLにクエリパラメータを追加する
    func appendQueryParameters(_ parameters: [String: Any]) -> URL {
        var components = URLComponents(url: self, resolvingAgainstBaseURL: true)
        components?.queryItems = parameters.compactMap { URLQueryItem(name: $0.key, value: $0.value as? String) }
        // swiftlint:disable:next force_unwrapping
        return components!.url!
    }
}
```

Alamofire を利用している場合はもっと簡単に`parameters`に辞書を設定し、`encoding`として`URLEncoding.queryString`を指定すれば良い。そうすればリクエスト前に自動的にクエリパラメータがリクエスト URL に追加される。

逆に`URLQueryItems`から`Dictionary`が欲しい場合もあると思うので書いておく。

```swift
extension URL {
    /// クエリパラメータをDictionaryに変換する
    func asDictionary() -> [String: Any] {
        guard let queryItems = URLComponents(string: self.absoluteString)?.queryItems else {
            return [:]
        }
        return queryItems.reduce(into: [String: Any]()) { dict, queryItem in
            dict[queryItem.name] = value
        }
    }
}
```
