/**
 * Score Cekih by Sadewa Corp
 * Pure Native JS Framework-less PWA Module Engine
 */

// Application Core State Storage Architecture
let DEFAULT_GAME_STATE = {
    currentRound: 1,
    currentMatchIndex: 1,
    victoryTarget: 1000,
    activePlayers: {
        A: { name: 'Pemain A', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        B: { name: 'Pemain B', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        C: { name: 'Pemain C', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        D: { name: 'Pemain D', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 }
    },
    historyLog: [],       
    permanentRegistry: {} 
};

let gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));

// UI Speech Queue System Management Engine
const audioSpeechQueue = {
    queue: [],
    isSpeaking: false,
    
    addToQueue(type, payload) {
        this.queue.push({ type, payload });
        this.processQueue();
    },
    
    processQueue() {
        if (this.isSpeaking || this.queue.length === 0) return;
        this.isSpeaking = true;
        const currentItem = this.queue.shift();
        
        if (currentItem.type === 'audio') {
            this.executeAudioTrack(currentItem.payload);
        } else if (currentItem.type === 'tts') {
            this.executeSpeechSynthesis(currentItem.payload);
        }
    },
    
    executeAudioTrack(src) {
        const audio = new Audio(src);
        audio.onended = () => {
            this.isSpeaking = false;
            this.processQueue();
        };
        audio.onerror = () => {
            this.isSpeaking = false;
            this.processQueue();
        };
        audio.play().catch(err => {
            this.isSpeaking = false;
            this.processQueue();
        });
    },
    
    executeSpeechSynthesis(text) {
        if (!('speechSynthesis' in window)) {
            this.isSpeaking = false;
            this.processQueue();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.processQueue();
        };
        utterance.onerror = () => {
            this.isSpeaking = false;
            this.processQueue();
        };
        
        window.speechSynthesis.speak(utterance);
    }
};

// Pure Component Initializer Lifecycle Methods
document.addEventListener("DOMContentLoaded", () => {
    runApplicationLoadingScreen();
    initializeInterfaceThemeSettings();
    bindUserInterfaceEventHandling();
    injectFloatingResetButton(); // Memastikan tombol reset mengambang disuntikkan ke HTML
});

// App Splash Loading Engine Orchestrator
function runApplicationLoadingScreen() {
    const loadingBar = document.getElementById("loading-bar");
    const loadingScreen = document.getElementById("loading-screen");
    
    let progressVal = 0;
    const intervalTime = 20; 
    const stepIncrement = 2;
    
    const loadingTimer = setInterval(() => {
        progressVal += stepIncrement;
        if (progressVal > 100) progressVal = 100;
        
        if (loadingBar) {
            loadingBar.style.width = `${progressVal}%`;
        }
        
        if (progressVal >= 100) {
            clearInterval(loadingTimer);
            loadSystemDataFromLocalStorage();
            setTimeout(() => {
                loadingScreen.classList.add("fade-out");
            }, 300);
        }
    }, intervalTime);
}

// Data Serialization Engine Architecture
function saveSystemDataToLocalStorage() {
    localStorage.setItem("SADEWA_CEKIH_STATE", JSON.stringify(gameState));
}

function loadSystemDataFromLocalStorage() {
    const serializedData = localStorage.getItem("SADEWA_CEKIH_STATE");
    if (serializedData) {
        try {
            const parsedData = JSON.parse(serializedData);
            if (parsedData && parsedData.activePlayers) {
                gameState = parsedData;
                syncStateDataToActiveInterface();
            }
        } catch (e) {
            console.error("Local Storage configuration state parse discrepancy detected:", e);
        }
    }
}

// Menambahkan Tombol Reset Mengambang (Floating Action Button) secara dinamis agar selalu terlihat
function injectFloatingResetButton() {
    if (document.getElementById("btn-floating-reset")) return;
    
    const fab = document.createElement("button");
    fab.id = "btn-floating-reset";
    fab.className = "fab-reset";
    fab.innerHTML = "🔄";
    fab.title = "Reset Semua Data Aplikasi";
    
    fab.addEventListener("click", executeFullApplicationWipeReset);
    document.body.appendChild(fab);
}

// Reset Full Application Action Subsystem
function executeFullApplicationWipeReset() {
    if (confirm("PERINGATAN: Apakah Anda benar-benar yakin ingin menghapus seluruh data aplikasi? Tindakan ini akan mengosongkan semua Ronde, Skor, History, Achievement, dan seluruh Arsip Permanen Statistik Pemain secara permanen!")) {
        // Hentikan TTS yang sedang berjalan agar tidak mengacaukan reset
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        localStorage.removeItem("SADEWA_CEKIH_STATE");
        gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        
        document.getElementById("player-a-name").value = "Pemain A";
        document.getElementById("player-b-name").value = "Pemain B";
        document.getElementById("player-c-name").value = "Pemain C";
        document.getElementById("player-d-name").value = "Pemain D";
        
        document.querySelectorAll(".btn-target").forEach(b => b.classList.remove("active"));
        const defaultTargetBtn = document.querySelector(".btn-target[data-value='1000']");
        if (defaultTargetBtn) defaultTargetBtn.classList.add("add");
        document.getElementById("input-target-custom").value = "";
        
        const keys = ['A', 'B', 'C', 'D'];
        keys.forEach(k => {
            document.getElementById(`input-score-${k}`).value = "";
        });

        saveSystemDataToLocalStorage();
        refreshLiveGameStatsDashboard();
        transitionViewRouterMode("setup-screen");
        alert("Semua data aplikasi berhasil dibersihkan kembali ke pengaturan awal.");
    }
}

// Synchronization Layer Infrastructure
function syncStateDataToActiveInterface() {
    if (gameState.historyLog && gameState.historyLog.length > 0) {
        transitionViewRouterMode("game-screen");
    } else {
        transitionViewRouterMode("setup-screen");
    }
    
    const targetCustomInput = document.getElementById("input-target-custom");
    const targetButtons = document.querySelectorAll(".btn-target");
    let isPresetFound = false;
    
    targetButtons.forEach(btn => {
        if (parseInt(btn.getAttribute("data-value")) === gameState.victoryTarget) {
            btn.classList.add("active");
            isPresetFound = true;
        } else {
            btn.classList.remove("active");
        }
    });
    
    if (!isPresetFound && targetCustomInput) {
        targetCustomInput.value = gameState.victoryTarget;
    }
    
    document.getElementById("player-a-name").value = gameState.activePlayers.A.name;
    document.getElementById("player-b-name").value = gameState.activePlayers.B.name;
    document.getElementById("player-c-name").value = gameState.activePlayers.C.name;
    document.getElementById("player-d-name").value = gameState.activePlayers.D.name;
    
    refreshLiveGameStatsDashboard();
}

function transitionViewRouterMode(screenId) {
    document.querySelectorAll(".screen-content").forEach(screen => {
        screen.classList.remove("active");
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add("active");
}

// User Interface Events Binding Architecture
function bindUserInterfaceEventHandling() {
    document.getElementById("btn-theme").addEventListener("click", toggleThemeEngine);
    document.getElementById("btn-fullscreen").addEventListener("click", toggleFullscreenEngine);
    document.getElementById("btn-screenshot").addEventListener("click", triggerApplicationScreenshot);
    
    // Bind Application Reset lama (tetap aktif sebagai cadangan)
    if(document.getElementById("btn-reset-app-setup")) document.getElementById("btn-reset-app-setup").addEventListener("click", executeFullApplicationWipeReset);
    if(document.getElementById("btn-reset-app-game")) document.getElementById("btn-reset-app-game").addEventListener("click", executeFullApplicationWipeReset);
    
    document.querySelectorAll(".btn-target").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".btn-target").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            document.getElementById("input-target-custom").value = "";
            gameState.victoryTarget = parseInt(e.target.getAttribute("data-value"));
        });
    });
    
    document.getElementById("input-target-custom").addEventListener("input", (e) => {
        document.querySelectorAll(".btn-target").forEach(b => b.classList.remove("active"));
        if (e.target.value) {
            gameState.victoryTarget = parseInt(e.target.value) || 1000;
        }
    });

    document.getElementById("btn-start-game").addEventListener("click", executeMatchInitialSetup);
    document.getElementById("btn-save-puteran").addEventListener("click", processMatchTurnCalculations);
    document.getElementById("btn-change-ronde").addEventListener("click", triggerRoundResetConfiguration);
    
    document.getElementById("btn-edit-players").addEventListener("click", openNameModifierModal);
    document.getElementById("btn-cancel-edit").addEventListener("click", closeNameModifierModal);
    document.getElementById("btn-save-edit").addEventListener("click", commitNameModifierChanges);
    
    document.querySelectorAll(".tab-trigger").forEach(tabTrigger => {
        tabTrigger.addEventListener("click", (e) => {
            const container = e.target.closest(".tabs-container");
            container.querySelectorAll(".tab-trigger").forEach(t => t.classList.remove("active"));
            container.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            e.target.classList.add("active");
            const targetId = e.target.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });
    
    document.getElementById("history-ronde-filter").addEventListener("change", (e) => {
        renderFilteredHistoryLogs(parseInt(e.target.value) || 1);
    });
}

// User Interface Theme Management Subsystem
function initializeInterfaceThemeSettings() {
    const savedTheme = localStorage.getItem("SADEWA_CEKIH_THEME") || "dark";
    if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.getElementById("btn-theme").textContent = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.getElementById("btn-theme").textContent = "🌙";
    }
}

function toggleThemeEngine() {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.getElementById("btn-theme").textContent = "☀️";
        localStorage.setItem("SADEWA_CEKIH_THEME", "light");
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.getElementById("btn-theme").textContent = "🌙";
        localStorage.setItem("SADEWA_CEKIH_THEME", "dark");
    }
}

// Fullscreen Operations Framework Manager
function toggleFullscreenEngine() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Fullscreen error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function triggerApplicationScreenshot() {
    alert("Fitur Screenshot Premium: Silakan gunakan kombinasi tombol bawaan HP Anda (Power + Volume Bawah) untuk hasil tangkapan layar penuh.");
}

// Player Identity Mapping Modals Processing Engine
function openNameModifierModal() {
    document.getElementById("edit-name-A").value = gameState.activePlayers.A.name;
    document.getElementById("edit-name-B").value = gameState.activePlayers.B.name;
    document.getElementById("edit-name-C").value = gameState.activePlayers.C.name;
    document.getElementById("edit-name-D").value = gameState.activePlayers.D.name;
    
    document.getElementById("edit-name-modal").classList.add("active");
}

function closeNameModifierModal() {
    document.getElementById("edit-name-modal").classList.remove("active");
}

function commitNameModifierChanges() {
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const inputVal = document.getElementById(`edit-name-${k}`).value.trim();
        if (inputVal) {
            const oldName = gameState.activePlayers[k].name;
            if (oldName !== inputVal) {
                synchronizePermanentRegistryNode(oldName);
                gameState.activePlayers[k].name = inputVal;
                synchronizePermanentRegistryNode(inputVal);
            }
        }
    });
    
    saveSystemDataToLocalStorage();
    refreshLiveGameStatsDashboard();
    closeNameModifierModal();
}

// Game Core Initial Match Controller
function executeMatchInitialSetup() {
    const pA = document.getElementById("player-a-name").value.trim() || "Pemain A";
    const pB = document.getElementById("player-b-name").value.trim() || "Pemain B";
    const pC = document.getElementById("player-c-name").value.trim() || "Pemain C";
    const pD = document.getElementById("player-d-name").value.trim() || "Pemain D";
    
    gameState.activePlayers.A.name = pA;
    gameState.activePlayers.B.name = pB;
    gameState.activePlayers.C.name = pC;
    gameState.activePlayers.D.name = pD;
    
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        gameState.activePlayers[k].score = 0;
        gameState.activePlayers[k].stars = 0;
        gameState.activePlayers[k].currentRoundBurn = 0;
        gameState.activePlayers[k].currentRoundTriple = 0;
        synchronizePermanentRegistryNode(gameState.activePlayers[k].name);
    });
    
    gameState.currentMatchIndex = 1;
    
    saveSystemDataToLocalStorage();
    refreshLiveGameStatsDashboard();
    transitionViewRouterMode("game-screen");
}

function triggerRoundResetConfiguration() {
    if (confirm("Apakah Anda yakin ingin mengganti ronde? History data ronde saat ini tetap aman tersimpan di tab History.")) {
        gameState.currentRound += 1;
        gameState.currentMatchIndex = 1;
        
        const keys = ['A', 'B', 'C', 'D'];
        keys.forEach(k => {
            gameState.activePlayers[k].score = 0;
            gameState.activePlayers[k].stars = 0;
            gameState.activePlayers[k].currentRoundBurn = 0;
            gameState.activePlayers[k].currentRoundTriple = 0;
        });
        
        saveSystemDataToLocalStorage();
        refreshLiveGameStatsDashboard();
        transitionViewRouterMode("setup-screen");
    }
}

// Permanent Statistical Profile Integration Layer
function synchronizePermanentRegistryNode(playerName) {
    if (!gameState.permanentRegistry) {
        gameState.permanentRegistry = {};
    }
    if (!gameState.permanentRegistry[playerName]) {
        gameState.permanentRegistry[playerName] = {
            name: playerName,
            stars: 0,
            burns: 0,
            tripleBurn: 0
        };
    }
}

function updatePermanentRegistryMetrics(playerName, deltaStars, deltaBurns, deltaTriples) {
    synchronizePermanentRegistryNode(playerName);
    gameState.permanentRegistry[playerName].stars += deltaStars;
    gameState.permanentRegistry[playerName].burns += deltaBurns;
    gameState.permanentRegistry[playerName].tripleBurn += deltaTriples;
}

// Bahasa Indonesia Integer Linguistic Translation Parser Engine
function numberToBahasaIndonesia(num) {
    if (num === 0) return "nol";
    
    let result = "";
    let value = num;
    
    if (value < 0) {
        result += "minus ";
        value = Math.abs(value);
    }
    
    const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    
    if (value <= 11) {
        result += units[value];
    } else if (value < 20) {
        result += numberToBahasaIndonesia(value % 10) + " belas";
    } else if (value < 100) {
        result += units[Math.floor(value / 10)] + " puluh " + units[value % 10];
    } else if (value < 200) {
        result += "seratus " + numberToBahasaIndonesia(value % 100);
    } else if (value < 1000) {
        result += units[Math.floor(value / 100)] + " ratus " + numberToBahasaIndonesia(value % 100);
    } else if (value < 2000) {
        result += "seribu " + numberToBahasaIndonesia(value % 1000);
    } else if (value < 1000000) {
        result += numberToBahasaIndonesia(Math.floor(value / 1000)) + " ribu " + numberToBahasaIndonesia(value % 1000);
    } else {
        result += value.toString(); 
    }
    
    return result.trim().replace(/\s+/g, ' ');
}

// Core Game Scoring Matrix Engineering Subsystem
function processMatchTurnCalculations() {
    const keys = ['A', 'B', 'C', 'D'];
    const additionInputs = {};
    
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const rawInput = document.getElementById(`input-score-${k}`).value;
        let delta = parseInt(rawInput) || 0;
        
        if (delta > 1000) {
            alert(`Input skor untuk ${gameState.activePlayers[k].name} melebihi batas maksimal positif 1000 per puteran.`);
            return;
        }
        additionInputs[k] = delta;
    }
    
    const previousScoresSnapshot = {
        A: gameState.activePlayers.A.score,
        B: gameState.activePlayers.B.score,
        C: gameState.activePlayers.C.score,
        D: gameState.activePlayers.D.score
    };
    
    const postCalculationScores = {
        A: previousScoresSnapshot.A + additionInputs.A,
        B: previousScoresSnapshot.B + additionInputs.B,
        C: previousScoresSnapshot.C + additionInputs.C,
        D: previousScoresSnapshot.D + additionInputs.D
    };
    
    const victimsBurnedThisTurn = [];
    let perpetratorKey = null;
    let burnSystemTriggeredThisTurn = false;
    
    if (gameState.currentMatchIndex >= 2) {
        keys.forEach(pKey => {
            let directVictimsForThisPlayer = [];
            
            keys.forEach(oKey => {
                if (pKey === oKey) return;
                
                const conditionOne = previousScoresSnapshot[pKey] <= previousScoresSnapshot[oKey];
                const conditionTwo = postCalculationScores[pKey] > postCalculationScores[oKey];
                
                const isOpponentNotZero = previousScoresSnapshot[oKey] !== 0;
                
                if (conditionOne && conditionTwo && isOpponentNotZero) {
                    directVictimsForThisPlayer.push(oKey);
                }
            });
            
            if (directVictimsForThisPlayer.length > 0) {
                burnSystemTriggeredThisTurn = true;
                perpetratorKey = pKey; 
                directVictimsForThisPlayer.forEach(v => {
                    if (!victimsBurnedThisTurn.includes(v)) {
                        victimsBurnedThisTurn.push(v);
                    }
                });
            }
        });
    }
    
    if (burnSystemTriggeredThisTurn && victimsBurnedThisTurn.length > 0) {
        victimsBurnedThisTurn.forEach(vKey => {
            postCalculationScores[vKey] = 0;
            gameState.activePlayers[vKey].currentRoundBurn += 1;
            updatePermanentRegistryMetrics(gameState.activePlayers[vKey].name, 0, 1, 0);
        });
        
        if (victimsBurnedThisTurn.length === 3 && perpetratorKey) {
            gameState.activePlayers[perpetratorKey].currentRoundTriple += 1;
            updatePermanentRegistryMetrics(gameState.activePlayers[perpetratorKey].name, 0, 0, 1);
        }
    }
    
    keys.forEach(k => {
        gameState.activePlayers[k].score = postCalculationScores[k];
    });
    
    let starEarnerKey = null;
    keys.forEach(k => {
        if (gameState.activePlayers[k].score >= gameState.victoryTarget) {
            starEarnerKey = k;
        }
    });
    
    if (starEarnerKey) {
        gameState.activePlayers[starEarnerKey].stars += 1;
        updatePermanentRegistryMetrics(gameState.activePlayers[starEarnerKey].name, 1, 0, 0);
        
        keys.forEach(k => {
            gameState.activePlayers[k].score = 0;
        });
    }
    
    const historyEntry = {
        round: gameState.currentRound,
        puteran: gameState.currentMatchIndex,
        scoresSnapshot: {
            A: gameState.activePlayers.A.score,
            B: gameState.activePlayers.B.score,
            C: gameState.activePlayers.C.score,
            D: gameState.activePlayers.D.score
        },
        additions: additionInputs,
        burnDetails: burnSystemTriggeredThisTurn ? {
            perpetrator: gameState.activePlayers[perpetratorKey].name,
            victims: victimsBurnedThisTurn.map(v => gameState.activePlayers[v].name),
            isTriple: victimsBurnedThisTurn.length === 3
        } : null,
        starAwarded: starEarnerKey ? {
            player: gameState.activePlayers[starEarnerKey].name
        } : null
    };
    
    gameState.historyLog.push(historyEntry);
    
    triggerVisualOverlayAnimations(victimsBurnedThisTurn, starEarnerKey);
    buildSpeechSynthesizerSequence(historyEntry, previousScoresSnapshot);
    
    gameState.currentMatchIndex += 1;
    
    keys.forEach(k => {
        document.getElementById(`input-score-${k}`).value = "";
    });
    
    saveSystemDataToLocalStorage();
    refreshLiveGameStatsDashboard();
}

// Interactive Audio-Visual Graphics Core Automation Engine
function triggerVisualOverlayAnimations(victims, starWinner) {
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        if (gameState.activePlayers[k].score < 0) {
            const containerNode = document.getElementById(`neg-anim-${k}`);
            if (containerNode) {
                containerNode.textContent = "👎";
                containerNode.classList.remove("active");
                void containerNode.offsetWidth; 
                containerNode.classList.add("active");
            }
        }
    });
    
    if (victims && victims.length > 0) {
        const fireElement = document.getElementById("fire-overlay");
        if (fireElement) {
            fireElement.classList.remove("active");
            void fireElement.offsetWidth;
            fireElement.classList.add("active");
            setTimeout(() => {
                fireElement.classList.remove("active");
            }, 2500);
        }
    }
    
    if (starWinner) {
        const starContainer = document.getElementById("star-overlay");
        if (starContainer) {
            starContainer.innerHTML = "";
            starContainer.classList.add("active");
            
            for (let i = 0; i < 15; i++) {
                const starParticle = document.createElement("div");
                starParticle.className = "falling-star-particle";
                starParticle.textContent = "⭐";
                starParticle.style.setProperty("--star-x", `${Math.random() * 95}%`);
                starParticle.style.animationDelay = `${Math.random() * 0.4}s`;
                starContainer.appendChild(starParticle);
            }
            
            setTimeout(() => {
                starContainer.classList.remove("active");
                starContainer.innerHTML = "";
            }, 2000);
        }
    }
}

// Speech Automation Sequence Processing Factory
function buildSpeechSynthesizerSequence(entry, snapshots) {
    const keys = ['A', 'B', 'C', 'D'];
    let lowestScoreVal = Infinity;
    let dealerTargetName = "";
    
    keys.forEach(k => {
        if (snapshots[k] < lowestScoreVal) {
            lowestScoreVal = snapshots[k];
            dealerTargetName = gameState.activePlayers[k].name;
        }
    });
    
    audioSpeechQueue.addToQueue('tts', `Silakan ${dealerTargetName} kocok kartunya`);
    
    if (entry.burnDetails) {
        if (entry.burnDetails.isTriple) {
            audioSpeechQueue.addToQueue('tts', "Triple Burn");
        }
        
        const victimsText = entry.burnDetails.victims.join(" dan ");
        audioSpeechQueue.addToQueue('tts', `${entry.burnDetails.perpetrator} membakar ${victimsText}`);
        audioSpeechQueue.addToQueue('audio', 'dimulaidari0.wav');
    }
    
    // PERBAIKAN UTAMA: Jika dapet bintang, jalankan lagu & TTS secara lepas di luar antrean agar benar-benar BARENGAN
    if (entry.starAwarded) {
        // 1. Play Musik secara instan lepas
        const starAudio = new Audio('godofgambler.wav');
        starAudio.play().catch(e => console.log("Blocked audio play:", e));

        // 2. Mainkan TTS secara instan lepas di luar object queue utama
        if ('speechSynthesis' in window) {
            const starUtterance = new SpeechSynthesisUtterance(`Selamat kepada ${entry.starAwarded.player} mendapatkan bintang satu`);
            starUtterance.lang = 'id-ID';
            starUtterance.rate = 0.95;
            window.speechSynthesis.speak(starUtterance);
        }
    }
    
    // Antrean pembacaan sisa skor berjalan normal setelah pemicu instan di atas
    keys.forEach(k => {
        const p = gameState.activePlayers[k];
        const spokenScore = numberToBahasaIndonesia(p.score);
        
        if (p.score < 0) {
            audioSpeechQueue.addToQueue('tts', `${p.name} minus ${numberToBahasaIndonesia(Math.abs(p.score))}`);
        } else {
            audioSpeechQueue.addToQueue('tts', `${p.name} total poin ${spokenScore}`);
        }
    });
}

// User Interface Update and Synchronization Subsystem
function refreshLiveGameStatsDashboard() {
    document.getElementById("display-ronde").textContent = `Ronde ${gameState.currentRound}`;
    document.getElementById("display-puteran").textContent = `Puteran ${gameState.currentMatchIndex}`;
    document.getElementById("display-target").textContent = `Target: ${gameState.victoryTarget}`;
    
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const p = gameState.activePlayers[k];
        
        document.getElementById(`lbl-entry-${k}`).textContent = p.name;
        document.getElementById(`lbl-edit-${k}`).textContent = p.name;
        
        const cardTitle = document.querySelector(`.player-display-name[data-id="${k}"]`);
        if (cardTitle) cardTitle.textContent = p.name;
        
        const cardScore = document.getElementById(`score-val-${k}`);
        if (cardScore) cardScore.textContent = p.score;
        
        const cardStars = cardScore.closest(".player-card").querySelector(".star-count");
        if (cardStars) cardStars.textContent = `⭐ ${p.stars}`;
        
        document.getElementById(`stat-burn-${k}`).textContent = p.currentRoundBurn;
        document.getElementById(`stat-triple-${k}`).textContent = p.currentRoundTriple;
    });
    
    const sortedPlayers = keys.map(k => ({ key: k, ...gameState.activePlayers[k] }))
        .sort((x, y) => {
            if (y.stars !== x.stars) return y.stars - x.stars;
            return y.score - x.score;
        });
        
    keys.forEach(k => {
        const cardElement = document.querySelector(`.player-card[data-player="${k}"]`);
        if (cardElement) {
            cardElement.classList.remove("active-leader");
            const rankIndex = sortedPlayers.findIndex(p => p.key === k);
            cardElement.querySelector(".card-rank-badge").textContent = `#${rankIndex + 1}`;
            if (rankIndex === 0) {
                cardElement.classList.add("active-leader");
            }
        }
    });
    
    renderRankingTable(sortedPlayers);
    rebuildHistoryRoundSelectorOptions();
    renderFilteredHistoryLogs(gameState.currentRound);
    renderAchievementsScreen();
    renderStatistikScreen();
    renderPermanentArsipScreen();
}

function renderRankingTable(sortedPlayers) {
    const tbody = document.getElementById("ranking-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    sortedPlayers.forEach((p, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>#${idx + 1}</b></td>
            <td>${p.name}</td>
            <td><span class="badge">${p.score}</span></td>
            <td><span class="text-warning">⭐ ${p.stars}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function rebuildHistoryRoundSelectorOptions() {
    const selectFilter = document.getElementById("history-ronde-filter");
    if (!selectFilter) return;
    
    const totalRoundsTracked = Math.max(gameState.currentRound, ...gameState.historyLog.map(l => l.round), 1);
    
    const previousSelectionValue = selectFilter.value;
    selectFilter.innerHTML = "";
    
    for (let r = 1; r <= totalRoundsTracked; r++) {
        const opt = document.createElement("option");
        opt.value = r;
        opt.textContent = `Ronde ${r}`;
        selectFilter.appendChild(opt);
    }
    
    if (previousSelectionValue && parseInt(previousSelectionValue) <= totalRoundsTracked) {
        selectFilter.value = previousSelectionValue;
    } else {
        selectFilter.value = gameState.currentRound;
    }
}

function renderFilteredHistoryLogs(roundId) {
    const logsContainer = document.getElementById("history-logs");
    if (!logsContainer) return;
    logsContainer.innerHTML = "";
    
    const filtered = gameState.historyLog.filter(l => l.round === roundId);
    
    if (filtered.length === 0) {
        logsContainer.innerHTML = `<p class="tab-info-text">Belum ada data history untuk ronde ini.</p>`;
        return;
    }
    
    filtered.slice().reverse().forEach(log => {
        const logItem = document.createElement("div");
        logItem.className = "log-item";
        
        let burnMetaTemplate = "";
        if (log.burnDetails) {
            burnMetaTemplate = `
                <div class="log-badge-burn">
                    🔥 ${log.burnDetails.isTriple ? 'TRIPLE BURN! ' : ''}${log.burnDetails.perpetrator} membakar ${log.burnDetails.victims.join(', ')}
                </div>
            `;
        }
        
        let starMetaTemplate = "";
        if (log.starAwarded) {
            starMetaTemplate = `
                <div class="text-warning mt-1" style="font-size:0.75rem; font-weight:700;">
                    ⭐ ${log.starAwarded.player} mendapatkan Bintang! (Skor direset ke 0)
                </div>
            `;
        }
        
        logItem.innerHTML = `
            <div class="log-title">Puteran ${log.puteran}</div>
            <div class="log-scores">
                A (+${log.additions.A}): <b>${log.scoresSnapshot.A}</b> | 
                B (+${log.additions.B}): <b>${log.scoresSnapshot.B}</b> | 
                C (+${log.additions.C}): <b>${log.scoresSnapshot.C}</b> | 
                D (+${log.additions.D}): <b>${log.scoresSnapshot.D}</b>
            </div>
            ${burnMetaTemplate}
            ${starMetaTemplate}
        `;
        logsContainer.appendChild(logItem);
    });
}

function renderAchievementsScreen() {
    const container = document.getElementById("achievement-list");
    if (!container) return;
    container.innerHTML = "";
    
    const keys = ['A', 'B', 'C', 'D'];
    let tripleBurnUnlocked = false;
    let tripleBurnAchievers = [];
    
    keys.forEach(k => {
        if (gameState.activePlayers[k].currentRoundTriple > 0) {
            tripleBurnUnlocked = true;
            tripleBurnAchievers.push(gameState.activePlayers[k].name);
        }
    });
    
    const tripleCard = document.createElement("div");
    tripleCard.className = "achievement-card";
    tripleCard.innerHTML = `
        <div class="achievement-icon-frame">${tripleBurnUnlocked ? '🔥' : '🔒'}</div>
        <div class="achievement-details">
            <h5>Triple Burn Achievement</h5>
            <p>${tripleBurnUnlocked ? `Membakar 3 pemain sekaligus dalam satu puteran. Diraih oleh: ${tripleBurnAchievers.join(', ')}` : 'Kunci Terbuka: Membakar 3 pemain sekaligus dalam satu puteran.'}</p>
        </div>
    `;
    container.appendChild(tripleCard);
    
    let maxStars = 0;
    let starKings = [];
    keys.forEach(k => {
        if (gameState.activePlayers[k].stars > maxStars) {
            maxStars = gameState.activePlayers[k].stars;
        }
    });
    
    if (maxStars > 0) {
        keys.forEach(k => {
            if (gameState.activePlayers[k].stars === maxStars) starKings.push(gameState.activePlayers[k].name);
        });
    }
    
    const godCard = document.createElement("div");
    godCard.className = "achievement-card";
    godCard.innerHTML = `
        <div class="achievement-icon-frame">${maxStars > 0 ? '👑' : '🔒'}</div>
        <div class="achievement-details">
            <h5>God of Gamblers</h5>
            <p>${maxStars > 0 ? `Memimpin perolehan bintang terbanyak (${maxStars} ⭐). Diduduki oleh: ${starKings.join(', ')}` : 'Kunci Terbuka: Dapatkan bintang kemenangan dalam ronde berjalan.'}</p>
        </div>
    `;
    container.appendChild(godCard);
}

function renderStatistikScreen() {
    const tbody = document.getElementById("statistik-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const p = gameState.activePlayers[k];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>${p.name}</b></td>
            <td>${p.stars} ⭐</td>
            <td>${p.currentRoundBurn}x</td>
            <td>${p.currentRoundTriple}x</td>
        `;
        tbody.appendChild(row);
    });
}

function renderPermanentArsipScreen() {
    const tbody = document.getElementById("arsip-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (!gameState.permanentRegistry || Object.keys(gameState.permanentRegistry).length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center tab-info-text">Belum ada data arsip permanen tersimpan.</td></tr>`;
        return;
    }
    
    Object.values(gameState.permanentRegistry).forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>${p.name}</b></td>
            <td>${p.stars}</td>
            <td>${p.burns}</td>
            <td>${p.tripleBurn}</td>
        `;
        tbody.appendChild(row);
    });
}
