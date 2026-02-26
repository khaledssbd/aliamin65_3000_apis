/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'socket.io' {
  import { Server as HttpServer } from 'http';
  export class Server {
    constructor(server: HttpServer, opts?: any);
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    of(name: string): Server;
    to(room: string): Server;
  }
}
