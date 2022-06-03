---
title: AlamofireのOAuthが便利そうだった
date: 2021-12-21
category: プログラミング
tags:
  - Swift
  - Alamofire
---

## Alamofire

Alamofire では 5.2 から`AuthenticationInterceptor`という機能が実装されています。

よく似た機能で`RequestInterceptor`っていうのがありました。それについてはちょろっと記事にしたと思うのですが、何がどう違うの比べてみましょう。

### RequestInterceptor との比較

`RequestInterceptor`では`retry`と`adapt`の二つのメソッドを書く必要がありましたが、`AuthenticationInterceptor`では四つのメソッドが必要になります。

|            |   AuthenticationInterceptor    |       RequestInterceptor       |
| :--------: | :----------------------------: | :----------------------------: |
|   retry    |               -                | エラー時にトークンを再生成する |
|   adapt    |               -                |  ヘッダーに認証情報を追加する  |
|   apply    |  ヘッダーに認証情報を追加する  |               -                |
|  refresh   |      トークンを再生成する      |               -                |
| didRequest | どこで使われるかよくわからない |               -                |
| isRequest  | どこで使われるかよくわからない |               -                |

主な違いは上のような感じです。

`AuthenticationInterceptor`ではリクエストの有効期限の情報を持っておき、有効期限が切れているならリクエストを送る前にトークンを再生成してリクエストを行います。エラーが返ってくるのを待たずにトークンをリフレッシュできるのでこちらのほうがちょっと賢い気はしますね。

## 実装方法

```swift
struct OAuthCredential: AuthenticationCredential {
    let accessToken: String
    let refreshToken: String
    let expiration: Date

    // 有効期限から五分以内の場合、リフレッシュを要求する
    var requiresRefresh: Bool { Date(timeIntervalSinceNow: 60 * 5) > expiration }
}
```

上のようなクレデンシャル情報を持つ構造体を定義します。

上のコードだと現在時刻に 300 秒を足した日付がクレデンシャルの有効期限より後だった場合にはリフレッシュが必要だと判断して更新するという処理を行います。つまり、切れる 300 秒前なら予め更新しておくということになりますね。

```swift
internal class OAuthAuthenticator: Authenticator {
    /// リクエスト前にヘッダーに情報を追加
    func apply(
        _ credential: OAuthCredential,
        to urlRequest: inout URLRequest
    ) {
        urlRequest.headers.add(HTTPHeader(name: "cookie", value: "iksm_session=\(credential.iksmSession)"))
    }
    /// クレデンシャルをアップデート
    func refresh(
        _ credential: OAuthCredential,
        for session: Session,
        completion: @escaping (Swift.Result<OAuthCredential, Error>) -> Void
    ) {
        completion(.success(credential))
        return
    }
    /// いつ呼ばれるのかわからん
    func didRequest(
        _ urlRequest: URLRequest,
        with response: HTTPURLResponse,
        failDueToAuthenticationError error: Error
    ) -> Bool {
        response.statusCode == 403
    }
    /// いつ呼ばれるのかわからん
    func isRequest(
        _ urlRequest: URLRequest,
        authenticatedWith credential: OAuthCredential
    ) -> Bool {
        false
    }
}
```

あとはこれを適当なタイミングで呼び出します。

### 呼び出し方

`RequestType: URLRequestConvertible`と`ResponseType: Codable`を適当に定義しておきます。

::: tip Codable にする意味

Codable にしておけば JSON で受け取ったデータを何の手間もなしに構造体に変換できるので必ず利用すること。SwiftyJSON を今更使うのはナシ。
:::

そして以下のようにコードを書きます。

```swift
func publish(request: RequestType) -> AnyPublisher<ResponseType, AFError> {
    let credential = OAuthCredential(
        accessToken: "",
        refreshToken: "",
        expiresIn: Date(timeIntervalSinceNow: 60 * 60)
        )

    let authenticator = OAuthAuthenticator()
    let interceptor = AuthenticationInterceptor(
        authenticator: authenticator,
        credential: credential
        )

    return AF.request(request, interceptor: interceptor)
        .validate()
        .publishDecodable(type: ResponseType.self)
        .value()
}
```

リクエストを送るのを管轄するようなクラスがある場合には、新たに`OAUthAutenticator`クラスを定義せずに、そのクラスを`OAuthAuthenticator`に適合させてやるほうが賢いです。

## 実践的な利用方法

以下のような感じでクラスを定義するのが賢いと思われる。

```swift
class NetworkManager {
    /// 認証情報: イニシャライザで初期化する
    let credential: OAuthCredential
    /// Interceptor: Computed Propertyでいつでも呼び出せるようにする
    let interceptor: AuthenticationInterceptor {
        AuthenticationInterceptor(authenticator: self,
        credential: credential
        )
    }

    init() {
        self.credential = OAuthCredential() // 認証情報インスタンスを作成
    }

    func class publish<T: RequestType>(request: T) -> AnyPublisher<T.ResponseType, AFError> {
        AF.request(request, interceptor: interceptor)
            .validate()
            .publishDecodable(type: ResponseType.self)
            .value()
    }
}

extension NetworkManager: OAuthAuthenticator {
    func apply(
        _ credential: OAuthCredential,
        to urlRequest: inout URLRequest
    ) {
        urlRequest.headers.add(HTTPHeader(name: "cookie", value: "iksm_session=\(credential.iksmSession)"))
    }

    func refresh(
        _ credential: OAuthCredential,
        for session: Session,
        completion: @escaping (Swift.Result<OAuthCredential, Error>) -> Void
    ) {
        completion(.success(credential))
        return
    }

    func didRequest(
        _ urlRequest: URLRequest,
        with response: HTTPURLResponse,
        failDueToAuthenticationError error: Error
    ) -> Bool {
        response.statusCode == 403
    }

    func isRequest(
        _ urlRequest: URLRequest,
        authenticatedWith credential: OAuthCredential
    ) -> Bool {
        false
    }
}
```
