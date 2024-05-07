// const { createFFmpeg } = FFmpeg;

// Mock FFmpeg.wasm
const mockFFmpeg = {
  // Mock methods and properties of FFmpeg.wasm
  createFFmpeg: () => {
    return {
      load: async () => {},
      writeDisk: async () => {},
      readDisk: async () => {},
      FS: {
        mkdir: () => {},
        writeFile: () => {},
        unlink: () => {},
        readFile: () => {},
      },
      run: async () => {},
      exit: async () => {},
    };
  },
};

// Replace FFmpeg.wasm with the mock
const createFFmpeg = mockFFmpeg.createFFmpeg;



let ffmpeg;
export const initializeFFmpeg = async () => {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    console.log('FFmpeg initialized');
};

async function readFile(fileHandle) {
    try {
        const file = await fileHandle.getFile();
        const contents = await file.arrayBuffer();
        return contents; // This should now hold the binary data of the file
    } catch (error) {
        console.error('Error reading file:', error);
        return undefined;
    }
}

async function readFileContents(fileHandle) {
    // Use the file handle to obtain a file
    // Example usage, ensure fileHandle is defined
    let contents = await readFile(fileHandle)
    if (contents) {
        console.log('File read successfully', contents);
        let uint8Array = new Uint8Array(contents);
        console.log('Got unit8 array', uint8Array.byteLength)
        contents = uint8Array;
    } else {
        console.log('Failed to read file');
    }
    console.log('Read file size: ', contents.byteLength)
    return contents;
}

let totalCalls = 0

// All commands must feature the output to "output.wav"
export const runFFmpegCommand = async (fileHandle, ...args) => {

    if ( totalCalls % 100 == 0 ){
        console.log('RE-INITIALISING FFMPEG')
        await ffmpeg.terminate();
        await initializeFFmpeg();
    }
    totalCalls++

    try {

        const fileData = await readFileContents(fileHandle);
        if (fileData.byteLength < 1000) {
            console.log('Too small')
            return;
        }

        // Write the file data to ffmpeg.js virtual file system
        await ffmpeg.FS('writeFile', fileHandle.name, fileData);


        // Capture console output
        const originalConsoleLog = console.log;

        const outputLines = []
        console.log = function (message) {
            // Check if the message is from FFmpeg
            if (message.startsWith('[fferr]')) {
                // Process FFmpeg log message
                originalConsoleLog.apply(console, arguments);
                outputLines.push(message)
                // Process log message further if needed
            } else {
                // Call the original console.log function for non-FFmpeg messages
                originalConsoleLog.apply(console, arguments);
            }
        };

        // Run ffmpeg command
        if (args.length > 0) {
            await ffmpeg.run('-i', fileHandle.name, ...args, 'output.wav')
        } else {
            await ffmpeg.run('-i', fileHandle.name, 'output.wav')
        }

        console.log = originalConsoleLog;

        // Read the converted file from ffmpeg.js virtual file system
        const convertedFile = await ffmpeg.FS('readFile', 'output.wav');

        // Clean up
        await ffmpeg.FS('unlink', fileHandle.name);
        await ffmpeg.FS('unlink', 'output.wav');

        return { convertedFile, outputLines }
    }
    catch (error) {
        console.log(error);
        console.log('Carry on')
    }
};

export function timeStringToSeconds(timeString) {
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

export const decodeFFmpegOutput = (outputLines) => {
    let silenceStartFinishes = 0
    let silenceEndCommences = 0
    let duration = 0
    let meanVolume = 0
    let maxVolume = 0
    let tags = {}
    let tagsContext = '';
    for (const line of outputLines) {
      console.log(line)
      if (tagsContext == '' && line.match(/Output.*to 'pipe:'/)) {
        tagsContext = 'output'
      }
      if (tagsContext == 'output' && line.match(/\[fferr\]     /)) {
        const tagName = line.substring("fferr]     ".length).split(':')[0].trim();
        const tagValue = line.split(':')[1].trim()
        tags[tagName] = tagValue
      }
      if (line.match(/Parsed_volumedetect_0.*_volume/)) {
        console.log('GAIN ', line)
        const tokens = line.split(' ')
        console.log(tokens)
        if (tokens[4] == "mean_volume:") {
          meanVolume = parseFloat(tokens[5])
        }
        if (tokens[4] == "max_volume:") {
          maxVolume = parseFloat(tokens[5])
        }
      }
      if (line.match(/\[fferr\]   Duration: /i)) {
        console.log('DURATION', line)
        const tokens = line.split(' ')
        console.log(tokens)
        duration = timeStringToSeconds(tokens[4])
      }
      if (line.match(/silencedetect @.* silence_start/)) {
        console.log('SILENCE START', line)
        const tokens = line.split(' ')
        console.log(tokens)
        silenceEndCommences = parseFloat(tokens[5])
      }
      if (line.match(/silencedetect @.* silence_end: .* | silence_duration: .*/)) {
        console.log('SILENCE END', line)
        const tokens = line.split(' ')
        console.log(tokens)
        let duration = parseFloat(tokens[8])
        let time = parseFloat(tokens[5])
        if (time < 10) {
          silenceStartFinishes = time
        }
      }
    }
    if (silenceEndCommences == 0) {
      silenceEndCommences = duration
    }
    if (silenceEndCommences < duration - 20) {
      silenceEndCommences = duration
    }
    console.log('Derived duration', duration)
    console.log('Derived silence at start finishes @', silenceStartFinishes)
    console.log('Derived silence at end starts @', silenceEndCommences)

    const metadata = {
      duration,
      start: silenceStartFinishes,
      end: silenceEndCommences,
      meanVolume,
      maxVolume,
      tags
    }
    return metadata;

}
