// Lady Yunalesca's Tracker - Fixed Cloud Sync System
let yunalescaEntries = JSON.parse(localStorage.getItem('yunalesca_entries') || '[]');
let yunalescaAchievements = JSON.parse(localStorage.getItem('yunalesca_achievements') || '[]');
let yunalescaCharacterData = JSON.parse(localStorage.getItem('yunalesca_character_data') || '{}');
let currentPortrait = localStorage.getItem('yunalesca_portrait') || '';

// Cloud sync variables
let githubToken = localStorage.getItem('yunalesca_github_token') || '';
let isCloudEnabled = false;
let lastSyncTime = 0;

// Unicode-safe base64 encoding
function unicodeToBase64(str) {
    try {
        // Convert Unicode string to base64 safely
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
        // Convert base64 back to Unicode string safely
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (error) {
        console.error('Base64 decoding error:', error);
        throw new Error('Failed to decode cloud data');
    }
}

// Initialize cloud sync status
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

// Improved cloud sync functions
async function syncToCloud() {
    if (!isCloudEnabled || !githubToken) {
        console.log('Cloud sync disabled or no token');
        return false;
    }

    // Prevent too frequent syncing (rate limiting)
    const now = Date.now();
    if (now - lastSyncTime < 5000) { // 5 second cooldown
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

        // First, try to get the current file to get its SHA
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

        // Create or update the file
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
                setTimeout(() => syncToCloud(), 60000); // Retry in 1 minute
            } else {
                updateSyncStatus('❌ Sync failed - will retry', true);
                setTimeout(() => syncToCloud(), 10000); // Retry in 10 seconds
            }
            return false;
        }
    } catch (error) {
        console.error('Cloud sync error:', error);
        updateSyncStatus('❌ Sync error - will retry', true);
        setTimeout(() => syncToCloud(), 15000); // Retry in 15 seconds
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
        
        const response = await fetch('https://api.github.com/repos/knightofren2588/lady-yunalesca-journey/contents/data/yunalesca-data.json', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const fileData = await response.json();
            const decodedContent = base64ToUnicode(fileData.content);
            const cloudData = JSON.parse(decodedContent);

            // Load cloud data
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
            console.log('✅ Successfully loaded from cloud');
            
            // Refresh the display
            displayEntries();
            updateAchievements();
            updateCharacterDisplay();
            
            return true;
        } else if (response.status === 404) {
            console.log('No cloud data found - this is normal for first time setup');
            updateSyncStatus('✅ Connected (no cloud data yet)', false);
            return false;
        } else {
            const errorText = await response.text();
            console.error('Failed to load from cloud:', response.status, errorText);
            updateSyncStatus('❌ Failed to load from cloud', true);
            return false;
        }
    } catch (error) {
        console.error('Error loading from cloud:', error);
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

        // Test repository access
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

        // Test if we can create files in the repo
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
            
            // Clean up test file
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

// Rest of your existing functions (keeping all the original functionality)...

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

    // Handle screenshot
    const fileInput = document.getElementById('screenshot');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Compress and resize image
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 800px width)
                let { width, height } = img;
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
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
    
    // Sync to cloud
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    // Show success message
    showNotification('✨ Memory crystallized in the eternal archive');
}

function deleteEntry(entryId) {
    const entryIndex = yunalescaEntries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) return;
    
    const entry = yunalescaEntries[entryIndex];
    
    // Show confirmation modal
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
    // Remove from array
    yunalescaEntries = yunalescaEntries.filter(entry => entry.id !== entryId);
    
    // Save to localStorage
    localStorage.setItem('yunalesca_entries', JSON.stringify(yunalescaEntries));
    
    // Update display
    displayEntries();
    updateAchievements();
    
    // Sync to cloud
    if (isCloudEnabled) {
        syncToCloud();
    }
    
    // Remove modal
    document.querySelector('.modal-overlay').remove();
    
    // Show notification
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

// Cloud sync setup functions
function setupCloudSync() {
    const modal = document.getElementById('cloud-setup-modal');
    const tokenInput = document.getElementById('github-token-input');
    
    // Pre-fill if token exists
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
    
    // Save token
    githubToken = newToken;
    localStorage.setItem('yunalesca_github_token', githubToken);
    
    // Test connection
    await testCloudConnection();
    
    // Try to load existing data
    const hasCloudData = await loadFromCloud();
    
    if (!hasCloudData) {
        // No cloud data, sync current local data
        await syncToCloud();
    }
    
    // Enable cloud sync
    isCloudEnabled = true;
    document.getElementById('cloud-sync-btn').innerHTML = '☁️ Connected';
    document.getElementById('cloud-sync-btn').classList.add('connected');
    
    closeCloudSetup();
}

function forceSync() {
    if (isCloudEnabled) {
        lastSyncTime = 0; // Reset cooldown
        syncToCloud();
    } else {
        setupCloudSync();
    }
}

// Initialize cloud sync on page load
function initializeCloudSync() {
    const savedToken = localStorage.getItem('yunalesca_github_token');
    if (savedToken) {
        githubToken = savedToken;
        isCloudEnabled = true;
        document.getElementById('cloud-sync-btn').innerHTML = '☁️ Connected';
        document.getElementById('cloud-sync-btn').classList.add('connected');
        
        // Load from cloud on startup
        loadFromCloud();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeCloudSync();
    displayEntries();
    updateAchievements();
    updateCharacterDisplay();
    
    // Cloud sync button
    document.getElementById('cloud-sync-btn').addEventListener('click', function() {
        if (isCloudEnabled) {
            // Show cloud menu
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
});

// Rest of your existing functions (achievements, character display, etc.)
// ... keeping all the original functionality intact ...