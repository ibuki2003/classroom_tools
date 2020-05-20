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
    <b-tabs>
      <b-tab title="タイムライン">
        <!-- eslint-disable rulesdir/vue-template-simple-expr -->
        <post-card
          v-for="a of cards"
          :key="get_card_id(a)"
          :content="a"
          :user_name="get_card_user_name(a)"
          :course_name="get_card_course_name(a)"
          :value="get_fav_sel(get_card_id(a))"
          @input="b => set_fav_sel(get_card_id(a), b)"
        />
        <!-- eslint-enable rulesdir/vue-template-simple-expr -->
      </b-tab>
      <b-tab title="Kanban">
        <div class="kanban-container">
          <b-container
            class="kanban-column m-1 border shadow-sm rounded"
            v-for="(l, i) in fav_list"
            :key="i"
          >
            <h3>{{ l }}</h3>
            <div
              class="kanban-list"
              :data-id="i"
              @dragover.prevent
              @dragenter="kanban_drag_enter"
              @dragleave="kanban_drag_leave"
              @drop="kanban_drop"
            >
              <post-card
                v-for="a in get_fav_cards(i)"
                :key="get_card_id(a)"
                :content="a"
                :user_name="get_card_user_name(a)"
                :course_name="get_card_course_name(a)"
                :value="get_fav_sel(get_card_id(a))"
                :data-id="get_card_id(a)"
                :small="true"
                draggable
                @dragstart="kanban_drag_start"
                @dragend="kanban_drag_end"
              />
            </div>
          </b-container>
        </div>
      </b-tab>
    </b-tabs>
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

.kanban-contianer,
.kanban-column,
.kanban-list {
  margin: 0;
  padding: 0;
}

.kanban {
  &-container {
    height: 90vh;
    overflow-x: auto;
    display: flex;
    justify-content: flex-start;
    margin: 0.5rem;
    h3 {
      padding-left: 1rem;
    }
  }
  &-column {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  &-list {
    // height: 100%;
    flex-grow: 1;
    overflow-y: scroll;
    width: 100%;
    &:not([data-drag-depth="0"]) {
      border-color: black;
      box-shadow: 0rem 0rem 100rem 100rem 100rem black;
    }
    &.drag-over {
      background-color: rgba(black, 0.1);
    }
    .drag-ghost {
      opacity: 0.1;
    }
  }
}
.drag-ghost {
  opacity: 0.1;
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
import PostCard, { CardContent } from "@/components/post_card.vue";
import { get_favs, set_fav, selection_names } from "../libs/posts_favs";

@Component({
  components: {
    PostCard
  }
})
export default class Timeline extends Vue {
  readonly page_title = "全クラス タイムライン";
  courses: { [key: string]: Course } = {};
  cards: CardContent[] = [];
  errors: string[] = [];
  user_name_map: { [key: string]: string } = {};
  pending = false;
  favs: { [key: string]: number } = {};

  mounted() {
    this.favs = get_favs();
  }
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
      });
  }

  sort_cards() {
    this.cards.sort((a, b) =>
      moment(b.content.updateTime).diff(moment(a.content.updateTime))
    );
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
        this.sort_cards();
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
        this.sort_cards();
      })
      .catch(e => {
        this.errors.push(
          `${this.courses[course_id].name}の課題の取得に失敗しました:${e}`
        );
        // eslint-disable-next-line no-console
        console.error(e);
      });
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

  get_fav_sel(a: string) {
    return this.favs[a];
  }

  set_fav_sel(a: string, val: number) {
    set_fav(a, val);
    this.favs = get_favs();
  }

  get fav_list() {
    return selection_names();
  }

  kanban_dragging_id?: string;

  get_fav_cards(idx: number) {
    return this.cards.filter(a => (this.favs[this.get_card_id(a)] || 0) == idx);
  }

  change_drag_depth(elm: HTMLElement, diff: number) {
    let val = Number.parseInt(elm.getAttribute("data-drag-depth") || "0");
    val += diff;
    if (val < 0) val = 0;
    elm.setAttribute("data-drag-depth", val.toString());
  }

  kanban_drag_enter(e: DragEvent) {
    const target = e.currentTarget;
    if (target === null) return;
    if (!(target instanceof HTMLElement)) return;
    this.change_drag_depth(target, 1);
  }

  kanban_drag_leave(e: DragEvent) {
    const target = e.currentTarget;
    if (target === null) return;
    if (!(target instanceof HTMLElement)) return;
    this.change_drag_depth(target, -1);
  }

  kanban_drag_start(e: DragEvent) {
    const target = e.currentTarget;
    if (target === null) return;
    if (!(target instanceof HTMLElement)) return;
    target.classList.add("drag-ghost");
    const attr = target.attributes.getNamedItem("data-id");
    if (attr) this.kanban_dragging_id = attr.value;
  }

  kanban_drag_end(e: DragEvent) {
    const target = e.currentTarget;
    if (target === null) return;
    if (!(target instanceof HTMLElement)) return;
    target.classList.remove("drag-ghost");
    this.kanban_dragging_id = undefined;
  }

  kanban_drop(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    this.change_drag_depth(target, -100); // remove
    const attr = target.attributes.getNamedItem("data-id");
    if (attr === null) return;
    const targ_idx = Number.parseInt(attr.value);
    if (this.kanban_dragging_id) {
      this.set_fav_sel(this.kanban_dragging_id, targ_idx);
      this.kanban_dragging_id = undefined;
    }
  }
}
</script>
