import packageJson from '../package.json'

const defaultFeatures = {
  /* Enable authentication using seed. Such auth has no 2FA.
   * WARN: for demo purposes only, could be very dangerous on prod
   */
  SEED_AUTH: true,

  PHOTO_VERIFICATION: true,
  KYC_REQUEST_STATES: ['approved', 'rejected', 'pending'],
  KYC_TASKS: {
    superAdmin: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: true
      }
    },
    photoMatch: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: true
      }
    },
    validPoa: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: true
      }
    },
    requestForAutoReviewSent: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: true
      }
    },
    requestForAutoReviewApproved: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: true
      }
    },
    accreditedInvestor: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: false
      }
    },
    nonLatinDocs: {
      exist: true,
      render: {
        add: true,
        remove: true
      },
      selected: {
        add: false,
        remove: false
      }
    }
  }
}

export default Object.assign(
  {
    install (Vue) {
      Vue.params = this
    },
    PAGE_LIMIT: 10,
    KEY_SERVER_ADMIN: process.env.KEY_SERVER_ADMIN,
    HORIZON_SERVER: process.env.HORIZON_SERVER,
    FILE_STORAGE: process.env.FILE_STORAGE,
    FEATURES: defaultFeatures,
    MASTER_ACCOUNT: '',
    NETWORK_PASSPHRASE: '',

    /**
     * Sets the logging level, for more options visit
     * https://www.npmjs.com/package/loglevel#documentation
     */
    LOG_LEVEL: 'trace',

    /**
     * Should be populated by DevOps team during the deployment
     * The field being displayed on login screen.
     */
    BUILD_VERSION: 'dev: ' + packageJson.version,

    ACCOUNT_ROLES: {
      // Will be updated on init
      notVerified: '',
      general: '',
      corporate: '',
      blocked: ''
    },

    SIGNER_ROLES: {
      // Will be updated on init
      default: ''
    },

    ASSET_TYPES: {
      // Will be updated on init
      default: '0',
      kycRequired: '1'
    }
  },
  process.env,
  document.ENV
)
