import { TrackElement } from "../components/track.element";
import { Track } from "../data-types";

export function convert(input: string): string {
  return input.normalize("NFC");
      // const encoder = new TextEncoder();
  // const uint8Array = encoder.encode(input);
  // let decoder = new TextDecoder('utf-16');
  // let text = decoder.decode(uint8Array);
  // return text;
}

export function formatTime(
    totalSeconds: number,
  includeHours: boolean = false
): string {

    if ( totalSeconds < 0 ){
        return '?'
    }
  // Calculate hours, minutes, and seconds
  totalSeconds = Math.floor(totalSeconds)
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the time components
  const hoursString = includeHours
    ? `${hours.toString().padStart(2, "0")}:`
    : "";
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toString().padStart(2, "0");

  // Concatenate the time components
  return `${hoursString}${minutesString}:${secondsString}`;
}

export function timeStringToSeconds(
  timeString: string | null
): number | string {
  if (timeString) {
    const parts = timeString.split(":").map(Number);
    let seconds = 0;

    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else {
      return "?";
    }

    return seconds;
  } else {
    return "";
  }
}

export function renderTrackDetail(idx: number, track: Track, typeName:string): string {
    let year =
    track.metadata?.tags?.year
  if (year) {
    year = year.substring(0, 4);
  }
  return `<${typeName}-element
                  data-type="${typeName.toLowerCase()}"
                  data-tanda-id="${idx}"
                  data-track-id="${String(track.id)}" 
                  data-style="${track.metadata?.style!}" 
                  data-title="${track.metadata?.tags?.title!}" 
                  data-artist="${track.metadata?.tags?.artist!}"
                  data-notes="${track.metadata?.tags?.notes!}"
                  data-bpm="${track.metadata?.tags?.bpm!}"
                  data-duration="${
                    track.metadata?.end
                      ? formatTime((track.metadata?.end - track.metadata?.start))
                      : ""
                  }"
                  data-year="${year}"
                  data-file="${track.name}"></${typeName}-element>`;

  }

  export function createPlaceHolder(typeName: string,style: string){
    return `<${typeName}
                  data-type="${typeName.split('-')[0].toLowerCase()}"
                  data-style="${style}" 
                  data-title="place holder" 
            ></${typeName}>`;
  }

  export function getDomElementAll(selector: string): NodeList {
    return document.querySelectorAll(selector);
  }
  export function getDomElement(selector: string): HTMLElement {
    return document.querySelector(selector) as HTMLElement;
  }

  export function allTracks(container: HTMLElement | Document): TrackElement[]{
    return Array.from(
      container.querySelectorAll(`track-element:not([data-title="place holder"]), cortina-element:not([data-title="place holder"])`)
    ) as TrackElement[];
  }