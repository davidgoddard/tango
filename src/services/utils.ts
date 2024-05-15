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
    track.metadata?.tags?.date ||
    track.metadata?.tags?.year ||
    track.metadata?.tags?.creation_time;
  if (year) {
    year = year.substring(0, 4);
  }
  return `<${typeName}-element
                  tandaid="${idx}"
                  trackid="${String(track.id)}" 
                  style="${track.metadata?.tags?.style!}" 
                  title="${track.metadata?.tags?.title!}" 
                  artist="${track.metadata?.tags?.artist!}"
                  duration="${
                    track.metadata?.end
                      ? formatTime((track.metadata?.end - track.metadata?.start))
                      : ""
                  }"
                  year="${year}"></${typeName}-element>`;

  }

  