export const fileReader = {
  deriveFileFromChangeEvent (event) {
    const files = event.target.files || event.dataTransfer.files
    if (!files.length) return
    return files[0]
  },
  async readFileAsDataUrl (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  },
  async readFileAsArrayBuffer (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsArrayBuffer(file)
    })
  }
}
