import {
  uuidv4,
  randomString,
} from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

export function randomNumber(minInclusive, maxExclusive) {
  return Math.floor(
    Math.random() * (maxExclusive - minInclusive) + minInclusive
  )
}

export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function randomUUID() {
  return uuidv4()
}

export function randomAddress(country = 'DE') {
  return {
    firstName: randomString(10),
    lastName: randomString(10),
    streetName: randomString(10),
    postalCode: randomString(10),
    country: country,
    company: randomString(10),
    phone: randomString(10),
  }
}
