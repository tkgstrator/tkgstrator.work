---
title: Nintendo SwitchエミュレータRyujinxを使ってみた
date: 2021-02-02
category: Hack
---

## 導入手順

[Ryujinx](https://ryujinx.org/)とは [yuzu](https://yuzu-emu.org/)とはまた違うニンテンドースイッチのエミュレータのこと。

神プログラマーに yuzu と Ryujinx のどっちがいいときいたところ「いくつか理由があるけど、Ryujinx の方がいいよ」と言われたので採用。

yuzu よりもちょっとめんどくさかったのですが、それでも以前に比べると簡単になっているので簡単に紹介します。

実機の改造のしやすさと、ゲームのダンプのしやすさをかんがえると PS3 のエミュレータよりもとっかかりやすくて良いですね。

### Ryujinx 本体のダウンロード

[Ryujinx - Download](https://ryujinx.org/download/)

![](https://pbs.twimg.com/media/EtM1tduVcAI5tTG?format=png)

アップデートがあれば自動でインストールしてくれる優しさ設計。

### キーのコピー

後述するファームウェアをインストールする際などに暗号化された NCA を復号する必要があるので、キーが必要になってきます。

![](https://pbs.twimg.com/media/EtNDjCDVoAAz9jW?format=png)

「File」から「Open Ryujinx Folder」を選択してフォルダを開いたら、その中の system というサブフォルダの中に prod.keys をコピーします。

prod.keys 自体は[Lockpick_RCM](https://github.com/shchmue/Lockpick_RCM)を使って取得してください。

また、このとき prod.keys はインストールしたい NCA を復号するために必要なキーを含んでいる必要があるので、なるべく最新のものを使うこと。

![](https://pbs.twimg.com/media/EtNDfbJVoAAXSFT?format=png)

### ファームウェアのインストール

Ryujinx はファームウェアをインストールする必要があります。

カートリッジのダンプである XCI があるなら、その中にファームウェアが入っているのでそれでもいいですが、自分でダンプしたい場合は[TegraExplorer](https://github.com/suchmememanyskill/TegraExplorer)で取得することができます。

また、有志がアップロードしてくれているファイルを使う方法でも可能です。

[Switch Firmwares - Darthsternie's Firmware Archive](https://darthsternie.net/switch-firmwares/)

![](https://pbs.twimg.com/media/EtM51dLU4AA6ImB?format=png)

「Tools」から「Install Firmware」を選び、更に「Install a firmware from XCI or ZIP」を選択して、ダウンロードしたファームウェアをインストールします。

![](https://pbs.twimg.com/media/EtM8TUDVcAIEu0x?format=png)

### ゲームの読み込み

![](https://pbs.twimg.com/media/EtNEuFaVkAAKN-d?format=png)

設定の「General」から「Game Directories」を指定すればそこにある NSP、NCA、XCI を全て読み込んでくれます。個人的には全部読み込まれるのは逆にうっとおしいので一長一短かも...

![](https://pbs.twimg.com/media/EtM5wK0UYAEB3YS?format=png)

ここに表示されるとリストから消せなかったのもマイナスポイント。フォルダ内はあらかじめ整理整頓して置かなければいけません。

### アップデータ/DLC のインストール

yuzu と同じく Ryujinx もゲームのアップデータや DLC のインストールに対応しています。

![](https://pbs.twimg.com/media/EtNKFeqU0AAWh-r?format=png)

![](https://pbs.twimg.com/media/EtNKJMbVkAIhgwg?format=png)

yuzu よりもいいなと思ったのは、アップデータの簡単に切り替えられる点です。簡単にバージョンを上げたり下げたりできるのは良いですね。

![](https://pbs.twimg.com/media/EtNJ_eAU4AM7ZAu?format=png)

## 遊んでみた感想

びっくりするくらいに重いのと、再現性は yuzu に大きく差をつけられているという印象を受けました。

例えば、逆転裁判は yuzu だとほぼ実機並みに動作するのに対して Ryujinx だとロードまでにほとんど固まっているんじゃないかという状態が数分続きます。全然ゲームが始まらない！！

あとなんか知らんけど逆転裁判をやるとコントローラが勝手に反応しまくってひたすら A ボタンと B ボタンが連打された状態になる、なんだこれ。

一応 XInput でキーコンフィグをやり直したら直ったけど、よくわからんことになってました。

![](https://pbs.twimg.com/media/EtNI4VvVcAEeTn0?format=png)

スプラトゥーンだと、キャラクター選択画面のガールとボーイの文字が表示されていないというエミュレータあるあるのバグが発生していた。これは初期の yuzu でも発生していたので、何らかの問題があるんだろう。

![](https://pbs.twimg.com/media/EtNCDQDVcAQIkXS?format=png)

ちなみに、どのくらい重いかというと i7 6700K 程度のスペックでは常に CPU 使用率が 100%で張り付いています。

CPU のベンチマークサイトによると i7 6700K は約 9000 のスコアで、8700K と 9700K が約 14000。欲しいなーと思っていた 9900K だと 19500 くらいあるみたいです。6700K でカツカツということは 8700K でも厳しそうな気がするので、スプラトゥーンをまともに遊ぼうと思ったら i9 レベルは必要になるのかもしれません。

あと、何故か 3.1.0 のアップデータを入れると画面がめっちゃ暗くなりました、何故？

yuzu よりも便利なことは間違いないので、ぜひともうちの今のパソコンで遊べるくらいアップデートが進むと嬉しいな、と思ってみたり。

記事は以上。
