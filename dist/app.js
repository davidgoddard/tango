// Example usage in a component file
import { eventBus } from "./events/event-bus";
import "./components/tanda-element";
import { Player } from './services/player';
import { PlaylistService } from './services/playlist-service';
document.addEventListener("DOMContentLoaded", () => {
    eventBus.on('error', (error) => {
        console.error(error);
    });
    let systemLowestGain = { meanVolume: -20, maxVolume: 0 };
    let fadeRate = 3;
    const playerConfig = {
        ctx: null,
        systemLowestGain,
        fadeRate
    };
    const player = new Player(playerConfig);
    const playlistService = new PlaylistService();
    eventBus.on('new-playlist', () => {
        // make the next track the first in the playlist
        player.updatePosition(-1);
    });
    eventBus.on('track-request-result', async (payload) => {
        // Get file handle to given track
        // use payload.previous to decide on required silence
        await player.loadNext({ track: payload.requested, silence: 0 });
    });
    // Simulate user request to start playing
    setTimeout(() => {
        player.startNext();
    }, 3000);
    // dummy codew
    const track = {
        fileHandle: {},
        metadata: {
            start: 0,
            end: 0,
            meanVolume: -20,
            maxVolume: 0,
            tags: {
                title: 'unknown',
                artist: 'unknown'
            }
        }
    };
    const tanda = {
        name: 'Dummy',
        style: 'Unknown',
        cortina: null,
        tracks: [track, track, track]
    };
    playlistService.setTandas([
        tanda, tanda
    ]);
});
