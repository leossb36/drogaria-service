import { Type } from '@nestjs/common'

export const EntityFactory = <T>(Class: Type<T>, data: Partial<T>) =>
  Object.entries(data).reduce((entity: T, [key, value]) => {
    entity[key] = value

    return entity
  }, new Class())

export const remap = <T>(attr: T[], name: string): T[] => {
  return attr.flatMap<T>((subarray: any) => subarray[name])
}

export const ArrayNumber = (attr: number[]): number[] => {
  return Array.isArray(attr) ? attr.map(item => Number(item)) : attr ? [Number(attr)] : []
}

export const ArrayString = (attr: string[]): string[] => {
  return Array.isArray(attr) ? attr.map(item => item) : attr ? [attr] : []
}

export function ConcatString(...elements: (string | undefined | null)[]): string {
  return elements
    .filter(element => element !== undefined && element !== null && element.trim() !== '')
    .join(', ')
}

export function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`
  } else if (phoneNumber.length === 11) {
    return `(${phoneNumber.slice(0, 2)}) 9 ${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`
  } else {
    return phoneNumber
  }
}

export function ParseParams<T>(params: T): T {
  if (Array.isArray(params)) {
    return params.map(item => ParseParams(item)) as unknown as T
  } else if (typeof params === 'object' && params !== null) {
    const result: { [key: string]: unknown } = {}
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = params[key]
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'null') {
            result[key] = undefined
          } else {
            try {
              result[key] = JSON.parse(value)
            } catch (e) {
              result[key] = value
            }
          }
        } else {
          result[key] = ParseParams(value)
        }
      }
    }
    return result as T
  }
  return params
}

export const ChangeKey = (obj: any, newKey: string, oldKey: string) => {
  obj[newKey] = obj[oldKey]
  delete obj[oldKey]

  return obj
}

export const ArrayToObject = <T extends Record<string, any>>(
  arr: T[]
): Record<string, T[keyof T]> => {
  return arr.reduce((acc, item) => {
    Object.entries(item).forEach(([key, value]) => {
      acc[key] = value
    })
    return acc
  }, {})
}

export const Reduce = (attr: number[]): number => {
  return attr.reduce((acc, current) => acc + (current || 0), 0)
}

export const setDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const validatePhone = (phone: string): string => {
  return phone.replaceAll(/\s/g, '')
}

export const validateGender = (gender: string): string => {
  return gender.toLowerCase() === 'm' ? 'Masculino' : 'Feminino'
}

export const validateDate = (date: string): string => {
  const formatedDate = date.split('T')
  return formatedDate[0]
}
