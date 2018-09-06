export function clearObject (object) {
  const objectCopy = Object.assign({}, object)

  for (const key in objectCopy) {
    if (objectCopy.hasOwnProperty(key)) {
      const element = objectCopy[key]
      if (element === undefined || element === null || element === '') {
        delete objectCopy[key]
      }
    }
  }

  return objectCopy
}
