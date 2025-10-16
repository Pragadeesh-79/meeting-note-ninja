// Demo version with built-in mock parser for GitHub Pages
const parseBtn = document.getElementById("parseBtn");
const notesEl = document.getElementById("notes");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const decisionsList = document.getElementById("decisionsList");
const discussionList = document.getElementById("discussionList");
const actionTableBody = document.querySelector("#actionTable tbody");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

// Built-in intelligent mock parser for demo
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
        success: true,
        data: {
            decisions,
            actionItems,
            keyDiscussion
        }
    };
}

parseBtn.addEventListener("click", async () => {
  const text = notesEl.value.trim();
  if (!text) {
    showNotification("Please paste your meeting notes first", "warning");
    return;
  }

  // Enhanced loading state
  statusEl.textContent = "AI is analyzing your meeting notes...";
  statusEl.classList.add("loading");
  parseBtn.textContent = "Processing...";
  parseBtn.disabled = true;
  resultsEl.classList.add("hidden");
  
  try {
    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = intelligentMockParser(text);
    console.log('Received data:', response);
    renderResults(response);
    statusEl.textContent = "Analysis complete! Your meeting insights are ready.";
    showNotification("Meeting notes successfully parsed!", "success");
    
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Error analyzing notes. Please try again.";
    showNotification("Something went wrong. Please check your connection and try again.", "error");
  } finally {
    statusEl.classList.remove("loading");
    parseBtn.textContent = "Parse with AI";
    parseBtn.disabled = false;
  }
});

function renderResults(response) {
  // Extract data from the server response
  const data = response.data || response;
  console.log('Rendering data:', data);
  
  // Show results immediately without clearing animation that might interfere
  resultsEl.classList.remove("hidden");
  
  // Render decisions
  decisionsList.innerHTML = "";
  if (data.decisions && data.decisions.length > 0) {
    data.decisions.forEach((d, index) => {
      const li = document.createElement("li");
      li.textContent = d;
      li.style.opacity = "0";
      li.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
      decisionsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No specific decisions identified";
    li.style.opacity = "0.6";
    decisionsList.appendChild(li);
  }

  // Render action items
  actionTableBody.innerHTML = "";
  if (data.actionItems && data.actionItems.length > 0) {
    data.actionItems.forEach((a, index) => {
      const tr = document.createElement("tr");
      tr.style.opacity = "0";
      tr.style.animation = `fadeInUp 0.5s ease ${(index + 2) * 0.1}s forwards`;
      
      // Fix confidence calculation - server sends as percentage already
      const confidenceClass = getConfidenceClass(a.confidence / 100);
      const confidenceText = a.confidence ? a.confidence + '%' : 'N/A';
      const priorityBadge = a.priority ? `<span class="priority-badge ${a.priority.toLowerCase()}">${a.priority}</span>` : '';
      
      tr.innerHTML = `
        <td>
          <div class="task-content">
            <strong>${a.task}</strong>
            ${priorityBadge}
          </div>
        </td>
        <td class="assignee-cell">${a.assignee || 'TBD'}</td>
        <td class="deadline-cell">${formatDate(a.deadline) || 'TBD'}</td>
        <td class="confidence-cell">
          <span class="confidence-score ${confidenceClass}">${confidenceText}</span>
        </td>
      `;
      actionTableBody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="text-align: center; opacity: 0.6;">No action items identified</td>`;
    actionTableBody.appendChild(tr);
  }

  // Render discussion points
  discussionList.innerHTML = "";
  if (data.keyDiscussion && data.keyDiscussion.length > 0) {
    data.keyDiscussion.forEach((k, index) => {
      const li = document.createElement("li");
      li.textContent = k;
      li.style.opacity = "0";
      li.style.animation = `fadeInUp 0.5s ease ${(index + 4) * 0.1}s forwards`;
      discussionList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No key discussion points identified";
    li.style.opacity = "0.6";
    discussionList.appendChild(li);
  }
}

function getConfidenceClass(confidence) {
  if (!confidence) return 'low';
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

function formatDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 1000;
    font-weight: 600;
    max-width: 400px;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

copyBtn.addEventListener("click", async () => {
  try {
    const md = convertToMarkdownFromDOM();
    await navigator.clipboard.writeText(md);
    showNotification("Meeting minutes copied to clipboard!", "success");
  } catch (e) {
    showNotification("Failed to copy to clipboard", "error");
  }
});

downloadBtn.addEventListener("click", () => {
  try {
    const md = convertToMarkdownFromDOM();
    const blob = new Blob([md], {type:'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-minutes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Meeting minutes downloaded!", "success");
  } catch (e) {
    showNotification("Failed to download file", "error");
  }
});

function convertToMarkdownFromDOM() {
  const decisions = Array.from(decisionsList.children).map(li => li.textContent);
  const actions = Array.from(actionTableBody.children).map(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length >= 4) {
      return `- **${tds[0].textContent.trim()}** | Owner: ${tds[1].textContent} | Deadline: ${tds[2].textContent} | Confidence: ${tds[3].textContent}`;
    }
    return '';
  }).filter(action => action);
  const discussions = Array.from(discussionList.children).map(li => li.textContent);

  const timestamp = new Date().toLocaleString();
  
  let md = `# Meeting Minutes Report\n\n*Generated on ${timestamp}*\n\n`;
  
  md += `## Decisions Made\n`;
  if (decisions.length > 0 && !decisions[0].includes('No specific decisions')) {
    decisions.forEach(d => md += `- ${d}\n`);
  } else {
    md += `*No specific decisions were identified in this meeting.*\n`;
  }
  
  md += `\n## Action Items\n`;
  if (actions.length > 0 && !actions[0].includes('No action items')) {
    actions.forEach(a => md += `${a}\n`);
  } else {
    md += `*No action items were identified in this meeting.*\n`;
  }
  
  md += `\n## Key Discussion Points\n`;
  if (discussions.length > 0 && !discussions[0].includes('No key discussion')) {
    discussions.forEach(d => md += `- ${d}\n`);
  } else {
    md += `*No key discussion points were identified in this meeting.*\n`;
  }
  
  md += `\n---\n*Report generated by Meeting Note Ninja*`;
  
  return md;
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
  .demo-notice {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(217, 119, 6, 0.1));
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
    text-align: center;
  }
  
  .demo-notice p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .confidence-score.high { 
    background: linear-gradient(135deg, #10b981, #059669); 
    color: white;
  }
  .confidence-score.medium { 
    background: linear-gradient(135deg, #f59e0b, #d97706); 
    color: white;
  }
  .confidence-score.low { 
    background: linear-gradient(135deg, #6b7280, #4b5563); 
    color: white;
  }
  
  .priority-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 700;
    margin-top: 4px;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  
  .priority-badge.high {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
  
  .priority-badge.medium {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }
  
  .priority-badge.low {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
  }
  
  .results {
    display: grid !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .results.hidden {
    display: none !important;
  }
`;
document.head.appendChild(style);
