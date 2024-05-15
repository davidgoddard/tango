import { eventBus } from "../events/event-bus";

interface SaveFilePickerOptions {
  types?: SaveFilePickerAcceptType[];
}

interface SaveFilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    showSaveFilePicker?: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;
  }
}

const CONFIG_ID: number = 1;

async function selectFolder(): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    alert("The File System Access API is not supported in your browser.");
    throw new Error("User has not given access to folder.");
  }

  try {
    const directoryHandle = await window.showDirectoryPicker();
    return directoryHandle;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const musicFileExtensions: string[] = [
  ".aac",
  ".ac3",
  ".aif",
  ".aiff",
  ".alac",
  ".ape",
  ".au",
  ".flac",
  ".m4a",
  ".m4b",
  ".m4p",
  ".m4r",
  ".mid",
  ".midi",
  ".mp3",
  ".mpa",
  ".mpc",
  ".ogg",
  ".opus",
  ".ra",
  ".ram",
  ".snd",
  ".wav",
  ".wma",
  ".wv",
  ".webm",
  // Add more extensions if needed
];

export async function fetchLibraryFiles(
  directoryHandle: FileSystemDirectoryHandle
): Promise<{
  library?: FileSystemFileHandle;
  tandas?: FileSystemFileHandle;
  cortinas?: FileSystemFileHandle;
  playlists?: FileSystemFileHandle;
}> {
  let libraryFileHandles: {
    library?: FileSystemFileHandle;
    tandas?: FileSystemFileHandle;
    cortinas?: FileSystemFileHandle;
    playlists?: FileSystemFileHandle;
  } = {};
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file") {
      switch (entry.name) {
        case "library.dat":
          libraryFileHandles.library = entry as FileSystemFileHandle;
          break;
        case "tandas.dat":
          libraryFileHandles.tandas = entry as FileSystemFileHandle;
          break;
        case "cortinas.dat":
          libraryFileHandles.cortinas = entry as FileSystemFileHandle;
          break;
        case "playlists.dat":
          libraryFileHandles.playlists = entry as FileSystemFileHandle;
          break;
        default:
          break;
      }
    }
  }
  return libraryFileHandles;
}

export async function getAllFiles(
  directoryHandle: FileSystemDirectoryHandle,
  relativePath: string = "",
  fileList: {
    fileHandle: FileSystemFileHandle;
    relativePath: string;
    relativeFileName: string;
  }[] = []
): Promise<
  {
    fileHandle: FileSystemFileHandle;
    relativePath: string;
    relativeFileName: string;
  }[]
> {
  try {
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file" && relativePath.indexOf("/.AppleDouble") < 0) {
        let extensionBits = entry.name.split(".");
        let extension = extensionBits[extensionBits.length - 1];
        if (
          musicFileExtensions.includes("." + extension) &&
          !entry.name.startsWith("._")
        ) {
          fileList.push({
            fileHandle: entry as FileSystemFileHandle,
            relativePath: relativePath,
            relativeFileName: relativePath + "/" + entry.name,
          });
        }
      } else if (entry.kind === "directory") {
        await getAllFiles(
          entry as FileSystemDirectoryHandle,
          `${relativePath}/${entry.name}`,
          fileList
        );
      }
    }
    return fileList;
  } catch (error) {
    console.log("Failed to read files");
    eventBus.emit("requestAccessToDisk");
    throw error;
  }
}

interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

// export async function verifyPermission(
//   fileHandle: FileSystemFileHandle,
//   readWrite: boolean
// ): Promise<boolean> {
//   const options: FileSystemHandlePermissionDescriptor = {};
//   if (readWrite) {
//     options.mode = "readwrite";
//   }
//   if ((await (await fileHandle.()).queryPermission(options)) === "granted") {
//     return true;
//   }
//   return (await fileHandle.requestPermission(options)) === "granted";
// }

export async function openMusicFolder(
  dbManager: any,
  config: any
): Promise<void> {
  try {
    console.log(`Using config ${JSON.stringify(config)}`);
    const directoryHandleOrUndefined = config.musicFolder;
    if (directoryHandleOrUndefined) {
      console.log(
        `Retrieved directory handle "${directoryHandleOrUndefined.name}" from IndexedDB.`
      );
      return;
    }
    const directoryHandle = await selectFolder();
    config.musicFolder = directoryHandle;
    await dbManager.updateData("system", CONFIG_ID, config);
    console.log(
      `Stored directory handle for "${directoryHandle.name}" in IndexedDB.`
    );
  } catch (error: any) {
    console.error(error);
    eventBus.emit("requestAccessToDisk");
  }
}

export async function saveFileWithWritePermission(
  fileHandle: FileSystemFileHandle | undefined,
  jsonData: any
): Promise<FileSystemFileHandle | undefined> {
  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(jsonData);
    await writable.close();
  } else {
    fileHandle = await window.showSaveFilePicker!({
      types: [
        {
          description: "JSON files",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(jsonData);
    await writable.close();
  }
  return fileHandle;
}
