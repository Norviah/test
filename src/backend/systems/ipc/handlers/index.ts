import { app, type IpcMainInvokeEvent } from 'electron';

export function greet(_event: IpcMainInvokeEvent, name: string): string {
  return `Hello, ${name}!`;
}

export function version(): string {
  return app.getVersion();
}

export * as youtube from './youtube';
