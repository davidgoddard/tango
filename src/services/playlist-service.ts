import { eventBus } from "../events/event-bus";
import { Track, Tanda } from "../data-types";

interface TandaTrack extends Track {
  tandaOffset: number;
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
  }

  async setTandas(tandaList: Tanda[]) {
    this.tandaList = tandaList;
    await this.extractTracks();

    const virtualList = document.createElement(
      "virtual-scroll-list"
    ) as VirtualScrollList;
    virtualList.setAttribute("item-height", "50");
    virtualList.setAttribute("total-items", String(this.tandaList.length)); // Number of items

    virtualList.setRenderFunction(async (tanda: Tanda, idx: number) => {
        const tandaElement = document.createElement('tanda-element')
        tandaElement.setAttribute('style', tanda.style)

        if ( tanda.cortina ){
            let track = await this.getDetail("cortina", tanda.cortina);
            let year = track.metadata?.tags?.year!;
            if (year) {
              year = year.substring(0, 4);
            }
            const cortinaElement = document.createElement('cortina-element');
            cortinaElement.setAttribute('tandaid', String(idx))
            cortinaElement.setAttribute('trackid', String(track.id))
            cortinaElement.setAttribute('style', track.metadata?.tags?.style!)
            cortinaElement.setAttribute('title', track.metadata?.tags?.title!)
            cortinaElement.setAttribute('artist', track.metadata?.tags?.artist!)
            cortinaElement.setAttribute('year', year)
            tandaElement.appendChild(cortinaElement)

        }

        tanda.tracks.map(async (trackName: string) => {
          let track = await this.getDetail("track", trackName);
          let year = track.metadata?.tags?.year!;
          if (year) {
            year = year.substring(0, 4);
          }
          const trackElement = document.createElement('track-element')
          trackElement.setAttribute('tandaid', String(idx))
          trackElement.setAttribute('trackid', String(track.id))
          trackElement.setAttribute('style', track.metadata?.tags?.style!)
          trackElement.setAttribute('title', track.metadata?.tags?.title!)
          trackElement.setAttribute('artist', track.metadata?.tags?.artist!)
          trackElement.setAttribute('year', year)
          tandaElement.appendChild(trackElement)
      })

        return tandaElement;
    });

    virtualList.setItems(this.tandaList);

    this.container.innerHTML = "";
    this.container.appendChild(virtualList);

    /*    eventBus.emit("new-playlist");
    this.container.innerHTML = (
      await Promise.all(
        this.tandaList.map(async (tanda: Tanda, idx: number) => {
          const cortinaElement = tanda.cortina
            ? (async () => {
                let track = await this.getDetail("cortina", tanda.cortina);
                let year = track.metadata?.tags?.year!;
                if (year) {
                  year = year.substring(0, 4);
                }
                return `<cortina-element
                                tandaid="${idx}"
                                trackid="${String(track.id)}" 
                                style="${track.metadata?.tags?.style!}" 
                                title="${track.metadata?.tags?.title!}" 
                                artist="${track.metadata?.tags?.artist!}"
                                year="${year}"></cortina-element>`;
              })()
            : "";

          const trackElements = await Promise.all(
            tanda.tracks.map(async (trackName: string) => {
              let track = await this.getDetail("track", trackName);
              let year = track.metadata?.tags?.year!;
              if (year) {
                year = year.substring(0, 4);
              }
              return `<track-element 
                            tandaid="${idx}"
                            trackid="${String(track.id)}" 
                            style="${track.metadata?.tags?.style!}" 
                            title="${track.metadata?.tags?.title!}" 
                            artist="${track.metadata?.tags?.artist!}"
                            year="${year}"></track-element>`;
            })
          );

          return `<tanda-element style='unknown'>
                        ${await cortinaElement}
                        ${trackElements.join("")}
                    </tanda-element>`;
        })
      )
    ).join("");
    */
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
}
