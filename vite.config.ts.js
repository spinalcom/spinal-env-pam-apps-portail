var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "vite";

// micro-apps.json
var micro_apps_default = {
  first: "micro-apps/first/index.html"
};

// vite.config.ts
var { createVuePlugin } = __require("vite-plugin-vue2");
var vite_config_default = defineConfig({
  publicDir: "public",
  plugins: [createVuePlugin()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: __spreadValues({
        "portail": "index.html"
      }, Object.keys(micro_apps_default).reduce((obj, item) => {
        const key = item.toString();
        obj[key] = micro_apps_default[key].toString();
        return obj;
      }, {}))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qXG4gKiBDb3B5cmlnaHQgMjAyMSBTcGluYWxDb20gLSB3d3cuc3BpbmFsY29tLmNvbVxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFNwaW5hbENvcmUuXG4gKlxuICogUGxlYXNlIHJlYWQgYWxsIG9mIHRoZSBmb2xsb3dpbmcgdGVybXMgYW5kIGNvbmRpdGlvbnNcbiAqIG9mIHRoZSBGcmVlIFNvZnR3YXJlIGxpY2Vuc2UgQWdyZWVtZW50IChcIkFncmVlbWVudFwiKVxuICogY2FyZWZ1bGx5LlxuICpcbiAqIFRoaXMgQWdyZWVtZW50IGlzIGEgbGVnYWxseSBiaW5kaW5nIGNvbnRyYWN0IGJldHdlZW5cbiAqIHRoZSBMaWNlbnNlZSAoYXMgZGVmaW5lZCBiZWxvdykgYW5kIFNwaW5hbENvbSB0aGF0XG4gKiBzZXRzIGZvcnRoIHRoZSB0ZXJtcyBhbmQgY29uZGl0aW9ucyB0aGF0IGdvdmVybiB5b3VyXG4gKiB1c2Ugb2YgdGhlIFByb2dyYW0uIEJ5IGluc3RhbGxpbmcgYW5kL29yIHVzaW5nIHRoZVxuICogUHJvZ3JhbSwgeW91IGFncmVlIHRvIGFiaWRlIGJ5IGFsbCB0aGUgdGVybXMgYW5kXG4gKiBjb25kaXRpb25zIHN0YXRlZCBvciByZWZlcmVuY2VkIGhlcmVpbi5cbiAqXG4gKiBJZiB5b3UgZG8gbm90IGFncmVlIHRvIGFiaWRlIGJ5IHRoZXNlIHRlcm1zIGFuZFxuICogY29uZGl0aW9ucywgZG8gbm90IGRlbW9uc3RyYXRlIHlvdXIgYWNjZXB0YW5jZSBhbmQgZG9cbiAqIG5vdCBpbnN0YWxsIG9yIHVzZSB0aGUgUHJvZ3JhbS5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIGxpY2Vuc2UgYWxvbmdcbiAqIHdpdGggdGhpcyBmaWxlLiBJZiBub3QsIHNlZVxuICogPGh0dHA6Ly9yZXNvdXJjZXMuc3BpbmFsY29tLmNvbS9saWNlbnNlcy5wZGY+LlxuICovXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmNvbnN0IHsgY3JlYXRlVnVlUGx1Z2luIH0gPSByZXF1aXJlKCd2aXRlLXBsdWdpbi12dWUyJyk7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGFwcHMgfSBmcm9tIFwiLi9taWNyby1hcHBzLmpzb25cIjtcbi8vIGltcG9ydCBjb21tb25qcyBmcm9tICdAcm9sbHVwL3BsdWdpbi1jb21tb25qcyc7XG4vLyBpbXBvcnQgeyB2aXRlQ29tbW9uanMgfSBmcm9tICdAb3JpZ2luanMvdml0ZS1wbHVnaW4tY29tbW9uanMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICBwbHVnaW5zOiBbY3JlYXRlVnVlUGx1Z2luKCldLFxuICBidWlsZDoge1xuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIFwicG9ydGFpbFwiOiBcImluZGV4Lmh0bWxcIixcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoYXBwcykucmVkdWNlKChvYmosIGl0ZW0pID0+IHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBpdGVtLnRvU3RyaW5nKCk7XG4gICAgICAgICAgb2JqW2tleV0gPSBhcHBzW2tleV0udG9TdHJpbmcoKTtcbiAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9LCB7fSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIC8vIG9wdGltaXplRGVwczoge1xuICAvLyAgIGVzYnVpbGRPcHRpb25zOiB7XG4gIC8vICAgICBwbHVnaW5zOiBbXG4gIC8vICAgICAgIGVzYnVpbGRDb21tb25qcyhbXCJ2dWUtcGxhY2VzXCJdKVxuICAvLyAgICAgXVxuICAvLyAgIH1cbiAgLy8gfVxufSk7XG5cblxuLy8gY29uc3QgeyBkZWZpbmVDb25maWcgfSA9IHJlcXVpcmUoJ0B2dWUvY2xpLXNlcnZpY2UnKVxuLy8gY29uc3QgeyBkZWZpbmVDb25maWcgfSA9IHJlcXVpcmUoJ0B2dWUvY2xpLXNlcnZpY2UnKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVDb25maWcoe1xuICAvLyB0cmFuc3BpbGVEZXBlbmRlbmNpZXM6IFtcbiAgICAvLyAndnVldGlmeSdcbiAgLy8gXVxuLy8gfSkiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLFNBQVMsb0JBQW9COzs7Ozs7OztBQUM3QixJQUFNLEVBQUUsZ0JBQWdCLElBQUksVUFBUTtBQU1wQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixXQUFXO0FBQUEsRUFDWCxTQUFTLENBQUMsZ0JBQWdCLENBQUM7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxXQUFXO0FBQUEsU0FDUixPQUFPLEtBQUssa0JBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxTQUFTO0FBQ3pDLGNBQU0sTUFBTSxLQUFLLFNBQVM7QUFDMUIsWUFBSSxPQUFPLG1CQUFLLEtBQUssU0FBUztBQUM5QixlQUFPO0FBQUEsTUFDVCxHQUFHLENBQUMsQ0FBQztBQUFBLElBRVQ7QUFBQSxFQUNGO0FBUUYsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
