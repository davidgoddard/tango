import { eventBus } from '../events/event-bus';
import { Track } from './player'

export type ChangeDetails = {
    type: string,
    oldPos: number,
    newPos: number
}

export type Tanda = {
    name: string,
    style: string,
    cortina: Track | null;
    tracks: Track[]
}
export class PlaylistService {

    private tandaList: Tanda[];
    private trackList: Track[];

    constructor() {
        this.tandaList = [];
        this.trackList = [];
        eventBus.on('track-request', this.requestTrack.bind(this))
    }

    setTandas(tandaList: Tanda[]) {
        this.tandaList = tandaList;
        this.extractTracks();
        eventBus.emit('new-playlist')
    }

    getTracks() {
        return this.trackList;
    }

    requestTrack(N: number) {
        eventBus.emit('track-request-result', {
            requested: this.trackList[N],
            previous: N > 0 ? this.trackList[N - 1] : null
        });
    }

    extractTracks() {
        console.log('Extracted tracks', this.trackList)
        for (let tanda of this.tandaList) {
            for (let track of tanda.tracks) {
                this.trackList.push(track)
            }
        }
    }

}