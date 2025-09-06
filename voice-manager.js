import { saveToStorage, loadFromStorage } from './storage.js';
import { updateButtonStates } from './ui-components.js';

// Voice management functionality
export class VoiceManager {
    constructor() {
        this.voices = loadFromStorage('elevenlabs_voices', []);
        this.selectedVoiceId = loadFromStorage('selected_voice', null);
        this.presetAudioFiles = {
            "pNInz6obpgDQGcFmaJgB": "044_Hey__I_m_Adam_Adam__pNInz6obpgDQGcFmaJgB_.mp3",
            "Xb7hH8MSUJpSbSDYk0k2": "043_Hey__I_m_Alice_Alice__Xb7hH8MSUJpSbSDYk0k2_.mp3",
            "ErXwobaYiN019PkySvjV": "042_Hey__I_m_Antoni_Antoni__ErXwobaYiN019PkySvjV_.mp3",
            "VR6AewLTigWG4xSOukaG": "041_Hey__I_m_Arnold_Arnold__VR6AewLTigWG4xSOukaG_.mp3",
            "nPczCjzI2devNBz1zQrb": "040_Hey__I_m_Brian_Brian__nPczCjzI2devNBz1zQrb_.mp3",
            "N2lVS1w4EtoT3dr4eOWO": "039_Hey__I_m_Callum_Callum__N2lVS1w4EtoT3dr4eOWO_.mp3",
            "IKne3meq5aSn9XLyUdCD": "038_Hey__I_m_Charlie_Charlie__IKne3meq5aSn9XLyUdCD_.mp3",
            "XB0fDUnXU5powFXDhCwa": "037_Hey__I_m_Charlotte_Charlotte__XB0fDUnXU5powFXDhCwa_.mp3",
            "iP95p4xoKVk53GoZ742B": "036_Hey__I_m_Chris_Chris__iP95p4xoKVk53GoZ742B_.mp3",
            "2EiwWnXFnvU5JabPnv8n": "035_Hey__I_m_Clyde_Clyde__2EiwWnXFnvU5JabPnv8n_.mp3",
            "onwK4e9ZLuTAKqWW03F9": "034_Hey__I_m_Daniel_Daniel__onwK4e9ZLuTAKqWW03F9_.mp3",
            "CYw3kZ02Hs0563khs1Fj": "033_Hey__I_m_Dave_Dave__CYw3kZ02Hs0563khs1Fj_.mp3",
            "AZnzlk1XvdvUeBnXmlld": "032_Hey__I_m_Domi_Domi__AZnzlk1XvdvUeBnXmlld_.mp3",
            "ThT5KcBeYPX3keUQqHPh": "031_Hey__I_m_Dorothy_Dorothy__ThT5KcBeYPX3keUQqHPh_.mp3",
            "29vD33N1CtxCmqQRPOHJ": "030_Hey__I_m_Drew_Drew__29vD33N1CtxCmqQRPOHJ_.mp3",
            "LcfcDJNUP1GQjkzn1xUU": "029_Hey__I_m_Emily_Emily__LcfcDJNUP1GQjkzn1xUU_.mp3",
            "g5CIjZEefAph4nQFvHAz": "028_Hey__I_m_Ethan_Ethan__g5CIjZEefAph4nQFvHAz_.mp3",
            "jsCqWAovK2LkecY7zXl4": "026_Hey__I_m_Freya_Freya__jsCqWAovK2LkecY7zXl4_.mp3",
            "D38z5RcWu1voky8WS1ja": "027_Hey__I_m_Fin_Fin__D38z5RcWu1voky8WS1ja_.mp3",
            "JBFqnCBsd6RMkjVDRZzb": "025_Hey__I_m_George_George__JBFqnCBsd6RMkjVDRZzb_.mp3",
            "zcAOhNBS3c14rBihAFp1": "023_Hey__I_m_Giovanni_Giovanni__zcAOhNBS3c14rBihAFp1_.mp3",
            "jBpfuIE2acCO8z3wKNLl": "024_Hey__I_m_Gigi_Gigi__jBpfuIE2acCO8z3wKNLl_.mp3",
            "z9fAnlkpzviPz146aGWa": "022_Hey__I_m_Glinda_Glinda__z9fAnlkpzviPz146aGWa_.mp3",
            "oWAxZDx7w5VEj9dCyTzz": "021_Hey__I_m_Grace_Grace__oWAxZDx7w5VEj9dCyTzz_.mp3",
            "SOYHLrjzK2X1ezoPC6cr": "020_Hey__I_m_Harry_Harry__SOYHLrjzK2X1ezoPC6cr_.mp3",
            "bVMeCyTHy58xNoL34h3p": "018_Hey__I_m_Jeremy_Jeremy__bVMeCyTHy58xNoL34h3p_.mp3",
            "Zlb1dXrM653N07WRdFW3": "016_Hey__I_m_Joseph_Joseph__Zlb1dXrM653N07WRdFW3_.mp3",
            "t0jbNlBVZ17f02VDIeMI": "017_Hey__I_m_Jessie_Jessie__t0jbNlBVZ17f02VDIeMI_.mp3",
            "ZQe5CZNOzWyzPSCn5a3c": "019_Hey__I_m_James_James__ZQe5CZNOzWyzPSCn5a3c_.mp3",
            "TxGEqnHWrfWFTfGW9XjX": "015_Hey__I_m_Josh_Josh__TxGEqnHWrfWFTfGW9XjX_.mp3",
            "pFZP5JQG7iQjIQuC4Bku": "013_Hey__I_m_Lily_Lily__pFZP5JQG7iQjIQuC4Bku_.mp3",
            "TX3LPaxmHKxFdv7VOQHJ": "014_Hey__I_m_Liam_Liam__TX3LPaxmHKxFdv7VOQHJ_.mp3",
            "XrExE9yKIg1WjnnlVkGX": "012_Hey__I_m_Matilda_Matilda__XrExE9yKIg1WjnnlVkGX_.mp3",
            "flq6f7yk4E4fJM5XTYuZ": "011_Hey__I_m_Michael_Michael__flq6f7yk4E4fJM5XTYuZ_.mp3",
            "zrHiDhphv9ZnVXBqCLjz": "010_Hey__I_m_Mimi_Mimi__zrHiDhphv9ZnVXBqCLjz_.mp3",
            "piTKgcLEGmPE4e6mEKli": "009_Hey__I_m_Nicole_Nicole__piTKgcLEGmPE4e6mEKli_.mp3",
            "ODq5zmih8GrVes37Dizd": "008_Hey__I_m_Patrick_Patrick__ODq5zmih8GrVes37Dizd_.mp3",
            "5Q0t7uMcjvnagumLfvZi": "007_Hey__I_m_Paul_Paul__5Q0t7uMcjvnagumLfvZi_.mp3",
            "21m00Tcm4TlvDq8ikWAM": "006_Hey__I_m_Rachel_Rachel__21m00Tcm4TlvDq8ikWAM_.mp3",
            "yoZ06aMxZJJ28mfd3POQ": "005_Hey__I_m_Sam_Sam__yoZ06aMxZJJ28mfd3POQ_.mp3",
            "EXAVITQu4vr4xnSDxMaL": "004_Hey__I_m_Sarah_Sarah__EXAVITQu4vr4xnSDxMaL_.mp3",
            "pMsXgVXv3BLzUgSXRplE": "003_Hey__I_m_Serena_Serena__pMsXgVXv3BLzUgSXRplE_.mp3",
            "GBv7mTt0atIp3Br8iCZE": "002_Hey__I_m_Thomas_Thomas__GBv7mTt0atIp3Br8iCZE_.mp3",
            "knrPHWnBmmDHMoiMeP3l": "001_Hey__I_m_Santa_Claus_Santa_Claus__knrPHWnBmmDHMoiMeP3l_.mp3"
        };
    }

    addVoice(voiceId, name = null) {
        if (!voiceId || this.voices.some(v => v.id === voiceId)) {
            return false;
        }

        this.voices.push({ 
            id: voiceId, 
            name: name || voiceId 
        });
        this.saveVoices();
        return true;
    }

    addVoiceFromPreset(voiceId, name) {
        if (this.voices.some(v => v.id === voiceId)) {
            this.selectVoice(voiceId);
            return;
        }

        this.voices.push({ 
            id: voiceId, 
            name: `${name} (${voiceId})` 
        });
        this.saveVoices();
        this.selectVoice(voiceId);
    }

    selectVoice(voiceId) {
        this.selectedVoiceId = voiceId;
        saveToStorage('selected_voice', voiceId);
        updateButtonStates();
    }

    deleteVoice(voiceId) {
        this.voices = this.voices.filter(v => v.id !== voiceId);
        if (this.selectedVoiceId === voiceId) {
            this.selectedVoiceId = null;
            saveToStorage('selected_voice', null);
        }
        this.saveVoices();
        updateButtonStates();
    }

    getSelectedVoice() {
        return this.voices.find(v => v.id === this.selectedVoiceId);
    }

    getPresetAudioFile(voiceId) {
        return this.presetAudioFiles[voiceId];
    }

    saveVoices() {
        saveToStorage('elevenlabs_voices', this.voices);
    }
}