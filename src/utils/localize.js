
export default function localize (value, digits = 4, deleteZeros = false, needConvert = false) {
  if (value === '') return ''
  if (typeof value !== 'string' && typeof value !== 'number') {
    return ''
  }

  const parts = Number(value).toString().split('.')
  const localized = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '')

  const fourDigitsDecimal = beautifyDecimal(localized, digits)
  if (needConvert) {
    return convertBigNumber(fourDigitsDecimal.split(',').join(''))
  }
  if (!deleteZeros) return fourDigitsDecimal

  return deleteTrailingZeros(fourDigitsDecimal)
}

localize.parseLocalized = function (value) {
  return value.split(',').join('')
}

function beautifyDecimal (value, digits) {
  const splittedValue = value.split('.')
  const beforePoint = splittedValue[0]
  let afterPoint = splittedValue[1] || ''
  afterPoint += '0000'
  afterPoint = afterPoint.substr(0, digits)
  if (digits !== 0) {
    return [beforePoint, afterPoint].join('.')
  }
  return beforePoint
}

function deleteTrailingZeros (value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return ''
  }
  const splittedValue = value.split('.')
  const beforePoint = splittedValue[0]
  const parsed = localize.parseLocalized(value)
  const number = Number(parsed)
  const noZerosValue = number.toString()
  const afterPoint = noZerosValue.split('.')[1]

  return [beforePoint, afterPoint || '0'].join('.')
}

function convertBigNumber (number, digits = 4) {
  const num = parseFloat(number)
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
    }
  }
  return num.toFixed(digits).replace(rx, '$1')
}
