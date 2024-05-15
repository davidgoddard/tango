// Example usage in a component file
import { eventBus } from "./events/event-bus";
import "./components/tanda.element";
import "./components/cortina.element";
import "./components/search.element";
import "./components/track.element";
import { TabsContainer } from "./components/tabs.component";
import { Player } from "./services/player";
import { PlaylistService } from "./services/playlist-service";
import { DatabaseManager, convert, } from "./services/database";
import { fetchLibraryFiles, getAllFiles, openMusicFolder, } from "./services/file-system";
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then((registration) => {
            console.log("Service Worker registered:", registration);
        })
            .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
    });
}
const SYSTEM = {
    defaultTandaStyleSequence: "4T 4T 3W 4T 3M",
    useSoundLevelling: true,
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
        let extension = record.name.split(".");
        extension = extension[extension.length - 1];
        return true;
    });
    console.log("Fetched all files", files.length, "Lowest gain", systemLowestGain);
    return systemLowestGain;
}
// Event listener to receive messages from the child frame
window.addEventListener("message", (event) => {
    if (event.origin !== window.origin)
        return; // Security check
    const data = event.data;
    if (data.type === "ffmpeg_output") {
        console.log("Received FFmpeg output from child:", data);
    }
});
// Find all song files and add to the database any not yet known
async function scanFileSystem(config, dbManager, analyze) {
    try {
        async function analyzeBatch(fileHandles) {
            // Create an iframe containing the ffmpeg code
            let iframe; // Track reference to iframe
            iframe = document.createElement("iframe");
            iframe.src = "ffmpeg-frame.html";
            document.getElementById("iframeContainer").appendChild(iframe);
            // Wait for the FFmpeg module to be initialised
            await new Promise((resolve) => {
                iframe.addEventListener("load", () => {
                    resolve(null);
                });
            });
            //@ts-ignore
            let results = await iframe.contentWindow.readMetadataFromFileHandle(fileHandles);
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
        scanFilePath.textContent = analyze
            ? "Please wait - progress is reported in batches ..."
            : "";
        scanProgress.textContent = "";
        let files = await getAllFiles(config.musicFolder);
        function splitArrayIntoBatches(array, batchSize) {
            const batches = [];
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
                const table = indexFileName.split(/\/|\\/g)[1] == "music" ? "track" : "cortina";
                // Create new version of the record
                let metadata = analysis
                    ? analysis[batchIdx]
                    : {
                        start: 0,
                        end: -1,
                        duration: undefined,
                        meanVolume: -20,
                        maxVolume: 0,
                        tags: { title: indexFileName, artist: "unknown" },
                    };
                const newData = {
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
                    let { id } = (await dbManager.getDataByName(table, indexFileName));
                    if (!id) {
                        await dbManager.addData(table, newData);
                    }
                    else {
                        await dbManager.updateData(table, id, newData);
                    }
                }
                catch (error) {
                    await dbManager.addData(table, newData);
                }
            }
        }
        console.log("Have now updated the database with all tracks");
    }
    catch (error) {
        console.error(error);
    }
}
async function loadLibraryIntoDB(config, dbManager) {
    const scanProgress = getDomElement("#scanProgress");
    const scanFilePath = getDomElement("#scanFilePath");
    const libraryFileHandles = await fetchLibraryFiles(config.musicFolder);
    async function getJSON(file) {
        const text = await file.text();
        const json = JSON.parse(text);
        return json;
    }
    async function setTrackDetails(library, table) {
        let n = 0;
        let keys = Object.keys(library);
        for (const trackName of keys) {
            scanFilePath.textContent = trackName;
            scanProgress.textContent = ++n + "/" + keys.length;
            let tn = convert("/" + trackName);
            const existing = (await dbManager.getDataByName(table, tn));
            if (!existing) {
                console.log("Missing file", tn, trackName);
            }
            else {
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
                existing.metadata = metadata;
                await dbManager.updateData("track", existing.id, existing);
            }
        }
    }
    if (libraryFileHandles) {
        let library;
        let cortinas;
        let tandas;
        let playlists;
        console.log(libraryFileHandles);
        if (libraryFileHandles.library) {
            library = await getJSON(await libraryFileHandles.library.getFile());
            console.log(library);
            await setTrackDetails(library, "track");
        }
        if (libraryFileHandles.cortinas) {
            cortinas = await getJSON(await libraryFileHandles.cortinas.getFile());
            console.log("cortinas", cortinas);
            await setTrackDetails(cortinas, "cortina");
        }
        if (libraryFileHandles.tandas) {
            tandas = await getJSON(await libraryFileHandles.tandas.getFile());
            console.log("tandas", tandas);
        }
        if (libraryFileHandles.playlists) {
            playlists = await getJSON(await libraryFileHandles.playlists.getFile());
            console.log("playlists", playlists);
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
async function deleteDatabase(dbManager) {
    console.log("Deleting the database");
    await dbManager.resetDatabase();
    console.log("Restoring config");
    await dbManager.addData("system", SYSTEM);
    let config = (await dbManager.getDataById("system", CONFIG_ID));
    await openMusicFolder(dbManager, config);
    return config;
}
async function processQuery(dbManager, query, selectedStyle) {
    let tracks = (await dbManager.processEntriesInBatches("track", (track, idx) => {
        return true;
    }));
    return { tracks, tandas: [] };
}
// Request permission to access audio devices
async function requestAudioPermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted
        console.log("Permission to access audio devices granted.");
    }
    catch (error) {
        // Permission denied or error
        console.error("Error accessing audio devices:", error);
    }
}
// Function to enumerate available audio output devices
async function enumerateOutputDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log("Available audio devices", devices);
    const outputDevices = devices.filter((device) => device.kind === "audiooutput");
    return outputDevices;
}
// Function to populate the select element with output device options
async function populateOutputDeviceOptions(config) {
    const outputDevices = await enumerateOutputDevices();
    function fillOptions(current, target) {
        target.innerHTML = "";
        outputDevices.forEach((device) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.text = device.label || "Unknown Device";
            option.selected = current == device.deviceId;
            target.appendChild(option);
        });
    }
    fillOptions(config.mainOutput, getDomElement("#speaker-output-devices"));
    fillOptions(config.headphoneOutput, getDomElement("#headphones-output-devices"));
}
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    catch (error) {
        alert(`Without access to your computer's audio, Tanda Player cannot operate`);
        throw error;
    }
    eventBus.on("error", (error) => {
        console.error(error);
    });
    const dbManager = await DatabaseManager();
    let config = await InitialiseConfig(dbManager);
    eventBus.on("requestAccessToDisk", () => {
        console.log('Requesting access to disk');
        const modal = getDomElement("#permissionModal");
        modal.classList.remove("hidden");
    });
    await openMusicFolder(dbManager, config);
    // test one file
    const testTrack = dbManager.getDataById('track', 0);
    // Setup the quick key click to function mappings
    let quickClickHandlers = {
        askUserPermission: async () => {
            await openMusicFolder(dbManager, config)
                .then(() => {
                const modal = getDomElement("#permissionModal");
                modal.classList.add("hidden");
            })
                .catch((error) => {
                alert(error);
            });
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
            config = await deleteDatabase(dbManager);
        },
        loadLibraryButton: async () => {
            await loadLibraryIntoDB(config, dbManager);
        },
        refreshAudioLists: () => {
            populateOutputDeviceOptions(config);
        },
    };
    for (const key of Object.keys(quickClickHandlers)) {
        getDomElement((key.charAt(0) != "." ? "#" : "") + key).addEventListener("click", quickClickHandlers[key]);
    }
    // Handle configuration changes
    const useSoundLevelling = getDomElement("#useSoundLevelling");
    useSoundLevelling.addEventListener("change", () => {
        config.useSoundLevelling = useSoundLevelling.checked;
        eventBus.emit("config-change");
    });
    // Set up the search tabs
    // Main application logic
    const tabs = ["Search", "Favourites", "Recent"];
    const tabsContainer = new TabsContainer(getDomElement("#tabsContainer"), tabs);
    // Handle searches
    eventBus.on("query", async (searchData) => {
        // Process the query (e.g., fetch data from a server)
        const results = await processQuery(dbManager, searchData.query, searchData.selectedStyle);
        // Send the results back to the search component
        eventBus.emit("queryResults", results);
    });
    // Support multiple sound-outputs
    await requestAudioPermission();
    populateOutputDeviceOptions(config);
    // Event listener for output device selection changes
    const outputDeviceSelector = getDomElement("#speaker-output-devices");
    outputDeviceSelector.addEventListener("change", () => {
        const selectedDeviceId = outputDeviceSelector.value;
        config.mainOutput = selectedDeviceId;
        dbManager.updateData("system", 1, config);
        console.log("Audio Setting: ", config);
        eventBus.emit("change-speaker", selectedDeviceId);
    });
    const headphoneDeviceSelector = getDomElement("#headphones-output-devices");
    headphoneDeviceSelector.addEventListener("change", () => {
        const selectedDeviceId = headphoneDeviceSelector
            .value;
        config.headphoneOutput = selectedDeviceId;
        dbManager.updateData("system", 1, config);
        console.log("Audio Setting: ", config);
        eventBus.emit("change-headphones", selectedDeviceId);
    });
    // Everything is now setup so run the app.
    await runApplication(dbManager, config);
});
async function runApplication(dbManager, config) {
    // await verifyPermission(config.musicFolder, 'readonly')
    // Scan all files in database to find system's lowest gain for normalisation purposes
    let systemLowestGain = await getSystemLevel(dbManager);
    let fadeRate = 3;
    const playlistService = new PlaylistService(getDomElement("#playlistContainer"), async (type, name) => {
        return (await dbManager.getDataByName(type, name));
    });
    // Prepare the new music speakerOutputPlayer to play music adjusted to the given system gain
    // and fade songs using the given fade rate.
    const headerField = getDomElement("body > header > h1");
    const speakerPlayerConfig = {
        ctx: config.mainOutput,
        systemLowestGain,
        fadeRate,
        useSoundLevelling: config.useSoundLevelling,
        fetchNext: async (N) => {
            let silence = 0;
            let nextTrack = playlistService.fetch(N);
            if (N > 0) {
                let previousTrack = playlistService.fetch(N - 1);
                console.log("Next & previous", nextTrack, previousTrack);
                silence = 2;
                if (nextTrack.type == "track" && previousTrack.type == "cortina") {
                    silence = 4;
                }
                if (nextTrack.type == "cortina" && previousTrack.type == "track") {
                    silence = 4;
                }
            }
            else {
                silence = 0;
            }
            return { track: nextTrack, silence };
        },
        progress: (data) => {
            headerField.textContent = data.display;
        },
    };
    let headphonePlaylist = [];
    const headphonesPlayerConfig = {
        ctx: config.headphoneOutput,
        systemLowestGain,
        fadeRate: 0.5,
        useSoundLevelling: config.useSoundLevelling,
        fetchNext: async (N) => {
            if (N == 0) {
                console.log("Headphones next", {
                    track: headphonePlaylist[0],
                    silence: 0,
                });
                return { track: headphonePlaylist[0], silence: 0 };
            }
            else {
                return { track: undefined, silence: 0 };
            }
        },
    };
    const speakerOutputPlayer = new Player(speakerPlayerConfig);
    const headphonesOutputPlayer = new Player(headphonesPlayerConfig);
    eventBus.on("change-speaker", (context) => {
        speakerPlayerConfig.ctx = context;
        speakerOutputPlayer.updateOptions(speakerPlayerConfig);
    });
    eventBus.on("change-headphones", (context) => {
        headphonesPlayerConfig.ctx = context;
        headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
    });
    eventBus.on("config-change", () => {
        speakerPlayerConfig.useSoundLevelling = config.useSoundLevelling;
        speakerOutputPlayer.updateOptions(speakerPlayerConfig);
        headphonesPlayerConfig.useSoundLevelling = config.useSoundLevelling;
        headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
    });
    eventBus.on("playOnHeadphones", async (detail) => {
        console.log("Play on headphones in app", detail);
        const track = detail.element;
        // Clear all other tracks from playing
        Array.from(document.querySelectorAll("track-element,cortina-element")).forEach((x) => {
            if (x !== track)
                x.stopPlayingOnHeadphones();
        });
        if (!detail.playing) {
            headphonesOutputPlayer.stop();
        }
        else {
            const table = track.getAttribute("title").split(/\/|\\/g)[1] == "music"
                ? "track"
                : "cortina";
            headphonePlaylist[0] = (await dbManager.getDataById(table, parseInt(track.getAttribute("trackid"))));
            headphonesOutputPlayer.stop();
            await headphonesOutputPlayer.updatePosition(-1);
            console.log(headphonesOutputPlayer.next);
            headphonesOutputPlayer.startNext();
            headphonePlaylist = [];
        }
    });
    eventBus.on("new-playlist", async () => {
        // make the next track the first in the playlist
        await speakerOutputPlayer.updatePosition(-1);
        speakerOutputPlayer.startNext();
    });
    // Simulate user request to start playing
    // setTimeout(() => {
    //   speakerOutputPlayer.startNext();
    // }, 3000);
    // dummy code
    const tracks = (await dbManager.processEntriesInBatches("track", (record) => true));
    const cortinas = (await dbManager.processEntriesInBatches("cortina", (record) => true));
    let t = 0;
    let c = 0;
    const allTandas = [];
    while (t < tracks.length) {
        if (c >= cortinas.length) {
            c = 0;
        }
        const tanda = {
            type: "tanda",
            name: "Dummy",
            style: "Unknown",
            cortina: cortinas[c++].name,
            tracks: [],
        };
        for (let i = 0; i < 4 && t < tracks.length; i++) {
            tanda.tracks.push(tracks[t++].name);
        }
        allTandas.push(tanda);
    }
    console.log(allTandas);
    await playlistService.setTandas(allTandas);
    // eventBus.once("next-track-ready", async () => {
    //   console.log("Starting playing tracks");
    //   speakerOutputPlayer.startNext();
    // });
    // await speakerOutputPlayer.updatePosition(1)
    // speakerOutputPlayer.stop();
    // setTimeout(async () => {
    //   console.log("Testing headphones");
    //   headphonePlaylist[0] = playlistService.fetch(4);
    //   await headphonesOutputPlayer.updatePosition(-1);
    //   console.log(headphonesOutputPlayer.next)
    //   headphonesOutputPlayer.startNext();
    // }, 5000);
}
