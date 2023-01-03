
module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    devServer: {
      allowedHosts: 'all',
    }
  },
  productionSourceMap: false,
  css: { extract: false }
};
