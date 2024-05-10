// Example usage in a component file
import { eventBus } from "./events/event-bus";
import "./components/tanda-element";
import { Player } from "./services/player";
import { PlaylistService } from "./services/playlist-service";
import { DatabaseManager, } from "./services/database";
import { fetchLibraryFiles, getAllFiles, openMusicFolder, } from "./services/file-system";
const SYSTEM = {
    defaultTandaStyleSequence: "4T 4T 3W 4T 3M",
};
const CONFIG_ID = 1;
function getDomElementAll(selector) {
    return document.querySelectorAll(selector);
}
function getDomElement(selector) {
    return document.querySelector(selector);
}
async function InitialiseConfig(dbManager) {
    try {
        const config = await dbManager.getDataById("system", CONFIG_ID);
        if (!config) {
            // Set defaults
            await dbManager.addData("system", SYSTEM);
            console.log(`Set default config`);
        }
        else {
            console.log(config, "Combined", { ...SYSTEM, ...config });
            await dbManager.updateData("system", config.id, {
                ...SYSTEM,
                ...config,
            });
        }
    }
    catch (error) {
        console.error("Database operation failed", error);
    }
    // Now get the config as stored
    return (await dbManager.getDataById("system", CONFIG_ID));
}
async function getSystemLevel(dbManager) {
    let systemLowestGain = { meanVolume: -20, maxVolume: 0 };
    const files = await dbManager.processEntriesInBatches("track", (record) => {
        let trackLevel = record.metadata.meanVolume - record.metadata.maxVolume;
        let systemLevel = systemLowestGain.meanVolume - systemLowestGain.maxVolume;
        if (trackLevel < systemLevel)
            systemLowestGain = record.metadata;
        let extension = record.relativeFileName.split(".");
        extension = extension[extension.length - 1];
        return true;
    });
    console.log("Fetched all files", files.length, "Lowest gain", systemLowestGain);
    return systemLowestGain;
}
// Find all song files and add to the database any not yet known
async function scanFileSystem(config, dbManager, analyze) {
    const scanProgress = getDomElement("#scanProgress");
    const scanFilePath = getDomElement("#scanFilePath");
    let files = await getAllFiles(config.musicFolder);
    // Store all changes
    let n = 0;
    for (const file of files) {
        scanFilePath.textContent = file.relativeFileName;
        scanProgress.textContent = ++n + "/" + files.length;
        const original = (await dbManager.getDataByName("track", file.relativeFileName));
        if (!original) {
            const baseFile = await file.fileHandle.getFile();
            if (baseFile.size > 1000) {
                let size = baseFile.size;
                let metadata = {
                    start: 0,
                    end: -1,
                    duration: undefined,
                    meanVolume: -20,
                    maxVolume: 0,
                };
                // if (analyze) {
                //     let { s, m } = await readMetadataFromFileHandle(file.fileHandle)
                //     size = s
                //     metadata = m
                // }
                if (size > 1000) {
                    const table = file.relativeFileName.split(/\/|\\/g)[1] == "music"
                        ? "track"
                        : "cortina";
                    await dbManager.addData(table, {
                        type: "track",
                        fileHandle: file.fileHandle,
                        relativeFileName: file.relativeFileName,
                        metadata,
                        classifiers: {
                            favourite: true,
                        },
                    });
                }
            }
        }
        else {
            console.log("Already had details of ", file);
            const baseFile = await file.fileHandle.getFile();
            if (baseFile.size > 1000) {
                let size = baseFile.size;
                let metadata = original.metadata;
                metadata.meanVolume = -20;
                // if (analyze) {
                //     let { s, m } = await readMetadataFromFileHandle(file.fileHandle)
                //     size = s
                //     metadata = { ...metadata, ...m }
                // }
                if (size > 1000) {
                    const table = file.relativeFileName.split(/\/|\\/g)[1] == "music"
                        ? "track"
                        : "cortina";
                    await dbManager.addData(table, {
                        type: "track",
                        fileHandle: file.fileHandle,
                        relativeFileName: file.relativeFileName,
                        metadata,
                        classifiers: {
                            favourite: true,
                        },
                    });
                }
            }
        }
    }
    console.log("Have now updated the database with all tracks");
}
async function loadLibraryIntoDB(config, dbManager) {
    const scanProgress = getDomElement("#scanProgress");
    const scanFilePath = getDomElement("#scanFilePath");
    const libraryFileHandles = await fetchLibraryFiles(config.musicFolder);
    if (libraryFileHandles) {
        let library;
        let cortinas;
        let tandas;
        let playlists;
        console.log(libraryFileHandles);
        if (libraryFileHandles.library) {
            let file = await libraryFileHandles.library.getFile();
            library = JSON.parse(await file.text());
            console.log(library);
        }
        if (libraryFileHandles.cortinas) {
            let file = await libraryFileHandles.cortinas.getFile();
            cortinas = JSON.parse(await file.text());
            console.log("cortinas", cortinas);
        }
        if (libraryFileHandles.tandas) {
            let file = await libraryFileHandles.tandas.getFile();
            tandas = JSON.parse(await file.text());
            console.log("tandas", tandas);
        }
        if (libraryFileHandles.playlists) {
            let file = await libraryFileHandles.playlists.getFile();
            playlists = JSON.parse(await file.text());
            console.log("playlists", playlists);
        }
        let n = 0;
        let keys = Object.keys(library);
        for (const trackName of keys) {
            scanFilePath.textContent = trackName;
            scanProgress.textContent = ++n + "/" + keys.length;
            const existing = (await dbManager.getDataByName("track", "/" + trackName));
            if (!existing) {
                console.log("Missing file", trackName);
            }
            else {
                console.log(trackName, existing.id);
                const libTrack = library[trackName];
                const metadata = {
                    tags: {
                        title: libTrack.track.title,
                        artist: libTrack.track.artist,
                        year: libTrack.track.date || libTrack.track.notes,
                    },
                    start: libTrack.analysis.start,
                    end: libTrack.analysis.silence,
                    style: libTrack.classifiers?.style,
                    duration: libTrack.analysis.duration,
                    meanVolume: libTrack.analysis.meanGain || -20,
                    maxVolume: libTrack.analysis.gain || 0,
                };
                if (trackName == "music/01 Dance Monkey.m4a") {
                    console.log(trackName, libTrack, metadata);
                }
                existing.metadata = metadata;
                await dbManager.updateData("track", existing.id, existing);
            }
        }
        for (let tanda of tandas) {
            tanda.tracks = tanda.tracks.map((track) => "/" + track);
            if (tanda.cortina && tanda.cortina[0]) {
                tanda.cortina = await dbManager.getDataByName("cortina", tanda.cortina.map((cortina) => "/" + cortina.track)[0]);
            }
            else {
                tanda.cortina = undefined;
            }
            try {
                const existing = await dbManager.getDataById("tanda", tanda.id);
                if (!existing) {
                    await dbManager.addData("tanda", tanda);
                }
                else {
                    await dbManager.updateData("tanda", tanda.id, tanda);
                }
            }
            catch (error) {
                delete tanda.id;
                await dbManager.addData("tanda", tanda);
            }
        }
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    eventBus.on("error", (error) => {
        console.error(error);
    });
    const headerField = getDomElement("body > header > h1");
    eventBus.on("track-progress", async (progress) => {
        headerField.textContent = progress.display;
    });
    const dbManager = await DatabaseManager();
    let config = await InitialiseConfig(dbManager);
    // Setup the quick key click to function mappings
    let quickClickHandlers = {
        askUserPermission: async () => {
            runApplication(dbManager, config);
        },
        rescanButton: () => {
            scanFileSystem(config, dbManager, false);
        },
        rescanAnalyzeButton: () => {
            scanFileSystem(config, dbManager, true);
        },
        settingsPanelButton: () => {
            getDomElement("#settingsPanel").classList.remove("hiddenPanel");
        },
        settingsPanelButtonClose: () => {
            getDomElement("#settingsPanel").classList.add("hiddenPanel");
        },
        ".playlistSettingsPanelOpenButton": () => {
            getDomElement(".playlist-settings-panel").classList.remove("hiddenPanel");
        },
        playlistSettingsPanelCloseButton: () => {
            getDomElement(".playlist-settings-panel").classList.add("hiddenPanel");
        },
        deleteDBButton: async () => {
            console.log("Deleting the database");
            await dbManager.resetDatabase();
            console.log("Restoring config");
            await dbManager.addData("system", SYSTEM);
            config = (await dbManager.getDataById("system", CONFIG_ID));
            await openMusicFolder(dbManager, config);
        },
        loadLibraryButton: async () => {
            await loadLibraryIntoDB(config, dbManager);
        },
    };
    for (const key of Object.keys(quickClickHandlers)) {
        getDomElement((key.charAt(0) != "." ? "#" : "") + key).addEventListener("click", quickClickHandlers[key]);
    }
});
async function runApplication(dbManager, config) {
    await openMusicFolder(dbManager, config);
    // await verifyPermission(config.musicFolder, 'readonly')
    // Remove modal window and start application
    const modal = getDomElement("#permissionModal");
    modal.classList.add("hidden");
    getDomElement("#rescanButton").click();
    // Scan all files in database to find system's lowest gain for normalisation purposes
    let systemLowestGain = await getSystemLevel(dbManager);
    let fadeRate = 3000;
    // Prepare the new music player to play music adjusted to the given system gain
    // and fade songs using the given fade rate.
    const playerConfig = {
        ctx: null,
        systemLowestGain,
        fadeRate,
    };
    const player = new Player(playerConfig);
    const playlistService = new PlaylistService();
    eventBus.on("new-playlist", () => {
        // make the next track the first in the playlist
        player.updatePosition(-1);
    });
    eventBus.on("track-request-result", async (payload) => {
        // use payload.previous to decide on required silence
        console.log("Request result", payload.requested?.fileHandle?.name, payload.previous?.fileHandle?.name);
        await player.loadNext({ track: payload.requested, silence: 0 });
    });
    // Simulate user request to start playing
    // setTimeout(() => {
    //   player.startNext();
    // }, 3000);
    // dummy code
    const tracks = await dbManager.processEntriesInBatches("track", (record) => true);
    const cortinas = await dbManager.processEntriesInBatches("cortina", (record) => true);
    let t = 1;
    let c = 1;
    const allTandas = [];
    while (t < tracks.length) {
        if (c >= cortinas.length) {
            c = 1;
        }
        const tanda = {
            name: "Dummy",
            style: "Unknown",
            cortina: (await dbManager.getDataById("cortina", c++)),
            tracks: [],
        };
        for (let i = 0; i < 4; i++) {
            tanda.tracks.push((await dbManager.getDataById("track", t++)));
        }
        tanda.tracks = tanda.tracks.map((t) => {
            t.metadata.end = 20;
            return t;
        });
        allTandas.push(tanda);
    }
    console.log(allTandas);
    playlistService.setTandas(allTandas);
    eventBus.once("next-track-ready", async () => {
        console.log("Starting playing tracks");
        player.startNext();
    });
}
