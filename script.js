// script.js
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('audioCanvas');
    const ctx = canvas.getContext('2d');

    let audioContext = null;
    let analyser = null;
    let microphone = null;
    let dataArray = null;
    let animationFrameId = null;

    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    startButton.addEventListener('click', startAudioVisualization);
    stopButton.addEventListener('click', stopAudioVisualization);

    // Function to start audio visualization
    function startAudioVisualization() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                startButton.disabled = true;
                stopButton.disabled = false;

                // Visualization loop
                function draw() {
                    analyser.getByteFrequencyData(dataArray);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const barWidth = canvas.width / bufferLength;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = dataArray[i] / 2;
                        ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }

                    animationFrameId = requestAnimationFrame(draw);
                }

                draw();
            })
            .catch(function (err) {
                console.error('Error accessing microphone:', err);
            });
    }

    // Function to stop audio visualization
    function stopAudioVisualization() {
        if (audioContext) {
            audioContext.close().then(function () {
                cancelAnimationFrame(animationFrameId);
                startButton.disabled = false;
                stopButton.disabled = true;
            });
        }
    }
});
