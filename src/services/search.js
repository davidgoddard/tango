import { DatabaseManager } from './database';

/*
The search panel offers a quick search text box and then tabs for tracks and tandas
Other tabs at the top level offer similar tabs but for other searches.

Therefore need a bunch of queries defined by callbacks that render the same way into a given tab.

*/

document.addEventListener('DOMContentLoaded', async function () {

    const dbManager = await DatabaseManager();

    async function generalSearch(filter) {
        const tracks = await dbManager.processEntriesInBatches('track', (track)=>{
            return ( 
                track.name.indexOf(filter.searchText) >0 ||
                track.metadata?.tags?.title?.indexOf(filter.searchText) >= 0 ||
                track.metadata?.tags?.artist?.indexOf(filter.searchText) >= 0 ||
                track.metadata?.tags?.year?.indexOf(filter.searchText) >= 0
            )
        })

        const files = new Set(tracks?.map(track => track.name));

        // See which tandas feature any of these tracks

        const tandas = await dbManager.processEntriesInBatches('tanda', (tanda)=>{
            return tanda.tracks.find(trackName => files.has(trackName))
        });
        
        return { tracks, tandas };
    }
    function favouritesSearch(filter) {
        const results = filter((track)=>{}, (tanda)=>{});
        return results;
    }

    const searches = document.querySelectorAll('search-element')

    for (const search of searches) {
        search.addEventListener('search', async (event) => {
            switch (search.id) {
                case 'generalSearch':
                    search.results(await generalSearch(event.detail));
                    break;
                case 'favouritesSearch':
                    search.results(await favouritesSearch(event.detail));
                    break;
                default:
                    console.log('Unknown search filter')
            }
        })
    }

})


let headers = document.querySelectorAll('.tanda-tracks-choice > .tab-headers > .tab-header');
let contents = document.querySelectorAll('.tanda-tracks-choice > .tab-contents > .tab-content');

headers.forEach(header => {
    const localHeaders = headers;
    const localContents = contents;
    header.addEventListener('click', function () {
        const targetId = this.getAttribute('data-tab');

        // Remove active class from all headers and contents
        localHeaders.forEach(h => h.classList.remove('active'));
        localContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked header and corresponding content
        this.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});

headers = document.querySelectorAll('.pre-defined-search-choice > .tab-headers > .tab-header');
contents = document.querySelectorAll('.pre-defined-search-choice > .tab-contents > .tab-content');

headers.forEach(header => {
    const localHeaders = headers;
    const localContents = contents;
    header.addEventListener('click', function () {
        const targetId = this.getAttribute('data-tab');

        // Remove active class from all headers and contents
        localHeaders.forEach(h => h.classList.remove('active'));
        localContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked header and corresponding content
        this.classList.add('active');
        const target = document.getElementById(targetId)
        target.classList.add('active');
        target.querySelector('search-element').focus();
    });
});

// document.addEventListener('DOMContentLoaded', async function () {

//   const dbManager = await DatabaseManager();


//   const searchText = document.querySelector('#search');
//   const tandaResults = document.querySelector('#tanda-results');
//   const trackResults = document.querySelector('#track-results');
//   const tandasCount = document.querySelector('#tandas-count');
//   const tracksCount = document.querySelector('#tracks-count');
//   console.log('About to set up search')
//   searchText.addEventListener('change', async () => {
//     console.log(searchText.value)

//     // Clear results
//     tandaResults.innerHTML = '';
//     trackResults.innerHTML = '';

//     // Get track results
//     dbManager.processEntriesInBatches('track', (record) => {
//       return true;
//     }).then((tracks) => {
//       tracksCount.textContent = tracks.length;
//       trackResults.innerHTML = tracks.map((result) => {
//         return `<file-display data-file='{
// "summary": {"name": "${result.relativeFileName}", "size": "14KB"},
// "details": {"type": "Text File", "created": "2023-01-01"}
// }'></file-display>`
//       }).join('')
//     })

//     // Get tanda results
//     dbManager.processEntriesInBatches('tanda', (record) => {
//       return true;
//     }).then((tandas) => {
//       tandasCount.textContent = tandas.length
//       trackResults.innerHTML = tandas.map((result) => {
//         return `<file-display data-file='{
// "summary": {"name": "${result.relativeFileName}", "size": "14KB"},
// "details": {"type": "Text File", "created": "2023-01-01"}
// }'></file-display>`
//       }).join('')
//     })

//   })

//   const favouriteTracks = document.querySelector('#favourites-track-results');
//   const favouriteTandas = document.querySelector('#favourites-tandas-results');
//   const favouriteTandasCount = document.querySelector('#favourites-tandas-count');
//   const favouriteTracksCount = document.querySelector('#favourites-tracks-count');



// });