import { isBrowser } from '@/utilities/isBrowser'
import { updateBrowserUrl } from '@/utilities/updateBrowserUrl'

type RouterNavigationOptions = {
  onLocationUpdate: (url: string) => Promise<void>,
}

type RouterNavigationUpdateOptions = {
  replace?: boolean,
}

type NavigationForward = () => void
type NavigationBack = () => void
type NavigationGo = (delta: number) => void
type NavigationUpdate = (url: string, options?: RouterNavigationUpdateOptions) => Promise<void>
type NavigationCleanup = () => void
type NavigationGetUrl = () => Location

export type RouterNavigation = {
  forward: NavigationForward,
  back: NavigationBack,
  go: NavigationGo,
  update: NavigationUpdate,
  cleanup?: () => void,
  getUrl: NavigationGetUrl,
}

export function createRouterNavigation(options: RouterNavigationOptions): RouterNavigation {
  if (isBrowser()) {
    return createBrowserNavigation(options)
  }

  return createNodeNavigation(options)
}

function createBrowserNavigation({ onLocationUpdate }: RouterNavigationOptions): RouterNavigation {

  const update: NavigationUpdate = async (url, options) => {
    await updateBrowserUrl(url, options)

    return await onLocationUpdate(url)
  }

  const cleanup: NavigationCleanup = () => {
    removeEventListener('popstate', onPopstate)
  }

  const getUrl: NavigationGetUrl = () => {
    return window.location
  }

  const onPopstate = (): void => {
    onLocationUpdate(window.location.toString())
  }

  addEventListener('popstate', onPopstate)

  return {
    forward: history.forward,
    back: history.back,
    go: history.go,
    getUrl,
    update,
    cleanup,
  }
}

function createNodeNavigation({ onLocationUpdate }: RouterNavigationOptions): RouterNavigation {
  const notSupported = (): any => {
    throw new Error('Browser like navigation is not supported outside of a browser context')
  }

  const update: NavigationUpdate = async (url) => {
    return await onLocationUpdate(url)
  }

  const cleanup: NavigationCleanup = () => {}

  return {
    forward: notSupported,
    back: notSupported,
    go: notSupported,
    getUrl: notSupported,
    cleanup,
    update,
  }
}
