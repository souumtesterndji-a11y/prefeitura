"use client"

import { useEffect } from "react"

export function AntiInspect() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I (Inspecionar)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+C (Seletor de elementos)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        return false
      }

      // Ctrl+U (Ver código-fonte)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }
    }

    // Adicionar event listeners
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return null
}
