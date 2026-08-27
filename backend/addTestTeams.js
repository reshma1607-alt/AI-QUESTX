const API_URL = "https://ai-questx.onrender.com";

async function createTeams() {
    let created = 0;
    let existing = 0;

    for (let i = 3; i <= 100; i++) {
        const teamId = `AQ${String(i).padStart(3, "0")}`;
        const teamName = `Team ${String(i).padStart(3, "0")}`;

        try {
            const response = await fetch(`${API_URL}/api/teams/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    teamId,
                    teamName
                })
            });

            const data = await response.json();

            if (response.status === 201) {
                console.log(`✅ ${teamId} created`);
                created++;
            } else if (response.status === 409) {
                console.log(`⚠️ ${teamId} already exists`);
                existing++;
            } else {
                console.log(`❌ ${teamId}`, data);
            }

        } catch (error) {
            console.log(`❌ ${teamId}: ${error.message}`);
        }
    }

    console.log("\n==============================");
    console.log(`Created:  ${created}`);
    console.log(`Existing: ${existing}`);
    console.log(`Total:    ${created + existing + 2}`);
    console.log("==============================");
}

createTeams();