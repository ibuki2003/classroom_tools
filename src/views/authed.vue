<template>
  <div>
    <p>認証が完了しました。リダイレクトしています…</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { parse_response_hash } from "../libs/google_oauth2";

@Component
export default class Authed extends Vue {
  mounted() {
    const state = parse_response_hash(this.$route.hash);
    if (state === false) alert("failure");
    else if (state === true) alert("no redirection destination");
    else {
      this.$router.push({ name: state }).catch(r => {
        alert("redirection failure:" + r);
      });
    }
  }
}
</script>
