/*


==========================================

Playlist re-think

The files must be pre-loaded.  


Spaced music playback: <-- 1 --><-- track 1 --><-- 2 --><-- track 2 --><-- 3 --><-- track 3 --><-- 4 -->

Overlapped music playback
<-- track 1 -->
          <-- track 2 -->
                    <-- track 3 -->

the song must be trimmed from silence.
the song must be ready to start playing immediately.

For overlapped playback: Wait for the end of the song to approach.  When within T seconds (overlap period) trigger the end event and a fade-out but keep on playing                    
For non-overlapped playback: Wait for the end of the song, then fade-out but simultaneously start a timer.  When T seconds of space expires, trigger the end event.

If the overlap/silence period is negative for overlaps and positive for spaces, 
Add the overlap to the end time to get the actual end time.
If the song naturally ends before this time, start a timout for the remaining time and upon expiry trigger the end event.
If the song is still playing when the end is reached, start a fade-out and trigger the end event.

The player will have a small windowed view of the playlist.  

When the app calls play, it will call nextUp.  Both operate the same in terms of creating howler instances.

As soon as an item starts playing it calls nextUp to pre-load the next one.  

nextUp will be called passing N as the expected position in the playlist and expect the app to return the file details to play and a period of silence
to use before starting the next track.

The app will create a player instance for each playlist.  

When the app changes the playlist it must call the updatePosition method with the calculated position of the current song in the new playlist. This in turn
will call the nextUp method just in case that changed what was playing next.
The app must not allow the current song to be removed.
The player will maintain a position pointer into the playlist using ordinal numbers of the tracks in the list which will include cortinas.

The app will pass special silences before tandas and after tandas and cortinas.


*/

export function to_time(ms) {
    // Calculate hours, minutes and seconds
    if ( isNaN(ms) ){
        return '?'
    }
    let seconds = Math.round(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    // Reduce minutes and seconds to be within 0-59
    seconds %= 60;
    minutes %= 60;

    // Create an array of the time components
    const parts = [];

    // Format minutes and seconds: always two digits if hours or minutes are included
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Add hours if non-zero
    if (hours > 0) {
        parts.push(hours);  // Add hours if non-zero
        parts.push(formattedMinutes); // Minutes with leading zero
    } else {
        parts.push(minutes); // Add minutes as is (no leading zero)
    }

    // Always add seconds, with leading zero if necessary
    parts.push(formattedSeconds);

    // Join parts with ':' to form the final time string
    return parts.join(':');

}
export class Player {

    /*
    options = {
        ctx: output context - i.e. headphones or speakers
        progress: method to call once per second for progress reporting
        nextUp: method passed N offset into playlist and app must return the track details plus silence required between current and next
        systemGain: minimum gain in music files
        fadeRate: time over which to fade out.
    }

    track = {
        fileHandle: File handle
        start: milliseconds offset
        end: milliseconds offset (duration = start - end when reporting)
        gain: in db - assumes 0 db is max volume, 
    }
    */
    constructor(options = {}) {
        this.options = options;
        this.current = undefined;
        this.next = undefined;
        this.playlistPos = null;
        this.systemGain = this.options.systemLowestGain.metadata.meanVolume - this.options.systemLowestGain.metadata.maxVolume;
        console.log('Setting player system gain', this.systemGain, this.options)
        this.progressTimer = setInterval(this.checkProgress.bind(this), 100);

    }

    checkProgress() {
        const unload = this.current?.unload;
        const player = this.current?.player;
        const track = this.current?.track;

        // The end of the playing of a track occurs at the track.end 
        // At this time the song should fade out and the next song/silence should start.

        if (player) {
            let timeNow = player.seek() * 1000;
            if (track.metadata?.end >= 0) {
                let timeEnd = 1000 * track.metadata.end + Math.min(0, this.next?.silence ?? 0)
                if (timeNow >= timeEnd - 500 && !this.current.ending) {
                    this.current.ending = true;

                    // Mark as ended and start next song but then fade this out just in case it is still playing

                    player.fade(this.current.gainReduction, 0, this.options.fadeRate)
                    this.reportProgress('Fading');
                    setTimeout(function () {
                        if (unload) {
                            unload();
                        }
                    }.bind(this), this.options.fadeRate + 1000)

                    // Stop the duplicated listener for end of tracks.
                    player.off('end', this.startNext.bind(this));

                    // Get next track started

                    this.startNext();
                } else {
                    this.reportProgress(this.current.state);
                }
            } else {
                this.reportProgress(this.current.state);
            }
        }
    }

    reportProgress(newState) {
        this.current.state = newState;
        if (this.current?.player) {
            // if (this.current?.player.seek() > 0) {
            const player = this.current.player;
            const track = this.current.track;
            const pos = ( !track.metadata?.end >= 0 ) ? ( this.current.state == 'Stopped' ? 0 : player.seek() * 1000 ) : ( this.current.state == 'Stopped' ? 0 : Math.min(player.seek() * 1000 - track.metadata?.start, 1000 * (track.metadata.end - track.metadata.start)))
            const displayName = ( track.metadata?.end < 0 ) ? `${this.current.state}:  ${this.current.displayName} ( ${to_time(player.seek() * 1000)} / ? )` : `${this.current.state}: ${this.current.displayName}  ( ${to_time(pos) } / ${to_time(1000 * (track.metadata.end - track.metadata.start))} )`;
            
            this.options.progress({
                track,
                pos,
                display: displayName,
                state: newState
            });
            // }
        } else {
            if (!this.next?.player) {
                this.options.progress({
                    track: null,
                    pos: null,
                    display: `Stopped`,
                    state: `Stopped`
                });
            }
        }
    }


    static dBtoLinear(dB) {
        return Math.pow(10, dB / 20)
    }

    volume(level) {
        this.volume = level;
        this.current?.player?.volume(level / 100)
    }

    setTempo(tempo) {
        if (this.current?.player) {
            this.current.player.rate(tempo)
        }
    }

    // Tell the app that it is currently playing at the new position.
    // Called with zero causes the first track to be loaded into the next player

    async updatePosition(newPos) {
        console.log('Player - Updating position', newPos, 'Was', this.playlistPos)
        if (newPos !== this.playlistPos) {
            this.playlistPos = newPos;

            // Free up the old player

            if (typeof this.next?.unload == 'function') {
                this.next.unload();
            }

            await this.loadNext();
        }
    }

    // Get a new player for the next track
    async loadNext() {

        const N = this.playlistPos + 1;

        console.log('Loading next', N)

        const { track, silence } = await this.options.nextUp(N);
        console.log('Told by playlist to use this', track, 'Silence: ', silence)
        if (track) {
            const { player, url } = await this.createPlayer(track);

            if (player) {

                track.metadata.end = Math.min(25, track.metadata.end)

                const next = {
                    position: N,
                    silence,
                    track,
                    player,
                    url,
                    unload: null,
                    gainReduction: (track.metadata?.meanVolume) ? ((this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume))) : 1,
                    displayName: (track.metadata?.tags?.find(tag => tag.name == 'title')?.value || track.fileHandle.name) + ' / ' +
                        (track.metadata?.tags?.find(tag => tag.name == 'artist')?.value || 'unknown')
                }

                // Define a clean up operation

                next.unload = function () {
                    if (next.player) {
                        if (next.player?.isPlaying) next.player.stop();
                        next.player.unload();
                    }
                    URL.revokeObjectURL(next.url);
                    next.player = null;
                    next.unload = null;
                }.bind(this);

                this.next = next;

            }
        } else {
            this.next = null;
        }

    }

    get isPlaying() {
        return this.current?.player?.playing()
    }

    // Get a handle to the given track and then get a URL to
    // the memory location of the file's metadata and finally 
    // create a new player instance and ask it to pre-load the file but
    // not play the file just yet.

    async createPlayer(track) {

        // Create a new player instance

        console.log('Creating player for', track)
        const url = URL.createObjectURL(await track.fileHandle.getFile());

        // Convert ArrayBuffer to Blob
        // let blob = new Blob([track.wavFile], { type: 'audio/wav' });

        // Create a URL for the Blob
        // let url = URL.createObjectURL(blob);


        const player = new Howl({
            src: [url],
            // format: ['wav'],
            html5: true,
            preload: true,
            autoplay: false
        });

        player.once('load', function () {
            console.log('Loaded', track)
            // Move to where the user wants the track to start

            player.seek(track.metadata.start)

            // Turn down the volume to match quietest songs in library

            if ( track.metadata?.meanVolume ){
                const reduction = ((this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume)))
                console.log('Using reduction', reduction)
                player.volume(Player.dBtoLinear(reduction));    
            }

        }.bind(this));

        if (track.metadata?.end < 0 )    
            player.once('end', this.startNext.bind(this));


        return { player, url }

    }

    startNext() {
        if (this.next) {
            this.current = this.next;
            this.next = null;
            this.playlistPos = this.current.position
            if (this.current.silence > 0) {
                this.reportProgress('Waiting');
                setTimeout(function () {
                    if (this.current?.player) {
                        this.reportProgress('Playing');
                        this.options.playing(this.current.position)
                        this.current.player.play();
                        this.checkProgress();
                    }
                }.bind(this), this.current.silence * 1000)
            } else {
                this.reportProgress('Playing');
                this.options.playing(this.current.position)
                this.current.player.play();
                this.checkProgress();
            }
            this.loadNext(); // no need to wait
        } else {
            this.reportProgress('Stopped')
        }
    }

    stop() {
        if (this.isPlaying) {
            this.current.player.fade(Player.dBtoLinear(this.current.gainReduction), 0, this.options.fadeRate)
            this.reportProgress('Fading');
            setTimeout(function () {
                this.reportProgress('Stopped');
                if (this.current.unload) {
                    this.current.unload();
                }
            }.bind(this), this.options.fadeRate + 1000)
            // this.current.player.stop();
        }
    }

    start() {
        if (!this.isPlaying) {
            this.current.player.play();
        }
    }

    extendEndTime(period){
        if (this.isPlaying){
            this.current.track.metadata.end = period;
            this.current.ending = false;
        }
    }

}
