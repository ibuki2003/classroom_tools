import jscookie from "js-cookie";

export const fav_num = 4;

const name_default_prefix = "Fav ";
const cookie_key = "fav_names";
const localstorage_key = "posts_favs";

function get_from_cookie(): string[] {
  const cnames = jscookie.getJSON(cookie_key);
  if (!Array.isArray(cnames)) {
    return [];
  }
  if (cnames.every(a => typeof a === "string")) return cnames;
  else return [];
}

export function selection_names() {
  const cnames = get_from_cookie();
  if (cnames.length == fav_num) return cnames;
  const new_names = new Array(fav_num)
    .fill(0)
    .map((_v, i) =>
      i < cnames.length ? cnames[i] : name_default_prefix + (i + 1).toString()
    );
  jscookie.set(cookie_key, new_names);
  return new_names;
}

export function set_name(idx: number, name: string) {
  if (idx < 0 || fav_num <= idx) return;
  const old = get_from_cookie();
  old[idx] = name;
  jscookie.set(cookie_key, old);
}

export function get_favs(): { [key: string]: number } {
  const favs = localStorage.getItem(localstorage_key);
  return favs ? JSON.parse(favs) : {};
}

export function set_fav(id: string, idx: number) {
  const fav_obj = get_favs();
  fav_obj[id] = idx;
  localStorage.setItem(localstorage_key, JSON.stringify(fav_obj));
}
