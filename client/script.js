/**
 * Meeting Note Ninja - Enhanced Interactive Script
 * Hexuno AI - Modern, Futuristic Design System
 */

class MeetingNoteNinja {
    constructor() {
        this.isLoading = false;
        this.currentTheme = 'light';
        
        this.init();
        this.setupEventListeners();
        this.initParticleAnimation();
        this.initTypewriterEffect();
        this.initScrollReveal();
    }

    init() {
        // Initialize theme
        const savedTheme = localStorage.getItem('ninja-theme') || 'light';
        this.setTheme(savedTheme);
        
        // Initialize smooth scrolling
        this.initSmoothScroll();
    }

    setupEventListeners() {
        // Core functionality buttons
        document.getElementById('parseBtn')?.addEventListener('click', () => this.parseNotes());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyMinutes());
        document.getElementById('downloadBtn')?.addEventListener('click', () => this.downloadReport());
        
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Scroll to top
        document.getElementById('scrollToTop')?.addEventListener('click', () => this.scrollToTop());
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Hero action buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleHeroAction(e));
        });

        // Feature cards hover effect
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.animateFeatureCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateFeatureCard(card, 'leave'));
        });

        // Window scroll events
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    async parseNotes() {
        if (this.isLoading) return;

        const notesTextarea = document.getElementById('notes');
        const parseBtn = document.getElementById('parseBtn');
        const statusDiv = document.getElementById('status');
        const resultsSection = document.getElementById('results');

        const notes = notesTextarea.value.trim();

        if (!notes) {
            this.showToast('Please enter some meeting notes first!', 'error');
            notesTextarea.focus();
            return;
        }

        // Start loading animation
        this.isLoading = true;
        parseBtn.classList.add('loading');
        this.setStatus('AI is analyzing your meeting notes...', 'loading');

        try {
            // Simulate processing time for better UX
            await this.delay(1500);

            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.displayResults(result.data);
                this.setStatus('Analysis complete! Your meeting insights are ready.', 'success');
                this.showToast('Meeting notes parsed successfully!', 'success');
                
                // Scroll to results with smooth animation
                setTimeout(() => {
                    resultsSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 300);
            } else {
                throw new Error(result.message || 'Failed to parse notes');
            }

        } catch (error) {
            console.error('Error parsing notes:', error);
            this.setStatus('Failed to parse notes. Please try again.', 'error');
            this.showToast('Error parsing notes. Please try again.', 'error');
        } finally {
            this.isLoading = false;
            parseBtn.classList.remove('loading');
        }
    }

    displayResults(data) {
        const resultsSection = document.getElementById('results');
        
        // Show results section with animation
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('visible');
        
        // Populate decisions
        this.populateList('decisionsList', data.decisions);
        
        // Populate action items table
        this.populateActionTable('actionTable', data.actionItems);
        
        // Populate key discussion
        this.populateList('discussionList', data.keyDiscussion);

        // Add reveal animation to result cards
        setTimeout(() => {
            document.querySelectorAll('.result-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'all 0.6s ease';
                    
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                }, index * 200);
            });
        }, 100);
    }

    populateList(listId, items) {
        const list = document.getElementById(listId);
        if (!list) return;

        list.innerHTML = '';
        
        if (!items || items.length === 0) {
            list.innerHTML = '<li style="font-style: italic; color: var(--text-muted);">No items found</li>';
            return;
        }

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            li.style.transition = 'all 0.4s ease';
            
            list.appendChild(li);
            
            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    populateActionTable(tableId, items) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        if (!items || items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; font-style: italic; color: var(--text-muted);">No action items found</td></tr>';
            return;
        }

        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.4s ease';
            
            row.innerHTML = `
                <td>${item.task}</td>
                <td style="text-align: center; font-weight: 600; color: var(--primary);">${item.assignee}</td>
                <td style="text-align: center; font-style: italic;">${item.deadline || 'TBD'}</td>
                <td style="text-align: center;">
                    <span class="confidence-badge" style="
                        background: linear-gradient(135deg, var(--success), var(--primary));
                        color: white;
                        padding: 4px 12px;
                        border-radius: 8px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    ">${item.confidence}%</span>
                </td>
            `;
            
            tbody.appendChild(row);
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    async copyMinutes() {
        const resultsSection = document.getElementById('results');
        
        if (resultsSection.classList.contains('hidden')) {
            this.showToast('Please parse some notes first!', 'error');
            return;
        }

        try {
            // Generate formatted text from results
            const formattedText = this.generateFormattedMinutes();
            
            await navigator.clipboard.writeText(formattedText);
            this.showToast('Meeting minutes copied to clipboard!', 'success');
            
            // Visual feedback on button
            const btn = document.getElementById('copyBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="btn-text">Copied!</span>';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    generateFormattedMinutes() {
        const decisions = Array.from(document.querySelectorAll('#decisionsList li')).map(li => li.textContent);
        const discussions = Array.from(document.querySelectorAll('#discussionList li')).map(li => li.textContent);
        const actionRows = Array.from(document.querySelectorAll('#actionTable tbody tr'));
        
        let formatted = '# Meeting Minutes\n\n';
        formatted += `Generated by Hexuno Meeting Note Ninja\n`;
        formatted += `Date: ${new Date().toLocaleDateString()}\n\n`;
        
        if (decisions.length > 0 && !decisions[0].includes('No items found')) {
            formatted += '## Decisions Made\n';
            decisions.forEach(decision => formatted += `• ${decision}\n`);
            formatted += '\n';
        }
        
        if (actionRows.length > 0) {
            formatted += '## Action Items\n';
            actionRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    formatted += `• ${cells[0].textContent} (${cells[1].textContent})\n`;
                }
            });
            formatted += '\n';
        }
        
        if (discussions.length > 0 && !discussions[0].includes('No items found')) {
            formatted += '## Key Discussion Points\n';
            discussions.forEach(discussion => formatted += `• ${discussion}\n`);
        }
        
        return formatted;
    }

    downloadReport() {
        const resultsSection = document.getElementById('results');
        
        if (resultsSection.classList.contains('hidden')) {
            this.showToast('Please parse some notes first!', 'error');
            return;
        }

        try {
            const formattedText = this.generateFormattedMinutes();
            const blob = new Blob([formattedText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `meeting-minutes-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast('Meeting report downloaded!', 'success');
            
            // Visual feedback
            const btn = document.getElementById('downloadBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="btn-text">Downloaded!</span>';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Error downloading report:', error);
            this.showToast('Failed to download report', 'error');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(this.currentTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `${theme}-theme`;
        
        // Update theme icon - the SVG will be rotated via CSS
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
            themeToggle.setAttribute('title', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        }
        
        localStorage.setItem('ninja-theme', theme);
        
        // Update CSS variables for dark theme
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--bg-primary', '#0F172A');
            document.documentElement.style.setProperty('--bg-secondary', '#1E293B');
            document.documentElement.style.setProperty('--bg-tertiary', '#334155');
            document.documentElement.style.setProperty('--text-primary', '#F1F5F9');
            document.documentElement.style.setProperty('--text-secondary', '#CBD5E1');
            document.documentElement.style.setProperty('--border', '#334155');
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#F9FAFB');
            document.documentElement.style.setProperty('--bg-secondary', '#FFFFFF');
            document.documentElement.style.setProperty('--bg-tertiary', '#F3F4F6');
            document.documentElement.style.setProperty('--text-primary', '#1E293B');
            document.documentElement.style.setProperty('--text-secondary', '#475569');
            document.documentElement.style.setProperty('--border', '#E2E8F0');
        }
    }

    setStatus(message, type = '') {
        const statusDiv = document.getElementById('status');
        if (!statusDiv) return;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg class="status-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else if (type === 'error') {
            iconSvg = '<svg class="status-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/></svg>';
        } else if (type === 'loading') {
            iconSvg = '<svg class="status-icon loading-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M12 18v4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M2 12h4M18 12h4M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        }

        statusDiv.innerHTML = iconSvg + '<span class="status-text">' + message + '</span>';
        statusDiv.className = `status ${type}`;
        
        if (type === 'loading') {
            statusDiv.style.background = 'rgba(109, 40, 217, 0.1)';
            statusDiv.style.color = 'var(--primary)';
        } else if (type === 'success') {
            statusDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            statusDiv.style.color = 'var(--success)';
        } else if (type === 'error') {
            statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            statusDiv.style.color = 'var(--error)';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    initParticleAnimation() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrame;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.1
        });

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(109, 40, 217, ${particle.opacity})`;
                ctx.fill();
            });
            
            animationFrame = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        // Cleanup function
        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }

    initTypewriterEffect() {
        const subtitle = document.getElementById('heroSubtitle');
        if (!subtitle) return;

        const text = subtitle.textContent;
        subtitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typewriter effect after a delay
        setTimeout(typeWriter, 1000);
    }

    initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for scroll reveal
        document.querySelectorAll('.features, .testimonials, .main-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease';
            observer.observe(section);
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    handleHeroAction(e) {
        const button = e.target.closest('button');
        if (button.textContent.includes('Try Free')) {
            document.getElementById('interface')?.scrollIntoView({ behavior: 'smooth' });
        } else if (button.textContent.includes('Watch Demo')) {
            this.showToast('Demo video coming soon!', 'success');
        }
    }

    animateFeatureCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(109, 40, 217, 0.15)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        }
    }

    handleScroll() {
        const header = document.querySelector('.header');
        const scrollToTopBtn = document.getElementById('scrollToTop');
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            header?.classList.add('scrolled');
            if (scrollToTopBtn) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
                scrollToTopBtn.style.transform = 'translateY(0)';
            }
        } else {
            header?.classList.remove('scrolled');
            if (scrollToTopBtn) {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.visibility = 'hidden';
                scrollToTopBtn.style.transform = 'translateY(20px)';
            }
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to parse
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.parseNotes();
        }
        
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeetingNoteNinja();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeetingNoteNinja;
}
