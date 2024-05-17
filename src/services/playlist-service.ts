import { eventBus } from "../events/event-bus";
import { Track, Tanda } from "../data-types";
import { getDomElement, renderTrackDetail } from "./utils";
import { TrackElement } from "../components/track.element";
import { TandaElement } from "../components/tanda.element";

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
    const playlist = this.container;

      let draggingElement: TandaElement | TrackElement;
      let draggingElementTagName: string;

      function hasPlayed(element: HTMLElement): boolean {
        if ( element.classList.contains('playing') || element.classList.contains('played')){
          return true;
        }
        if ( element.tagName != 'TANDA-ELEMENT'){
          const parent = element.parentElement!;
          if ( parent.classList.contains('played')){
            return true;
          }
        }
        return false;
      }
    
      // Track drag start event
      playlist.addEventListener('dragstart', function(event) {
        draggingElement = event.target as TrackElement; // or tanda!
        draggingElementTagName = draggingElement.tagName;
        if ( hasPlayed(draggingElement)) return;
        
        //@ts-ignore
        event.dataTransfer.setData('text/plain', ''); // Required for Firefox
      });
    
      // Track drag over event
      playlist.addEventListener('dragover', function(event) {
        event.preventDefault();
        const targetElement = event.target! as HTMLElement;
   
        // Highlight valid drop targets
        if (isValidDropTarget(targetElement)) {
          targetElement.classList.add('valid-drop-zone');
        }
      });
    
      // Track drag leave event
      playlist.addEventListener('dragleave', function(event) {
        const targetElement = event.target! as HTMLElement;
    
        // Remove highlight from drop targets
        if (isValidDropTarget(targetElement)) {
          targetElement.classList.remove('valid-drop-zone');
        }
      });

      function swapElements(element1: HTMLElement, element2: HTMLElement) {
        // Create a temporary placeholder element
        const temp = document.createElement('div');
      
        // Insert temp before element1
        element1.parentNode!.insertBefore(temp, element1);
      
        // Move element1 to before element2
        element2.parentNode!.insertBefore(element1, element2);
      
        // Move element2 to before temp (which is now where element1 used to be)
        temp.parentNode!.insertBefore(element2, temp);
      
        // Remove temp
        temp.parentNode!.removeChild(temp);
      }
      
    
      // Track drop event
      playlist.addEventListener('drop', function(event) {
        event.preventDefault();
        const targetElement = (event.target! as HTMLElement).closest(draggingElementTagName) as HTMLElement;
    
        // Check if the target tanda is a valid drop target
        if (isValidDropTarget(targetElement)) {
          // Swap tracks or tandas
          console.log('Valid drop - Target:', targetElement, 'Drop element', draggingElement)
          swapElements(targetElement, draggingElement)
          // ...
        }
    
        // Remove highlight from drop targets
        targetElement!.classList.remove('valid-drop-zone');

        eventBus.emit('swapped-playlist')
      });
    
      // Function to check if the target tanda is a valid drop target
      function isValidDropTarget(targetElement: HTMLElement) {
        if ( hasPlayed(targetElement)) return false;

        const draggingItem = draggingElement.closest(draggingElementTagName)! as HTMLElement;
        const draggingStyle = draggingItem.dataset.style;
        const targetStyle = targetElement.dataset.style;
        return draggingStyle === targetStyle && draggingElement.tagName === targetElement.tagName;
      }

  }

  playingCortina(state: boolean){
    if ( state ){
      getDomElement('#playAll').classList.add('active')
      getDomElement('#stopPlayAll').classList.add('active')
    } else {
      getDomElement('#playAll').classList.remove('active')
      getDomElement('#stopPlayAll').classList.remove('active')
    }
  }

  markPlaying(details: PlayDetail) {
    const trackElement = Array.from(this.container.querySelectorAll('track-element,cortina-element'))[details.N] as TrackElement;
    console.log('Found track to mark as playing', trackElement)
    trackElement.setPlaying(true)
    // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
    const tandaId = trackElement.dataset.tandaId;
    const tandaElement = this.container.querySelector(`tanda-element[data-tanda-id="${tandaId}"]`) as TandaElement;
    const total = Array.from(tandaElement.querySelectorAll('track-element'))
    const playing = 1 + total.findIndex(item => item.classList.contains('playing'))
    console.log(`Playing ${playing}/${total.length}`)
    tandaElement.setPlaying(true)
    const allTandas = Array.from(this.container.querySelectorAll('tanda-element'))  as TandaElement[]
    allTandas.map(tanda => {
      tanda.setPlayed(false)
  })
    console.log('All tandas',allTandas)
    for ( let i = 0; i < allTandas.length; i++ ){
      if ( allTandas[i] === tandaElement ) break;
      console.log('Prior tanda now played')
      allTandas[i].setPlayed(true);
    }
  }

  unmarkPlaying(details: PlayDetail) {
    const trackElement = Array.from(this.container.querySelectorAll('track-element,cortina-element'))[details.N] as TrackElement;
    console.log('Found track to unmark as playing', trackElement)
    trackElement.setPlaying(false)
    // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
    const tandaId = trackElement.dataset.tandaId;
    const tandaElement = this.container.querySelector(`tanda-element[data-tanda-id="${tandaId}"]`) as TandaElement;
    tandaElement.setPlaying(false)
  }

  async setTandas(tandaList: Tanda[]) {
    this.tandaList = tandaList;
    await this.extractTracks();

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
      this.container.querySelectorAll("track-element, cortina-element"))[N] as TrackElement
  }

  getN(track: HTMLTrackElement) {
    return Array.from(
      this.container.querySelectorAll("track-element, cortina-element")).findIndex(t => t == track)
  }
}
