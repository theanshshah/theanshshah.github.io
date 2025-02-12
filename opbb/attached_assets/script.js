// Admin Authentication
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/check-admin');
        const data = await response.json();
        return data.authenticated;
    } catch (error) {
        console.error('Error checking auth:', error);
        return false;
    }
}

async function showAdminLogin() {
    const loginDiv = document.createElement('div');
    loginDiv.className = 'admin-login';
    loginDiv.innerHTML = `
        <form class="login-form" id="adminLoginForm">
            <div class="login-header">🔐 Admin Login</div>
            <input type="password" class="login-input" placeholder="Enter Password" required>
            <button type="submit" class="login-button">Login</button>
            <div class="login-error" style="display: none;"></div>
        </form>
    `;
    document.body.appendChild(loginDiv);

    const form = document.getElementById('adminLoginForm');
    const errorDiv = form.querySelector('.login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = form.querySelector('input').value;

        try {
            const response = await fetch('/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            if (data.status === 'success') {
                loginDiv.remove();
                showAdminPanel();
            } else {
                errorDiv.textContent = 'Invalid password';
                errorDiv.style.display = 'block';
                form.querySelector('input').value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}

// Modify the toggleAdmin function
async function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    const displaySection = document.getElementById('displaySection');

    if (window.location.hash === '#admin') {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) {
            showAdminLogin();
            return;
        }
        showAdminPanel();
    } else {
        hideAdminPanel();
    }
}

function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const displaySection = document.getElementById('displaySection');
    adminPanel.classList.add('show');
    displaySection.style.display = 'none';
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const displaySection = document.getElementById('displaySection');
    adminPanel.classList.remove('show');
    displaySection.style.display = 'block';
}

// Modify the saveDataToServer function to handle unauthorized errors
async function saveDataToServer(data) {
    try {
        const response = await fetch('/api/update-match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            window.location.hash = '';
            return;
        }
        if (!response.ok) throw new Error('Network response was not ok');
        showSaveFeedback();
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// WebSocket connection
const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('match_update', (data) => {
    updateDisplayFromData(data);
    updateAdminFormFromData(data);
});

// Match Timer Management
class MatchTimer {
    constructor(courtNumber) {
        this.courtNumber = courtNumber;
        this.timeRemaining = 600; // 10 minutes in seconds
        this.isRunning = false;
        this.timer = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
        }
    }

    reset() {
        this.timeRemaining = 600;
        this.pause();
        this.updateDisplay();
    }

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.updateDisplay();
            this.saveTimeToServer();
        } else {
            this.complete();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById(`court${this.courtNumber}timer`).textContent = `Time Remaining: ${display}`;
        document.getElementById(`court${this.courtNumber}TimerDisplay`).textContent = display;
    }

    saveTimeToServer() {
        const data = getCurrentFormData();
        data[`court${this.courtNumber}`].timeRemaining = this.timeRemaining;
        saveDataToServer(data);
    }

    complete() {
        this.pause();
        const statusSelect = document.getElementById(`court${this.courtNumber}status`);
        statusSelect.value = 'completed';
        updateMatchStatus(this.courtNumber);
        saveDataToServer(getCurrentFormData());
    }
}

// Initialize timers for both courts
const court1Timer = new MatchTimer(1);
const court2Timer = new MatchTimer(2);

function getCurrentFormData() {
    const data = {
        court1: {
            team1: document.getElementById('court1team1').value,
            team2: document.getElementById('court1team2').value,
            servingTeam: document.getElementById('court1servingTeam').value,
            status: document.getElementById('court1status').value,
            timeRemaining: court1Timer.timeRemaining
        },
        court2: {
            team1: document.getElementById('court2team1').value,
            team2: document.getElementById('court2team2').value,
            servingTeam: document.getElementById('court2servingTeam').value,
            status: document.getElementById('court2status').value,
            timeRemaining: court2Timer.timeRemaining
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

    return data;
}

async function saveDataToServer(data) {
    try {
        const response = await fetch('/api/update-match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            window.location.hash = '';
            return;
        }
        if (!response.ok) throw new Error('Network response was not ok');
        showSaveFeedback();
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

async function loadInitialData() {
    try {
        const response = await fetch('/api/match-data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        updateDisplayFromData(data);
        updateAdminFormFromData(data);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateAdminFormFromData(data) {
    // Court 1
    document.getElementById('court1team1').value = data.court1?.team1 || '';
    document.getElementById('court1team2').value = data.court1?.team2 || '';
    document.getElementById('court1servingTeam').value = data.court1?.servingTeam || 'team1';
    document.getElementById('court1status').value = data.court1?.status || 'paused';
    if (data.court1?.timeRemaining !== undefined) {
        court1Timer.timeRemaining = data.court1.timeRemaining;
        court1Timer.updateDisplay();
    }

    // Court 2
    document.getElementById('court2team1').value = data.court2?.team1 || '';
    document.getElementById('court2team2').value = data.court2?.team2 || '';
    document.getElementById('court2servingTeam').value = data.court2?.servingTeam || 'team1';
    document.getElementById('court2status').value = data.court2?.status || 'paused';
    if (data.court2?.timeRemaining !== undefined) {
        court2Timer.timeRemaining = data.court2.timeRemaining;
        court2Timer.updateDisplay();
    }

    document.getElementById('nextMatch').value = data.nextMatch || '';

    const upcomingContainer = document.getElementById('upcomingMatches');
    upcomingContainer.innerHTML = '';
    (data.upcoming || []).forEach(match => {
        addMatchField(match.team1, match.team2, match.time, match.court);
    });
}

function updateDisplayFromData(data) {
    // Update Court 1
    document.getElementById('court1displayTeam1').textContent = data.court1?.team1 || 'Team A';
    document.getElementById('court1displayTeam2').textContent = data.court1?.team2 || 'Team B';
    document.getElementById('court1serveStatus').textContent =
        data.court1?.servingTeam === 'team1' ? 'Current Serve' : 'Receiving';
    document.getElementById('court1StatusBadge').textContent = (data.court1?.status || 'PAUSED').toUpperCase();
    document.getElementById('court1StatusBadge').className = `match-status-badge ${data.court1?.status || 'paused'}`;

    // Update Court 2
    document.getElementById('court2displayTeam1').textContent = data.court2?.team1 || 'Team C';
    document.getElementById('court2displayTeam2').textContent = data.court2?.team2 || 'Team D';
    document.getElementById('court2serveStatus').textContent =
        data.court2?.servingTeam === 'team1' ? 'Current Serve' : 'Receiving';
    document.getElementById('court2StatusBadge').textContent = (data.court2?.status || 'PAUSED').toUpperCase();
    document.getElementById('court2StatusBadge').className = `match-status-badge ${data.court2?.status || 'paused'}`;

    // Update Next Match
    document.getElementById('nextMatchDisplay').textContent = data.nextMatch || 'Upcoming Match';

    // Update Schedule
    updateUpcomingList(data.upcoming || []);
}

function updateUpcomingList(upcoming) {
    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';

    const matchesByCourt = {1: [], 2: []};
    upcoming.forEach(match => {
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

// Update match status and timer state
function updateMatchStatus(courtNumber) {
    const status = document.getElementById(`court${courtNumber}status`).value;
    const statusBadge = document.getElementById(`court${courtNumber}StatusBadge`);
    const timer = courtNumber === 1 ? court1Timer : court2Timer;

    statusBadge.textContent = status.toUpperCase();
    statusBadge.className = `match-status-badge ${status}`;

    if (status === 'live') {
        timer.start();
    } else {
        timer.pause();
        if (status === 'completed') {
            timer.reset();
        }
    }
}

// Event Listeners
document.getElementById('matchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveDataToServer(getCurrentFormData());
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-match')) {
        e.target.parentElement.remove();
        saveDataToServer(getCurrentFormData());
    }
});

// Status change handlers
document.getElementById('court1status').addEventListener('change', () => {
    updateMatchStatus(1);
    saveDataToServer(getCurrentFormData());
});

document.getElementById('court2status').addEventListener('change', () => {
    updateMatchStatus(2);
    saveDataToServer(getCurrentFormData());
});

async function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    const displaySection = document.getElementById('displaySection');

    if (window.location.hash === '#admin') {
        const isAuthenticated = await checkAdminAuth();
        if (!isAuthenticated) {
            showAdminLogin();
            return;
        }
        showAdminPanel();
    } else {
        hideAdminPanel();
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
    loadInitialData();
    toggleAdmin();
});

window.addEventListener('hashchange', toggleAdmin);

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

//These functions are now obsolete and can be removed
function saveData() {}
function loadData() {}
function updateDisplay() {}