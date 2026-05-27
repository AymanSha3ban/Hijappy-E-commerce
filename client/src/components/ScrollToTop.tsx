import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop — mounts once at the router level.
 * Handles both scroll-to-top on route changes and smooth hash scrolling.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // If there is a hash, scroll to that element
    if (hash) {
      // Small timeout ensures the DOM is fully loaded/rendered, especially on new page loads
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    } else {
      // Otherwise scroll to top instantly
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}
