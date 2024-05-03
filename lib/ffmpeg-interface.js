const { createFFmpeg } = FFmpeg;

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

// All commands must feature the output to "output.wav"
export const runFFmpegCommand = async (fileHandle, ...args) => {

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

