// @ts-ignore
import { Howl } from "../lib/howler.min.js";
import { formatTime } from "../services/utils";
import { eventBus } from "../events/event-bus";
/**
 * Create a player.  This handles all songs on one output
 * Emits `track-progress` every second with information on the current track
 * Emits `track-request` when details of the next song in the sequence is needed
 *
 * Subscribes to `next-track` expecting { track, silence }
 *
 * @param {object} options -   ctx: any; // output context - i.e. headphones or speakers
 *                             progress: (progress: ProgressData) => void; // method to call once per second for progress reporting
 *                             nextUp: (N: number) => Promise<{ track: Track; silence: number }>;
 *                             systemLowestGain: { meanVolume: number; maxVolume: number };
 *                             fadeRate: number; // time over which to fade out.
 */
export class Player {
    options;
    current = null;
    next = null;
    playlistPos = null;
    systemGain;
    progressTimer;
    constructor(options) {
        this.options = options;
        this.systemGain =
            options.systemLowestGain.meanVolume - options.systemLowestGain.maxVolume;
        console.log("Setting player system gain", this.systemGain, this.options);
        eventBus.on("next-track", this.loadNext.bind(this));
        this.progressTimer = setInterval(this.checkProgress.bind(this), 250);
    }
    checkProgress() {
        if (this.current) {
            const { player, track, ending, silence, state, gainReduction } = this.current;
            if (player) {
                let timeNow = player.seek() * 1000;
                if (track?.metadata?.end >= 0) {
                    let timeEnd = 1000 * track.metadata.end + Math.min(0, silence ?? 0);
                    console.log("Check timeEnd", timeEnd, "Time now", timeNow, "Ending?", ending, "Track:", track.fileHandle.name, "Gain", gainReduction);
                    if (timeNow >= timeEnd - 500 && !ending) {
                        this.current.ending = true;
                        player.fade(Player.dBtoLinear(gainReduction), 0, this.options.fadeRate);
                        this.reportProgress("Fading");
                        let obj = this.current;
                        setTimeout(() => {
                            if (obj === this.current) {
                                player.off("end", this.startNext.bind(this));
                                if (this.current?.unload) {
                                    this.current.unload();
                                }
                            }
                        }, this.options.fadeRate + 1000);
                        this.startNext();
                    }
                    else {
                        this.reportProgress(state);
                    }
                }
                else {
                    this.reportProgress(state);
                }
            }
        }
    }
    reportProgress(newState) {
        if (!this.current)
            return;
        this.current.state = newState;
        const { player, track, state } = this.current;
        if (player) {
            const pos = !(track.metadata?.end >= 0)
                ? state == "Stopped"
                    ? 0
                    : player.seek() * 1000
                : state == "Stopped"
                    ? 0
                    : Math.min(player.seek() * 1000 - track.metadata?.start, 1000 * (track.metadata.end - track.metadata.start));
            const displayName = track.metadata?.end < 0
                ? `${state}:  ${this.current.displayName} ( ${formatTime(player.seek() * 1000)} / ? )`
                : `${state}: ${this.current.displayName}  ( ${formatTime(pos)} / ${formatTime(1000 * (track.metadata.end - track.metadata.start))} )`;
            eventBus.emit("track-progress", {
                track,
                pos,
                display: displayName,
                state: newState,
            });
        }
        else {
            if (!this.next?.player) {
                eventBus.emit("track-progress", {
                    track: null,
                    pos: null,
                    display: `Stopped`,
                    state: `Stopped`,
                });
            }
        }
    }
    static dBtoLinear(dB) {
        return Math.pow(10, dB / 20);
    }
    updatePosition(newPos) {
        console.log("Player - Updating position", newPos, "Was", this.playlistPos);
        if (newPos !== this.playlistPos) {
            this.playlistPos = newPos;
            if (typeof this.next?.unload == "function") {
                this.next.unload();
            }
            this.requestNext(newPos + 1);
        }
    }
    requestNext(N) {
        console.log("Requesting track", N);
        eventBus.emit("track-request", N);
    }
    // Called by event 'next-track'
    async loadNext(payload) {
        try {
            const N = this.playlistPos + 1;
            console.log("Loading next", N);
            const { track, silence } = payload;
            console.log("Told by playlist to use this", track, "Silence: ", silence, "Gain => Mean", track.metadata?.meanVolume, "Max", track.metadata.maxVolume, "system", this.systemGain);
            if (track) {
                const { player, url } = await this.createPlayer(track);
                if (player) {
                    track.metadata.end = Math.min(25, track.metadata.end);
                    const next = {
                        position: N,
                        silence,
                        track,
                        player,
                        url,
                        gainReduction: track.metadata?.meanVolume !== null &&
                            track.metadata?.meanVolume !== undefined
                            ? this.systemGain -
                                (track.metadata.meanVolume - track.metadata.maxVolume)
                            : 1,
                        displayName: `${track.metadata?.tags?.title || track.fileHandle?.name} / ${track.metadata?.tags?.artist || "unknown"}`,
                        state: "Waiting",
                        ending: false,
                    };
                    next.unload = () => {
                        console.trace("Unloading", next.track);
                        if (next.player) {
                            if (next.player.playing())
                                next.player.stop();
                            next.player.unload();
                        }
                        URL.revokeObjectURL(next.url);
                        next.player = null;
                        next.unload = null;
                    };
                    this.next = next;
                    eventBus.emit("next-track-ready");
                }
            }
            else {
                this.next = null;
            }
        }
        catch (error) {
            this.next = null;
        }
    }
    get isPlaying() {
        return this.current?.player?.playing();
    }
    get playing() {
        return this.playlistPos;
    }
    async createPlayer(track) {
        try {
            console.log("Trying to create a player", track);
            const url = URL.createObjectURL(await track.fileHandle.getFile());
            const player = new Howl({
                src: [url],
                html5: true,
                preload: true,
                autoplay: false,
            });
            player.once("load", () => {
                player.seek(track.metadata?.start || 0);
                if (track.metadata?.meanVolume !== null && track.metadata?.meanVolume !== undefined) {
                    const reduction = this.systemGain -
                        (track.metadata.meanVolume - track.metadata.maxVolume);
                    console.log("Using reduction", reduction);
                    player.volume(Player.dBtoLinear(reduction));
                }
            });
            if (track.metadata?.end < 0)
                player.once("end", this.startNext.bind(this));
            console.log("Returning", player, url);
            return { player, url };
        }
        catch (error) {
            console.error(error);
            eventBus.emit("error", error);
            throw error;
        }
    }
    startNext() {
        console.log("Starting next", this.next);
        if (!this.next)
            return this.reportProgress("Stopped");
        this.current = this.next;
        this.next = null;
        this.playlistPos = this.current.position;
        if (this.current.silence > 0) {
            this.reportProgress("Waiting");
            setTimeout(() => {
                if (this.current?.player) {
                    this.reportProgress("Playing");
                    this.current.player.play();
                    // this.checkProgress();
                }
            }, this.current.silence * 1000);
        }
        else {
            this.reportProgress("Playing");
            this.current.player.play();
            // this.checkProgress();
        }
        this.requestNext(this.playlistPos + 1);
    }
    stop() {
        if (this.isPlaying) {
            this.current.ending = true;
            this.current.player.fade(Player.dBtoLinear(this.current.gainReduction), 0, this.options.fadeRate);
            this.reportProgress("Fading");
            setTimeout(() => {
                this.reportProgress("Stopped");
                if (this.current.unload) {
                    this.current.unload();
                }
            }, this.options.fadeRate + 1000);
        }
    }
    start() {
        if (!this.isPlaying) {
            this.current.player.play();
        }
    }
    extendEndTime(period) {
        if (this.isPlaying) {
            this.current.track.metadata.end = period;
            this.current.ending = false;
        }
    }
}
