
export type TableNames = 'system' | 'track' | 'cortina' | 'tanda' | 'scratchpad' | 'playlist';

export interface BaseRecord {
    id?: number;
}

export type Classifiers = {
    rating?: number;
    favourite: boolean;
}
export interface Track extends BaseRecord {
    type: 'track' | 'cortina';
    name: string;
    fileHandle: any;
    metadata: {
        start: number; // milliseconds offset
        end: number; // milliseconds offset (duration = start - end when reporting)
        meanVolume: number;
        maxVolume: number;
        style: string;
        tags: {
          title?: string;
          artist?: string;
          year?: string;
          notes?: string;
          creation_time?: string;
          bpm?: number;
        }
      },
      classifiers: Classifiers;
}

export interface Playlist extends BaseRecord {
    type: 'playlist';
    name: string;
    lastPlayed: string;
    created: string;
}

export interface Tanda extends BaseRecord {
    type: 'tanda';
    style: string;
    name: string;
    cortina: string;
    tracks: string[];
    rating?: 0;
    lastPlayed?: string;
    created?: string;
}