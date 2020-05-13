<template>
  <div id="app">
    <header>
      <b-navbar type="dark" variant="dark">
        <b-navbar-brand :to="{ name: 'Home' }"
          >Google Classroom Tools</b-navbar-brand
        >
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template v-slot:button-content>
              <template v-if="logged_in">
                <b>{{ user_name }}</b>
                としてログインしています
              </template>
              <template v-else>ログイン</template>
            </template>
            <template v-if="logged_in">
              <b-dropdown-item-button @click="logout" variant="danger"
                >ログアウト
              </b-dropdown-item-button>
            </template>
            <template v-else>
              <b-dropdown-item-button @click="login" variant="primary">
                ログイン
              </b-dropdown-item-button>
              <b-dropdown-item>
                <small>
                  Classroomを使用するアカウントでログインしてください
                </small>
              </b-dropdown-item>
            </template>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar>
    </header>
    <main class="container my-4 py-4 bg-white shadow-sm rounded">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import {
  logout,
  login,
  is_token_available,
  get_token
} from "@/libs/google_oauth2";
import { use_scopes } from "@/apis/classroom/v1/courses/@types";
import api from "@/apis/www/$api";
import axios from "@aspida/axios";

@Component
export default class App extends Vue {
  logged_in = false;
  user_name = "";

  @Watch("$route")
  load_user_info() {
    this.logged_in = is_token_available();
    if (!this.logged_in) return;
    const token = get_token();
    if (token === null) return;
    api(axios())
      .oauth2.v1.userinfo.$get({
        headers: { Authorization: "Bearer " + token }
      })
      .then(d => (this.user_name = d.name));
  }

  mounted() {
    this.load_user_info();
  }

  logout() {
    logout();
    this.load_user_info();
  }

  login() {
    const callback_url =
      process.env.VUE_APP_CALLBACK_URL ||
      location.protocol +
        "//" +
        location.host +
        this.$router.resolve({ name: "authed" }).href;
    login(
      process.env.VUE_APP_CLIENT_ID,
      callback_url,
      "token",
      use_scopes,
      this.$route.name || undefined,
      ["consent", "select_account"]
    );
  }
}
</script>
