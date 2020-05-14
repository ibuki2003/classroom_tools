<template>
  <div>
    <h1>{{ page_title }}</h1>
    <p>適当にまとめます。怒られたらちゃんと書きます</p>
    <ul>
      <li>
        これはGoogle Classroom Tools(以下
        本サービス)を利用するうえでの規約です。
      </li>
      <li>
        本サービスは
        <a href="https://fuwa.dev">にこなのにふわわあ</a>
        (以下 管理者)がGoogleの提供するAPIを用いて提供するものです。
      </li>
      <li>
        本サービスを利用するにはこの規約に同意する必要があります
      </li>
      <li>
        規約を事前の予告なく変更することがあります。規約は変更の1時間後に適用されます。(API
        Keyの失効が1h後なので)
      </li>
      <li>本サービスを利用することによるいかなる損失も補償しません。</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Terms extends Vue {
  readonly page_title = "利用規約";
}
</script>
