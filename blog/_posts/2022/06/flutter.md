---
title: FlutterでAndroidアプリを作ります
date: 2022-06-04
category: プログラミング
tags:
  - Dart
  - Flutter
---

## Dart を学ぶ

### 変数について

#### Numbers

- int
- double

![](https://dart.dev/assets/img/number-platform-specific.svg)

[Web と Native で微妙に扱いが違うらしい](https://dart.dev/guides/language/numbers#identity)ので、大きな数を使うときには注意したほうが良いだろう。

[型チェック](https://dart.dev/guides/language/numbers#types-and-type-checking)についても微妙に違うのでメモしておく。

#### Strings

- String

Dart では文字列はオブジェクトなのだという、なるほど。

#### Boolean

- bool

なんか公式ドキュメントでも急に話がとんでてビビるのだが、Dart の型安全性とは`nonbooleanValue`や`assert(booleanValue)`で条件文を使えないことだという。

まあこれは Swift でも似たようなことがあり、Swift で`out of index`はチェックしてエラーを処理することはできない。これはエラーではなく、バグだという認識なのである。

#### Lists

- List

ここも自然な定義でわかりやすい。

#### Sets

- Set

重複を許さない Lists みたいな感じ。集合なので集合函数が使える。

```dart
var names = <String>{};
// Set<String> names = {}; // This works, too.
// var names = {}; // Creates a map, not a set.
```

上の書き方だと正しく Set になるが、下の書き方だと Map になってしまうので注意。

まあ、基本的に静的型付けができる言語は静的型付けを積極的にすべきだろう。

#### Maps

- Map

要するに辞書。以下のように定義する。

```dart
Map<String, String>();
```

### アクセスレベルコントロール

Swift だと、

- internal
- public
- private
- open

のようなアクセスレベルがあるが、Dart にはない。じゃあどうするのかというと変数名にアンダースコアを追加する。

```dart
// Private
String _text = "Hello, world!";
// Public
String text = "Hello, world!";
```

なので文法的には Python に近いことがわかる。

### 無名関数

Python だと Lambda 式とか言われるやつ。名前がない関数を使って値を計算して変数に割り当てるときに使ったりするし、Javascript の場合は変数自体を関数にしたりできる。

例えば、以下のコードは forEach について何も宣言されていないがちゃんと動作する。

```dart
void main() {
  const list = ['apples', 'bananas', 'oranges'];
  list.forEach((item) {
    print('${list.indexOf(item)}: $item');
  });
}
```

### 変数のスコープ

自分より上位のスコープの変数は全て使えます。

```dart
bool topLevel = true;

void main() {
  var insideMain = true;

  void myFunction() {
    var insideFunction = true;

    void nestedFunction() {
      var insideNestedFunction = true;

      assert(topLevel);
      assert(insideMain);
      assert(insideFunction);
      assert(insideNestedFunction);
    }
  }
}
```

このコードの場合だと`nestedFunction()`は全てのレベルの変数にアクセスできます。

### 返り値

全ての関数は返り値を持ちます。何も返さない（ように見える）関数は`return null`が実行されています。

### 演算子

計算に使う演算子ですが、長いので省略。

[ドキュメント](https://dart.dev/guides/language/language-tour#operators)を読みましょう。

#### 算術演算子

`~/`と書けば整数型で割り算の結果が返るらしくて便利（ひょっとして他の言語にもある？）

## 関数

```dart
bool isNoble(int atomicNumber) {
  return _nobleGases[atomicNumber] != null;
}
```

このコードは与えられた数をインデックスとして配列の中の値が null かどうかチェックします。

```dart
isNoble(atomicNumber) {
  return _nobleGases[atomicNumber] != null;
}
```

型をつけることが推奨されているらしいのですが、こう書いても動くとのこと。

```dart
bool isNoble(int atomicNumber) => _nobleGases[atomicNumber] != null;
```

更に省略してこう書くこともできます。

### パラメーター

名前付きの引数は`required`と明記しない限りオプショナルです。

```dart
/// Sets the [bold] and [hidden] flags ...
void enableFlags({bool? bold, bool? hidden}) {...}
```

名前付き引数の関数を定義することができます。これは Swift と同じですね。

```swift
func enableFlags(bool: Bool?, hidden: Bool?) {}
```

Swift 風に書くと多分上と同じ感じ。

この関数を呼び出したければ、

```dart
enableFlags(bold: true, hidden: false);
```

という風に書きます。パラメータがオプショナルで null が入れられない場合はデフォルト値を利用しましょう。

```dart
/// Sets the [bold] and [hidden] flags ...
void enableFlags({bool bold = false, bool hidden = false}) {...}

// bold will be true; hidden will be false.
enableFlags(bold: true);
```

このように書けば何も書かなければそれぞれ関数で定義したデフォルト値が利用されます。

```dart
String say(String from, String msg, [String? device]) {
  var result = '$from says $msg';
  if (device != null) {
    result = '$result with a $device';
  }
  return result;
}
```

こういう感じに書けば`[]`内のパラメーターはあってもなくてもよく、ない場合には null が入ります。

```dart
assert(say('Bob', 'Howdy') == 'Bob says Howdy');
assert(say('Bob', 'Howdy', 'smoke signal') == 'Bob says Howdy with a smoke signal');
```

## main 関数

main 関数は void を返し、オプショナル引数として`List<String>`を持ちます。

```dart
void main() {
  print('Hello, World!');
}
```

つまり、上のように書くこともできるし、引数を利用して、

```dart
// Run the app like this: dart args.dart 1 test
void main(List<String> arguments) {
  print(arguments);

  assert(arguments.length == 2);
  assert(int.parse(arguments[0]) == 1);
  assert(arguments[1] == 'test');
}
```

このように書くこともできます。

### ファーストクラスオブジェクトとしての関数

関数に関数を渡すこともできます。

```dart
void printElement(int element) {
  print(element);
}

var list = [1, 2, 3];

// Pass printElement as a parameter.
list.forEach(printElement);
```

これは TS でもでてきた書き方なので、慣れたら使い勝手が良さそうな気がします。

## 演算子

長いので必要そうなところだけ抜粋。

わかんなくなったら[公式ドキュメント](https://dart.dev/guides/language/language-tour#operators)読め。

### 型テスト演算子

- as
  - 型キャスト
- is
  - 型チェック
- is!
  - 型チェック

### 代入演算子

null 演算子の親戚みたいなものが使える、これは便利では......

```dart
// Assign value to a
a = value;
// Assign value to b if b is null; otherwise, b stays the same
b ??= value;
```

どういうことかというと、

```swift
let a = value
let b = b == nil ? nil : a
```

のように nil だったら nil、違ったらその値を代入というのが簡単にかける。え、いやこれ Swift にもあります？？（あったら今まで馬鹿すぎた

### カスケード演算子

なんて訳せばいいのかわからず、ググるのもめんどくさかったのでそのまま載せる。

```dart
var paint = Paint()
  ..color = Colors.black
  ..strokeCap = StrokeCap.round
  ..strokeWidth = 5.0;
```

`..`を続けるとそのインスタンスのプロパティへのアクセスを明示できるのだという。便利ではあるが、なんかややこしくなりそうなので使うかは微妙。

上のコードは下のコードと等価である。

```dart
var paint = Paint();
paint.color = Colors.black;
paint.strokeCap = StrokeCap.round;
paint.strokeWidth = 5.0;
```

で、最初に取得したオブジェクトが null の場合は当然メンバ変数も存在しないのでこのコードは失敗するのだが、

```dart
querySelector('#confirm') // Get an object.
  ?..text = 'Confirm' // Use its members.
  ..classes.add('important')
  ..onClick.listen((e) => window.alert('Confirmed!'))
  ..scrollIntoView();
```

とすれば null チェックも同時に行えるという。ただ、使うかは微妙なところ。

このコードは下のコードと等価。

```dart
var button = querySelector('#confirm');
button?.text = 'Confirm';
button?.classes.add('important');
button?.onClick.listen((e) => window.alert('Confirmed!'));
button?.scrollIntoView();
```

### その他の演算子

#### ?[]

要はオブジェクトが null でなければそのインデックスにアクセスし、null なら null を返す。

> Like [], but the leftmost operand can be null; example: fooList?[1] passes the int 1 to fooList to access the element at index 1 unless fooList is null (in which case the expression evaluates to null)

インデックス外参照エラーが出るのかは気になるところ。

#### ?.

オブジェクトが null だったら null を返すメンバ変数へのアクセスするためのアレ。

Swift の場合はオブジェクト自体が nil なら勝手にメンバ変数も全て nil だった気がするので、Dart の方がちょっとめんどくさい。

#### !

オプショナルのアンラップ、null をアンラップすると落ちるのかどうかが気になる。

## 状態管理フロー

### Assert

開発環境で使えとある、要は変数の中身をチェックして、条件を満たさなかればそこでアプリがコケるというもの。

多分、プロダクションビルドだと自動で無効化にされるとかそういう配慮が行き届いている（と信じている）

## 例外処理

- throw
  - 例外を投げるやつ
- catch
  - 例外を受け取るやつ
- finally
  - 例外が発生してもしなくても最終的に実行されるやつ

```dart
throw FormatException('Expected at least 1 section');
```

例えばこんな感じでエラーが投げられる。Swift だと Error プロトコルを継承したクラスなどしか返せなかったが、Dart だと任意の値が返せる。

```dart
throw 'Out of llamas!';
```

つまり、上のようなコードも動作する。

```dart
try {
  breedMoreLlamas();
} catch (e) {
  print('Error: $e'); // Handle the exception first.
} finally {
  cleanLlamaStalls(); // Then clean up.
}
```

よくあるコード。エラーが発生してもしなくても finally は実行される。

## クラス

```dart
var p1 = Point(2, 2);
var p2 = Point.fromJson({'x': 1, 'y': 2});

var p1 = Point(2, 2);
var p2 = Point.fromJson({'x': 1, 'y': 2});
```

これはどっちを書いても一緒。`new`は特に書く必要がないらしい。

定数コンストラクタというのもあるらしい。これをやると同じ宣言をすればインスタンスが再利用され、全く同一のものになるらしい。

```dart
var a = const ImmutablePoint(1, 1);
var b = const ImmutablePoint(1, 1);

assert(identical(a, b)); // They are the same instance!
```

個人的には以下のコードがちょっとよくわからない、違うというのはわかるのだが。

```dart
var a = const ImmutablePoint(1, 1); // Creates a constant
var b = ImmutablePoint(1, 1); // Does NOT create a constant

assert(!identical(a, b)); // NOT the same instance!
```

### クラス変数

```dart
class Point {
  double? x; // Declare instance variable x, initially null.
  double? y; // Declare y, initially null.
  double z = 0; // Declare z, initially 0.
}
```

普通なので割愛。

### 概要クラス

### 継承クラス

### 拡張クラス

### Enum

TS ではゴミみたいな Enum しか使えないが、Dart では割とまともな Enum が使える。

```dart
enum Vehicle implements Comparable<Vehicle> {
  car(tires: 4, passengers: 5, carbonPerKilometer: 400),
  bus(tires: 6, passengers: 50, carbonPerKilometer: 800),
  bicycle(tires: 2, passengers: 1, carbonPerKilometer: 0);

  const Vehicle({
    required this.tires,
    required this.passengers,
    required this.carbonPerKilometer,
  });

  final int tires;
  final int passengers;
  final int carbonPerKilometer;

  int get carbonFootprint => (carbonPerKilometer / passengers).round();

  @override
  int compareTo(Vehicle other) => carbonFootprint - other.carbonFootprint;
}
```

### ジェネリクス

Dart では
