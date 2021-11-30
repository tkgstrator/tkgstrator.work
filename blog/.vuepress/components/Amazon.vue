<template>
  <div id="product" @click="openURL">
    <div id="leftCol">
      <img id="productImage" :src="imageURL">
    </div>
    <div id="centerCol">
      <h1 id="productTitle">{{ productName}}</h1>
      <div id="productPrice">
      <span>価格</span>
      <span id="productLocalizedPrice">{{ productPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import ProductData from "./product.json"

export default {
  name: "Amazon",
  data() {
    return {
      imageURL: "",
      productName: "",
      productURL: "",
      productPrice: "",
      products: ProductData,
      associateId: "tkgstrator0f-22",
      baseURL: "https://www.amazon.co.jp/gp/product/",
    }
  },
  methods: {
    openURL() {
      window.open(this.productURL, "_blank")
    }
  },
  mounted: function() {
    // ランダムにプロダクトIDを選ぶ
    const product = this.products[Math.floor(Math.random() * this.products.length)]
    // 画像のURLを取得(PA APIでしか取得できない場合もあるらしい)
    this.imageURL = product["productImageURL"]
    // リンクをタグ付きで作成
    this.productURL = `${this.baseURL}${product["productId"]}/?tag=${this.associateId}`
    this.productName = product["productName"]
    this.productPrice = product["productPrice"]
  }
};
</script>

<style>
#product {
  display: flex;
  margin: 0 auto;
  max-width: 600px;
  max-height: 90px;
  cursor: pointer;
  padding-top: 5px;
  padding-bottom: 5px;
  border: solid 2.7px #E0E0E0;
  /* border: solid#146EB4; */
  border-radius: 10px;
  border-spacing: 1px;
  margin-bottom: 20px;
}

#product #leftCol {
  /* height: 100%; */
  width: 30%;
  max-width: 200px;
  min-width: 100px;
  max-height: 100%;
}

#productPrice {
    text-align: right;
    padding-right: 10px;
  /* max-height: 80px; */
/* margin-right: 270px; */
}

h1#productTitle {
  margin-top: initial;
  padding-top: initial;
  padding-right: 10px;
  appearance: none;
  font-weight: 400;
  /* height: 100%; */
  font-size: 14px !important;
  border-bottom: none !important;
  /* 省略するためのスタイル */
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  line-height: 24px;
  max-height: calc(24px*2);
}

#centerCol {
  width: 100%;
  text-align: right;
}

#productLocalizedPrice {
  color: #B12704 !important;
  font-size: 16px;
  line-height: 24px;
}

img#productImage {
  cursor: pointer;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* クリックで画像拡大を無効化 */
  pointer-events: none;
}
</style>