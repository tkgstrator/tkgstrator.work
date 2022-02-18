---
title: シード変更を圧倒的に便利にする、Ocean Modifierの開発に関わった件
date: 2022-02-19
categoriy: プログラミング
tags:
  - Splatoon2
  - Hack
---

## Ocean Modifier

Ocean Modifier とはサーモンランにおけるゲームシードをゲームの再起動なしに固定化するためのツールのこと。

シード固定自体はかなり前からできていたのですが、IPSwitch でパッチをあてる以上、どうしてもシードを変えるたびにゲームの再起動が必要で、そのたびにホストが部屋を崩さなければならず不便な点もありました。

で、この状況をなんとかしたいなあと思っていたのですが、Edizon のような仕組みを使えばできそうだということまではわかっていました。

なのになんで開発がこんなに遅れたのか、単にやる気が無かったからですね、はい。

### 開発が進んだ

ぼくはずっとやる気がないままだったのですが、なんかできそうだということで@container12345 氏が開発に着手してくれました。

![](https://pbs.twimg.com/media/FLffqgvaIAAOsGB?format=jpg&name=large)

その結果、シードの入力がちょっとめんどくさいものの、任意のシードを設定して遊ぶことができるオーバーレイが完成しました。

オーバーレイなのでゲームの再起動なしに任意の値をシードとして固定できるわけで、これだけでもかなり便利になりました。

で、オーバーレイが表示できて、かつ任意のコードが実行できるならということでぼくも開発を手伝うことにしました。

### 開発を手伝った理由

ぼくがこの仕組みがいいなと思ったのは、C++で書いた任意のコードを実行してシードを設定することができる、という点です。

つまり、満潮しかこないけど、その満潮の内容はわからず毎回違う湧きになる、ということができてしまうということです。

今までのシード固定では一度やると毎回同じ湧きになってしまうので、飽き、のようなものがあったのですが、これが実現できるなら毎回シードを変更できるので飽きとは無縁になります。

問題は潮位とイベントからシードを逆計算するアルゴリズムは開発が難しいので、シードから潮位とイベントを計算して、求めている条件の場合にセットする、という処理が必要になります。全部満潮だけでいいなら 200 回も計算すれば見つかるので問題ないのですが、レアなイベントと潮位の組み合わせだと現実的な時間内に終わらない可能性があります。

ニンテンドースイッチのスペックがどの程度かわからないのですが、このあたりとは折り合いを付ける必要がありそうです。

## アルゴリズム

イベントと潮位のアルゴリズムはわかっているので、今回は毎回「条件に合致する違うシード」をどうやって選ぶかというアルゴリズムを考えれば良いです。

```cpp
// Search target seed
u32 SeedSearch::search_target_seed()
{
    u32 target_wave = get_target_wave();
    for (u32 loop = 0; loop < 0x10000; loop++)
    {
        u32 random_seed = static_cast<u32>(mt());
        if (target_wave == get_wave_info(random_seed))
            return random_seed;
    }
    return 0x00000000;
}
```

アルゴリズムは極めて単純で、インスタンス初期化時にメルセンヌ・ツイスタを UNIXTIME で初期化し、それを`0x10000`回ループさせて、条件に合致するシードが見つかったらそれを返す、見つからなかったら`0x0`を返す、というものです。

メルセンヌ・ツイスタは擬似乱数生成器として優れているので見てわかるような偏りは発生しないはずです。

問題としては 65536 回しかループしないので珍しい潮位とイベントの組み合わせだと見つからないことが結構あります。まあその時は何度も繰り返して検索すればそのうち見つかります。最も珍しい組み合わせで 100 万件に 1 件くらいなので、20 回も検索すれば多分大丈夫です、多分。

::: tip 検索の範囲について

もっと検索範囲を広くしても大丈夫なのではないか、という意見もあるかもしれない。

たしかにそうなのだが、どのくらいまで耐えられるかわからなかったので、今回はこのくらいにしてみました。
:::

## Ocean Modifier の仕様

Ocean Modifier は以下の機能を持ちます

- ゲームリージョンの判定
  - バージョン判定も入れたいけどやり方わからん
- シード検索(一度に 65536 回検索)
  - 検索条件の保存
  - 同じ条件で何度も検索したいときに便利です
- シード固定
  - 検索でヒットしたシードをメモリに書き込みます
- シードランダム化
  - 通常状態に戻します

![](https://pbs.twimg.com/media/FL6WDHMVcAA2T2F?format=jpg&name=large)

たったこれだけの機能なのに開発するのに三日位かかりました。さすが C++、全然わからん。

![](https://pbs.twimg.com/media/FL6WDI9VQAIcvxx?format=jpg&name=large)

シード検索は割と直感的に選べるようになっていると思います。

### 苦労したところ

`std::ofstream`でファイル読み込みしようとすると必ず毎回失敗してこれで七時間くらいかかりました。

```cpp
tsl::hlp::doWithSDCardHandle([&]()
                             {
    std::ofstream ofs(CONFIG_FILE, std::ofstream::out | std::ofstream::trunc);
    nlohmann::json j = config;
    std::string jsonString = j.dump(4);
    ofs << jsonString << std::endl; });
```

結論から言えばこんな感じで`tsl::hlp::doWithSDCardHandle()`の完了ハンドラ内でないとアクセスできませんでした。

ただし、C っぽく直接ファイルを読み込むといけたので、単に`std::ofstream`が動かないだけです。

ちなみにその時は`Function not implemented`っていうエラーがでました。

記事は以上。