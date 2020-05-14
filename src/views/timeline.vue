<template>
  <div>
    <h1>{{ page_title }}</h1>
    <p>全クラスの投稿を時刻順に一覧表示します</p>
    <b-btn text="aaa" @click="get" :disabled="!logged_in">load</b-btn>
    <b-spinner v-if="pending"></b-spinner>

    <b-alert
      variant="danger"
      v-for="(error, idx) of errors"
      :key="idx"
      class="apply-newline"
      show
    >
      {{ error }}
    </b-alert>

    <b-card no-body class="m-2" v-for="a of cards" :key="get_card_id(a)">
      <b-card-header
        :header-bg-variant="get_card_variant(a)"
        header-text-variant="white"
      >
        <b-card-title>{{ get_card_title(a) }}</b-card-title>
        <b-badge>{{ get_card_course_name(a) }}</b-badge>
      </b-card-header>
      <b-card-body>
        <b-card-text>
          {{ get_card_user_name(a) }}
        </b-card-text>
        <b-card-text class="apply-newline">
          {{ get_card_content(a) }}
        </b-card-text>
        <b-button :href="get_card_link(a)" class="card-link">開く</b-button>
      </b-card-body>
      <b-card-footer>
        <ul class="no-icon-list">
          <li>
            <b-icon-clock v-b-tooltip.hover title="投稿" />
            {{ get_card_created(a) }}
          </li>
          <li>
            <b-icon-arrow-repeat v-b-tooltip.hover title="最終更新" />
            {{ get_card_updated(a) }}
          </li>
          <li v-if="get_card_due(a)">
            <b-icon-alarm v-b-tooltip.hover title="締切" />
            {{ get_card_due(a) }}
          </li>
        </ul>
      </b-card-footer>
    </b-card>
  </div>
</template>

<style lang="scss">
.apply-newline {
  white-space: pre-wrap;
}
ul.no-icon-list {
  list-style: none;
  padding-left: 0;
}

.card ul {
  margin-bottom: 0;
}
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import api from "@/apis/classroom/$api";
import axios from "@aspida/axios";
import { get_token, is_token_available } from "@/libs/google_oauth2";
import { Course } from "@/apis/classroom/v1/courses/@types";
import { Announcement } from "@/apis/classroom/v1/courses/_courseId@string/announcements/@types";
import moment from "moment";
import { CourseWork } from "@/apis/classroom/v1/courses/_courseId@string/courseWork/@type";

type CardContent =
  | {
      type: "Announcement";
      content: Announcement;
    }
  | {
      type: "CourseWork";
      content: CourseWork;
    };

@Component
export default class Timeline extends Vue {
  readonly page_title = "全クラス タイムライン";
  readonly date_format = "YYYY-MM-DD HH:mm";
  courses: { [key: string]: Course } = {};
  cards: CardContent[] = [];
  errors: string[] = [];
  user_name_map: { [key: string]: string } = {};
  pending = false;
  get logged_in() {
    return is_token_available();
  }
  get() {
    const token = get_token();
    if (token === null) {
      alert("not logged in");
      return;
    }

    this.courses = {};
    this.cards = [];
    this.errors = [];
    this.pending = true;
    api(axios())
      .v1.courses.$get({
        headers: { Authorization: "Bearer " + token }
      })
      .then(d => {
        d.courses?.forEach(c => (this.courses[c.id] = c));
      })
      .then(() => {
        return Object.keys(this.courses).flatMap(c => [
          this.get_course_annoucements(c, token),
          this.get_course_works(c, token)
        ]);
      })
      .then(a => Promise.allSettled(a))
      .then(() => {
        this.pending = false;
        this.cards.sort((a, b) =>
          moment(b.content.updateTime).diff(moment(a.content.updateTime))
        );
      });
  }

  get_course_annoucements(course_id: string, token: string) {
    return api(axios())
      .v1.courses._courseId(course_id)
      .announcements.$get({
        headers: { Authorization: "Bearer " + token }
      })
      .then(d => {
        if (d.announcements)
          this.cards.push(
            ...d.announcements.map(
              (a: Announcement): CardContent => ({
                type: "Announcement",
                content: a
              })
            )
          );
      })
      .catch(e => {
        this.errors.push(
          `${this.courses[course_id].name}のお知らせの取得に失敗しました:${e}`
        );
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  get_course_works(course_id: string, token: string) {
    return api(axios())
      .v1.courses._courseId(course_id)
      .courseWork.$get({
        headers: { Authorization: "Bearer " + token }
      })
      .then(d => {
        if (d.courseWork)
          this.cards.push(
            ...d.courseWork.map(
              (a: CourseWork): CardContent => ({
                type: "CourseWork",
                content: a
              })
            )
          );
      })
      .catch(e => {
        this.errors.push(
          `${this.courses[course_id].name}の課題の取得に失敗しました:${e}`
        );
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  get_card_title(a: CardContent) {
    switch (a.type) {
      case "Announcement":
        return "お知らせ";
      case "CourseWork":
        return "課題: " + a.content.title;
    }
  }

  get_card_variant(a: CardContent) {
    switch (a.type) {
      case "Announcement":
        return "secondary";
      case "CourseWork":
        return "primary";
    }
  }

  get_card_id(a: CardContent) {
    return a.type + a.content.id;
  }

  get_card_course_name(a: CardContent) {
    return this.courses[a.content.courseId].name;
  }

  get_card_user_name(a: CardContent) {
    const token = get_token();
    if (token === null) return "";

    if (!(a.content.creatorUserId in this.user_name_map)) {
      Vue.set(this.user_name_map, a.content.creatorUserId, "");
      api(axios())
        .v1.userProfiles._userId(a.content.creatorUserId)
        .$get({ headers: { Authorization: "Bearer  " + token } })
        .then(d =>
          Vue.set(this.user_name_map, a.content.creatorUserId, d.name.fullName)
        );
      return "";
    }
    return this.user_name_map[a.content.creatorUserId];
  }

  get_card_content(a: CardContent) {
    switch (a.type) {
      case "Announcement":
        return a.content.text;
      case "CourseWork":
        return a.content.description;
    }
  }

  get_card_link(a: CardContent) {
    return a.content.alternateLink;
  }

  get_card_created(a: CardContent) {
    return moment(a.content.creationTime).format(this.date_format);
  }

  get_card_updated(a: CardContent) {
    return moment(a.content.updateTime).format(this.date_format);
  }

  get_card_due(a: CardContent) {
    switch (a.type) {
      case "CourseWork":
        return moment({ ...a.content.dueDate, ...a.content.dueTime }).format(
          this.date_format
        );
      default:
        return "";
    }
  }
}
</script>
