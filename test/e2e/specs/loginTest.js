// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

/**
 * Test that user can login and see dashboard.
 */
module.exports = {
  'default e2e tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)

      // Test that user can see login.
      .assert.elementPresent('.login')
      .setValue('.js-login__username', 'demouser')
      .setValue('.js-login__password', 'testpass')
      .click('.js-login__submit')
      .pause(1000)

      // Test that user can see dashboard.
      .assert.containsText('.page-title h2', 'MY DASHBOARD')
      .pause(2000)
      .end()
  }
}
