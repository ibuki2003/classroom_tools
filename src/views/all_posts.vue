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
    <b-tabs v-if="!reload" v-model="tabIndex">
      <b-tab title="タイムライン">
        <!-- eslint-disable rulesdir/vue-template-simple-expr -->
        <post-card
          v-for="a of filter_cards(cards)"
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
            <h3
              class="kanban-column-title"
              v-if="!is_editing_fav_name(i)"
              @dblclick="edit_start_fav_name(i)"
            >
              {{ l }}
            </h3>
            <b-input
              v-show="is_editing_fav_name(i)"
              :data-id="i"
              :value="l"
              @blur="edit_end_fav_name(i, $event)"
              @keyup.enter="edit_end_fav_name(i, $event)"
              ref="fav_edit_box"
            />
            <div
              class="kanban-list"
              :data-id="i"
              @dragover.prevent
              @dragenter="kanban_drag_enter"
              @dragleave="kanban_drag_leave"
              @drop="kanban_drop"
            >
              <post-card
                v-for="a in filter_cards(get_fav_cards(i))"
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
    &-title {
      cursor: pointer;
    }
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
import {
  get_favs,
  set_fav,
  selection_names,
  set_name
} from "../libs/posts_favs";

import Multiselect from "vue-multiselect";

interface Option {
  value: string;
  text: string;
}

@Component({
  components: {
    PostCard,
    Multiselect
  }
})
export default class Timeline extends Vue {
  readonly page_title = "全クラス タイムライン";
  reload = false;
  courses: { [key: string]: Course } = {};
  cards: CardContent[] = [];
  errors: string[] = [];
  user_name_map: { [key: string]: string } = {};
  pending = false;
  favs: { [key: string]: number } = {};
  fav_list: string[] = [];

  tabIndex = 0;

  mounted() {
    this.favs = get_favs();
    this.fav_list = selection_names();
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
        d.courses?.slice(0, 1).forEach(c => this.$set(this.courses, c.id, c));
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

  filter_form_visible = false;
  filter_form_toggle() {
    this.filter_form_visible = !this.filter_form_visible;
  }

  filter_course: Option[] = [];
  filter_user: Option[] = [];
  filter_type: CardContent["type"][] = ["Announcement", "CourseWork"];
  filter_fav: string[] = [];
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

  filter_cards(cards: CardContent[]) {
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

  fav_editing: number | null = null;

  is_editing_fav_name(idx: number) {
    return this.fav_editing === idx;
  }

  edit_start_fav_name(idx: number) {
    this.fav_editing = idx;
    this.$nextTick(() => this.on_edit_box_mounted());
  }

  on_edit_box_mounted() {
    const editbox = this.$refs.fav_edit_box;
    let elm: Element[];
    if (Array.isArray(editbox)) {
      if (editbox.length == 0) {
        return;
      }
      if (((e): e is Element[] => e[0] instanceof Element)(editbox))
        elm = editbox;
      else elm = editbox.map(e => e.$el);
    } else {
      if (editbox instanceof Element) elm = [editbox];
      else elm = [editbox.$el];
    }
    const target: HTMLElement[] = elm
      .filter<HTMLElement>((e): e is HTMLElement => e instanceof HTMLElement)
      .filter(
        e =>
          Number.parseInt(e.getAttribute("data-id") || "") === this.fav_editing
      );
    if (target.length) target[0].focus();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edit_end_fav_name(idx: number, e: any) {
    this.fav_editing = null;
    const target = e.currentTarget;
    if (target === null) return;
    if (!(target instanceof HTMLInputElement)) return;
    set_name(idx, target.value);
    this.fav_list = selection_names();
    this.reload = true;
    this.$nextTick(() => (this.reload = false));
  }
}
</script>
