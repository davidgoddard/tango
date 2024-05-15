// @ts-ignore
import { Howl } from "../lib/howler.min.js";
import { formatTime } from "../services/utils";
import { eventBus } from "../events/event-bus";

import { Track } from "../data-types";

export interface PlayerOptions {
  ctx: any; // output context - i.e. headphones or speakers
  systemLowestGain: { meanVolume: number; maxVolume: number };
  fadeRate: number; // time over which to fade out.
  useSoundLevelling: boolean;
  fetchNext: (N: number) => Promise<{ track?: Track; silence: number }>;
  progress?: (data: ProgressData) => void;
}

export interface ProgressData {
  track: Track | null;
  pos: number | null;
  display: string;
  state: string;
}

type Status = {
  position: number;
  silence: number;
  track: Track;
  player: Howl;
  url: string;
  unload?: (() => void) | null;
  gainReduction: number;
  displayName: string;
  state: string;
  ending: boolean;
} | null;

interface NextTrack {
  track: Track;
  silence: number;
}

/**
 * Create a player.  This handles all songs on one output
 * Emits `track-progress` every second with information on the current track
 *
 *
 * @param {object} options -   ctx: any; // output context - i.e. headphones or speakers
 *                             progress: (progress: ProgressData) => void; // method to call once per second for progress reporting
 *                             nextUp: (N: number) => Promise<{ track: Track; silence: number }>;
 *                             systemLowestGain: { meanVolume: number; maxVolume: number };
 *                             fadeRate: number; // time over which to fade out.
 */
export class Player {
  private current: Status = null;
  public next: Player["current"] | null = null;
  private playlistPos: number | null = null;
  private systemGain: number = 0;

  constructor(private options: PlayerOptions) {
    this.updateOptions(options);
    setInterval(this.checkProgress.bind(this), 250);
  }

  public updateOptions(newOptions: PlayerOptions) {
    this.options = newOptions;
    this.systemGain =
      this.options.systemLowestGain.meanVolume -
      this.options.systemLowestGain.maxVolume;
    console.log("New config", this.options, this.systemGain);
  }

  private checkProgress() {
    if (this.current) {
      const { player, track, ending, silence, state, gainReduction } =
        this.current;
      if (player) {
        let timeNow = player.seek() * 1000;
        if (track?.metadata?.end >= 0) {
          let timeEnd = 1000 * track.metadata.end + Math.min(0, silence ?? 0);
          if (timeNow >= timeEnd - 500 && !ending) {
            this.current.ending = true;
            player.fade(
              (this.options.useSoundLevelling ? Player.dBtoLinear(gainReduction) : 1),
              0,
              this.options.fadeRate * 1000
            );
            this.reportProgress("Fading");
            let obj = this.current;
            setTimeout(() => {
              player.off("end", this.startNext.bind(this));
              if (obj.unload) {
                obj.unload();
              }
            }, this.options.fadeRate * 1000 + 1000);
            this.startNext();
          } else {
            this.reportProgress(state);
          }
        } else {
          this.reportProgress(state);
        }
      }
    }
  }

  private reportProgress(newState: string) {
    if (!this.current) return;
    this.current.state = newState;
    const { player, track, state } = this.current;
    if (player) {
      const pos = !(track.metadata?.end >= 0)
        ? state == "Stopped"
          ? 0
          : player.seek() * 1000
        : state == "Stopped"
        ? 0
        : Math.min(
            player.seek() * 1000 - track.metadata?.start,
            1000 * (track.metadata.end - track.metadata.start)
          );
      const displayName =
        track.metadata?.end < 0
          ? `${state}:  ${this.current.displayName} ( ${formatTime(
              player.seek()
            )} / ? )`
          : `${state}: ${this.current.displayName}  ( ${formatTime(
              pos / 1000
            )} / ${formatTime(
              (track.metadata.end - track.metadata.start)
            )} )`;
      if (this.options.progress) {
        this.options.progress({
          track,
          pos,
          display: displayName,
          state: newState,
        });
      }
    } else {
      if (!this.next?.player) {
        if (this.options.progress) {
          this.options.progress({
            track: null,
            pos: null,
            display: `Stopped`,
            state: `Stopped`,
          });
        }
      }
    }
  }

  private static dBtoLinear(dB: number): number {
    return Math.pow(10, dB / 20);
  }

  async updatePosition(newPos: number) {
    if (newPos !== this.playlistPos) {
      this.playlistPos = newPos;
      if (typeof this.next?.unload == "function") {
        this.next.unload!();
      }
      await this.loadNext();
    }
  }

  // Called by event 'next-track'

  async loadNext() {
    try {
      const N = this.playlistPos! + 1;
      const { track, silence } = await this.options.fetchNext(N);
      console.log("Result from fetch next", track, silence);
      if (track) {
        const { player, url } = await this.createPlayer(track);
        if (player) {
          const next: Status = {
            position: N,
            silence,
            track,
            player,
            url,
            gainReduction:
              track.metadata?.meanVolume !== null &&
              track.metadata?.meanVolume !== undefined
                ? this.systemGain -
                  (track.metadata.meanVolume - track.metadata.maxVolume)
                : 1,
            displayName: `${
              track.metadata?.tags?.title || track.fileHandle?.name
            } / ${track.metadata?.tags?.artist || "unknown"}`,
            state: "Waiting",
            ending: false,
          };
          next.unload = () => {
            console.log("Unloading player", JSON.stringify(track));
            if (next.player) {
              if (next.player!.playing()) next.player!.stop();
              next.player!.unload();
            }
            URL.revokeObjectURL(next.url);
            next.player = null!;
            next.unload = null;
          };

          this.next = next;
          eventBus.emit("next-track-ready");
        }
      } else {
        this.next = null;
      }
    } catch (error) {
      this.next = null;
    }
  }

  get isPlaying() {
    return this.current?.player?.playing();
  }

  get playing() {
    return this.playlistPos;
  }

  private async createPlayer(track: Track) {
    try {
      const url = URL.createObjectURL(await track.fileHandle.getFile());

      console.log("Creating music player for context: ", this.options.ctx);
      const howlerConfig = {
        src: [url],
        html5: true,
        preload: true,
        autoplay: false,
        ctx: this.options.ctx,
        onplay: () => {
          console.log("starting howler playing");
        },
      };
      console.log("New player config: ", howlerConfig);
      const player = new Howl(howlerConfig);

      player.once("load", async () => {
        console.log("track loaded into howler", this.options.ctx);

        // Try to route the audio where required
        if (this.options.ctx) {
          try {
            const audioElement = player._sounds[0]._node; // Access the underlying HTMLAudioElement
            if (typeof audioElement.setSinkId === "function") {
              await audioElement.setSinkId(this.options.ctx);
              console.log("Selected output device successfully");
            }
          } catch (error) {
            console.error(error, this.options.ctx);
          }
        }

        player.seek(track.metadata?.start || 0);
        if (track.metadata?.end < 0) {
          track.metadata.end = player.duration();
          track.metadata.end = Math.min(20, track.metadata.end);
        }
        if (
          this.options.useSoundLevelling && 
          track.metadata?.meanVolume !== null &&
          track.metadata?.meanVolume !== undefined
        ) {
          const reduction =
            this.systemGain -
            (track.metadata.meanVolume - track.metadata.maxVolume);
          player.volume(Player.dBtoLinear(reduction));
        }
      });

      if (track.metadata?.end! < 0)
        player.once("end", this.startNext.bind(this));

      return { player, url };
    } catch (error) {
      console.error(error);
      eventBus.emit("error", error);
      throw error;
    }
  }

  startNext() {
    if (!this.next) return this.reportProgress("Stopped");
    if (this.current?.track.type == "cortina") {
      eventBus.emit("tanda");
    }
    this.current = this.next;
    this.next = null;
    this.playlistPos = this.current.position;
    if (this.current.track.type == "cortina") {
      eventBus.emit("cortina");
    }
    if (this.current.silence > 0) {
      this.reportProgress("Waiting");
      setTimeout(() => {
        if (this.current?.player) {
          this.reportProgress("Playing");
          this.current.player.play();
          // this.checkProgress();
        }
      }, this.current.silence * 1000);
    } else {
      this.reportProgress("Playing");
      this.current.player.play();
      // this.checkProgress();
    }
    this.loadNext();
  }

  stop() {
    if (this.isPlaying) {
      this.current!.ending = true;
      this.current!.player.fade(
        (this.options.useSoundLevelling ? Player.dBtoLinear(this.current!.gainReduction) : 1),
        0,
        this.options.fadeRate * 1000
      );
      this.reportProgress("Fading");
      let obj = this.current!;
      setTimeout(() => {
        this.reportProgress("Stopped");
        if (obj.unload) {
          obj.unload();
        }
      }, this.options.fadeRate * 1000 + 1000);
    }
  }

  start() {
    if (!this.isPlaying) {
      this.current!.player.play();
    }
  }

  extendEndTime(period: number) {
    if (this.isPlaying) {
      this.current!.track.metadata!.end = period;
      this.current!.ending = false;
    }
  }
}
