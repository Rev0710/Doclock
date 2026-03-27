/**
 * Go to the landing route (/) and scroll to the hero. Clears hash.
 * Uses a short delay after navigate() so the landing view has painted (login/register → home).
 */
export function goLandingHome(navigate, pathname, e) {
  if (e?.preventDefault) e.preventDefault()

  const clearHashAndScroll = (behavior = 'auto') => {
    window.history.replaceState(null, '', '/')
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo({ top: 0, left: 0, behavior })
  }

  if (pathname !== '/') {
    navigate('/')
    window.setTimeout(() => clearHashAndScroll('auto'), 150)
  } else {
    clearHashAndScroll('smooth')
  }
}
