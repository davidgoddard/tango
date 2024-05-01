const CONFIG_ID = 1

async function selectFolder() {
  // Check for support
  if (!window.showDirectoryPicker) {
    alert("The File System Access API is not supported in your browser.");
    return;
  }

  try {
    const directoryHandle = await window.showDirectoryPicker();
    return directoryHandle;
  } catch (err) {
    console.error(err);
    alert("Error accessing the directory.");
  }
}

export async function getAllFiles(directoryHandle, relativePath = '', fileList = []) {
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      fileList.push({fileHandle: entry, relativePath: relativePath, relativeFileName: relativePath + '/' + entry.name});
    } else if (entry.kind === 'directory') {
      await getAllFiles(entry, `${relativePath}/${entry.name}`, fileList);
    }
  }
  return fileList;
}

export async function verifyPermission(fileHandle, readWrite) {
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  return (await fileHandle.requestPermission(options)) === 'granted';
}

export async function openMusicFolder(dbManager, config) {
  try {
    console.log(`Using config ${JSON.stringify(config)}`)
    const directoryHandleOrUndefined = config.musicFolder;
    if (directoryHandleOrUndefined) {
      console.log(`Retrieved directory handle "${directoryHandleOrUndefined.name}" from IndexedDB.`);
      return;
    }
    const directoryHandle = await selectFolder();
    config.musicFolder = directoryHandle;
    await dbManager.updateData('system', CONFIG_ID, config)
    console.log(`Stored directory handle for "${directoryHandle.name}" in IndexedDB.`);
  } catch (error) {
    console.error(error)
    alert(error.name, error.message);
  }
}
export async function saveFileWithWritePermission(fileHandle, jsonData) {
  if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(jsonData);
      await writable.close();
  } else {
      // No fileHandle available, request a new file save
      fileHandle = await window.showSaveFilePicker({
          types: [{
              description: 'JSON files',
              accept: {'application/json': ['.json']}
          }]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonData);
      await writable.close();
  }
  return fileHandle;
}

export async function analyzeAudioFile(fileHandle) {
  const audioContext = new AudioContext();
  const audioBuffer = await decodeAudioFile(fileHandle, audioContext);

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0); // Assuming mono audio

  console.log("Decoded audio duration:", audioBuffer.duration, "seconds");

  const audioData = {
      duration: audioBuffer.duration,
      meanGain: calculateMeanGain(channelData),
      maxGain: calculateMaxGain(channelData),
      openingSilenceEnd: detectSilenceStart(channelData, sampleRate),
      trailingSilenceStart: detectSilenceEnd(channelData, sampleRate)
  };

  return audioData;
}

function decodeAudioFile(fileHandle, audioContext) {
  return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async function(event) {
          const arrayBuffer = event.target.result;
          try {
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              resolve(audioBuffer);
          } catch (error) {
              reject(error);
          }
      };
      fileReader.onerror = function(event) {
          reject(event.target.error);
      };
      fileReader.readAsArrayBuffer(fileHandle);
  });
}

function calculateMeanGain(channelData) {
  let totalGain = 0;
  for (let i = 0; i < channelData.length; i++) {
      totalGain += Math.abs(channelData[i]);
  }
  return totalGain / channelData.length;
}

function calculateMaxGain(channelData) {
  let maxGain = 0;
  for (let i = 0; i < channelData.length; i++) {
      const gain = Math.abs(channelData[i]);
      if (gain > maxGain) {
          maxGain = gain;
      }
  }
  return maxGain;
}

function detectSilenceStart(channelData, sampleRate) {
  const SILENCE_THRESHOLD = 0.0001; // Adjust this threshold as needed
  const MIN_SILENCE_DURATION = 0.1; // Minimum consecutive seconds considered as silence
  const minSilenceSamples = MIN_SILENCE_DURATION * sampleRate;

  let silenceStart = 0;
  for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) < SILENCE_THRESHOLD) {
          silenceStart++;
      } else {
          silenceStart = 0;
      }
      if (silenceStart >= minSilenceSamples) {
          return i / sampleRate; // Convert samples to seconds
      }
  }
  return 0; // No silence found
}

function detectSilenceEnd(channelData, sampleRate) {
  const SILENCE_THRESHOLD = 0.0001; // Adjust this threshold as needed
  const MIN_SILENCE_DURATION = 0.1; // Minimum consecutive seconds considered as silence
  const minSilenceSamples = MIN_SILENCE_DURATION * sampleRate;

  let silenceEnd = 0;
  for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) < SILENCE_THRESHOLD) {
          silenceEnd++;
      } else {
          silenceEnd = 0;
      }
      if (silenceEnd >= minSilenceSamples) {
          return (channelData.length - i) / sampleRate; // Convert samples to seconds
      }
  }
  return 0; // No silence found
}
