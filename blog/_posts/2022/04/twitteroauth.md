---
title: Twitter OAuth2.0 with PKCE
date: 2022-04-22
categoriy: プログラミング
tags:
  - Swift
  - Twitter
---

## Twitter OAuth2.0

いつの間にか正式公開されていた Twitter OAuth2.0 ですが、何やら認証が変わっていたので備忘録としてメモしておきます。

### 必要なもの

- V2 ACCESS
- OAuth 2.0 Client ID
- OAuth 2.0 Client Secret

![](https://pbs.twimg.com/media/FQ8ERBgaUAIaLvJ?format=jpg&name=large)

自分のアカウントは Elavated なのですが、Essential なアカウントだと何故か認証が通らなかったりしました、謎。

アプリを作成すると、OAuth 2.0 Client ID and Client Secret が表示されるのでメモしておきましょう。

なお、Client Secret が洩れるとアプリをなりすまされてしまうので誤って公開しないように注意します。

`LU8yWHVMQkZyUmFSdG1CVmYzOWg6MTpjaQ`
`TRw4ePUotRgqjo8-bm1leUCoLLSogoHyKrAZHY4S4kiFrU4c-x`

## 認証方法

- OAuth 2.0 Bearer Token
- Generating and using app-only Bearer Tokens
- OAuth 2.0 Authorization Code Flow with PKCE
- OAuth 2.0 Making requests on behalf of users

という感じで四つの認証フローがあるのですが、上二つはアプリごとの認証フローなのでこれを使うとあっという間に Rate limits に引っかかります。なのでユーザごとのアクセストークンを取得する必要があります。

### PKCE

以前から使っていたのがこの[PKCE を利用した認証フロー](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code)なのですが、これは OAuth2.0 でも有効のようです。

#### リフレッシュトークンがある場合

リフレッシュトークンがあれば以下のリクエストを送ればアクセストークンを更新できるようです。

```zsh
POST 'https://api.twitter.com/2/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'refresh_token=bWRWa3gzdnk3WHRGU1o0bmRRcTJ5VUxWX1lZTDdJSUtmaWcxbTVxdEFXcW5tOjE2MjIxNDc3NDM5MTQ6MToxOnJ0OjE' \
--data-urlencode 'grant_type=refresh_token' \
--data-urlencode 'client_id=rG9n6402A3dbUJKzXTNX4oWHJ'
```

が、最初はリフレッシュトークンを持っていないのでこれは考えても仕方がないです。

公式ドキュメントには、

> OAuth 2.0 uses a similar flow to what we are currently using for OAuth 1.0a. You can check out a diagram and detailed explanation in our documentation on this subject.

とあるので、認証方法はあんまり変わっていないっぽいです。
