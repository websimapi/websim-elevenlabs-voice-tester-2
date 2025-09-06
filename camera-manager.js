export class CameraManager {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentFacingMode = 'environment'; // Start with back camera on mobile
        this.detectedText = '';
        this.zoomLevel = 1;
        this.minZoom = 0.5;
        this.maxZoom = 5;
        this.zoomStep = 0.2;
        this.isDragging = false;
        this.lastPinchDistance = null;
        this.dragStart = { x: 0, y: 0 };
        this.videoOffset = { x: 0, y: 0 };
    }

    async startCamera() {
        try {
            if (this.stream) {
                this.stopCamera();
            }

            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.video.classList.add('active');
            
            // Enable/disable buttons
            document.getElementById('startCameraBtn').disabled = true;
            document.getElementById('captureTextBtn').disabled = false;
            document.getElementById('switchCameraBtn').disabled = false;
            document.getElementById('stopCameraBtn').disabled = false;

            return true;
        } catch (error) {
            console.error('Error starting camera:', error);
            alert('Unable to access camera. Please ensure you have granted camera permissions.');
            return false;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.classList.remove('active');
        this.video.srcObject = null;
        this.zoomLevel = 1;
        this.videoOffset = { x: 0, y: 0 };
        this.updateVideoTransform();
        
        // Reset buttons
        document.getElementById('startCameraBtn').disabled = false;
        document.getElementById('captureTextBtn').disabled = true;
        document.getElementById('switchCameraBtn').disabled = true;
        document.getElementById('stopCameraBtn').disabled = true;
    }

    switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        this.startCamera();
    }

    zoomIn() {
        const newZoom = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
        this.setZoom(newZoom);
    }

    zoomOut() {
        const newZoom = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
        this.setZoom(newZoom);
    }

    setZoom(level) {
        this.zoomLevel = level;
        this.updateVideoTransform();
    }

    updateVideoTransform() {
        const transform = `scale(${this.zoomLevel}) translate(${this.videoOffset.x}px, ${this.videoOffset.y}px)`;
        this.video.style.transform = transform;
        this.video.style.transformOrigin = 'center center';
    }

    handlePinchStart(distance) {
        this.lastPinchDistance = distance;
    }

    handlePinchMove(distance) {
        if (this.lastPinchDistance === null) return;
        
        const scale = distance / this.lastPinchDistance;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * scale));
        this.setZoom(newZoom);
        this.lastPinchDistance = distance;
    }

    handlePinchEnd() {
        this.lastPinchDistance = null;
    }

    handleDragStart(x, y) {
        this.isDragging = true;
        this.dragStart = { x, y };
    }

    handleDragMove(x, y) {
        if (!this.isDragging) return;
        
        const deltaX = (x - this.dragStart.x) / this.zoomLevel;
        const deltaY = (y - this.dragStart.y) / this.zoomLevel;
        
        this.videoOffset.x += deltaX;
        this.videoOffset.y += deltaY;
        this.dragStart = { x, y };
        
        this.updateVideoTransform();
    }

    handleDragEnd() {
        this.isDragging = false;
    }

    async captureText() {
        if (!this.video.videoWidth) return;

        // Set canvas dimensions to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw current video frame to canvas with zoom and offset applied
        this.ctx.save();
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        this.ctx.translate(this.videoOffset.x, this.videoOffset.y);
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        // Convert to blob
        const blob = await new Promise(resolve => {
            this.canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });

        // Convert blob to base64
        const reader = new FileReader();
        const base64Promise = new Promise(resolve => {
            reader.onloadend = () => resolve(reader.result);
        });
        reader.readAsDataURL(blob);
        const base64Image = await base64Promise;

        // Show capture overlay
        const overlay = document.getElementById('captureOverlay');
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 500);

        // Extract text from image using AI
        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Extract all readable text from this image. Return only the text content, no explanations or formatting.'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: base64Image }
                            }
                        ]
                    }
                ]
            });

            this.detectedText = completion.content.trim();
            this.updateDetectedTextDisplay();
            
            return this.detectedText;
        } catch (error) {
            console.error('Error extracting text:', error);
            alert('Error extracting text from image. Please try again.');
            return '';
        }
    }

    updateDetectedTextDisplay() {
        const detectedTextDiv = document.getElementById('detectedText');
        const speakBtn = document.getElementById('speakDetectedBtn');
        const copyBtn = document.getElementById('copyDetectedBtn');
        const clearBtn = document.getElementById('clearDetectedBtn');

        if (this.detectedText) {
            detectedTextDiv.textContent = this.detectedText;
            speakBtn.disabled = false;
            copyBtn.disabled = false;
            clearBtn.disabled = false;
        } else {
            detectedTextDiv.textContent = '';
            speakBtn.disabled = true;
            copyBtn.disabled = true;
            clearBtn.disabled = true;
        }
    }

    clearDetectedText() {
        this.detectedText = '';
        this.updateDetectedTextDisplay();
    }

    async copyToInput() {
        const textInput = document.getElementById('textInput');
        textInput.value = this.detectedText;
        
        // Update UI states
        const { updateButtonStates } = await import('./ui-components.js');
        updateButtonStates();
    }
}