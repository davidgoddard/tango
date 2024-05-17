// Example usage:
// console.log(formatTime(5000)); // Output: "00:05"

import { Track } from "../data-types";

// console.log(formatTime(5000, true)); // Output: "00:00:05"
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
                  data-year="${year}"></${typeName}-element>`;

  }

  