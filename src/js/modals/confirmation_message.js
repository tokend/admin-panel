import Vue from 'vue'
import store from '../../store'
import FormBlockingModalMixin from './flow-blocking-modal.mixin'
import Modal from '../../components/common/modals/Modal'

const template = `
  <modal maxWidth="40rem">
    <p class="modal__title">{{ title }}</p>
    <div class="issuance-rl__reject-form-actions app__form-actions">
      <button class="app__btn app__btn--color-theme" @click="confirm">
        Submit
      </button>
      <button class="app__btn-secondary" @click="cancel">
        Cancel
      </button>
    </div>
  </modal>
`

/**
 * @param {object} [opts]
 * @param opts.title
 * @param opts.message
 * @param opts.confirmText
 * @param opts.cancelText
 * @return {Promise<boolean>}
 */
export function confirmAction (opts = {}) {
  const title = opts.title || 'Are you sure?'

  const container = document.createElement('div')
  document.querySelector('#app').appendChild(container)

  return new Promise((resolve, reject) => {
    const confirmMessage = new Vue({
      template,
      store,
      mixins: [FormBlockingModalMixin],
      components: { Modal },
      data () {
        return {
          title
        }
      },
      created () {
        this.setResolvers(resolve, reject)
      },
      methods: {
        confirm () {
          this.resetResolvers()
          this.removeElement()
          return this.resolvers.resolve(true)
        },
        cancel () {
          this.resetResolvers()
          this.removeElement()
          return this.resolvers.resolve(false)
        }
      },
      watch: {
        isOpened (val) {
          if (!val) {
            if (!this.isResolved) {
              this.resolvers.resolve(false)
            }
            this.removeElement()
          }
        }
      }
    })
    confirmMessage.$mount(container)
  })
}
