---
title: Ocean Modifierを改良しよう
date: 2022-02-21
categoriy: プログラミング
tags:
  - Splatoon2
  - Hack
---

## Ocean Modifier の改良について

先日開発した Ocean Modifier なのですが、利用していていくつか問題点が見つかったので、そこを直す方法について考えたいと思います。

### 検索しようとするとクラッシュする

これは@container12345 から報告を受けたのですが、ビルドしたものをそのまま起動しようとすると OS ごとクラッシュしてしまいます。

理由は簡単で、存在しない JSON 設定ファイルを読み込もうとしていることが原因です。なので、存在しなければ作成して読み込むようにすればいいわけです。

### バージョン判定機能がない

バージョン判定機能がなくても特に困らないといえば困らないのですが、オフセットアドレスの値がバージョンごとに異なるので、対応していないバージョンのスプラトゥーンで Ocean Modifier を実行しようとすると誤ったメモリにデータを書き込むことになりクラッシュの原因になります。

そこで、バージョン判定機能をつけることにしました。

```cpp
typedef struct {
    u64 process_id;
    u64 title_id;
    DmntMemoryRegionExtents main_nso_extents;
    DmntMemoryRegionExtents heap_extents;
    DmntMemoryRegionExtents alias_extents;
    DmntMemoryRegionExtents address_space_extents;
    u8 main_nso_build_id[0x20];
} DmntCheatProcessMetadata;
```

`DmntCheatProcessMetadata`は上のような構造体ですので、`main_nso_build_id`を取得すればバージョン情報がわかることになります。

スプラトゥーンの`main_nso_build_id`を調べるのがちょっとめんどくさいですが、やってやれないことはありません。

```sh
5.5.0 1729DD426870976B4EE94A34BBCFF766
5.4.0 32A8F031861B76DF3D1080E6A52FE0B0
5.3.1 CF91518983FCB18D11B0FF1DAC22300F
5.3.0 B9D6759587833635C48E5F8AC97E872A
5.2.2 8A7F4570B0D5D94C804D7A76B1A2D36F
5.2.1 2FA49C6FAC6BEBFA629B9E054701A69E
5.2.0 DA404117DA4A7D6CB1CDB2BCD730582A
5.1.0 D3C62FCA532DB43263FC4D864DDD1E2C
5.0.1 EFCC50C2257D55E2B633A08DAD145A73
5.0.0 26D72E09076C3B11F53CC37E86960692
3.1.0 034C8FA7A63B7A87F96F408B2AEFFF6C
```

というわけでとりあえずパッと見つかったバージョンについてまとめてみました。

あとはこれらを判定できるメソッドを作成すればいいわけです。現状、Ocean Modifier はリージョン判定を enum でおこなっているので同じようにしてしまえばよいでしょう。

問題点としては`C++`は enum に文字列が利用できない点です。build id は 128bit もあるので long unsigned int 型には収まりません。なので配列を使う必要があります。
