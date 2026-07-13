import type { Listing, TripPackage } from './types'

// Photos are already hosted on the deployed web frontend's static site, so the
// app just loads them by URL (no bundling). Same folder/keyword convention as web.
const PHOTO_BASE = 'https://gojulley-frontend.onrender.com/photos'

const BIKE_MAP: [string, string][] = [
  ['himalayan', 'himalayan'],
  ['classic', 'classic-350'],
  ['bullet', 'bullet-350'],
  ['meteor', 'meteor-350'],
  ['ktm', 'ktm-adventure'],
  ['xpulse', 'xpulse'],
]
const CAR_MAP: [string, string][] = [
  ['crysta', 'innova-crysta'],
  ['innova', 'innova'],
  ['xylo', 'xylo'],
  ['scorpio', 'scorpio'],
  ['ertiga', 'ertiga'],
  ['tempo', 'tempo'],
  ['traveller', 'tempo'],
  ['van', 'van'],
]
const SERVICE_MAP: [string, string][] = [
  ['guide', 'guide'],
  ['photograph', 'photographer'],
  ['mechanic', 'mechanic'],
  ['coordinator', 'coordinator'],
]
const PLACES = ['leh', 'nubra', 'pangong', 'zanskar', 'turtuk']

function byKeyword(map: [string, string][], text: string, folder: string): string {
  const t = text.toLowerCase()
  const hit = map.find(([kw]) => t.includes(kw))
  return `${PHOTO_BASE}/${folder}/${hit ? hit[1] : 'default'}.jpg`
}
function byPlace(text: string, folder: string): string {
  const t = (text || '').toLowerCase()
  const hit = PLACES.find((p) => t.includes(p))
  return `${PHOTO_BASE}/${folder}/${hit ?? 'default'}.jpg`
}

export function listingPhoto(l: Listing): string {
  switch (l.type) {
    case 'BIKE':
      return byKeyword(BIKE_MAP, l.title, 'bikes')
    case 'CAR':
      return byKeyword(CAR_MAP, l.title, 'cars')
    case 'HOTEL':
    case 'HOMESTAY':
      return byPlace(l.location, 'stays')
    case 'SERVICE':
      return byKeyword(SERVICE_MAP, l.title, 'services')
    default:
      return byPlace(l.location, 'places')
  }
}

export function tripPhoto(t: TripPackage): string {
  return byPlace(t.route, 'places')
}
