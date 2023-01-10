import esbuild from "esbuild";


export const replaceDirNameWithImportMetaUrl = (
  options: esbuild.BuildOptions
): esbuild.BuildOptions => {
  
  return {
    ...options,
    inject: [require.resolve('../../inject/importMetaUrl.js'), ...(options.inject || [])],
    define: {
      "import.meta.url": "importMetaUrl",
      "import.meta.resolve": "importMetaResolve",
      ...(options.define || {}),
    },
    pure: ["importMetaUrl", "importMetaResolve", ...(options.pure || [])],
  };
};
