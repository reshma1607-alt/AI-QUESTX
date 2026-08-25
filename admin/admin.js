const API_URL = "http://localhost:5000";

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