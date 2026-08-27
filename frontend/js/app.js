const API_URL = "https://ai-questx.onrender.com";

let teamId = null;
let timerInterval = null;
let syncTimeout = null;
let remainingSeconds = 0;
let isEvaluating = false;


// ===============================
// ELEMENTS
// ===============================
const readyButton = document.getElementById("readyButton");
const instructionsSection = document.getElementById("instructionsSection");
const teamIdInput = document.getElementById("teamId");
const startButton = document.getElementById("startButton");
const startMessage = document.getElementById("startMessage");

const loginSection = document.getElementById("loginSection");
const competitionSection =
    document.getElementById("competitionSection");

const competitionImage =
    document.getElementById("competitionImage");

const timer =
    document.getElementById("timer");

const promptInput =
    document.getElementById("promptInput");
const evaluateButton =
    document.getElementById("evaluateButton");
const scoreElement =
    document.getElementById("score");
const bestScoreElement =
    document.getElementById("bestScore");
const resultMessage =
    document.getElementById("resultMessage");
const characterCount =
    document.getElementById("characterCount");

// ===============================
// I AM READY
// ===============================

readyButton.addEventListener("click", () => {

    instructionsSection.style.display = "none";

    loginSection.style.display = "block";

    teamIdInput.focus();

});
// ===============================
// START ROUND
// ===============================

startButton.addEventListener(
    "click",
    startRound
);


async function startRound() {

    teamId =
        teamIdInput.value.trim().toUpperCase();

    localStorage.setItem(
    "aiQuestxTeamId",
    teamId
);

    if (!teamId) {

        startMessage.textContent =
            "Please enter your Team ID.";

        return;
    }

// ==========================================
// CONNECT TEAM DEVICE
// ==========================================

await fetch(
    `${API_URL}/api/competition/connect-device`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            teamId: teamId
        })
    }
);



    startButton.disabled = true;

    startMessage.textContent =
        "Starting round...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/competition/start`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        teamId: teamId
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to start round"
            );

        }


        // ===============================
        // SHOW COMPETITION
        // ===============================

        loginSection.style.display =
            "none";

        competitionSection.style.display =
            "block";


        // ===============================
        // SHOW IMAGE
        // ===============================

        if (data.filename) {

            competitionImage.src =
                `../photos/${data.filename}`;

        }


        // ===============================
        // SET TIMER
        // ===============================

        remainingSeconds =
            Number(data.remainingSeconds) || 0;

        updateTimer();

        startTimer();

        syncServerTimer();


        // ===============================
        // RESET UI
        // ===============================

        promptInput.disabled = false;

        evaluateButton.disabled =
            remainingSeconds <= 0;

        promptInput.value = "";

        scoreElement.textContent =
            "--";

        bestScoreElement.textContent =
            "0";

        resultMessage.textContent =
            "";


        updateCharacterCount();


    } catch (error) {

        console.error(
            "Start round error:",
            error
        );


        startMessage.textContent =
            error.message ||
            "Unable to start round.";

        startButton.disabled = false;

    }

}


// ===============================
// TIMER
// ===============================

function startTimer() {

    clearInterval(timerInterval);


    timerInterval =
        setInterval(() => {

            if (remainingSeconds > 0) {

                remainingSeconds--;

                updateTimer();

            }


            if (remainingSeconds <= 0) {

                remainingSeconds = 0;

                clearInterval(timerInterval);

                updateTimer();

                endCompetition();

            }

        }, 1000);

}


// ===============================
// UPDATE TIMER DISPLAY
// ===============================

function updateTimer() {

    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    // Timer warning

    if (remainingSeconds <= 60) {

        timer.style.color =
            "#ff667a";

    } else {

        timer.style.color =
            "";

    }

}


// ===============================
// END COMPETITION
// ===============================

function endCompetition() {

    clearInterval(timerInterval);

    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    remainingSeconds = 0;

    updateTimer();

    evaluateButton.disabled = true;
    promptInput.disabled = true;

    resultMessage.textContent =
        "TIME'S UP — The competition round has ended.";

    resultMessage.style.color =
        "#ff667a";

    // Start checking for QR
    startQRStatusCheck();
}


// ==========================================
// CHECK WHETHER ADMIN SENT QR
// ==========================================

let qrCheckInterval = null;


function startQRStatusCheck() {

    clearInterval(qrCheckInterval);

    checkQRStatus();

    qrCheckInterval = setInterval(
        checkQRStatus,
        3000
    );

}


async function checkQRStatus() {

    if (!teamId) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/competition/qr-status/${encodeURIComponent(teamId)}`
        );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        if (
            data.success &&
            data.qrSent === true
        ) {

            clearInterval(qrCheckInterval);

            showTeamQR(data);

        }

    } catch (error) {

        console.error(
            "QR status error:",
            error
        );

    }

}
// ===============================
// EVALUATE PROMPT
// ===============================

evaluateButton.addEventListener(
    "click",
    evaluatePrompt
);


async function evaluatePrompt() {

    if (isEvaluating) {
        return;
    }


    const prompt =
        promptInput.value.trim();


    if (!prompt) {

        resultMessage.textContent =
            "Please enter a prompt first.";

        resultMessage.style.color =
            "";

        return;

    }


    if (remainingSeconds <= 0) {

        endCompetition();

        return;

    }


    isEvaluating = true;

    evaluateButton.disabled =
        true;


    resultMessage.textContent =
        "Evaluating your prompt...";

    resultMessage.style.color =
        "";


    try {

        const response =
            await fetch(
                `${API_URL}/api/evaluation/evaluate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        teamId: teamId,
                        prompt: prompt
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Evaluation failed"
            );

        }


        // ===============================
        // UPDATE SCORE
        // ===============================

        if (
            data.score !== undefined &&
            data.score !== null
        ) {

            scoreElement.textContent =
                data.score;

        }


        // ===============================
        // UPDATE BEST SCORE
        // ===============================

        if (
            data.bestScore !== undefined &&
            data.bestScore !== null
        ) {

            bestScoreElement.textContent =
                data.bestScore;

        }


        // ===============================
        // SERVER TIMER SYNC
        // ===============================

        if (
            data.remainingSeconds !== undefined
        ) {

            remainingSeconds =
                Number(
                    data.remainingSeconds
                );

            updateTimer();

        }


        // ===============================
        // RESULT MESSAGE
        // ===============================

        if (data.isNewBest) {

            resultMessage.textContent =
                `🏆 New Best Score! ${data.bestScore}/100`;

            resultMessage.style.color =
                "#5df2a4";

        } else {

            resultMessage.textContent =
                `Score: ${data.score}/100`;

            resultMessage.style.color =
                "#5ee7ff";

        }


        // ===============================
        // CHECK ROUND
        // ===============================

        if (remainingSeconds <= 0) {

            endCompetition();

        }

    } catch (error) {

        console.error(
            "Evaluation error:",
            error
        );


        resultMessage.textContent =
            error.message ||
            "Evaluation failed.";

        resultMessage.style.color =
            "#ff667a";

    } finally {

        isEvaluating = false;


        if (
            remainingSeconds > 0 &&
            !promptInput.disabled
        ) {

            evaluateButton.disabled =
                false;

        }

    }

}


// ===============================
// SERVER TIMER SYNCHRONIZATION
// ===============================

async function syncServerTimer() {

    if (!teamId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/competition/status/${teamId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Unable to synchronize timer"
            );

        }


        remainingSeconds =
            Number(
                data.remainingSeconds
            ) || 0;


        updateTimer();


        // ===============================
        // ROUND ENDED
        // ===============================

        if (
            !data.roundActive ||
            remainingSeconds <= 0
        ) {

            endCompetition();

            return;

        }


        // ===============================
        // CHECK AGAIN
        // ===============================

        syncTimeout =
            setTimeout(
                syncServerTimer,
                5000
            );

    } catch (error) {

        console.error(
            "Timer synchronization error:",
            error
        );


        // Retry after 5 seconds

        syncTimeout =
            setTimeout(
                syncServerTimer,
                5000
            );

    }

}


// ===============================
// CHARACTER COUNTER
// ===============================

if (promptInput) {

    promptInput.addEventListener(
        "input",
        updateCharacterCount
    );

}


function updateCharacterCount() {

    if (!characterCount) {
        return;
    }


    const count =
        promptInput.value.length;


    characterCount.textContent =
        `${count} characters`;

}


// ===============================
// ENTER KEY SUPPORT
// ===============================

teamIdInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !startButton.disabled
        ) {

            startRound();

        }

    }
);
// ==========================================
// SHOW TEAM QR
// ==========================================

function showTeamQR(data) {

    const qrSection =
        document.getElementById("nextRoundQR");

    const qrTeamName =
        document.getElementById("qrTeamName");

    const qrCode =
        document.getElementById("qrCode");

    const qrStatus =
        document.getElementById("qrStatus");


    if (!qrSection || !qrCode) {
        return;
    }


    // Show QR section
    qrSection.style.display = "block";


    // Team information
    qrTeamName.textContent =
        `${data.teamId} — ${data.teamName}`;


    // Clear previous QR
    qrCode.innerHTML = "";


    // QR will contain the team ID
    const qrData =
        `${window.location.origin}/room.html?teamId=${encodeURIComponent(data.teamId)}`;


    // Generate QR
    new QRCode(qrCode, {
        text: qrData,
        width: 220,
        height: 220
    });


    qrStatus.textContent =
        "📱 Scan this QR code to view your room.";

}