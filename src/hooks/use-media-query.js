import { useEffect, useState } from "react"

export function useMediaQuery(query) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    function onChange(e) {
      setValue(e.matches)
    }

    const result = window.matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}
