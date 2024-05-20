import { eventBus } from "./events/event-bus";
import "./components/tanda.element";
import "./components/search.element";
import "./components/track.element";
import "./components/large-list";
import "./components/scrach-pad.element";
import { TabsContainer } from "./components/tabs.component";
import { Player } from "./services/player";
import { PlaylistService } from "./services/playlist-service";
import { DatabaseManager } from "./services/database";
import { openMusicFolder } from "./services/file-system";
import { getDomElement } from "./services/utils";
import { enumerateOutputDevices, requestAudioPermission } from "./services/permissions.service";
import { loadLibraryIntoDB, scanFileSystem } from "./services/file-database.interface";
import { addDragDropHandlers } from "./services/drag-drop.service";
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("service-worker.js")
//       .catch((error) => {
//         console.error("Service Worker registration failed:", error);
//       });
//   });
// }
const SYSTEM = {
    defaultTandaStyleSequence: "4T 4T 3W 4T 3M",
    useSoundLevelling: true,
};
const CONFIG_ID = 1;
async function InitialiseConfig(dbManager) {
    try {
        const config = await dbManager.getDataById("system", CONFIG_ID);
        if (!config) {
            // Set defaults
            await dbManager.addData("system", SYSTEM);
        }
        else {
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
    return systemLowestGain;
}
// THIS MUST ONLY BE CALLED FROM A BUTTON
async function deleteDatabase(dbManager) {
    await dbManager.resetDatabase();
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
//=====================================================================================================================
// Setup application layout and check file permissions and create database etc.
//=====================================================================================================================
document.addEventListener("DOMContentLoaded", async () => {
    addDragDropHandlers();
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
    // Setup the quick key click to function mappings
    let quickClickHandlers = {
        askUserPermission: async () => {
            await openMusicFolder(dbManager, config)
                .then(() => {
                const modal = getDomElement("#permissionModal");
                modal.classList.add("hidden");
                eventBus.emit('UserGrantedPermission');
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
        stopButton: () => {
            eventBus.emit("stopPlaying");
        },
        playAll: () => {
            eventBus.emit('playAll');
        },
        stopPlayAll: () => {
            eventBus.emit('stopAll');
        },
        createTandaButton: () => {
            const scratchPad = getDomElement("#scratchPad");
            const newTanda = document.createElement("tanda-element");
            newTanda.setAttribute("style", "undefined");
            scratchPad.appendChild(newTanda);
        },
    };
    for (const key of Object.keys(quickClickHandlers)) {
        getDomElement((key.charAt(0) != "." ? "#" : "") + key).addEventListener("click", quickClickHandlers[key]);
    }
    await new Promise((resolve) => {
        eventBus.once('UserGrantedPermission', resolve);
    });
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
        eventBus.emit("change-speaker", selectedDeviceId);
    });
    const headphoneDeviceSelector = getDomElement("#headphones-output-devices");
    headphoneDeviceSelector.addEventListener("change", () => {
        const selectedDeviceId = headphoneDeviceSelector
            .value;
        config.headphoneOutput = selectedDeviceId;
        dbManager.updateData("system", 1, config);
        eventBus.emit("change-headphones", selectedDeviceId);
    });
    // Everything is now setup so run the app.
    await runApplication(dbManager, config);
});
//============================================================================================================
// Only run this if permissions are all OK
//============================================================================================================
async function runApplication(dbManager, config) {
    // Scan all files in database to find system's lowest gain for normalisation purposes
    let systemLowestGain = await getSystemLevel(dbManager);
    let fadeRate = 3;
    const playlistContainer = getDomElement("#playlistContainer");
    const playlistService = new PlaylistService(playlistContainer, async (type, name) => {
        return (await dbManager.getDataByName(type, name));
    });
    playlistContainer.addEventListener("clickedTrack", async (event) => {
        try {
            const detail = event.detail;
            if (!speakerOutputPlayer.isPlaying) {
                let N = playlistService.getN(detail);
                await speakerOutputPlayer.updatePosition(N - 1);
                if (speakerOutputPlayer.next) {
                    speakerOutputPlayer.next.silence = 0;
                }
                speakerOutputPlayer.startNext();
                getDomElement("#stopButton").classList.add("active");
            }
        }
        catch (error) {
            console.error(error);
            alert(error);
        }
    });
    // Prepare the new music speakerOutputPlayer to play music adjusted to the given system gain
    // and fade songs using the given fade rate.
    const headerField = getDomElement("body > header > h1");
    const stopButton = getDomElement("#stopButton");
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
            if (data.state === "Playing") {
                stopButton.classList.add("active");
                if (data.track.type == 'cortina') {
                    playlistService.playingCortina(true);
                }
                else {
                    playlistService.playingCortina(false);
                }
            }
            else {
                stopButton.classList.remove("active");
                playlistService.playingCortina(false);
            }
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
    eventBus.on('playAll', () => {
        speakerOutputPlayer.extendEndTime(-1);
    });
    eventBus.on('stopAll', () => {
        speakerOutputPlayer.startNext();
    });
    eventBus.on("stopPlaying", () => {
        speakerOutputPlayer.stop();
        Array.from(document.querySelectorAll("tanda-element,track-element,cortina-element")).forEach(x => {
            x.draggable = true;
            x.setPlaying(false);
            if (x.setPlayed)
                x.setPlayed(false);
        });
    });
    eventBus.on("playOnHeadphones", async (detail) => {
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
            const table = track.dataset.title.split(/\/|\\/g)[1] == "music"
                ? "track"
                : "cortina";
            headphonePlaylist[0] = (await dbManager.getDataById(table, parseInt(track.dataset.trackId)));
            headphonesOutputPlayer.stop();
            await headphonesOutputPlayer.updatePosition(-1);
            headphonesOutputPlayer.startNext();
            headphonePlaylist = [];
        }
    });
    eventBus.on("new-playlist", async (N = -1) => {
        // make the next track the first in the playlist
        await speakerOutputPlayer.updatePosition(N);
        speakerOutputPlayer.startNext();
    });
    eventBus.on('swapped-playlist', () => {
        // Find current song and workout how moved.
        const allTracks = Array.from(playlistContainer.querySelectorAll('track-element,cortina-element'));
        const playing = playlistContainer.querySelector('track-element.playing, cortina-element.playing');
        if (playing) {
            const N = allTracks.findIndex(track => track == playing);
            speakerOutputPlayer.updatePosition(N);
        }
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
        for (let i = 0; i < 100; i++) {
            allTandas.push(tanda);
        }
    }
    // console.log(allTandas);
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
