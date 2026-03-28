/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addPlayerToRoom from "../addPlayerToRoom.js";
import type * as common from "../common.js";
import type * as flipLever from "../flipLever.js";
import type * as getGameState from "../getGameState.js";
import type * as getRoomPlayers from "../getRoomPlayers.js";
import type * as joinGame from "../joinGame.js";
import type * as restartGame from "../restartGame.js";
import type * as startGame from "../startGame.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addPlayerToRoom: typeof addPlayerToRoom;
  common: typeof common;
  flipLever: typeof flipLever;
  getGameState: typeof getGameState;
  getRoomPlayers: typeof getRoomPlayers;
  joinGame: typeof joinGame;
  restartGame: typeof restartGame;
  startGame: typeof startGame;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
