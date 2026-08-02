export const createSocketMock = (id = 'socket-1') => {
  const emitted: { event: string; payload?: any }[] = [];
  return {
    id,
    emitted,
    emit: (event: string, payload?: any) => {
      emitted.push({ event, payload });
      return true;
    },
  };
};

export const createRoom = <T extends Record<string, any>>(gameId: string, gameState: T) => ({
  gameId,
  gameState,
});

export const emittedEvents = (socket: any) => socket.emitted.map((e: any) => e.event);
