import {
  isArray,
  isFunction,
  isPromise,
  isString
} from "./chunk-H5UISQNL.js";

// node_modules/@vuepress/shared/lib/esm/utils/resolveHeadIdentifier.js
var resolveHeadIdentifier = ([tag, attrs, content]) => {
  if (tag === "meta" && attrs.name) {
    return `${tag}.${attrs.name}`;
  }
  if (["title", "base"].includes(tag)) {
    return tag;
  }
  if (tag === "template" && attrs.id) {
    return `${tag}.${attrs.id}`;
  }
  return JSON.stringify([tag, attrs, content]);
};

// node_modules/@vuepress/shared/lib/esm/utils/dedupeHead.js
var dedupeHead = (head) => {
  const identifierSet = new Set();
  const result = [];
  head.forEach((item) => {
    const identifier = resolveHeadIdentifier(item);
    if (!identifierSet.has(identifier)) {
      identifierSet.add(identifier);
      result.push(item);
    }
  });
  return result;
};

// node_modules/@vuepress/shared/lib/esm/utils/ensureLeadingSlash.js
var ensureLeadingSlash = (str) => str.replace(/^\/?/, "/");

// node_modules/@vuepress/shared/lib/esm/utils/ensureEndingSlash.js
var ensureEndingSlash = (str) => /(\.html|\/)$/.test(str) ? str : str + "/";

// node_modules/@vuepress/shared/lib/esm/utils/formatDateString.js
var formatDateString = (str, defaultDateString = "") => {
  const dateMatch = str.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (dateMatch === null) {
    return defaultDateString;
  }
  const [, yearStr, monthStr, dayStr] = dateMatch;
  return [yearStr, monthStr.padStart(2, "0"), dayStr.padStart(2, "0")].join("-");
};

// node_modules/@vuepress/shared/lib/esm/utils/htmlEscape.js
var htmlEscapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
};
var htmlEscapeRegexp = /[&<>'"]/g;
var htmlEscape = (str) => str.replace(htmlEscapeRegexp, (char) => htmlEscapeMap[char]);

// node_modules/@vuepress/shared/lib/esm/utils/htmlUnescape.js
var htmlUnescapeMap = {
  "&amp;": "&",
  "&#38;": "&",
  "&lt;": "<",
  "&#60;": "<",
  "&gt;": ">",
  "&#62;": ">",
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&#34;": '"'
};
var htmlUnescapeRegexp = /&(amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
var htmlUnescape = (str) => str.replace(htmlUnescapeRegexp, (char) => htmlUnescapeMap[char]);

// node_modules/@vuepress/shared/lib/esm/utils/isLinkFtp.js
var isLinkFtp = (link) => link.startsWith("ftp://");

// node_modules/@vuepress/shared/lib/esm/utils/isLinkHttp.js
var isLinkHttp = (link) => /^(https?:)?\/\//.test(link);

// node_modules/@vuepress/shared/lib/esm/utils/isLinkExternal.js
var isLinkExternal = (link, base = "/") => {
  if (isLinkHttp(link) || isLinkFtp(link)) {
    return true;
  }
  if (link.startsWith("/") && !link.startsWith(base)) {
    return true;
  }
  return false;
};

// node_modules/@vuepress/shared/lib/esm/utils/isLinkMailto.js
var isLinkMailto = (link) => /^mailto:/.test(link);

// node_modules/@vuepress/shared/lib/esm/utils/isLinkTel.js
var isLinkTel = (link) => /^tel:/.test(link);

// node_modules/@vuepress/shared/lib/esm/utils/isPlainObject.js
var isPlainObject = (val) => Object.prototype.toString.call(val) === "[object Object]";

// node_modules/@vuepress/shared/lib/esm/utils/normalizePackageName.js
var normalizePackageName = (request, org, type = null) => {
  const orgPrefix = `${org}-`;
  const typePrefix = type === null ? "" : `${type}-`;
  const scopedMatch = request.match(/^@(.*)\/(.*)$/);
  if (scopedMatch === null) {
    if (request.startsWith(`${orgPrefix}${typePrefix}`)) {
      return request;
    }
    return `${orgPrefix}${typePrefix}${request}`;
  }
  const [, reqOrg, reqName] = scopedMatch;
  if (reqOrg === org) {
    if (reqName.startsWith(typePrefix)) {
      return request;
    }
    return `@${reqOrg}/${typePrefix}${reqName}`;
  }
  if (reqName.startsWith(`${orgPrefix}${typePrefix}`)) {
    return request;
  }
  return `@${reqOrg}/${orgPrefix}${typePrefix}${reqName}`;
};

// node_modules/@vuepress/shared/lib/esm/utils/removeEndingSlash.js
var removeEndingSlash = (str) => str.replace(/\/$/, "");

// node_modules/@vuepress/shared/lib/esm/utils/removeLeadingSlash.js
var removeLeadingSlash = (str) => str.replace(/^\//, "");

// node_modules/@vuepress/shared/lib/esm/utils/resolveLocalePath.js
var resolveLocalePath = (locales, routePath) => {
  const localePaths = Object.keys(locales).sort((a, b) => {
    const levelDelta = b.split("/").length - a.split("/").length;
    if (levelDelta !== 0) {
      return levelDelta;
    }
    return b.length - a.length;
  });
  for (const localePath of localePaths) {
    if (routePath.startsWith(localePath)) {
      return localePath;
    }
  }
  return "/";
};

// node_modules/@vuepress/shared/lib/esm/utils/resolveRoutePathFromUrl.js
var resolveRoutePathFromUrl = (url, base = "/") => url.replace(/^(https?:)?\/\/[^/]*/, "").replace(new RegExp(`^${base}`), "/");
export {
  dedupeHead,
  ensureEndingSlash,
  ensureLeadingSlash,
  formatDateString,
  htmlEscape,
  htmlUnescape,
  isArray,
  isFunction,
  isLinkExternal,
  isLinkFtp,
  isLinkHttp,
  isLinkMailto,
  isLinkTel,
  isPlainObject,
  isPromise,
  isString,
  normalizePackageName,
  removeEndingSlash,
  removeLeadingSlash,
  resolveHeadIdentifier,
  resolveLocalePath,
  resolveRoutePathFromUrl
};
//# sourceMappingURL=@vuepress_shared.js.map
