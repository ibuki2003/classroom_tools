<template>
  <div>
    <h1>{{ page_title }}</h1>
    <p>簡単にまとめます。怒られたらちゃんと書きます</p>
    <p>
      Google Classroom Tools(以下 本サービス)は、
      <a href="https://fuwa.dev">にこなのにふわわあ</a>
      (以下 管理者)がGoogleの提供するAPIを用いて提供するものです。
    </p>
    <p>
      本サービスではAPIによって取得した情報は全て利用者側で処理をしており、
      管理者に伝わることはありませんが、不安な場合は利用を中止してください。
    </p>
    <p>
      本サービスのソースコードは次のURLにて公開しています:
      <a href="https://github.com/ibuki2003/classroom_tools">
        ibuki2003/classroom_tools
      </a>
    </p>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class PrivacyPolicy extends Vue {
  readonly page_title = "プライバシーポリシー";
}
</script>
