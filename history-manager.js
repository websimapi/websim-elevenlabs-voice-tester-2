import { saveToStorage, loadFromStorage } from './storage.js';

export class HistoryManager {
    constructor() {
        this.speechHistory = loadFromStorage('speech_history', []);
    }

    addHistoryItem(text, voiceId, voiceName, audioUrl) {
        const historyItem = {
            id: Date.now(),
            text: text,
            voiceId: voiceId,
            voiceName: voiceName,
            audioUrl: audioUrl,
            timestamp: new Date().toISOString()
        };
        
        this.speechHistory.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.speechHistory.length > 50) {
            this.speechHistory = this.speechHistory.slice(0, 50);
        }
        
        this.saveHistory();
        return historyItem;
    }

    getHistoryItem(itemId) {
        return this.speechHistory.find(h => h.id === Number(itemId));
    }

    deleteHistoryItem(itemId) {
        const itemIndex = this.speechHistory.findIndex(h => h.id === Number(itemId));
        if (itemIndex === -1) return false;
        
        const item = this.speechHistory[itemIndex];
        if (item && item.audioUrl) {
            URL.revokeObjectURL(item.audioUrl);
        }
        
        this.speechHistory.splice(itemIndex, 1);
        this.saveHistory();
        return true;
    }

    saveHistory() {
        saveToStorage('speech_history', this.speechHistory);
    }

    getHistory() {
        return this.speechHistory;
    }
}