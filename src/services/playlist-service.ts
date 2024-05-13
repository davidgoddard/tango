import { eventBus } from '../events/event-bus';
import { Track, Tanda } from '../data-types'

export type ChangeDetails = {
    type: string,
    oldPos: number,
    newPos: number
}

export class PlaylistService {

    private tandaList: Tanda[];
    private trackList: Track[];

    constructor(private container: HTMLElement, private getDetail: (type: string, name: string) => Promise<Track>) {
        this.tandaList = [];
        this.trackList = [];
        eventBus.on('track-request', this.requestTrack.bind(this))
    }

    async setTandas(tandaList: Tanda[]) {
        this.tandaList = tandaList;
        await this.extractTracks();
        eventBus.emit('new-playlist')
        this.container.innerHTML = '';
        for ( let track of this.trackList ){
            let te = document.createElement('track-element');
            te.setAttribute('trackid', String(track.id));
            te.setAttribute('style', track.metadata?.tags?.style!);
            te.setAttribute('title', track.metadata?.tags?.title!);
            te.setAttribute('artist', track.metadata?.tags?.artist!);
            let year = track.metadata?.tags?.year!
            if ( year ){
                year = year.substring(0,4)
            }
            te.setAttribute('year', year);
            this.container.appendChild(te)
        }
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

    async extractTracks() {
        for (let tanda of this.tandaList) {
            if ( tanda.cortina){
                this.trackList.push(await this.getDetail('cortina', tanda.cortina))
            }
            for (let track of tanda.tracks) {
                this.trackList.push(await this.getDetail('track', track))
            }
        }
        console.log('Extracted tracks', this.trackList)
    }

    fetch(N: number): Track {
        return this.trackList[N]
    }

}