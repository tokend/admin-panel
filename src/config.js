const features = {
  PHOTO_VERIFICATION: true,
  KYC_REVIEW_MANAGER: false,
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
    install (Vue, options) {
      Vue.params = this
    },
    ONE: 10000,
    PAGE_LIMIT: 10,
    KEY_SERVER_ADMIN: process.env.KEY_SERVER_ADMIN,
    HORIZON_SERVER: process.env.HORIZON_SERVER,
    STORAGE_SERVER: process.env.STORAGE_SERVER,
    FEATURES: features,
    MASTER_ACCOUNT: '',
    COMMISSION_ACCOUNT: 'GAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHV4',
    OPERATIONAL_ACCOUNT: 'GABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVCX',
    STORAGE_FEE_ACCOUNT: 'GABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEQO',
    NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',

    accountTypes: {
      0: 'New',
      1: 'Operational',
      2: 'General',
      3: 'Commission',
      4: 'Master',
      5: 'Exchange',
      6: 'Not Verified',
      7: 'Storage Fee Manager'
    },

    signerTypes: {
      'Reader': 1,
      'Not Verified Account Manager': 2,
      'General Account Manager': 4,
      'Exchange Account Manager': 8,
      'Demurrage Operator': 16,
      'Direct Debit Operator': 32,
      'Forfeit Operator': 64,
      'Asset Manager': 128,
      'Asset Rate Manager': 256,
      'Balance Manager': 512,
      'Emission Manager': 1024,
      'Invoice Manager': 2048,
      'Payment Operator': 4096,
      'Limits Manager': 8192,
      'Account Manager': 16384,
      'Commission Balance Manager': 32768,
      'Operational Balance Manager': 65536,
      'Demurrage Balance Manager': 131072
    }
  },
  process.env,
  document.ENV
)
