import { eventBus } from "../events/event-bus";
import { Track, Tanda } from "../data-types";
import { formatTime, renderTrackDetail } from "./utils";
import { TrackElement } from "../components/track.element";

interface TandaTrack extends Track {
  tandaOffset: number;
}

type PlayDetail = {
  N: number,
  track: Track,
  player: any
}
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

    // Parent container where tracks can be dropped
    const dropTarget = this.container;

    dropTarget.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    dropTarget.addEventListener("drop", function (event) {
      event.preventDefault();
      const trackId = event.dataTransfer!.getData("text/plain");
      // Do something with the dropped track ID, like append it to the drop target
      const trackElement = document.querySelector(
        `[data-track-id="${trackId}"]`
      )!;
      dropTarget.appendChild(trackElement);
    });
  }

  markPlaying(details: PlayDetail){
    const trackElement = Array.from(this.container.querySelectorAll('track-element,cortina-element'))[details.N] as TrackElement;
    console.log('Found track to mark as playing', trackElement)
    trackElement.setPlaying(false)
  }
  unmarkPlaying(details: PlayDetail){
    const trackElement = Array.from(this.container.querySelectorAll('track-element,cortina-element'))[details.N] as TrackElement;
    console.log('Found track to unmark as playing', trackElement)
    trackElement.setPlaying(false)
  }

  async setTandas(tandaList: Tanda[]) {
    this.tandaList = tandaList;
    await this.extractTracks();

    // const virtualList = document.createElement(
    //   "virtual-scroll-list"
    // ) as VirtualScrollList;
    // virtualList.setAttribute("item-height", "50");
    // virtualList.setAttribute("total-items", String(this.tandaList.length)); // Number of items

    // virtualList.setRenderFunction(async (tanda: Tanda, idx: number) => {
    //     const tandaElement = document.createElement('tanda-element')
    //     tandaElement.setAttribute('style', tanda.style)

    //     if ( tanda.cortina ){
    //         let track = await this.getDetail("cortina", tanda.cortina);
    //         let year = track.metadata?.tags?.year!;
    //         if (year) {
    //           year = year.substring(0, 4);
    //         }
    //         const cortinaElement = document.createElement('cortina-element');
    //         cortinaElement.setAttribute('tandaid', String(idx))
    //         cortinaElement.setAttribute('trackid', String(track.id))
    //         cortinaElement.setAttribute('style', track.metadata?.tags?.style!)
    //         cortinaElement.setAttribute('title', track.metadata?.tags?.title!)
    //         cortinaElement.setAttribute('artist', track.metadata?.tags?.artist!)
    //         cortinaElement.setAttribute('year', year)
    //         tandaElement.appendChild(cortinaElement)

    //     }

    //     tanda.tracks.map(async (trackName: string) => {
    //       let track = await this.getDetail("track", trackName);
    //       let year = track.metadata?.tags?.year!;
    //       if (year) {
    //         year = year.substring(0, 4);
    //       }
    //       const trackElement = document.createElement('track-element')
    //       trackElement.setAttribute('tandaid', String(idx))
    //       trackElement.setAttribute('trackid', String(track.id))
    //       trackElement.setAttribute('style', track.metadata?.tags?.style!)
    //       trackElement.setAttribute('title', track.metadata?.tags?.title!)
    //       trackElement.setAttribute('artist', track.metadata?.tags?.artist!)
    //       trackElement.setAttribute('year', year)
    //       tandaElement.appendChild(trackElement)
    //   })

    //     return tandaElement;
    // });

    // virtualList.setItems(this.tandaList);

    // this.container.innerHTML = "";
    // this.container.appendChild(virtualList);

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

          return `<tanda-element style='unknown'>
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
      this.container.querySelectorAll("track-element, cortina-element"))[N] as TrackElement
  }

  getN(track: HTMLTrackElement) {
    return Array.from(
      this.container.querySelectorAll("track-element, cortina-element")).findIndex(t => t == track)
  }
}
