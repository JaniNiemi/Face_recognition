const video = document.getElementById("video");
const loadingEl = document.getElementById('loader');
const inputsContainer = document.getElementsByClassName('inputs-container');
const canvas = document.getElementById('canvas');

const landmarksInput = document.getElementById('landmarks-check');
const expressionsInput = document.getElementById('expressions-check');

const startVideo = async () => {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        error => console.error(error),
    );
}

const start = async () => {
    loadingEl.style.display = 'block';
    inputsContainer[0].style.display = 'none';
    landmarksInput.checked = false;
    expressionsInput.checked = true;

    await faceapi.loadSsdMobilenetv1Model('./models');
    await faceapi.loadTinyFaceDetectorModel('./models');
    await faceapi.loadMtcnnModel('./models');
    await faceapi.loadFaceLandmarkModel('./models');
    await faceapi.loadFaceLandmarkTinyModel('./models');
    await faceapi.loadFaceRecognitionModel('./models');
    await faceapi.loadFaceExpressionModel('./models');

    loadingEl.style.display = 'none';
    inputsContainer[0].style.display = 'flex';

    startVideo();
};
start();

let displaySize = {};
video.addEventListener('play', async () => {
    let stream = await navigator.mediaDevices.getUserMedia({ video: { } });
    let streamSettings = stream.getVideoTracks()[0].getSettings();
    // actual width & height of the camera video
    let streamWidth = streamSettings.width;
    let streamHeight = streamSettings.height;
    video.width = streamWidth;
    video.height = streamHeight;

    faceapi.matchDimensions(canvas, video);
    document.body.append(canvas);

    displaySize = { width: streamWidth, height: streamHeight };
    faceapi.matchDimensions(canvas, displaySize);

    drawStuff();
});

const drawStuff = async () => {
    const showLandmarks = landmarksInput.checked;
    const showExpressions = expressionsInput.checked;
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })).withFaceLandmarks().withFaceExpressions();
    // console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    showLandmarks && faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    showExpressions && faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    setTimeout(() => {
        drawStuff();
    }, 50);
}
