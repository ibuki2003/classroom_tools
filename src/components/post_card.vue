<template>
  <b-card no-body class="m-2" v-on="$listeners">
    <b-card-header
      :header-bg-variant="card_variant"
      header-text-variant="white"
    >
      <template v-if="!small">
        <b-card-title>{{ card_title }}</b-card-title>
      </template>
      <template v-else>
        <b-link :href="card_link" class="text-plain">
          <b-card-title tag="h5">{{ card_title }}</b-card-title>
        </b-link>
      </template>
      <b-badge>{{ course_name }}</b-badge>
      <b-form-radio-group
        v-if="!small"
        v-model.number="fav_selected"
        :options="fav_options"
        plain
      ></b-form-radio-group>
    </b-card-header>
    <b-card-body>
      <b-card-text>
        {{ user_name }}
      </b-card-text>
      <b-link v-if="small" @click="toggle_text">
        {{ text_visible ? "詳細を閉じる" : "詳細を開く" }}
      </b-link>

      <!-- Element to collapse -->
      <b-collapse :visible="text_visible">
        <b-card-text class="apply-newline">
          {{ card_content }}
        </b-card-text>
      </b-collapse>
      <b-button v-if="!small" :href="card_link" class="card-link">
        開く
      </b-button>
    </b-card-body>
    <b-card-footer>
      <ul class="no-icon-list">
        <li>
          <b-icon-clock v-b-tooltip.hover title="投稿" />
          {{ card_created }}
        </li>
        <li>
          <b-icon-arrow-repeat v-b-tooltip.hover title="最終更新" />
          {{ card_updated }}
        </li>
        <li v-if="card_due">
          <b-icon-alarm v-b-tooltip.hover title="締切" />
          {{ card_due }}
        </li>
      </ul>
    </b-card-footer>
  </b-card>
</template>

<style>
.text-plain,
.text-plain:hover {
  color: inherit;
}
</style>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Announcement } from "@/apis/classroom/v1/courses/_courseId@string/announcements/@types";
import { CourseWork } from "@/apis/classroom/v1/courses/_courseId@string/courseWork/@type";
import moment from "moment";
import { selection_names } from "@/libs/posts_favs";

export type CardContent =
  | {
      type: "Announcement";
      content: Announcement;
    }
  | {
      type: "CourseWork";
      content: CourseWork;
    };

@Component
export default class PostCard extends Vue {
  readonly date_format = "YYYY-MM-DD HH:mm";

  @Prop({ required: true })
  readonly content!: CardContent;

  @Prop({ required: true })
  readonly course_name!: string;

  @Prop({ required: true })
  readonly user_name!: string;

  @Prop({ default: 0 })
  readonly value!: number; // fav selection

  @Prop({ default: false })
  readonly small!: boolean;

  text_visible = false;

  mounted() {
    if (!this.small) this.text_visible = true;
  }

  toggle_text() {
    this.text_visible = !this.text_visible;
  }

  get card_title() {
    switch (this.content.type) {
      case "Announcement":
        return "お知らせ";
      case "CourseWork":
        return "課題: " + this.content.content.title;
    }
    return "";
  }

  get card_variant() {
    switch (this.content.type) {
      case "Announcement":
        return "secondary";
      case "CourseWork":
        return "primary";
    }
    return "";
  }

  get card_content() {
    switch (this.content.type) {
      case "Announcement":
        return this.content.content.text;
      case "CourseWork":
        return this.content.content.description;
    }
    return "";
  }

  get card_link() {
    return this.content.content.alternateLink;
  }

  get card_created() {
    return moment(this.content.content.creationTime).format(this.date_format);
  }

  get card_updated() {
    return moment(this.content.content.updateTime).format(this.date_format);
  }

  get card_due() {
    switch (this.content.type) {
      case "CourseWork":
        return moment({
          ...this.content.content.dueDate,
          ...this.content.content.dueTime
        })
          .add(9, "hours")
          .format(this.date_format);
      default:
        return "";
    }
  }

  get fav_options() {
    return selection_names().map((v, i) => ({ value: i, text: v }));
  }

  get fav_selected() {
    return this.value;
  }

  set fav_selected(val: number) {
    this.$emit("input", val);
  }
}
</script>
