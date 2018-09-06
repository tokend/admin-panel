import { envelopOperations } from './envelopOperations'

export function jsonApiPayloadCombiner ({ attributes, operations }) {
  const payload = { attributes }
  const relationships = {}

  if (operations && operations.length) {
    Object.assign(relationships, {
      transaction: {
        data: {
          attributes: {
            envelope: envelopOperations(...operations)
          }
        }
      }
    })
  }

  if (Object.keys(relationships).length) {
    payload.relationships = relationships
  }

  return { data: { ...payload }}
}
