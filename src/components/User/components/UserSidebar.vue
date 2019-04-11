<template>
  <aside class="user-sidebar">
    <span class="user-sidebar__admin-logo">TokenD</span>
    <span class="user-sidebar__admin-badge">ADMIN PANEL</span>

    <nav class="user-sidebar__nav user-sidebar__nav--full-height">
      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'users' }">
          <mdi-account-icon/>
          <span>Users</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'admins' }">
          <mdi-account-star-icon/>
          <span>Admins</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'systemAssets' }">
          <mdi-coin-icon/>
          <span>System Assets</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'kycRequests' }">
          <mdi-account-plus-icon/>
          <span>KYC Requests</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'limits' }">
          <mdi-chart-bar-icon/>
          <span>Limits</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'trades' }">
          <mdi-chart-line-variant-icon/>
          <span>Trades</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'fees' }">
          <mdi-percent-icon/>
          <span>Fees</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'keyValue' }">
          <mdi-table-icon/>
          <span>Key Value</span>
        </router-link>
      </li>

      <div class="user-sidebar__nav-section-heading">
        CORPORATE
      </div>

      <li class="user-sidebar__nav-li">
        <!-- NOTE: temporarily hidden -->
        <router-link :to="{ name: 'assets' }">
          <mdi-coins-icon/>
          <span>Assets</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'sales' }">
          <mdi-coins-icon/>
          <span>Sales</span>
        </router-link>
      </li>
    </nav>

    <nav class="user-sidebar__nav">
      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'settings' }">
          <mdi-settings-icon/>
          <span>Settings</span>
        </router-link>
      </li>
    </nav>
  </aside>
</template>

<script>
import 'mdi-vue/AccountIcon'
import 'mdi-vue/SettingsIcon'
import 'mdi-vue/PercentIcon'
import 'mdi-vue/CoinsIcon'
import 'mdi-vue/CoinIcon'
import 'mdi-vue/BookIcon'
import 'mdi-vue/OpenInNewIcon'
import 'mdi-vue/ChartLineVariantIcon'
import 'mdi-vue/AccountPlusIcon'
import 'mdi-vue/ChartBarIcon'
import 'mdi-vue/TableIcon'

import '@/assets/mdi/AccountStarIcon'
import config from '@/config'
export default {
  data () {
    return {
      config
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.user-sidebar {
  width: 100%;
  height: 100%;
  background-color: $color-sidebar-bg;
  color: $color-text-inverse;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.user-sidebar__admin-logo,
.user-sidebar__admin-badge {
  color: $color-text;
}

.user-sidebar__admin-logo {
  text-align: center;
  padding: 20px;
  font-size: 20px;
}

.user-sidebar__logo {
  display: block;
  pointer-events: none;
  margin: 2rem auto 0;
  width: 10rem;
  height: 3.867rem;
}

.user-sidebar__admin-badge {
  display: inline-block;
  margin: 0.7rem auto 0.3rem;
  font-size: 1.2rem;
  width: 100%;
  text-align: center;
  opacity: 0.5;
  letter-spacing: 0.08rem;
}

.user-sidebar__nav {
  padding: 2rem 0 2rem;

  &--full-height {
    flex: 1;
  }
}

.user-sidebar__nav-li {
  & + & {
    margin-top: 0.6rem;
  }

  & > a {
    display: flex;
    align-items: center;
    color: $color-text;
    text-decoration: none;
    padding: 0.7rem 0 0.7rem 1.8rem;

    & > .mdi-icon {
      fill: $color-text-secondary;
      margin-right: 2.5rem;
    }

    & > .user-sidebar__inline-ico {
      fill: rgba($color: $color-text-secondary, $alpha: 0.5);
      width: 1.4rem;
      height: 1.4rem;
      margin-left: 0.7rem;
    }

    &.router-link-active > span {
      text-decoration: underline;
      text-decoration-skip: ink;
    }

    &:hover {
      background-color: #e6e6e6;
    }
  }
}

.user-sidebar__nav-section-heading {
  margin-top: 4rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  letter-spacing: 0.12rem;
  opacity: 0.51;
  padding-left: 1.6rem;
}
</style>
