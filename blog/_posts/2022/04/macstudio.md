---
title: Mac Studio届くの遅い
date: 2022-04-15
category: 話題
tags:
  - Mac
---

## Mac Studio が届いた

![](https://pbs.twimg.com/media/FQXibwXVEAARPJO?format=jpg&name=large)

開封の儀とかそういうのはめんどくさいので省略。

### Paralells

![](https://pbs.twimg.com/media/FQXy_HMVkAEe1De?format=jpg&name=4096x4096)

無事にライセンスを移行して Windows 11 を再インストール。Mac Studio は 20 コアもあるのに Paralells での仮想 PC では CPU コアは何故か 8 つまでしか設定できない、キレそう。

![](https://pbs.twimg.com/media/FQXry0yVsAAZsEt?format=jpg&name=medium)

とりあえず動かしてみる。メモリはいくらでも使えるのでとりあえず全メモリの半分の 32GB を割り当ててみました。

![](https://pbs.twimg.com/media/FQX2d4mUYAMYhIe?format=jpg&name=4096x4096)

するとだいたい NPS は 3000k ほどで、これは多分前使っていた i7 6700K と同じくらいです。つまり、M1 Ultra で 8 コア割り当てて Paralells を動かせば i7 6700K くらいのスペックになります。まあ、良いのではないでしょうか。

![](https://pbs.twimg.com/media/FQX5t_6VgAIaUlS?format=jpg&name=4096x4096)

ちなみにネイティブで 20 コアフルに使うと 15000k ほどでて、Ryzen9 5900X と同じくらいっぽいです。

[CPU Monkey](https://www.cpu-monkey.com/en/compare_cpu-amd_ryzen_9_5900x-vs-apple_m1_ultra_48_gpu)でもだいたい 5900X と M1 Ultra の性能は近いみたいなので、そんなもんかなあという気がします。

### 使ってみた感想

めっちゃ静かです。将棋エンジンをフルに動かし続けても上のリンゴマークのところがほんのり温かくなるくらいです。ファン回っているのかどうかも疑問なレベル。

正直、リソースをつぎ込みまくれば M1 Ultra を超えるパソコンはいくらでも（もちろん Mac Studio よりも安価に）つくれるのですが、このサイズ、この省エネ、この排熱レベルで同等のスペックを達成するのは不可能だと思います。

そういう意味で、完成度が高いといえるかもしれません。

ちなみに Paralells では外部ディスプレイが使えないみたいで VR は遊べませんでした！！！これ、完全に VR デバイスの使いみちがありませんね、困ったな。

### 動画配信してみた

M1 Pro だと 1080p60fps だと CPU 使用率が高すぎてカクカクしてしまったのですが、M1 Ultra だと以下のような激重設定でも CPU 使用率 40%くらいで耐えることができました。

![](https://pbs.twimg.com/media/FQbhCBtVgAIRPBm?format=jpg&name=4096x4096)

動画エンコード方式は色々あるのですが、ソフトウェアエンコードがビットレートに対して圧倒的に画質が高いので、選ぶなら x264 か x265 が候補に上がります。

::: tip x264 と h264

間違ってたら申し訳ないのだが、x264 と h264 は全く異なる概念のはず。h264 形式に変換するための実行ファイルが x264 というイメージ。h264 形式にするだけなら NVEnc とか QuickSync とかあるのだけれど、これらはハードウェアエンコードなので全くダメ。

同様に、hevc(h265)に変換しようとしたら x265 が最もきれい。ただし、rtmp（配信用のプロトコル）は h265 に対応していないので、超高画質な映像を配信することはできない。VP9 も同様に対応していないはず。

:::

ただ、録画されたやつを見ると動きが激しくなる瞬間に一瞬重くなっているように見えなくもないので、スプラトゥーンをこの設定で配信するのはちょっときついかもしれない。まあそのあたりは設定を詰めていろいろやってみたい。

記事は以上。
