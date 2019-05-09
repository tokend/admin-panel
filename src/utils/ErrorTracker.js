import * as sentry from '@/browser'
import * as Integrations from '@sentry/integrations'
import Vue from 'vue'

export class ErrorTracker {
  static init (config) {
    sentry.init({
      dsn: config.SENTRY_DSN,
      release: config.BUILD_VERSION,
      integrations: [
        new Integrations.Vue({
          Vue,
          attachProps: true,
        }),
      ],
    })
  }

  static setLoggedInUser ({ accountId = '', name = '' }) {
    sentry.configureScope((scope) => {
      scope.setUser({ accountId, name })
    })
  }

  static trackMessage (msg) {
    sentry.captureMessage(msg)
  }
}
