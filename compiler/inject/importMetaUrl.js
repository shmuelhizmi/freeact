//from https://github.com/egoist/tsup/blob/dev/assets/cjs_shims.js

const getImportMetaUrl = () =>
  typeof document === 'undefined'
    ? new URL('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href

export const importMetaUrl = /* @__PURE__ */ getImportMetaUrl()

export const importMetaResolve = /* @__PURE__ */ (path) => {
  const folder = new URL(".", importMetaUrl).href;
  return new URL(path, folder).href;
};
