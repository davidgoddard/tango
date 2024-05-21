import { eventBus } from "../events/event-bus";
import { Track, Tanda } from "../data-types";
import { getDomElement, renderTrackDetail } from "./utils";
import { TrackElement } from "../components/track.element";
import { TandaElement } from "../components/tanda.element";
import { LargeListElement } from "../components/large-list";
import { addDragDropHandlers } from "./drag-drop.service";

interface TandaTrack extends Track {
  tandaOffset: number;
}

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
  private tandaList: Tanda[];
  private trackList: TandaTrack[];

  constructor(
    private container: HTMLElement,
    private getDetail: (type: string, name: string) => Promise<Track>
  ) {
    this.tandaList = [];
    this.trackList = [];
    eventBus.on("track-request", this.requestTrack.bind(this));

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

  markPlaying(details: PlayDetail) {
    const trackElement = Array.from(
      this.container.querySelectorAll("track-element,cortina-element")
    )[details.N] as TrackElement;
    trackElement.setPlaying(true);
    // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
    const tandaId = trackElement.dataset.tandaId;
    const tandaElement = this.container.querySelector(
      `tanda-element[data-tanda-id="${tandaId}"]`
    ) as TandaElement;
    const total = Array.from(tandaElement.querySelectorAll("track-element"));
    const playing =
      1 + total.findIndex((item) => item.classList.contains("playing"));
    console.log(`Playing ${playing}/${total.length}`);
    tandaElement.setPlaying(true);
    const allTandas = Array.from(
      this.container.querySelectorAll("tanda-element")
    ) as TandaElement[];
    allTandas.map((tanda) => {
      tanda.setPlayed(false);
    });
    for (let i = 0; i < allTandas.length; i++) {
      if (allTandas[i] === tandaElement) break;
      console.log("Prior tanda now played");
      allTandas[i].setPlayed(true);
    }
  }

  unmarkPlaying(details: PlayDetail) {
    const trackElement = Array.from(
      this.container.querySelectorAll("track-element,cortina-element")
    )[details.N] as TrackElement;
    console.log("Found track to unmark as playing", trackElement);
    trackElement.setPlaying(false);
    // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
    const tandaId = trackElement.dataset.tandaId;
    const tandaElement = this.container.querySelector(
      `tanda-element[data-tanda-id="${tandaId}"]`
    ) as TandaElement;
    tandaElement.setPlaying(false);
  }

  async setTandas(tandaList: Tanda[]) {
    this.tandaList = tandaList;
    await this.extractTracks();
    console.log('Tanda list', this.tandaList)

    eventBus.emit("new-playlist");
    this.container.innerHTML = (
      await Promise.all(
        this.tandaList.map(async (tanda: Tanda, idx: number) => {
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

  getTracks() {
    return this.trackList;
  }

  requestTrack(N: number) {
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

  fetch(N: number): Track {
    return this.trackList[N];
  }

  fetchElement(N: number): TrackElement {
    return Array.from(
      this.container.querySelectorAll("track-element, cortina-element")
    )[N] as TrackElement;
  }

  getN(track: HTMLTrackElement) {
    return Array.from(
      this.container.querySelectorAll("track-element, cortina-element")
    ).findIndex((t) => t == track);
  }
}
