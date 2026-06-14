import { useEffect, useRef, useState } from 'react'

export function useTimer(limitMinutes, onExpire) {
  const totalSeconds = limitMinutes > 0 ? limitMinutes * 60 : null
  const [remaining, setRemaining] = useState(totalSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (totalSeconds === null) return
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [totalSeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  const format = () => {
    if (remaining === null) return null
    const m = Math.floor(remaining / 60)
    const s = remaining % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return { remaining, formatted: format(), isExpired: remaining === 0 }
}
