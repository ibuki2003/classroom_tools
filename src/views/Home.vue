<template>
  <div>
    <h1>Fuwa Classroom Tools</h1>
    <b-card title="全クラス タイムライン">
      <b-button :to="{ name: 'timeline' }">Go</b-button>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Home extends Vue {
  readonly title = "";
}
</script>
