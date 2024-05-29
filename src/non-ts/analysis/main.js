const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

function cosineSimilarity(a, b) {
    const dotProduct = tf.dot(a, b).arraySync();
    const magnitudeA = tf.norm(a).arraySync();
    const magnitudeB = tf.norm(b).arraySync();
    return dotProduct / (magnitudeA * magnitudeB);
}

function findSimilarSongs(targetFeatures, allFeatures) {
    const similarities = allFeatures.map(features => cosineSimilarity(targetFeatures, features));
    return similarities
        .map((similarity, index) => ({ index, similarity }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 4);
}

let allFeatures = [];

document.getElementById('audio-file').addEventListener('change', processAudio);

async function processAudio() {
    const fileInput = document.getElementById('audio-file');
    const file = fileInput.files[0];
    
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(file));
    await ffmpeg.run('-i', 'input.mp3', 'output.wav');
    const data = ffmpeg.FS('readFile', 'output.wav');
    
    const audioBuffer = new Uint8Array(data.buffer);
    const features = await analyzeAudio(audioBuffer);
    allFeatures.push(features);
    
    if (allFeatures.length > 1) {
        const targetFeatures = allFeatures[allFeatures.length - 1];
        const similarSongs = findSimilarSongs(targetFeatures, allFeatures.slice(0, -1));
        document.getElementById('output').innerText = JSON.stringify(similarSongs);
    }
}

async function analyzeAudio(audioBuffer) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioData = await audioCtx.decodeAudioData(audioBuffer.buffer);
    const mfccs = await extractMfcc(audioData);
    
    return mfccs;
}

async function extractMfcc(audioData) {
    const mfcc = tf.tidy(() => {
        const audioTensor = tf.tensor1d(audioData.getChannelData(0));
        const normalized = audioTensor.div(tf.max(tf.abs(audioTensor)));
        return tf.signal.mfcc(normalized, {
            sampleRate: audioData.sampleRate,
            frameLength: 1024,
            frameStep: 256,
            numMfccs: 13
        });
    });
    return mfcc.arraySync();
}

