const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      extensions: [".ts", ".js", ".vue", ".json"],
    },
  },
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
  },
  chainWebpack: config => {
    config.module
      .rule('js')
      .test(/\.[jt]sx?$/);

    config.plugin('html').tap(args => {
      args[0].title = "EduCRM - O'quv Markazlari Tizimi";
      return args;
    });
  }
})
