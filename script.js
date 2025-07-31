// Lady Yunalesca's Complete Enhanced Tracker with Titles & Filters - Full Script
let yunalescaEntries = JSON.parse(localStorage.getItem('yunalesca_entries') || '[]');
let yunalescaAchievements = JSON.parse(localStorage.getItem('yunalesca_achievements') || '[]');
let yunalescaCharacterData = JSON.parse(localStorage.getItem('yunalesca_character_data') || '{}');
let currentPortrait = localStorage.getItem('yunalesca_portrait') || '';

// Cloud sync variables
let githubToken = localStorage.getItem('yunalesca_github_token') || '';
let isCloudEnabled = false;
let lastSyncTime = 0;

// Filter state
let currentFilters = {
    type: 'all',
    realm: 'all',
    level: 'all',
    shadowArts: 'all',
    search: ''
};

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

// TITLE GENERATION - NEW FEATURE
const titlePrefixes = [
    'Whispers of', 'Echoes from', 'Shadows in', 'Visions of', 'Dreams from', 
    'Memories of', 'Tales from', 'Secrets of', 'Mysteries in', 'Chronicles of',
    'Reflections in', 'Journey through', 'Wandering in', 'Transcendence in',
    'Awakening in', 'Pilgrimage to', 'Contemplation in', 'Ascension from'
];

const titleSuffixes = {
    'Dungeon': ['Trial', 'Ordeal', 'Challenge', 'Test', 'Labyrinth'],
    'Raid': ['Conquest', 'Triumph', 'Victory', 'Legend', 'Saga'],
    'PvP': ['Duel', 'Conflict', 'Battle', 'War', 'Clash'],
    'Exploration': ['Discovery', 'Journey', 'Voyage', 'Quest', 'Adventure'],
    'Questing': ['Mission', 'Purpose', 'Calling', 'Destiny', 'Path'],
    'Social': ['Gathering', 'Meeting', 'Communion', 'Bond', 'Alliance'],
    'Achievement': ['Milestone', 'Accomplishment', 'Breakthrough', 'Ascension', 'Evolution'],
    'Crafting': ['Creation', 'Artistry', 'Mastery', 'Craft', 'Innovation'],
    'Event': ['Celebration', 'Ceremony', 'Occasion', 'Festival', 'Ritual'],
    'Milestone': ['Threshold', 'Passage', 'Transformation', 'Awakening', 'Revelation'],
    'Story': ['Tale', 'Chronicle', 'Saga', 'Legend', 'Epic'],
    'Other': ['Experience', 'Moment', 'Encounter', 'Phenomenon', 'Mystery']
};

const levelTitles = {
    1: 'First Steps',
    10: 'Shadow Awakening', 
    20: 'Void Apprentice',
    30: 'Ethereal Walker',
    40: 'Shadow Adept',
    50: 'Transcendent Being',
    60: 'Void Master',
    70: 'Eternal Guardian',
    80: 'Ascended One'
};

function generateEntryTitle(entry) {
    const { realm, type, level, description } = entry;
    
    // Special titles for level milestones
    if (levelTitles[level]) {
        return `${levelTitles[level]} - ${realm}`;
    }
    
    // Check for special words in description for custom titles
    const desc = description.toLowerCase();
    if (desc.includes('sunwell') || desc.includes('magical energy')) {
        return `Sunwell Awakening`;
    }
    if (desc.includes('castle') || desc.includes('spires')) {
        return `Visions of Ancient Spires`;
    }
    if (desc.includes('peaceful') || desc.includes('tranquil')) {
        return `Serenity in ${realm}`;
    }
    if (desc.includes('shadow') || desc.includes('darkness')) {
        return `Shadow Embrace in ${realm}`;
    }
    if (desc.includes('first') || desc.includes('beginning')) {
        return `First Light of ${realm}`;
    }
    
    // Generate based on type and realm
    const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
    const suffixes = titleSuffixes[type] || titleSuffixes['Other'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    // Different title formats
    const formats = [
        `${prefix} ${realm}`,
        `${realm} ${suffix}`,
        `${prefix} the ${suffix}`,
        `${suffix} of ${realm}`
    ];
    
    return formats[Math.floor(Math.random() * formats.length)];
}

// ENHANCED ENTRY FORMATTING FUNCTIONS - NEW
function formatEntryDescription(description) {
    if (!description) return '';
    
    // Split long descriptions into paragraphs at sentence endings
    let formatted = description.replace(/\. ([A-Z])/g, '.\n\n$1');
    
    // Add line breaks before special phrases for better flow
    formatted = formatted.replace(/(The |Standing |Looking |Tomorrow |Perhaps |Level \d+,)/g, '\n\n$1');
    
    // Clean up extra line breaks
    formatted = formatted.replace(/\n\n\n+/g, '\n\n');
    formatted = formatted.trim();
    
    return formatted;
}

function extractFeelingsFromDescription(description) {
    // Look for emotional or reflective content to separate into notes
    const feelingIndicators = [
        /\*([^*]+)\*/g, // Text in asterisks
        /(Level \d+, but already sensing[^.]+\.)/g, // Reflective endings
        /(Perhaps this is where[^.]+\.)/g, // Contemplative phrases
        /(The peaceful [^.]+reminds me[^.]+\.)/g, // Memory connections
    ];
    
    let feelings = [];
    let cleanDescription = description;
    
    feelingIndicators.forEach(regex => {
        let matches = description.match(regex);
        if (matches) {
            matches.forEach(match => {
                feelings.push(match.replace(/\*/g, '')); // Remove asterisks
                cleanDescription = cleanDescription.replace(match, '').trim();
            });
        }
    });
    
    // Clean up extra spaces and line breaks
    cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
    
    return {
        description: cleanDescription,
        feelings: feelings.length > 0 ? feelings.join(' ') : null
    };
}

// FILTER FUNCTIONS - NEW
function applyFilters(entries) {
    return entries.filter(entry => {
        // Type filter
        if (currentFilters.type !== 'all' && entry.type !== currentFilters.type) {
            return false;
        }
        
        // Realm filter
        if (currentFilters.realm !== 'all' && entry.realm !== currentFilters.realm) {
            return false;
        }
        
        // Level filter
        if (currentFilters.level !== 'all') {
            const level = parseInt(entry.level);
            switch (currentFilters.level) {
                case '1-10':
                    if (level < 1 || level > 10) return false;
                    break;
                case '11-20':
                    if (level < 11 || level > 20) return false;
                    break;
                case '21-40':
                    if (level < 21 || level > 40) return false;
                    break;
                case '41-60':
                    if (level < 41 || level > 60) return false;
                    break;
                case '61-80':
                    if (level < 61 || level > 80) return false;
                    break;
            }
        }
        
        // Shadow Arts filter
        if (currentFilters.shadowArts !== 'all' && entry.shadowArts !== currentFilters.shadowArts) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const searchText = (entry.description + ' ' + entry.realm + ' ' + entry.type).toLowerCase();
            if (!searchText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
}

function updateFilter(filterType, value) {
    currentFilters[filterType] = value;
    displayEntries();
    
    // Update filter button states
    updateFilterButtonStates();
}

function updateFilterButtonStates() {
    // Update type filter buttons
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentFilters.type);
    });
}

function clearAllFilters() {
    currentFilters = {
        type: 'all',
        realm: 'all',
        level: 'all',
        shadowArts: 'all',
        search: ''
    };
    
    // Reset form elements
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-realm').value = 'all';
    document.getElementById('filter-level').value = 'all';
    document.getElementById('filter-shadow-arts').value = 'all';
    document.getElementById('filter-search').value = '';
    
    updateFilterButtonStates();
    displayEntries();
    showNotification('🧹 All filters cleared');
}

function populateFilterOptions() {
    // Get unique realms
    const realms = [...new Set(yunalescaEntries.map(entry => entry.realm))].sort();
    const realmSelect = document.getElementById('filter-realm');
    
    // Clear existing options except 'All'
    while (realmSelect.children.length > 1) {
        realmSelect.removeChild(realmSelect.lastChild);
    }
    
    // Add realm options
    realms.forEach(realm => {
        const option = document.createElement('option');
        option.value = realm;
        option.textContent = realm;
        realmSelect.appendChild(option);
    });
}

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
        statusElement.style.display = 'inline-block'; // Make sure it's visible
        
        if (!isError && message.includes('Connected')) {
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
        
        // SAFETY CHECK: Don't sync empty data if cloud has data
        const localDataEmpty = (!yunalescaEntries || yunalescaEntries.length === 0) && 
                              (!yunalescaAchievements || yunalescaAchievements.length === 0);
        
        if (localDataEmpty) {
            // Check if cloud has data before overwriting
            try {
                const cloudCheckResponse = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/yunalesca-data.json', {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (cloudCheckResponse.ok) {
                    const cloudFileData = await cloudCheckResponse.json();
                    const cloudContent = base64ToUnicode(cloudFileData.content);
                    const cloudData = JSON.parse(cloudContent);
                    
                    // If cloud has data and local is empty, don't overwrite
                    if ((cloudData.entries && cloudData.entries.length > 0) || 
                        (cloudData.achievements && cloudData.achievements.length > 0)) {
                        console.log('⚠️ Local data is empty but cloud has data - skipping sync to prevent data loss');
                        updateSyncStatus('⚠️ Skipped sync - local empty, cloud has data', true);
                        return false;
                    }
                }
            } catch (error) {
                console.log('Could not check cloud data, proceeding with sync');
            }
        }
        
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
        title: formData.get('title'),
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
    populateFilterOptions(); // Update filter options with new realm if needed
    resetForm();
    
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    showNotification('✨ Memory crystallized in the eternal archive');
}

function editEntry(entryId) {
    const entry = yunalescaEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="edit-modal">
            <h3>✏️ Edit Memory</h3>
            <form id="edit-entry-form">
                <div class="form-group">
                    <label for="edit-date">Date</label>
                    <input type="date" id="edit-date" name="date" value="${entry.date}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-level">Level</label>
                        <input type="number" id="edit-level" name="level" value="${entry.level}" min="1" max="80" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-realm">Realm</label>
                        <input type="text" id="edit-realm" name="realm" value="${entry.realm}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-type">Type</label>
                        <select id="edit-type" name="type" required>
                            <option value="Questing" ${entry.type === 'Questing' ? 'selected' : ''}>Questing</option>
                            <option value="Dungeon" ${entry.type === 'Dungeon' ? 'selected' : ''}>Dungeon</option>
                            <option value="Raid" ${entry.type === 'Raid' ? 'selected' : ''}>Raid</option>
                            <option value="PvP" ${entry.type === 'PvP' ? 'selected' : ''}>PvP</option>
                            <option value="Exploration" ${entry.type === 'Exploration' ? 'selected' : ''}>Exploration</option>
                            <option value="Social" ${entry.type === 'Social' ? 'selected' : ''}>Social</option>
                            <option value="Achievement" ${entry.type === 'Achievement' ? 'selected' : ''}>Achievement</option>
                            <option value="Crafting" ${entry.type === 'Crafting' ? 'selected' : ''}>Crafting</option>
                            <option value="Event" ${entry.type === 'Event' ? 'selected' : ''}>Event</option>
                            <option value="Milestone" ${entry.type === 'Milestone' ? 'selected' : ''}>Milestone</option>
                            <option value="Story" ${entry.type === 'Story' ? 'selected' : ''}>Story</option>
                            <option value="Other" ${entry.type === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-shadow-arts">Shadow Arts</label>
                        <select id="edit-shadow-arts" name="shadow-arts" required>
                            <option value="Shadow" ${entry.shadowArts === 'Shadow' ? 'selected' : ''}>Shadow</option>
                            <option value="Discipline" ${entry.shadowArts === 'Discipline' ? 'selected' : ''}>Discipline</option>
                            <option value="Holy" ${entry.shadowArts === 'Holy' ? 'selected' : ''}>Holy</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-title">Title</label>
                    <input type="text" id="edit-title" name="title" value="${entry.title || ''}" placeholder="Enter a title for this memory..." required>
                </div>
                
                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <textarea id="edit-description" name="description" required>${entry.description}</textarea>
                </div>
                
                <div class="modal-buttons">
                    <button type="button" class="cancel-btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="save-btn">💾 Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('edit-entry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Update entry
        entry.date = formData.get('date');
        entry.level = parseInt(formData.get('level'));
        entry.realm = formData.get('realm');
        entry.type = formData.get('type');
        entry.shadowArts = formData.get('shadow-arts');
        entry.title = formData.get('title');
        entry.description = formData.get('description');
        entry.timestamp = new Date().toISOString(); // Update timestamp
        
        // Save to localStorage
        localStorage.setItem('yunalesca_entries', JSON.stringify(yunalescaEntries));
        
        // Update display
        displayEntries();
        updateAchievements();
        populateFilterOptions();
        
        // Sync to cloud
        if (isCloudEnabled) {
            syncToCloud();
        }
        
        // Remove modal
        modal.remove();
        
        showNotification('✨ Memory updated in the eternal archive');
    });
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
    populateFilterOptions();
    
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    document.querySelector('.modal-overlay').remove();
    showNotification('💔 Memory dissolved from the eternal archive');
}

// ENHANCED DISPLAY ENTRIES FUNCTION WITH TITLES AND FILTERING
function displayEntries() {
    const entriesContainer = document.getElementById('entries-list');
    
    // Apply filters
    const filteredEntries = applyFilters(yunalescaEntries);
    
    if (filteredEntries.length === 0) {
        if (yunalescaEntries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="floating-orb"></div>
                    <h3>✨ The Archive Awaits</h3>
                    <p>Lady Yunalesca's journey through Azeroth has yet to be documented. Begin recording your memories to build an eternal chronicle of your adventures.</p>
                </div>
            `;
        } else {
            entriesContainer.innerHTML = `
                <div class="no-entries">
                    <h3>🔍 No memories match your search</h3>
                    <p>Try adjusting your filters or clearing them to see more entries.</p>
                </div>
            `;
        }
        return;
    }

    entriesContainer.innerHTML = filteredEntries.map(entry => {
        // Use enhanced formatting functions
        const { description, feelings } = extractFeelingsFromDescription(entry.description || '');
        const formattedDescription = formatEntryDescription(description);
        const entryTitle = entry.title || generateEntryTitle(entry); // Use custom title if available
        
        return `
            <div class="entry-card" data-level="${entry.level}" data-entry-id="${entry.id}">
                <div class="entry-title">${entryTitle}</div>
                <div class="entry-header">
                    <div class="entry-meta">
                        <span class="entry-date">${formatDate(entry.date)}</span>
                        <span class="entry-realm">${entry.realm}</span>
                        <span class="entry-type">${entry.type}</span>
                        <span class="entry-level">Level ${entry.level}</span>
                    </div>
                    <div class="entry-actions">
                        <button class="edit-entry-btn" data-entry-id="${entry.id}" title="Edit this memory">
                            ✏️
                        </button>
                        <button class="delete-entry-btn" data-entry-id="${entry.id}" title="Delete this memory">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="entry-content">
                    <div class="entry-description scrollable">${formattedDescription}</div>
                    ${feelings ? `<div class="entry-notes">${feelings}</div>` : ''}
                    ${entry.screenshot ? `
                        <div class="entry-screenshot">
                            <img src="${entry.screenshot}" alt="Memory Crystal" class="screenshot-img" data-src="${entry.screenshot}">
                            <div class="screenshot-overlay">📸 Memory Crystal</div>
                        </div>
                    ` : ''}
                </div>
                <div class="entry-footer">
                    <span class="shadow-arts">Shadow Arts: ${entry.shadowArts}</span>
                    <span class="entry-timestamp">${formatTimestamp(entry.timestamp)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners after rendering
    addEntryEventListeners();
}

function addEntryEventListeners() {
    // Edit button listeners
    document.querySelectorAll('.edit-entry-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const entryId = parseInt(this.getAttribute('data-entry-id'));
            editEntry(entryId);
        });
    });
    
    // Delete button listeners  
    document.querySelectorAll('.delete-entry-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const entryId = parseInt(this.getAttribute('data-entry-id'));
            deleteEntry(entryId);
        });
    });
    
    // Screenshot click listeners
    document.querySelectorAll('.screenshot-img').forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const src = this.getAttribute('data-src');
            viewFullImage(src);
        });
    });
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

function disconnectCloud() {
    // Clear cloud sync data
    isCloudEnabled = false;
    githubToken = '';
    localStorage.removeItem('yunalesca_github_token');
    
    // Update UI
    document.getElementById('cloud-sync-btn').innerHTML = '💾 Local Storage';
    document.getElementById('cloud-sync-btn').classList.remove('connected');
    document.getElementById('cloud-sync-btn').title = 'Click to set up cloud sync';
    
    // Hide sync status
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
        syncStatus.style.display = 'none';
    }
    
    showNotification('🔌 Disconnected from cloud - using local storage only');
}

function skipCloudSetup() {
    closeCloudSetup();
    showNotification('📱 Using local storage only - your data is safe in your browser!');
    
    // Update the button to show local mode
    document.getElementById('cloud-sync-btn').innerHTML = '💾 Local Storage';
    document.getElementById('cloud-sync-btn').title = 'Click to set up cloud sync';
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
    
    updateSyncStatus('🔄 Testing connection...', false);
    
    try {
        // Test connection first
        const testResult = await testCloudConnection();
        
        if (!testResult) {
            // Connection failed, show instructions
            updateSyncStatus('❌ Connection failed - check token permissions', true);
            showNotification('❌ Cloud sync failed. Check the setup instructions in the modal.');
            return;
        }
        
        console.log('🔄 Connection successful, loading data...');
        
        // Try to load existing data
        const hasCloudData = await loadFromCloud();
        
        if (hasCloudData) {
            console.log('✅ Loaded existing data from cloud');
            updateSyncStatus('✅ Data loaded from cloud', false);
        } else {
            console.log('📤 No cloud data found, uploading current data...');
            await syncToCloud();
            updateSyncStatus('✅ Local data uploaded to cloud', false);
        }
        
        // Enable cloud sync
        isCloudEnabled = true;
        document.getElementById('cloud-sync-btn').innerHTML = '☁️ Connected';
        document.getElementById('cloud-sync-btn').classList.add('connected');
        
        closeCloudSetup();
        showNotification('☁️ Cloud sync connected! Data synced across all devices.');
        
    } catch (error) {
        console.error('❌ Cloud setup failed:', error);
        updateSyncStatus('❌ Setup failed', true);
        showNotification('❌ Cloud setup failed. You can still use local storage!');
    }
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
        
        // Show sync status
        const syncStatus = document.getElementById('sync-status');
        if (syncStatus) {
            syncStatus.style.display = 'inline-block';
            syncStatus.textContent = 'Connected';
            syncStatus.className = 'sync-status success';
        }
        
        // DATA SAFETY: Check if local data is empty before loading from cloud
        const localEntries = localStorage.getItem('yunalesca_entries');
        const localAchievements = localStorage.getItem('yunalesca_achievements');
        const localDataEmpty = (!localEntries || JSON.parse(localEntries).length === 0) && 
                              (!localAchievements || JSON.parse(localAchievements).length === 0);
        
        if (localDataEmpty) {
            console.log('📥 Local data is empty, loading from cloud...');
            // Try to load from cloud on startup
            loadFromCloud();
        } else {
            console.log('📤 Local data exists, syncing to cloud...');
            // Local data exists, sync to cloud instead
            syncToCloud();
        }
    } else {
        // No token, show local storage mode
        document.getElementById('cloud-sync-btn').innerHTML = '💾 Local Storage';
        document.getElementById('cloud-sync-btn').title = 'Click to set up cloud sync';
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
    populateFilterOptions();
    displayEntries();
    updateAchievements();
    updateCharacterDisplay();
    
    // Filter event listeners
    document.getElementById('filter-type').addEventListener('change', function() {
        updateFilter('type', this.value);
    });
    
    document.getElementById('filter-realm').addEventListener('change', function() {
        updateFilter('realm', this.value);
    });
    
    document.getElementById('filter-level').addEventListener('change', function() {
        updateFilter('level', this.value);
    });
    
    document.getElementById('filter-shadow-arts').addEventListener('change', function() {
        updateFilter('shadowArts', this.value);
    });
    
    document.getElementById('filter-search').addEventListener('input', function() {
        updateFilter('search', this.value);
    });
    
    document.getElementById('clear-filters').addEventListener('click', clearAllFilters);
    
    // Cloud sync button handler
    document.getElementById('cloud-sync-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove any existing menu first
        const existingMenu = this.querySelector('.cloud-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        if (isCloudEnabled) {
            const menu = document.createElement('div');
            menu.className = 'cloud-menu';
            menu.innerHTML = `
                <button onclick="forceSync(); this.parentElement.remove();">🔄 Force Sync</button>
                <button onclick="testCloudConnection(); this.parentElement.remove();">🧪 Test Connection</button>
                <button onclick="setupCloudSync(); this.parentElement.remove();">⚙️ Settings</button>
                <button onclick="disconnectCloud(); this.parentElement.remove();">🔌 Disconnect</button>
            `;
            
            this.appendChild(menu);
            
            // Remove menu when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target) && !e.target.closest('#cloud-sync-btn')) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 100);
            
        } else {
            // Not connected to cloud, show setup
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
    document.getElementById('character-mood').addEventListener('click', updateCharacterMood);
});

// Make functions globally accessible
window.deleteEntry = deleteEntry;
window.editEntry = editEntry;
window.confirmDelete = confirmDelete;
window.viewFullImage = viewFullImage;
window.setupCloudSync = setupCloudSync;
window.closeCloudSetup = closeCloudSetup;
window.skipCloudSetup = skipCloudSetup;
window.disconnectCloud = disconnectCloud;
window.connectToCloud = connectToCloud;
window.forceSync = forceSync;
window.testCloudConnection = testCloudConnection;
window.uploadPortrait = uploadPortrait;
window.updateCharacterQuote = updateCharacterQuote;
window.updateCharacterMood = updateCharacterMood;
window.addEntryEventListeners = addEntryEventListeners;
window.updateFilter = updateFilter;
window.clearAllFilters = clearAllFilters;