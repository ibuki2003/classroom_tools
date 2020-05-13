import jscookie from "js-cookie";
const endpoint_base = "https://accounts.google.com/o/oauth2/v2/auth";

type OAuthPromptType = "none" | "consent" | "select_account";

interface TokenCookie {
  token: string;
  token_type: "Bearer";
  expires: string;
}

function get_endpoint(
  client_id: string,
  redirect_uri: string,
  response_type: string,
  scope: string[],
  state?: string,
  prompt?: OAuthPromptType[]
) {
  let url = endpoint_base;
  url += "?client_id=" + encodeURIComponent(client_id);
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  url += "&response_type=" + encodeURIComponent(response_type);

  if (scope) url += "&scope=" + encodeURIComponent(scope.join(" "));
  if (state) url += "&state=" + encodeURIComponent(state);
  if (prompt) url += "&prompt=" + encodeURIComponent(prompt.join(" "));

  return url;
}

export function parse_response_hash(hash: string) {
  if (hash.startsWith("#")) hash = hash.substr(1);
  const hash_frag = hash.split("&").map(a => a.split("="));
  const hash_map: { [key: string]: string } = {};
  hash_frag.forEach(a => {
    if (a.length == 2) {
      hash_map[a[0]] = decodeURIComponent(a[1]);
    } else {
      hash_map[a[0]] = "";
    }
  });
  if ("error" in hash_map) return false;
  const token = hash_map.access_token;
  const token_type = hash_map.token_type;
  const expires_in = hash_map.expires_in;
  if (
    token === undefined ||
    token_type === undefined ||
    expires_in === undefined
  )
    return false;
  const expires = new Date(
    +new Date() + Number.parseInt(expires_in)
  ).toString();
  jscookie.set("google_token", { token, token_type, expires } as TokenCookie);

  return hash_map?.state || true;
}

export function is_token_available() {
  const token: TokenCookie | undefined = jscookie.getJSON("google_token");
  if (token === undefined) return false;
  return new Date(token.expires) > new Date();
}

export function get_token() {
  const token: TokenCookie | undefined = jscookie.getJSON("google_token");
  if (token === undefined) return null;
  return token.token;
}

export function login(...a: Parameters<typeof get_endpoint>) {
  location.href = get_endpoint(...a);
}

export function logout() {
  jscookie.remove("google_token");
}
