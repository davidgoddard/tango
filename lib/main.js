import { DatabaseManager } from './database.js';
import { Player, to_time } from './player.js';
import { openMusicFolder, getAllFiles, verifyPermission, fetchLibraryFiles } from './file_system.js';
import { runFFmpegCommand, initializeFFmpeg, decodeFFmpegOutput } from './ffmpeg-interface.js';

const SYSTEM = {
    musicFolder: undefined,
    defaultTandaStyleSequence: '4T 4T 3W 4T 3M'
}
const CONFIG_ID = 1


async function readMetadataFromFileHandle(fileHandle) {
    try {
        // Get the File object from the file handle
        const file = await fileHandle.getFile();
        const { convertedFile, outputLines } = await runFFmpegCommand(fileHandle, '-map', '0:a', '-af', 'volumedetect,silencedetect=n=-60dB:d=1', '-f', 'null', '-')
        const metadata = decodeFFmpegOutput(outputLines);
        return { size: convertedFile.byteLength, metadata };
    } catch (error) {
        console.error('Failed to read metadata:', error);
        return { size: 0, metadata: {} }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeFFmpeg();
    const playlistContainer = document.querySelector('#playlist');
    const scratchPadContainer = document.querySelector('#scratchPad');



    console.log('Set up handlers for column switching')
    const modeSelector = document.getElementById('modeSelector');
    const searchColumn = document.getElementById('searchColumn');
    const scratchpadColumn = document.getElementById('scratchpadColumn');
    const playlistColumn = document.getElementById('playlistColumn');
    const handle1 = document.getElementById('handle1');
    const handle2 = document.getElementById('handle2');

    // // Function to load widths from localStorage
    // function loadWidths(mode) {
    //   const widths = localStorage.getItem('widths_' + mode);
    //   if (widths) {
    //     const { col1Width, col3Width, col5Width } = JSON.parse(widths);
    //     col1.style.flexGrow = col1Width;
    //     col3.style.flexGrow = col3Width;
    //     col5.style.flexGrow = col5Width;
    //   }
    // }

    // // Function to save widths to localStorage
    // function saveWidths(mode) {
    //   const widths = {
    //     col1Width: col1.style.flexGrow,
    //     col3Width: col3.style.flexGrow,
    //     col5Width: col5.style.flexGrow
    //   };
    //   localStorage.setItem('widths_' + mode, JSON.stringify(widths));
    // }

    // Event listener for mode changes
    function changeScreenLayout(mode) {
        const main = document.querySelector('main');

        console.log('Mode', mode)
        switch (mode) {
            case 'All columns':
                main.classList.remove('playlistOnly')
                main.classList.remove('searchOnly')
                main.classList.add('all')
                break;
            case 'Search':
                main.classList.remove('playlistOnly')
                main.classList.add('searchOnly')
                main.classList.remove('all')
                break;
            case 'Playlist':
                main.classList.add('playlistOnly')
                main.classList.remove('searchOnly')
                main.classList.remove('all')
                break;
        }
        // loadWidths(mode);
    };


    // Add event listener for keydown event on the document
    document.addEventListener('keydown', function (event) {
        if (Array(['SEARCH-ELEMENT', 'INPUT']).includes(event.target.tagName)) {
            // Check if a specific key or combination of keys is pressed
            if (event.key.toLowerCase() === 's') {
                // Perform your action here when CTRL+S is pressed
                console.log('S pressed');
                // Prevent the default browser action (e.g., saving the page)
                event.preventDefault();
                changeScreenLayout('Search')
                const searches = document.querySelectorAll('search-element')
                for (const search of searches) {
                    search.focus();
                }

            } else if (event.key.toLowerCase() === 'p') {
                // Perform your action here when the Escape key is pressed
                console.log('P key pressed');
                changeScreenLayout('Playlist')
            } else if (event.key.toLowerCase() === 'a') {
                // Perform your action here when the Escape key is pressed
                console.log('A key pressed');
                changeScreenLayout('All columns')
            }
            // Add more conditions for other key combinations as needed
        }
    });

    // Open and prepare the IndexedDB database

    const dbManager = await DatabaseManager();
    try {
        const config = await dbManager.getDataById('system', CONFIG_ID)
        if (!config) {
            // Set defaults
            await dbManager.addData('system', SYSTEM)
            console.log(`Set default config`)
        } else {
            console.log(config, 'Combined', { ...SYSTEM, ...config })
            await dbManager.updateData('system', config.id, { ...SYSTEM, ...config })
        }
    } catch (error) {
        console.error('Database operation failed', error);
    }

    // Now get the config as stored
    let config = await dbManager.getDataById('system', CONFIG_ID)

    // See if user will allow access to the configured folder
    let askUserPermissionButton = document.querySelector('#askUserPermission');
    askUserPermissionButton.addEventListener('click', async () => {
        runApplication();
    })

    const searches = document.querySelectorAll('search-element');
    for (const search of searches) {
        search.addEventListener('moveToScratchPad', (event) => {
            console.log('Main picked up move to scratch-pad', event.detail)
            const scratchPad = document.querySelector('#scratchPad')
            const track = event.detail;
            scratchPad.appendChild(track)
            track.shadowRoot.querySelector('.actions').innerHTML = '<button id="select"><img src="./icons/copy-move.png" alt="select for moving into playlist"></button>';
            track.shadowRoot.querySelector('.actions #select').addEventListener('click', (event) => {
                console.log('Request to move to playlist', track)
                track.classList.add('selected')
                playlistContainer.setTrackTargets(track, true)
            })
        })
    }

    // Button for playlists

    const savePlaylistButton = document.querySelector('#savePlaylist');
    savePlaylistButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const parameters = document.querySelectorAll('.playlist-settings-content input')
        let playlistConfig = {}
        for (let p of parameters) {
            playlistConfig[p.id] = p.value;
        }

        const playlist = {
            name: playlistConfig.playlistName,
            html: playlistContainer.innerHTML,
            settings: playlistConfig
        }

        let existing;
        if (playlistConfig.playlistName) {
            console.log('Saving playlist', playlist)
            existing = await dbManager.getDataByName('playlist', playlistConfig.playlistName);
            if (!existing) {
                await dbManager.addData('playlist', playlist)
            } else {
                await dbManager.updateData('playlist', playlistConfig.playlistName, playlist)
            }
        }
        document.querySelector('.playlist-settings-close-btn').click();
    })

    const loadPlaylistButton = document.querySelector('#loadPlaylist');
    loadPlaylistButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const parameters = document.querySelectorAll('.playlist-settings-content input')
        let playlistConfig = {}
        for (let p of parameters) {
            playlistConfig[p.id] = p.value;
        }
        console.log(playlistConfig)

        let existing;
        if (playlistConfig.playlistName) {
            console.log('Loading playlist', playlist)
            existing = await dbManager.getDataByName('playlist', playlistConfig.playlistName);
            if (existing) {
                playlistContainer.innerHTML = existing.html;
                for (let p of parameters) {
                    p.value = playlistConfig[p.id]
                }
            }
        }
        document.querySelector('.playlist-settings-close-btn').click();

    })


    // Standard operation buttons for the config window

    let deleteDBButton = document.querySelector('#deleteDBButton')
    deleteDBButton.addEventListener('click', async () => {
        console.log('Deleting the database')
        await dbManager.resetDatabase();
        console.log('Restoring config')
        await dbManager.addData('system', SYSTEM)
        config = await dbManager.getDataById('system', CONFIG_ID)
        await setFolder();
    })

    let scanButton = document.querySelector('#rescanButton')
    scanButton.addEventListener('click', async () => {
        console.log('Re-scanning file system')
        await scanFileSystem(false)
    })
    let scanButtonAndAnalyze = document.querySelector('#rescanAnalyzeButton')
    scanButtonAndAnalyze.addEventListener('click', async () => {
        console.log('Re-scanning file system and analyzing')
        await scanFileSystem(true)
    })

    let loadLibraryButton = document.querySelector('#loadLibraryButton')
    loadLibraryButton.addEventListener('click', async () => {
        const libraryFileHandles = await fetchLibraryFiles(config.musicFolder);
        if (libraryFileHandles) {
            console.log(libraryFileHandles)
            let file = await libraryFileHandles.library.getFile();
            const library = JSON.parse(await file.text())
            console.log(library)
            file = await libraryFileHandles.cortinas.getFile();
            const cortinas = JSON.parse(await file.text())
            console.log('cortinas', cortinas)
            file = await libraryFileHandles.tandas.getFile();
            const tandas = JSON.parse(await file.text())
            console.log('tandas', tandas)
            file = await libraryFileHandles.playlists.getFile();
            const playlists = JSON.parse(await file.text())
            console.log('playlists', playlists)

            let n = 0
            let keys = Object.keys(library)
            for (const trackName of keys) {
                scanFilePath.textContent = trackName;
                scanProgress.textContent = ++n + '/' + keys.length

                const existing = await dbManager.getDataByName('track', '/' + trackName);
                if (!existing) {
                    console.log('Missing file', trackName)
                } else {
                    const libTrack = library[trackName]
                    const metadata = {
                        tags: {
                            title: libTrack.track.title,
                            artist: libTrack.track.artist,
                            year: libTrack.track.date || libTrack.track.notes
                        },
                        start: libTrack.analysis.start,
                        end: libTrack.analysis.silence,
                        style: libTrack.classifiers?.style,
                        duration: libTrack.analysis.duration,
                        meanVolume: libTrack.analysis.meanGain,
                        maxVolume: libTrack.analysis.gain,

                    }
                    existing.metadata = metadata
                    await dbManager.updateData('track', existing.id, existing)
                }
            }

            for (let tanda of tandas) {
                tanda.tracks = tanda.tracks.map(track => '/' + track)
                if (tanda.cortina && tanda.cortina[0]) {
                    tanda.cortina = tanda.cortina.map(cortina => '/' + cortina.track)
                } else {
                    tanda.cortina = []
                }
                try {
                    const existing = await dbManager.getDataById('tanda', tanda.id)
                    if (!existing) {
                        await dbManager.addData('tanda', tanda)
                    } else {
                        delete tanda.id
                        await dbManager.updateData('tanda', tanda)
                    }
                } catch (error) {
                    delete tanda.id
                    await dbManager.addData('tanda', tanda)
                }

            }

            function renderTrack(track, elementName = 'track') {
                return `<${elementName}-element 
        trackId="${track.id}"
        title="${track.metadata?.tags?.title || track.name}" 
        artist="${track.metadata?.tags?.artist || 'unknown'}" 
        style="${track.metadata?.style}"
        duration="${to_time(track.metadata?.duration * 1000)}" 
        year="${(track.metadata?.tags?.date || '').substring(0, 10) || 'unknown'}"
        file="${track.relativeFileName}"
      >
      </${elementName}-element>`
            }
            let html = ''
            for (const tanda of tandas) {
                let cortina = {}
                if (tanda.cortina && tanda.cortina[0]) {
                    console.log('Getting cortina', tanda)
                    cortina = await dbManager.getDataByName('cortina', tanda.cortina[0])
                }
                let tracks = []
                for (let i = 0; i < tanda.tracks.length; i++) {
                    const track = await dbManager.getDataByName('track', tanda.tracks[i])
                    console.log('Track?', track)
                    if (track)
                        tracks.push(track)
                }
                html += `<tanda-element id="${tanda.id}" name="${tanda.name}" style="${tanda.style}" size="${tanda.tracks.length}">
${cortina?.id ? renderTrack(cortina, 'cortina') : ''}
${tracks.map(track => renderTrack(track)).join('')}
</tanda-element>`
            }
            playlistContainer.innerHTML = html

        }
    })

    // Find all song files and add to the database any not yet known

    const scanProgress = document.querySelector('#scanProgress')
    const scanFilePath = document.querySelector('#scanFilePath')
    const scanFileName = document.querySelector('#scanFileName')

    async function scanFileSystem(analyze) {
        let files = await getAllFiles(config.musicFolder);

        // Store all changes

        const fileHandles = {}
        let n = 0;
        for (const file of files) {
            scanFilePath.textContent = file.relativeFileName;
            scanFileName.textContent = file.name
            scanProgress.textContent = ++n + '/' + files.length
            const original = await dbManager.getDataByName('track', file.relativeFileName)
            if (!original) {
                const baseFile = await file.fileHandle.getFile();
                if (baseFile.size > 1000) {
                    let size = baseFile.size;
                    let metadata = { start: 0, end: -1, duration: undefined };
                    if (analyze) {
                        let { s, m } = await readMetadataFromFileHandle(file.fileHandle)
                        size = s
                        metadata = m
                    }
                    if (size > 1000) {
                        const table = file.relativeFileName.split(/\/|\\/g)[1] == 'music' ? 'track' : 'cortina'
                        await dbManager.addData(table, {
                            name: file.fileHandle.name,
                            fileHandle: file.fileHandle,
                            relativeFileName: file.relativeFileName,
                            metadata,
                            classifiers: {
                                favourite: true,
                            }
                        })
                    }
                }
            }
            else {
                console.log('Already had details of ', file)
                const baseFile = await file.fileHandle.getFile();
                if (baseFile.size > 1000) {
                    let size = baseFile.size;
                    let metadata = original.metadata;
                    if (analyze) {
                        let { s, m } = await readMetadataFromFileHandle(file.fileHandle)
                        size = s
                        metadata = { ...metadata, ...m }
                    }
                    if (size > 1000) {
                        const table = file.relativeFileName.split(/\/|\\/g)[1] == 'music' ? 'track' : 'cortina'
                        await dbManager.addData(table, {
                            name: file.fileHandle.name,
                            fileHandle: file.fileHandle,
                            relativeFileName: file.relativeFileName,
                            metadata,
                            classifiers: {
                                favourite: true,
                            }
                        })
                    }
                }

            }

            console.log('Have now updated the database with all tracks')
        }
    }

    async function setFolder() {

        await openMusicFolder(dbManager, config);

        await verifyPermission(config.musicFolder, 'readonly')

    }

    async function runApplication() {

        await setFolder();

        const modal = document.querySelector('#permissionModal');
        modal.classList = 'hidden'

        // Now query database for all tracks

        let systemLowestGain = { metadata: { meanVolume: 0, maxVolume: 0 } }

        const files = await dbManager.processEntriesInBatches('track', (record) => {
            let trackLevel = record.metadata.meanVolume - record.metadata.maxVolume
            let systemLevel = systemLowestGain.metadata.meanVolume - systemLowestGain.metadata.maxVolume
            if (trackLevel < systemLevel) systemLowestGain = record
            let extension = record.relativeFileName.split(".")
            extension = extension[extension.length - 1]
            return record.relativeFileName.split('/').length > 2 && extension == 'm4a'
        })

        console.log('Fetched all files', files.length, 'Lowest gain', systemLowestGain)

        let player = new Player({
            systemLowestGain,
            fadeRate: 2000, // time over which to fade out 
            progress: reportProgress,
            nextUp: nextTrack,
            playing
        })


        playlistContainer.addEventListener('playFullCortina', async (event) => {
            const cortina = await dbManager.getDataById('cortina', event.target.querySelector('cortina-element').getAttribute('trackid'))
            player.extendEndTime(cortina.metadata.end)
        })
        playlistContainer.addEventListener('stopPlayFullCortina', async (event) => {
            player.extendEndTime(0)
        })

        playlistContainer.addEventListener('clickedTargetTrack', (event) => {

            const sourceTrack = playlistContainer._data.sourceTrack;
            const targetTrack = event.detail;

            let p = targetTrack;
            while (p.tagName !== 'TANDA-ELEMENT') {
                p = p.parentElement;
            }
            console.log('Found target tanda', p)

            const tandaTracks = Array.from(p.querySelectorAll('track-element,  cortina-element'))
            const targetIdx = tandaTracks.indexOf(targetTrack)
            console.log('Using index', targetIdx)

            p.insertBefore(sourceTrack, tandaTracks[targetIdx]);
            sourceTrack.classList.remove('target')
            sourceTrack.classList.remove('selected')
            targetTrack.remove()
            playlistContainer.setTrackTargets(null, false)

            // Just in case it has changed, re-load the next track
            player.loadNext();

            // const temp = sourceTrack.outerHTML;
            // if ( targetTrack.getAttribute('title') !== 'place holder'){
            //     sourceTrack.remove()
            //     scratchPadContainer.appendChild(targetTrack)
            // }
            // targetTrack.outerHTML = temp;

            // const trackList = Array.from(playlistContainer.querySelectorAll('track-element')); // Get all tandas in the playlist
            // const index1 = trackList.indexOf(targetTrack); // Find the index of the target track

            // const scratchTracks = Array.from(scratchPadContainer.querySelectorAll('track-element | cortina-element')); // Get all tandas in the playlist
            // const index2 = scratchTracks.indexOf(sourceTrack)

            // if (index1 === -1 || index2 === -1) {
            //     console.error('Tracks not found in playlist/scratch pad');
            //     return;
            // }

            // // Insert the first tanda at the position of the second tanda
            // this.insertTandaAtIndex(tanda1, index2);

            // // Insert the second tanda at the position of the first tanda
            // this.insertTandaAtIndex(tanda2, index1);
        })

        playlistContainer.addEventListener('clickedTrack', async (event) => {
            try {
                console.log('Playlist detected clicked on tanda track', event.detail)
                if (!player.isPlaying) {
                    const tracks = Array.from(playlistContainer.querySelectorAll('track-element, cortina-element')).filter(track => track.getAttribute('trackid'))
                    let N = 0
                    for (let i = 0; i < tracks.length; i++) {
                        if (tracks[i] === event.detail) {
                            N = i;
                            console.log('Clicked on track N ', N)
                        }
                    }
                    console.log('Nothing playing at the moment')
                    await player.updatePosition(N - 1);
                    if (player.next) {
                        player.next.silence = 0;
                    }
                    player.startNext();
                    stopButton.classList.add('active')
                }
            } catch (error) {
                console.error(error)
                alert(error)
            }
        })

        // Create a dummy playlist

        let tandaStyleSequence = document.querySelector('#tandaStyleSequence')?.value;
        if (!tandaStyleSequence) {
            tandaStyleSequence = config.defaultTandaStyleSequence;
        }
        let sequenceHTML = '';
        for (let tandaStyle of tandaStyleSequence.split(/ |,|-/g)) {
            const quantity = parseInt(tandaStyle);
            const styleLetter = tandaStyle.substring(String(quantity).length);
            console.log('Tanda Style: Number: ', quantity, 'Style', styleLetter)
            const tanda = {
                style: styleLetter,
                size: quantity,
                cortina: [],
                name: 'Place holder ' + styleLetter,
                tracks: Array(quantity).fill('')
            }
            sequenceHTML += await renderTanda(tanda)
        }
        console.log(sequenceHTML)
        playlistContainer.innerHTML = sequenceHTML;
        player.updatePosition(-1)

        async function renderTanda(tanda) {

            console.log(tanda)

            let tandaHTML = '';

            let cortinaTrackName = tanda.cortina?.[0]?.track
            let track;
            if (cortinaTrackName) {
                try {
                    console.log('tanda cortina', tanda, cortinaTrackName)
                    track = await dbManager.getDataByName('cortina', '/' + cortinaTrackName);
                    if (!track) throw new Error('missing')
                } catch (error) {
                    // console.error(error)
                    track = await dbManager.getDataById('cortina', 1);
                }
                console.log(cortinaTrackName, track)
                tandaHTML += `<cortina-element trackId="${track.id}" 
          title="${track.metadata?.tags?.title || track.name}" 
          artist="${track.metadata?.tags?.artist || 'unknown'}" 
          duration="${to_time(track.metadata?.duration * 1000)}"></cortina-element>`
            }

            for (let trackName of tanda.tracks) {
                const track = await dbManager.getDataByName('track', trackName)
                if (track) {
                    tandaHTML += renderTrack(track)
                } else {
                    tandaHTML += `<track-element title="place holder" style="${tanda.style}"></track-element>`
                }

            }

            return `<tanda-element style="${tanda.style}" size="${tanda.size}">${tandaHTML}</tanda-element>`


        }

        // dbManager.processEntriesInBatches('tanda', (record) => {
        //   return true;
        // }).then(async (tandas) => {

        //   let html = '';
        //   for (let tanda of tandas) {
        //     html += renderTanda(tanda)
        //   }
        //   playlistContainer.innerHTML = html
        // })

        // playlistContainer.innerHTML = `<tanda-element><track-element title="hello there"></track-element></tanda-element>`


        function renderTrack(track) {
            console.log(track)
            return `<track-element 
        trackId="${track.id}"
        title="${track.metadata?.tags?.title || track.name}" 
        artist="${track.metadata?.tags?.artist || 'unknown'}" 
        style="${track.metadata?.style}"
        duration="${to_time(track.metadata?.duration * 1000)}" 
        year="${track.metadata?.tags?.date?.substring(0, 10) || 'unknown'}">
      </track-element>`
        }


        const h = document.querySelector('h1')
        let now;
        async function reportProgress(data) {
            if (!now) now = new Date().getTime();
            h.textContent = data.display// + `    Elapsed from start: ${to_time(new Date().getTime() - now)}`
        }

        // let tempoControl = document.querySelector('#tempo')



        // Need to work out what is currently playing and what should come next.
        // The what came before determines pre-cortina silences
        // If new element is the same type as the last one, add normal inter-song silences
        // if old was track and new is cortina then add pre-cortina
        // if new is track and old is cortina then add post-cortina
        async function nextTrack(N) {

            try {

                const timings = {
                    playlistPreCortina: 3,
                    playlistPostCortina: 3,
                    playlistInterSong: 2,
                    playlistCortinaDuration: 14
                }

                // tempoControl.value = 1;

                // Find Nth track in playlist
                const tracks = Array.from(playlistContainer.querySelectorAll('track-element, cortina-element')).filter(track => track.getAttribute('trackid'))
                if (N < tracks.length) {
                    let track = tracks[N]
                    let previous = tracks[N - 1]

                    if (previous && previous.tagName == 'CORTINA-ELEMENT' && track.tagName == 'TRACK-ELEMENT') {
                        return {
                            track: await dbManager.getDataById('track', parseInt(track.getAttribute('trackid'))),
                            silence: timings.playlistPostCortina
                        }
                    }

                    // If next is a cortina, modify the playing time
                    if (previous && previous.tagName == 'TRACK-ELEMENT' && track.tagName == 'CORTINA-ELEMENT') {
                        let trackData = await dbManager.getDataById('cortina', parseInt(track.getAttribute('trackid')));
                        trackData.metadata.end = timings.playlistCortinaDuration
                        return {
                            track: trackData,
                            silence: timings.playlistPreCortina
                        }
                    }

                    return {
                        track: await dbManager.getDataById(track.tagName == 'TRACK-ELEMENT' ? 'track' : 'cortina', parseInt(track.getAttribute('trackid'))),
                        silence: timings.playlistInterSong
                    }
                } else {
                    return { track: null, silence: null }
                }
            } catch (error) {
                // console.error(error)
                console.log('Continuing after error')
                player.updatePosition(N);
            }
        }

        function playing(N) {
            playlistContainer.playing(N)
        }

        // Assume an output device has been selected



        // tempoControl.addEventListener('input', ()=>{
        //   player.setTempo(tempoControl.value)
        // })

        // let tempoReset = document.querySelector('#tempoReset')
        // tempoReset.addEventListener('click', ()=>{
        //   tempoControl.value = 1;
        //   player.setTempo(1)
        // })

        // let volumeControl = document.querySelector('#volume')
        // volumeControl.addEventListener('input', ()=>{
        //   player.volume(volumeControl.value)
        // })


        // await player.updatePosition(1);
        // player.startNext();

        const stopButton = document.querySelector('#stopButton')
        stopButton.classList.add('active')
        stopButton.addEventListener('click', () => {
            stopButton.classList.remove('active');
            player.stop();
        })


        window.addEventListener('beforeunload', function (event) {
            // Set the returnValue property of the event to a custom message.
            // Modern browsers display a standard message that cannot be customized due to security reasons,
            // but setting returnValue is still necessary to trigger the dialog.
            event.returnValue = 'Are you sure you want to leave?';
        });

    }

});

