let model;

async function loadModel() {
    model = await tf.loadGraphModel('path/to/musicnn/model.json');
}

async function processAudio() {
    const fileInput = document.getElementById('audio-file');
    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const inputTensor = tf.tensor(channelData).reshape([1, -1]);
    
    const predictions = model.predict(inputTensor);
    const scores = predictions.arraySync()[0];
    
    displayResults(scores);
}

function displayResults(scores) {
    const output = document.getElementById('output');
    output.textContent = JSON.stringify(scores, null, 2);
}

loadModel();
