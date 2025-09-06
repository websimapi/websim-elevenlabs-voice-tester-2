export function renderVoiceList(voiceManager) {
    const voiceList = document.getElementById('voiceList');
    voiceList.innerHTML = '';
    
    voiceManager.voices.forEach(voice => {
        const item = document.createElement('div');
        item.className = `voice-item ${voice.id === voiceManager.selectedVoiceId ? 'selected' : ''}`;
        
        item.innerHTML = `
            <div class="voice-info">
                <div class="voice-id">${voice.name}</div>
            </div>
            <div class="voice-actions">
                <button onclick="window.selectVoice('${voice.id}')">Select</button>
                <button class="delete-btn" onclick="window.deleteVoice('${voice.id}')">Delete</button>
            </div>
        `;
        
        voiceList.appendChild(item);
    });
}

export function renderHistory(historyManager) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    const history = historyManager.getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No generated speech yet</div>';
        return;
    }
    
    history.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        historyDiv.innerHTML = `
            <div class="history-text">${item.text}</div>
            <div class="history-voice">Voice: ${item.voiceName}</div>
            <div class="history-actions">
                <button class="play-history-btn" onclick="window.playHistory('${item.id}')">Play</button>
                <button class="download-history-btn" onclick="window.downloadHistory('${item.id}')">Download</button>
                <button class="share-history-btn" onclick="window.shareInComments('${item.id}', event)">Share</button>
                <button class="delete-history-btn" onclick="window.deleteHistory('${item.id}')">Delete</button>
            </div>
        `;
        historyList.appendChild(historyDiv);
    });
    
    // Add bulk download button if there are items
    if (history.length > 0) {
        const bulkDownloadDiv = document.createElement('div');
        bulkDownloadDiv.style.marginTop = '20px';
        bulkDownloadDiv.innerHTML = `
            <button class="download-all-btn" onclick="window.downloadAllHistory()">
                Download All (${history.length} items)
            </button>
        `;
        historyList.appendChild(bulkDownloadDiv);
    }
}

export function updateButtonStates() {
    const textInput = document.getElementById('textInput');
    const speakBtn = document.getElementById('speakBtn');
    const stopBtn = document.getElementById('stopBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    
    const selectedVoiceId = localStorage.getItem('selected_voice');
    const useBrowserTTS = document.getElementById('useBrowserTTS')?.checked;
    
    speakBtn.disabled = (!selectedVoiceId && !useBrowserTTS) || !textInput.value.trim();
    stopBtn.disabled = !audioPlayer.src;
}