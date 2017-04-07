import socketio from 'socket.io';
import {ObjectID} from 'mongodb';
import {socketConnect, socketDisconnect, clientToServer} from '../shared/actions/actions'

let connectionIds = 0;

export const socketServer = (server) => socketio(server);

export const socketStore = (serverSocket, store) => {
  serverSocket.on('connect', (socket) => {
    let connectionId = connectionIds++;
    store.dispatch(socketConnect(connectionId, socket));

    socket.emit('connectionId', connectionId);

    socket.on('disconnect', (data) => {
      store.dispatch(socketDisconnect(connectionId));
    });

    socket.on('action', (action) => {
      if (clientToServer[action.type]) {
        console.log('from JS:', action.data);
        console.log('from JS:',  action.data);
        store.dispatch(clientToServer[action.type](connectionId, action.data));
      } else {
        console.warn('Client action doesnt exist: ' + action.type);
      }
    });
  });
};

export const socketMiddleware = socket => store => next => action => {
  const state = store.getState().get('connections');
  console.log('action', action)
  //if (action.meta && action.meta.connectionId) {
  //  console.log('state', state.has(action.meta.connectionId))
  //}
  if (action.meta && action.meta.connectionId && state.has(action.meta.connectionId)) {
    console.log('dispatching!')
    const clientSocket = state.get(action.meta.connectionId);
    clientSocket.emit('action', action);
  }
  return next(action);
};