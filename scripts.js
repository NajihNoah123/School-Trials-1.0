// Game state management
let gameState = {
  characterSelected: null,
  currentChapter: null,
  survivorCount: 310,
  soundVolume: 0.5,
  musicVolume: 0.3,
  soundEnabled: true,
  musicEnabled: true,
  difficulty: "normal",
  textSpeed: "normal",
  saveDate: null,
}

// Initialize game state
function initGameState() {
  // Check if there's a saved game state
  const savedState = localStorage.getItem("schoolTrialsGameState")

  if (savedState) {
    gameState = JSON.parse(savedState)
  }
}

// Load game state
function loadGameState() {
  const savedState = localStorage.getItem("schoolTrialsGameState")

  if (savedState) {
    gameState = JSON.parse(savedState)
  } else {
    initGameState()
  }
}

// Save game state
function saveGameState() {
  gameState.saveDate = new Date().toISOString()
  localStorage.setItem("schoolTrialsGameState", JSON.stringify(gameState))
}

// Update survivor count
function updateSurvivorCount() {
  const survivorCountElement = document.getElementById("survivor-count")
  if (survivorCountElement) {
    survivorCountElement.textContent = `${gameState.survivorCount} students remain`
  }
}

// Timer functions
function startTimer(seconds, callback) {
  // Set initial time
  gameState.timeRemaining = seconds

  // Update timer display
  updateTimerDisplay()

  // Start interval
  gameState.timerInterval = setInterval(() => {
    // Decrement time
    gameState.timeRemaining--

    // Update timer display
    updateTimerDisplay()

    // Check if time's up
    if (gameState.timeRemaining <= 0) {
      stopTimer()
      callback()
    }
  }, 1000)
}

// Update timer display
function updateTimerDisplay() {
  const timerElement = document.getElementById("timer")
  if (!timerElement) return

  // Format time
  const minutes = Math.floor(gameState.timeRemaining / 60)
  const seconds = gameState.timeRemaining % 60

  // Update display
  timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  // Add warning class if time is running low
  if (gameState.timeRemaining <= 10) {
    timerElement.classList.add("text-red-500")
  } else {
    timerElement.classList.remove("text-red-500")
  }
}

// Stop timer
function stopTimer() {
  clearInterval(gameState.timerInterval)
}

// Audio functions
function playSound(soundPath) {
  if (!gameState.soundEnabled) return

  // Try to find existing audio element
  let sound = document.querySelector(`audio[data-src="${soundPath}"]`)

  // Create new audio element if not found
  if (!sound) {
    sound = new Audio(soundPath)
    sound.dataset.src = soundPath
    sound.volume = gameState.soundVolume
  }

  // Play sound
  sound.currentTime = 0
  sound.play().catch((e) => console.log("Sound play error:", e))
}

// Background music
let currentMusic = null

function playMusic(musicPath) {
  if (!gameState.musicEnabled) return

  // Try to find existing audio element
  let music = document.querySelector(`audio[data-src="${musicPath}"]`)

  // Create new audio element if not found
  if (!music) {
    music = new Audio(musicPath)
    music.dataset.src = musicPath
    music.loop = true
    music.volume = gameState.musicVolume
    document.body.appendChild(music)
  }

  // Play music
  music.play().catch((e) => console.log("Music play error:", e))
}

function stopMusic() {
  const musicElements = document.querySelectorAll("audio[data-src]")
  musicElements.forEach((music) => {
    music.pause()
    music.currentTime = 0
  })
}

// Set up audio controls
function setupAudioControls() {
  const soundToggle = document.getElementById("sound-toggle")
  const musicToggle = document.getElementById("music-toggle")

  if (soundToggle) {
    soundToggle.textContent = gameState.soundEnabled ? "🔊" : "🔇"
    soundToggle.addEventListener("click", function () {
      gameState.soundEnabled = !gameState.soundEnabled
      this.textContent = gameState.soundEnabled ? "🔊" : "🔇"
      saveGameState()
    })
  }

  if (musicToggle) {
    musicToggle.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"
    musicToggle.addEventListener("click", function () {
      gameState.musicEnabled = !gameState.musicEnabled
      this.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"

      if (gameState.musicEnabled) {
        // Resume music
        if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
          playMusic("sounds/menu_theme.mp3")
        } else {
          playMusic("sounds/trial_theme.mp3")
        }
      } else {
        // Stop music
        stopMusic()
      }

      saveGameState()
    })
  }
}

// Update audio volumes
function updateAudioVolumes() {
  // Update sound effects volume
  const soundElements = document.querySelectorAll("audio:not([loop])")
  soundElements.forEach((sound) => {
    sound.volume = gameState.soundVolume
  })

  // Update music volume
  const musicElements = document.querySelectorAll("audio[loop]")
  musicElements.forEach((music) => {
    music.volume = gameState.musicVolume
  })
}

// Show modal
function showModal(title, message, confirmText, cancelText, confirmCallback) {
  // Create modal element
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"

  const modalContent = document.createElement("div")
  modalContent.className = "bg-gray-900 border border-red-600 p-6 max-w-md"

  const modalTitle = document.createElement("h3")
  modalTitle.className = "text-xl font-bold mb-4"
  modalTitle.textContent = title

  const modalMessage = document.createElement("p")
  modalMessage.className = "mb-6"
  modalMessage.textContent = message

  const buttonContainer = document.createElement("div")
  buttonContainer.className = "flex justify-end space-x-4"

  // Create confirm button
  const confirmButton = document.createElement("button")
  confirmButton.className = "px-4 py-2 bg-red-900 hover:bg-red-700 transition-colors duration-300 rounded-sm"
  confirmButton.textContent = confirmText || "OK"
  confirmButton.addEventListener("click", function () {
    playSound("sounds/click.mp3")
    document.body.removeChild(modal)
    if (confirmCallback) confirmCallback()
  })

  // Add cancel button if provided
  if (cancelText) {
    const cancelButton = document.createElement("button")
    cancelButton.className = "px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-300 rounded-sm"
    cancelButton.textContent = cancelText
    cancelButton.addEventListener("click", function () {
      playSound("sounds/click.mp3")
      document.body.removeChild(modal)
    })
    buttonContainer.appendChild(cancelButton)
  }

  buttonContainer.appendChild(confirmButton)

  modalContent.appendChild(modalTitle)
  modalContent.appendChild(modalMessage)
  modalContent.appendChild(buttonContainer)

  modal.appendChild(modalContent)
  document.body.appendChild(modal)
}

// Trial success
function trialSuccess(remainingStudents, nextChapter) {
  // Update survivor count
  gameState.survivorCount = remainingStudents

  // Update current chapter
  gameState.currentChapter = nextChapter.replace(".html", "")

  // Save game state
  saveGameState()

  // Show success modal
  showModal(
    "Trial Complete",
    `You have passed the trial. ${remainingStudents} students remain.`,
    "Continue",
    null,
    function () {
      // Navigate to next chapter
      window.location.href = nextChapter
    },
  )
}

// Game over
function gameOver(reason) {
  // Save reason for game over
  localStorage.setItem("gameOverMessage", reason)

  // Navigate to failure page
  window.location.href = "failure.html"
}

// Add scan lines effect to all pages
document.addEventListener("DOMContentLoaded", () => {
  const scanLines = document.createElement("div")
  scanLines.className = "scan-lines"
  document.body.appendChild(scanLines)

  // Load game state
  initGameState()

  // Initialize sound and music toggles
  const soundBtn = document.getElementById("sound-toggle")
  if (soundBtn) {
    soundBtn.textContent = gameState.soundEnabled ? "🔊" : "🔇"
    soundBtn.addEventListener("click", toggleSound)
  }

  const musicBtn = document.getElementById("music-toggle")
  if (musicBtn) {
    musicBtn.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"
    musicBtn.addEventListener("click", toggleMusic)
  }

  // Toggle sound function
  function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled
    const soundBtn = document.getElementById("sound-toggle")
    if (soundBtn) {
      soundBtn.textContent = gameState.soundEnabled ? "🔊" : "🔇"
    }
    saveGameState()
  }

  // Toggle music function
  function toggleMusic() {
    gameState.musicEnabled = !gameState.musicEnabled
    const musicBtn = document.getElementById("music-toggle")
    if (musicBtn) {
      musicBtn.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"
    }

    if (gameState.musicEnabled) {
      // Resume music
      if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
        playMusic("sounds/menu_theme.mp3")
      } else {
        playMusic("sounds/trial_theme.mp3")
      }
    } else {
      // Stop music
      stopMusic()
    }

    saveGameState()
  }
})

// Shuffle array
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
