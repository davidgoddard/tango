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

export const musicFileExtensions = [
  '.aac',
  '.ac3',
  '.aif',
  '.aiff',
  '.alac',
  '.ape',
  '.au',
  '.flac',
  '.m4a',
  '.m4b',
  '.m4p',
  '.m4r',
  '.mid',
  '.midi',
  '.mp3',
  '.mpa',
  '.mpc',
  '.ogg',
  '.opus',
  '.ra',
  '.ram',
  '.snd',
  '.wav',
  '.wma',
  '.wv',
  '.webm',
  // Add more extensions if needed
];

export async function fetchLibraryFiles(directoryHandle) {
  let libraryFileHandles = {}
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      switch (entry.name) {
        case 'library.dat':
          libraryFileHandles.library = entry;
          break;
        case 'tandas.dat':
          libraryFileHandles.tandas = entry;
          break;
        case 'cortinas.dat':
          libraryFileHandles.cortinas = entry;
          break;
        case 'playlists.dat':
          libraryFileHandles.playlists = entry;
          break;
        default:
          break;
      }
    }
  }
  return libraryFileHandles;
}

export async function getAllFiles(directoryHandle, relativePath = '', fileList = []) {
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file' && relativePath.indexOf('/.AppleDouble') < 0) {
      let extension = entry.name.split('.')
      extension = extension[extension.length - 1]
      if (musicFileExtensions.includes('.' + extension) && !entry.name.startsWith('._')) {
        fileList.push({ fileHandle: entry, relativePath: relativePath, relativeFileName: relativePath + '/' + entry.name });
      }
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
        accept: { 'application/json': ['.json'] }
      }]
    });
    const writable = await fileHandle.createWritable();
    await writable.write(jsonData);
    await writable.close();
  }
  return fileHandle;
}

