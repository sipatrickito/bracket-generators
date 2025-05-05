$(document).on('ready', function () {
    var knownBrackets = [2, 4, 8, 16, 32],
        bracketCount = 0;

    // Set Tournament Title
    $('#setTitleBtn').on('click', function () {
        var title = $('#tournamentTitle').val().trim();
        if (title !== '') {
            $('#displayTitle').text(title).show(); // Display the title
            $('#titleContainer').hide(); // Hide the title input container
        } else {
            alert("Please enter a valid tournament title.");
        }
    });

    function getBracket(base, teamList) {
        let closest = _.find(knownBrackets, function (k) { return k >= base; });
        let byes = closest - base;

        if (byes > 0) base = closest;

        let rounds = Math.log2(base);
        let brackets = [];
        let gameId = 1;

        for (let r = 1; r <= rounds; r++) {
            let gamesInRound = base / Math.pow(2, r);
            for (let g = 0; g < gamesInRound; g++) {
                brackets.push({
                    round: r,
                    game: g,
                    id: gameId++,
                    teams: [],
                    nextGameId: null,
                    locked: false
                });
            }
        }

        // Link games to next round
        for (let i = 0; i < brackets.length; i++) {
            let current = brackets[i];
            if (current.round < rounds) {
                let nextRound = current.round + 1;
                let nextGameIndex = Math.floor(current.game / 2);
                let nextGame = brackets.find(b => b.round === nextRound && b.game === nextGameIndex);
                current.nextGameId = nextGame.id;
            }
        }

        // Assign teams to first round
        let firstRound = brackets.filter(b => b.round === 1);
        for (let i = 0; i < firstRound.length; i++) {
            firstRound[i].teams = [
                teamList[i * 2] || 'BYE',
                teamList[i * 2 + 1] || 'BYE'
            ];
        }

        renderBrackets(brackets);
    }

    function advanceTeam(struct, group, currentGame, winnerName) {
        if (!currentGame.nextGameId) return;
    
        const nextGame = struct.find(b => b.id === currentGame.nextGameId);
        const nextRoundDiv = group.find('.r' + nextGame.round);
        const nextGameBox = nextRoundDiv.find('.bracketbox').filter(function () {
            return $(this).find('.info').text().trim() === 'Game ' + nextGame.id;
        });
    
        const existing = nextGameBox.find('.teama, .teamb').filter(function () {
            return $(this).text() === winnerName;
        }).length;
    
        if (existing > 0) return;
    
        const feederGames = struct.filter(g =>
            g.round === currentGame.round && g.nextGameId === currentGame.nextGameId
        );
    
        if (feederGames.length !== 2) return;
    
        const isFirstFeeder = feederGames[0].id === currentGame.id;
        const nextClass = isFirstFeeder ? 'teama' : 'teamb';
    
        if (nextGameBox.find('.' + nextClass).length > 0) return;
    
        const advanceSpan = $('<span class="' + nextClass + '">' + winnerName + '</span>');
    
        advanceSpan.on('click', function () {
            const box = $(this).closest('.bracketbox');
            if (box.data('locked')) return;
        
            if (!canPlayGame(struct, nextGame)) {
                alert('You must complete the previous games first.');
                return;
            }
        
            $(this).siblings('.teama, .teamb').removeClass('selected');
            $(this).addClass('selected');
            box.data('locked', true);
            nextGame.locked = true;
        
            advanceTeam(struct, group, nextGame, $(this).text());
        
            if (!nextGame.nextGameId) {
                $('#winnerName').html( $(this).text() + ' 🏆');
                $('#winnerDisplay').fadeIn(); // Show the winner display
                $('#winnerLabel').fadeIn();  // Show the "Winner:" label
            }
        });        
    
        nextGameBox.append(advanceSpan);
    }
     

    function renderBrackets(struct) {
        let groupCount = Math.max(...struct.map(b => b.round));
        let group = $('<div class="group' + (groupCount + 1) + '" id="b' + bracketCount + '"></div>');
    
        let autoAdvanceQueue = []; // Store BYE-advanced teams
    
        for (let r = 1; r <= groupCount; r++) {
            let round = $('<div class="r' + r + '"></div>');
            let roundGames = struct.filter(b => b.round === r);
    
            roundGames.forEach(game => {
                let box = $('<div><div class="bracketbox"><span class="info">Game ' + game.id + '</span></div></div>');
    
                if (game.teams.length > 0) {
                    game.teams.forEach((team, idx) => {
                        const isBye = team === 'BYE';
                        let span = $('<span class="' + (idx === 0 ? 'teama' : 'teamb') + '">' + team + '</span>');
    
                        box.find('.bracketbox').append(span);
    
                        // Skip click binding for BYEs
                        if (isBye) return;
    
                        span.on('click', function () {
                            const box = $(this).closest('.bracketbox');
                            if (box.data('locked')) return;
    
                            if (!canPlayGame(struct, game)) {
                                alert('You must complete the previous games first.');
                                return;
                            }
    
                            $(this).siblings('.teama, .teamb').removeClass('selected');
                            $(this).addClass('selected');
                            box.data('locked', true);
                            game.locked = true;
    
                            advanceTeam(struct, group, game, $(this).text());
                        });
                    });
    
                    // Queue for auto-advance if only one real team + BYE
                    if (game.teams.includes('BYE') && game.teams.filter(t => t !== 'BYE').length === 1) {
                        const realTeam = game.teams.find(t => t !== 'BYE');
                        autoAdvanceQueue.push({ game, realTeam });
                    }
                }
    
                round.append(box);
            });
    
            group.append(round);
        }
    
        $('#brackets').append(group);
        bracketCount++;
    
        // BYE auto-advances
        autoAdvanceQueue.forEach(({ game, realTeam }) => {
            const bracketBox = $('#b' + (bracketCount - 1)).find('.r' + game.round)
                .find('.bracketbox')
                .filter(function () {
                    return $(this).find('.info').text().trim() === 'Game ' + game.id;
                });
    
            bracketBox.find('span').each(function () {
                if ($(this).text() === realTeam) {
                    $(this).addClass('selected');
                }
            });
    
            bracketBox.data('locked', true);
            game.locked = true;
            advanceTeam(struct, group, game, realTeam);
        });
    }
    
    function canPlayGame(struct, game) {
        if (game.round === 1) return true;

        const prevRound = game.round - 1;

        const feederGames = struct.filter(g =>
            g.round === prevRound && g.nextGameId === game.id
        );

        return feederGames.every(prev => prev.locked === true);
    }

    function getTopSeededTeams(teamList, byesNeeded) {
        const selected = [];
    
        while (selected.length < byesNeeded) {
            const input = prompt(`Enter the name of top seed #${selected.length + 1} (to receive a BYE):\n${teamList.join('\n')}`);
            if (!input) continue;
    
            if (!teamList.includes(input)) {
                alert("That team doesn't exist. Try again.");
                continue;
            }
    
            if (selected.includes(input)) {
                alert("You already selected that team.");
                continue;
            }
    
            selected.push(input);
        }
    
        return selected;
    }

    function assignByesToTopSeeds(teamList, topSeeds, totalSlots) {
        const listWithByes = [];
        const used = new Set();
    
        for (let team of teamList) {
            listWithByes.push(team);
            if (topSeeds.includes(team)) {
                listWithByes.push('BYE'); // Give this team a BYE
                used.add(team);
            }
        }
    
        // Fill the rest with remaining teams
        while (listWithByes.length < totalSlots) {
            listWithByes.push('BYE');
        }
    
        return listWithByes.slice(0, totalSlots); // trim extra if needed
    }    

    $('#generateBracket').on('click', function () {
        let rawInput = $('#teamNames').val().trim();
        let teamList = rawInput.split('\n').map(name => name.trim()).filter(name => name !== '');
    
        if (teamList.length < 2 || teamList.length > 32) {
            alert("Please enter between 2 and 32 team names.");
            return;
        }
    
        const knownBrackets = [2, 4, 8, 16, 32];
        const closest = _.find(knownBrackets, k => k >= teamList.length);
        const byesNeeded = closest - teamList.length;
    
        let finalTeams = teamList;
    
        if (byesNeeded > 0) {
            const topSeeds = getTopSeededTeams(teamList, byesNeeded);
            finalTeams = assignByesToTopSeeds(teamList, topSeeds, closest);
        }
    
        $('#brackets').empty();
        $('#winnerName').text('');
        $('#winnerDisplay').hide();
    
        getBracket(finalTeams.length, finalTeams);
    });
    
});
