export class ShareManager {
    async shareToComments(historyItem) {
        try {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(5px);
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 16px;
                padding: 30px;
                max-width: 600px;
                width: 95%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            `;
            
            dialog.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #333; font-size: 1.4rem;">Share to Comments</h3>
                <div style="margin-bottom: 20px;">
                    <input type="text" id="searchProjects" placeholder="Search your projects..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 15px;">
                </div>
                <div id="projectGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
                    <div style="text-align: center; color: #666;">Loading your projects...</div>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 10px;">or</div>
                </div>
                <div style="margin: 20px 0;">
                    <input type="text" id="customUrlInput" placeholder="Enter websim.com or websim.ai URL..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button id="cancelShare" style="padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
                    <button id="confirmShare" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;" disabled>Share</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            let selectedProject = null;
            let customUrl = '';
            let allProjects = [];
            
            // Load user's projects
            const currentUser = await window.websim.getCurrentUser();
            const response = await fetch(`/api/v1/users/${currentUser.username}/projects`);
            const data = await response.json();
            allProjects = data.projects.data;
            
            const projectGrid = document.getElementById('projectGrid');
            const searchInput = document.getElementById('searchProjects');
            const confirmBtn = document.getElementById('confirmShare');
            
            const updateConfirmButtonState = () => {
                const customUrlValue = document.getElementById('customUrlInput').value.trim();
                const isValidWebsimUrl = /^https?:\/\/(?:[\w-]+\.)?(?:websim\.com|websim\.ai)(?:\/.*)?$/i.test(customUrlValue);

                if (selectedProject) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Share with Project';
                } else if (customUrlValue && isValidWebsimUrl) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Share with URL';
                } else if (customUrlValue === '') {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Share without Project URL';
                } else {
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = 'Invalid URL';
                }
            };

            const renderProjects = (projects) => {
                projectGrid.innerHTML = '';
                
                if (projects.length === 0) {
                    projectGrid.innerHTML = '<div style="text-align: center; color: #666; grid-column: 1/-1;">No projects found</div>';
                    return;
                }
                
                projects.forEach(({project, site}) => {
                    const projectDiv = document.createElement('div');
                    projectDiv.style.cssText = `
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 10px;
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.3s ease;
                        border: 2px solid transparent;
                    `;
                    
                    projectDiv.innerHTML = `
                        <div style="aspect-ratio: 1; background: #e9ecef; border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ${project.thumbnail?.url ? 
                                `<img src="${project.thumbnail.url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="${project.title || 'Untitled'}">` : 
                                '📄'
                            }
                        </div>
                        <div style="font-size: 12px; font-weight: 500; color: #333; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${project.title || 'Untitled'}
                        </div>
                    `;
                    
                    projectDiv.onmouseenter = () => {
                        projectDiv.style.transform = 'translateY(-2px)';
                        projectDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    };
                    
                    projectDiv.onmouseleave = () => {
                        if (!selectedProject || selectedProject.project.id !== project.id) {
                            projectDiv.style.transform = 'none';
                            projectDiv.style.boxShadow = 'none';
                        }
                    };
                    
                    projectDiv.onclick = () => {
                        if (selectedProject && selectedProject.project.id === project.id) {
                            // Deselect if clicking the same project again
                            selectedProject = null;
                            projectDiv.style.borderColor = 'transparent';
                            projectDiv.style.transform = 'none';
                            projectDiv.style.boxShadow = 'none';
                        } else {
                            // Deselect previous
                            if (selectedProject) {
                                const prevSelected = document.querySelector(`[data-project-id="${selectedProject.project.id}"]`);
                                if (prevSelected) {
                                    prevSelected.style.borderColor = 'transparent';
                                    prevSelected.style.transform = 'none';
                                    prevSelected.style.boxShadow = 'none';
                                }
                            }
                            
                            // Select new
                            selectedProject = {project, site};
                            customUrl = '';
                            document.getElementById('customUrlInput').value = '';

                            projectDiv.style.borderColor = '#667eea';
                            projectDiv.style.transform = 'translateY(-2px)';
                            projectDiv.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
                        }
                        
                        updateConfirmButtonState();
                    };
                    
                    projectDiv.setAttribute('data-project-id', project.id);
                    projectGrid.appendChild(projectDiv);
                });
            };
            
            renderProjects(allProjects);
            
            // Search functionality
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredProjects = allProjects.filter(({project}) => 
                    (project.title || '').toLowerCase().includes(searchTerm)
                );
                renderProjects(filteredProjects);
            });
            
            // Custom URL input handling
            const customUrlInput = document.getElementById('customUrlInput');
            customUrlInput.addEventListener('input', (e) => {
                customUrl = e.target.value.trim();
                
                // When user types in custom URL, deselect any project
                if (selectedProject) {
                    const prevSelected = document.querySelector(`[data-project-id="${selectedProject.project.id}"]`);
                    if (prevSelected) {
                        prevSelected.style.borderColor = 'transparent';
                        prevSelected.style.transform = 'none';
                        prevSelected.style.boxShadow = 'none';
                    }
                    selectedProject = null;
                }
                
                updateConfirmButtonState();
            });
            
            // Set initial state of the confirm button
            updateConfirmButtonState();

            // Handle button clicks
            document.getElementById('cancelShare').onclick = () => {
                document.body.removeChild(overlay);
            };
            
            document.getElementById('confirmShare').onclick = async () => {
                try {
                    // Upload audio to websim storage
                    const response = await fetch(historyItem.audioUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' });
                    const websimUrl = await window.websim.upload(file);
                    
                    let commentText = `${websimUrl}\n\n${historyItem.voiceName}: "${historyItem.text}"`;
                    
                    if (selectedProject) {
                        commentText = `https://websim.com/p/${selectedProject.project.id}\n\n${websimUrl}\n\n${historyItem.voiceName}: "${historyItem.text}"`;
                    } else if (customUrl) {
                        commentText = `${customUrl}\n\n${websimUrl}\n\n${historyItem.voiceName}: "${historyItem.text}"`;
                    }
                    
                    await window.websim.postComment({
                        content: commentText
                    });
                    
                    document.body.removeChild(overlay);
                    return true;
                    
                } catch (error) {
                    console.error('Error sharing to comments:', error);
                    throw error;
                }
            };
            
        } catch (error) {
            console.error('Error creating share dialog:', error);
            throw error;
        }
    }
}