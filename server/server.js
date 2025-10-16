const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Intelligent Mock Parser - analyzes text content to provide varied results
function intelligentMockParser(text) {
    const cleanText = text.toLowerCase().trim();
    const words = cleanText.split(/\s+/);
    const wordCount = words.length;
    
    // Analysis patterns
    const hasDecisionWords = /\b(decide|decision|agreed|approve|reject|vote|choose|select|confirm)\b/i.test(text);
    const hasActionWords = /\b(action|task|todo|assign|complete|deadline|follow.?up|next.?step|will|should|need|prepare|create|send|contact|schedule|review|check|update|finish)\b/i.test(text);
    const hasDiscussionWords = /\b(discuss|talk|mention|suggest|idea|opinion|concern|issue|challenge|problem|solution|feedback)\b/i.test(text);
    const hasUrgency = /\b(urgent|asap|immediately|priority|critical|important)\b/i.test(text);
    const hasDates = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next.?week|deadline|by\s+\w+)\b/i.test(text);
    const hasNames = /\b([A-Z][a-z]+)\s+(will|should|needs?\s+to)\b/i.test(text);
    
    let decisions = [];
    let actionItems = [];
    let keyDiscussion = [];
    
    // Generate content based on text analysis
    if (hasDecisionWords || wordCount > 30) {
        if (cleanText.includes('budget') || cleanText.includes('money') || cleanText.includes('cost')) {
            decisions.push("Approved budget allocation for Q4 marketing initiatives");
        } else if (cleanText.includes('hire') || cleanText.includes('team') || cleanText.includes('staff')) {
            decisions.push("Authorized hiring of 2 additional team members for the project");
        } else if (cleanText.includes('product') || cleanText.includes('feature')) {
            decisions.push("Approved new product feature roadmap for next quarter");
        } else {
            decisions.push("Confirmed strategic direction based on discussed requirements");
        }
    }
    
    if (hasActionWords || wordCount > 20 || hasNames) {
        const urgencyLevel = hasUrgency ? "High" : hasDates ? "Medium" : "Low";
        
        // Extract specific tasks mentioned in the text
        const nameTaskMatches = text.match(/\b([A-Z][a-z]+)\s+(will|should|needs?\s+to)\s+([^.!?]+)/gi);
        if (nameTaskMatches) {
            nameTaskMatches.forEach(match => {
                const parts = match.match(/\b([A-Z][a-z]+)\s+(will|should|needs?\s+to)\s+([^.!?]+)/i);
                if (parts) {
                    actionItems.push({
                        task: parts[3].trim(),
                        assignee: parts[1],
                        confidence: 90,
                        priority: urgencyLevel
                    });
                }
            });
        }
        
        if (cleanText.includes('report') || cleanText.includes('document')) {
            actionItems.push({
                task: "Prepare comprehensive status report",
                assignee: "Project Manager",
                confidence: hasActionWords ? 95 : 75,
                priority: urgencyLevel
            });
        }
        
        if (cleanText.includes('meeting') || cleanText.includes('schedule')) {
            actionItems.push({
                task: "Schedule follow-up meeting with stakeholders",
                assignee: "Team Lead",
                confidence: 88,
                priority: urgencyLevel
            });
        }
        
        if (cleanText.includes('review') || cleanText.includes('check')) {
            actionItems.push({
                task: "Review and validate current progress metrics",
                assignee: "Technical Lead",
                confidence: 82,
                priority: urgencyLevel
            });
        }
        
        // Default action if no specific keywords found but action words detected
        if (actionItems.length === 0 && hasActionWords) {
            actionItems.push({
                task: "Follow up on discussed agenda items",
                assignee: "Team Coordinator",
                confidence: 70,
                priority: urgencyLevel
            });
        }
    }
    
    if (hasDiscussionWords || wordCount > 15) {
        if (cleanText.includes('challenge') || cleanText.includes('problem') || cleanText.includes('issue')) {
            keyDiscussion.push("Identified key challenges in current workflow and potential solutions");
        }
        
        if (cleanText.includes('improve') || cleanText.includes('better') || cleanText.includes('optimize')) {
            keyDiscussion.push("Explored opportunities for process improvement and optimization");
        }
        
        if (cleanText.includes('client') || cleanText.includes('customer') || cleanText.includes('user')) {
            keyDiscussion.push("Reviewed client feedback and user experience considerations");
        }
        
        // Default discussion point
        if (keyDiscussion.length === 0) {
            keyDiscussion.push("Comprehensive discussion on project status and next steps");
        }
    }
    
    // Ensure minimum content
    if (decisions.length === 0 && actionItems.length === 0 && keyDiscussion.length === 0) {
        decisions.push("Meeting conclusions to be documented");
        actionItems.push({
            task: "Follow up on meeting outcomes",
            assignee: "Meeting Organizer",
            confidence: 65,
            priority: "Medium"
        });
        keyDiscussion.push("General project discussion and planning session");
    }
    
    return {
        decisions,
        actionItems,
        keyDiscussion
    };
}

// API Routes
app.post('/api/parse', async (req, res) => {
    try {
        const { notes } = req.body;
        
        if (!notes || typeof notes !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid input: notes must be a non-empty string' 
            });
        }

        console.log('Processing notes:', notes.substring(0, 100) + '...');
        
        // Use intelligent mock parser for consistent results
        const parsedData = intelligentMockParser(notes);
        
        res.json({
            success: true,
            data: parsedData,
            metadata: {
                processingTime: Date.now(),
                wordCount: notes.split(/\s+/).length,
                parser: 'intelligent-mock'
            }
        });

    } catch (error) {
        console.error('Error parsing notes:', error);
        res.status(500).json({ 
            error: 'Failed to parse meeting notes',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Meeting Note Ninja API'
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Meeting Note Ninja server running on http://localhost:${PORT}`);
    console.log(`📝 Parser: Intelligent Mock (analyzing text patterns)`);
});

module.exports = app;