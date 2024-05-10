// @ts-ignore
import Howl from "../non-ts/lib/howler.min.js";
export function toTime(ms) {
    if (isNaN(ms))
        return "?";
    let seconds = Math.round(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    const parts = [];
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    if (hours > 0) {
        parts.push(hours);
        parts.push(formattedMinutes);
    }
    else {
        parts.push(minutes);
    }
    parts.push(formattedSeconds);
    return parts.join(":");
}
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
            options.systemLowestGain.metadata.meanVolume -
                options.systemLowestGain.metadata.maxVolume;
        console.log("Setting player system gain", this.systemGain, this.options);
        this.progressTimer = setInterval(this.checkProgress.bind(this), 100);
    }
    checkProgress() {
        if (this.current) {
            const { player, track, ending, silence, state } = this.current;
            if (player) {
                let timeNow = player.seek() * 1000;
                if (track?.metadata?.end >= 0) {
                    let timeEnd = 1000 * track.metadata.end + Math.min(0, silence ?? 0);
                    if (timeNow >= timeEnd - 500 && !ending) {
                        this.current.ending = true;
                        player.fade(Player.dBtoLinear(this.current.gainReduction), 0, this.options.fadeRate);
                        this.reportProgress("Fading");
                        setTimeout(() => {
                            if (this.current?.unload) {
                                this.current.unload();
                            }
                        }, this.options.fadeRate + 1000);
                        player.off("end", this.startNext.bind(this));
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
                ? `${state}:  ${this.current.displayName} ( ${toTime(player.seek() * 1000)} / ? )`
                : `${state}: ${this.current.displayName}  ( ${toTime(pos)} / ${toTime(1000 * (track.metadata.end - track.metadata.start))} )`;
            this.options.progress({
                track,
                pos,
                display: displayName,
                state: newState,
            });
        }
        else {
            if (!this.next?.player) {
                this.options.progress({
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
    async updatePosition(newPos) {
        console.log("Player - Updating position", newPos, "Was", this.playlistPos);
        if (newPos !== this.playlistPos) {
            this.playlistPos = newPos;
            if (typeof this.next?.unload == "function") {
                this.next.unload();
            }
            await this.loadNext();
        }
    }
    async loadNext() {
        try {
            const N = this.playlistPos + 1;
            console.log("Loading next", N);
            const { track, silence } = await this.options.nextUp(N);
            console.log("Told by playlist to use this", track, "Silence: ", silence);
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
                        gainReduction: track.metadata?.meanVolume
                            ? this.systemGain -
                                (track.metadata.meanVolume - track.metadata.maxVolume)
                            : 1,
                        displayName: `${track.metadata?.tags?.title || track.fileHandle.name} / ${track.metadata?.tags?.artist || "unknown"}`,
                        state: "Waiting",
                        ending: false,
                    };
                    next.unload = () => {
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
        const url = URL.createObjectURL(await track.fileHandle.getFile());
        const player = new Howl({
            src: [url],
            html5: true,
            preload: true,
            autoplay: false,
        });
        player.once("load", () => {
            player.seek(track.metadata?.start || 0);
            if (track.metadata?.meanVolume) {
                const reduction = this.systemGain -
                    (track.metadata.meanVolume - track.metadata.maxVolume);
                console.log("Using reduction", reduction);
                player.volume(Player.dBtoLinear(reduction));
            }
        });
        if (track.metadata?.end < 0)
            player.once("end", this.startNext.bind(this));
        return { player, url };
    }
    startNext() {
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
                    this.checkProgress();
                }
            }, this.current.silence * 1000);
        }
        else {
            this.reportProgress("Playing");
            this.current.player.play();
            this.checkProgress();
        }
        this.loadNext();
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
