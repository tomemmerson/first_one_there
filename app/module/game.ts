import Vector from 'victor';
import { clamp } from './util';

export interface Player {
  id: string;
  position: Vector;
  width: number;
  velocity: Vector;
  target: string;
}

export interface Map {
  width: number;
  height: number;
}

export interface Target {
  id: string;
  width: number;
  position: Vector;
}

export interface GameEnd {
  victor: string;
}

export interface GameState {
  players: EntityDict<Player>;
  targets: EntityDict<Target>;
  map: Map;
  end: GameEnd | undefined;
}

export type EntityDict<T> = {
  [id: string]: T;
};
function arrayToDict<T>(array: Array<T & { id: string }>): EntityDict<T> {
  let dict: EntityDict<T> = {};

  for (let item of array) {
    dict[item.id] = item;
  }

  return dict;
}

function createInitialPlayerState(
  id: string,
  start: Vector,
  blobSize: number,
  target: Target
) {
  const player: Player = {
    id,
    position: start,
    velocity: Vector.fromObject({ x: 10, y: 0 }),
    target: target.id,
    width: blobSize,
  };

  return player;
}

function createTarget(id: string, position: Vector, width: number): Target {
  return { id, position, width };
}

export function createInitialGameState(
  height: number,
  width: number
): GameState {
  const halfDown = height / 2;
  const offset = width * 0.1;

  const blobSize = Math.min(height, width) / 10;

  const targets = [
    createTarget(
      'target1',
      Vector.fromObject({
        x: width - offset,
        y: halfDown,
      }),
      blobSize
    ),
    createTarget(
      'target2',
      Vector.fromObject({ x: offset, y: halfDown }),
      blobSize
    ),
  ];

  const players = [
    createInitialPlayerState(
      'player1',
      Vector.fromObject({ x: offset, y: halfDown }),
      blobSize,
      targets[0]
    ),
    createInitialPlayerState(
      'player2',
      Vector.fromObject({ x: width - offset, y: halfDown }),
      blobSize,
      targets[1]
    ),
  ];

  const state: GameState = {
    players: arrayToDict(players),
    targets: arrayToDict(targets),
    map: { height, width },
  };

  return state;
}

export interface PlayerAction {
  id: string;
  up: boolean;
  right: boolean;
  down: boolean;
  left: boolean;
}

export interface Actions {
  playerActions: EntityDict<PlayerAction>;
}

type Entity = { id: string; width: number; position: Vector };
function objectsCollide(a: Entity, b: Entity): Boolean {
  return a.position.distance(b.position) < a.width + b.width;
}

export function tickState(state: GameState, actions: Actions) {
  // First, let's increment player speeds
  for (let action of Object.values(actions.playerActions)) {
    const vertical = Number(action.up) - Number(action.down);
    const horizontal = Number(action.right) - Number(action.left);

    const player = state.players[action.id];

    if (vertical === 0 && horizontal === 0) {
      continue;
    }

    const change = Vector.fromObject({
      x: horizontal,
      y: vertical,
    }).normalize();

    player.velocity.add(change.multiplyScalar(0.25));
  }

  // Check if any of the blobs would hit each other.

  for (let player of Object.values(state.players)) {
    player.position.add(player.velocity);
    player.velocity.multiplyScalar(0.93);

    if (player.position.x > state.map.width || player.position.x < 0) {
      player.position.x = clamp(player.position.x, 0, state.map.width);
      player.velocity.invertX();
    }

    if (player.position.y > state.map.height || player.position.y < 0) {
      player.position.y = clamp(player.position.y, 0, state.map.height);
      player.velocity.invertY();
    }

    if (objectsCollide(player, state.targets[player.target])) {
      state.end = {
        victor: player.id,
      };
    }
  }

  return state;
}
