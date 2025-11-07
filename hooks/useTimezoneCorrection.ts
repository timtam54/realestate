'use client'

import { useCallback } from 'react'

/**
 * Hook that provides a function to correct dates for timezone offset
 * This is useful when sending dates to APIs that expect UTC dates
 * without the timezone offset applied
 *
 * @returns A function that takes a date and returns the corrected date
 */
export function useTimezoneCorrection() {
  const correctDateForTimezone = useCallback((date: Date): Date => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  }, [])

  return correctDateForTimezone
}
