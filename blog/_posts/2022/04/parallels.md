---
title: M1 Pro+Windows11
date: 2022-04-08
category: プログラミング
tags:
  - Windows
  - macOS
---

## M1 + Windows

ご存じの方もいるかも知れないが、M1 Mac は x86_64 ではないので Windows を動作させることができません。よって、Bootcamp のようなネイティブで Windows を動かす仕組みも、現在 macOS には実装されていません。

じゃあ Windows が動かせないのかというとそういうわけではなく、ARM64 に対応した Windows であれば動作させることができます。本来、現在販売されている全ての Windows は x86_64 にしか対応していないのですが、ARM64 版自体も開発はされているので動作させることができます。

しかしながら、ネイティブで動作させるには諸々のドライバの問題などがあるわけですが、仮想 PC を使えばそれなりに簡単に動作させることができます。

というわけで、今回は M1 Pro を搭載した Macbook Pro 上で Windows11 を動作させることを記事にしてみようと思います。

## 必要なもの

- Windows11 のライセンス
  − 自分は 11 Pro のものを用意しましたが、Home でも 10 のものでも大丈夫のはず
- Prallels Desktop 17
  - UTM で代用も可ですが、今回はこちらを採用しました
  - Pro でないと vCPU が 4 つまでしか利用できないので注意
- M1 Mac
  - 当然なので割愛
  - ちなみに、まだ Mac studio は届いていません

### Parallels Desktop

[Paralells Desktop](https://www.parallels.com/directdownload/pd/?experience=enter_key)自体はここからダウンロード可能です。当たり前ですが、プロダクトキーがないとインストールが進まないので注意。

Windows11 の ISO やボリュームファイルはインストール時に自動でダウンロードされるので、別途用意する必要はありませんでした。

### Windows 11

[Windows11](https://www.microsoft.com/en-us/d/windows-11-pro/dg7gmgf0d8h4)のライセンスは OEM 版, DSP 版などといろいろあるのですが、今回は Retail 版を選択しました。

DSP 版だとハードウェアとセットで利用しないといけないというライセンス上の制約があるので、それが煩わしかったためです。

## 導入手順

Parallels を起動するともう勝手にインストールされます。ARM 版のイメージを上手くとってきてくれている模様。

![](https://pbs.twimg.com/media/FP0KLeHaMAAjwKU?format=jpg&name=large)

ちなみにインストールされるのは Home なので Pro にしたい場合はこの後一手間かかります。

![](https://pbs.twimg.com/media/FP0Luu3akAMzWY3?format=jpg&name=large)

インストールされたのはこのように Windows 11 Home ですが、プロダクトキーを Pro のものを入力するとこのようにアップグレードの準備が始まります。

自分はこの後、再起動しないとアクティベーションができなかったのですが、環境によっては不要かもしれません。

![](https://pbs.twimg.com/media/FP0TBJaaUAIbrLE?format=jpg&name=large)

認証が終わると、このように Windows11 Pro の Insider Preview 版でない正式版を使えるようになりました。

## UTM と比較して

Windows のアプリケーションを macOS で起動させようとすると、

- UTM
- Parallels
- VMware
- Wine

といった選択肢が考えられます。UTM は使ってみたのですが設定がなんかややこしかったのと、グラフィックスが弱くてゲームをするには不向きだったため選択肢から外しました。上手くやればキビキビ動くのかもしれませんが、現状候補には挙がらなかったです。より良い設定とかがあれば教えて下さい。

::: tip UTM について

設定が悪かったのか、どうやっても vCPU が 4 コアで 1.00GHz までしか上げられませんでした。M1 Ultra なら 20 コアあるので 10 コアは割り当てたいですし、そもそもクロック数が低すぎてこれでは困ってしまいます。

:::

VMware は十分候補だったのですが、ドキュメントが全然なかったので諦めました。

Wine はシステムコールを変換するのでちゃんと動けば最強だとは思うのですが、それをするくらいなら普通に VM でいいかなあって思ってしまいました。各ソフトでいろいろ弄るのもめんどくさいので。

ちなみに仮想 PC はそれなりに重たいのでノベルゲームを起動しているだけで CPU 使用率が 40%超えたりします。これは仕方ないですね。

個人的にはプロダクトキーが ARM 版でもちゃんと認証されたので嬉しかったです。記事は以上。
