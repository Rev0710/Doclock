/**
 * Go to the landing route and scroll to the top (hero). Clears any hash in the URL.
 */
export function goLandingHome(navigate, pathname, e) {
  if (e?.preventDefault) e.preventDefault()

  const leavingRoute = pathname !== '/'

  const scrollTop = () => {
    window.history.replaceState(null, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (leavingRoute) {
    navigate('/')
    setTimeout(scrollTop, 0)
  } else {
    scrollTop()
  }
}
