export class SpeechEngine {
    constructor() {
        this.currentAudioUrl = null;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.browserTTS = null;
    }

    async generateSpeech(text, voiceId) {
        try {
            const result = await websim.textToSpeech({
                text: text,
                voice: voiceId,
            });

            // Clean up previous audio
            if (this.currentAudioUrl) {
                URL.revokeObjectURL(this.currentAudioUrl);
            }

            this.currentAudioUrl = result.url;
            return result;
        } catch (error) {
            console.error('Error generating speech:', error);
            throw error;
        }
    }

    async generateBrowserTTS(text) {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser TTS not supported'));
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Get available voices and use a default one
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                utterance.voice = voices[0]; // Use first available voice
            }

            utterance.onend = () => {
                resolve({ url: null });
            };

            utterance.onerror = (error) => {
                reject(error);
            };

            window.speechSynthesis.speak(utterance);
            resolve({ url: null });
        });
    }

    async playAudio(audioUrl) {
        this.audioPlayer.src = audioUrl;
        this.audioPlayer.style.display = 'block';
        await this.audioPlayer.play();
    }

    stopAudio() {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
    }

    playPresetAudio(audioFile) {
        if (audioFile && audioFile !== 'missing') {
            const audio = new Audio(audioFile);
            audio.play().catch(e => console.log('Audio play failed:', e));
            return true;
        }
        return false;
    }
}