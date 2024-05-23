import { eventBus } from "../events/event-bus";
import { Track, Tanda } from "../data-types";
import { allTracks, getDomElement, renderTrackDetail } from "./utils";
import { TrackElement } from "../components/track.element";
import { TandaElement } from "../components/tanda.element";
import { addDragDropHandlers } from "./drag-drop.service";

type PlayDetail = {
  N: number;
  track: Track;
  player: any;
};
export type ChangeDetails = {
  type: string;
  oldPos: number;
  newPos: number;
};

export class PlaylistService {

  constructor(
    private container: HTMLElement,
    private getDetail: (type: string, name: string) => Promise<Track>
  ) {

    eventBus.on("startingPlaying", this.markPlaying.bind(this));
    eventBus.on("stoppedPlaying", this.unmarkPlaying.bind(this));
    addDragDropHandlers(container)

    function hasPlayed(element: HTMLElement): boolean {
      if (
        element.classList.contains("playing") ||
        element.classList.contains("played")
      ) {
        return true;
      }
      if (element.tagName != "TANDA-ELEMENT") {
        const parent = element.parentElement!;
        if (parent.classList.contains("played")) {
          return true;
        }
      }
      return false;
    }
    
  }

  playingCortina(state: boolean) {
    if (state) {
      getDomElement("#playAll").classList.add("active");
      getDomElement("#stopPlayAll").classList.add("active");
    } else {
      getDomElement("#playAll").classList.remove("active");
      getDomElement("#stopPlayAll").classList.remove("active");
    }
  }

  // Detail contains N - nth track in playlist
  markPlaying(details: PlayDetail) {

    // Get all tracks and pick Nth

    let all = this.allTracks;
    const trackElement = all[details.N] as TrackElement;
    
    // Set it to playing
    all.forEach(track => track.setPlaying(false))
    trackElement.setPlaying(true);

    // Find tanda and set it to playing too
    const tandaElement = trackElement.closest('tanda-element')! as TandaElement;
    tandaElement.setPlaying(true);

    // Work out progress through tanda

    const total = Array.from(tandaElement.querySelectorAll("track-element"));
    const playing =
      1 + total.findIndex((item) => item.classList.contains("playing"));
    console.log(`Playing ${playing}/${total.length}`);

    // Mark all prior tandas as played

    const allTandas = Array.from(
      this.container.querySelectorAll("tanda-element")
    ) as TandaElement[];

    // Find N of the tanda being played
    let tandaN = allTandas.findIndex(tanda => tanda == tandaElement);
    
    for (let i = 0; i < allTandas.length; i++) {
      allTandas[i].setPlayed(i < tandaN);
      allTandas[i].setPlaying(i == tandaN);
    }
  }

  unmarkPlaying(details: PlayDetail) {
    const trackElement = this.allTracks[details.N] as TrackElement;
    console.log("Found track to unmark as playing", trackElement);
    trackElement.setPlaying(false);
  }

  async setTandas(tandaList: Tanda[]) {
    console.log('Tanda list', tandaList)

    this.container.innerHTML = (
      await Promise.all(
        tandaList.map(async (tanda: Tanda, idx: number) => {
          const cortinaElement = tanda.cortina
            ? (async () => {
              let track = await this.getDetail("cortina", tanda.cortina);
              return renderTrackDetail(idx, track, "cortina");
            })()
            : "";

          const trackElements = await Promise.all(
            tanda.tracks.map(async (trackName: string) => {
              let track = await this.getDetail("track", trackName);
              return renderTrackDetail(idx, track, "track");
            })
          );

          return `<tanda-element data-tanda-id="${idx}" data-style='unknown'>
                        ${await cortinaElement}
                        ${trackElements.join("")}
                    </tanda-element>`;
        })
      )
    ).join("");
  }

  get allTracks():  TrackElement[]{
    return allTracks(this.container)
  }

  async fetch(N: number): Promise<Track> {
    const trackElement = this.fetchElement(N);
    return await this.getDetail(trackElement.dataset.type!, trackElement.dataset.file!);
  }

  fetchElement(N: number): TrackElement {
    return this.allTracks[N] as TrackElement;
  }

  getN(track: TrackElement) {
    return this.allTracks.findIndex((t) => t == track);
  }

  getNowPlayingN(): number {
    const playing = this.container.querySelector('track-element.playing, cortina-element.playing') as TrackElement;
    return this.getN(playing)
  }
}
