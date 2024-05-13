// @ts-ignore
const FFmpeg = window.FFmpeg;

const { createFFmpeg } = FFmpeg;

let ffmpeg: any; // Define ffmpeg variable

export const initializeFFmpeg = async () => {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    console.log('FFmpeg initialized - terminate?', ffmpeg.terminate);
};

async function readFile(fileHandle: FileSystemFileHandle) {
    try {
        const file = await fileHandle.getFile();
        const contents = await file.arrayBuffer();
        return contents; // This should now hold the binary data of the file
    } catch (error) {
        console.error('Error reading file:', error);
        return undefined;
    }
}

async function readFileContents(fileHandle: FileSystemFileHandle) {
    let contents: ArrayBuffer | undefined;
    try {
        contents = await readFile(fileHandle);
        if (!contents) {
            console.log('Failed to read file');
        } else {
            console.log('File read successfully', contents);
            const uint8Array = new Uint8Array(contents);
            console.log('Got unit8 array', uint8Array.byteLength);
            contents = uint8Array;
        }
    } catch (error) {
        console.error('Error reading file contents:', error);
    }
    console.log('Read file size: ', contents?.byteLength);
    return contents;
}

let totalCalls = 0;

// All commands must feature the output to "output.wav"
export const runFFmpegCommand = async (fileHandle: FileSystemFileHandle, ...args: string[]) => {
    console.log('FFMPEG call ', totalCalls);
    totalCalls++;
    if (totalCalls % 50 === 0) {
        console.log('RE-INITIALISING FFMPEG');
        ffmpeg.terminate();
        setTimeout(async ()=>{
            await initializeFFmpeg()
        },1000)
        ;
    }

    try {
        const fileData = await readFileContents(fileHandle);
        if (!fileData || fileData.byteLength < 1000) {
            console.log('Too small');
            return;
        }

        // Write the file data to ffmpeg.js virtual file system
        await ffmpeg.FS('writeFile', fileHandle.name, fileData);

        // Capture console output
        const originalConsoleLog = console.log;
        const outputLines: string[] = [];
        console.log = function (message: string) {
            // Check if the message is from FFmpeg
            if (message && message.startsWith('[fferr]')) {
                // Process FFmpeg log message
                // @ts-ignore
                originalConsoleLog.apply(console, arguments);
                outputLines.push(message);
                // Process log message further if needed
            } else {
                // Call the original console.log function for non-FFmpeg messages
                // @ts-ignore
                originalConsoleLog.apply(console, arguments);
            }
        };

        // Run ffmpeg command
        const ffmpegArgs = args.length > 0 ? ['-i', fileHandle.name, ...args, 'output.wav'] : ['-i', fileHandle.name, 'output.wav'];
        await ffmpeg.run(...ffmpegArgs);

        console.log = originalConsoleLog;

        // Read the converted file from ffmpeg.js virtual file system
        const convertedFile = await ffmpeg.FS('readFile', 'output.wav');

        // Clean up
        await ffmpeg.FS('unlink', fileHandle.name);
        await ffmpeg.FS('unlink', 'output.wav');

        return { convertedFile, outputLines };
    } catch (error) {
        console.error('Error running FFmpeg command:', error);
    }
};

export function timeStringToSeconds(timeString: string) {
    // Split the time string into hours, minutes, seconds, and milliseconds
    const [hours, minutes, secondsWithMillis] = timeString.split(':');

    // Split seconds and milliseconds
    const [seconds, milliseconds] = secondsWithMillis.split('.');

    // Convert hours, minutes, seconds, and milliseconds to numbers
    const hoursInSeconds = parseInt(hours) * 3600;
    const minutesInSeconds = parseInt(minutes) * 60;
    const secondsTotal = parseInt(seconds);
    const millisecondsTotal = parseInt(milliseconds) / 100; // Convert milliseconds to seconds

    // Calculate total time in seconds
    const totalTimeInSeconds = hoursInSeconds + minutesInSeconds + secondsTotal + millisecondsTotal;

    return totalTimeInSeconds;
}

export const decodeFFmpegOutput = (outputLines: string[]) => {
    let silenceStartFinishes = 0;
    let silenceEndCommences = 0;
    let duration = 0;
    let meanVolume = 0;
    let maxVolume = 0;
    let tags: Record<string, string> = {};
    let tagsContext = '';
    for (const line of outputLines) {
        console.log(line);
        if (tagsContext === '' && line.match(/Output.*to 'pipe:'/)) {
            tagsContext = 'output';
        }
        if (tagsContext === 'output' && line.match(/\[fferr\]     /)) {
            const tagName = line.substring("fferr]     ".length).split(':')[0].trim();
            const tagValue = line.split(':')[1].trim();
            tags[tagName] = tagValue;
        }
        if (line.match(/Parsed_volumedetect_0.*_volume/)) {
            console.log('GAIN ', line);
            const tokens = line.split(' ');
            console.log(tokens);
            if (tokens[4] === 'mean_volume:') {
                meanVolume = parseFloat(tokens[5]);
            }
            if (tokens[4] === 'max_volume:') {
                maxVolume = parseFloat(tokens[5]);
            }
        }
        if (line.match(/\[fferr\]   Duration: /i)) {
            console.log('DURATION', line);
            const tokens = line.split(' ');
            console.log(tokens);
            duration = timeStringToSeconds(tokens[4]);
        }
        if (line.match(/silencedetect @.* silence_start/)) {
            console.log('SILENCE START', line);
            const tokens = line.split(' ');
            console.log(tokens);
            silenceEndCommences = parseFloat(tokens[5]);
        }
        if (line.match(/silencedetect @.* silence_end: .* | silence_duration: .*/)) {
            console.log('SILENCE END', line);
            const tokens = line.split(' ');
            console.log(tokens);
            let duration = parseFloat(tokens[8]);
            let time = parseFloat(tokens[5]);
            if (time < 10) {
                silenceStartFinishes = time;
            }
        }
    }
    if (silenceEndCommences === 0) {
        silenceEndCommences = duration;
    }
    if (silenceEndCommences < duration - 20) {
        silenceEndCommences = duration;
    }
    console.log('Derived duration', duration);
    console.log('Derived silence at start finishes @', silenceStartFinishes);
    console.log('Derived silence at end starts @', silenceEndCommences);

    const metadata = {
        duration,
        start: silenceStartFinishes,
        end: silenceEndCommences,
        meanVolume,
        maxVolume,
        tags,
    };
    return metadata;
};
