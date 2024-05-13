import { eventBus } from "../events/event-bus";
export class PlaylistService {
    container;
    getDetail;
    tandaList;
    trackList;
    constructor(container, getDetail) {
        this.container = container;
        this.getDetail = getDetail;
        this.tandaList = [];
        this.trackList = [];
        eventBus.on("track-request", this.requestTrack.bind(this));
    }
    async setTandas(tandaList) {
        this.tandaList = tandaList;
        await this.extractTracks();
        eventBus.emit("new-playlist");
        this.container.innerHTML = (await Promise.all(this.tandaList.map(async (tanda, idx) => {
            const cortinaElement = tanda.cortina
                ? (async () => {
                    let track = await this.getDetail("cortina", tanda.cortina);
                    let year = track.metadata?.tags?.year;
                    if (year) {
                        year = year.substring(0, 4);
                    }
                    return `<cortina-element
                                tandaid="${idx}"
                                trackid="${String(track.id)}" 
                                style="${track.metadata?.tags?.style}" 
                                title="${track.metadata?.tags?.title}" 
                                artist="${track.metadata?.tags?.artist}"
                                year="${year}"></cortina-element>`;
                })()
                : "";
            const trackElements = await Promise.all(tanda.tracks.map(async (trackName) => {
                let track = await this.getDetail("track", trackName);
                let year = track.metadata?.tags?.year;
                if (year) {
                    year = year.substring(0, 4);
                }
                return `<track-element 
                            tandaid="${idx}"
                            trackid="${String(track.id)}" 
                            style="${track.metadata?.tags?.style}" 
                            title="${track.metadata?.tags?.title}" 
                            artist="${track.metadata?.tags?.artist}"
                            year="${year}"></track-element>`;
            }));
            return `<tanda-element style='unknown'>
                        ${await cortinaElement}
                        ${trackElements.join("")}
                    </tanda-element>`;
        }))).join("");
    }
    getTracks() {
        return this.trackList;
    }
    requestTrack(N) {
        eventBus.emit("track-request-result", {
            requested: this.trackList[N],
            previous: N > 0 ? this.trackList[N - 1] : null,
        });
    }
    async extractTracks() {
        for (let idx = 0; idx < this.tandaList.length; idx++) {
            let tanda = this.tandaList[idx];
            if (tanda.cortina) {
                this.trackList.push({
                    ...(await this.getDetail("cortina", tanda.cortina)),
                    tandaOffset: idx,
                });
            }
            for (let track of tanda.tracks) {
                this.trackList.push({
                    ...(await this.getDetail("track", track)),
                    tandaOffset: idx,
                });
            }
        }
        console.log("Extracted tracks", this.trackList);
    }
    fetch(N) {
        return this.trackList[N];
    }
}
