const API_URL = (() => {
    if (window.location.pathname.toLowerCase().startsWith('/aiquestx')) {
        return `${window.location.origin}/AiQuestx`;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return (window.location.port === '6011' || window.location.port === '5000') ? '' : 'http://localhost:6011';
    }
    return window.location.origin;
})();
let adminUsername = "";
let adminPassword = "";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const totalTeams = document.getElementById("totalTeams");
const topScore = document.getElementById("topScore");

const leaderboardBody =
    document.getElementById("leaderboardBody");

const dashboardMessage =
    document.getElementById("dashboardMessage");


// ==========================================
// ADMIN LOGIN
// ==========================================

loginButton.addEventListener("click", loginAdmin);


async function loginAdmin() {

    adminUsername = usernameInput.value.trim();
    adminPassword = passwordInput.value;

    if (!adminUsername || !adminPassword) {

        loginMessage.textContent =
            "Enter username and password.";

        return;
    }

    loginButton.disabled = true;

    loginMessage.textContent =
        "Checking credentials...";

    try {

        const response = await fetch(
            `${API_URL}/api/admin/leaderboard`,
            {
                method: "GET",

                headers: {
                    "x-admin-username": adminUsername,
                    "x-admin-password": adminPassword
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Invalid credentials"
            );
        }

        // Login successful
        loginSection.style.display = "none";

        dashboardSection.style.display = "block";

        displayLeaderboard(data);

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            error.message || "Login failed.";

        loginButton.disabled = false;
    }
}


// ==========================================
// DISPLAY LEADERBOARD
// ==========================================

function displayLeaderboard(data) {

    leaderboardBody.innerHTML = "";

    totalTeams.textContent =
        data.count;

    if (!data.teams || data.teams.length === 0) {

        topScore.textContent = "0";

        dashboardMessage.textContent =
            "No teams available.";

        return;
    }

    topScore.textContent =
        data.teams[0].bestScore || 0;


    data.teams.forEach((team, index) => {

        const row =
            document.createElement("tr");

        const rankCell =
            document.createElement("td");

        const teamIdCell =
            document.createElement("td");

        const teamNameCell =
            document.createElement("td");

        const scoreCell =
            document.createElement("td");

        const timeCell =
            document.createElement("td");

        const attemptsCell =
            document.createElement("td");


        rankCell.textContent =
            index + 1;

        teamIdCell.textContent =
            team.teamId;

        teamNameCell.textContent =
            team.teamName || "-";

        scoreCell.textContent =
            `${team.bestScore || 0} / 100`;

        timeCell.textContent =
            formatElapsedTime(
                team.bestScoreElapsedSeconds
            );

        attemptsCell.textContent =
            team.attemptCount || 0;
            const detailsCell =
    document.createElement("td");

const detailsButton =
    document.createElement("button");

detailsButton.textContent = "VIEW";

detailsButton.style.width = "auto";
detailsButton.style.padding = "8px 14px";

detailsButton.addEventListener(
    "click",
    () => {
        loadTeamAttempts(team.teamId);
    }
);

detailsCell.appendChild(detailsButton);


        row.appendChild(rankCell);
        row.appendChild(teamIdCell);
        row.appendChild(teamNameCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
        row.appendChild(attemptsCell);
        row.appendChild(detailsCell);

        leaderboardBody.appendChild(row);

    });

}


// ==========================================
// FORMAT ELAPSED TIME
// ==========================================

function formatElapsedTime(seconds) {

    if (
        seconds === null ||
        seconds === undefined
    ) {
        return "-";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}
// ==========================================
// LOAD TEAM ATTEMPTS
// ==========================================

async function loadTeamAttempts(teamId) {

    const attemptHistory =
        document.getElementById("attemptHistory");

    const attemptTitle =
        document.getElementById("attemptTitle");

    const attemptBody =
        document.getElementById("attemptBody");

    attemptHistory.style.display = "block";

    attemptTitle.textContent =
        `${teamId} - Attempt History`;

    attemptBody.innerHTML = `
        <tr>
            <td colspan="5">
                Loading...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/admin/team/${encodeURIComponent(teamId)}/attempts`,
            {
                method: "GET",

                headers: {
                    "x-admin-username": adminUsername,
                    "x-admin-password": adminPassword
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load attempts"
            );
        }

        attemptBody.innerHTML = "";

        if (
            !data.attempts ||
            data.attempts.length === 0
        ) {

            attemptBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No attempts found.
                    </td>
                </tr>
            `;

            return;
        }


        data.attempts.forEach(
            (attempt, index) => {

                const row =
                    document.createElement("tr");

                const attemptCell =
                    document.createElement("td");

                const scoreCell =
                    document.createElement("td");

                const timeCell =
                    document.createElement("td");

                const bestCell =
                    document.createElement("td");

                const dateCell =
                    document.createElement("td");


                attemptCell.textContent =
                    index + 1;

                scoreCell.textContent =
                    `${attempt.score} / 100`;

                timeCell.textContent =
                    formatElapsedTime(
                        attempt.elapsedSeconds
                    );

                bestCell.textContent =
                    attempt.isNewBest
                        ? "★ YES"
                        : "No";

                dateCell.textContent =
                    attempt.attemptedAt
                        ? new Date(
                            attempt.attemptedAt
                        ).toLocaleString()
                        : "-";


                row.appendChild(attemptCell);
                row.appendChild(scoreCell);
                row.appendChild(timeCell);
                row.appendChild(bestCell);
                row.appendChild(dateCell);

                attemptBody.appendChild(row);

            }
        );

        attemptHistory.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Attempt history error:",
            error
        );

        attemptBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load attempts.
                </td>
            </tr>
        `;
    }
}
// ==========================================
// AUTO REFRESH LEADERBOARD
// ==========================================

setInterval(async () => {

    if (
        dashboardSection.style.display !== "none" &&
        adminUsername &&
        adminPassword
    ) {

        try {

            const response = await fetch(
                `${API_URL}/api/admin/leaderboard`,
                {
                    method: "GET",
                    headers: {
                        "x-admin-username": adminUsername,
                        "x-admin-password": adminPassword
                    }
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            if (data.success) {
                displayLeaderboard(data);
            }

        } catch (error) {

            console.error(
                "Leaderboard refresh error:",
                error
            );

        }

    }

}, 5000);
// ==========================================
// TOP TEAMS → ROOM ASSIGNMENT
// ==========================================

const topTeamCountInput = document.getElementById("topTeamCount");
const generateRoomsButton = document.getElementById("generateRoomsButton");

const room404Count = document.getElementById("room404Count");
const room405Count = document.getElementById("room405Count");

const room404Teams = document.getElementById("room404Teams");
const room405Teams = document.getElementById("room405Teams");

const roomAssignmentMessage =
    document.getElementById("roomAssignmentMessage");


generateRoomsButton.addEventListener("click", async () => {

    const count = 30;

    try {

        roomAssignmentMessage.textContent =
            "Loading top teams...";

        // Get leaderboard
        const response = await fetch(
    `${API_URL}/api/admin/leaderboard`,
    {
        method: "GET",
        headers: {
            "x-admin-username": adminUsername,
            "x-admin-password": adminPassword
        }
    }
);

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Unable to load leaderboard"
            );
        }

        // Get teams from response
        const teams = data.teams || data.leaderboard || [];

        if (teams.length === 0) {

            roomAssignmentMessage.textContent =
                "No teams found.";

            return;
        }
        // --------------------------------------
// SAVE TOP 30 TO DATABASE
// --------------------------------------

const assignmentResponse = await fetch(
    `${API_URL}/api/admin/assign-rooms`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-admin-username": adminUsername,
            "x-admin-password": adminPassword
        },

        body: JSON.stringify({
            count: 30
        })
    }
);

const assignmentData =
    await assignmentResponse.json();

if (!assignmentResponse.ok) {

    throw new Error(
        assignmentData.message ||
        "Unable to assign rooms"
    );
}

        // Take requested number of top teams
        const topTeams = teams
            .sort((a, b) => {

                const scoreA = Number(a.bestScore || a.score || 0);
                const scoreB = Number(b.bestScore || b.score || 0);

                return scoreB - scoreA;
            })
            .slice(0, count);


        // Clear previous results
        room404Teams.innerHTML = "";
        room405Teams.innerHTML = "";


        // Split approximately 50/50
        const room404Number = Math.ceil(topTeams.length / 2);

        const teams404 = topTeams.slice(
            0,
            room404Number
        );

        const teams405 = topTeams.slice(
            room404Number
        );


       // Display Room 404
teams404.forEach((team, index) => {

    const div = document.createElement("div");

    div.className = "assigned-team";

    const systemNumbers = [
        3, 16, 27, 40, 49,
        52, 61, 64, 6, 21,
        32, 44, 56, 59, 69
    ];

    const systemNumber =
        systemNumbers[index];

    div.textContent =
        `${index + 1}. ${team.teamId} — ${team.teamName} — System ${systemNumber}`;

    room404Teams.appendChild(div);
});


        // Display Room 405
teams405.forEach((team, index) => {

    const div = document.createElement("div");

    div.className = "assigned-team";

    const systemNumbers = [
        3, 16, 27, 40, 49,
        52, 61, 64, 6, 21,
        32, 44, 56, 59, 69
    ];

    const systemNumber =
        systemNumbers[index];

    div.textContent =
        `${index + 1}. ${team.teamId} — ${team.teamName} — System ${systemNumber}`;

    room405Teams.appendChild(div);
});


        // Update counts

        room404Count.textContent =
            teams404.length;

        room405Count.textContent =
            teams405.length;


        roomAssignmentMessage.textContent =
            `${topTeams.length} teams assigned successfully.`;

    } catch (error) {

        console.error(
            "Room assignment error:",
            error
        );

        roomAssignmentMessage.textContent =
            "Unable to generate room assignment.";
    }

});
// ==========================================
// END TEST
// ==========================================

const endTestButton =
    document.getElementById("endTestButton");

const endTestMessage =
    document.getElementById("endTestMessage");


if (endTestButton) {

    endTestButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to end the test for all teams?"
                );

            if (!confirmed) {
                return;
            }

            endTestButton.disabled = true;

            endTestMessage.textContent =
                "Ending test...";

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/admin/end-test`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

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
                        "Unable to end test"
                    );
                }

                endTestMessage.textContent =
                    "✅ Test ended successfully.";

                endTestMessage.style.color =
                    "#5df2a4";

            } catch (error) {

                console.error(
                    "End test error:",
                    error
                );

                endTestMessage.textContent =
                    error.message ||
                    "Unable to end test.";

                endTestMessage.style.color =
                    "#ff667a";

                endTestButton.disabled =
                    false;
            }

        }
    );

}