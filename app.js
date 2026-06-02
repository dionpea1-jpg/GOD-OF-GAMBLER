/**
 * Score Cekih by Sadewa Corp
 * Pure Native JS Framework-less PWA Module Engine
 */

// Application Core State Storage Architecture
let gameState = {
    currentRound: 1,
    currentMatchIndex: 1,
    victoryTarget: 1000,
    activePlayers: {
        A: { name: 'Pemain A', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        B: { name: 'Pemain B', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        C: { name: 'Pemain C', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 },
        D: { name: 'Pemain D', score: 0, stars: 0, currentRoundBurn: 0, currentRoundTriple: 0 }
    },
    historyLog: [],       // Array objects representing log history data entries
    permanentRegistry: {} // Permanent permanent player statistical archives tracker
};

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
            console.warn(`Audio source error or track absent: ${src}`);
            this.isSpeaking = false;
            this.processQueue();
        };
        audio.play().catch(err => {
            console.log("Audio playback blocked by interaction model policies:", err);
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

// Synchronization Layer Infrastructure
function syncStateDataToActiveInterface() {
    // Synchronize global application setup configurations or active route matching templates
    if (gameState.historyLog && gameState.historyLog.length > 0) {
        transitionViewRouterMode("game-screen");
    } else {
        transitionViewRouterMode("setup-screen");
    }
    
    // Inject custom target setups or preset nodes
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
    
    // Bind current internal data nodes to DOM elements
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
    // Theme configurations buttons
    document.getElementById("btn-theme").addEventListener("click", toggleThemeEngine);
    
    // Fullscreen configuration API link
    document.getElementById("btn-fullscreen").addEventListener("click", toggleFullscreenEngine);
    
    // Screenshot engine activator
    document.getElementById("btn-screenshot").addEventListener("click", triggerApplicationScreenshot);
    
    // Victory target picker selection layout
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

    // Match initial triggers
    document.getElementById("btn-start-game").addEventListener("click", executeMatchInitialSetup);
    
    // Input action controls
    document.getElementById("btn-save-puteran").addEventListener("click", processMatchTurnCalculations);
    
    // Round control actions
    document.getElementById("btn-change-ronde").addEventListener("click", triggerRoundResetConfiguration);
    
    // Name alteration modals interaction links
    document.getElementById("btn-edit-players").addEventListener("click", openNameModifierModal);
    document.getElementById("btn-cancel-edit").addEventListener("click", closeNameModifierModal);
    document.getElementById("btn-save-edit").addEventListener("click", commitNameModifierChanges);
    
    // Navigation tab tracking selection nodes
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
    
    // Historic logs analytical tracking selectors
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
            console.error(`Fullscreen request dynamic application error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Screen Direct Render Image Capture Engine (Fallback Independent)
function triggerApplicationScreenshot() {
    alert("Fitur Screenshot Premium: Silakan gunakan kombinasi tombol bawaan HP Android Anda (Power + Volume Bawah) untuk hasil tangkapan layar beresolusi tinggi yang aman dan terintegrasi dengan galeri sistem.");
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
                // Migrate statistical records tracking to avoid data leaks
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
    
    // Reset structural round score counters explicitly
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        gameState.activePlayers[k].score = 0;
        gameState.activePlayers[k].stars = 0;
        gameState.activePlayers[k].currentRoundBurn = 0;
        gameState.activePlayers[k].currentRoundTriple = 0;
        synchronizePermanentRegistryNode(gameState.activePlayers[k].name);
    });
    
    gameState.currentMatchIndex = 1;
    // Retain round structural metrics logic sequences
    
    saveSystemDataToLocalStorage();
    refreshLiveGameStatsDashboard();
    transitionViewRouterMode("game-screen");
}

function triggerRoundResetConfiguration() {
    if (confirm("Apakah Anda yakin ingin mengganti ronde? History data ronde saat ini tetap aman tersimpan di tab History.")) {
        gameState.currentRound += 1;
        gameState.currentMatchIndex = 1;
        
        // Clear active score parameters without deleting player identity data matrices
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
        result += value.toString(); // Safety fallback boundary check
    }
    
    return result.trim().replace(/\s+/g, ' ');
}

// Core Game Scoring Matrix Engineering Subsystem
function processMatchTurnCalculations() {
    const keys = ['A', 'B', 'C', 'D'];
    const additionInputs = {};
    
    // Parse dynamic user inputs securely
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
    
    // Capture snapshots of score matrices prior to iteration changes
    const previousScoresSnapshot = {
        A: gameState.activePlayers.A.score,
        B: gameState.activePlayers.B.score,
        C: gameState.activePlayers.C.score,
        D: gameState.activePlayers.D.score
    };
    
    // Map initial temporary dynamic post-calculation fields
    const postCalculationScores = {
        A: previousScoresSnapshot.A + additionInputs.A,
        B: previousScoresSnapshot.B + additionInputs.B,
        C: previousScoresSnapshot.C + additionInputs.C,
        D: previousScoresSnapshot.D + additionInputs.D
    };
    
    // Core Engine Structural Tracking Logs Arrays
    const victimsBurnedThisTurn = [];
    let perpetratorKey = null;
    let burnSystemTriggeredThisTurn = false;
    
    // Execute scoring evaluations algorithm starting from Match Index 2 onwards
    if (gameState.currentMatchIndex >= 2) {
        
        // Evaluate every permutation combination pairs structurally
        keys.forEach(pKey => {
            let directVictimsForThisPlayer = [];
            
            keys.forEach(oKey => {
                if (pKey === oKey) return;
                
                // Exclude players who already sit at exactly 0 points from being processed as viable victims
                if (previousScoresSnapshot.oKey === 0 || postCalculationScores[oKey] === 0) {
                    // Score 0 target restriction rules block processing actions here
                }
                
                // Extract parameters checking verification algorithms
                // IF (previousScore <= opponentPreviousScore) AND (currentScore > opponentCurrentScore)
                const conditionOne = previousScoresSnapshot[pKey] <= previousScoresSnapshot[oKey];
                const conditionTwo = postCalculationScores[pKey] > postCalculationScores[oKey];
                
                // Apply strict exemption: zero elements cannot be evaluated as burnt casualties
                const isOpponentNotZero = previousScoresSnapshot[oKey] !== 0;
                
                if (conditionOne && conditionTwo && isOpponentNotZero) {
                    directVictimsForThisPlayer.push(oKey);
                }
            });
            
            // Track mapping to assign burn perpetrator context values
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
    
    // Apply burn adjustments if rules criteria match structural definitions
    if (burnSystemTriggeredThisTurn && victimsBurnedThisTurn.length > 0) {
        victimsBurnedThisTurn.forEach(vKey => {
            // Target victim gets structural reset down to 0 points completely
            postCalculationScores[vKey] = 0;
            
            // Add statistics metrics
            gameState.activePlayers[vKey].currentRoundBurn += 1;
            updatePermanentRegistryMetrics(gameState.activePlayers[vKey].name, 0, 1, 0);
        });
        
        // Handle specialized high-tier achievements matching Triple Burn conditions
        if (victimsBurnedThisTurn.length === 3 && perpetratorKey) {
            gameState.activePlayers[perpetratorKey].currentRoundTriple += 1;
            updatePermanentRegistryMetrics(gameState.activePlayers[perpetratorKey].name, 0, 0, 1);
        }
    }
    
    // Commit temporary scores matrix back into the primary local application states
    keys.forEach(k => {
        gameState.activePlayers[k].score = postCalculationScores[k];
    });
    
    // Scan variables to detect victory star achievements parameters
    let starEarnerKey = null;
    keys.forEach(k => {
        if (gameState.activePlayers[k].score >= gameState.victoryTarget) {
            starEarnerKey = k;
        }
    });
    
    // Handle actions if a player crosses threshold parameters to earn victory stars
    if (starEarnerKey) {
        gameState.activePlayers[starEarnerKey].stars += 1;
        updatePermanentRegistryMetrics(gameState.activePlayers[starEarnerKey].name, 1, 0, 0);
        
        // Immediately trigger reset parameters on all local fields back to 0 points
        keys.forEach(k => {
            gameState.activePlayers[k].score = 0;
        });
    }
    
    // Record log data models inside history object store arrays
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
    
    // Execute system animation layers on top of visible application viewpoints
    triggerVisualOverlayAnimations(victimsBurnedThisTurn, starEarnerKey);
    
    // Construct automated speech output notifications
    buildSpeechSynthesizerSequence(historyEntry, previousScoresSnapshot);
    
    // Progress structural match iteration tracking counts forwards by 1
    gameState.currentMatchIndex += 1;
    
    // Clear old text fields inputs completely
    keys.forEach(k => {
        document.getElementById(`input-score-${k}`).value = "";
    });
    
    // Re-render and save state shifts locally
    saveSystemDataToLocalStorage();
    refreshLiveGameStatsDashboard();
}

// Interactive Audio-Visual Graphics Core Automation Engine
function triggerVisualOverlayAnimations(victims, starWinner) {
    // 1. Handle negative point animation shifts
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        if (gameState.activePlayers[k].score < 0) {
            const containerNode = document.getElementById(`neg-anim-${k}`);
            if (containerNode) {
                containerNode.textContent = "👎";
                containerNode.classList.remove("active");
                void containerNode.offsetWidth; // Force reflow trigger
                containerNode.classList.add("active");
            }
        }
    });
    
    // 2. Handle burn flame overlay animations
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
    
    // 3. Handle high-tier reward star cascades
    if (starWinner) {
        const starContainer = document.getElementById("star-overlay");
        if (starContainer) {
            starContainer.innerHTML = "";
            starContainer.classList.add("active");
            
            // Construct cascading visual particles dynamically
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
    // Step A: Determine dealing rotation requirements based on score rankings prior to input calculations
    const keys = ['A', 'B', 'C', 'D'];
    let lowestScoreVal = Infinity;
    let dealerTargetName = "";
    
    keys.forEach(k => {
        if (snapshots[k] < lowestScoreVal) {
            lowestScoreVal = snapshots[k];
            dealerTargetName = gameState.activePlayers[k].name;
        }
    });
    
    // Queue internal card dealing announcer prompts
    audioSpeechQueue.addToQueue('tts', `Silakan ${dealerTargetName} kocok kartunya`);
    
    // Step B: Evaluate burn announcements
    if (entry.burnDetails) {
        if (entry.burnDetails.isTriple) {
            audioSpeechQueue.addToQueue('tts', "Triple Burn");
        }
        
        const victimsText = entry.burnDetails.victims.join(" dan ");
        audioSpeechQueue.addToQueue('tts', `${entry.burnDetails.perpetrator} membakar ${victimsText}`);
        // Inject structural audio tracks
        audioSpeechQueue.addToQueue('audio', 'dimulaidari0.wav');
    }
    
    // Step C: Evaluate reward star configurations announcements
    if (entry.starAwarded) {
        audioSpeechQueue.addToQueue('tts', `Selamat kepada ${entry.starAwarded.player} mendapatkan bintang satu`);
        audioSpeechQueue.addToQueue('audio', 'godofgambler.wav');
    }
    
    // Step D: Report scoreboard positions globally across all active nodes
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
    // 1. Update text displays
    document.getElementById("display-ronde").textContent = `Ronde ${gameState.currentRound}`;
    document.getElementById("display-puteran").textContent = `Puteran ${gameState.currentMatchIndex}`;
    document.getElementById("display-target").textContent = `Target: ${gameState.victoryTarget}`;
    
    // 2. Refresh active panel tracking labels
    const keys = ['A', 'B', 'C', 'D'];
    keys.forEach(k => {
        const p = gameState.activePlayers[k];
        
        // Form input labels tracking
        document.getElementById(`lbl-entry-${k}`).textContent = p.name;
        document.getElementById(`lbl-edit-${k}`).textContent = p.name;
        
        // Interactive scoreboard cards
        const cardTitle = document.querySelector(`.player-display-name[data-id="${k}"]`);
        if (cardTitle) cardTitle.textContent = p.name;
        
        const cardScore = document.getElementById(`score-val-${k}`);
        if (cardScore) cardScore.textContent = p.score;
        
        const cardStars = cardScore.closest(".player-card").querySelector(".star-count");
        if (cardStars) cardStars.textContent = `⭐ ${p.stars}`;
        
        // Mini statistics trackers
        document.getElementById(`stat-burn-${k}`).textContent = p.currentRoundBurn;
        document.getElementById(`stat-triple-${k}`).textContent = p.currentRoundTriple;
    });
    
    // 3. Compute live standing rankings dynamically
    const sortedPlayers = keys.map(k => ({ key: k, ...gameState.activePlayers[k] }))
        .sort((x, y) => {
            if (y.stars !== x.stars) return y.stars - x.stars;
            return y.score - x.score;
        });
        
    // Apply leaderboard styling parameters onto dashboard nodes
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
    
    // Render dynamic data across tabular sub-screens
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
    
    // Extract unique active round integers from logs array data store
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
    
    // Invert arrays ordering logic to map fresh entries directly to the top edge area
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
    
    // Card 1 Layout Model: General Triple Burn achievement specs
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
    
    // Card 2 Layout Model: General God of Gamblers achievement specs
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
