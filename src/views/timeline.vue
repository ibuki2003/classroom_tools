<template>
  <div>
    <h1>{{ page_title }}</h1>
    <p>全クラスの投稿を時刻順に一覧表示します</p>
    <b-btn text="aaa" @click="get" :disabled="!logged_in">load</b-btn>
    <b-spinner v-if="pending"></b-spinner>

    <b-form class="border rounded p-2">
      <h2 @click="filter_form_toggle" style="cursor: pointer;">
        カードの絞り込み
      </h2>
      <b-collapse v-model="filter_form_visible">
        <b-form-group label="クラス">
          <multiselect
            searchable
            :multiple="true"
            :options="course_options"
            :close-on-select="false"
            v-model="filter_course"
            label="text"
            track-by="text"
          >
            <template slot="selection" slot-scope="{ values }">
              <!-- eslint-disable-next-line rulesdir/vue-template-simple-expr -->
              <span class="multiselect__single" v-if="values.length">
                {{ selected_course_names }}
              </span>
            </template>
          </multiselect>
        </b-form-group>
        <b-form-group label="投稿者">
          <multiselect
            searchable
            :multiple="true"
            :options="user_options"
            :close-on-select="false"
            v-model="filter_user"
            label="text"
            track-by="text"
          >
            <template slot="selection" slot-scope="{ values }">
              <!-- eslint-disable-next-line rulesdir/vue-template-simple-expr -->
              <span class="multiselect__single" v-if="values.length">
                {{ selected_user_names }}
              </span>
            </template>
          </multiselect>
        </b-form-group>
        <b-form-group label="種別">
          <b-form-checkbox-group v-model="filter_type" stacked>
            <b-form-checkbox value="Announcement">投稿</b-form-checkbox>
            <b-form-checkbox value="CourseWork">課題</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-form-group label="並べかえ">
          <b-form-radio-group v-model="sort_mode" stacked>
            <b-form-radio value="created">投稿日時</b-form-radio>
            <b-form-radio value="updated">最終更新</b-form-radio>
            <b-form-radio value="due">
              締め切り
              <b-icon-info-circle
                v-b-tooltip.hover
                title="課題以外は表示されません"
              />
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-collapse>
    </b-form>

    <b-alert
      variant="danger"
      v-for="(error, idx) of errors"
      :key="idx"
      class="apply-newline"
      show
    >
      {{ error }}
    </b-alert>

    <b-card
      no-body
      class="m-2"
      v-for="a of filtered_cards"
      :key="get_card_id(a)"
    >
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

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

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
import Multiselect from "vue-multiselect";

type CardContent =
  | {
      type: "Announcement";
      content: Announcement;
    }
  | {
      type: "CourseWork";
      content: CourseWork;
    };

interface Option {
  value: string;
  text: string;
}

@Component({
  components: {
    Multiselect
  }
})
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
        d.courses?.forEach(c => this.$set(this.courses, c.id, c));
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
        return moment({ ...a.content.dueDate, ...a.content.dueTime })
          .add(9, "hours")
          .format(this.date_format);
      default:
        return "";
    }
  }

  filter_form_visible = false;
  filter_form_toggle() {
    this.filter_form_visible = !this.filter_form_visible;
  }

  filter_course: Option[] = [];
  filter_user: Option[] = [];
  filter_type: CardContent["type"][] = ["Announcement", "CourseWork"];
  sort_mode: "created" | "updated" | "due" = "updated";

  get course_options() {
    return Object.keys(this.courses).map(k => ({
      value: k,
      text: this.courses[k].name
    }));
  }
  get user_options() {
    return Object.keys(this.user_name_map).map(k => ({
      value: k,
      text: this.user_name_map[k]
    }));
  }

  get selected_course_names() {
    return this.filter_course.map(a => a.text);
  }

  get selected_user_names() {
    return this.filter_user.map(a => a.text);
  }

  get filtered_cards() {
    let cards = this.cards;
    if (this.filter_course.length != 0) {
      const course_ids = new Set(this.filter_course.map(a => a.value));
      cards = cards.filter(card => course_ids.has(card.content.courseId));
    }
    if (this.filter_user.length != 0) {
      const user_ids = new Set(this.filter_user.map(a => a.value));
      cards = cards.filter(card => user_ids.has(card.content.creatorUserId));
    }
    if (this.filter_type.length != 0)
      cards = cards.filter(card => this.filter_type.indexOf(card.type) != -1);

    switch (this.sort_mode) {
      case "created":
        cards.sort((a, b) =>
          moment(b.content.creationTime).diff(moment(a.content.creationTime))
        );
        break;
      case "updated":
        cards.sort((a, b) =>
          moment(b.content.updateTime).diff(moment(a.content.updateTime))
        );
        break;
      case "due":
        cards = cards.filter(c => c.type === "CourseWork");
        cards.sort((a, b) => {
          if (a.type !== "CourseWork" || b.type !== "CourseWork") return NaN;
          const a_date = moment({ ...a.content.dueDate, ...a.content.dueTime });
          const b_date = moment({ ...b.content.dueDate, ...b.content.dueTime });
          return a_date.diff(b_date);
        });
        break;
    }
    return cards;
  }
}
</script>
