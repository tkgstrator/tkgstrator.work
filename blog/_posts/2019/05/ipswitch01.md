---
title: "[IPSwitch] 誰でもできるコード開発 #1"
date: 2019-05-01
description: スペシャル消費量を0にするためのコードの書き方を解説しています
category: Hack
tags:
  - IPSwitch
  - コード開発
---

# [IPSwitch] 誰でもできるコード開発 #1

## コードの自作の目的と意味

IPSwitch でいろいろなコードを試している人はたくさんいるように思います。

中にはコードを使うだけで楽しい人もいるかも知れませんが、「自分でもコードを見つけたい」と思っている人もいるかも知れません。

というのは、コードを見つければそのコードはくだらないものであったとしても自身の名前が残る可能性があるからです。

ぼくが見つけたのは金イクラドロップ数変更とサーモンランでのスペシャル使用回数変更のコードなので、たまに動画の紹介で名前が載っていることがありますね。

::: tip

ぼくより先にコード見つけた人がいるかも知れませんが、こういうのは公開しないと名前が載りません。

:::

実際のところコードはチーム内以外では非公開だったので「なんで勝手に動画化されてるん？」っていう気はしないでもないですが、ちゃんとクレジットがついていてコード自体は公開されていないことを考えると最低限のモラルを持っている人は多いように思います。

## 自作しやすいコード

コードの中にも自作しやすいものとそうでないものが存在します。

最も簡単なのは実行ファイル内で定義されている値を変更するもので、これはとてつもなく簡単です。

基本的には必要なパラメータが記述されているアドレスを探すだけの作業になります。

当然、「実行ファイルのどこにそんな定数が載っているのか」という話になるのですが、`ELF String Table`という箇所があるのでそこを見れば簡単に見つけることができます。

どのあたりにそれらのテーブルがあるかは下のテーブルに載せておくので参考にしてください。

|  Ver  | ELF(IDA) |  NSO(IDA)  |
| :---: | :------: | :--------: |
| 3.1.0 | 37106C4  | 71037106C4 |
| 5.4.0 | 24178B5  | 71024178B5 |

::: tip

`Shooter_Normal_H`でテキスト検索をすれば割りと早く見つけられると思います。

:::

これらは文字列なのでソースコードのコメントが削除された 3.1.0 以降の NSO であっても比較的読みやすいはずです。

ここから自分がいじりたいと思うパラメータを検索する必要があります。

パラメータ名はどこかで見たことがあるものばかりだと思うので、見つけること自体は簡単だと思います。

以下にパラメータ名の一例を挙げておきます。

|    文字列    |       意味       |
| :----------: | :--------------: |
|     Coop     |   サーモンラン   |
| SpecialCount | スペシャル必要量 |
|  InkCosume   |   インク消費量   |
|    Player    |    イカちゃん    |
|    Npc\_     |       NPC        |
|    State     |  メッセージなど  |

とにかくパラメータは多すぎるので、全部書ききることはできません。

### 値を 0 にするコード

先程、最も書きやすいコードは実行ファイル内で定義されている変数を変更するものだと述べました。

それらのうち、その値を 0 にするコードは最も書きやすいです。

これを 100 や 1000 にするのは意外と難しいのです。

例えば、スペシャル必要量を 0 にするコードを書いてみましょう。

::: danger

GHIDRA はデフォルトでは 1024MB しかメモリを使ってくれないのですが、これだとメモリが足りずに解析失敗するかもしれないので最低でも 2048MB は確保したほうがいいでしょう。

**ghidraRun.bat**

```
:: Ghidra launch

@echo off
setlocal

:: Maximum heap memory size
:: Default for Windows 32-bit is 768M and 64-bit is 1024M
:: Raising the value too high may cause a silent failure where
:: Ghidra fails to launch.
:: Uncomment MAXMEM setting if non-default value is needed

set MAXMEM=2048M

call "%~dp0support\launch.bat" bg Ghidra "%MAXMEM%" "" ghidra.GhidraRun %*


```

こんな感じでコメントを外して好きな値をいれれば OK。

一応 1024MB でも解析できたけど、余裕があるならそれ以上に設定しておこう。

:::

![](https://pbs.twimg.com/media/E2cSHEYUUAY7PZm?format=png)

アドレスは 71024178B5 で、その右を見ると XREF[2] の記述から 710008547C のもう一つ隣の 71000864E8 でこの値が使われていることがわかります。

ダブルクリックするとこのアドレスにとぶことができるので、実際にそのサブルーチンを見てみましょう。

::: tip

サブルーチンというのは、関数（メソッド）内で動く関数みたいなイメージです。

:::

![](https://pbs.twimg.com/media/E2cSJXdVcAEw4eK?format=png)

ここのサブルーチンの上五行の命令を覚えておきましょう。

## アセンブラを理解する

```
000864DC                 LDR             X1, [SP,#0x6C0+var_660]
000864E0                 ADRP            X2, #aSpecialcost@PAGE ; "SpecialCost"
000864E4                 SUB             X0, X29, #-var_C8
000864E8                 ADD             X2, X2, #aSpecialcost@PAGEOFF ; "SpecialCost"
000864EC                 STR             X19, [SP,#0x6C0+src]
000864F0                 BL              sub_19E4678
```

この五行がスペシャル必要量を設定しているサブルーチンになります。

で、そのサブルーチンを実行したときのレジスタの動きはだいたいこんな感じ（自信がないので間違ってたら指摘ください）

![](https://pbs.twimg.com/media/E2cUAhWVEAMzsja?format=png)

SP からアドレス XXX だけズラしたところのアドレスに格納されている値を X1 にコピーする。

![](https://pbs.twimg.com/media/E2cUC0hUcAAQ5GF?format=png)

PC + #SC のアドレスを X2 にコピーする。

※どんな値が入っているかはここではわからない。

![](https://pbs.twimg.com/media/E2cUE5jVIAAMmEz?format=png)

X29 - #YYY の計算結果を X0 に保存する。

※X29 に保存されているデータはアド レスかもしれないし、値かもしれな。

![](https://pbs.twimg.com/media/E2cUG9_VoAExApK?format=png)

X2 + #SC の値を X2 にコピーする。

※ただ、#SC の値は常に 0 なのでこの 動作に意味があるのかよくわかっていない。

※アドレスに定数を足して何をしているのかもよくわからない。

![](https://pbs.twimg.com/media/E2cULU7UcAEA45r?format=png)

SP + #ZZZ のアドレスにある値を X19 にコピーする。

※[] はそのアドレスの値を意味する。

![](https://pbs.twimg.com/media/E2cUNzVVkAI8lPu?format=png)

サブルーチン 19E4678 に分岐する。

![](https://pbs.twimg.com/media/E2cUQhVVIAM-diu?format=png)

命令を実行したあとのレジスタの状況はこんな感じになっています。

このあと結局どの値を SC として使われるのかはサブルーチンの中身を見なければわかりません。

で、細かいことはさておいて最終的には X1 レジスタに入っているアドレスが指し示すメモリの値が`SpecialCost`として使われます。

![](https://pbs.twimg.com/media/E2cUT05VkAA-KI1?format=png)

サブルーチン 19E4678 は X1 にスペシャル必要数のデータが保存されているメモリのアドレスをコピーする。

レジスタはこのあとも何度も更新されてしまうので、ここの値を変えることに意味はありません。

では、メモリのアドレス XXX のデータが持つ値を変更するにはどのようなアセンブラを書けば良いでしょうか？

もちろん、直接メモリに値を代入するアセンブラが書ければよいのですが、それはできません。

何故なら、メモリに値を代入するためには必ずレジスタからコピーしなければいけないからです。

つまり、データのコピー先としてメモリのアドレスを直接指定することは不可能です。

ではどうすればいいのかというと、メモリのアドレスを保持しているレジスタを利用するのです。

上の例の場合は、X1 レジスタが参照先のメモリのアドレスを保持しているのでこれが利用できます。

```
MOV X20, #0
STR X20, [X1]
```

例えばこのように書けばアドレス XXX に保存されているデータの値を 0 に上書きすることができます。

::: tip

`MOV X20, X1`と書いてしまうと、参照したいメモリのアドレス自体が 0 に更新されてしまって、データを正しく読み込むことができなくなってしまいます。

:::

ただし、これでは二行も使ってしまうのでできれば一行で済ませたいところです。

そこで、読み込むと必ず 0 を返すゼロレジスタを利用します。

```
STR WZR, [X1]
```

こう書けば X1 の値を 0 にするコードが一行で書けてしまいます。

## コードの実装

X1 レジスタが指し示すアドレスの値を 0 にするアセンブラは`STR WZR, [X1]`と書くことができました。

そして、本来こういった動作はサブルーチン 19E4678 で行われます。

つまり、サブルーチンに入らずに単に X1 レジスタの値を変更してしまえば期待通りの動作をするはずです。

よって、サブルーチン 19E4678 に分岐するための命令`BL sub_19E4678`自体を書き換えてしまいましょう。

```
// Before
000864DC                 LDR             X1, [SP,#0x6C0+var_660]
000864E0                 ADRP            X2, #aSpecialcost@PAGE ; "SpecialCost"
000864E4                 SUB             X0, X29, #-var_C8
000864E8                 ADD             X2, X2, #aSpecialcost@PAGEOFF ; "SpecialCost"
000864EC                 STR             X19, [SP,#0x6C0+src]
000864F0                 BL              sub_19E4678

// After
000864DC                 LDR             X1, [SP,#0x6C0+var_660]
000864E0                 ADRP            X2, #aSpecialcost@PAGE ; "SpecialCost"
000864E4                 SUB             X0, X29, #-var_C8
000864E8                 ADD             X2, X2, #aSpecialcost@PAGEOFF ; "SpecialCost"
000864EC                 STR             X19, [SP,#0x6C0+src]
                         STR             WZR, [X1]
```

`BL sub_19E4678`の命令が書かれているアドレスは 000864F0 ですので、これを`STR WZR, [X1]`という命令で上書きします。

これはこのままではアセンブラですので、ARM64 が解釈できる機械語に治す必要があります。

以下のサイトで簡単に変換できるので試してみましょう。

[Online ARM to HEX Converter](http://armconverter.com/)

![](https://pbs.twimg.com/media/E2cUgdlUUAApUdB?format=png)

このとき出力される ARM HEX の値をコピーします。

これが ARM64 が解釈できる`STR WZR, [X1]`という命令になります。

```
// Special Cost 0 [tkgling]
@disabled
000864F0 340000F9 // STR X20, [X1]
```

最終的に、このようなコードが得られたら正解です。

### 応用

実は今のサブルーチンは各ブキのパラメータが載っている bprm ファイルを読み込んでその値を読み取るという関数でした。

ブキのパラメータはアップデータでコロコロと変わるので、実行ファイルに書くよりもパラメータ名だけ定義しておいて外部ファイルから読み込んだほうが合理的というわけです。

そして、今回のサブルーチンと全く同じ構造を持ったサブルーチンは多数あります。

```
LDR             X1, [SP,#0xXXX]
ADRP            X2, #XYZ ; Parameter
SUB             X0, X29, #-var_C8
ADD             X2, X2, #XYZ ; Parameter
STR             X19, [SP,#0xXXX]
BL              sub_ABCDEFG
```

つまり、こういうサブルーチンであるなら、BL の命令を上書きしてパラメータの値を 0 にすることは簡単だということです。

::: tip

基本的には X1 レジスタが指し示す値を変更すれば反映されるはずです。

:::

## 最後に

IPSwitch のコード開発第一回は少々長くなりましたが、パラメータ名が実行ファイル内で定義されている値を 0 に変更するコードの書き方を学習しました。

次回はある特定の値に変更する方法を学びたいと思います。

記事は以上。
