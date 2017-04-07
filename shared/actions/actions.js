export * from './auth';
export * from './rooms';
export * from './game';
export * from './trait';
export * from './debug';

import {genericClientToServer} from './generic';
import {genericServerToClient} from './generic';
import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
import {roomsClientToServer} from './rooms';
import {roomsServerToClient} from './rooms';
import {gameClientToServer} from './game';
import {gameServerToClient} from './game';
import {traitClientToServer} from './trait';
import {traitServerToClient} from './trait';
import {debugClientToServer} from './debug';
import {debugServerToClient} from './debug';

export const clientToServer = Object.assign({}
  , genericServerToClient
  , authClientToServer
  , roomsClientToServer
  , gameClientToServer
  , traitClientToServer
  , debugClientToServer
  , {$unprotected: []}
);

export const serverToClient = Object.assign({}
  , genericServerToClient
  , authServerToClient
  , roomsServerToClient
  , gameServerToClient
  , traitServerToClient
  , debugServerToClient
);