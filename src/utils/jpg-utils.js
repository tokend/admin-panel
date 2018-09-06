const rotateAngles = [
  {},
  { y: 0, z: 0 },
  { y: 180, z: 0 },
  { y: 0, z: 180 },
  { y: 180, z: 180 },
  { y: 180, z: -90 },
  { y: 0, z: -90 },
  { y: 180, z: 90 },
  { y: 0, z: 90 }
]

function getRotationAngle (newOrientation, oldOrientation) {
  const y = rotateAngles[newOrientation].y - rotateAngles[oldOrientation].y
  let z = rotateAngles[newOrientation].z - rotateAngles[oldOrientation].z
  if (y) {
    z = z * -1
  }

  // left(right)-mirrored fix
  if (oldOrientation === 5 || oldOrientation === 7) {
    z = z * -1
  }

  return { y, z }
}

const jpegBytes = {
  startByte: 0xFFD8,
  applicationMarker: 0xFFE1,
  exifHeader: 0x45786966,
  byteAlign: 0x4949, // 'Intel'
  orientationTag: 0x0112
}

/**
 * getImageOrientation - parse jpg exif and return image orientation
 * Orientation values:
 *    -2 - not JPEG
 *    -1 - EXIF not present
 *     1 < n < 9 - correct value for angle calculation
 *     other - can be ignored
 *
 * @param {Buffer} arrayBuffer - imageArray buffer
 * @return {number} orientation
 */
function getImageOrientation (arrayBuffer) {
  const view = new DataView(arrayBuffer)
  if (view.getUint16(0, false) !== jpegBytes.startByte) return -2

  const length = view.byteLength
  let offset = 2

  while (offset < length) {
    const marker = view.getUint16(offset, false)
    offset += 2
    if (marker === jpegBytes.applicationMarker) {
      if (view.getUint32(offset += 2, false) !== jpegBytes.exifHeader) return -1

      const little = view.getUint16(offset += 6, false) === jpegBytes.byteAlign
      offset += view.getUint32(offset + 4, little)

      const tags = view.getUint16(offset, little)
      offset += 2

      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + (i * 12), little) === jpegBytes.orientationTag) {
          return view.getUint16(offset + (i * 12) + 8, little)
        }
      }
    } else if ((marker & 0xFF00) !== 0xFF00) break
    else offset += view.getUint16(offset, false)
  }
  return offset
}

export function getImageTransform (arrayBuffer) {
  let orientation = getImageOrientation(arrayBuffer)

  if (!orientation) return ''

  if (orientation < 1 || orientation > 9) orientation = 1

  const angle = getRotationAngle(1, orientation)
  const transform = `transform: rotateY(${angle.y}deg) rotateZ(${angle.z}deg)`

  return transform
}

export default {
  getImageWithOrientation (url, buffer) {
    const orientation = getImageOrientation(buffer)
    return {
      urlEncodedImage: url,
      orientation: orientation
    }
  },
  getRotationAngle: getRotationAngle,

  getRotationStyle (orientation) {
    let translateNeeded = false
    if (!orientation) return { transform: '', translateNeeded: translateNeeded }

    if (orientation < 1 || orientation > 9) orientation = 1

    const angle = getRotationAngle(1, orientation)
    const transform = `transform: rotateY(${angle.y}deg) rotateZ(${angle.z}deg) scale(0.8)`

    if (angle.z % 180 !== 0) {
      translateNeeded = true
    }

    return { transform: transform, translateNeeded: translateNeeded }
  }
}
