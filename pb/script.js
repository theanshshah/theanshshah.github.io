// Local Storage Management
function saveData() {
    const data = {
        court1: {
            team1: document.getElementById('court1team1').value,
            team2: document.getElementById('court1team2').value,
            servingTeam: document.getElementById('court1servingTeam').value
        },
        court2: {
            team1: document.getElementById('court2team1').value,
            team2: document.getElementById('court2team2').value,
            servingTeam: document.getElementById('court2servingTeam').value
        },
        nextMatch: document.getElementById('nextMatch').value,
        upcoming: []
    };

    document.querySelectorAll('.match-input-group').forEach(match => {
        data.upcoming.push({
            team1: match.querySelector('.upcoming-team1').value,
            team2: match.querySelector('.upcoming-team2').value,
            time: match.querySelector('.upcoming-time').value,
            court: match.querySelector('.upcoming-court').value
        });
    });

    localStorage.setItem('pbData', JSON.stringify(data));
    updateDisplay();
    showSaveFeedback();
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('pbData')) || {};
    
    // Court 1
    document.getElementById('court1team1').value = data.court1?.team1 || '';
    document.getElementById('court1team2').value = data.court1?.team2 || '';
    document.getElementById('court1servingTeam').value = data.court1?.servingTeam || 'team1';
    
    // Court 2
    document.getElementById('court2team1').value = data.court2?.team1 || '';
    document.getElementById('court2team2').value = data.court2?.team2 || '';
    document.getElementById('court2servingTeam').value = data.court2?.servingTeam || 'team1';
    
    document.getElementById('nextMatch').value = data.nextMatch || '';
    
    const upcomingContainer = document.getElementById('upcomingMatches');
    upcomingContainer.innerHTML = '';
    (data.upcoming || []).forEach(match => {
        addMatchField(match.team1, match.team2, match.time, match.court);
    });
}

function updateDisplay() {
    const data = JSON.parse(localStorage.getItem('pbData')) || {};
    
    // Update Court 1
    document.getElementById('court1displayTeam1').textContent = data.court1?.team1 || 'Team A';
    document.getElementById('court1displayTeam2').textContent = data.court1?.team2 || 'Team B';
    document.getElementById('court1serveStatus').textContent = 
        data.court1?.servingTeam === 'team1' ? 'Current Serve' : 'Receiving';

    // Update Court 2
    document.getElementById('court2displayTeam1').textContent = data.court2?.team1 || 'Team C';
    document.getElementById('court2displayTeam2').textContent = data.court2?.team2 || 'Team D';
    document.getElementById('court2serveStatus').textContent = 
        data.court2?.servingTeam === 'team1' ? 'Current Serve' : 'Receiving';

    // Update Next Match
    document.getElementById('nextMatchDisplay').textContent = data.nextMatch || 'Upcoming Match';

    // Update Schedule
    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';
    
    const matchesByCourt = {1: [], 2: []};
    (data.upcoming || []).forEach(match => {
        const court = match.court || '1';
        matchesByCourt[court].push(match);
    });

    for (const [courtNumber, matches] of Object.entries(matchesByCourt)) {
        const section = document.createElement('div');
        section.className = 'court-section';
        section.innerHTML = `
            <div class="court-number">Court ${courtNumber}</div>
            <ul class="match-list"></ul>
        `;
        
        const list = section.querySelector('.match-list');
        matches.forEach(match => {
            const li = document.createElement('li');
            li.className = 'match-item';
            li.innerHTML = `
                <span>${match.team1 || 'Team A'} vs ${match.team2 || 'Team B'}</span>
                <span>${match.time || 'TBD'}</span>
            `;
            list.appendChild(li);
        });
        upcomingList.appendChild(section);
    }
}

function addMatchField(team1 = '', team2 = '', time = '', court = '1') {
    const div = document.createElement('div');
    div.className = 'match-input-group';
    div.innerHTML = `
        <input type="text" placeholder="Team A" class="upcoming-team1" value="${team1}" 
            style="background: ${getRandomTeamColor()}; font-family: 'Luckiest Guy'">
        <span style="font-family: 'Shadows Into Light'">vs</span>
        <input type="text" placeholder="Team B" class="upcoming-team2" value="${team2}"
            style="background: ${getRandomTeamColor()}; font-family: 'Luckiest Guy'">
        <input type="time" class="upcoming-time" value="${time}">
        <select class="upcoming-court" style="padding: 0.5rem">
            <option value="1" ${court === '1' ? 'selected' : ''}>Court 1</option>
            <option value="2" ${court === '2' ? 'selected' : ''}>Court 2</option>
        </select>
        <button type="button" class="remove-match">×</button>
    `;
    document.getElementById('upcomingMatches').appendChild(div);
}

function getRandomTeamColor() {
    const colors = ['#FF6B6B30', '#4ECDC430', '#FFE66D30', '#FF9F1C30', '#9B59B630'];
    return colors[Math.floor(Math.random() * colors.length)];
}

document.getElementById('matchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveData();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-match')) {
        e.target.parentElement.remove();
    }
});

function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    const displaySection = document.getElementById('displaySection');
    if (window.location.hash === '#admin') {
        adminPanel.classList.add('show');
        displaySection.style.display = 'none';
    } else {
        adminPanel.classList.remove('show');
        displaySection.style.display = 'block';
    }
}

function showSaveFeedback() {
    const btn = document.querySelector('.admin-btn.save');
    btn.style.backgroundColor = '#4ECDC4';
    btn.textContent = '✓ Saved!';
    setTimeout(() => {
        btn.style.backgroundColor = '#2ECC71';
        btn.textContent = 'Save All 💾';
    }, 2000);
}

window.addEventListener('load', () => {
    loadData();
    updateDisplay();
    toggleAdmin();
});

window.addEventListener('hashchange', toggleAdmin);