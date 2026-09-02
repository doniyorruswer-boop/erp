const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    hot: true,
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = "EduCRM - O'quv Markazlari Tizimi";
      return args;
    });
  }
})
