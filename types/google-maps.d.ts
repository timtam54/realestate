declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (element: HTMLElement, options?: unknown) => GoogleMap
        LatLngBounds: new () => LatLngBounds
        Marker: new (options?: unknown) => GoogleMarker
        InfoWindow: new (options?: unknown) => GoogleInfoWindow
        Size: new (width: number, height: number) => GoogleSize
        Point: new (x: number, y: number) => GooglePoint
        places?: {
          Autocomplete: new (input: HTMLInputElement, options?: unknown) => GoogleAutocomplete
        }
        event?: {
          clearInstanceListeners: (instance: unknown) => void
        }
      }
    }
    initMap?: () => void
  }
}

export interface GoogleMap {
  fitBounds: (bounds: LatLngBounds) => void
}

export interface LatLngBounds {
  extend: (point: { lat: number; lng: number }) => void
}

export interface GoogleMarker {
  addListener: (event: string, handler: () => void) => void
}

export interface GoogleInfoWindow {
  open: (map: GoogleMap, marker: GoogleMarker) => void
}

export type GoogleSize = object
export type GooglePoint = object

export type GoogleAutocomplete = {
  addListener: (event: string, handler: () => void) => void
  getPlace: () => {
    formatted_address?: string
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
    geometry?: {
      location: {
        lat: () => number
        lng: () => number
      }
    }
  }
}

export {}
