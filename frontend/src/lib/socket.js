import { io } from 'socket.io-client';
import { api } from './api';

export const socket = io(api.url, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});
