---
title: AlamofireのAdvancedUsageについて
date: 2021-12-20
categoriy: プログラミング
tags:
  - Swift
  - Alamofire
---

## Alamofire

### Session

`Session`のデフォルト値である`Session.default`は`AF`という`Enum`で与えられる。

なので、以下のコードは等価である。

```swift
AF.request("https://httpbin.org/get")

let session = Session.default
session.request("https://httpbin.org/get")
```

Session は様々なカスタマイズに対応している。`Session`のイニシャライザに与えられる全ての引数は以下のようになる。

```swift
public convenience init(configuration: URLSessionConfiguration = URLSessionConfiguration.af.default,
                        delegate: SessionDelegate = SessionDelegate(),
                        rootQueue: DispatchQueue = DispatchQueue(label: "org.alamofire.session.rootQueue"),
                        startRequestsImmediately: Bool = true,
                        requestQueue: DispatchQueue? = nil,
                        serializationQueue: DispatchQueue? = nil,
                        interceptor: RequestInterceptor? = nil,
                        serverTrustManager: ServerTrustManager? = nil,
                        redirectHandler: RedirectHandler? = nil,
                        cachedResponseHandler: CachedResponseHandler? = nil,
                        eventMonitors: [EventMonitor] = [])
```

#### [Configuration](https://developer.apple.com/documentation/foundation/urlsessionconfiguration)

`URLSession`のカスタマイズが可能。

例えばモバイル回線での通信を許可しないような設定にするのであれば、

```swift
let configuration = URLSessionConfiguration.af.default
configuration.allowsCellularAccess = false

let session = Session(configuration: configuration)
```

とすればよい。

> ただし、`URLSessionConfiguration`で`Authorization`や`Content-Type`を設定することは推奨されない。これらの値は`ParameterEncoder`か`RequestAdaptor`で解決すべきである。

#### [Delegate](https://alamofire.github.io/Alamofire/Classes/SessionDelegate.html)

#### StartRequestImmediately

デフォルトでは`Session`は応答ハンドラに一つ以上のリクエストが追加されると直ちに`resume()`を自動で実行してリクエストを処理しますが、`false`にすると全て手動で`resume()`を実行しなければいけないようになる。

#### Queue

デフォルトでは`Session`は全ての非同期の仕組みを一つの`DispatchQueue`で処理しているが、手動でそれぞれに`DispatchQueue`を割り当てることができる。

`rootQueue`は必ずシリアルキューでなければならないが`requestQueue`と`serializationQueue`はパラレルキューも利用可能である。

#### Interceptor

`Interceptor`は`RequestAdapter`と`RequestRetrier`が合わさったもので、リクエスト前にリクエストに手を加えたり、エラー発生してリトライ時にリトライの処理を実装することができる。

#### ServerTrustManager

サーバを信頼する証明書がどうのこうののマネージャ。使わないので今回は割愛。

#### RedirectHandler

HTTP のリダイレクトレスポンスをカスタマイズするプロトコル。これも使わないので今回は割愛。

#### CachedResponseHandler

#### EventMonitors

Alamofire の内部イベントを上手い具合に弄れる仕組み。`Delegate`に近いかなと思っているのだが、そういうわけではないらしい。

```swift
let monitor = ClosureEventMonitor()
monitor.requestDidCompleteTaskWithError = { (request, task, error) in
    debugPrint(request)
}
let session = Session(eventMonitors: [monitor])
```

## EventMonitor

使うことは稀だと思うのだが、以下のようなことができる。

### 全てのリクエストを止める

```swift
let session = ... // Some Session.
session.withAllRequests { requests in
    requests.forEach { $0.suspend() }
}
```

### 全てのリクエストをキャンセル

```swift
let session = ... // Some Session.
session.cancelAllRequests(completingOn: .main) { // completingOn uses .main by default.
    print("Cancelled all requests.")
}
```

## URLSession

```swift
let rootQueue = DispatchQueue(label: "org.alamofire.customQueue")
let queue = OperationQueue()
queue.maxConcurrentOperationCount = 1
queue.underlyingQueue = rootQueue
let delegate = SessionDelegate()
let configuration = URLSessionConfiguration.af.default
let urlSession = URLSession(configuration: configuration,
                            delegate: delegate,
                            delegateQueue: queue)
let session = Session(session: urlSession, delegate: delegate, rootQueue: rootQueue)
```