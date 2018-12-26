export function unCamelCase (s) {
  return s
    .split(/(?=[A-Z])/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function snakeToCamelCase (s) {
  return s.replace(/(_\w)/g, function (m) {
    return m[1].toUpperCase()
  })
}
