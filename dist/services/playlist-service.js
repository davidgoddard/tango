import { eventBus } from "../events/event-bus";
import { getDomElement, renderTrackDetail } from "./utils";
import { addDragDropHandlers } from "./drag-drop.service";
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
        //   // Variables to store hovered elements
        //  const hoveredElements: Set<HTMLElement> = new Set();
        //  // Function to handle drag over event with caching
        //  function handleDragOverThrottled(event: Event) {
        //    event.preventDefault();
        //    const targetElement = event.target! as HTMLElement;
        //    // Add the target element to the set of hovered elements
        //    hoveredElements.add(targetElement);
        //    // Request animation frame to update styling
        //    requestAnimationFrame(() => {
        //      // Highlight valid drop targets
        //      hoveredElements.forEach((element) => {
        //        if (isValidDropTarget(element)) {
        //          element.classList.add("valid-drop-zone");
        //        }
        //      });
        //    });
        //  }
        //  // Function to handle drag leave event with caching
        //  function handleDragLeaveThrottled(event: Event) {
        //    const targetElement = event.target! as HTMLElement;
        //    // Remove the target element from the set of hovered elements
        //    hoveredElements.delete(targetElement);
        //    // Request animation frame to update styling
        //    requestAnimationFrame(() =>
        //      {
        //      // Remove highlight from drop targets that are no longer hovered over
        //      if (!hoveredElements.has(targetElement)) {
        //        if (isValidDropTarget(targetElement)) {
        //          targetElement.classList.remove("valid-drop-zone");
        //        }
        //      }
        //    });
        //  }
        //     // Add throttled event listeners
        //     playlist.addEventListener("dragover", handleDragOverThrottled);
        //     playlist.addEventListener("dragleave", handleDragLeaveThrottled);
        // // Track drag start event
        // playlist.addEventListener("dragstart", function (event) {
        //   draggingElement = event.target as TrackElement; // or tanda!
        //   draggingElementTagName = draggingElement.tagName;
        //   if (hasPlayed(draggingElement)) return;
        //   //@ts-ignore
        //   event.dataTransfer.setData("text/plain", ""); // Required for Firefox
        // });
        // function swapElements(element1: HTMLElement, element2: HTMLElement) {
        //   // Create a temporary placeholder element
        //   const temp = document.createElement("div");
        //   // Insert temp before element1
        //   element1.parentNode!.insertBefore(temp, element1);
        //   // Move element1 to before element2
        //   element2.parentNode!.insertBefore(element1, element2);
        //   // Move element2 to before temp (which is now where element1 used to be)
        //   temp.parentNode!.insertBefore(element2, temp);
        //   // Remove temp
        //   temp.parentNode!.removeChild(temp);
        // }
        // // Track drop event
        // playlist.addEventListener("drop", function (event) {
        //   event.preventDefault();
        //   const targetElement = (event.target! as HTMLElement).closest(
        //     draggingElementTagName
        //   ) as HTMLElement;
        //   // Check if the target tanda is a valid drop target
        //   if (isValidDropTarget(targetElement)) {
        //     // Swap tracks or tandas
        //     console.log(
        //       "Valid drop - Target:",
        //       targetElement,
        //       "Drop element",
        //       draggingElement
        //     );
        //     swapElements(targetElement, draggingElement);
        //     // ...
        //   }
        //   // Remove highlight from drop targets
        //   hoveredElements.forEach((element) => {
        //     element!.classList.remove("valid-drop-zone");
        //   });
        //   hoveredElements.clear();
        //   eventBus.emit("swapped-playlist");
        // });
        // // Function to check if the target tanda is a valid drop target
        // function isValidDropTarget(targetElement: HTMLElement) {
        //   if (hasPlayed(targetElement)) return false;
        //   const draggingItem = draggingElement.closest(
        //     draggingElementTagName
        //   )! as HTMLElement;
        //   const draggingStyle = draggingItem.dataset.style;
        //   const targetStyle = targetElement.dataset.style;
        //   return (
        //     draggingStyle === targetStyle &&
        //     draggingElement.tagName === targetElement.tagName
        //   );
        // }
    }
    playingCortina(state) {
        if (state) {
            getDomElement("#playAll").classList.add("active");
            getDomElement("#stopPlayAll").classList.add("active");
        }
        else {
            getDomElement("#playAll").classList.remove("active");
            getDomElement("#stopPlayAll").classList.remove("active");
        }
    }
    markPlaying(details) {
        const trackElement = Array.from(this.container.querySelectorAll("track-element,cortina-element"))[details.N];
        trackElement.setPlaying(true);
        // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
        const tandaId = trackElement.dataset.tandaId;
        const tandaElement = this.container.querySelector(`tanda-element[data-tanda-id="${tandaId}"]`);
        const total = Array.from(tandaElement.querySelectorAll("track-element"));
        const playing = 1 + total.findIndex((item) => item.classList.contains("playing"));
        console.log(`Playing ${playing}/${total.length}`);
        tandaElement.setPlaying(true);
        const allTandas = Array.from(this.container.querySelectorAll("tanda-element"));
        allTandas.map((tanda) => {
            tanda.setPlayed(false);
        });
        for (let i = 0; i < allTandas.length; i++) {
            if (allTandas[i] === tandaElement)
                break;
            console.log("Prior tanda now played");
            allTandas[i].setPlayed(true);
        }
    }
    unmarkPlaying(details) {
        const trackElement = Array.from(this.container.querySelectorAll("track-element,cortina-element"))[details.N];
        console.log("Found track to unmark as playing", trackElement);
        trackElement.setPlaying(false);
        // Array.from(this.container.querySelectorAll('tanda-element')).forEach((tanda: any) => tanda.setPlaying(false));
        const tandaId = trackElement.dataset.tandaId;
        const tandaElement = this.container.querySelector(`tanda-element[data-tanda-id="${tandaId}"]`);
        tandaElement.setPlaying(false);
    }
    async setTandas(tandaList) {
        this.tandaList = tandaList;
        await this.extractTracks();
        console.log('Tanda list', this.tandaList);
        // let largeList: LargeListElement = document.createElement('large-list-element') as LargeListElement;
        // this.container.innerHTML = '';
        // this.container.appendChild(largeList)
        // largeList.setRenderItem(async (N:number)=>{
        //   const tanda = this.tandaList[N];
        //   tanda.id = N;
        //   const tandaElement = document.createElement('tanda-element')
        //   tandaElement.setAttribute('data-tanda-id', String(tanda.id));
        //   tandaElement.setAttribute('data-style', 'unknown')
        //   let html = '';
        //   if ( tanda.cortina ){        
        //           let track = await this.getDetail("cortina", tanda.cortina);
        //           html += renderTrackDetail(tanda.id!, track, "cortina");
        //   }
        //       const trackElements = await Promise.all(
        //         tanda.tracks.map(async (trackName: string) => {
        //           let track = await this.getDetail("track", trackName);
        //           return renderTrackDetail(tanda.id!, track, "track");
        //         })
        //       );
        //       html += trackElements.join('');
        //     tandaElement.innerHTML = html;
        //     return tandaElement;
        // })
        // largeList.setListSize(this.tandaList.length);
        eventBus.emit("new-playlist");
        this.container.innerHTML = (await Promise.all(this.tandaList.map(async (tanda, idx) => {
            const cortinaElement = tanda.cortina
                ? (async () => {
                    let track = await this.getDetail("cortina", tanda.cortina);
                    return renderTrackDetail(idx, track, "cortina");
                })()
                : "";
            const trackElements = await Promise.all(tanda.tracks.map(async (trackName) => {
                let track = await this.getDetail("track", trackName);
                return renderTrackDetail(idx, track, "track");
            }));
            return `<tanda-element data-tanda-id="${idx}" data-style='unknown'>
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
    fetchElement(N) {
        return Array.from(this.container.querySelectorAll("track-element, cortina-element"))[N];
    }
    getN(track) {
        return Array.from(this.container.querySelectorAll("track-element, cortina-element")).findIndex((t) => t == track);
    }
}
