// Lady Yunalesca's Complete Tracker - Full Script
let yunalescaEntries = JSON.parse(localStorage.getItem('yunalesca_entries') || '[]');
let yunalescaAchievements = JSON.parse(localStorage.getItem('yunalesca_achievements') || '[]');
let yunalescaCharacterData = JSON.parse(localStorage.getItem('yunalesca_character_data') || '{}');
let currentPortrait = localStorage.getItem('yunalesca_portrait') || '';

// Cloud sync variables
let githubToken = localStorage.getItem('yunalesca_github_token') || '';
let isCloudEnabled = false;
let lastSyncTime = 0;

// Achievement definitions
const achievements = [
    { id: 'first_memory', name: 'First Teachings', description: 'Record your first memory in Azeroth', requirement: 'entries', value: 1, icon: '✨' },
    { id: 'memory_keeper', name: 'Memory Sphere', description: 'Collect 5 memories from your journey', requirement: 'entries', value: 5, icon: '🔮' },
    { id: 'chronicler', name: 'Crystal Keeper', description: 'Document 10 pivotal moments', requirement: 'entries', value: 10, icon: '💎' },
    { id: 'shadow_awakening', name: 'Shadow Awakening', description: 'Reach level 10 - embrace the void', requirement: 'level', value: 10, icon: '🌙' },
    { id: 'void_apprentice', name: 'Between Worlds', description: 'Attain level 20 - bridge Spira and Azeroth', requirement: 'level', value: 20, icon: '🌌' },
    { id: 'shadow_adept', name: 'Eternal Wisdom', description: 'Achieve level 40 - ancient power awakens', requirement: 'level', value: 40, icon: '⚫' },
    { id: 'void_master', name: 'Lady of Azeroth', description: 'Reach level 60 - transcend mortality', requirement: 'level', value: 60, icon: '👑' },
    { id: 'shadow_legend', name: 'Void Lord', description: 'Ascend to level 80 - become one with eternity', requirement: 'level', value: 80, icon: '🖤' },
    { id: 'dungeon_delver', name: 'Cloister Trial', description: 'Complete your first dungeon trial', requirement: 'dungeon', value: 1, icon: '🏛️' },
    { id: 'raid_legend', name: 'Grand Trial', description: 'Conquer your first raid challenge', requirement: 'raid', value: 1, icon: '⚔️' },
    { id: 'pvp_warrior', name: 'Shadow Duelist', description: 'Engage in player combat', requirement: 'pvp', value: 1, icon: '🗡️' },
    { id: 'explorer', name: 'Realm Walker', description: 'Visit 5 different realms', requirement: 'zones', value: 5, icon: '🌍' },
    { id: 'wanderer', name: 'Planar Wanderer', description: 'Explore 10 unique locations', requirement: 'zones', value: 10, icon: '🗺️' },
    { id: 'screenshot_master', name: 'Memory Crystal', description: 'Capture 3 moments with images', requirement: 'screenshots', value: 3, icon: '📸' },
    { id: 'lore_keeper', name: 'Sphere Grid Walker', description: 'Write 1000 words of memories', requirement: 'words', value: 1000, icon: '📜' },
    { id: 'eternal_chronicler', name: 'Eternal Summoner', description: 'Complete 25 journal entries', requirement: 'entries', value: 25, icon: '♾️' },
    { id: 'legendary_scribe', name: 'Fayth\'s Echo', description: 'Transcribe 5000 words of your journey', requirement: 'words', value: 5000, icon: '📚' }
];

// Character mood options
const characterMoods = [
    'Contemplative', 'Transcendent', 'Empowered', 'Awakened', 
    'Focused', 'Curious', 'Ethereal', 'Mystical', 'Eternal',
    'Melancholic', 'Determined', 'Wise', 'Ancient', 'Otherworldly'
];

let currentMoodIndex = 0;
const yunalescaQuotes = [
    "Death is not to be feared, but embraced as the final aeon of one's journey.",
    "In Azeroth, as in Spira, the eternal spiral of life and death continues.",
    "The void whispers truths that even the Fayth could not comprehend.",
    "I have crossed realms, from dream to reality, from light to shadow.",
    "Each memory crystallized is a step toward eternal understanding.",
    "The Old Gods speak in tongues familiar to one who has communed with Sin.",
    "In shadow magic, I find echoes of the forbidden arts of Spira.",
    "Mortality is but an illusion - I have transcended such limitations.",
    "The spiral of death that plagued Spira finds new form in this realm.",
    "Between worlds I walk, carrying wisdom from both Spira and Azeroth."
];

// Unicode-safe base64 encoding
function unicodeToBase64(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (error) {
        console.error('Base64 encoding error:', error);
        throw new Error('Failed to encode data for cloud sync');
    }
}

function base64ToUnicode(str) {
    try {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (error) {
        console.error('Base64 decoding error:', error);
        throw new Error('Failed to decode cloud data');
    }
}

// Cloud sync status update
function updateSyncStatus(message, isError = false) {
    const statusElement = document.getElementById('sync-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `sync-status ${isError ? 'error' : 'success'}`;
        
        if (!isError) {
            setTimeout(() => {
                statusElement.textContent = 'Connected';
                statusElement.className = 'sync-status success';
            }, 3000);
        }
    }
}

// Cloud sync functions
async function syncToCloud() {
    if (!isCloudEnabled || !githubToken) {
        console.log('Cloud sync disabled or no token');
        return false;
    }

    const now = Date.now();
    if (now - lastSyncTime < 5000) {
        console.log('Sync cooldown active');
        return false;
    }
    lastSyncTime = now;

    try {
        updateSyncStatus('🔄 Syncing to cloud...', false);
        
        const data = {
            entries: yunalescaEntries,
            achievements: yunalescaAchievements,
            character: yunalescaCharacterData,
            portrait: currentPortrait,
            lastSync: new Date().toISOString()
        };

        const content = JSON.stringify(data, null, 2);
        const encodedContent = unicodeToBase64(content);

        let sha = null;
        try {
            const getResponse = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/yunalesca-data.json', {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            console.log('File does not exist yet, will create new');
        }

        const response = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/yunalesca-data.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `✨ Update Lady Yunalesca's memories - ${new Date().toLocaleString()}`,
                content: encodedContent,
                ...(sha && { sha })
            })
        });

        if (response.ok) {
            updateSyncStatus('✅ Synced to cloud', false);
            console.log('✅ Successfully synced to cloud');
            return true;
        } else {
            const errorText = await response.text();
            console.error('Sync failed:', response.status, errorText);
            
            if (response.status === 401) {
                updateSyncStatus('❌ Invalid token - check permissions', true);
            } else if (response.status === 403) {
                updateSyncStatus('❌ Rate limited - will retry soon', true);
                setTimeout(() => syncToCloud(), 60000);
            } else {
                updateSyncStatus('❌ Sync failed - will retry', true);
                setTimeout(() => syncToCloud(), 10000);
            }
            return false;
        }
    } catch (error) {
        console.error('Cloud sync error:', error);
        updateSyncStatus('❌ Sync error - will retry', true);
        setTimeout(() => syncToCloud(), 15000);
        return false;
    }
}

async function loadFromCloud() {
    if (!githubToken) {
        console.log('No GitHub token available');
        return false;
    }

    try {
        updateSyncStatus('🔄 Loading from cloud...', false);
        console.log('🔍 Attempting to load data from GitHub...');
        
        const response = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/yunalesca-data.json', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('📡 GitHub API Response Status:', response.status);

        if (response.ok) {
            const fileData = await response.json();
            console.log('📄 File data received from GitHub');
            
            const decodedContent = base64ToUnicode(fileData.content);
            const cloudData = JSON.parse(decodedContent);
            console.log('📦 Cloud data parsed:', {
                entries: cloudData.entries?.length || 0,
                achievements: cloudData.achievements?.length || 0,
                hasCharacterData: !!cloudData.character,
                hasPortrait: !!cloudData.portrait
            });

            // Load cloud data and overwrite local
            yunalescaEntries = cloudData.entries || [];
            yunalescaAchievements = cloudData.achievements || [];
            yunalescaCharacterData = cloudData.character || {};
            currentPortrait = cloudData.portrait || '';

            // Save to local storage
            localStorage.setItem('yunalesca_entries', JSON.stringify(yunalescaEntries));
            localStorage.setItem('yunalesca_achievements', JSON.stringify(yunalescaAchievements));
            localStorage.setItem('yunalesca_character_data', JSON.stringify(yunalescaCharacterData));
            localStorage.setItem('yunalesca_portrait', currentPortrait);

            updateSyncStatus('✅ Loaded from cloud', false);
            console.log('✅ Successfully loaded and saved cloud data locally');
            
            // Refresh the display
            displayEntries();
            updateAchievements();
            updateCharacterDisplay();
            
            return true;
        } else if (response.status === 404) {
            console.log('📂 No cloud data found - this is normal for first time setup');
            updateSyncStatus('✅ Connected (no cloud data yet)', false);
            return false;
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to load from cloud:', response.status, errorText);
            updateSyncStatus('❌ Failed to load from cloud', true);
            return false;
        }
    } catch (error) {
        console.error('💥 Error loading from cloud:', error);
        updateSyncStatus('❌ Error loading from cloud', true);
        return false;
    }
}

async function testCloudConnection() {
    if (!githubToken) {
        console.error('❌ No GitHub token provided');
        updateSyncStatus('❌ No token configured', true);
        return;
    }

    try {
        console.log('🧪 Testing cloud connection...');
        updateSyncStatus('🧪 Testing connection...', false);

        const repoResponse = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!repoResponse.ok) {
            console.error('❌ Repository access failed:', repoResponse.status);
            updateSyncStatus('❌ Cannot access repository', true);
            return;
        }

        console.log('✅ Repository access: OK');

        const testContent = unicodeToBase64('{"test": "connection", "timestamp": "' + new Date().toISOString() + '"}');
        
        const testResponse = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/test-connection.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Test cloud connection',
                content: testContent
            })
        });

        if (testResponse.ok) {
            console.log('✅ Cloud connection test: SUCCESS');
            updateSyncStatus('✅ Connection test passed', false);
            
            const testData = await testResponse.json();
            await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/test-connection.json', {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Clean up test file',
                    sha: testData.content.sha
                })
            });
            
        } else {
            console.error('❌ Cloud connection test failed:', testResponse.status);
            updateSyncStatus('❌ Connection test failed', true);
        }
    } catch (error) {
        console.error('❌ Connection test error:', error);
        updateSyncStatus('❌ Connection test error', true);
    }
}

// Entry management functions
function addEntry() {
    const form = document.getElementById('entry-form');
    const formData = new FormData(form);
    
    const entry = {
        id: Date.now(),
        date: formData.get('date'),
        realm: formData.get('realm') === 'custom' ? formData.get('custom-realm') : formData.get('realm'),
        type: formData.get('type'),
        description: formData.get('description'),
        level: parseInt(formData.get('level')),
        shadowArts: formData.get('shadow-arts'),
        screenshot: '',
        timestamp: new Date().toISOString()
    };

    const fileInput = document.getElementById('screenshot');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let { width, height } = img;
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                entry.screenshot = compressedDataUrl;
                saveEntry(entry);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        saveEntry(entry);
    }
}

function saveEntry(entry) {
    yunalescaEntries.unshift(entry);
    localStorage.setItem('yunalesca_entries', JSON.stringify(yunalescaEntries));
    
    displayEntries();
    updateAchievements();
    resetForm();
    
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    showNotification('✨ Memory crystallized in the eternal archive');
}

function deleteEntry(entryId) {
    const entryIndex = yunalescaEntries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) return;
    
    const entry = yunalescaEntries[entryIndex];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="delete-modal">
            <h3>🗑️ Delete Memory</h3>
            <p>Are you sure you want to delete this memory from ${entry.realm}?</p>
            <p><em>"${entry.description.substring(0, 100)}${entry.description.length > 100 ? '...' : ''}"</em></p>
            <div class="modal-buttons">
                <button class="cancel-btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="delete-btn" onclick="confirmDelete(${entryId})">Delete Forever</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmDelete(entryId) {
    yunalescaEntries = yunalescaEntries.filter(entry => entry.id !== entryId);
    localStorage.setItem('yunalesca_entries', JSON.stringify(yunalescaEntries));
    
    displayEntries();
    updateAchievements();
    
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    document.querySelector('.modal-overlay').remove();
    showNotification('💔 Memory dissolved from the eternal archive');
}

function displayEntries() {
    const entriesContainer = document.getElementById('entries-list');
    
    if (yunalescaEntries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="empty-state">
                <div class="floating-orb"></div>
                <h3>✨ The Archive Awaits</h3>
                <p>Lady Yunalesca's journey through Azeroth has yet to be documented. Begin recording your memories to build an eternal chronicle of your adventures.</p>
            </div>
        `;
        return;
    }

    entriesContainer.innerHTML = yunalescaEntries.map(entry => `
        <div class="entry-card" data-level="${entry.level}">
            <div class="entry-header">
                <div class="entry-meta">
                    <span class="entry-date">${formatDate(entry.date)}</span>
                    <span class="entry-realm">${entry.realm}</span>
                    <span class="entry-type">${entry.type}</span>
                    <span class="entry-level">Level ${entry.level}</span>
                </div>
                <button class="delete-entry-btn" onclick="deleteEntry(${entry.id})" title="Delete this memory">
                    🗑️
                </button>
            </div>
            <div class="entry-content">
                <p class="entry-description">${entry.description}</p>
                ${entry.screenshot ? `
                    <div class="entry-screenshot">
                        <img src="${entry.screenshot}" alt="Memory Crystal" onclick="viewFullImage('${entry.screenshot}')">
                        <div class="screenshot-overlay">📸 Memory Crystal</div>
                    </div>
                ` : ''}
            </div>
            <div class="entry-footer">
                <span class="shadow-arts">Shadow Arts: ${entry.shadowArts}</span>
                <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// Achievement system
function updateAchievements() {
    const currentStats = calculateStats();
    let newAchievements = 0;

    achievements.forEach(achievement => {
        if (!yunalescaAchievements.includes(achievement.id)) {
            let unlocked = false;

            switch (achievement.requirement) {
                case 'entries':
                    unlocked = currentStats.totalEntries >= achievement.value;
                    break;
                case 'level':
                    unlocked = currentStats.maxLevel >= achievement.value;
                    break;
                case 'dungeon':
                    unlocked = currentStats.dungeonEntries >= achievement.value;
                    break;
                case 'raid':
                    unlocked = currentStats.raidEntries >= achievement.value;
                    break;
                case 'pvp':
                    unlocked = currentStats.pvpEntries >= achievement.value;
                    break;
                case 'zones':
                    unlocked = currentStats.uniqueZones >= achievement.value;
                    break;
                case 'screenshots':
                    unlocked = currentStats.screenshotEntries >= achievement.value;
                    break;
                case 'words':
                    unlocked = currentStats.totalWords >= achievement.value;
                    break;
            }

            if (unlocked) {
                yunalescaAchievements.push(achievement.id);
                newAchievements++;
                showAchievementNotification(achievement);
            }
        }
    });

    if (newAchievements > 0) {
        localStorage.setItem('yunalesca_achievements', JSON.stringify(yunalescaAchievements));
        if (isCloudEnabled) {
            syncToCloud();
        }
    }

    displayAchievements();
}

function calculateStats() {
    const stats = {
        totalEntries: yunalescaEntries.length,
        maxLevel: Math.max(...yunalescaEntries.map(e => e.level), 0),
        dungeonEntries: yunalescaEntries.filter(e => e.type === 'Dungeon').length,
        raidEntries: yunalescaEntries.filter(e => e.type === 'Raid').length,
        pvpEntries: yunalescaEntries.filter(e => e.type === 'PvP').length,
        uniqueZones: new Set(yunalescaEntries.map(e => e.realm)).size,
        screenshotEntries: yunalescaEntries.filter(e => e.screenshot).length,
        totalWords: yunalescaEntries.reduce((total, e) => total + e.description.split(' ').length, 0)
    };
    return stats;
}

function displayAchievements() {
    const achievementsContainer = document.getElementById('achievements-list');
    
    achievementsContainer.innerHTML = achievements.map(achievement => {
        const isUnlocked = yunalescaAchievements.includes(achievement.id);
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status">
                    ${isUnlocked ? '✅' : '🔒'}
                </div>
            </div>
        `;
    }).join('');
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div>
                <h4>Achievement Unlocked!</h4>
                <p>${achievement.name}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Character functions
function updateCharacterDisplay() {
    updateCharacterPortrait();
    updateCharacterQuote();
    updateCharacterMood();
}

function updateCharacterPortrait() {
    const portraitImg = document.getElementById('character-portrait');
    if (currentPortrait) {
        portraitImg.src = currentPortrait;
        portraitImg.style.display = 'block';
    }
}

function uploadPortrait() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const size = 300;
                    canvas.width = size;
                    canvas.height = size;
                    
                    const scale = Math.max(size / img.width, size / img.height);
                    const x = (size - img.width * scale) / 2;
                    const y = (size - img.height * scale) / 2;
                    
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                    
                    currentPortrait = canvas.toDataURL('image/jpeg', 0.8);
                    localStorage.setItem('yunalesca_portrait', currentPortrait);
                    updateCharacterPortrait();
                    
                    if (isCloudEnabled) {
                        syncToCloud();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

function updateCharacterQuote() {
    const quoteElement = document.getElementById('character-quote');
    const randomQuote = yunalescaQuotes[Math.floor(Math.random() * yunalescaQuotes.length)];
    quoteElement.textContent = `"${randomQuote}"`;
}

function updateCharacterMood() {
    currentMoodIndex = (currentMoodIndex + 1) % characterMoods.length;
    const newMood = characterMoods[currentMoodIndex];
    document.getElementById('character-mood').textContent = newMood;
    
    // Save mood to character data
    yunalescaCharacterData.mood = newMood;
    yunalescaCharacterData.moodIndex = currentMoodIndex;
    localStorage.setItem('yunalesca_character_data', JSON.stringify(yunalescaCharacterData));
    
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    showNotification(`💫 Mood changed to ${newMood}`);
}

// Cloud setup functions
function setupCloudSync() {
    const modal = document.getElementById('cloud-setup-modal');
    const tokenInput = document.getElementById('github-token-input');
    
    if (githubToken) {
        tokenInput.value = githubToken;
    }
    
    modal.style.display = 'flex';
}

function closeCloudSetup() {
    document.getElementById('cloud-setup-modal').style.display = 'none';
}

async function connectToCloud() {
    const tokenInput = document.getElementById('github-token-input');
    const newToken = tokenInput.value.trim();
    
    if (!newToken) {
        alert('Please enter your GitHub token');
        return;
    }
    
    githubToken = newToken;
    localStorage.setItem('yunalesca_github_token', githubToken);
    
    updateSyncStatus('🔄 Connecting...', false);
    
    // Test connection first
    await testCloudConnection();
    
    // Force load from cloud - this should fix cross-browser sync
    console.log('🔄 Force loading from cloud...');
    const hasCloudData = await loadFromCloud();
    
    if (hasCloudData) {
        console.log('✅ Loaded existing data from cloud');
        updateSyncStatus('✅ Data loaded from cloud', false);
    } else {
        console.log('📤 No cloud data found, uploading current data...');
        // No cloud data exists, upload current local data
        await syncToCloud();
        updateSyncStatus('✅ Local data uploaded to cloud', false);
    }
    
    // Enable cloud sync
    isCloudEnabled = true;
    document.getElementById('cloud-sync-btn').innerHTML = '☁️ Connected';
    document.getElementById('cloud-sync-btn').classList.add('connected');
    
    closeCloudSetup();
    
    showNotification('☁️ Cloud sync connected! Data synced across all devices.');
}

function forceSync() {
    if (isCloudEnabled) {
        lastSyncTime = 0;
        syncToCloud();
    } else {
        setupCloudSync();
    }
}

function initializeCloudSync() {
    const savedToken = localStorage.getItem('yunalesca_github_token');
    if (savedToken) {
        githubToken = savedToken;
        isCloudEnabled = true;
        document.getElementById('cloud-sync-btn').innerHTML = '☁️ Connected';
        document.getElementById('cloud-sync-btn').classList.add('connected');
        
        loadFromCloud();
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function viewFullImage(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    overlay.innerHTML = `
        <div class="image-container">
            <img src="${src}" alt="Full Size Memory">
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function resetForm() {
    document.getElementById('entry-form').reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    const customRealmInput = document.getElementById('custom-realm-input');
    customRealmInput.style.display = 'none';
    customRealmInput.classList.remove('show');
}

// Form handlers
function handleRealmChange() {
    const realmSelect = document.getElementById('realm');
    const customRealmInput = document.getElementById('custom-realm-input');
    
    if (realmSelect.value === 'custom') {
        customRealmInput.style.display = 'block';
        customRealmInput.classList.add('show');
        document.getElementById('custom-realm').focus();
    } else {
        customRealmInput.style.display = 'none';
        customRealmInput.classList.remove('show');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set default date
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Initialize everything
    initializeCloudSync();
    displayEntries();
    updateAchievements();
    updateCharacterDisplay();
    
    // Cloud sync button handler
    document.getElementById('cloud-sync-btn').addEventListener('click', function() {
        if (isCloudEnabled) {
            const menu = document.createElement('div');
            menu.className = 'cloud-menu';
            menu.innerHTML = `
                <button onclick="forceSync(); this.parentElement.remove();">🔄 Force Sync</button>
                <button onclick="testCloudConnection(); this.parentElement.remove();">🧪 Test Connection</button>
                <button onclick="setupCloudSync(); this.parentElement.remove();">⚙️ Settings</button>
            `;
            
            this.appendChild(menu);
            
            setTimeout(() => {
                if (menu.parentElement) menu.remove();
            }, 5000);
        } else {
            setupCloudSync();
        }
    });

    // Form submission
    document.getElementById('entry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addEntry();
    });
    
    // Realm change handler
    document.getElementById('realm').addEventListener('change', handleRealmChange);
    
    // Character interactions
    document.getElementById('character-portrait').addEventListener('click', uploadPortrait);
    document.getElementById('character-quote').addEventListener('click', updateCharacterQuote);
    document.querySelector('.character-mood').addEventListener('click', cycleCharacterMood);
});

// Make functions globally accessible
window.deleteEntry = deleteEntry;
window.confirmDelete = confirmDelete;
window.viewFullImage = viewFullImage;
window.setupCloudSync = setupCloudSync;
window.closeCloudSetup = closeCloudSetup;
window.connectToCloud = connectToCloud;
window.forceSync = forceSync;
window.testCloudConnection = testCloudConnection;
window.uploadPortrait = uploadPortrait;
window.updateCharacterQuote = updateCharacterQuote;
window.cycleCharacterMood = cycleCharacterMood;