/* eslint-disable vue/no-unused-properties */
/* eslint-disable vue/require-prop-types */
/* eslint-disable vue/require-expose */
import { defineComponent, h } from 'vue'
import { useRouter } from '@/compositions/useRouter'
import { RouteMethod } from '@/types/routeMethod'
import { RouterPushOptions } from '@/types/router'

type RouterLinkTo = string | (() => ReturnType<RouteMethod>)

type RouterLinkProps = {
  to: RouterLinkTo,
  replace?: boolean,
}

export default defineComponent((props: RouterLinkProps, { slots }) => {
  const router = useRouter()

  function getUrl(): string {
    if (typeof props.to === 'string') {
      return props.to
    }

    const { url } = props.to()

    return url
  }

  function getPushParameters(): [string, RouterPushOptions] {
    const options: RouterPushOptions = { replace: props.replace ?? false }
    const url = getUrl()

    return [url, options]
  }

  function onClick(event: PointerEvent): void {
    event.preventDefault()

    const [url, options] = getPushParameters()

    router.push(url, options)
  }

  return () => h('a', {
    href: getUrl(),
    onClick,
  }, slots.default?.())
}, {
  name: 'RouterLink',
  props: ['to', 'replace'],
})