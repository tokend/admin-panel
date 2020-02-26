<template>
  <aside class="user-sidebar">
    <span class="user-sidebar__admin-logo">
      {{ "user-sidebar.admin-logo" | globalize }}
    </span>
    <span class="user-sidebar__admin-badge">
      {{ "user-sidebar.admin-panel" | globalize }}
    </span>

    <nav class="user-sidebar__nav user-sidebar__nav--full-height">
      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'users' }">
          <i class="mdi mdi-account user-sidebar__icon" />
          <span>{{ "user-sidebar.link-users" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'admins' }">
          <i class="mdi mdi-account-star user-sidebar__icon" />
          <span>{{ "user-sidebar.link-admins" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'assets' }">
          <i class="mdi mdi-coin user-sidebar__icon" />
          <span>{{ "user-sidebar.link-assets" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'sales' }">
          <i class="mdi mdi-coins user-sidebar__icon" />
          <span>{{ "user-sidebar.link-sales" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'polls' }">
          <i class="mdi mdi-vote user-sidebar__icon" />
          <span>{{ "user-sidebar.link-polls" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'offlineOperations' }">
          <i class="mdi mdi-sync-off user-sidebar__icon" />
          <span>{{ "user-sidebar.link-offline-op" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'kycRequests' }">
          <i class="mdi mdi-account-plus user-sidebar__icon" />
          <span>{{ "user-sidebar.link-kyc-requests" | globalize }}</span>
        </router-link>
      </li>
      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'kycRecoveryRequests' }">
          <i class="mdi mdi-account-plus user-sidebar__icon" />
          <span>{{ "user-sidebar.link-kyc-recovery-req" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'limits' }">
          <i class="mdi mdi-chart-bar user-sidebar__icon" />
          <span>{{ "user-sidebar.link-limits" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'trades' }">
          <i class="mdi mdi-chart-line-variant user-sidebar__icon" />
          <span>{{ "user-sidebar.link-trades" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'fees' }">
          <i class="mdi mdi-percent user-sidebar__icon" />
          <span>{{ "user-sidebar.link-fees" | globalize }}</span>
        </router-link>
      </li>

      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'keyValue' }">
          <i class="mdi mdi-table user-sidebar__icon" />
          <span>{{ "user-sidebar.link-key-value" | globalize }}</span>
        </router-link>
      </li>
    </nav>

    <nav class="user-sidebar__nav">
      <li class="user-sidebar__nav-li">
        <router-link :to="{ name: 'settings' }">
          <i class="mdi mdi-settings user-sidebar__icon" />
          <span>{{ "user-sidebar.link-settings" | globalize }}</span>
        </router-link>
      </li>
    </nav>
    <app-footer :need-version="false" />
  </aside>
</template>

<script>
import AppFooter from '@/components/App/components/AppFooter'
import config from '@/config'

export default {
  components: {
    AppFooter,
  },
  data () {
    return {
      config,
    }
  },
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

.user-sidebar__icon {
  color: $color-text-secondary;
  margin-right: 2.5rem;
  font-size: 2.4rem;
  line-height: 1;
  display: flex;
}
</style>
