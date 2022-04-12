import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState, memo } from 'react';
import styled from 'styled-components';
import Blob from '../components/blob';
import {
  createInitialGameState,
  GameState,
  tickState,
  Actions,
  PlayerAction,
  EntityDict,
} from '../module/game';

const Container = styled.div``;

const LeftBlob = styled.div<{ x: number; y: number; width: number }>`
  position: absolute;
  bottom: calc(${(props: any) => props.y}px - 32px);
  left: calc(${(props: any) => props.x}px - 32px);
  width: ${(props: any) => props.width}px;
`;

const RightBlob = styled.div<{ x: number; y: number; width: number }>`
  position: absolute;
  bottom: calc(${(props: any) => props.y}px - 32px);
  left: calc(${(props: any) => props.x}px - 32px);
  width: ${(props: any) => props.width}px;
`;

const LeftGoal = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  left: 0px;
`;

const RightGoal = styled.div`
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translate(0, -50%);
`;

const Home: NextPage = () => {
  const [state, setState] = useState<GameState | null>(null);
  const [actions, setActions] = useState<Actions | null>(null);

  useEffect(() => {
    const newState = createInitialGameState(
      window.innerHeight,
      window.innerWidth
    );
    setState(newState);

    const playerActions: EntityDict<PlayerAction> = {};
    Object.keys(newState.players).forEach((playerId) => {
      playerActions[playerId] = {
        id: playerId,
        up: false,
        right: false,
        down: false,
        left: false,
      };
    });

    setActions({ playerActions });
  }, []);

  useEffect(() => {
    function update() {
      setState((state) => {
        if (!state) return state;
        let newState;

        setActions((actions) => {
          if (!actions) return actions;

          newState = tickState({ ...state }, actions);

          return actions;
        });

        return newState ?? state;
      });
    }

    const timer = setInterval(update, 1000 / 120);

    return () => clearInterval(timer);
  }, [setState]);

  function keyHandler(e: KeyboardEvent) {
    const pressed = e.type === 'keydown';

    if (
      [
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'ArrowRight',
      ].includes(e.code)
    ) {
      setActions((actions) => {
        if (!actions) return actions;

        const newActions = { ...actions };

        const player1 = newActions.playerActions.player1;
        if (e.code === 'KeyW') player1.up = pressed;
        if (e.code === 'KeyA') player1.left = pressed;
        if (e.code === 'KeyS') player1.down = pressed;
        if (e.code === 'KeyD') player1.right = pressed;

        const player2 = newActions.playerActions.player2;
        if (e.code === 'ArrowUp') player2.up = pressed;
        if (e.code === 'ArrowLeft') player2.left = pressed;
        if (e.code === 'ArrowDown') player2.down = pressed;
        if (e.code === 'ArrowRight') player2.right = pressed;

        return { ...actions };
      });
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', keyHandler, false);
    document.addEventListener('keyup', keyHandler, false);

    return () => {
      document.removeEventListener('keydown', keyHandler, false);
      document.removeEventListener('keyup', keyHandler, false);
    };
  });

  if (state == null) {
    return <div>None</div>;
  }

  if (state.end) {
    return <div>Winner: {state.end.victor}</div>;
  }

  const p1 = state.players.player1;
  const p2 = state.players.player2;
  return (
    <Container>
      <LeftGoal>
        <Blob color={'#e5e9ed'} />
      </LeftGoal>
      <RightGoal>
        <Blob color={'#e5e9ed'} />
      </RightGoal>
      <LeftBlob x={p1.position.x} y={p1.position.y} width={p1.width}>
        <Blob size={64} />
      </LeftBlob>
      <RightBlob x={p2.position.x} y={p2.position.y} width={p2.width}>
        <Blob size={64} />
      </RightBlob>
    </Container>
  );
};

export default Home;
