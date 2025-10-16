const parseBtn = document.getElementById("parseBtn");
const notesEl = document.getElementById("notes");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const decisionsList = document.getElementById("decisionsList");
const discussionList = document.getElementById("discussionList");
const actionTableBody = document.querySelector("#actionTable tbody");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

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
    // Use relative URL for production deployment
    const apiUrl = window.location.hostname === 'localhost' 
      ? "http://localhost:3001/api/parse-notes"
      : "/api/parse-notes";
    
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ notes: text })
    });
    
    if (!resp.ok) {
      throw new Error(`Server error: ${resp.status}`);
    }
    
    const data = await resp.json();
    console.log('Received data:', data); // Debug log
    renderResults(data);
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
  console.log('Rendering data:', data); // Debug log
  
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    margin-left: 8px;
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
