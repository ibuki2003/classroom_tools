<template>
  <div>
    <h1>Fuwa Classroom Tools</h1>
    <b-card title="全クラス タイムライン">
      <b-button :to="{ name: 'timeline' }">Go</b-button>
    </b-card>
    <b-nav>
      <b-nav-item :to="{ name: 'privacy_policy' }">
        プライバシーポリシー
      </b-nav-item>
      <b-nav-item :to="{ name: 'terms' }">
        利用規約
      </b-nav-item>
    </b-nav>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Home extends Vue {
  readonly page_title = "";
}
</script>
