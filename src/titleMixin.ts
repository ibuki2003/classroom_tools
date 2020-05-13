import Vue from "vue";
import { Mixin } from "vue-mixin-decorator";
import { Watch } from "vue-property-decorator";

const TITLE_SUFFIX = "Google Classroom Tools";
const TOP_TITLE = "Google Classroom Tools";
@Mixin
export default class TitleMixin extends Vue {
  @Watch("page_title", { immediate: true })
  onTitleChange(newTitle: unknown) {
    if (typeof newTitle === "string") {
      if (newTitle === "") document.title = TOP_TITLE;
      else document.title = newTitle + " - " + TITLE_SUFFIX;
    }
  }
}
