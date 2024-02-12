import { Resolved, Route } from '@/types'
import { createMaybeRelativeUrl } from '@/utilities'

type RouteSortMethod = (aRoute: Resolved<Route>, bRoute: Resolved<Route>) => number

export function getRouteScoreSortMethod(url: string): RouteSortMethod {
  const { searchParams: actualQuery } = createMaybeRelativeUrl(url)
  const sortBefore = -1
  const sortAfter = +1

  return (aRoute, bRoute) => {
    const aRouteQueryScore = countExpectedQueryKeys(aRoute, actualQuery)
    const bRouteQueryScore = countExpectedQueryKeys(bRoute, actualQuery)

    if (aRouteQueryScore > bRouteQueryScore) {
      return sortBefore
    }
    if (aRouteQueryScore < bRouteQueryScore) {
      return sortAfter
    }

    if (aRoute.depth > bRoute.depth) {
      return sortBefore
    }
    if (aRoute.depth < bRoute.depth) {
      return sortAfter
    }

    return 0
  }
}

export function countExpectedQueryKeys(route: Resolved<Route>, actualQuery: URLSearchParams): number {
  const expectedQuery = new URLSearchParams(route.query)
  const expectedQueryKeys = Array.from(expectedQuery.keys())

  const missing = expectedQueryKeys.filter(expected => !actualQuery.has(expected))

  return expectedQueryKeys.length - missing.length
}