---
title: Swift+Moya+Alamofire
date: 2021-11-01
category: プログラミング
tags:
  - Swift
---

# [Moya](https://github.com/Moya/Moya)

Alamofire をとっつきやすくしたようなライブラリで、15.0.0 から`Combine`にも対応しているということで利用してみることにしました。

まずはこれを利用して既存の Splatnet2 ライブラリを Alamofire 依存のコードから Moya ベースのコードに書き直します。

## SPM に Moya を追加

今回利用したいのは Combine と連携できるようになった`CombineMoya`なのでそれを Package.swift に記述する。

ちなみに`SplatNet2`ライブラリでは以下のようにして読み込んでいる。`target`のところで別途`product`として追加しなければいけないことに注意しよう。

```json
// swift-tools-version:5.3
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SplatNet2",
    defaultLocalization: "en",
    platforms:  [
        .iOS(.v14), .macOS(.v10_15)
    ],
    products: [
        // Products define the executables and libraries a package produces, and make them visible to other packages.
        .library(
            name: "SplatNet2",
            targets: ["SplatNet2"]),
    ],
    dependencies: [
        // Dependencies declare other packages that this package depends on.
        .package(url: "https://github.com/groue/CombineExpectations.git", from: "0.7.0"),
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.2"),
        .package(url: "https://github.com/stleamist/BetterSafariView.git", from: "2.4.0"),
        .package(url: "https://github.com/Moya/Moya.git", .upToNextMajor(from: "15.0.0")),
    ],
    targets: [
        // Targets are the basic building blocks of a package. A target can define a module or a test suite.
        // Targets can depend on other targets in this package, and on products in packages this package depends on.
        .target(
            name: "SplatNet2",
            dependencies: [
                "KeychainAccess",
                "BetterSafariView",
                .product(name: "CombineMoya", package: "Moya")
            ],
            resources: [.copy("Resources/coop.json"), .copy("Resources/icon.png")]
        ),
        .testTarget(
            name: "SplatNet2Tests",
            dependencies: ["SplatNet2", "CombineExpectations", "KeychainAccess"],
            resources: [.copy("Resources/config.json")]
        )
    ]
)
```

## リクエストクラス

Alamofire の場合は以下のような`RequestType`のプロトコルを利用していました。

```swift
public protocol RequestType: URLRequestConvertible {

    associatedtype ResponseType: Codable
    var method: HTTPMethod { get }
    var parameters: Parameters? { get }
    var path: String { get }
    var headers: [String: String]? { get set }
    var baseURL: URL { get }
    var encoding: ParameterEncoding { get }
}

extension RequestType {

    public var encoding: ParameterEncoding {
        JSONEncoding.default
    }

    public func asURLRequest() throws -> URLRequest {
        var request = URLRequest(url: URL(string: baseURL.appendingPathComponent(path).absoluteString.removingPercentEncoding!)!)
        request.httpMethod = method.rawValue
        request.allHTTPHeaderFields = headers
        request.timeoutInterval = TimeInterval(5)

        if let params = parameters {
            request = try encoding.encode(request, with: params)
        }
        return request
    }
}
```

これを Moya を使って手直ししたいと思います。

また、これらはプロトコルで定義していたのですがエンドポイントの数が知れている場合は`Enum`で定義してしまうのもアリのようだ。
