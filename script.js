// Create a function to get the width and height of the user's current screen and set it to the game container (#game)
const GameElem = document.querySelector('#game')
const RootElem = document.querySelector(':root')
const DinoElem = GameElem.querySelector('.dino')
const ScoreElem = GameElem.querySelector('.score')
const GroundElem = GameElem.querySelector('.ground')
const CactusElem = GroundElem.querySelector('.cactus')

// Update the root variables dynamically from JS
// we target the :root element and set these values into the root element
let GameSpeed = 4000
let JumpSpeed = (GameSpeed / 10) * 2
let MaxJump = 250
let SpeedScale = 1

let Score = 0
let GameStarted = false
let GameOver = false

let Jumping = false
let SelfPlayMode = false

// RootElem, '--game-speed', GameSpeed
function setCustomProperty(elem, prop, value) {
    elem.style.setProperty(prop, value)
}

function handleJump(e) {
    if (e.code !== 'Space') return
    // when we are jumping we can select an audio using document,qureyselector
    let audio = document.querySelector('.audio-jump')
    audio.play()
    Jumping = true
    DinoElem.classList.add('jump')
    DinoElem.addEventListener('animationend', function () {
        Jumping = false
        DinoElem.classList.remove('jump')
    })
}

function shouldJump() {
    let minGap = 250
    let cactusXPos = CactusElem.getBoundingClientRect().x

    // because we jumped over the cactus already and we shouldnt jump again (<= 0 means the position-x of the cactus is beyond the screen already)
    if (cactusXPos <= 0 || Jumping) return false

    if (cactusXPos < minGap) {
        return true
    }
    return false
}

// let GameID - this is not needed anymore if window.requestanimationframe function is used
function startGame() {
    GameStarted = true
    GameElem.classList.add('game-start')
    document.addEventListener('keydown', handleJump)
    window.requestAnimationFrame(updateGame)

    // GameID = setInterval(() => {
    //     updateGame()
    // }, 100)
    // we set Interval so that every 100ms it will call the updateGame Function
}

function endGame() {
    let audio = document.querySelector('.audio-die')
    audio.play()
    GameOver = true
    GameElem.classList.add('game-over')
    // if you want the dino to stop jumping when it collides with cacti or when the game ends,..
    document.removeEventListener('keydown', handleJump)
    // we dont wanna keep calling the updateGame function when the game ends so we use a clearInterval() function
    // clearInterval(GameID) - this is not needed anymore if window.requestanimationframe function is used (this function will automatically clear out whenever the game ends)
}

// As long as the game is running, this function is called
function updateGame() {
    setCustomProperty(RootElem, '--game-speed', GameSpeed)
    setCustomProperty(RootElem, '--jump-speed', JumpSpeed)
    setCustomProperty(RootElem, '--max-jump', MaxJump)
    setCustomProperty(RootElem, '--speed-scale', SpeedScale)
    if (SelfPlayMode) {
        if (shouldJump()) {
            handleJump({ code: "Space" })
        }
    }
    // Udpate the score
    updateScore()
    // Update the cactus
    updateCactus()
    // Check if game is over
    if (checkGameOver()) {
        endGame()
        return
    }
    window.requestAnimationFrame(updateGame)
}

function isCollision(dinoRect, cactusRect) {
    // AABB - Axis-aligned bounding box  
    return (
        dinoRect.x < cactusRect.x + cactusRect.width &&
        dinoRect.x + dinoRect.width > cactusRect.x &&
        dinoRect.y < cactusRect.y + cactusRect.height &&
        dinoRect.y + dinoRect.height > cactusRect.y
    );
}

function checkGameOver() {
    if (GameOver) return true
    let dinoRect = DinoElem.getBoundingClientRect()
    let cactusRect = CactusElem.getBoundingClientRect()
    if (isCollision(dinoRect, cactusRect)) {
        return true
    }
    return false
}

let scoreInterval = 10
let currentScoreInterval = 0
function updateScore() {
    currentScoreInterval += 1
    if (currentScoreInterval % scoreInterval !== 0) {
        return
    }
    Score += 1 // whenever this function is called we're gonna +1 to the score
    if (Score === 0) return
    if (Score % 100 === 0) {
        let audio = document.querySelector('.audio-point')
        audio.play()
        GameSpeed -= SpeedScale
        JumpSpeed = (GameSpeed / 10) * 2
    }

    let currentScoreElem = ScoreElem.querySelector('.current-score')
    currentScoreElem.innerText = Score.toString().padStart(5, '0')
    // convert the score to string and then prefix the score with 5 '0'(zeroes) in front
}

function updateCactus() {
    // you want to update the cactus outside the viewport (you dont wanna generate them inside the viewport)
    let cactusXPos = CactusElem.getBoundingClientRect().x
    let isOffScreen = cactusXPos > window.innerWidth
    if (isOffScreen === false) return

    let cacti = ['cactus-small-1', 'cactus-small-2', 'cactus-small-3']
    let randomNum = Math.floor(Math.random() * cacti.length)
    let cactus = cacti[randomNum]
    CactusElem.classList.remove('cactus-small-1', 'cactus-small-2', 'cactus-small-3')
    CactusElem.classList.add(cactus)
}

function fitScreen() {
    const width = window.innerWidth
    const height = window.innerHeight / 2
    // we are dividing 2 cos we dont wanna take up the full height
    GameElem.style.width = width + 'px'
    GameElem.style.height = height + 'px'
    GameElem.style.zoom = 1.5
}

// Then we need to call the function
window.addEventListener('load', function () {
    fitScreen()
    window.addEventListener('resize', fitScreen)
    // This function removes the need to refresh the screen everytime to resize the current screen (it refreshes the screen size automatically)

    let selfPlayElem = document.querySelector('#selfplay')
    selfPlayElem.addEventListener('change', function () {
        SelfPlayMode = selfPlayElem.checked
    })
    // change event - whenever the checkbox is checked it's going to trigger the 'change' event

    document.addEventListener('keydown', startGame, { once: true })
    // we set it only to once cos we only want to listen to this event one time only
})