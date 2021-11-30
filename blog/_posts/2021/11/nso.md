## Session Token

Access Token 取得のための Session Token を取得します。

### リクエスト

| パラメータ |                              値                               |
| :--------: | :-----------------------------------------------------------: |
|   Method   |                             POST                              |
|    URL     | https://accounts.nintendo.com/connect/1.0.0/api/session_token |
| User-Agent |               OnlineLounge/1.11.1 NASDKAPI iOS                |

```
client_id=71b963c1b7b6d119&session_token_code=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsInN0YzpzY3AiOlswLDgsOSwxNywyM10sImp0aSI6IjM1NzQ1MTg5MTkxIiwic3RjOmMiOiJ0ejdaMGhfM2RLMTBYLTc5SlREWUUyaG5seGU1dWhYd0tsUldoQUdBb1ZZIiwic3RjOm0iOiJTMjU2Iiwic3ViIjoiNWFlOGY3YTc4YjBjY2E0ZCIsInR5cCI6InNlc3Npb25fdG9rZW5fY29kZSIsImV4cCI6MTYxOTQ3OTE0OSwiYXVkIjoiNzFiOTYzYzFiN2I2ZDExOSIsImlhdCI6MTYxOTQ3ODU0OX0.XSFscPYMGbcaLLJxBA-fIO0zzt1bWs4X39oZGOs4jrI&session_token_code_verifier=RwKTiEojlJbQInnPCHBitkNHehgICjFsstWUvOkGQibeuukvXx
```

`client_id`の値は固定値です。

JSON ではなく Form-Data で Body を送信します。

### エラー

```json
// 400
{
  "error_description": "The provided session_token_code is expired",
  "error": "invalid_request"
}
```

### レスポンス

```json
{
  "code": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsInN1YiI6IjVhZThmN2E3OGIwY2NhNGQiLCJleHAiOjE2MTk0ODIxNTUsImlhdCI6MTYxOTQ3ODU1NSwidHlwIjoiY29kZSIsImF1ZCI6IjcxYjk2M2MxYjdiNmQxMTkiLCJhYzpzY3AiOlswLDgsOSwxNywyM10sImp0aSI6IjM1NzQ1MTYxODQzIn0.vT1aaYdqHaAinY0BKGDeG2cAUqS5DOndH02keQxZXxw",
  "session_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdDpzY3AiOlswLDgsOSwxNywyM10sInN1YiI6IjVhZThmN2E3OGIwY2NhNGQiLCJleHAiOjE2ODI1NTA1NTUsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMubmludGVuZG8uY29tIiwidHlwIjoic2Vzc2lvbl90b2tlbiIsImlhdCI6MTYxOTQ3ODU1NSwiYXVkIjoiNzFiOTYzYzFiN2I2ZDExOSIsImp0aSI6IjUwNjgwMjkzODEifQ.CwI0tqAv186pEgo7HKn_q--l8fB-jmwFu6iJNNvY_W8"
}
```

## Access Token

Nintendo Switch Online のサービスに接続するための Access Token を取得します。

### リクエスト

| パラメータ |                          値                           |
| :--------: | :---------------------------------------------------: |
|   Method   |                         POST                          |
|    URL     | https://accounts.nintendo.com/connect/1.0.0/api/token |
| User-Agent |           OnlineLounge/1.11.1 NASDKAPI iOS            |

```json
{
  "client_id": "71b963c1b7b6d119",
  "session_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdDpzY3AiOlswLDgsOSwxNywyM10sInN1YiI6IjVhZThmN2E3OGIwY2NhNGQiLCJleHAiOjE2ODI1NTA1NTUsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMubmludGVuZG8uY29tIiwidHlwIjoic2Vzc2lvbl90b2tlbiIsImlhdCI6MTYxOTQ3ODU1NSwiYXVkIjoiNzFiOTYzYzFiN2I2ZDExOSIsImp0aSI6IjUwNjgwMjkzODEifQ.CwI0tqAv186pEgo7HKn_q--l8fB-jmwFu6iJNNvY_W8",
  "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"
}
```

`client_id`, `grant_type`の値は固定値です。

### エラー

```json
// 400
// セッショントークンが誤っている場合
{
    "error_description": "The provided grant is invalid",
    "error": "invalid_grant"
}

// 400
// クライアントIDが誤っている場合
{
    "error": "invalid_client",
    "error_description": "Client authentication failed"
}

// 400
// フォーマットが正しくない場合
{
    "error_description": "The request does not satisfy the schema",
    "error": "invalid_request"
}
```

### レスポンス

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg1ZTNjN2FkLTBlMTQtNDIxMi1hZTg5LTExMjIwZmM3MDMzYSIsImprdSI6Imh0dHBzOi8vYWNjb3VudHMubmludGVuZG8uY29tLzEuMC4wL2NlcnRpZmljYXRlcyJ9.eyJhdWQiOiI3MWI5NjNjMWI3YjZkMTE5Iiwic3ViIjoiNWFlOGY3YTc4YjBjY2E0ZCIsImp0aSI6IjgyYzUzM2NjLWJkNzQtNDkwOC04NjVkLTAwOWM2MGM5MWY0NiIsImFjOnNjcCI6WzAsOCw5LDE3LDIzXSwiaWF0IjoxNjE5NDc4NTU2LCJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsImFjOmdydCI6NjQsInR5cCI6InRva2VuIiwiZXhwIjoxNjE5NDc5NDU2fQ.lXFbLqUIVFegSHzFvH3aLp1HOB3iwajs107YLt0MePrcqLDvmTpu_MNewGrnpX0BAAfB79lDGt7MFmi6HKcIQxacaExP7tIHYowmHBU5eDM4VSbZJq7LP8SMftRAcvDA1-bNOr3_uFhqtXP18mDDZRYfB7lEXVbcj3sdkNPrWlyic-vHwZTQ-qwMTWPLZzYwwGjage1OfpRwwC-YrU0hpgg-DIj5yTN-eCrwkp48rsQU_MOCw5--HRW90x-LU6rjK7_CgHG3Qafz4pvuYmRzDl3WWtoSGUdZCh6wF3SKta0GzReZIIic-iog3eo21vgagWbnEWz_86iYjsF9DAnPzQ",
  "scope": ["openid", "user", "user.birthday", "user.mii", "user.screenName"],
  "token_type": "Bearer",
  "id_token": "eyJqa3UiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbS8xLjAuMC9jZXJ0aWZpY2F0ZXMiLCJraWQiOiI1ZTkwMDRlOC1mMDNiLTRjZTEtYmU2Zi1jNzdlZTM4YTA4MjEiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2MTk0Nzk0NTYsImNvdW50cnkiOiJKUCIsInR5cCI6ImlkX3Rva2VuIiwiYXRfaGFzaCI6InVHUzZvQkJRQUJEN2hWMHJOdnpiS2ciLCJpYXQiOjE2MTk0Nzg1NTYsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMubmludGVuZG8uY29tIiwic3ViIjoiNWFlOGY3YTc4YjBjY2E0ZCIsImF1ZCI6IjcxYjk2M2MxYjdiNmQxMTkiLCJqdGkiOiI0NmJjZmRiMy00MmUyLTRmM2UtYjhlYy1jY2YyYzNmNWZjNGYifQ.qy0QMaQ_QsCajYZkkuHlfRtWETFSUtxKfddtAsRT2EBTGpBxNV2p3VsKtWnNHduH5ZvFKa978sqBmTqjSzfPDJEF2T4JciuXvlQL73zlSPN2GxmI65K030nyvGYebd_d7XRBEEtTKGTWuhHmkk_nglToBlKWr0QG23dWGTA2phJUUU2BKiB44Gdbcq4Fopdtu9wqhtxN2lWc_OtpdHaVlmuQfOXqNHI5ohHFp4wzjrsIUOzUTVtq3Br52c1umWoFxOxnlIHdiNz1bNGWbtY9YfJHdEe1PECyj_oB8cQgkz4DDLHHVFGYz5shtGLZ1JlewVERMQw4JzBD1SiNx1FVWw",
  "expires_in": 900
}
```

`id_token`の値は 1.10.0 現在死にステータスのためどこでも使われていません。

## User Info

Access Token からユーザ情報を取得する API です。

Splatoon Token 取得時に生年月日などを渡す必要があるため取得しますが、生年月日などは適当に設定してもリクエストは通ります。ここで取得した生年月日をそのまま使うと 13 歳以下のアカウントの iksm session が取得できなくなるため、この API を叩く意味は実はあまりありません。

### リクエスト

|  パラメータ   |                        値                        |
| :-----------: | :----------------------------------------------: |
|    Method     |                       GET                        |
|      URL      | https://api.accounts.nintendo.com/2.0.0/users/me |
|  User-Agent   |         OnlineLounge/1.11.1 NASDKAPI iOS         |
| Authorization |                      Bearer                      |

GET リクエストなのでパラメータは存在しません。

### レスポンス

```json
{
  "emailOptedIn": false,
  "analyticsPermissions": {
    "targetMarketing": {
      "updatedAt": 1595545468,
      "permitted": true
    },
    "internalAnalysis": {
      "permitted": true,
      "updatedAt": 1595545468
    }
  },
  "analyticsOptedIn": true,
  "emailOptedInUpdatedAt": 1572596527,
  "gender": "female",
  "nickname": "Salmonia",
  "screenName": "sa•••@g•••• / sal•••",
  "id": "5ae8f7a78b0cca4d",
  "analyticsOptedInUpdatedAt": 1595545468,
  "clientFriendsOptedInUpdatedAt": 1572596527,
  "region": null,
  "language": "en-US",
  "clientFriendsOptedIn": true,
  "country": "JP",
  "birthday": "1996-09-01",
  "eachEmailOptedIn": {
    "deals": {
      "optedIn": false,
      "updatedAt": 1572596527
    },
    "survey": {
      "updatedAt": 1572596527,
      "optedIn": false
    }
  },
  "candidateMiis": [],
  "createdAt": 1572596527,
  "updatedAt": 1612832536,
  "timezone": {
    "utcOffset": "+09:00",
    "name": "Asia/Tokyo",
    "id": "Asia/Tokyo",
    "utcOffsetSeconds": 32400
  },
  "emailVerified": true,
  "isChild": false,
  "mii": null
}
```

## Splatoon Token

Splatoon 用の Session Token を発行します。パラメータに f が必要なため s2s API と flapg API を使って f の値を計算する必要があります。

ここではまだ Bearer の値がないため、空文字を指定して大丈夫です。

### リクエスト

|    パラメータ    |                          値                           |
| :--------------: | :---------------------------------------------------: |
|      Method      |                         POST                          |
|       URL        | https://api-lp1.znc.srv.nintendo.net/v1/Account/Login |
| X-ProductVersion |                        1.11.1                         |
|    X-Platform    |                          iOS                          |
|  Authorization   |                        Bearer                         |

```json
{
  "parameter": {
    "naIdToken": "eyJqa3UiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbS8xLjAuMC9jZXJ0aWZpY2F0ZXMiLCJraWQiOiI1ZTkwMDRlOC1mMDNiLTRjZTEtYmU2Zi1jNzdlZTM4YTA4MjEiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2MTk0Nzk0NTYsImNvdW50cnkiOiJKUCIsInR5cCI6ImlkX3Rva2VuIiwiYXRfaGFzaCI6InVHUzZvQkJRQUJEN2hWMHJOdnpiS2ciLCJpYXQiOjE2MTk0Nzg1NTYsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMubmludGVuZG8uY29tIiwic3ViIjoiNWFlOGY3YTc4YjBjY2E0ZCIsImF1ZCI6IjcxYjk2M2MxYjdiNmQxMTkiLCJqdGkiOiI0NmJjZmRiMy00MmUyLTRmM2UtYjhlYy1jY2YyYzNmNWZjNGYifQ.qy0QMaQ_QsCajYZkkuHlfRtWETFSUtxKfddtAsRT2EBTGpBxNV2p3VsKtWnNHduH5ZvFKa978sqBmTqjSzfPDJEF2T4JciuXvlQL73zlSPN2GxmI65K030nyvGYebd_d7XRBEEtTKGTWuhHmkk_nglToBlKWr0QG23dWGTA2phJUUU2BKiB44Gdbcq4Fopdtu9wqhtxN2lWc_OtpdHaVlmuQfOXqNHI5ohHFp4wzjrsIUOzUTVtq3Br52c1umWoFxOxnlIHdiNz1bNGWbtY9YfJHdEe1PECyj_oB8cQgkz4DDLHHVFGYz5shtGLZ1JlewVERMQw4JzBD1SiNx1FVWw",
    "naCountry": "JP",
    "naBirthday": "1996-09-01",
    "language": "en-GB",
    "requestId": "931570c6-dc94-4110-85d0-9f76f91984a1",
    "timestamp": 1619478557344,
    "f": "988df33f859e1b43981f72cc9cfb0d265236675ef8402fe9b7633eb1f63c73da5894ad48c8bc2f29"
  }
}
```

### エラー

```json
// 200
// Headerのフォーマットが正しくない
// ステータスコードは200なのに実質中身が400エラーなので注意
{
    "errorMessage": "Bad request.",
    "status": 9400,
    "correlationId": "56913522-00755d2d"
}

// 200
// X-ProductVersionが低い
{
    "correlationId": "b0f908ec-8363cb18",
    "errorMessage": "Upgrade required.",
    "status": 9427
}

// 200
// naIdTokenの有効期限切れ
{
    "status": 9403,
    "errorMessage": "Invalid token.",
    "correlationId": "33f960d7-324c66c2"
}
```

### レスポンス

```json
{
  "result": {
    "webApiServerCredential": {
      "expiresIn": 7200,
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQ3MzczNjA4MzEzODE1MDQsImV4cCI6MTYxOTQ4NTc1OCwiYXVkIjoiZjQxN2UxdGlianFkOTFjaDk5dTQ5aXd6NXNuOWNoeTMiLCJ0eXAiOiJpZF90b2tlbiIsImlhdCI6MTYxOTQ3ODU1OCwibWVtYmVyc2hpcCI6eyJhY3RpdmUiOnRydWV9LCJpc3MiOiJhcGktbHAxLnpuYy5zcnYubmludGVuZG8ubmV0In0.tjMhqXiaiO4keh5x17xJ1NKMxXw97wZ9xaJGYYOuB2U"
    },
    "user": {
      "membership": {
        "active": true
      },
      "id": 4737360831381504,
      "name": "まゆしぃのかみ",
      "supportId": "0457-8405-4211-3149-1927-5",
      "imageUri": "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/6d55aa14478fbb82"
    },
    "firebaseCredential": {
      "expiresIn": 3600,
      "accessToken": ""
    }
  },
  "status": 0,
  "correlationId": "22bf5c73-fc96deb5"
}
```

## Splatoon Access Token

Splatoon 用の Access Token を発行します。パラメータに f が必要なため s2s API と flapg API を使って f の値を計算する必要があります。

Bearer には Splatoon Token を指定する必要があります。

### リクエスト

|    パラメータ    |                               値                                |
| :--------------: | :-------------------------------------------------------------: |
|      Method      |                              POST                               |
|       URL        | https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken |
| X-ProductVersion |                             1.11.1                              |
|    X-Platform    |                               iOS                               |
|  Authorization   |                             Bearer                              |

```json
{
  "parameter": {
    "id": 5741031244955648,
    "registrationToken": "dd_wZbi4tFE:APA91bHnZVq2oP1KULwaeiBVnMjjbbohkwvbs12KpVHZEQKGoA0IroonA90HedfESD3YPntWakLsL-s6Zs6fDQTzQEO7ERQ9hH_pOAA-1q5wEHjysEribushAVv6_qpTwMyqgJ5sgcpQ",
    "requestId": "051d0912-db3a-4ef2-bc84-bace0e53b00f",
    "timestamp": 1619478597466,
    "f": "46ae976cfce20def44f93dfd4a6f15df2e566809000bda3c03961ecb45ab3d4e2acc122b91e552209372cc527e64f7"
  }
}
```

### レスポンス

```json
{
  "status": 0,
  "result": {
    "expiresIn": 7200,
    "accessToken": "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL2FwaS1scDEuem5jLnNydi5uaW50ZW5kby5uZXQvdjEvV2ViU2VydmljZS9DZXJ0aWZpY2F0ZS9MaXN0IiwiYWxnIjoiUlMyNTYiLCJraWQiOiJFT3FCRV83dUxpVEFaUFJCc0hfYXpqazJ2bU0ifQ.eyJ0eXAiOiJpZF90b2tlbiIsImlhdCI6MTYxOTQ3ODU5OCwiZXhwIjoxNjE5NDg1Nzk4LCJhdWQiOiI1dm8yaTJrbXp4NnBzMWwxdmpzamduanM5OXltemN3MCIsImlzcyI6ImFwaS1scDEuem5jLnNydi5uaW50ZW5kby5uZXQiLCJtZW1iZXJzaGlwIjp7ImFjdGl2ZSI6dHJ1ZX0sImxpbmtzIjp7Im5ldHdvcmtTZXJ2aWNlQWNjb3VudCI6eyJpZCI6IjNmODljMzc5MWM0M2VhNTcifX0sInN1YiI6NDczNzM2MDgzMTM4MTUwNCwianRpIjoiMzEyYjAzYWEtYzliNy00YzBmLTg3YzktNzhhNTU3NzAwMmI4In0.U-EIVuza_6L6e7hZDyzvgdYrMnl5fr5DF0iDdVPCk9-MMibE2RtLYomTiCqVSPSMVV8lJqdxviZiOrilJEPn-kWr1Nk9ThAlh-pFngzwxKu8AJxkiTnYnuTOOV8GWrV3ceU6s3eGW-SNQiZPvkb-MXTc4RQln1wxtdL2nkQ6Pgp8Azar33FR-vjI7Zrbht6oGBc7t5eG7YXXaw02DAbsVwt7pb3etkfJUkZ37-_RZz1TLliUVfrocor3TuA9mV141P3r0Wk-pEiaTErJSH14jKyiTdE3iwYFgERNXLn9mgFHDjstv-TtkaoIYXbFLXx6j6iIbLrZGDDyrne9gA4m9g"
  },
  "correlationId": "00e40134-b137d243"
}
```

### エラー

```json
// 200
{
    "status": 9400,
    "correlationId": "02094d49-a2f6b0f1",
    "errorMessage": "Bad request."
}

// 200
// Splatoon Tokenが有効期限切れ
{
    "status": 9404,
    "errorMessage": "Token expired.",
    "correlationId": "0f217900-92b9041b"
}

// 200
// Bearer Tokenがセットされていない
{
    "correlationId": "b7b6ca68-a4f79aaf",
    "status": 9406,
    "errorMessage": "Unauthorized."
}

// 200
// X-ProductVersionが低い
{
    "correlationId": "b0f908ec-8363cb18",
    "errorMessage": "Upgrade required.",
    "status": 9427
}
```

## API

```json
// 403
{
    "message": "api_error_authentication_error",
    "code": "AUTHENTICATION_ERROR"
}

// 403
Forbidden
```
