// Import all modules
import { VoiceManager } from './voice-manager.js';
import { SpeechEngine } from './speech-engine.js';
import { HistoryManager } from './history-manager.js';
import { ShareManager } from './share-manager.js';
import { DownloadManager } from './download-manager.js';
import { CameraManager } from './camera-manager.js';
import { renderVoiceList, renderHistory, updateButtonStates } from './ui-components.js';

// Initialize managers
const voiceManager = new VoiceManager();
const speechEngine = new SpeechEngine();
const historyManager = new HistoryManager();
const shareManager = new ShareManager();
const downloadManager = new DownloadManager();
const cameraManager = new CameraManager();

// Remove excluded voices from preset buttons
const excludedVoices = [
    "eleven_multilingual_v2",
    "eleven_flash_v2_5", 
    "eleven_flash_v2",
    "eleven_turbo_v2_5",
    "eleven_turbo_v2"
];

// DOM elements
const voiceIdInput = document.getElementById('voiceIdInput');
const addVoiceBtn = document.getElementById('addVoiceBtn');
const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');

// Camera elements
const startCameraBtn = document.getElementById('startCameraBtn');
const captureTextBtn = document.getElementById('captureTextBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const speakDetectedBtn = document.getElementById('speakDetectedBtn');
const copyDetectedBtn = document.getElementById('copyDetectedBtn');
const clearDetectedBtn = document.getElementById('clearDetectedBtn');
const useBrowserTTSCheckbox = document.getElementById('useBrowserTTS');

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    // Hide excluded preset voices
    document.querySelectorAll('.preset-btn').forEach(btn => {
        if (excludedVoices.includes(btn.dataset.voice)) {
            btn.style.display = 'none';
        }
    });
    
    // Initial render
    renderVoiceList(voiceManager);
    renderHistory(historyManager);
    updateButtonStates();
});

// Event listeners
addVoiceBtn.addEventListener('click', () => {
    const voiceId = voiceIdInput.value.trim();
    if (!voiceId) return;

    if (!voiceManager.addVoice(voiceId)) {
        alert('Voice ID already exists!');
        return;
    }

    voiceIdInput.value = '';
    renderVoiceList(voiceManager);
});

voiceIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addVoiceBtn.click();
    }
});

speakBtn.addEventListener('click', async () => {
    const useBrowserTTS = useBrowserTTSCheckbox?.checked;
    const selectedVoiceId = voiceManager.selectedVoiceId;
    
    if (!textInput.value.trim()) return;
    
    if (useBrowserTTS) {
        // Use browser TTS
        try {
            await speechEngine.generateBrowserTTS(textInput.value);
            return;
        } catch (error) {
            alert('Browser TTS not supported or failed. Please select an ElevenLabs voice.');
            return;
        }
    }
    
    // Use ElevenLabs
    if (!selectedVoiceId) return;

    speakBtn.disabled = true;
    speakBtn.textContent = 'Generating...';

    try {
        const result = await speechEngine.generateSpeech(textInput.value, selectedVoiceId);
        await speechEngine.playAudio(result.url);
        
        // Add to history
        const selectedVoice = voiceManager.getSelectedVoice();
        const voiceName = selectedVoice?.name || selectedVoiceId;
        
        historyManager.addHistoryItem(
            textInput.value,
            selectedVoiceId,
            voiceName,
            result.url
        );
        
        renderHistory(historyManager);
        
    } catch (error) {
        console.error('Error generating speech:', error);
        alert('Error generating speech. Please check the voice ID and try again.');
    } finally {
        speakBtn.disabled = false;
        speakBtn.textContent = 'Speak';
    }
});

stopBtn.addEventListener('click', () => {
    speechEngine.stopAudio();
    window.speechSynthesis.cancel(); // Stop browser TTS
});

// Camera event listeners
startCameraBtn.addEventListener('click', async () => {
    await cameraManager.startCamera();
});

captureTextBtn.addEventListener('click', async () => {
    const detectedText = await cameraManager.captureText();
    if (detectedText) {
        // Automatically copy to input and speak if browser TTS is enabled
        const useBrowserTTS = useBrowserTTSCheckbox?.checked;
        if (useBrowserTTS) {
            textInput.value = detectedText;
            updateButtonStates();
            speakBtn.click();
        }
    }
});

switchCameraBtn.addEventListener('click', () => {
    cameraManager.switchCamera();
});

stopCameraBtn.addEventListener('click', () => {
    cameraManager.stopCamera();
});

speakDetectedBtn.addEventListener('click', () => {
    const useBrowserTTS = useBrowserTTSCheckbox?.checked;
    const detectedText = cameraManager.detectedText;
    
    if (!detectedText) return;
    
    if (useBrowserTTS) {
        speechEngine.generateBrowserTTS(detectedText);
    } else {
        // Use selected voice
        textInput.value = detectedText;
        updateButtonStates();
        speakBtn.click();
    }
});

copyDetectedBtn.addEventListener('click', () => {
    cameraManager.copyToInput();
});

clearDetectedBtn.addEventListener('click', () => {
    cameraManager.clearDetectedText();
});

useBrowserTTSCheckbox.addEventListener('change', updateButtonStates);

textInput.addEventListener('input', updateButtonStates);

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const voiceId = btn.dataset.voice;
        const name = btn.textContent;
        
        // Check if audio file exists
        const audioFile = voiceManager.getPresetAudioFile(voiceId);
        if (speechEngine.playPresetAudio(audioFile)) {
            // Enable button and add voice
            btn.disabled = false;
            btn.style.opacity = '1';
            
            voiceManager.addVoiceFromPreset(voiceId, name);
            renderVoiceList(voiceManager);
            
            // Set default text
            textInput.value = `Hey, I'm ${name}`;
            updateButtonStates();
        } else {
            // Grey out and disable button
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Audio file not available';
        }
    });
});

// Global functions for onclick handlers
window.selectVoice = (voiceId) => {
    voiceManager.selectVoice(voiceId);
    renderVoiceList(voiceManager);
};

window.deleteVoice = (voiceId) => {
    voiceManager.deleteVoice(voiceId);
    renderVoiceList(voiceManager);
};

window.playHistory = (itemId) => {
    const item = historyManager.getHistoryItem(itemId);
    if (item) {
        speechEngine.playAudio(item.audioUrl).catch(e => {
            console.error('Error playing history audio:', e);
            alert('Error playing audio. The file may have expired.');
        });
    }
};

window.deleteHistory = (itemId) => {
    if (historyManager.deleteHistoryItem(itemId)) {
        renderHistory(historyManager);
    }
};

window.downloadHistory = async (itemId) => {
    const item = historyManager.getHistoryItem(itemId);
    if (!item) return;
    
    try {
        await downloadManager.downloadHistoryItem(item);
    } catch (error) {
        alert('Error downloading file. Please try again.');
    }
};

window.downloadAllHistory = async () => {
    try {
        await downloadManager.downloadAllHistory(historyManager.getHistory());
    } catch (error) {
        alert('Error creating archive. Check console for details.');
    }
};

window.shareInComments = async (itemId, event) => {
    const item = historyManager.getHistoryItem(itemId);
    if (!item || !item.audioUrl) return;
    
    try {
        await shareManager.shareToComments(item);
        
        // Show success feedback
        const button = event.target;
        button.textContent = 'Shared!';
        button.style.backgroundColor = '#28a745';
        setTimeout(() => {
            button.textContent = 'Share';
            button.style.backgroundColor = '';
        }, 2000);
        
    } catch (error) {
        alert('Error sharing to comments. Please try again.');
    }
};