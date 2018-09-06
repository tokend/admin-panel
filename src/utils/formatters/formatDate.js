import moment from 'moment'

export function formatDate (date, format = 'DD MMM YYYY') {
  try {
    return moment(date).format(format)
  } catch (error) {
    return date
  }
}
