// Lady Yunalesca's Journey - From Spira to Azeroth

// Character data and quotes - Blending FFX and WoW themes
const characterData = {
    name: "Lady Yunalesca",
    title: "Eternal Summoner • Shadow Priest of Azeroth",
    currentPortrait: "🌙",
    
    quotes: {
        observing: [
            "The threads of fate weave differently in this realm, yet darkness remains constant...",
            "Azeroth's magic flows strangely compared to Spira's teachings.",
            "I watch these mortals struggle as I once watched pilgrims approach me.",
            "The Old Gods whisper, but their voices pale beside Sin's eternal roar.",
            "In this new world, I must learn new forms of power and sacrifice."
        ],
        
        accomplished: [
            "Each victory in Azeroth adds another layer to my eternal existence.",
            "My power grows in ways Spira never taught me to expect.",
            "The void accepts my offerings as readily as the Fayth once did.",
            "Progress... yet I wonder if this realm's cycle can be broken.",
            "Another step forward in understanding this world's mysteries."
        ],
        
        mystical: [
            "The boundary between life and death blurs differently here...",
            "Do these heroes understand the weight of their endless battles?",
            "I have seen civilizations rise and fall - Azeroth is but one more stage.",
            "The spiral of conflict continues, whether in Spira or this realm.",
            "Magic here pulses with a different rhythm than the songs of old."
        ],
        
        reflective: [
            "Once I offered the Final Aeon... now I offer shadow and healing.",
            "My memories of Zanarkand feel distant against Stormwind's walls.",
            "Would Zaon recognize the being I have become in this strange land?",
            "The pilgrimage never truly ends - it simply finds new paths.",
            "In learning Azeroth's ways, I discover new facets of eternity."
        ]
    },
    
    moods: ['observing', 'accomplished', 'mystical', 'reflective'],
    currentMood: 'observing'
};

// Achievement definitions - FFX names with WoW mechanics
const achievements = [
    // Level achievements - FFX themed names
    { id: 'level_10', name: 'First Teachings', description: 'Reach Level 10 in Azeroth', icon: '⭐', requirement: { type: 'level', value: 10 }, unlocked: false },
    { id: 'level_20', name: 'Pilgrimage Begun', description: 'Reach Level 20', icon: '🌟', requirement: { type: 'level', value: 20 }, unlocked: false },
    { id: 'level_30', name: 'Aeon Seeker', description: 'Reach Level 30', icon: '✨', requirement: { type: 'level', value: 30 }, unlocked: false },
    { id: 'level_40', name: 'Temple Guardian', description: 'Reach Level 40', icon: '💫', requirement: { type: 'level', value: 40 }, unlocked: false },
    { id: 'level_50', name: 'High Summoner', description: 'Reach Level 50', icon: '🔮', requirement: { type: 'level', value: 50 }, unlocked: false },
    { id: 'level_60', name: 'Eternal Keeper', description: 'Reach Level 60', icon: '👑', requirement: { type: 'level', value: 60 }, unlocked: false },
    { id: 'level_70', name: 'Void Transcendent', description: 'Reach Level 70', icon: '🏆', requirement: { type: 'level', value: 70 }, unlocked: false },
    { id: 'level_80', name: 'Lady of Azeroth', description: 'Reach Level 80', icon: '⚫', requirement: { type: 'level', value: 80 }, unlocked: false },
    
    // First-time achievements - FFX influenced
    { id: 'first_entry', name: 'Memory Sphere', description: 'Record your first memory in Azeroth', icon: '📜', requirement: { type: 'entries', value: 1 }, unlocked: false },
    { id: 'first_milestone', name: 'Growing Strength', description: 'Record your first milestone', icon: '🎯', requirement: { type: 'milestone_entry' }, unlocked: false },
    { id: 'first_dungeon', name: 'Cloister Trial', description: 'Complete your first dungeon', icon: '⚔️', requirement: { type: 'dungeon_entry' }, unlocked: false },
    { id: 'first_screenshot', name: 'Memory Crystal', description: 'Capture your first moment', icon: '📸', requirement: { type: 'screenshot' }, unlocked: false },
    { id: 'first_raid', name: 'Grand Trial', description: 'Face your first raid encounter', icon: '🛡️', requirement: { type: 'raid_entry' }, unlocked: false },
    { id: 'first_pvp', name: 'Eternal Conflict', description: 'Engage in your first battle against other heroes', icon: '⚡', requirement: { type: 'pvp_entry' }, unlocked: false },
    
    // Progress achievements - Blending both themes
    { id: 'chronicler', name: 'Sphere Chronicler', description: 'Record 10 memories', icon: '📚', requirement: { type: 'entries', value: 10 }, unlocked: false },
    { id: 'explorer', name: 'Realm Walker', description: 'Visit 10 different locations', icon: '🗺️', requirement: { type: 'zones', value: 10 }, unlocked: false },
    { id: 'photographer', name: 'Crystal Keeper', description: 'Capture 5 memory crystals', icon: '📷', requirement: { type: 'screenshots', value: 5 }, unlocked: false },
    { id: 'grand_chronicler', name: 'Master Chronicler', description: 'Record 25 memories of your journey', icon: '📖', requirement: { type: 'entries', value: 25 }, unlocked: false },
    { id: 'gear_collector', name: 'Armament Seeker', description: 'Document 5 equipment upgrades', icon: '⚙️', requirement: { type: 'gear_entry', value: 5 }, unlocked: false },
    
    // Special FFX-inspired achievements
    { id: 'spira_to_azeroth', name: 'Between Worlds', description: 'Bridge the gap between Spira and Azeroth', icon: '🌌', requirement: { type: 'entries', value: 5 }, unlocked: false },
    { id: 'eternal_wisdom', name: 'Eternal Wisdom', description: 'Reflect on 50 memories', icon: '🧿', requirement: { type: 'entries', value: 50 }, unlocked: false }
];

// Game state
let progressEntries = [];
let currentAchievements = [...achievements];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateCharacterQuote();
    displayProgressEntries();
    displayAchievements();
    updateStats();
    
    // Start ethereal orbs animation
    createEtherealOrbs();
});

// Event listeners
function initializeEventListeners() {
    // Modal controls
    document.getElementById('addEntryBtn').addEventListener('click', openModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('entryForm').addEventListener('submit', handleFormSubmit);
    
    // Character portrait and quotes
    const characterQuotes = document.getElementById('characterQuotes');
    const characterPortrait = document.getElementById('characterPortrait');
    
    if (characterQuotes) {
        characterQuotes.addEventListener('click', updateCharacterQuote);
    }
    
    if (characterPortrait) {
        characterPortrait.addEventListener('click', () => document.getElementById('portraitUpload').click());
    }
    
    // Portrait upload
    document.getElementById('portraitUpload').addEventListener('change', handlePortraitUpload);
    
    // Zone dropdown - show/hide custom zone input
    document.getElementById('currentZone').addEventListener('change', handleZoneChange);
    
    // Screenshot upload
    const screenshotUpload = document.getElementById('screenshotUpload');
    const uploadArea = document.getElementById('uploadArea');
    
    if (screenshotUpload && uploadArea) {
        screenshotUpload.addEventListener('change', handleScreenshotUpload);
        
        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    // Image overlay
    document.getElementById('imageOverlay').addEventListener('click', function(e) {
        if (e.target === this || e.target.id === 'closeOverlay') {
            closeImageOverlay();
        }
    });
    
    // Modal click outside to close
    document.getElementById('addEntryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Portrait upload handling
function handlePortraitUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB max for portrait)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert(`Portrait file too large! Please choose an image smaller than 5MB.\nYour file: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
        return;
    }
    
    // Compress and save portrait
    compressImage(file, 300, 300, 0.85).then(compressedDataUrl => {
        const portrait = document.getElementById('characterPortrait');
        portrait.style.backgroundImage = `url(${compressedDataUrl})`;
        portrait.textContent = ''; // Remove emoji when image is set
        
        // Save to localStorage
        localStorage.setItem('yunalesca_portrait', compressedDataUrl);
        
        // Add ethereal effect
        portrait.style.animation = 'eternal-pulse 1s ease-in-out';
        setTimeout(() => portrait.style.animation = '', 1000);
    });
}

// Screenshot upload handling
function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    processScreenshotFile(file);
}

function processScreenshotFile(file) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadFeedback = document.getElementById('uploadFeedback');
    
    // Validate file size (8MB max for screenshots)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
        showUploadFeedback(`Memory crystal too large! Please choose an image smaller than 8MB.\nYour file: ${(file.size / (1024 * 1024)).toFixed(1)}MB`, 'error');
        return;
    }
    
    // Show uploading state
    uploadArea.classList.add('uploading');
    showUploadFeedback('Crystallizing memory...', 'processing');
    
    // Compress image
    compressImage(file, 800, 600, 0.85).then(compressedDataUrl => {
        // Calculate compression savings
        const originalSize = (file.size / (1024 * 1024)).toFixed(1);
        const compressedSize = (compressedDataUrl.length * 0.75 / (1024 * 1024)).toFixed(1); // Approximate compressed size
        
        // Store compressed image data
        const screenshotUpload = document.getElementById('screenshotUpload');
        screenshotUpload.dataset.imageData = compressedDataUrl;
        
        // Show success
        uploadArea.classList.remove('uploading');
        uploadArea.classList.add('success');
        showUploadFeedback(`✨ Memory crystallized: ${file.name} (${originalSize}MB → ${compressedSize}MB)`, 'success');
        
    }).catch(error => {
        uploadArea.classList.remove('uploading');
        uploadArea.classList.add('error');
        showUploadFeedback(`Error crystallizing memory: ${error.message}`, 'error');
    });
}

function showUploadFeedback(message, type) {
    const uploadFeedback = document.getElementById('uploadFeedback');
    uploadFeedback.textContent = message;
    uploadFeedback.className = `upload-feedback ${type}`;
}

// Image compression utility
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Zone dropdown handling
function handleZoneChange(event) {
    const zoneSelect = event.target;
    const customZoneGroup = document.getElementById('customZoneGroup');
    const customZoneInput = document.getElementById('customZone');
    
    if (zoneSelect.value === 'Other') {
        customZoneGroup.style.display = 'block';
        customZoneInput.required = true;
        customZoneInput.focus();
    } else {
        customZoneGroup.style.display = 'none';
        customZoneInput.required = false;
        customZoneInput.value = '';
    }
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processScreenshotFile(files[0]);
    }
}

// Modal functions
function openModal() {
    const modal = document.getElementById('addEntryModal');
    modal.style.display = 'block';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').value = today;
    
    // Reset form and upload states
    resetForm();
}

function closeModal() {
    const modal = document.getElementById('addEntryModal');
    modal.style.display = 'none';
    resetForm();
}

function resetForm() {
    document.getElementById('entryForm').reset();
    
    // Reset custom zone
    const customZoneGroup = document.getElementById('customZoneGroup');
    const customZoneInput = document.getElementById('customZone');
    customZoneGroup.style.display = 'none';
    customZoneInput.required = false;
    customZoneInput.value = '';
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    const uploadFeedback = document.getElementById('uploadFeedback');
    const screenshotUpload = document.getElementById('screenshotUpload');
    
    uploadArea.classList.remove('uploading', 'success', 'error', 'dragover');
    uploadFeedback.className = 'upload-feedback';
    uploadFeedback.textContent = '';
    
    if (screenshotUpload) {
        delete screenshotUpload.dataset.imageData;
    }
}

// Form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get zone value (either from dropdown or custom input)
    const zoneSelect = document.getElementById('currentZone');
    const customZoneInput = document.getElementById('customZone');
    const selectedZone = zoneSelect.value === 'Other' ? customZoneInput.value : zoneSelect.value;
    
    const formData = {
        id: Date.now().toString(),
        date: document.getElementById('entryDate').value,
        zone: selectedZone,
        type: document.getElementById('entryType').value,
        description: document.getElementById('entryDescription').value,
        notes: document.getElementById('personalNotes').value,
        level: document.getElementById('currentLevel').value,
        spec: document.getElementById('currentSpec').value,
        gear: document.getElementById('currentGear').value,
        screenshot: document.getElementById('screenshotUpload').dataset.imageData || null,
        timestamp: new Date().toISOString()
    };
    
    // Add entry to array
    progressEntries.unshift(formData); // Add to beginning for reverse chronological order
    
    // Save to localStorage
    saveToStorage();
    
    // Update displays
    displayProgressEntries();
    updateStats();
    checkAchievements(formData);
    updateCharacterMood();
    
    // Close modal
    closeModal();
    
    // Show success feedback
    showTemporaryMessage('Memory preserved in the eternal record ✨');
}

// Character quote and mood system
function updateCharacterQuote() {
    const currentQuote = document.getElementById('currentQuote');
    const moodIndicator = document.getElementById('moodIndicator');
    
    // Get quotes for current mood
    const moodQuotes = characterData.quotes[characterData.currentMood];
    const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
    
    // Update quote with fade effect
    currentQuote.style.opacity = '0';
    setTimeout(() => {
        currentQuote.textContent = randomQuote;
        currentQuote.style.opacity = '1';
    }, 300);
    
    // Update mood indicator
    const moodEmojis = {
        observing: '👁️ Observing',
        accomplished: '💫 Accomplished', 
        mystical: '🔮 Mystical',
        reflective: '💭 Reflective'
    };
    
    moodIndicator.textContent = moodEmojis[characterData.currentMood];
}

function updateCharacterMood() {
    // Change mood based on recent entries
    const recentEntries = progressEntries.slice(0, 3);
    
    if (recentEntries.length === 0) {
        characterData.currentMood = 'observing';
    } else if (recentEntries.some(entry => entry.type === 'milestone' || entry.type === 'achievement')) {
        characterData.currentMood = 'accomplished';
    } else if (recentEntries.some(entry => entry.type === 'dungeon' || entry.type === 'raid' || entry.type === 'pvp')) {
        characterData.currentMood = 'mystical';
    } else {
        characterData.currentMood = 'reflective';
    }
    
    updateCharacterQuote();
}

// Progress entries display
function displayProgressEntries() {
    const container = document.getElementById('progressContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (progressEntries.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Clear existing entries except empty state
    const existingEntries = container.querySelectorAll('.progress-entry');
    existingEntries.forEach(entry => entry.remove());
    
    // Create entry elements
    progressEntries.forEach(entry => {
        const entryElement = createProgressEntryElement(entry);
        container.appendChild(entryElement);
    });
}

function createProgressEntryElement(entry) {
    const entryDiv = document.createElement('div');
    entryDiv.className = `progress-entry ${entry.type}`;
    
    // Format date
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Format text with line breaks
    const formattedDescription = formatText(entry.description);
    const formattedNotes = formatText(entry.notes);
    
    entryDiv.innerHTML = `
        <div class="progress-header">
            <div class="progress-date">${formattedDate}</div>
        </div>
        
        <div class="progress-meta">
            <div class="meta-item">
                <span class="meta-label">Realm:</span>
                <span class="meta-value">${entry.zone}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Type:</span>
                <span class="meta-value">${capitalizeFirst(entry.type)}</span>
            </div>
        </div>
        
        <div class="progress-description">
            <h4>Memory</h4>
            ${formattedDescription}
        </div>
        
        ${entry.notes ? `<div class="progress-notes"><h4>Reflections</h4>${formattedNotes}</div>` : ''}
        
        ${entry.screenshot ? `
            <div class="progress-screenshot">
                <img src="${entry.screenshot}" alt="Memory Crystal" onclick="showFullImage('${entry.screenshot}')">
            </div>
        ` : ''}
        
        <div class="progress-details">
            ${entry.level ? `<div><strong>Level:</strong> ${entry.level}</div>` : ''}
            ${entry.spec ? `<div><strong>Shadow Arts:</strong> ${entry.spec}</div>` : ''}
            ${entry.gear ? `<div class="progress-gear"><strong>Equipment & Crafts:</strong><br>${formatText(entry.gear)}</div>` : ''}
        </div>
    `;
    
    return entryDiv;
}

function formatText(text) {
    if (!text) return '';
    
    return text
        .replace(/\. /g, '.<br><br>') // Add breaks after sentences
        .replace(/: /g, ':<br>') // Add breaks after colons
        .replace(/\n/g, '<br>'); // Convert newlines to breaks
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Full screen image display
function showFullImage(imageSrc) {
    const overlay = document.getElementById('imageOverlay');
    const overlayImage = document.getElementById('overlayImage');
    
    overlayImage.src = imageSrc;
    overlay.style.display = 'block';
}

function closeImageOverlay() {
    document.getElementById('imageOverlay').style.display = 'none';
}

// Achievement system
function displayAchievements() {
    const achievementGrid = document.getElementById('achievementGrid');
    achievementGrid.innerHTML = '';
    
    currentAchievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            ${achievement.icon}
            <div class="achievement-tooltip">
                <strong>${achievement.name}</strong><br>
                ${achievement.description}
            </div>
        `;
        
        achievementGrid.appendChild(achievementElement);
    });
}

function checkAchievements(newEntry) {
    const unlockedAchievements = [];
    
    currentAchievements.forEach(achievement => {
        if (achievement.unlocked) return;
        
        let shouldUnlock = false;
        
        switch (achievement.requirement.type) {
            case 'level':
                if (newEntry.level && parseInt(newEntry.level) >= achievement.requirement.value) {
                    shouldUnlock = true;
                }
                break;
                
            case 'entries':
                if (progressEntries.length >= achievement.requirement.value) {
                    shouldUnlock = true;
                }
                break;
                
            case 'milestone_entry':
                if (newEntry.type === 'milestone') {
                    shouldUnlock = true;
                }
                break;
                
            case 'dungeon_entry':
                if (newEntry.type === 'dungeon') {
                    shouldUnlock = true;
                }
                break;
                
            case 'raid_entry':
                if (newEntry.type === 'raid') {
                    shouldUnlock = true;
                }
                break;
                
            case 'pvp_entry':
                if (newEntry.type === 'pvp') {
                    shouldUnlock = true;
                }
                break;
                
            case 'gear_entry':
                const gearEntries = progressEntries.filter(entry => entry.type === 'gear').length;
                if (gearEntries >= achievement.requirement.value) {
                    shouldUnlock = true;
                }
                break;
                
            case 'screenshot':
                if (newEntry.screenshot) {
                    shouldUnlock = true;
                }
                break;
                
            case 'screenshots':
                const screenshotCount = progressEntries.filter(entry => entry.screenshot).length;
                if (screenshotCount >= achievement.requirement.value) {
                    shouldUnlock = true;
                }
                break;
                
            case 'zones':
                const uniqueZones = [...new Set(progressEntries.map(entry => entry.zone))];
                if (uniqueZones.length >= achievement.requirement.value) {
                    shouldUnlock = true;
                }
                break;
        }
        
        if (shouldUnlock) {
            achievement.unlocked = true;
            unlockedAchievements.push(achievement);
        }
    });
    
    // Show notifications for newly unlocked achievements
    unlockedAchievements.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementNotification(achievement);
        }, index * 1000); // Stagger notifications
    });
    
    if (unlockedAchievements.length > 0) {
        displayAchievements();
        saveToStorage(); // Save achievement progress
    }
}

function showAchievementNotification(achievement) {
    const notification = document.getElementById('achievementNotification');
    const achievementTitle = document.getElementById('achievementTitle');
    
    achievementTitle.textContent = achievement.name;
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Stats update
function updateStats() {
    const totalEntries = progressEntries.length;
    const totalScreenshots = progressEntries.filter(entry => entry.screenshot).length;
    const totalAchievements = currentAchievements.filter(achievement => achievement.unlocked).length;
    
    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('totalScreenshots').textContent = totalScreenshots;
    document.getElementById('totalAchievements').textContent = totalAchievements;
}

// Ethereal orbs animation
function createEtherealOrbs() {
    const orbContainer = document.querySelector('.ethereal-orbs');
    
    // Add floating ethereal orbs
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createEtherealOrb();
        }, i * 600);
    }
}

function createEtherealOrb() {
    const orb = document.createElement('div');
    orb.className = 'floating-ethereal-orb';
    orb.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 5}px;
        height: ${2 + Math.random() * 5}px;
        background: radial-gradient(circle, rgba(173, 216, 230, 0.9), rgba(221, 160, 255, 0.7), transparent);
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: float-ethereal ${18 + Math.random() * 12}s linear infinite;
        box-shadow: 0 0 15px rgba(173, 216, 230, 0.6);
    `;
    
    // Add CSS animation for floating up
    if (!document.querySelector('#ethereal-orb-styles')) {
        const style = document.createElement('style');
        style.id = 'ethereal-orb-styles';
        style.textContent = `
            @keyframes float-ethereal {
                0% {
                    transform: translateY(0px) translateX(0px);
                    opacity: 0;
                }
                10% {
                    opacity: 0.9;
                }
                90% {
                    opacity: 0.9;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 150 - 75}px);
                    opacity: 0;
                }
            }
            
            @keyframes eternal-pulse {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(173, 216, 230, 0.8);
                    transform: scale(1); 
                }
                50% { 
                    box-shadow: 0 0 35px rgba(221, 160, 255, 1);
                    transform: scale(1.05); 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.querySelector('.ethereal-orbs').appendChild(orb);
    
    // Remove orb after animation
    setTimeout(() => {
        if (orb.parentNode) {
            orb.parentNode.removeChild(orb);
        }
        // Create a new one to keep the effect going
        setTimeout(createEtherealOrb, Math.random() * 6000);
    }, 30000);
}

// Storage functions
function saveToStorage() {
    localStorage.setItem('yunalesca_entries', JSON.stringify(progressEntries));
    localStorage.setItem('yunalesca_achievements', JSON.stringify(currentAchievements));
    localStorage.setItem('yunalesca_character_data', JSON.stringify(characterData));
}

function loadFromStorage() {
    // Load entries
    const savedEntries = localStorage.getItem('yunalesca_entries');
    if (savedEntries) {
        progressEntries = JSON.parse(savedEntries);
    }
    
    // Load achievements
    const savedAchievements = localStorage.getItem('yunalesca_achievements');
    if (savedAchievements) {
        currentAchievements = JSON.parse(savedAchievements);
    }
    
    // Load character data
    const savedCharacterData = localStorage.getItem('yunalesca_character_data');
    if (savedCharacterData) {
        Object.assign(characterData, JSON.parse(savedCharacterData));
    }
    
    // Load portrait
    const savedPortrait = localStorage.getItem('yunalesca_portrait');
    if (savedPortrait) {
        const portrait = document.getElementById('characterPortrait');
        if (portrait) {
            portrait.style.backgroundImage = `url(${savedPortrait})`;
            portrait.textContent = '';
        }
    }
}

// Utility functions
function showTemporaryMessage(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(45, 27, 78, 0.95), rgba(26, 26, 58, 0.95));
        color: #e6e6ff;
        padding: 15px 25px;
        border-radius: 12px;
        border: 2px solid rgba(173, 216, 230, 0.4);
        box-shadow: 0 0 20px rgba(221, 160, 255, 0.3);
        z-index: 3000;
        font-weight: bold;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add slide animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);