// Example usage:
// console.log(formatTime(5000)); // Output: "00:05"
// console.log(formatTime(5000, true)); // Output: "00:00:05"
export function formatTime(milliseconds: number, includeHours: boolean = false): string {
    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(milliseconds / 1000);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the time components
    const hoursString = includeHours ? `${hours.toString().padStart(2, '0')}:` : '';
    const minutesString = minutes.toString().padStart(2, '0');
    const secondsString = seconds.toString().padStart(2, '0');

    // Concatenate the time components
    return `${hoursString}${minutesString}:${secondsString}`;
}

