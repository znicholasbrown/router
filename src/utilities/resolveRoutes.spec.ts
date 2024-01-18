import { describe, expect, test } from 'vitest'
import { Route, Routes } from '@/types'
import { resolveRoutes, path, query } from '@/utilities'
import { component } from '@/utilities/testHelpers'

describe('resolveRoutes', () => {
  test('given no named routes, returns empty array', () => {
    const routes = [
      {
        path: 'foo',
        children: [],
      },
      {
        path: 'bar',
        children: [
          {
            path: 'zoo',
            children: [],
          },
        ],
      },
    ] as const satisfies Routes

    const resolved = resolveRoutes(routes)

    expect(resolved).toMatchObject([])
  })

  test('always returns 1 record per named route', () => {
    const routes = [
      {
        name: 'foo',
        path: '/foo/:fparam/:fparam',
        children: [
          {
            name: 'bar',
            path: '/bar/:bparam',
            component,
          },
        ],
      },
      {
        name: 'accounts',
        path: '/accounts',
        children: [
          {
            name: 'new-account',
            path: '/new',
            component,
          },
          {
            name: 'account',
            path: '/:accountId',
            children: [
              {
                name: 'edit-account',
                path: '/edit',
                component,
              },
            ],
          },
        ],
      },
    ] as const satisfies Routes

    const response = resolveRoutes(routes)

    expect(response).toHaveLength(6)
  })

  test.each([
    ['/:accountId'],
    [path('/:accountId', { accountId: Number })],
  ])('always combines paths into return path', (path) => {
    const childRoute: Route = {
      name: 'new-account',
      path,
      component,
    }

    const parentRoute: Route = {
      name: 'accounts',
      path: '/accounts',
      children: [childRoute],
    }

    const routes = resolveRoutes([parentRoute])
    const resolvedChild = routes.find(route => route.name === childRoute.name)

    expect(resolvedChild?.path).toBe(`${parentRoute.path}/:accountId`)
  })

  test.each([
    ['id=:accountId'],
    [query('id=:accountId', { accountId: Number })],
  ])('always combines query into return query', (query) => {
    const childRoute: Route = {
      name: 'new-account',
      path: '/new-account',
      query: 'handle=:?handle',
      component,
    }

    const parentRoute: Route = {
      name: 'accounts',
      path: '/accounts',
      query,
      children: [childRoute],
    }

    const routes = resolveRoutes([parentRoute])
    const resolvedChild = routes.find(route => route.name === childRoute.name)

    expect(resolvedChild?.query).toBe('id=:accountId&handle=:?handle')
  })

  test('always combines params into return params', () => {
    const childRoute: Route = {
      name: 'new-account',
      path: '/new-account',
      query: 'handle=:handle',
      component,
    }

    const parentRoute: Route = {
      name: 'accounts',
      path: ':workspaceId/accounts',
      query: 'start=?:startDate',
      children: [childRoute],
    }

    const routes = resolveRoutes([parentRoute])
    const resolvedChild = routes.find(route => route.name === childRoute.name)

    expect(resolvedChild?.params).toMatchObject({ workspaceId: [String], startDate: [String], handle: [String] })
    // check order
    expect(Object.keys(resolvedChild?.params ?? {})).toMatchObject(['workspaceId', 'startDate', 'handle'])
  })

  describe('matches', () => {
    test('given 3 levels, returns all parent routes in matches', () => {
      const childRoute = {
        name: 'child',
        path: '/child',
        component,
      } satisfies Route
      const parentRoute = {
        name: 'parent',
        path: '/parent',
        children: [childRoute],
      } satisfies Route
      const grandparentRoute = {
        name: 'grandparent',
        path: '/grandparent',
        children: [parentRoute],
      } satisfies Route
      const unrelatedRoute = {
        name: 'unrelated',
        path: '/unrelated',
        component,
      } satisfies Route

      const [child, parent, grandparent] = resolveRoutes([grandparentRoute, unrelatedRoute])

      expect(grandparent.matches).toMatchObject([grandparentRoute])
      expect(parent.matches).toMatchObject([grandparentRoute, parentRoute])
      expect(child.matches).toMatchObject([grandparentRoute, parentRoute, childRoute])
    })
  })
})