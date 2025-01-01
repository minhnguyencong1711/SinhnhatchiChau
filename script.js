document.addEventListener('DOMContentLoaded', () => {
    const blowButton = document.getElementById('blow-button');
    const candle = document.querySelector('.candle');
    const cakeContainer = document.getElementById('cake-container');
    const fireworksCanvas = document.getElementById('fireworks');
    const ctx = fireworksCanvas.getContext('2d');
    const birthdayMessageContainer = document.getElementById('birthday-message-container');

    let audioContext;
    let analyser;
    let dataArray;
    let animationId;
    let isListening = false;

    blowButton.addEventListener('click', startListening);

    function startListening() {
        if (isListening) return;
        isListening = true;
        blowButton.textContent = 'Đang lắng nghe...';

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                checkAudioLevel();
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập và thử lại.');
                isListening = false;
                blowButton.textContent = 'Thổi nến';
            });
    }

    function checkAudioLevel() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        console.log('Mức âm thanh hiện tại:', average);

        if (average > 100) {
            blowOutCandle();
        } else if (isListening) {
            animationId = requestAnimationFrame(checkAudioLevel);
        }
    }

    function blowOutCandle() {
        cancelAnimationFrame(animationId);
        isListening = false;
        candle.classList.add('blown');
        blowButton.style.display = 'none';
        setTimeout(() => {
            cakeContainer.style.display = 'none';
            startFireworks();
        }, 2000);
    }

    function startFireworks() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let particles = [];
        birthdayMessageContainer.style.display = 'block';

        function createFirework(x, y) {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(x, y));
            }
        }

        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.size <= 0.1) {
                    particles.splice(index, 1);
                }
            });

            if (Math.random() < 0.05) {
                createFirework(Math.random() * fireworksCanvas.width, Math.random() * fireworksCanvas.height);
            }

            requestAnimationFrame(animate);
        }

        animate();
    }
});
