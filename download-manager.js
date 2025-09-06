export class DownloadManager {
    async downloadHistoryItem(historyItem) {
        try {
            // Upload to websim storage first
            const response = await fetch(historyItem.audioUrl);
            const blob = await response.blob();
            const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' });
            const websimUrl = await window.websim.upload(file);
            
            // Create download link with websim URL
            const link = document.createElement('a');
            link.href = websimUrl;
            
            const cleanText = historyItem.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            const cleanVoice = historyItem.voiceName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${cleanText}_${cleanVoice}.mp3`;
            
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error downloading history file:', error);
            throw error;
        }
    }

    async downloadAllHistory(speechHistory) {
        if (speechHistory.length === 0) return;
        
        const downloadBtn = document.querySelector('.download-all-btn');
        const originalText = downloadBtn.textContent;
        
        // Add spinner
        downloadBtn.classList.add('processing');
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<div class="loading-spinner"></div>Processing...';
        
        try {
            const zip = new JSZip();
            
            // Upload all audio files to websim storage
            console.log('Uploading audio files to websim storage...');
            
            for (let i = 0; i < speechHistory.length; i++) {
                const item = speechHistory[i];
                
                try {
                    const response = await fetch(item.audioUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' });
                    const websimUrl = await window.websim.upload(file);
                    
                    const cleanText = item.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                    const filename = `${String(i + 1).padStart(3, '0')}_${cleanText}_${item.voiceName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                    
                    // Add text content
                    const content = `Text: ${item.text}\nVoice: ${item.voiceName}\nVoice ID: ${item.voiceId}\nDate: ${new Date(item.timestamp).toLocaleString()}\nAudio URL: ${websimUrl}`;
                    zip.file(`${filename}.txt`, content);
                    
                    // Add metadata JSON
                    const metadata = {
                        text: item.text,
                        voiceId: item.voiceId,
                        voiceName: item.voiceName,
                        timestamp: item.timestamp,
                        audioUrl: websimUrl
                    };
                    zip.file(`${filename}.json`, JSON.stringify(metadata, null, 2));
                    
                    // Add audio file
                    const audioBlob = await (await fetch(websimUrl)).blob();
                    zip.file(`${filename}.mp3`, audioBlob);
                    
                } catch (error) {
                    console.error(`Error processing item ${i + 1}:`, error);
                    continue;
                }
            }
            
            // Create index file
            let index = `ElevenLabs Speech History Index\nGenerated: ${new Date().toLocaleString()}\nTotal: ${speechHistory.length}\n\n`;
            speechHistory.forEach((item, i) => {
                const cleanText = item.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                const filename = `${String(i + 1).padStart(3, '0')}_${cleanText}_${item.voiceName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                index += `${i + 1}. ${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}\n   Voice: ${item.voiceName}\n   Files: ${filename}.mp3, ${filename}.txt, ${filename}.json\n\n`;
            });
            zip.file('INDEX.txt', index);
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `elevenlabs_speech_${new Date().getTime()}.zip`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
            
        } catch (error) {
            console.error('Error creating zip:', error);
            throw error;
        } finally {
            // Restore button
            downloadBtn.classList.remove('processing');
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalText;
        }
    }
}