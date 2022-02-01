---
title: GoogleMobileAdsをiOSアプリに組み込む
date: 2022-02-01
categoriy: プログラミング
tags:
  - SwiftUI
  - Swift
---

## GoogleMobileAds

## 必要なもの

- Admob アカウント(一人一つしか持てないので注意)
- SPM 対応の[GoogleMobileAds](https://github.com/quanghits/GoogleMobileAds)

### 広告ユニットの作成

広告ユニットを作成すると二つの ID が生成されます。

```swift
// 共通ID [Info.plist]
ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
// ユニットID [View]
ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
```

一方がそのアプリで唯一の ID で、もう一方はユニット ID です。ここでは仮に共通 ID、ユニット ID と呼ぶことにします。

共通 ID は`Info.plist`に書き込みますが、`Info.plist`は記述がいっぱいあるのでまとめておきましょう。

## コード

ここからは実際に Xcode 上で作業をしていきます。

### Other Linker Flags

`TARGETS` -> `Build Settings` -> `Other Linker Flags`に`-Objc`と書かなければいけないと書いてあるドキュメントがありますが、自分の場合は何故か不要でした、何故なのかはわからないです。

### Info.plist

`Info.plist`には共通 ID を書き込みます。

|                 Key                  |  Type   |                 Value                  |
| :----------------------------------: | :-----: | :------------------------------------: |
| Privacy - Tracking Usage Description | String  |     NSUserTrackingUsageDescription     |
|       GADApplicationIdentifier       | String  | ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY |
|          GADIsAdManagerApp           | Boolean |                   1                    |
|           SKAdNetworkItems           |  Array  |                                        |

公式ドキュメントにも書いていないのですが、`GADIsAdManagerApp`を書き込まないとアプリがクラッシュします。

`SKAdNetworkIdentifier`は iOS14 以降で IDFA を利用する場合にユーザ許可が必要になったのでこれで対応しないといけません。

`Privacy - Tracking Usage Description`は IDFA のダイアログが表示されたときのメッセージの内容です。今回は適当に`NSUserTrackingUsageDescription`としていますが、これは後述する複数言語に対応する場合のための書き方です。日本語だけしか対応する予定がないなら、ここの値は決め打ちでも構いません。

`SKAdNetworkItems`には次の値を書き込みます。

```plist
<key>SKAdNetworkItems</key>
  <array>
    <dict>
      <key>SKAdNetworkIdentifier</key>
      <string>cstr6suwn9.skadnetwork</string>
    </dict>
  </array>
```

### View の作成

GoogleMobileAds は SwiftUI に直接対応していないので、`UIViewControllerRepresentable`を使って SwiftUI でも使えるようにします。

```swift
import SwiftUI
import GoogleMobileAds

internal struct UIGoogleMobileAds: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        GADMobileAds.sharedInstance().start(completionHandler: nil)

        let view = GADBannerView(adSize: GADAdSizeBanner)
        let viewController = UIViewController()
        #if DEBUG
        // 自分のユニットID
        view.adUnitID = ""
        #else
        // テスト用のユニットID
        view.adUnitID = "ca-app-pub-7107468397673752/9251240303"
        #endif
        view.rootViewController = viewController
        viewController.view.addSubview(view)
        viewController.view.frame = CGRect(origin: .zero, size: GADAdSizeBanner.size)
        view.load(GADRequest())
        return viewController
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct GoogleMobileAds: View {
    var body: some View {
        UIGoogleMobileAdsView()
            .frame(width: 320, height: 50)
    }
}
```

自分で自分の広告を表示させたりクリックしたりすると不正なトラフィックとして最悪、BAN されてしまうのでデバッグビルドではテスト用の広告を表示させるようにしましょう。

### IDFA のダイアログ

最後に、IDFA の許可を求めるダイアログが表示されるようにします。

これをしないと審査で「どこでダイアログでてるの」とツッコまれます。

```swift
import SwiftUI
import Firebase
import AppTrackingTransparency
import GoogleMobileAds

@main
struct SampleApp: App {
    // AppDelegateを追加
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class SceneDelegate: NSObject, UIWindowSceneDelegate {
    func sceneDidBecomeActive(_ scene: UIScene) {
        /// IDFA対応の広告表示
        DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: {
            if #available(iOS 14.5, *) {
                ATTrackingManager.requestTrackingAuthorization(completionHandler: { status in
                    GADMobileAds.sharedInstance().start(completionHandler: nil)
                })
            } else{
                GADMobileAds.sharedInstance().start(completionHandler: nil)
            }
        })
    }
}

class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Firebaseの初期化
        FirebaseApp.configure()
        return true
    }

    func applicationDidFinishLaunching(_ application: UIApplication) {
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        let sceneConfig = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)
        sceneConfig.delegateClass = SceneDelegate.self
        return sceneConfig
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
}
```

iOS14?だと起動直後にダイアログを出そうとするとでてこなくて困ってしまうので、`sceneDidBecomeActive`が呼ばれてからダイアログを表示するようにします。

こうすることで、初回起動時の最初の一回だけこのダイアログが表示されます。

許可した場合には IDFA を利用した広告、そうでない場合は Apple が指定した広告が表示されます。

記事は以上。
