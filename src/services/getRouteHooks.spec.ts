import { expect, test, vi } from 'vitest'
import { readonly } from 'vue'
import { createResolvedRouteQuery } from '@/services/createResolvedRouteQuery'
import { getBeforeRouteHooksFromRoutes } from '@/services/getRouteHooks'
import { ResolvedRoute } from '@/types/resolved'
import { RouteProps } from '@/types/routeProps'
import { component } from '@/utilities/testHelpers'

type RoutePropsWithMeta = RouteProps & { meta: Record<string, unknown> }

function mockRoute(name: string): RoutePropsWithMeta {
  return {
    name,
    path: `/${name}`,
    component,
    onBeforeRouteEnter: vi.fn(),
    onBeforeRouteUpdate: vi.fn(),
    onBeforeRouteLeave: vi.fn(),
    meta: {},
  }
}

function mockResolvedRoute(matched: RoutePropsWithMeta, matches: RoutePropsWithMeta[]): ResolvedRoute {
  return readonly({
    matched,
    matches,
    key: matched.name!,
    query: createResolvedRouteQuery(),
    params: {},
  })
}

test('given two ResolvedRoutes returns before timing hooks in correct order', () => {
  const grandchildA = mockRoute('grandchildA')
  const grandchildB = mockRoute('grandchildB')
  const childA = mockRoute('childA')
  const childB = mockRoute('childB')
  const parent = mockRoute('parentA')

  const to = mockResolvedRoute(grandchildB, [parent, childA, grandchildA])
  const from = mockResolvedRoute(grandchildA, [parent, childB, grandchildB])

  const hooks = getBeforeRouteHooksFromRoutes(to, from)

  expect(Array.from(hooks.onBeforeRouteEnter)).toMatchObject([childA.onBeforeRouteEnter, grandchildA.onBeforeRouteEnter])
  expect(Array.from(hooks.onBeforeRouteUpdate)).toMatchObject([parent.onBeforeRouteUpdate])
  expect(Array.from(hooks.onBeforeRouteLeave)).toMatchObject([childB.onBeforeRouteLeave, grandchildB.onBeforeRouteLeave])
})