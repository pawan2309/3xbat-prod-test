/**
 * Utility functions for consistent date formatting across server and client
 * This prevents hydration errors by ensuring identical formatting on both sides
 */

export function formatDateTime(dateString: string): string {
  // Simply return the API data as-is without any timezone conversion
  return dateString
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Use UTC to ensure consistent formatting between server and client
    const day = date.getUTCDate().toString().padStart(2, '0')
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = date.getUTCFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Use UTC to ensure consistent formatting between server and client
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const seconds = date.getUTCSeconds().toString().padStart(2, '0')
    
    return `${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Error formatting time:', error)
    return dateString
  }
}

export function getCurrentTimeString(): string {
  const now = new Date()
  const hours = now.getUTCHours().toString().padStart(2, '0')
  const minutes = now.getUTCMinutes().toString().padStart(2, '0')
  const seconds = now.getUTCSeconds().toString().padStart(2, '0')
  
  return `${hours}:${minutes}:${seconds}`
}
