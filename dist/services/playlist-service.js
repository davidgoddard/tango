import { eventBus } from '../events/event-bus';
export class PlaylistService {
    tandaList;
    trackList;
    constructor() {
        this.tandaList = [];
        this.trackList = [];
        eventBus.on('track-request', this.requestTrack.bind(this));
    }
    setTandas(tandaList) {
        this.tandaList = tandaList;
        this.extractTracks();
        eventBus.emit('new-playlist');
    }
    getTracks() {
        return this.trackList;
    }
    requestTrack(N) {
        eventBus.emit('track-request-result', {
            requested: this.trackList[N],
            previous: N > 0 ? this.trackList[N - 1] : null
        });
    }
    extractTracks() {
        for (let tanda of this.tandaList) {
            for (let track of tanda.tracks) {
                this.trackList.push(track);
            }
        }
    }
}
