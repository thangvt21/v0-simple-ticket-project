"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function KeyboardShortcuts() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger shortcuts when not in an input, textarea, or select
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl/Cmd + / to show shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault()
        toast({
          title: "Keyboard Shortcuts",
          description: `
            n: New issue
            g + d: Go to dashboard
            g + h: Go to home
            g + u: Go to user management (admin only)
            ?: Show this help
          `,
          duration: 5000,
        })
      }

      // n for new issue
      if (event.key === "n") {
        event.preventDefault()
        router.push("/")
      }

      // g + d for dashboard
      if (event.key === "g") {
        const timer = setTimeout(() => {
          // Reset after timeout
        }, 1000)

        const secondKeyHandler = (e: KeyboardEvent) => {
          clearTimeout(timer)
          window.removeEventListener("keydown", secondKeyHandler)

          if (e.key === "d") {
            e.preventDefault()
            router.push("/dashboard")
          } else if (e.key === "h") {
            e.preventDefault()
            router.push("/")
          } else if (e.key === "u") {
            e.preventDefault()
            router.push("/admin/users")
          }
        }

        window.addEventListener("keydown", secondKeyHandler, { once: true })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, toast])

  return null
}
