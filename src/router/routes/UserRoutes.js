// TODO refactor, extract require

import { authorizedGuard } from '../helpers/navigationGuards'

// Each of these routes are loaded asynchronously,
// when a user first navigates to each corresponding endpoint.
//
// The route will load once into memory, the first time it's called,
// and no more on future calls.
//
// This behavior can be observed on the network tab of your browser dev tools.

export const UserRoutes = {
  path: '/user',
  name: 'user',
  redirect: { name: 'users' },
  beforeEnter: authorizedGuard,
  component (resolve) { require(['../../components/User/User.vue'], resolve) },
  children: [
    {
      path: '/users',
      name: 'users',
      redirect: { name: 'users.index' },
      component: function (resolve) {
        require(['../../components/User/Users/Users.vue'], resolve)
      },
      children: [
        {
          path: '',
          name: 'users.index',
          component: function (resolve) {
            require(['../../components/User/Users/Users.Index.vue'], resolve)
          },
        },
        {
          path: ':id',
          name: 'users.show',
          redirect: { name: 'users.userDetails' },
          component: function (resolve) {
            require(['../../components/User/Users/Users.Show.vue'], resolve)
          },
          props: true,
          children: [
            {
              path: '',
              name: 'users.userDetails',
              component: function (resolve) {
                require(['../../components/User/Users/components/UserAccountDetails.vue'], resolve)
              },
              props: true,
            },
            {
              path: 'operation-details/:operationId',
              name: 'users.operationDetails',
              component: function (resolve) {
                require(['../../components/User/Operations/OperationDetails.vue'], resolve)
              },
              props: true,
            },
          ],
        },
      ],
    },
    {
      path: '/kyc-requests',
      name: 'kycRequests',
      redirect: { name: 'kycRequests.index' },
      component: function (resolve) {
        require(['../../components/User/KycRequests/KycRequests.vue'], resolve)
      },
      children: [
        {
          path: 'index',
          name: 'kycRequests.index',
          component: function (resolve) {
            require(['../../components/User/KycRequests/KycRequests.Index.vue'], resolve)
          },
        },
        {
          path: 'queue',
          name: 'kycRequests.queue',
          component: function (resolve) {
            require(['../../components/User/KycRequests/KycRequests.Queue.vue'], resolve)
          },
        },
      ],
    },
    {
      path: '/kyc-recovery-requests',
      name: 'kycRecoveryRequests',
      redirect: { name: 'kycRecoveryRequests.index' },
      component: function (resolve) {
        require(['../../components/User/KycRecoveryRequests/KycRecoveryRequests.vue'], resolve)
      },
      children: [
        {
          path: 'index',
          name: 'kycRecoveryRequests.index',
          component: function (resolve) {
            require(['../../components/User/KycRecoveryRequests/KycRecoveryRequests.Index.vue'], resolve)
          },
        },
      ],
    },
    {
      path: '/limits',
      name: 'limits',
      redirect: { name: 'limits.index' },
      component: function (resolve) {
        require(['../../components/User/Limits/Limits.vue'], resolve)
      },
      children: [
        {
          path: 'index',
          name: 'limits.index',
          component: function (resolve) {
            require(['../../components/User/Limits/Limits.Index.vue'], resolve)
          },
        },
        {
          path: 'requests',
          name: 'limits.requests',
          component: function (resolve) {
            require(['../../components/User/Limits/Limits.Requests.vue'], resolve)
          },
        },
        {
          path: 'requests/:id',
          name: 'limits.reviewer',
          component: function (resolve) {
            require(['../../components/User/Limits/Limits.Reviewer.vue'], resolve)
          },
          props: true,
        },
      ],
    },
    {
      path: '/admins',
      name: 'admins',
      redirect: { name: 'admins.index' },
      component: function (resolve) {
        require(['../../components/User/Admins/Admins.vue'], resolve)
      },
      children: [
        {
          path: 'new',
          name: 'admins.new',
          component: function (resolve) {
            require(['../../components/User/Admins/Admins.New.vue'], resolve)
          },
        },
        {
          path: '',
          name: 'admins.index',
          component: function (resolve) {
            require(['../../components/User/Admins/Admins.Index.vue'], resolve)
          },
        },
        {
          path: ':id',
          name: 'admins.show',
          component: function (resolve) {
            require(['../../components/User/Admins/Admins.Show.vue'], resolve)
          },
          props: true,
        },
      ],
    },

    {
      path: '/offline-operations',
      name: 'offlineOperations',
      redirect: { name: 'offlineOperations.preIssuance' },
      component: function (resolve) {
        require(['../../components/User/OfflineOperations/OfflineOperations.vue'], resolve)
      },
      children: [
        {
          path: 'pre-issuance',
          name: 'offlineOperations.preIssuance',
          component: function (resolve) {
            require(['../../components/User/OfflineOperations/Preissuance/Preissuance.vue'], resolve)
          },
        },
        {
          path: 'change-asset-issuer',
          name: 'offlineOperations.changeAssetIssuer',
          component: function (resolve) {
            require(['../../components/User/OfflineOperations/ChangeAssetIssuer/ChangeAssetIssuer.vue'], resolve)
          },
        },
        {
          path: 'pre-issuance-requests',
          name: 'offlineOperations.preIssuanceRequests',
          redirect: { name: 'offlineOperations.preIssuanceRequests.index' },
          component: function (resolve) {
            require(['../../components/User/OfflineOperations/PreIssuanceRequests/PreIssuanceRequests.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'offlineOperations.preIssuanceRequests.index',
              component: function (resolve) {
                require(['../../components/User/OfflineOperations/PreIssuanceRequests/PreIssuanceRequests.Index.vue'], resolve)
              },
            },
          ],
        },
      ],
    },

    {
      path: '/assets',
      name: 'assets',
      redirect: { name: 'assets.systemAssets' },
      component: function (resolve) {
        require(['../../components/User/Assets/Assets.vue'], resolve)
      },
      children: [
        {
          path: 'issuance',
          name: 'assets.issuance',
          component: function (resolve) {
            require(['../../components/User/Assets/Issuance/Issuance.vue'], resolve)
          },
        },
        {
          path: 'issuance/:id',
          name: 'assets.issuance.props',
          component: function (resolve) {
            require(['../../components/User/Assets/Issuance/IssuanceDetails.vue'], resolve)
          },
          props: true,
        },
        {
          path: 'withdrawals',
          name: 'assets.withdrawals',
          redirect: { name: 'assets.withdrawals.index' },
          component: function (resolve) {
            require(['../../components/User/Assets/Withdrawals/Withdrawals.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'assets.withdrawals.index',
              component: function (resolve) {
                require(['../../components/User/Assets/Withdrawals/Withdrawals.Index.vue'], resolve)
              },
            },
          ],
        },
        {
          path: 'pairs',
          name: 'assets.assetPairs',
          redirect: { name: 'assets.assetPairs.index' },
          component: function (resolve) {
            require(['../../components/User/Assets/AssetPairs/AssetPairs.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'assets.assetPairs.index',
              component: function (resolve) {
                require(['../../components/User/Assets/AssetPairs/AssetPairs.Index.vue'], resolve)
              },
            },
            {
              path: ':base-:quote',
              name: 'assets.assetPairs.show',
              component: function (resolve) {
                require(['../../components/User/Assets/AssetPairs/AssetPairs.Show.vue'], resolve)
              },
              props: true,
            },
            {
              path: 'new',
              name: 'assets.assetPairs.new',
              component: function (resolve) {
                require(['../../components/User/Assets/AssetPairs/AssetPairs.New.vue'], resolve)
              },
              props: true,
            },
          ],
        },
        {
          path: 'system-assets',
          name: 'assets.systemAssets',
          redirect: { name: 'assets.systemAssets.index' },
          component: function (resolve) {
            require(['../../components/User/Assets/SystemAssets/SystemAssets.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'assets.systemAssets.index',
              component: function (resolve) {
                require(['../../components/User/Assets/SystemAssets/SystemAssets.Index.vue'], resolve)
              },
            },
            {
              path: 'new',
              name: 'assets.systemAssets.new',
              component: function (resolve) {
                require(['../../components/User/Assets/SystemAssets/SystemAssets.New.vue'], resolve)
              },
            },
            {
              path: ':asset',
              name: 'assets.systemAssets.show',
              component: function (resolve) {
                require(['../../components/User/Assets/SystemAssets/SystemAssets.Show.vue'], resolve)
              },
              props: true,
            },
          ],
        },
        {
          path: 'requests',
          name: 'assets.assetRequests',
          redirect: { name: 'assets.requests.index' },
          component: function (resolve) {
            require(['../../components/User/Assets/AssetRequests/AssetRequests.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'assets.requests.index',
              component: function (resolve) {
                require(['../../components/User/Assets/AssetRequests/AssetRequests.Index.vue'], resolve)
              },
            },
            {
              path: ':id',
              name: 'assets.requests.show',
              component: function (resolve) {
                require(['../../components/User/Assets/AssetRequests/AssetRequests.Show.vue'], resolve)
              },
              props: true,
            },
          ],
        },
      ],
    },

    {
      path: '/sales',
      name: 'sales',
      redirect: { name: 'sales.index' },
      component: function (resolve) {
        require(['../../components/User/Sales/Sales.vue'], resolve)
      },
      children: [
        {
          path: 'requests',
          name: 'sales.requests',
          redirect: { name: 'sales.requests.index' },
          component: function (resolve) {
            require(['../../components/User/Sales/SaleRequests/SaleRequests.vue'], resolve)
          },
          children: [
            {
              path: '',
              name: 'sales.requests.index',
              component: function (resolve) {
                require(['../../components/User/Sales/SaleRequests/SaleRequests.Index.vue'], resolve)
              },
            },
            {
              path: ':id',
              name: 'sales.requests.show',
              component: function (resolve) {
                require(['../../components/User/Sales/SaleRequests/SaleRequests.Show.vue'], resolve)
              },
              props: true,
            },
          ],
        },
        {
          path: '',
          name: 'sales.index',
          component: function (resolve) {
            require(['../../components/User/Sales/Sales.Index.vue'], resolve)
          },
        },
        {
          path: ':id',
          name: 'sales.show',
          component: function (resolve) {
            require(['../../components/User/Sales/Sales.Show.vue'], resolve)
          },
          props: true,
        },
      ],
    },

    {
      path: '/key-value',
      name: 'keyValue',
      redirect: { name: 'keyValue.index' },
      component: function (resolve) {
        require(['../../components/User/KeyValue/KeyValue.vue'], resolve)
      },
      children: [
        {
          path: '',
          name: 'keyValue.index',
          component: function (resolve) {
            require(['../../components/User/KeyValue/KeyValue.Index.vue'], resolve)
          },
        },
      ],
    },

    {
      path: '/fees',
      name: 'fees',
      redirect: { name: 'fees.index' },
      component: function (resolve) {
        require(['../../components/User/Fees/Fees.vue'], resolve)
      },
      children: [
        {
          path: '',
          name: 'fees.index',
          component: function (resolve) {
            require(['../../components/User/Fees/Fees.Index.vue'], resolve)
          },
        },
        {
          path: '/balances',
          name: 'fees-balances.index',
          component: function (resolve) {
            require(
              ['../../components/User/Fees/FeesBalances.Index.vue'], resolve
            )
          },
        },
      ],
    },

    {
      path: '/trades',
      name: 'trades',
      redirect: { name: 'trades.index' },
      component: function (resolve) {
        require(['../../components/User/Trades/Trades.vue'], resolve)
      },
      children: [
        {
          path: '',
          name: 'trades.index',
          component: function (resolve) {
            require(['../../components/User/Trades/Trades.Index.vue'], resolve)
          },
        },
      ],
    },
    {
      path: '/settings',
      name: 'settings',
      component: function (resolve) {
        require(['../../components/settings/Settings.vue'], resolve)
      },
    },
    {
      path: '/settings/tfa',
      name: 'settings.tfa',
      component: function (resolve) {
        require(['../../components/settings/GAuth.vue'], resolve)
      },
    },
  ],
}
