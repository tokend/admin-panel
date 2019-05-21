import { validationMixin } from 'vuelidate'

import { InputField, SelectField, TextField, TickField } from '@comcom/fields'

import safeGet from 'lodash/get'
import isObject from 'lodash/isObject'

export default {
  components: {
    InputField,
    SelectField,
    TextField,
    TickField,
  },
  mixins: [validationMixin],

  data: _ => ({
    formMixin: {
      isDisabled: false,
    },
  }),

  methods: {
    /**
    * isFormValid checks if your form  meets the validation rules,
    * established for its fields.
    *
    * @returns {boolean} True if the form meets the validation rules
    *                    or false if it does not.
    */
    isFormValid () {
      if (!this.$v) {
        // in case we have no validation rules at all
        return true
      }

      this.$v.$touch()
      return !this.$v.$invalid
    },

    /**
    * getFieldErrorMessage decides if the validation error is present
    * for the field. To be invalid the vuelidate $touch method should
    * be called on it. You have to call $touch on the level of your component,
    * the good time to do this is `input`, `change` or `blur` events:
    *
    *   <input-field
    *     v-model="form.email"
    *     @blur="$v.form.email.$touch()"
    *     :error-message="getFieldErrorMessage(`form.email`)"
    *  />
    *
    * @param {string} field - the string with the field name. Works also for
    *                  nested fields, such as `form.email`.
    * @returns {string} the human-readable error message if the
    *                   field is invalid, empty string - otherwise.
    */
    getFieldErrorMessage (field) {
      if (!this.$v.$invalid) {
        return ''
      }

      const fieldDetails = safeGet(this.$v, field)

      if (!fieldDetails.$dirty) {
        return ''
      }

      for (const rule of Object.keys(fieldDetails.$params)) {
        if (!fieldDetails[rule]) {
          return rule
        }
      }
    },

    clearFields () {
      this.clearFieldsWithOverriding({})
    },

    clearFieldsWithOverriding (overriddenFields) {
      for (const [fieldName, fieldValue] of Object.entries(this.form)) {
        if (overriddenFields[fieldName]) {
          this.form[fieldName] = overriddenFields[fieldName]
        } else if (typeof fieldValue === 'string') {
          this.form[fieldName] = ''
        } else if (typeof fieldValue === 'number') {
          this.form[fieldValue] = 0
        } else if (Array.isArray(fieldValue)) {
          this.form[fieldName] = []
        } else if (isObject(fieldValue)) {
          this.form[fieldName] = {}
        } else {
          continue
        }
      }
      this.$v.$reset()
    },

    touchField (fieldName) {
      const field = safeGet(this.$v, fieldName)
      if (field) {
        field.$touch()
      }
    },

    disableForm () {
      this.formMixin.isDisabled = true
    },

    enableForm () {
      this.formMixin.isDisabled = false
    },
  },
}
