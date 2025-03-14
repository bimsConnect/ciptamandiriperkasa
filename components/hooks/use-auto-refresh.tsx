"use client"

import { useState, useEffect, useCallback } from "react"

interface AutoRefreshOptions {
  interval?: number // in milliseconds
  onRefresh?: () => Promise<void> | void
  enabled?: boolean
}

export function useAutoRefresh({
  interval = 30000, // Default to 30 seconds
  onRefresh,
  enabled = true,
}: AutoRefreshOptions) {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(interval)

  const refresh = useCallback(async () => {
    if (!enabled || isRefreshing) return

    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
      setLastRefreshed(new Date())
    } catch (error) {
      console.error("Error during refresh:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [enabled, isRefreshing, onRefresh])

  // Set up auto-refresh interval
  useEffect(() => {
    if (!enabled) return

    const refreshInterval = setInterval(() => {
      refresh()
    }, interval)

    // Update time until next refresh
    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1000) {
          return interval
        }
        return prev - 1000
      })
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(countdownInterval)
    }
  }, [enabled, interval, refresh])

  // Reset timer when manually refreshed
  useEffect(() => {
    setTimeUntilRefresh(interval)
  }, [lastRefreshed, interval])

  return {
    lastRefreshed,
    isRefreshing,
    refresh,
    timeUntilRefresh,
    timeUntilRefreshSeconds: Math.ceil(timeUntilRefresh / 1000),
  }
}

