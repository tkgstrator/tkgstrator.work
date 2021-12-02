---
title: Vue3 + Firebaseチュートリアル
date: 2021-12-02
categoriy: プログラミング
tags:
  - Firebase
  - Vue
---

## Vue3 + Firebase

Vue の最新バージョンは 3 なのだが、ネットを調べると情報が錯綜しすぎていて全く参考にならないので備忘録としてメモしておく。良い子の諸君はここのページだけを信じるように。

### [Vue3](https://v3.vuejs.org/)

まずは Vue プロジェクトを作成するために`@vue/cli`をインストールする。

> [Vue CLI](https://cli.vuejs.org/)

```sh
yarn global add @vue/cli
# OR
npm install -g @vue/cli
```

インストールが完了したらプロジェクトを作成する。

```sh
vue create PROJECT_NAME
```

::: tip Vue3 について

利用する Vue のバージョンはこの段階で選択することができる。どうしても 2 が使いたいなら 2 を利用することも可能。

:::

プロジェクトが作成できたらプロジェクト内で`@vue/cli`のバージョンをアップデートする。

```sh
cd PROJECT_NAME
vue upgrade --next
```

ここまでで Vue3 自体のセットアップはできたので、Dev 環境で実行してみよう。

なお、以後は`yarn`での開発環境についてのみのコマンドを記述するので注意。

```sh
yarn serve # Devlopment
```

[http://localhost:8080/](http://localhost:8080/)にアクセスすると Vue のトップページが表示されるはずだ。

### [Vuefire](https://vuefire.vuejs.org/)について

Firebase を楽に利用するためのラッパーである Vuefire を使おうみたいな記事がたくさんありますが、Vuefire は`vuefire@next`を使ったとしても`Firebase JS SDK`のバージョン 8 までしか対応していません。

最新バージョンは`9.5.0`(2021 年 12 月 02 日現在)なので、これでは全く意味がないわけです。

### [Firebase](https://firebase.google.com/docs/web/setup)

```sh
yarn add firebase
# OR
npm install firebase
```

追加したら`main.js`を編集します。

```js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { initializeApp } from "firebase/app"; // 追加

const firebaseConfig = {
  // 追加
};

const app = initializeApp(firebaseConfig); // 追加

createApp(App).use(store).use(router).mount("#app");
```

`const app = initializeApp(firebaseCondig)`を書かないと初期化されていないとかでエラーが出ますので、必ず書くように。

`firebaseConfig`の中身は各自ウェブサイトで確認してください。

## Authentication の設定

今回は Twitter ログインを実装したいと思います。

予め[Twitter Developer Potal](https://developer.twitter.com/en/portal/dashboard)でトークンを取得しておいてください。

あと[Firebase Authentication](https://firebase.google.com/docs/auth)で Twitter 認証を許可しておきましょう。

### SignIn.vue

ボタンを押すとポップアップが表示されて Twitter 認証ができるコンポーネントのコードです。

```vue
<template>
  <button @click="signIn">Twitter</button>
</template>

<script>
import { getAuth, signInWithPopup, TwitterAuthProvider } from "@firebase/auth";

export default {
  methods: {
    signIn() {
      const auth = getAuth();
      const provider = new TwitterAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          // ログイン後の処理を書く
        })
        .catch((error) => {
          // エラー発生時の処理を書く
        });
    },
  },
};
</script>
```

これだけでポップアップが正しく表示されてログインができます。

記事は以上。
