module.exports = {
  configureWebpack: {
    output: {
      libraryExport: "default",
    },
    devServer: {
      allowedHosts: [".csb.app"],
    },
  },
  productionSourceMap: false,
  css: { extract: false },
};
