import { ExtractParamTypes, MergeParams } from '@/types/params'
import { Param } from '@/types/paramTypes'
import { Path, ToPath } from '@/types/path'
import { Query, ToQuery } from '@/types/query'
import { RouteMeta, RouteProps } from '@/types/routeProps'

/**
 * Represents an immutable array of Route instances. Return value of `createRoutes`, expected param for `createRouter`.
 */
export type Routes = Route[]

/**
 * The Route properties originally provided to `createRoutes`. The only change is normalizing meta to always default to an empty object.
 */
export type RoutePropsWithMeta = RouteProps & { meta: RouteMeta }

/**
 * Represents the structure of a route within the application. Return value of `createRoutes`
 * @template TKey - Represents the unique key identifying the route, typically a string.
 * @template TPath - The type or structure of the route's path.
 * @template TQuery - The type or structure of the query parameters associated with the route.
 * @template TDisabled - Indicates whether the route is disabled, which could affect routing logic.
 */
export type Route<
  TKey extends string | undefined = string | undefined,
  TPath extends string | Path = Path,
  TQuery extends string | Query | undefined = Query,
  TDisabled extends boolean | undefined = boolean
> = {
  /**
   * The specific route properties that were matched in the current route.
  */
  matched: RoutePropsWithMeta,
  /**
   * The specific route properties that were matched in the current route, including any ancestors.
   * Order of routes will be from greatest ancestor to narrowest matched.
  */
  matches: RoutePropsWithMeta[],
  /**
   * Unique identifier for the route, generated by joining route `name` by period. Key is used for routing and for matching.
  */
  key: TKey,
  /**
   * Represents the structured path of the route, including path params.
  */
  path: ToPath<TPath>,
  /**
   * Represents the structured query of the route, including query params.
  */
  query: ToQuery<TQuery>,
  depth: number,
  /**
   * Indicates if the route is disabled.
  */
  disabled: TDisabled extends boolean ? TDisabled : false,
}

/**
 * Extracts combined types of path and query parameters for a given route, creating a unified parameter object.
 * @template TRoute - The route type from which to extract and merge parameter types.
 * @returns A record of parameter names to their respective types, extracted and merged from both path and query parameters.
 */
export type ExtractRouteParamTypes<TRoute> = TRoute extends {
  path: { params: infer PathParams extends Record<string, Param | undefined> },
  query: { params: infer QueryParams extends Record<string, Param | undefined> },
}
  ? ExtractParamTypes<MergeParams<PathParams, QueryParams>>
  : Record<string, unknown>
