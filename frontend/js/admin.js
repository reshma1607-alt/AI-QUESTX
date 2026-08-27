const API_URL = "https://ai-questx.onrender.com";
// ==========================================
// TEAM DEVICE REGISTRATION
// ==========================================

let currentTeamId = "";

function registerTeamDevice(teamId) {

    currentTeamId = teamId;

    localStorage.setItem(
        "aiQuestxTeamId",
        teamId
    );

    console.log(
        "Team device registered:",
        teamId
    );
}
// ==========================================
// ADMIN LOGIN
// ==========================================

const adminLogin = document.getElementById("adminLogin");
const adminLoginButton = document.getElementById("adminLoginButton");
const adminLoginMessage = document.getElementById("adminLoginMessage");

let adminUsername = "";
let adminPassword = "";

if (adminLoginButton) {
    adminLoginButton.addEventListener("click", async () => {

        const username =
            document.getElementById("adminUsername").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        if (!username || !password) {
            adminLoginMessage.textContent =
                "Please enter username and password.";
            return;
        }

        adminLoginButton.disabled = true;
        adminLoginButton.textContent = "Logging in...";
        adminLoginMessage.textContent = "";

        try {

            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: "POST",
                    headers: {
                        "x-admin-username": username,
                        "x-admin-password": password
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid credentials"
                );
            }

            // Store credentials only for this browser session
            adminUsername = username;
            adminPassword = password;

            // Hide login
            adminLogin.style.display = "none";

            // Show dashboard
            document.querySelector(".dashboard").style.display = "block";

            // Load leaderboard
            loadLeaderboard();

        } catch (error) {

            console.error("Admin login error:", error);

            adminLoginMessage.textContent =
                "❌ Invalid username or password.";

        } finally {

            adminLoginButton.disabled = false;
            adminLoginButton.textContent = "LOGIN";

        }
    });
}


// ==========================================
// DASHBOARD ELEMENTS
// ==========================================

const leaderboardBody =
    document.getElementById("leaderboardBody");

const totalTeams =
    document.getElementById("totalTeams");

const activeTeams =
    document.getElementById("activeTeams");

const topScore =
    document.getElementById("topScore");

const totalAttempts =
    document.getElementById("totalAttempts");

const lastUpdated =
    document.getElementById("lastUpdated");

const refreshButton =
    document.getElementById("refreshButton");


// ==========================================
// TEAM MODAL ELEMENTS
// ==========================================

const teamModal =
    document.getElementById("teamModal");

const closeTeamModal =
    document.getElementById("closeTeamModal");

const modalTeamName =
    document.getElementById("modalTeamName");

const modalTeamId =
    document.getElementById("modalTeamId");

const modalBestScore =
    document.getElementById("modalBestScore");

const modalAttempts =
    document.getElementById("modalAttempts");

const modalImage =
    document.getElementById("modalImage");

const modalBestTime =
    document.getElementById("modalBestTime");

const attemptBody =
    document.getElementById("attemptBody");
const endRoundButton =
    document.getElementById("endRoundButton");

let selectedTeam = null;
// ==========================================
// LOAD LEADERBOARD
// ==========================================

async function loadLeaderboard() {

    try {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    🔄 Loading competition data...
                </td>
            </tr>
        `;


        const response = await fetch(
            `${API_URL}/api/admin/leaderboard`,
            {
                method: "GET",

                headers: {
                    "x-admin-username":
                        adminUsername,

                    "x-admin-password":
                        adminPassword
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load leaderboard"
            );

        }


        // Backend returns:
        // { success: true, count: ..., teams: [...] }

        const teams =
            Array.isArray(data.teams)
                ? data.teams
                : [];


        renderLeaderboard(teams);

        updateStatistics(teams);


        lastUpdated.textContent =
            `Updated ${new Date().toLocaleTimeString()}`;


    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">

                    ⚠️ ${escapeHtml(error.message)}

                    <br><br>

                    <small>
                        Unable to load competition data.
                    </small>

                </td>
            </tr>
        `;

    }

}


// ==========================================
// RENDER LEADERBOARD
// ==========================================

function renderLeaderboard(teams) {

    if (!teams.length) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    🏆 No competition results yet.
                </td>
            </tr>
        `;

        return;
    }


    leaderboardBody.innerHTML = "";


    teams.forEach((team, index) => {

        // ==================================
        // BASIC TEAM DATA
        // ==================================

        const rank =
            index + 1;


        const teamId =
            team.teamId || "—";


        const teamName =
            team.teamName ||
            "Unnamed Team";


        const score =
            Number(
                team.bestScore || 0
            );


        const attempts =
            Number(
                team.attemptCount || 0
            );


        const elapsedSeconds =
            Number(
                team.bestScoreElapsedSeconds || 0
            );


        // ==================================
        // ACTIVE STATUS
        // ==================================

        const isActive =
            team.roundActive === true;


        // ==================================
        // REMAINING TIME
        // ==================================

        let remainingSeconds = 0;


        if (
            isActive &&
            team.roundEndsAt
        ) {

            remainingSeconds =
                Math.max(
                    0,
                    Math.floor(
                        (
                            new Date(
                                team.roundEndsAt
                            ).getTime() -
                            Date.now()
                        ) / 1000
                    )
                );

        }


        // ==================================
        // RANK CLASS
        // ==================================

        const rankClass =
            rank === 1
                ? "first"
                : rank === 2
                    ? "second"
                    : rank === 3
                        ? "third"
                        : "";


        // ==================================
        // CREATE ROW
        // ==================================

        const row =
            document.createElement("tr");


        row.className =
            "team-row";


        row.title =
            "Click to view team details";


        // ==================================
        // ROW HTML
        // ==================================

        row.innerHTML = `

            <!-- RANK -->

            <td>

                <span class="rank ${rankClass}">

                    ${getRankIcon(rank)}

                    ${rank}

                </span>

            </td>


            <!-- TEAM -->

            <td>

                <div class="team-id">

                    ${escapeHtml(teamId)}

                </div>

                <div class="team-name">

                    ${escapeHtml(teamName)}

                </div>

            </td>


            <!-- SCORE -->

            <td>

                <span class="score">

                    ${score}

                </span>

                <span class="score-max">

                    /100

                </span>

            </td>


            <!-- ATTEMPTS -->

            <td>

                ${attempts}

            </td>


            <!-- TIME -->

            <td>

                ${
                    isActive

                        ? `
                            <span
    class="live-time"
    data-end-time="${
        team.roundEndsAt
            ? new Date(team.roundEndsAt).getTime()
            : ""
    }"
>

    ${formatTime(remainingSeconds)} left

</span>
                          `

                        : formatTime(
                            elapsedSeconds
                        )
                }

            </td>


            <!-- STATUS -->

            <td>

                <span
                    class="status ${
                        isActive
                            ? "active"
                            : "finished"
                    }"
                >

                    ${
                        isActive
                            ? "● LIVE"
                            : "FINISHED"
                    }

                </span>

            </td>

        `;


        // ==================================
        // CLICK TEAM
        // ==================================

        row.addEventListener(
            "click",
            () => {

                openTeamDetails(team);

            }
        );


        leaderboardBody.appendChild(
            row
        );

    });

}


// ==========================================
// OPEN TEAM DETAILS
// ==========================================

async function openTeamDetails(team) {
    selectedTeam = team;


    const teamId =
        team.teamId;


    // --------------------------------------
    // OPEN MODAL
    // --------------------------------------

    teamModal.classList.add(
        "show"
    );


    // --------------------------------------
    // BASIC TEAM INFORMATION
    // --------------------------------------

    modalTeamName.textContent =
        team.teamName ||
        "Unnamed Team";


    modalTeamId.textContent =
        teamId ||
        "—";


    modalBestScore.textContent =
        `${Number(
            team.bestScore || 0
        )}/100`;


    modalAttempts.textContent =
        Number(
            team.attemptCount || 0
        );


    modalImage.textContent =
        team.assignedImage ||
        "—";


    modalBestTime.textContent =
        formatTime(
            Number(
                team.bestScoreElapsedSeconds ||
                0
            )
        );


    // --------------------------------------
    // LOADING ATTEMPTS
    // --------------------------------------

    attemptBody.innerHTML = `
        <tr>

            <td
                colspan="4"
                class="loading"
            >

                🔄 Loading attempt history...

            </td>

        </tr>
    `;


    try {

        // ----------------------------------
        // REQUEST ATTEMPTS
        // ----------------------------------

        const response =
            await fetch(
                `${API_URL}/api/admin/team/${encodeURIComponent(
                    teamId
                )}/attempts`,
                {
                    method: "GET",

                    headers: {

                        "x-admin-username":
                            adminUsername,

                        "x-admin-password":
                            adminPassword

                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load attempts"
            );

        }


        // ----------------------------------
        // DISPLAY ATTEMPTS
        // ----------------------------------

        renderAttempts(
            data.attempts || []
        );


    } catch (error) {

        console.error(
            "Attempt history error:",
            error
        );


        attemptBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="loading"
                >

                    ⚠️
                    ${escapeHtml(
                        error.message
                    )}

                </td>

            </tr>
        `;

    }

}


// ==========================================
// RENDER ATTEMPTS
// ==========================================

function renderAttempts(attempts) {

    if (!attempts.length) {

        attemptBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="loading"
                >

                    No attempts recorded.

                </td>

            </tr>
        `;

        return;
    }


    attemptBody.innerHTML = "";


    attempts.forEach(
        (attempt, index) => {

            const row =
                document.createElement("tr");


            const score =
                Number(
                    attempt.score || 0
                );


            const elapsed =
                Number(
                    attempt.elapsedSeconds || 0
                );


            const isBest =
                attempt.isNewBest === true;


            row.innerHTML = `

                <!-- ATTEMPT NUMBER -->

                <td>

                    ${index + 1}

                </td>


                <!-- SCORE -->

                <td
                    class="${
                        isBest
                            ? "best-attempt"
                            : ""
                    }"
                >

                    ${score}/100

                    ${
                        isBest
                            ? " 🏆"
                            : ""
                    }

                </td>


                <!-- TIME -->

                <td>

                    ${formatTime(
                        elapsed
                    )}

                </td>


                <!-- BEST -->

                <td
                    class="${
                        isBest
                            ? "best-attempt"
                            : ""
                    }"
                >

                    ${
                        isBest
                            ? "BEST"
                            : "—"
                    }

                </td>

            `;


            attemptBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    teamModal.classList.remove(
        "show"
    );

}


if (closeTeamModal) {

    closeTeamModal.addEventListener(
        "click",
        closeModal
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

if (teamModal) {

    teamModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                teamModal
            ) {

                closeModal();

            }

        }
    );

}


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            teamModal &&
            teamModal.classList.contains(
                "show"
            )
        ) {

            closeModal();

        }

    }
);


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(teams) {

    // --------------------------------------
    // TOTAL TEAMS
    // --------------------------------------

    totalTeams.textContent =
        teams.length;


    // --------------------------------------
    // ACTIVE TEAMS
    // --------------------------------------

    const activeCount =
        teams.filter(
            team =>
                team.roundActive === true
        ).length;


    activeTeams.textContent =
        activeCount;


    // --------------------------------------
    // TOP SCORE
    // --------------------------------------

    const scores =
        teams.map(
            team =>
                Number(
                    team.bestScore || 0
                )
        );


    const highestScore =
        scores.length
            ? Math.max(
                ...scores
            )
            : 0;


    topScore.textContent =
        highestScore;


    // --------------------------------------
    // TOTAL ATTEMPTS
    // --------------------------------------

    const attempts =
        teams.reduce(
            (
                total,
                team
            ) => {

                return total +
                    Number(
                        team.attemptCount ||
                        0
                    );

            },
            0
        );


    totalAttempts.textContent =
        attempts;

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    if (
        seconds === null ||
        seconds === undefined ||
        isNaN(seconds)
    ) {

        return "--";

    }


    seconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds)
            )
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return `${String(
        minutes
    ).padStart(
        2,
        "0"
    )}:${String(
        remaining
    ).padStart(
        2,
        "0"
    )}`;

}


// ==========================================
// RANK ICON
// ==========================================

function getRankIcon(rank) {

    if (rank === 1) {

        return "🥇";

    }


    if (rank === 2) {

        return "🥈";

    }


    if (rank === 3) {

        return "🥉";

    }


    return "";

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// REFRESH BUTTON
// ==========================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async () => {

            refreshButton.disabled =
                true;


            refreshButton.textContent =
                "↻ Loading...";


            await loadLeaderboard();


            refreshButton.disabled =
                false;


            refreshButton.textContent =
                "↻ Refresh";

        }
    );

}

// ==========================================
// END TEAM ROUND
// ==========================================

async function endSelectedTeamRound() {

    if (!selectedTeam) {

        alert("Please select a team first.");

        return;
    }


    const teamId =
        selectedTeam.teamId;


    const confirmed =
        confirm(
            `Are you sure you want to end the round for ${teamId}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        endRoundButton.disabled = true;

        endRoundButton.textContent =
            "⏳ Ending...";


        const response =
            await fetch(
                `${API_URL}/api/admin/team/${encodeURIComponent(teamId)}/end-round`,
                {
                    method: "POST",

                    headers: {

                        "x-admin-username":
                            adminUsername,

                        "x-admin-password":
                            adminPassword

                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to end round"
            );

        }


        alert(
            `✅ Round ended successfully for ${teamId}.`
        );


        await loadLeaderboard();


        closeModal();


    } catch (error) {

        console.error(
            "End round error:",
            error
        );


        alert(
            `❌ ${error.message}`
        );


    } finally {

        endRoundButton.disabled =
            false;

        endRoundButton.textContent =
            "⏹️ End Round";

    }

}


// ==========================================
// END ROUND BUTTON
// ==========================================

if (endRoundButton) {

    endRoundButton.addEventListener(
        "click",
        endSelectedTeamRound
    );

}




// ==========================================
// LIVE TIMER UPDATE
// ==========================================

function updateLiveTimers() {

    const liveTimeElements =
        document.querySelectorAll(".live-time");

    liveTimeElements.forEach(element => {

        const endTime =
            Number(
                element.dataset.endTime
            );

        if (!endTime) {
            return;
        }

        const remainingSeconds =
            Math.max(
                0,
                Math.floor(
                    (endTime - Date.now()) / 1000
                )
            );

        element.textContent =
            `${formatTime(remainingSeconds)} left`;

    });

}
// ==========================================
// AUTO REFRESH
// ==========================================

// Refresh leaderboard data every 10 seconds
setInterval(
    loadLeaderboard,
    10000
);

// Update visible LIVE timers every second
setInterval(
    updateLiveTimers,
    1000
);

// ==========================================
// TOP TEAMS → ROOM ASSIGNMENT
// ==========================================

const topTeamCountInput =
    document.getElementById("topTeamCount");

const generateRoomsButton =
    document.getElementById("generateRoomsButton");

const room404Count =
    document.getElementById("room404Count");

const room405Count =
    document.getElementById("room405Count");

const room404Teams =
    document.getElementById("room404Teams");

const room405Teams =
    document.getElementById("room405Teams");

const roomAssignmentMessage =
    document.getElementById("roomAssignmentMessage");


if (generateRoomsButton) {

    generateRoomsButton.addEventListener(
        "click",
        async () => {

            const count =
                Number(topTeamCountInput.value);


            // -------------------------------
            // Validate
            // -------------------------------

            if (
                !Number.isInteger(count) ||
                count < 1 ||
                count > 50
            ) {

                roomAssignmentMessage.textContent =
                    "Please enter a number between 1 and 50.";

                return;
            }


            try {

                generateRoomsButton.disabled = true;

                generateRoomsButton.textContent =
                    "⏳ Assigning...";

                roomAssignmentMessage.textContent =
                    "Selecting top teams and assigning rooms...";


                // -------------------------------
                // SAVE ASSIGNMENT TO BACKEND
                // -------------------------------

                const response = await fetch(
                    `${API_URL}/api/admin/assign-rooms`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            "x-admin-username":
                                adminUsername,

                            "x-admin-password":
                                adminPassword
                        },

                        body: JSON.stringify({
                            count: count
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to assign rooms"
                    );

                }


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Room assignment failed"
                    );

                }


                // -------------------------------
                // CLEAR OLD RESULTS
                // -------------------------------

                room404Teams.innerHTML = "";
                room405Teams.innerHTML = "";


                // -------------------------------
                // ROOM 404
                // -------------------------------

                data.room404Teams.forEach(
                    (team, index) => {

                        const div =
                            document.createElement("div");

                        div.className =
                            "assigned-team";

                        div.innerHTML = `
    <span>
        ${index + 1}. ${escapeHtml(team.teamId)}
        — ${escapeHtml(team.teamName)}
        — ${team.score}/100
    </span>

    <button
        class="send-qr-button"
        data-team-id="${escapeHtml(team.teamId)}"
    >
        📲 SEND QR
    </button>
`;

room404Teams.appendChild(div);

const sendButton =
    div.querySelector(".send-qr-button");

sendButton.addEventListener("click", () => {
    sendQR(team.teamId, sendButton);
});

                    }
                );


                // -------------------------------
                // ROOM 405
                // -------------------------------

                data.room405Teams.forEach(
                    (team, index) => {

                        const div =
                            document.createElement("div");

                        div.className =
                            "assigned-team";

                        div.innerHTML = `
    <span>
        ${index + 1}. ${escapeHtml(team.teamId)}
        — ${escapeHtml(team.teamName)}
        — ${team.score}/100
    </span>

    <button
        class="send-qr-button"
        data-team-id="${escapeHtml(team.teamId)}"
    >
        📲 SEND QR
    </button>
`;

room405Teams.appendChild(div);

const sendButton =
    div.querySelector(".send-qr-button");

sendButton.addEventListener("click", () => {
    sendQR(team.teamId, sendButton);
});

                    }
                );


                // -------------------------------
                // COUNTS
                // -------------------------------

                room404Count.textContent =
                    data.room404Count;

                room405Count.textContent =
                    data.room405Count;


                // -------------------------------
                // SUCCESS
                // -------------------------------

                roomAssignmentMessage.textContent =
                    `✅ ${data.totalTeams} teams assigned successfully.`;

            } catch (error) {

                console.error(
                    "Room assignment error:",
                    error
                );

                roomAssignmentMessage.textContent =
                    `❌ ${error.message}`;

            } finally {

                generateRoomsButton.disabled =
                    false;

                generateRoomsButton.textContent =
                    "🎯 Generate Room Assignment";

            }

        }
    );

}
// ==========================================
// SEND QR
// ==========================================

async function sendQR(teamId, button) {

    try {

        button.disabled = true;
        button.textContent = "⏳ Sending...";

        const response = await fetch(
            `${API_URL}/api/admin/send-qr/${encodeURIComponent(teamId)}`,
            {
                method: "POST",

                headers: {
                    "x-admin-username":
                        adminUsername,

                    "x-admin-password":
                        adminPassword
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to send QR"
            );
        }

        button.textContent = "✅ QR SENT";

        button.classList.add("qr-sent");

    } catch (error) {

        console.error(
            "Send QR error:",
            error
        );

        button.textContent = "❌ FAILED";

        alert(
            `Unable to send QR: ${error.message}`
        );

        button.disabled = false;
    }
}