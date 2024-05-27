import { eventBus } from "../events/event-bus";
import { allTracks, getDomElement, renderTrackDetail } from "./utils";
import { addDragDropHandlers } from "./drag-drop.service";
import "../components/schedule.element";
export class PlaylistService {
    container;
    getDetail;
    constructor(container, getDetail) {
        this.container = container;
        this.getDetail = getDetail;
        eventBus.on("startingPlaying", this.markPlaying.bind(this));
        eventBus.on("stoppedPlaying", this.unmarkPlaying.bind(this));
        addDragDropHandlers(container);
        function hasPlayed(element) {
            if (element.classList.contains("playing") ||
                element.classList.contains("played")) {
                return true;
            }
            if (element.tagName != "TANDA-ELEMENT") {
                const parent = element.parentElement;
                if (parent.classList.contains("played")) {
                    return true;
                }
            }
            return false;
        }
    }
    playingCortina(state) {
        if (state) {
            getDomElement(".cortina-grouped-items").classList.add("active");
        }
        else {
            getDomElement(".cortina-grouped-items").classList.remove("active");
        }
    }
    // Detail contains N - nth track in playlist
    markPlaying(details) {
        // Get all tracks and pick Nth
        let all = this.allTracks;
        const trackElement = all[details.N];
        // Set it to playing
        all.forEach(track => track.setPlaying(false));
        trackElement.setPlaying(true);
        // Find tanda and set it to playing too
        const tandaElement = trackElement.closest('tanda-element');
        tandaElement.setPlaying(true);
        // Work out progress through tanda
        const total = Array.from(tandaElement.querySelectorAll("track-element"));
        const playing = 1 + total.findIndex((item) => item.classList.contains("playing"));
        console.log(`Playing ${playing}/${total.length}`);
        // Mark all prior tandas as played
        const allTandas = Array.from(this.container.querySelectorAll("tanda-element"));
        // Find N of the tanda being played
        let tandaN = allTandas.findIndex(tanda => tanda == tandaElement);
        for (let i = 0; i < allTandas.length; i++) {
            allTandas[i].setPlayed(i < tandaN);
            allTandas[i].setPlaying(i == tandaN);
        }
    }
    unmarkPlaying(details) {
        const trackElement = this.allTracks[details.N];
        console.log("Found track to unmark as playing", trackElement);
        trackElement.setPlaying(false);
    }
    async setTandas(tandaList) {
        console.log('Tanda list', tandaList);
        this.container.innerHTML = (await Promise.all(tandaList.map(async (tanda, idx) => {
            const cortinaElement = tanda.cortina
                ? (async () => {
                    let track = await this.getDetail("cortina", tanda.cortina);
                    return renderTrackDetail(idx, track, "cortina");
                })()
                : "";
            const styles = new Set();
            const trackElements = await Promise.all(tanda.tracks.map(async (trackName) => {
                let track = await this.getDetail("track", trackName);
                styles.add(track.metadata.style);
                return renderTrackDetail(idx, track, "track");
            }));
            return `<tanda-element data-tanda-id="${idx}" data-style='${styles.size != 1 ? 'unknown' : [...styles][0]}'>
                        ${await cortinaElement}
                        ${trackElements.join("")}
                    </tanda-element>`;
        }))).join("");
    }
    get allTracks() {
        return allTracks(this.container);
    }
    async fetch(N) {
        const trackElement = this.fetchElement(N);
        return await this.getDetail(trackElement.dataset.type, trackElement.dataset.file);
    }
    fetchElement(N) {
        return this.allTracks[N];
    }
    getN(track) {
        return this.allTracks.findIndex((t) => t == track);
    }
    getNowPlayingN() {
        const playing = this.container.querySelector('track-element.playing, cortina-element.playing');
        return this.getN(playing);
    }
}
