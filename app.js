const EcoQuestApp = {
    currentUser: null,
    schools: JSON.parse(localStorage.getItem('ecoquest_schools')) || [],

    showPage: function(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    },

    showSignup: function() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('signupModal').style.display = 'flex';
    },

    signup: function() {
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const school = document.getElementById('signupSchool').value;

        if (!username || !password || !school) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        let users = JSON.parse(localStorage.getItem('ecoquest_users')) || [];
        if (users.find(u => u.username === username)) {
            this.showToast('Username already exists', 'error');
            return;
        }

        const newUser = {
            username,
            password,
            school,
            progress: 0,
            badges: [],
            challenges: {}
        };

        users.push(newUser);
        localStorage.setItem('ecoquest_users', JSON.stringify(users));
        this.currentUser = newUser;
        localStorage.setItem('ecoquest_currentUser', JSON.stringify(newUser));

        document.getElementById('signupModal').style.display = 'none';
        this.updateUI();
        this.showToast('Signup successful!');
    },

    login: function() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        let users = JSON.parse(localStorage.getItem('ecoquest_users')) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('ecoquest_currentUser', JSON.stringify(user));
            document.getElementById('loginModal').style.display = 'none';
            this.updateUI();
            this.showToast('Login successful!');
        } else {
            this.showToast('Invalid credentials', 'error');
        }
    },

    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('ecoquest_currentUser');
        this.updateUI();
        this.showToast('You have been logged out.');
    },

    updateUI: function() {
        if (!this.currentUser) {
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }

        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('signupModal').style.display = 'none';

        this.updateProgress();
        this.updateBadges();
        this.updateLeaderboard();

        document.getElementById('userProfile').innerHTML = `
            <h3>${this.currentUser.username}</h3>
            <p>School: ${this.currentUser.school}</p>
            <p>Progress: ${this.currentUser.progress}%</p>
            <button onclick="EcoQuestApp.logout()">Logout</button>
        `;
    },

    updateProgress: function() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        progressBar.style.width = `${this.currentUser.progress}%`;
        progressText.textContent = `${this.currentUser.progress}%`;
    },

    updateBadges: function() {
        const badgeContainer = document.getElementById('badgeContainer');
        badgeContainer.innerHTML = '';
        const badges = ['energy', 'tree', 'recycle', 'water'];

        badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            if (this.currentUser.badges.includes(badge)) {
                badgeElement.classList.add('earned');
                badgeElement.textContent = badge.charAt(0).toUpperCase();
            } else {
                badgeElement.textContent = '?';
            }
            badgeContainer.appendChild(badgeElement);
        });
    },

    completeChallenge: function(challengeId) {
        if (!this.currentUser.challenges[challengeId]) {
            this.currentUser.challenges[challengeId] = true;
            this.currentUser.progress = Math.min(this.currentUser.progress + 25, 100);

            if (challengeId === 'challenge1') this.unlockBadge('energy');
            if (challengeId === 'challenge2') this.unlockBadge('tree');

            let users = JSON.parse(localStorage.getItem('ecoquest_users')) || [];
            const index = users.findIndex(u => u.username === this.currentUser.username);
            if (index !== -1) users[index] = this.currentUser;
            localStorage.setItem('ecoquest_users', JSON.stringify(users));
            localStorage.setItem('ecoquest_currentUser', JSON.stringify(this.currentUser));

            this.updateUI();
            this.showToast('Challenge completed!');
            document.querySelector(`#${challengeId} button`).disabled = true;
        }
    },

    unlockBadge: function(badgeName) {
        if (!this.currentUser.badges.includes(badgeName)) {
            this.currentUser.badges.push(badgeName);
            this.showToast(`Congratulations! You earned the ${this.getBadgeName(badgeName)} badge!`);
        }
    },

    getBadgeName: function(badgeId) {
        const badgeNames = {
            energy: 'Energy Saver',
            tree: 'Tree Planter',
            recycle: 'Recycling Hero',
            water: 'Water Protector'
        };
        return badgeNames[badgeId] || 'Unknown';
    },

    updateLeaderboard: function() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

        if (this.currentUser) {
            let school = this.schools.find(s => s.name === this.currentUser.school);
            if (!school) {
                school = { name: this.currentUser.school, points: 0 };
                this.schools.push(school);
            }
            school.points = this.currentUser.progress;

            localStorage.setItem('ecoquest_schools', JSON.stringify(this.schools));
        }

        this.schools.sort((a, b) => b.points - a.points);

        this.schools.forEach((school, index) => {
            const schoolItem = document.createElement('div');
            schoolItem.className = 'school-item';
            schoolItem.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="school-info"><h4>${school.name}</h4></div>
                <div class="school-points">${school.points} pts</div>
            `;
            leaderboardList.appendChild(schoolItem);
        });
    },

    showToast: function(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.backgroundColor =
            type === 'error' ? 'var(--danger)' : 'var(--success)';

        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

window.onload = () => {
    EcoQuestApp.currentUser = JSON.parse(localStorage.getItem('ecoquest_currentUser')) || null;
    EcoQuestApp.updateUI();
};
