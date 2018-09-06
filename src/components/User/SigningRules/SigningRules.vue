<template>
  <div class="signing-rules">
    <user-header/>

    <div class="app__user-container">
      <div class="app__block">
        <h2 class="">Signing rules</h2>
        <table class="signing-rules__table" id="signing-rules-table">
          <tr>
            <th>Operation</th>
            <th>Source account type</th>
            <th>Signer type</th>
            <th>Threshold</th>
          </tr>
          <tr>
            <td>Transaction source</td>
            <td>ANY</td>
            <td>ANY</td>
            <td>LOW</td>
          </tr>
          <tr>
            <td>CREATE_ACCOUNT (account type of to be created is NOT_VERIFIED)</td>
            <td>MASTER</td>
            <td>SIGNER_NOT_VERIFIED_ACC_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>CREATE_ACCOUNT (account type of to be created is GENERAL)</td>
            <td>MASTER</td>
            <td>SIGNER_GENERAL_ACC_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>CREATE_ACCOUNT (account type of to be created is EXCHANGE)</td>
            <td>MASTER</td>
            <td>SIGNER_EXCHANGE_ACC_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>DEMURRAGE</td>
            <td>MASTER</td>
            <td>SIGNER_DEMURRAGE_OPERATOR</td>
            <td>LOW</td>
          </tr>
          <tr>
            <td>DIRECT_DEBIT</td>
            <td>ANY</td>
            <td>SIGNER_DIRECT_DEBIT_OPERATOR</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>FORFEIT</td>
            <td>EXCHANGE, MASTER</td>
            <td>SIGNER_FORFEIT_OPERATOR</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>MANAGE_ACCOUNT (account's type to be managed is NOT_VERIFIED)</td>
            <td>MASTER</td>
            <td>SIGNER_NOT_VERIFIED_ACC_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>MANAGE_ACCOUNT (account's type to be managed is GENERAL)</td>
            <td>MASTER</td>
            <td>SIGNER_NOT_VERIFIED_ACC_MANAGER, SIGNER_GENERAL_ACC_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>MANAGE_ACCOUNT (account's type to be managed is EXCHANGE)</td>
            <td>MASTER</td>
            <td>SIGNER_EXCHANGE_ACC_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>MANAGE_ASSET</td>
            <td>MASTER</td>
            <td>SIGNER_ASSET_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>MANAGE_ASSET_PAIR (create or update policies)</td>
            <td>MASTER</td>
            <td>SIGNER_ASSET_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>MANAGE_ASSET_PAIR (update physical price)</td>
            <td>MASTER</td>
            <td>SIGNER_ASSET_RATE_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>MANAGE_BALANCE (for yourself)</td>
            <td>GENERAL, NOT_VERIFIED, EXCHANGE</td>
            <td>SIGNER_BALANCE_MANAGER</td>
            <td>LOW</td>
          </tr>
          <tr>
            <td>MANAGE_BALANCE (for another user)</td>
            <td>EXCHANGE</td>
            <td>SIGNER_BALANCE_MANAGER</td>
            <td>LOW</td>
          </tr>
          <tr>
            <td>MANAGE_COINS_ISSUANCE_REQUEST</td>
            <td>EXCHANGE, MASTER</td>
            <td>SIGNER_ISSUANCE_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>MANAGE_FORFEIT_REQUEST</td>
            <td>GENERAL</td>
            <td>SIGNER_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>MANAGE_INVOICE</td>
            <td>GENERAL, EXCHANGE, NOT_VERIFIED</td>
            <td>SIGNER_INVOICE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>MANAGE_OFFER</td>
            <td>GENERAL, EXCHANGE, NOT_VERIFIED</td>
            <td>SIGNER_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>PAYMENT</td>
            <td>GENERAL, EXCHANGE, NOT_VERIFIED</td>
            <td>SIGNER_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>PAYMENT</td>
            <td>OPERATIONAL</td>
            <td>SIGNER_OPERATIONAL_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>PAYMENT</td>
            <td>COMMISSION</td>
            <td>SIGNER_COMMISSION_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>PAYMENT</td>
            <td>DEMURRAGE_MANAGER</td>
            <td>SIGNER_DEMURRAGE_BALANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>RECOVER (account's type to managed is NOT_VERIFIED)</td>
            <td>MASTER</td>
            <td>SIGNER_NOT_VERIFIED_ACC_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>RECOVER (account's type to managed is GENERAL)</td>
            <td>MASTER</td>
            <td>SIGNER_GENERAL_ACC_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>REVIEW_COINS_ISSUANCE_REQUEST</td>
            <td>MASTER</td>
            <td>SIGNER_ISSUANCE_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>REVIEW_PAYMENT_REQUEST</td>
            <td>MASTER, EXCHANGE</td>
            <td>SIGNER_PAYMENT_OPERATOR</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>SET_FEES</td>
            <td>MASTER</td>
            <td>SIGNER_ASSET_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>SET_LIMITS (for specific GENERAL account)</td>
            <td>MASTER</td>
            <td>SIGNER_GENERAL_ACC_MANAGER, SIGNER_LIMITS_MANAGER</td>
            <td>MEDIUM</td>
          </tr>
          <tr>
            <td>SET_LIMITS</td>
            <td>MASTER</td>
            <td>SIGNER_LIMITS_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>SET_OPTIONS</td>
            <td>MASTER, GENERAL, NOT_VERIFIED, EXCHANGE</td>
            <td>SIGNER_ACCOUNT_MANAGER</td>
            <td>HIGH</td>
          </tr>
          <tr>
            <td>UPLOAD_PREISSUANCES</td>
            <td>MASTER</td>
            <td>SIGNER_ISSUANCE_MANAGER</td>
            <td>HIGH</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import UserHeader from '@/components/User/components/UserHeader'
export default {
  name: 'signing-rules',
  components: { UserHeader },
  methods: {
    beautify () {
      const cells = document.querySelectorAll('#signing-rules-table td')
      cells.forEach(cell => {
        cell.innerHTML = cell.innerHTML.split('_').join(' ').toLowerCase().replace('signer ', '')
      })
    }
  },
  mounted () {
    this.beautify()
  }
}
</script>

<style lang="scss" scoped>
table.signing-rules__table {
  border-collapse: collapse;
  width: 100%;
  font-size: 1.2rem;

  th,
  td {
    border: 1px solid lightgrey;
    padding: 5px 10px;
    text-transform: capitalize;
    text-align: center;

    &:first-child {
      text-align: left;
    }
  }
}
</style>
