import { eventBus } from "./events/event-bus";
import "./components/tanda.element";
import "./components/search.element";
import "./components/track.element";
import "./components/large-list";
import "./components/scratch-pad.element";
import { TabsContainer } from "./components/tabs.component";
import { TrackElement } from "./components/track.element";
import { SearchResult } from "./components/search.element";
import { TandaElement } from "./components/tanda.element";

import "./services/themes";

import { Track, Tanda, ConfigOptions, TableNames } from "./data-types";
import { Player, PlayerOptions, ProgressData } from "./services/player";
import { PlaylistService } from "./services/playlist-service";
import { DatabaseManager, IndexedDBManager } from "./services/database";
import { openMusicFolder } from "./services/file-system";
import {
  allTracks,
  convert,
  createPlaceHolder,
  getDomElement,
  scheduleEventEvery,
  timeStringToSeconds,
} from "./services/utils";
import {
  enumerateOutputDevices,
  requestAudioPermission,
} from "./services/permissions.service";
import {
  loadLibraryIntoDB,
  scanFileSystem,
} from "./services/file-database.interface";
import { CortinaPicker } from "./services/cortina-service";

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("service-worker.js")
//       .catch((error) => {
//         console.error("Service Worker registration failed:", error);
//       });
//   });
// }

const SYSTEM: ConfigOptions = {
  defaultTandaStyleSequence: "4T 4T 3W 4T 3M",
  useSoundLevelling: true,
};

const CONFIG_ID = 1;

async function InitialiseConfig(
  dbManager: IndexedDBManager
): Promise<ConfigOptions> {
  try {
    const config = await dbManager.getDataById("system", CONFIG_ID);
    if (!config) {
      // Set defaults
      await dbManager.addData("system", SYSTEM);
    } else {
      await dbManager.updateData("system", config.id!, {
        ...SYSTEM,
        ...config,
      });
    }
  } catch (error) {
    console.error("Database operation failed", error);
  }
  // Now get the config as stored
  return (await dbManager.getDataById("system", CONFIG_ID)) as ConfigOptions;
}

async function getSystemLevel(
  dbManager: IndexedDBManager
): Promise<{ meanVolume: number; maxVolume: number }> {
  let systemLowestGain = { meanVolume: -20, maxVolume: 0 };

  await dbManager.processEntriesInBatches("track", (record) => {
    let trackLevel = record.metadata.meanVolume - record.metadata.maxVolume;
    let systemLevel = systemLowestGain.meanVolume - systemLowestGain.maxVolume;
    if (trackLevel < systemLevel) systemLowestGain = record.metadata;
    let extension = record.name.split(".");
    extension = extension[extension.length - 1];
    return true;
  });
  return systemLowestGain;
}

// THIS MUST ONLY BE CALLED FROM A BUTTON
async function deleteDatabase(
  dbManager: IndexedDBManager
): Promise<ConfigOptions> {
  await dbManager.resetDatabase();
  await dbManager.addData("system", SYSTEM);
  let config = (await dbManager.getDataById(
    "system",
    CONFIG_ID
  )) as ConfigOptions;
  await openMusicFolder(dbManager, config);
  return config;
}

async function processQuery(
  dbManager: IndexedDBManager,
  query: string,
  selectedStyle: string
): Promise<SearchResult> {
  console.log("Search", query, selectedStyle);

  let testResult = await dbManager.search(query);

  console.log("Raw results", testResult);
  if (testResult.length == 0) {
    return { queryNo: 0, tracks: [], tandas: [] };
  }

  let tracks = (await dbManager.processEntriesInBatches(
    "track",
    (track, idx) => true
  )) as Track[];

  let trackMap = new Map();
  tracks.forEach((track) => {
    trackMap.set(convert(track.name).toLowerCase(), track);
  });

  let maxScore = 0;
  testResult.forEach((result: { id: string; score: number }) => {
    maxScore = maxScore < result.score ? result.score : maxScore;
  });

  let minScore = maxScore * 0.6;

  let trackResults: any[] = [];
  testResult.forEach((result: { id: string; score: number }) => {
    if (result.score >= minScore) {
      let prefix = result.id.split("-");
      let key = convert(
        result.id.substring([prefix[0], prefix[1]].join("-").length + 1)
      ).toLowerCase();
      let track = trackMap.get(key);
      if (track) {
        if (
          selectedStyle == "all" ||
          track.metadata?.style?.toLowerCase() == selectedStyle
        )
          trackResults.push(track);
      }
    }
  });

  let tandaResults: Set<any> = new Set();
  let allTandas = (await dbManager.processEntriesInBatches("tanda", (tanda) => {
    return true;
  })) as Tanda[];
  let tandaMap: Map<string, Tanda[]> = new Map();
  allTandas.forEach((tanda) => {
    tanda.tracks.forEach((track) => {
      let key = convert(track).toLowerCase();
      if (!tandaMap.has(key)) {
        tandaMap.set(key, [tanda]);
      } else {
        let list = tandaMap.get(key)!;
        list.push(tanda);
      }
      // tandaMap.set(key, tanda)
    });
  });
  trackResults.forEach((track: Track) => {
    let key = convert(track.name).toLowerCase();
    if (tandaMap.has(key)) {
      [...tandaMap.get(key)!].map((item) => tandaResults.add(item));
    }
  });
  return { queryNo: 0, tracks: trackResults.filter((x) => x), tandas: [...tandaResults] };
}

// Function to populate the select element with output device options
async function populateOutputDeviceOptions(config: ConfigOptions) {
  const outputDevices = await enumerateOutputDevices();

  function fillOptions(current: string, target: HTMLElement) {
    target.innerHTML = "";
    outputDevices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || "Unknown Device";
      option.selected = current == device.deviceId;
      target.appendChild(option);
    });
  }

  fillOptions(config.mainOutput!, getDomElement("#speaker-output-devices"));
  fillOptions(
    config.headphoneOutput!,
    getDomElement("#headphones-output-devices")
  );
}

//=====================================================================================================================
// Setup application layout and check file permissions and create database etc.
//=====================================================================================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    alert(
      `Without access to your computer's audio, Tanda Player cannot operate`
    );
    throw error;
  }

  eventBus.on("error", (error) => {
    alert(error);
  });

  const dbManager = await DatabaseManager();
  let config = await InitialiseConfig(dbManager);

  const cortinaPicker = new CortinaPicker(dbManager);
  await cortinaPicker.load();

  // Setup the quick key click to function mappings

  let quickClickHandlers: { [key: string]: EventListener } = {
    askUserPermission: async () => {
      await openMusicFolder(dbManager, config)
        .then(() => {
          const modal = getDomElement("#permissionModal");
          modal.classList.add("hidden");
          eventBus.emit("UserGrantedPermission");
        })
        .catch((error) => {
          alert(error);
        });
    },
    rescanButton: async () => {
      await scanFileSystem(config, dbManager, false);
      await cortinaPicker.load();
    },
    rescanAnalyzeButton: async () => {
      await scanFileSystem(config, dbManager, true);
      await cortinaPicker.load();
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
      await cortinaPicker.load();
    },
    refreshAudioLists: () => {
      populateOutputDeviceOptions(config);
    },
    stopButton: () => {
      eventBus.emit("stopPlaying");
    },
    playAll: () => {
      eventBus.emit("playAll");
    },
    stopPlayAll: () => {
      eventBus.emit("stopAll");
    },
    cortinaPickerButtonClose: () => {
      getDomElement('#cortinaPicker').classList.add('hidden')
    },
    createTandaButton: () => {
      const scratchPad = getDomElement("#scratchPad");
      const newTanda = document.createElement("tanda-element");
      newTanda.dataset.style = "undefined";
      scratchPad.appendChild(newTanda);
    },
    collapsePlaylist: () => {
      const allTandas = Array.from(
        document.querySelectorAll("tanda-element")
      ) as TandaElement[];
      allTandas.forEach((tanda: TandaElement) => {
        tanda.collapse();
      });
    },
    extendPlaylist: () => {
      const container = getDomElement("#playlistContainer");

      const sequence = "3T 3T 3W 3T 3T 3M";

      const styleMap: { [key: string]: string } = {
        T: "Tango",
        W: "Waltz",
        M: "Milonga",
      };

      for (let t of sequence.split(" ")) {
        let n = parseInt(t);
        let s = t.substring(String(n).length);
        console.log(t, "N", n, "S", s);
        let tanda = document.createElement("tanda-element");
        tanda.dataset.style = styleMap[s];
        tanda.dataset.size = String(n);
        let html = "";
        let needCortina = true;
        if (needCortina) {
          html += createPlaceHolder("cortina-element", "cortina");
        }
        for (let i = 0; i < n; i++) {
          html += createPlaceHolder("track-element", styleMap[s]);
        }
        tanda.innerHTML = html;
        container.appendChild(tanda);
      }
    },
  };

  for (const key of Object.keys(quickClickHandlers)) {
    getDomElement((key.charAt(0) != "." ? "#" : "") + key).addEventListener(
      "click",
      quickClickHandlers[key]
    );
  }

  await new Promise((resolve) => {
    eventBus.once("UserGrantedPermission", resolve);
  });

  // Handle configuration changes
  const useSoundLevelling = getDomElement(
    "#useSoundLevelling"
  )! as HTMLInputElement;
  useSoundLevelling.addEventListener("change", () => {
    config.useSoundLevelling = useSoundLevelling.checked;
    eventBus.emit("config-change");
  });

  // Set up the search tabs

  // Main application logic
  const tabs = ["Search", "Favourites", "Recent"];

  const tabsContainer = new TabsContainer(
    getDomElement("#tabsContainer"),
    tabs,
    dbManager
  );

  // Handle searches

  eventBus.on(
    "query",
    async (payload: {
      queryNo: number;
      search: HTMLElement;
      searchData: string;
      selectedStyle: string;
    }) => {
      // Process the query (e.g., fetch data from a server)
      const results: SearchResult = await processQuery(
        dbManager,
        payload.searchData,
        payload.selectedStyle
      );

      // Send the results back to the search component
      eventBus.emit("queryResults", { ...results, search: payload.search, queryNo: payload.queryNo });
    }
  );

  // Support multiple sound-outputs

  await requestAudioPermission();

  populateOutputDeviceOptions(config);

  // Event listener for output device selection changes
  const outputDeviceSelector = getDomElement("#speaker-output-devices");
  outputDeviceSelector.addEventListener("change", () => {
    const selectedDeviceId = (outputDeviceSelector as HTMLSelectElement).value;
    config.mainOutput = selectedDeviceId;
    dbManager.updateData("system", 1, config);
    eventBus.emit("change-speaker", selectedDeviceId);
  });
  const headphoneDeviceSelector = getDomElement("#headphones-output-devices");
  headphoneDeviceSelector.addEventListener("change", () => {
    const selectedDeviceId = (headphoneDeviceSelector as HTMLSelectElement)
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
async function runApplication(
  dbManager: IndexedDBManager,
  config: ConfigOptions
) {
  // Scan all files in database to find system's lowest gain for normalisation purposes

  let systemLowestGain = await getSystemLevel(dbManager);
  let fadeRate = 3;

  const playlistContainer = getDomElement("#playlistContainer");
  const playlistService = new PlaylistService(
    playlistContainer,
    async (type: string, name: string): Promise<Track> => {
      return (await dbManager.getDataByName(type as TableNames, name)) as Track;
    }
  );

  scheduleEventEvery(1, () => {
    const tandas = Array.from(
      playlistContainer.querySelectorAll("tanda-element")
    ) as TandaElement[];
    const playingTanda = playlistContainer.querySelector(
      "tanda-element.playing"
    ) as TandaElement;
    if (!playingTanda) {
      tandas.forEach((tanda) => {
        tanda.scheduledPlayingTime("");
      });
    }
    let startTime = new Date();
    const timings = {
      preCortina: 3,
      postCortina: 3,
      interTrack: 2,
    };

    let donePlayingTanda = false;
    let foundPlayingTrack = false;
    tandas.forEach((tanda) => {
      donePlayingTanda ||= tanda == playingTanda;
      if (donePlayingTanda) {
        tanda.scheduledPlayingTime(
          startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        const hasCortina = tanda.querySelector("cortina-element");
        const tracks = Array.from(
          tanda.querySelectorAll("track-element")
        ) as HTMLElement[];
        let duration = 0;
        if (hasCortina) {
          duration += timings.preCortina + timings.postCortina;
        } else {
          duration += timings.interTrack;
        }
        duration += tracks.length * timings.interTrack;
        duration += tracks.reduce((total, track) => {
          foundPlayingTrack ||= track.classList.contains("playing") || (hasCortina?.classList.contains('playing') || false);
          if (foundPlayingTrack) {
            const duration = timeStringToSeconds(
              track.dataset.duration || "0:0"
            );
            return total + (typeof duration == "number" ? duration : 0);
          } else {
            return total;
          }
        }, 0); // 0 is the initial value for the total
        startTime.setSeconds(startTime.getSeconds() + duration);
      } else {
        tanda.scheduledPlayingTime("");
      }
    });
  });


  playlistContainer.addEventListener("clickedTrack", async (event: Event) => {
    try {
      const track = (event as CustomEvent).detail;
      const playing = document.querySelector(
        "track-element.playing, cortina-element.playing"
      );
      if (!playing) {
        let N = playlistService.getN(track);
        await speakerOutputPlayer.updatePosition(N - 1);
        if (speakerOutputPlayer.next) {
          speakerOutputPlayer.next.silence = 0;
        }
        speakerOutputPlayer.startNext();
        getDomElement("#stopButton").classList.add("active");
      }
    } catch (error) {
      console.error(error);
      alert(error);
    }
  });

  // Prepare the new music speakerOutputPlayer to play music adjusted to the given system gain
  // and fade songs using the given fade rate.

  const headerField = getDomElement("body > header > h1");
  const stopButton = getDomElement("#stopButton");
  const speakerPlayerConfig: PlayerOptions = {
    ctx: config.mainOutput,
    systemLowestGain,
    fadeRate,
    useSoundLevelling: config.useSoundLevelling,
    fetchNext: async (N: number) => {
      let allTracks = playlistService.allTracks;
      let silence = 0;
      let nextTrack: Track | undefined = undefined;
      while (!nextTrack && N < allTracks.length) {
        console.log("Getting next track", N);
        nextTrack = await playlistService.fetch(N);
        if (!nextTrack) N++;
      }
      if (!nextTrack) {
        return { N, track: undefined, silence: 0 };
      }

      if (N > 0) {
        let pN = N;
        let previousTrack: Track | undefined = undefined;
        while (!previousTrack && pN > 1) {
          previousTrack = await playlistService.fetch(pN - 1);
          if (!previousTrack) pN--;
        }
        silence = 2;
        if (previousTrack) {
          if (nextTrack.type == "track" && previousTrack.type == "cortina") {
            silence = 4;
          }
          if (nextTrack.type == "cortina" && previousTrack.type == "track") {
            silence = 4;
          }
        }
      } else {
        silence = 0;
      }
      return { track: nextTrack, silence };
    },
    progress: (data: ProgressData) => {
      if (data.state === "Playing") {
        stopButton.classList.add("active");
        if (data.track!.type == "cortina") {
          playlistService.playingCortina(true);
        } else {
          playlistService.playingCortina(false);
        }
      } else {
        stopButton.classList.remove("active");
        playlistService.playingCortina(false);
      }
      headerField.textContent = data.display;
    },
    notify: eventBus.emit.bind(eventBus),
  };

  let headphonePlaylist: Track[] = [];

  const headphonesPlayerConfig: PlayerOptions = {
    ctx: config.headphoneOutput,
    systemLowestGain,
    fadeRate: 0.5,
    useSoundLevelling: config.useSoundLevelling,
    fetchNext: async (N: number) => {
      if (N == 0) {
        return { track: headphonePlaylist[0], silence: 0 };
      } else {
        return { track: undefined, silence: 0 };
      }
    },
  };

  const speakerOutputPlayer = new Player(speakerPlayerConfig);
  const headphonesOutputPlayer = new Player(headphonesPlayerConfig);

  eventBus.on("change-speaker", (context: string) => {
    speakerPlayerConfig.ctx = context;
    speakerOutputPlayer.updateOptions(speakerPlayerConfig);
  });
  eventBus.on("change-headphones", (context: string) => {
    headphonesPlayerConfig.ctx = context;
    headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
  });
  eventBus.on("config-change", () => {
    speakerPlayerConfig.useSoundLevelling = config.useSoundLevelling;
    speakerOutputPlayer.updateOptions(speakerPlayerConfig);
    headphonesPlayerConfig.useSoundLevelling = config.useSoundLevelling;
    headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
  });
  eventBus.on("playAll", () => {
    speakerOutputPlayer.extendEndTime(-1);
  });
  eventBus.on("stopAll", () => {
    speakerOutputPlayer.stop();
    speakerOutputPlayer.startNext();
  });
  eventBus.on("stopPlaying", () => {
    speakerOutputPlayer.stop();
    playlistService.allTracks.forEach((track) => track.setPlaying(false));
    let tandas = Array.from(
      playlistContainer.querySelectorAll("tanda-element")
    ) as TandaElement[];
    tandas.forEach((tanda) => {
      tanda.setPlaying(false);
    });
  });

  eventBus.on("playOnHeadphones", async (detail: any) => {
    const track = detail.element;
    // Clear all other tracks from playing

    allTracks(document).forEach((x: TrackElement) => {
      if (x !== track) x.stopPlayingOnHeadphones();
    });

    if (!detail.playing) {
      headphonesOutputPlayer.stop();
    } else {
      const table = track.dataset.type;
      headphonePlaylist[0] = (await dbManager.getDataById(
        table,
        parseInt(track.dataset.trackId)
      )) as Track;
      headphonesOutputPlayer.stop();
      await headphonesOutputPlayer.updatePosition(-1);
      headphonesOutputPlayer.startNext();
      headphonePlaylist = [];
    }
  });

  // Called when drag/drop completes which might mess up where current song is in the list
  eventBus.on("changed-playlist", async () => {
    const N = playlistService.getNowPlayingN();
    console.log("Changed playlist - now playing", N, speakerOutputPlayer);
    await speakerOutputPlayer.updatePosition(N);
  });

  // dummy code

  const tracks: Track[] = (await dbManager.processEntriesInBatches(
    "track",
    (record) => true
  )) as Track[];
  const cortinas: Track[] = (await dbManager.processEntriesInBatches(
    "cortina",
    (record) => true
  )) as Track[];

  let t = 0;
  let c = 0;

  const allTandas: Tanda[] = [];
  if (tracks.length > 0 && cortinas.length > 0) {
    while (t < Math.min(tracks.length, 60)) {
      if (c >= cortinas.length) {
        c = 0;
      }
      const tanda: Tanda = {
        type: "tanda",
        name: "Dummy",
        style: "Unknown",
        cortina: cortinas[c++].name,
        tracks: [],
      };

      for (let i = 0; i < 4 && t < tracks.length; i++) {
        tanda.tracks.push(tracks[t++].name);
      }

      // for (let i = 0; i < 100 ; i++ ){
      allTandas.push(tanda);
      // }
    }
  }
  console.log(allTandas);
  await playlistService.setTandas(allTandas);
  speakerOutputPlayer.startNext();
}
