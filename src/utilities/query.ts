import { ExtractParamName, ExtractPathParamType, MergeParams, Param } from '@/types/params'
import { Identity } from '@/types/utilities'
import { getParamsForString } from '@/utilities/getParamsForString'
import { isRecord } from '@/utilities/guards'

type ExtractQueryParamsFromQueryString<
  TQuery extends string,
  TParams extends Record<string, Param | undefined> = Record<never, never>
> = TQuery extends `${string}=:${infer Param}&${infer Rest}`
  ? MergeParams<{ [P in ExtractParamName<Param>]: ExtractPathParamType<Param, TParams> }, ExtractQueryParamsFromQueryString<Rest, TParams>>
  : TQuery extends `${string}:${infer Param}`
    ? { [P in ExtractParamName<Param>]: ExtractPathParamType<Param, TParams> }
    : Record<never, never>

export type QueryParams<T extends string> = {
  [K in keyof ExtractQueryParamsFromQueryString<T>]?: Param
}

export type Query<
  T extends string = any,
  P extends QueryParams<T> = any
> = {
  query: T,
  params: Identity<ExtractQueryParamsFromQueryString<T, P>>,
  toString: () => string,
}

export function query<T extends string, P extends QueryParams<T>>(query: T, params: Identity<P>): Query<T, P> {
  return {
    query,
    params: getParamsForString(query, params) as Query<T, P>['params'],
    toString: () => query,
  }
}

export type ToQuery<T extends string | Query | undefined> = T extends string
  ? Query<T, {}>
  : T extends undefined
    ? Query<'', {}>
    : T

function isQuery(value: unknown): value is Query {
  return isRecord(value) && typeof value.query === 'string'
}

export function toQuery<T extends string | Query | undefined>(value: T): ToQuery<T>
export function toQuery<T extends string | Query | undefined>(value: T): Query {
  if (value === undefined) {
    return query('', {})
  }

  if (isQuery(value)) {
    return value
  }

  return query(value, {})
}