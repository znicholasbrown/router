import { ResolvedRoute } from '@/types/resolved'
import { MaybePromise } from '@/types/utilities'
import { RegisteredRouterPush } from '@/utilities/createRouterPush'
import { RouterReject } from '@/utilities/createRouterReject'
import { RegisteredRouterReplace } from '@/utilities/createRouterReplace'

export type AddRouteHook = (hook: RouteHook) => RouteHookRemove

type RouteHookContext = {
  from: ResolvedRoute | null,
  // state: RegisteredRouterState,
  reject: RouterReject,
  push: RegisteredRouterPush,
  replace: RegisteredRouterReplace,
  // scope: EffectScope,
  // router: RegisteredRouter,
}

export type RouteHook = (to: ResolvedRoute, context: RouteHookContext) => MaybePromise<void>
export type RouteHookRemove = () => void
export type RouteHookType = 'before' | 'after'
export type RouteHookLifeCycle = 'onBeforeRouteEnter' | 'onBeforeRouteLeave' | 'onBeforeRouteUpdate'
export type RouteHookCondition = (to: ResolvedRoute, from: ResolvedRoute | null, depth: number) => boolean