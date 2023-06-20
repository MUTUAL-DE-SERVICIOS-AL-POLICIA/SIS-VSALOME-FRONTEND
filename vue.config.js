require('dotenv').config();

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    // host: 'localhost',
    // port: 3005
    host: process.env.APP_URL,
    port: process.env.APP_PORT
  }
}
