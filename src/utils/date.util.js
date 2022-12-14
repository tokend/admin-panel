import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(duration)
dayjs.extend(customParseFormat)

const LOCALES = {
  // here will be locales as values and their names as keys
}

export class DateUtil {
  static _dayjs (date, format) {
    return format ? dayjs(date, format) : dayjs(date)
  }

  /**
   * Returns date instance of DateUtil
   * @param {string|date|object} [date] - date
   * @param {string} [format] - if date is provided in custom unknown
   * format
   * @returns {object}
   */
  static date (date, format) {
    return this._dayjs(date, format)
  }

  /**
   * Returns new duration instance of DateUtil
   * @param {object} units - config with units as keys
   * @returns {object}
   */
  static duration (units) {
    return dayjs.duration(units)
  }

  /**
   * Returns milliseconds of duration instance of DateUtil
   * @param {object} duration - duration instance
   * @returns {number}
   */
  static millisecondOf (duration) {
    return duration.asMilliseconds()
  }

  /** formatters: **/

  /**
   * Returns date in given format
   * @param {string|date|object} date - date to format
   * @param {string} format - format, e.g. 'MM-DD-YYYY HH:mm:ss'
   * @returns {string}
   */
  static format (date, format) {
    return this._dayjs(date).format(format)
  }

  /**
   * Returns provided date in UNIX timestamp (in seconds)
   * @param {string|date|object} [date] - date to format
   * @param {string} [format] - if date is provided in custom unknown
   * format
   * @returns {string}
   */
  static toTimestamp (date, format) {
    return this._dayjs(date, format).unix()
  }

  /**
   * Return instance of the native Date object
   * @param {string|date|object} [date] - date to format
   * @param {string} [format] - if date is provided in custom unknown
   * format
   * @returns {date}
   */
  static toDate (date, format) {
    return this._dayjs(date, format).toDate()
  }

  /**
   * Returns provided date in human-friendly format
   * @param {string|date|object} [date] - date to format
   * @param {string} [format] - if date is provided in custom unknown
   * format
   * @param {object} [calendar] - config of specifying calendar output formats,
   * e.g. { nextDay: '[Tomorrow]' }
   * @returns {string}
   */
  static toHuman (date, format, calendar) {
    return this._dayjs(date, format).calendar(null, calendar)
  }

  /** queries: **/

  /**
   * Returns true/false depending on whether the target date is earlier than the
   * comparison date
   * @param {string|number|date|object} [targetDate] - target date
   * @param {string|number|date|object} [comparisonDate] - comparison date
   * @returns {boolean}
   */
  static isBefore (targetDate, comparisonDate) {
    return this._dayjs(targetDate).isBefore(comparisonDate)
  }

  /**
   * Returns true/false depending on whether the target date is later than the
   * comparison date
   * @param {string|number|date|object} [targetDate] - target date
   * @param {string|number|date|object} [comparisonDate] - comparison date
   * @returns {boolean}
   */
  static isAfter (targetDate, comparisonDate) {
    return this._dayjs(targetDate).isAfter(comparisonDate)
  }

  /** manipulations: **/

  /**
   * Returns a cloned instance of DateUtil and set it to the start of a unit
   * of time
   * @param {string} unit - string of unit time (e.g. 'year')
   * @param {string|number|date|object} [date] - date to manipulate
   * @param {string} [format] - if date is provided in custom unknown
   * format
   * @returns {object}
   */
  static startOf (unit, date, format) {
    return this._dayjs(date, format).startOf(unit)
  }

  /**
   * Returns a new date instance of DateUtil by adding time unit to date
   * @param {string|number|date|object} targetDate - target date
   * @param {number} value - amount of time unit
   * @param {string} [unit] - string of unit time (e.g. 'year')
   * @returns {object}
   */
  static add (targetDate, value, unit) {
    return this._dayjs(targetDate).add(value, unit)
  }

  /**
   * Sets a new locale and returns the name of new locale
   * @param {string|object} [preset] - a name of the new locale to set
   * the locale from a preset, or an object with its own locale properties
   * @param {object} [object] - object with own locale properties in case
   * if name of locale defined by first parameter
   * @param {boolean} [isLocal]
   * @returns {string}
   */
  static locale (preset, object, isLocal = false) {
    return !object && typeof preset === 'string'
      ? dayjs.locale(LOCALES[preset])
      : dayjs.locale(preset, object, isLocal)
  }
}
