module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'vue',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // This will allow us to use browser context stuff like localStorage 
  // without eslint complaining.
  env: {
    browser: true
  },
  // More globals we don't want eslint to complain about in our js files.
  globals: {
    '$': true,
    '_': true,
    'utils': true
  }, 
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': ['production', 'staging', 'dev-build'].indexOf(process.env.NODE_ENV) > -1 ? 2 : 0
  }
}
