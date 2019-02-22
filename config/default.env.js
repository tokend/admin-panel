module.exports = {
  NODE_ENV: '"default"',
  HORIZON_SERVER: '"https://api.testnet.tokend.org"',
  STORAGE_SERVER: '"https://storage.testnet.tokend.org/api"',
  KEY_SERVER_ADMIN: '"https://admin.testnet.tokend.org/_/adks"',
  NETWORK_PASSPHRASE: '"TokenD Testnet Network"',
  FEATURES: {
    /* Enable authentication using seed. Such auth has no 2FA.
    * WARN: for demo purposes only, could be very dangerous on prod
    */
    SEED_AUTH: true,

    PHOTO_VERIFICATION: true,
    KYC_REQUEST_STATES: [
      '"approved"',
      '"rejected"',
      '"pending"'
    ],
    KYC_TASKS: {
      superAdmin: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: true
        }
      },
      photoMatch: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: true
        }
      },
      validPoa: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: true
        }
      },
      requestForAutoReviewSent: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: true
        }
      },
      requestForAutoReviewApproved: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: true
        }
      },
      accreditedInvestor: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: false
        }
      },
      nonLatinDocs: {
        exist: true,
        render: {
          add: false,
          remove: false
        },
        selected: {
          add: false,
          remove: false
        }
      }
    }
  }
}
