const resumeForm = document.getElementById('resume-form');
const suggestionsDiv = document.getElementById('suggestions');
const suggestionsText = document.getElementById('suggestions-text');
const loadingDiv = document.getElementById('loading');
const downloadBtn = document.getElementById('download-btn');

resumeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(resumeForm);
    suggestionsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    downloadBtn.classList.add('hidden');

    try {
        const response = await fetch('/analyze-resume', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        const formattedSuggestions = formatSuggestions(data.suggestions);
        suggestionsText.innerHTML = formattedSuggestions;
        suggestionsDiv.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        suggestionsText.textContent = 'An error occurred while processing your request.';
        suggestionsDiv.classList.remove('hidden');
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

function formatSuggestions(text) {
    // Replace ** with <strong> tags for bolding
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to <br> tags for proper line breaks
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Convert single asterisks to bullet points
    formattedText = formattedText.replace(/^\* /gm, '• ');
    
    return formattedText;
}

function downloadSuggestions() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = suggestionsText.innerText;
    const lines = doc.splitTextToSize(text, 180);
    let y = 10;
    const pageHeight = doc.internal.pageSize.height;

    lines.forEach(line => {
        if (y > pageHeight - 10) { // Check if we need to add a new page
            doc.addPage();
            y = 10; // Reset y position for the new page
        }
        doc.text(line, 10, y);
        y += 10; // Adjust the line height as needed
    });

    doc.save('resume_suggestions.pdf');
}

downloadBtn.addEventListener('click', downloadSuggestions);
