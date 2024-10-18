import { type Video, YouTube } from 'youtube-sr';
import type { IpcMainInvokeEvent } from 'electron';

export async function search(_event: IpcMainInvokeEvent, query: string): Promise<Video[]> {
  const results = await YouTube.search(query, { limit: 3, type: 'video' });

  // return await YouTube.search(query, { limit: 3, type: 'video' });
  return results;
}
