import { validationMixin } from 'vuelidate'

import {
  InputField,
  SelectField,
  TextField,
  TickField,
  ImageField,
} from '@comcom/fields'
import { FormConfirmation } from '@/components/common'

import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _template from 'lodash/template'
import _templateSettings from 'lodash/templateSettings'

// Use custom ({{ value }}) template delimiters.
_templateSettings.interpolate = /{{([\s\S]+?)}}/g

const VALIDATION_ERRORS = {
  required: _template('Please, fill out this field'),
  emailOrAccountId: _template('This field should be a valid email or account ID'),
  minValue: _template('This field should be more or equal {{minValue}}'),
  maxValue: _template('This field should be less or equal {{maxValue}}'),
  noMoreThanAvailableForIssuance: _template('Not enough assets for issuance. Available: {{available}}'),
  minLength: _template('This field should have at least {{minLength}} symbols'),
  maxLength: _template('This field cannot have more than {{maxLength}} symbols'),
  seed: _template('Invalid seed'),
  password: _template('Use at least 8 characters for password'),
  sameAsPassword: _template('Passwords do not match'),
  alphaNum: _template('Only alphaumeric values allowed (A-Z, a-z, 0-9)'),
  accountId: _template('This field should be a valid account ID'),
  not: _template('This field cannot take {{value}} as a value'),
  decimal: _template('This field should be a valid decimal value'),
}

export default {
  components: {
    InputField,
    SelectField,
    TextField,
    TickField,
    ImageField,
    FormConfirmation,
  },
  mixins: [validationMixin],

  data: _ => ({
    formMixin: {
      isDisabled: false,
      isConfirmationShown: false,
    },
  }),

  methods: {
    /**
    * isFormValid checks if your form (or a part of it) meets
    * the validation rules, established for its fields.
    *
    * @param {string} [formPart] - the string with the form part name.
    *                 Works also for nested parts, such as `form.part1`.
    *
    * @returns {boolean} True if the form (or its part) meets
    *                    the validation rules or false if it does not.
    */
    isFormValid (formPart) {
      let form
      if (formPart) {
        form = _get(this.$v, formPart)
      } else {
        form = this.$v
      }

      if (!form) {
        // in case we have no validation rules at all
        return true
      }

      form.$touch()
      return !form.$invalid
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
    * @param {object} params - the interpolation params for the message.
    *
    * @returns {string} the human-readable error message if the
    *                   field is invalid, empty string - otherwise.
    */
    getFieldErrorMessage (field, params = {}) {
      if (!this.$v.$invalid) {
        return ''
      }

      const fieldDetails = _get(this.$v, field)

      if (!fieldDetails.$dirty) {
        return ''
      }

      for (const rule of Object.keys(fieldDetails.$params)) {
        if (!fieldDetails[rule]) {
          return VALIDATION_ERRORS[rule](params)
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
        } else if (_isObject(fieldValue)) {
          this.form[fieldName] = {}
        } else {
          continue
        }
      }
      this.$v.$reset()
    },

    touchField (fieldName) {
      const field = _get(this.$v, fieldName)
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
    showConfirmation () {
      this.disableForm()
      this.formMixin.isConfirmationShown = true
    },
    hideConfirmation () {
      this.enableForm()
      this.formMixin.isConfirmationShown = false
    },
  },
}
