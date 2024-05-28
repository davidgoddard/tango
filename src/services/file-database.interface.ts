//=====================================================================================
// Utility methods

import { ConfigOptions, Playlist, Track } from "../data-types";
import { eventBus } from "../events/event-bus";
import { IndexedDBManager } from "./database";
import { fetchLibraryFiles, getAllFiles } from "./file-system";
import { convert, getDomElement } from "./utils";

// Find all song files and add to the database any not yet known

export async function scanFileSystem(
  config: ConfigOptions,
  dbManager: IndexedDBManager,
  analyze: boolean
) {
  try {
    async function analyzeBatch(
      fileHandles: FileSystemFileHandle[]
    ): Promise<any> {
      // Create an iframe containing the ffmpeg code

      let iframe: HTMLIFrameElement; // Track reference to iframe
      iframe = document.createElement("iframe");
      iframe.src = "ffmpeg-frame.html";
      document.getElementById("iframeContainer")!.appendChild(iframe);

      // Wait for the FFmpeg module to be initialised

      await new Promise((resolve) => {
        iframe.addEventListener("load", () => {
          resolve(null);
        });
      });

      //@ts-ignore
      let results = await iframe.contentWindow!.readMetadataFromFileHandle(
        fileHandles
      );

      // Tear down the FFmpeg module to free resources

      if (iframe) {
        console.log("Cleaning up FFmpeg resources...");
        // Remove iframe from DOM
        iframe.remove();
      }

      return results;
    }
    const scanProgress = getDomElement("#scanProgress");
    const scanFilePath = getDomElement("#scanFilePath");
    scanFilePath.textContent =
      "Please wait - progress is reported in batches ...";
    scanProgress.textContent = "";

    await dbManager.cacheIndexData();

    let files = await getAllFiles(
      config.musicFolder as FileSystemDirectoryHandle
    );

    function splitArrayIntoBatches<T>(array: T[], batchSize: number): T[][] {
      const batches: T[][] = [];
      for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
      }
      return batches;
    }

    let batchSize = 20;
    const batches = splitArrayIntoBatches(files, batchSize);

    let n = 0;
    for (const batch of batches) {
      let analysis;
      if (analyze) {
        // Get results on a one-to-one match to the batch
        analysis = await analyzeBatch(batch.map((item) => item.fileHandle));
      }
      for (let batchIdx = 0; batchIdx < batch.length; batchIdx++) {
        const item = batch[batchIdx];
        let indexFileName = convert(item.relativeFileName);

        // Keep user informed as this will take a long time
        scanFilePath.textContent = item.relativeFileName;
        scanProgress.textContent = ++n + "/" + files.length;

        const folderName = indexFileName.split(/\/|\\/g)[1];
        const table =
          folderName == config.cortinaSubFolder
            ? "cortina"
            : folderName == config.musicSubFolder
            ? "track"
            : "";

        if (table) {
          // Create new version of the record

          let metadata: any = analysis
            ? analysis[batchIdx]
            : {
                start: 0,
                end: -1,
                meanVolume: -20,
                maxVolume: 0,
                tags: { title: indexFileName, artist: "unknown" },
              };

          const newData: Track = {
            type: table,
            name: indexFileName,
            fileHandle: item.fileHandle,
            metadata,
            classifiers: {
              favourite: true,
            },
          };

          try {
            // Look up filename to see if we already have a trackid for it
            let { id }: Track = (await dbManager.getDataByName(
              table,
              indexFileName
            )) as Track;

            if (!id) {
              await dbManager.addData(table, newData);
              dbManager.index(newData);
            } else {
              await dbManager.updateData(table, id!, newData);
              dbManager.index(newData);
            }
          } catch (error) {
            await dbManager.addData(table, newData);
            dbManager.index(newData);
          }
        }
      }
    }

    await dbManager.commitChanges();

    console.log("Have now updated the database with all tracks");
  } catch (error) {
    console.error(error);
  }
}

export async function loadLibraryIntoDB(
  config: ConfigOptions,
  dbManager: IndexedDBManager
): Promise<void> {
  const scanProgress = getDomElement("#scanProgress");
  const scanFilePath = getDomElement("#scanFilePath");

  const libraryFileHandles = await fetchLibraryFiles(
    config.musicFolder as FileSystemDirectoryHandle
  );

  async function getJSON(file: File) {
    const text = await file.text();
    const json = JSON.parse(text);
    return json;
  }

  async function setTrackDetails(library: any, table: "track" | "cortina") {
    let n = 0;
    let files = await getAllFiles(
      config.musicFolder as FileSystemDirectoryHandle
    );
    for (const file of files) {
      scanFilePath.textContent = file.relativeFileName;
      scanProgress.textContent = ++n + "/" + files.length;

      let tn = convert(file.relativeFileName);

      const libTrack = library[tn.substring(1)];
      if (libTrack) {
        const newData: Track = {
          type: table,
          name: tn,
          fileHandle: file.fileHandle,
          metadata: {
            tags: {
              title: libTrack.track.title,
              artist: libTrack.track.artist,
              notes: libTrack.classifiers?.notes,
              year: libTrack.track.date,
              bpm: libTrack.classifiers?.bpm,
            },
            start: libTrack.analysis.start,
            end: libTrack.analysis.silence,
            style: libTrack.classifiers?.style,
            meanVolume: libTrack.analysis.meanGain || -20,
            maxVolume: libTrack.analysis.gain || 0,
          },
          classifiers: {
            favourite: true,
          },
        };
        await dbManager.addData(table, newData);
      } else {
        console.log("Not found in library", tn.substring(1));
      }
    }
  }

  if (libraryFileHandles) {
    let library: any;
    let cortinas: any;
    let tandas: any;
    let playlists: any;
    console.log(libraryFileHandles);
    if (libraryFileHandles.library) {
      library = await getJSON(await libraryFileHandles.library.getFile());
      console.log(library);
      await dbManager.clearAllData("track");
      await setTrackDetails(library, "track");
    }
    if (libraryFileHandles.cortinas) {
      cortinas = await getJSON(await libraryFileHandles.cortinas.getFile());
      console.log("cortinas", cortinas);
      await dbManager.clearAllData("cortina");
      await setTrackDetails(cortinas, "cortina");
    }
    if (libraryFileHandles.tandas) {
      tandas = await getJSON(await libraryFileHandles.tandas.getFile());
      console.log("tandas", tandas);
      for (let tanda of tandas) {
        tanda.tracks = tanda.tracks.map((track: string) => "/" + track);
        if (tanda.cortina && tanda.cortina[0]) {
          tanda.cortina = tanda.cortina.map(
            (cortina: { track: string }) => "/" + cortina.track
          )[0];
        } else {
          tanda.cortina = undefined;
        }
        try {
          const existing = await dbManager.getDataById("tanda", tanda.id);
          if (!existing) {
            await dbManager.addData("tanda", tanda);
          } else {
            await dbManager.updateData("tanda", tanda.id, tanda);
          }
        } catch (error) {
          delete tanda.id;
          await dbManager.addData("tanda", tanda);
        }
      }
    }
    if (libraryFileHandles.playlists) {
      const originalPlaylists = await getJSON(
        await libraryFileHandles.playlists.getFile()
      );
      console.log("playlists", originalPlaylists);
      for (let playlist of originalPlaylists) {
        console.log(playlist);
        for (let tanda of playlist.tandas) {
          tanda.tracks = tanda.tracks.map((track: string) => "/" + track);
          if (tanda.cortina && tanda.cortina[0]) {
            tanda.cortina = tanda.cortina.map(
              (cortina: { track: string }) => "/" + cortina.track
            )[0];
          } else {
            tanda.cortina = undefined;
          }
        }
        let newPlaylist: Playlist = {
          id: playlist.id,
          type: "playlist",
          name: playlist.name,
          lastPlayed: "",
          created: playlist.createdDate,
          pattern: playlist.pattern,
          trackSpacing: playlist.trackSpacing,
          preCortinaSpacing: playlist.preCortinaSpacing,
          postCortinaSpacing: playlist.postCortinaSpacing,
          cortinaFolder: playlist.useCortina,
          startTime: playlist.start,
          endTime: playlist.endTime,
          tandas: playlist.tandas,
        };
        try {
          const existing = await dbManager.getDataByName(
            "playlist",
            newPlaylist.name
          );
          if (!existing || !newPlaylist.id) {
            await dbManager.addData("playlist", newPlaylist);
          } else {
            await dbManager.updateData("playlist", newPlaylist.id, newPlaylist);
          }
        } catch (error) {
          delete newPlaylist.id;
          await dbManager.addData("playlist", newPlaylist);
        }
      }
    }
  }
}
