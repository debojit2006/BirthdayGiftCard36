document.addEventListener('DOMContentLoaded', () => {

    // --- Global State and Scene Management ---
    const scenes = {
        catchButton: document.getElementById('catch-button-game'),
        letter: document.getElementById('letter-modal'),
        constellation: document.getElementById('constellation-game'),
        wishingJar: document.getElementById('wishing-jar-scene'),
        paintSky: document.getElementById('paint-sky-scene'),
        navigation: document.getElementById('project-navigation'),
        ballGame: document.getElementById('ball-game-container'),
        garden: document.getElementById('garden-container'),
    };

    let currentScene = 'catchButton';
    let activeAnimationId = null; // Used to control animation loops

    function showScene(sceneName) {
        // 1. Stop any currently running animation loop
        if (activeAnimationId) {
            cancelAnimationFrame(activeAnimationId);
            activeAnimationId = null;
        }

        // 2. Fade out the old scene
        const oldSceneEl = scenes[currentScene];
        if (oldSceneEl) {
            oldSceneEl.classList.add('fade-out');
            setTimeout(() => {
                oldSceneEl.classList.add('hidden');
                oldSceneEl.classList.remove('fade-out');
            }, 500); // Match CSS transition time
        }

        // 3. Fade in the new scene
        const newSceneEl = scenes[sceneName];
        if (newSceneEl) {
            setTimeout(() => {
                newSceneEl.classList.remove('hidden');
                currentScene = sceneName;
                // 4. Initialize the new scene if it has special logic
                if (sceneInitializers[sceneName]) {
                    sceneInitializers[sceneName]();
                }
            }, 500);
        }
    }

    // --- Scene 1: Catch the Button ---
    const catchButton = document.getElementById('catch-button');
    let tapCount = 0;
    const tapsNeeded = Math.floor(Math.random() * 3) + 5; // 5 to 7 taps
    catchButton.addEventListener('click', () => {
        tapCount++;
        if (tapCount >= tapsNeeded) {
            showScene('letter');
        } else {
            const gameArea = scenes.catchButton;
            const btnWidth = catchButton.offsetWidth;
            const btnHeight = catchButton.offsetHeight;
            catchButton.style.top = `${Math.random() * (gameArea.clientHeight - btnHeight)}px`;
            catchButton.style.left = `${Math.random() * (gameArea.clientWidth - btnWidth)}px`;
            catchButton.style.transform = `translate(0, 0)`;
        }
    });

    // --- Scene 2: Letter Modal ---
    document.getElementById('close-letter').addEventListener('click', () => showScene('constellation'));

    // --- Scene 3: Constellation Puzzle ---
    const constellationGame = scenes.constellation;
    const drawingCanvas = document.getElementById('drawing-canvas');
    const drawingCtx = drawingCanvas.getContext('2d');
    const bgCanvas = document.getElementById('constellation-bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    const messageEl = document.getElementById('constellation-message');
    const nextBtnConstellation = document.getElementById('next-from-constellation');
    
    function initConstellationGame() {
        let stars = [];
        let clickedStars = [];
        const correctOrder = [2, 0, 3, 1];
        let decorativeStars = [];

        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        drawingCanvas.width = window.innerWidth;
        drawingCanvas.height = window.innerHeight;

        for (let i = 0; i < 150; i++) {
            decorativeStars.push({
                x: Math.random() * bgCanvas.width,
                y: Math.random() * bgCanvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random()
            });
        }
        
        constellationGame.querySelectorAll('.star').forEach(el => el.remove());
        messageEl.style.opacity = '0';
        nextBtnConstellation.classList.add('hidden');
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        const starPositions = [
            { top: '30%', left: '70%' }, { top: '75%', left: '60%' },
            { top: '25%', left: '20%' }, { top: '60%', left: '30%' },
        ];

        starPositions.forEach((pos, i) => {
            const starEl = document.createElement('div');
            starEl.className = 'star';
            starEl.style.top = pos.top;
            starEl.style.left = pos.left;
            starEl.dataset.id = i;
            constellationGame.appendChild(starEl);
            stars.push(starEl);
            starEl.onclick = (e) => handleStarClick(e, stars, clickedStars, correctOrder);
        });

        function handleStarClick(e, allStars, currentClicked, correctOrd) {
            const star = e.target;
            if (currentClicked.includes(star)) return;

            const lastStar = currentClicked[currentClicked.length - 1];
            currentClicked.push(star);
            star.style.transform = 'scale(1.5)';

            drawingCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            drawingCtx.lineWidth = 3;
            drawingCtx.shadowBlur = 10;
            drawingCtx.shadowColor = '#fff';

            if (lastStar) {
                drawingCtx.beginPath();
                drawingCtx.moveTo(lastStar.offsetLeft + 10, lastStar.offsetTop + 10);
                drawingCtx.lineTo(star.offsetLeft + 10, star.offsetTop + 10);
                drawingCtx.stroke();
            }

            const clickedOrder = currentClicked.map(s => parseInt(s.dataset.id));
            for (let i = 0; i < clickedOrder.length; i++) {
                if (clickedOrder[i] !== correctOrd[i]) {
                    setTimeout(() => {
                        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                        currentClicked.forEach(s => s.style.transform = 'scale(1)');
                        currentClicked.length = 0; // Reset array
                    }, 800);
                    return;
                }
            }

            if (clickedOrder.length === correctOrd.length) {
                messageEl.innerHTML = "You have a kind of beauty that isn’t just in the way you look...";
                messageEl.style.opacity = '1';
                nextBtnConstellation.classList.remove('hidden');
            }
        }

        function animateConstellationBg() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.fillStyle = 'white';
            decorativeStars.forEach(star => {
                star.alpha += (Math.random() - 0.5) * 0.1;
                if (star.alpha < 0) star.alpha = 0;
                if (star.alpha > 1) star.alpha = 1;
                bgCtx.globalAlpha = star.alpha;
                bgCtx.beginPath();
                bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                bgCtx.fill();
            });
            activeAnimationId = requestAnimationFrame(animateConstellationBg);
        }
        animateConstellationBg();
    }
    nextBtnConstellation.addEventListener('click', () => showScene('wishingJar'));

    // --- Scene 4: Wishing Jar ---
    const wishInput = document.getElementById('wish-input');
    const submitWishBtn = document.getElementById('submit-wish');
    const jarContainer = document.getElementById('jar-container');
    const nextFromWishBtn = document.getElementById('next-from-wish');
    submitWishBtn.addEventListener('click', () => {
        if (wishInput.value.trim() === '') return;
        const orb = document.createElement('div');
        orb.className = 'wish-orb';
        orb.style.top = '-30px';
        orb.style.left = `${Math.random() * 80 + 10}%`;
        jarContainer.appendChild(orb);
        setTimeout(() => {
            orb.style.top = `${Math.random() * 30 + 60}%`;
            orb.style.left = `${Math.random() * 60 + 20}%`;
        }, 100);
        wishInput.value = '';
        nextFromWishBtn.classList.remove('hidden');
    });
    nextFromWishBtn.addEventListener('click', () => showScene('paintSky'));

    // --- Scene 5: Paint Our Sky ---
    function initPaintSky() {
        const skyCanvas = document.getElementById('sky-canvas');
        const skyCtx = skyCanvas.getContext('2d');
        const instructionEl = document.getElementById('paint-sky-instruction');
        const finalMessageEl = document.getElementById('paint-sky-message');
        const finishPaintingBtn = document.getElementById('finish-painting');
        let isPainting = false;
        let particles = [];
        let hasShownFinalMessage = false;

        skyCanvas.width = window.innerWidth;
        skyCanvas.height = window.innerHeight;
        skyCtx.fillStyle = '#000';
        skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
        
        finalMessageEl.classList.add('hidden');
        finishPaintingBtn.classList.add('hidden');
        instructionEl.style.opacity = '1';

        const getCoords = (e) => e.touches?.[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        const start = (e) => { e.preventDefault(); isPainting = true; instructionEl.style.opacity = '0'; move(e); };
        const stop = () => { isPainting = false; };
        const move = (e) => {
            if (!isPainting) return;
            e.preventDefault();
            const coords = getCoords(e);
            for (let i = 0; i < 5; i++) particles.push(new Particle(coords.x, coords.y));
            if (particles.length > 200 && !hasShownFinalMessage) {
                finalMessageEl.classList.remove('hidden');
                finishPaintingBtn.classList.remove('hidden');
                hasShownFinalMessage = true;
            }
        };

        skyCanvas.addEventListener('mousedown', start);
        skyCanvas.addEventListener('mouseup', stop);
        skyCanvas.addEventListener('mousemove', move);
        skyCanvas.addEventListener('touchstart', start, { passive: false });
        skyCanvas.addEventListener('touchend', stop);
        skyCanvas.addEventListener('touchmove', move, { passive: false });

        class Particle {
            constructor(x, y) { this.x = x + (Math.random() - 0.5) * 40; this.y = y + (Math.random() - 0.5) * 40; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.size = Math.random() * 2 + 1; this.alpha = 1; const c = ['#ff79c6', '#bd93f9', '#8be9fd', '#f1fa8c']; this.color = c[Math.floor(Math.random() * c.length)]; }
            update() { this.x += this.vx; this.y += this.vy; this.alpha -= 0.02; }
            draw() { skyCtx.globalAlpha = this.alpha; skyCtx.fillStyle = this.color; skyCtx.beginPath(); skyCtx.arc(this.x, this.y, this.size, 0, 2 * Math.PI); skyCtx.fill(); }
        }

        function animateSky() {
            skyCtx.globalAlpha = 0.1; skyCtx.fillStyle = '#000'; skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update(); particles[i].draw();
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }
            activeAnimationId = requestAnimationFrame(animateSky);
        }
        animateSky();
    }
    finishPaintingBtn.addEventListener('click', () => showScene('navigation'));

    // --- Project 2: Bouncing Ball Game ---
    function initBallGame() {
        const gameCanvas = document.getElementById('game-canvas');
        const gameCtx = gameCanvas.getContext('2d');
        let ball, paddle, score = 0, gameOver = false;
        
        document.getElementById('back-to-nav-from-game').classList.add('hidden');
        paddle = { x: gameCanvas.width / 2 - 40, y: gameCanvas.height - 20, width: 80, height: 10, color: '#2c3e50' };
        ball = { x: gameCanvas.width / 2, y: gameCanvas.height / 2, radius: 8, dx: 2, dy: -2, color: '#e74c3c' };
        
        const movePaddle = (e) => { e.preventDefault(); const r = gameCanvas.getBoundingClientRect(); let x = e.clientX || e.touches[0].clientX; paddle.x = x - r.left - paddle.width / 2; if (paddle.x < 0) paddle.x = 0; if (paddle.x + paddle.width > gameCanvas.width) paddle.x = gameCanvas.width - paddle.width; };
        gameCanvas.addEventListener('mousemove', movePaddle);
        gameCanvas.addEventListener('touchmove', movePaddle, { passive: false });

        function gameLoop() {
            if (gameOver) {
                gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
                gameCtx.font = '30px Playfair Display'; gameCtx.fillStyle = '#e74c3c'; gameCtx.textAlign = 'center';
                gameCtx.fillText('Game Over', gameCanvas.width / 2, gameCanvas.height / 2 - 20);
                gameCtx.font = '20px Quicksand'; gameCtx.fillText(`Final Score: ${score}`, gameCanvas.width / 2, gameCanvas.height / 2 + 20);
                gameCtx.textAlign = 'start';
                document.getElementById('back-to-nav-from-game').classList.remove('hidden');
                return;
            }
            gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            gameCtx.beginPath(); gameCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); gameCtx.fillStyle = ball.color; gameCtx.fill(); gameCtx.closePath();
            gameCtx.beginPath(); gameCtx.rect(paddle.x, paddle.y, paddle.width, paddle.height); gameCtx.fillStyle = paddle.color; gameCtx.fill(); gameCtx.closePath();
            gameCtx.font = '16px Quicksand'; gameCtx.fillStyle = '#333'; gameCtx.fillText('Score: ' + score, 8, 20);

            ball.x += ball.dx; ball.y += ball.dy;
            if (ball.x + ball.radius > gameCanvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
            if (ball.y - ball.radius < 0) ball.dy *= -1;
            if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) { ball.dy *= -1; score++; }
            if (ball.y + ball.radius > gameCanvas.height) gameOver = true;
            
            activeAnimationId = requestAnimationFrame(gameLoop);
        }
        gameLoop();
    }

    // --- Project 3: Garden of Compliments ---
    function initGarden() {
        document.querySelectorAll('.flower').forEach(flower => {
            flower.onclick = () => flower.classList.toggle('bloom');
        });
    }

    // --- Navigation Buttons ---
    document.getElementById('show-game-btn').addEventListener('click', () => showScene('ballGame'));
    document.getElementById('show-garden-btn').addEventListener('click', () => showScene('garden'));
    document.getElementById('back-to-nav-from-game').addEventListener('click', () => showScene('navigation'));
    document.getElementById('back-to-nav-from-garden').addEventListener('click', () => showScene('navigation'));

    // --- Master Initializer ---
    const sceneInitializers = {
        constellation: initConstellationGame,
        paintSky: initPaintSky,
        ballGame: initBallGame,
        garden: initGarden,
    };

    // --- Start the Application ---
    showScene('catchButton');
});
