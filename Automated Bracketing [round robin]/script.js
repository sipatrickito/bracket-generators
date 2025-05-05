let teams = [];
let results = {};

function generateTables() {
    const titleValue = document.getElementById('title').value.trim();
    const teamsInput = document.getElementById('teams').value;
    teams = teamsInput.split('\n').map(team => team.trim()).filter(Boolean);

    if (!titleValue || teams.length < 2) {
        alert("Enter a valid title and at least 2 teams.");
        return;
    }

    // Reset state
    results = {};
    teams.forEach(team => {
        teams.forEach(opponent => {
            if (team !== opponent) {
                const key = `${team}_vs_${opponent}`;
                results[key] = null;
            }
        });
    });

    document.getElementById('title-container').innerHTML = `<h1>${titleValue}</h1>`;

    const bracketDiv = document.getElementById('bracket');
    bracketDiv.innerHTML = '';

    const lbTitle = document.createElement('h2');
    lbTitle.textContent = 'Leaderboard';

    const leaderboard = createLeaderboard();
    const gridTitle = document.createElement('h2');
    gridTitle.textContent = 'Match Results Grid';
    const matchGrid = createMatchGrid();

    bracketDiv.appendChild(lbTitle);
    bracketDiv.appendChild(leaderboard);
    bracketDiv.appendChild(gridTitle);
    bracketDiv.appendChild(matchGrid);
}

function createLeaderboard() {
    const table = document.createElement('table');
    const header = document.createElement('tr');
    ['Team', 'Games Played', 'Wins', 'Draws', 'Losses', 'Points'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        header.appendChild(th);
    });
    table.appendChild(header);

    let teamStats = teams.map(team => ({
        team,
        ...calculateStats(team)
    }));

    // Sort by points, then wins, then head-to-head
    teamStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;

        // Head-to-head check
        const key = `${a.team}_vs_${b.team}`;
        const revKey = `${b.team}_vs_${a.team}`;
        const result = results[key] || results[revKey];

        if (result === a.team) {
            a.headToHead = true;
            return -1;
        } else if (result === b.team) {
            b.headToHead = true;
            return 1;
        }

        return 0;
    });

    teamStats.forEach(({ team, games, wins, draws, losses, points, headToHead }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team}${headToHead ? ' *' : ''}</td>
            <td>${games}</td>
            <td>${wins}</td>
            <td>${draws}</td>
            <td>${losses}</td>
            <td>${points}</td>
        `;
        table.appendChild(row);
    });

    // Add explanation note
    const noteRow = document.createElement('tr');
    const noteCell = document.createElement('td');
    noteCell.colSpan = 6;
    noteCell.style.fontStyle = 'italic';
    noteCell.style.fontSize = '0.9em';
    noteCell.textContent = '* Ranked higher based on head-to-head result';
    table.appendChild(noteRow);
    noteRow.appendChild(noteCell);

    return table;
}


function createMatchGrid() {
    const table = document.createElement('table');
    table.className = 'match-grid';

    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th'));
    teams.forEach(team => {
        const th = document.createElement('th');
        th.textContent = team;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const winColor = "#e6fde9";
    const drawColor = "#fcfde6";
    const lossColor = "#ffdddd";

    teams.forEach((rowTeam, i) => {
        const row = document.createElement('tr');
        const rowHeader = document.createElement('td');
        rowHeader.textContent = rowTeam;
        row.appendChild(rowHeader);

        teams.forEach((colTeam, j) => {
            const cell = document.createElement('td');
            const key = `${rowTeam}_vs_${colTeam}`;
            const revKey = `${colTeam}_vs_${rowTeam}`;
            const val = results[key] || results[revKey];

            if (i === j) {
                cell.textContent = '—';
                cell.style.backgroundColor = "#e5e7eb"; // Gray for the diagonal "no match"
            } else {
                if (val === null) {
                    cell.textContent = '';
                    cell.style.backgroundColor = "#ffffff"; // Default white for empty cells
                } else if (val === 'DRAW') {
                    cell.textContent = 'D';
                    cell.style.backgroundColor = drawColor; // Apply draw color
                } else if (val === rowTeam) {
                    cell.textContent = 'W';
                    cell.style.backgroundColor = winColor; // Apply win color
                } else {
                    cell.textContent = 'L';
                    cell.style.backgroundColor = lossColor; // Apply loss color
                }

                cell.style.cursor = 'pointer';
                cell.onclick = () => {
                    showWinnerModal(rowTeam, colTeam, key, revKey);
                };
            }

            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    return table;
}

function calculateStats(team) {
    let games = 0, wins = 0, losses = 0, draws = 0;
    const seen = new Set();

    for (const key in results) {
        const [t1, , t2] = key.split('_');
        const matchId = [t1, t2].sort().join('_vs_');
        if (seen.has(matchId)) continue;
        seen.add(matchId);

        if (t1 === team || t2 === team) {
            const result = results[key];
            if (result) {
                games++;
                if (result === 'DRAW') {
                    draws++;
                } else if (result === team) {
                    wins++;
                } else {
                    losses++;
                }
            }
        }
    }

    const points = wins * 3 + draws;
    return { games, wins, losses, draws, points };
}


function updateTables() {
    const bracketDiv = document.getElementById('bracket');
    bracketDiv.innerHTML = '';

    const lbTitle = document.createElement('h2');
    lbTitle.textContent = 'Leaderboard';
    const leaderboard = createLeaderboard();
    const gridTitle = document.createElement('h2');
    gridTitle.textContent = 'Match Results Grid';
    const matchGrid = createMatchGrid();

    bracketDiv.appendChild(lbTitle);
    bracketDiv.appendChild(leaderboard);
    bracketDiv.appendChild(gridTitle);
    bracketDiv.appendChild(matchGrid);
}

function showWinnerModal(teamA, teamB, key, revKey) {
    const modal = document.getElementById('winner-modal');
    const question = document.getElementById('modal-question');
    const buttons = document.getElementById('winner-buttons');

    question.textContent = `Who won: ${teamA} or ${teamB}?`;
    buttons.innerHTML = '';

    [teamA, teamB].forEach(team => {
        const btn = document.createElement('button');
        btn.textContent = team;
        btn.onclick = () => {
            results[key] = team;
            results[revKey] = team;
            modal.style.display = 'none';
            updateTables();
        };
        buttons.appendChild(btn);
    });

    const drawBtn = document.createElement('button');
    drawBtn.textContent = 'Draw';
    drawBtn.onclick = () => {
        results[key] = 'DRAW';
        results[revKey] = 'DRAW';
        modal.style.display = 'none';
        updateTables();
    };
    buttons.appendChild(drawBtn);

    modal.style.display = 'block';
}

window.onclick = function(event) {
    const modal = document.getElementById('winner-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
