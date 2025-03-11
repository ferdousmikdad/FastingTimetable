let currentLanguage = 'en'; // Default language
let currentArticleId = 1; // Default article ID
let articles = [];
let isDarkMode = true; // Default to dark mode

// Toast notification system
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out translate-x-full`;
  
  // Set toast style based on type
  if (type === 'success') {
    toast.className += ' bg-primary text-light';
  } else if (type === 'error') {
    toast.className += ' bg-red-500 text-light';
  } else if (type === 'info') {
    toast.className += ' bg-secondary text-light';
  }
  
  toast.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button class="ml-4 focus:outline-none">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 10);
  
  // Set up close button
  const closeButton = toast.querySelector('button');
  closeButton.addEventListener('click', () => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Fetch articles based on language
async function fetchArticles(language) {
  try {
    // For demo purposes, create mock data if the fetch fails
    try {
      const response = await fetch(`data/articles_${language}.json`);
      if (response.ok) {
        const data = await response.json();
        articles = data;
      } else {
        throw new Error('API response was not ok');
      }
    } catch (fetchError) {
      console.warn('Using mock data due to fetch error:', fetchError);
      // Mock data if fetch fails
      articles = [
        {
          id: 1,
          title: 'Ramadan Basics',
          views: 1245,
          headings: ['Introduction', 'Fasting Benefits', 'Prayer Times'],
          content: 'Ramadan is the ninth month of the Islamic calendar. It is observed by Muslims worldwide as a month of fasting, prayer, reflection and community.\n' +
                   'Fasting during Ramadan has numerous health benefits including improved blood sugar control, cholesterol levels, and increased mental discipline.\n' +
                   'Prayer times vary based on geographic location. During Ramadan, Muslims typically pray five daily prayers plus additional night prayers called Taraweeh.'
        },
        {
          id: 2,
          title: 'Ramadan Meal Planning',
          views: 987,
          headings: ['Suhoor Ideas', 'Iftar Suggestions', 'Hydration Tips'],
          content: 'Suhoor should be nutritious and sustaining. Consider complex carbohydrates, proteins, and healthy fats that release energy slowly throughout the day.\n' +
                   'Iftar traditionally begins with dates and water, following the Sunnah of Prophet Muhammad. This provides a quick energy boost before the main meal.\n' +
                   'Staying hydrated between iftar and suhoor is crucial. Aim to drink at least 8-10 glasses of water during non-fasting hours to maintain hydration.'
        }
      ];
    }
    
    renderSidebar();
    renderArticle(currentArticleId);
  } catch (error) {
    console.error('Error loading articles:', error);
    showToast('Failed to load articles', 'error');
  }
}

// Render sidebar with article list
function renderSidebar() {
  const sidebar = document.getElementById('article-list');
  if (!sidebar) return;
  
  sidebar.innerHTML = articles
    .map(
      (article) => `
      <li class="border-b border-gray-200 py-2">
        <button onclick="renderArticle(${article.id})" class="text-left w-full hover:text-primary p-2 rounded">
          ${article.title}
        </button>
      </li>
    `
    )
    .join('');
    
  // Also update mobile sidebar
  const mobileSidebar = document.getElementById('mobile-article-list');
  if (mobileSidebar) {
    mobileSidebar.innerHTML = sidebar.innerHTML;
  }
}

// Render article content
function renderArticle(id) {
  const article = articles.find((article) => article.id === id);
  if (!article) return;

  const articleTitle = document.getElementById('article-title');
  const articleViews = document.getElementById('article-views');
  const articleBody = document.getElementById('article-body');

  articleTitle.textContent = article.title;
  articleViews.textContent = `Views: ${article.views}`;

  // Render table of contents
  const toc = article.headings
    .map(
      (heading, index) => `
      <li class="mb-2">
        <a href="#section-${index}" class="text-secondary hover:underline">${heading}</a>
      </li>
    `
    )
    .join('');

  // Render article sections
  const sections = article.content
    .split('\n')
    .map(
      (section, index) => `
      <div id="section-${index}" class="mb-6">
        <h3 class="text-xl font-bold mb-2">${article.headings[index] || 'Section'}</h3>
        <p>${section}</p>
      </div>
    `
    )
    .join('');

  articleBody.innerHTML = `
    <div class="mb-6">
      <h3 class="text-lg font-bold mb-2">Table of Contents</h3>
      <ul class="list-disc pl-6">
        ${toc}
      </ul>
    </div>
    ${sections}
  `;

  // Update current article ID
  currentArticleId = id;
  
  // Close mobile sidebar if open
  const mobileSidebarContainer = document.getElementById('mobile-sidebar-container');
  if (mobileSidebarContainer && mobileSidebarContainer.classList.contains('active')) {
    toggleMobileSidebar();
  }
}

// Change language
function changeLanguage(language) {
  currentLanguage = language;
  fetchArticles(currentLanguage);
  
  // Close the dropdown after selection
  document.getElementById('language-dropdown').classList.remove('show');
  showToast(`Language changed to ${language === 'en' ? 'English' : language === 'bn' ? 'বাংলা' : 'العربية'}`, 'info');
}

// Toggle mobile menu dropdown
function toggleMobileMenu() {
  const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
  if (mobileMenuDropdown) {
    mobileMenuDropdown.classList.toggle('hidden');
  }
}

// Toggle mobile sidebar visibility
function toggleMobileSidebar() {
  const mobileSidebarContainer = document.getElementById('mobile-sidebar-container');
  if (mobileSidebarContainer) {
    mobileSidebarContainer.classList.toggle('active');
  }
}

// Generate PDF with improved formatting and language support
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const article = articles.find((article) => article.id === currentArticleId);
    
    if (!article) {
      showToast('Please select an article first', 'error');
      return;
    }
    
    // First page - dark background
    doc.setFillColor(43, 42, 40); // Dark background color (#2B2A28)
    doc.rect(0, 0, 210, 297, 'F'); // Fill the entire page
    
    // Add logo pattern (note: in PDF we can't directly use SVG, this is a placeholder)
    // In a real implementation, you'd need to convert the SVG to a data URL or image
    try {
      // Get the logo element from the DOM
      const logoElement = document.querySelector('[id="site-logo"]');
      
      if (logoElement && logoElement.complete) {
        // Create a canvas to convert the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use the natural width and height of the image
        const originalWidth = logoElement.naturalWidth;
        const originalHeight = logoElement.naturalHeight;
        
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        ctx.drawImage(logoElement, 0, 0, originalWidth, originalHeight);
        
        // Calculate the position to center the logo on the page
        // PDF page width is 210mm (A4)
        const pdfWidth = 210;
        
        // Set a maximum width for the logo (e.g., 60% of page width)
        const maxLogoWidth = pdfWidth * 0.5;
        
        // Calculate the scale to use (respecting the original ratio)
        let scale = 1;
        if (originalWidth > maxLogoWidth) {
          scale = maxLogoWidth / originalWidth;
        }
        
        // Calculate dimensions preserving aspect ratio
        const logoWidth = originalWidth * scale;
        const logoHeight = originalHeight * scale;
        
        // Center horizontally
        const xPos = (pdfWidth - logoWidth) / 2;
        // Position vertically (adjust the 80 value to move up or down)
        const yPos = 80;
        
        // Get data URL and add to PDF using calculated dimensions
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', xPos, yPos, logoWidth, logoHeight);
      } else {
        throw new Error('Logo not loaded in DOM');
      }
    } catch (logoError) {
      console.warn('Could not add logo to PDF:', logoError);
      // Fallback to text
      doc.setTextColor(202, 156, 119);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Ramadan Planner', 105, 100, { align: 'center' });
    }
    
    // Add article title with light color
    doc.setTextColor(253, 237, 220); // Light color (#FDEDDC)
    doc.setFontSize(20);
    
    // Use different fonts based on language
    if (currentLanguage === 'ar') {
      // For Arabic
      doc.setFont('Amiri', 'normal'); // Assuming Amiri font is available
    } else if (currentLanguage === 'bn') {
      // For Bengali 
      doc.setFont('Hind Siliguri', 'normal'); // Assuming Hind Siliguri font is available
    } else {
      // Default font
      doc.setFont('helvetica', 'bold');
    }
    
    doc.text(article.title, 105, 150, { align: 'center' });
    
    // Add generated date
    doc.setFontSize(12);
    doc.setTextColor(105, 102, 96); // Border gray color
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 170, { align: 'center' });
    
    // Add content page - start on page 2
    doc.addPage();
    
    // Add a header
    doc.setFillColor(202, 156, 119); // Primary color
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255); // White text for header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Contents', 105, 15, { align: 'center' });
    
    // Set up for content
    let yPosition = 40;
    
    // Render all article sections on the same page
    article.headings.forEach((heading, index) => {
      const content = article.content.split('\n')[index] || '';
      
      // Check if we need a new page (if less than 40 points remaining)
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 40;
      }
      
      // Add section heading
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(121, 85, 70); // Secondary color
      
      // Set appropriate font for different languages
      if (currentLanguage === 'ar') {
        doc.setFont('Amiri', 'bold');
        doc.setR2L(true); // Enable right-to-left for Arabic
      } else if (currentLanguage === 'bn') {
        doc.setFont('Hind Siliguri', 'bold');
      }
      
      doc.text(`${index + 1}. ${heading}`, 20, yPosition);
      yPosition += 10;
      
      // Add content with normal font
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(43, 42, 40); // Dark color
      
      // Set appropriate font for content in different languages
      if (currentLanguage === 'ar') {
        doc.setFont('Amiri', 'normal');
      } else if (currentLanguage === 'bn') {
        doc.setFont('Hind Siliguri', 'normal');
      }
      
      // Split text to handle long paragraphs and wrapping
      const textLines = doc.splitTextToSize(content, 170);
      
      // Check if we need a new page for the content
      if (yPosition + (textLines.length * 7) > 270) {
        doc.addPage();
        yPosition = 40;
      }
      
      doc.text(textLines, 20, yPosition);
      yPosition += 7 * textLines.length + 20; // Add more space between sections
      
      // Reset right-to-left setting if it was enabled
      if (currentLanguage === 'ar') {
        doc.setR2L(false);
      }
    });
    
    // Add footer to every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Skip footer on first page (dark cover page)
      if (i > 1) {
        doc.setFontSize(10);
        doc.setTextColor(105, 102, 96); // Border gray color
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('© Ramadan Planner', 20, 285);
      }
    }
    
    // Filename based on article title - handle different languages
    let filename = article.title;
    if (currentLanguage === 'ar' || currentLanguage === 'bn') {
      // For non-Latin scripts, use a simpler filename
      filename = `article_${currentArticleId}_${currentLanguage}`;
    } else {
      // Replace spaces and special characters for Latin scripts
      filename = filename.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    }
    
    doc.save(`${filename}.pdf`);
    showToast('PDF downloaded successfully', 'success');
  } catch (error) {
    console.error('PDF generation error:', error);
    showToast('PDF generation failed: ' + error.message, 'error');
  }
}

// Create CSS for fixed UI elements
function createGlobalCSS() {
  const style = document.createElement('style');
  style.textContent = `
    /* Dropdown styles */
    .dropdown-content {
      display: none;
    }
    .dropdown-content.show {
      display: block;
    }
    
    /* Mobile sidebar styles */
    #mobile-sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(43, 42, 40, 0.7);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    #mobile-sidebar-container.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    #mobile-sidebar {
      position: fixed;
      top: 0;
      left: -80%;
      width: 80%;
      max-width: 300px;
      height: 100%;
      background-color: #2B2A28;
      border-right: 1px solid #696660;
      padding: 1rem;
      overflow-y: auto;
      z-index: 1001;
      transition: left 0.3s ease;
    }
    
    #mobile-sidebar-container.active #mobile-sidebar {
      left: 0;
    }
    

    /* Floating sidebar toggle */
    #floating-sidebar-toggle {
      position: fixed;
      left: 20px;
      bottom: 80px;
      width: 50px;
      height: 50px;
      background-color: #CA9C77;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FDEDDC;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 999;
      transition: transform 0.2s ease;
    }
    
    #floating-sidebar-toggle:active {
      transform: scale(0.95);
    }
    
    /* Format card mobile styles */
    @media (max-width: 768px) {
      #format-card.show {
        max-width: 90%;
        margin-left: auto;
        margin-right: auto;
      }
    }
    
    /* Hide floating buttons on desktop */
    @media (min-width: 768px) {
      #floating-sidebar-toggle {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// Create the mobile sidebar
function createMobileSidebar() {
  // Check if mobile sidebar already exists
  if (document.getElementById('mobile-sidebar-container')) {
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'mobile-sidebar-container';
  
  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'mobile-sidebar';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center mb-4';
  
  const title = document.createElement('h2');
  title.className = 'text-xl font-bold text-light';
  title.textContent = 'Articles';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'text-light hover:text-primary';
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  closeButton.addEventListener('click', toggleMobileSidebar);
  
  header.appendChild(title);
  header.appendChild(closeButton);
  sidebar.appendChild(header);
  
  // Create article list
  const articleList = document.createElement('ul');
  articleList.id = 'mobile-article-list';
  articleList.className = 'space-y-2';
  sidebar.appendChild(articleList);
  
  // Add to container
  container.appendChild(sidebar);
  
  // Add click handler to close when clicking outside
  container.addEventListener('click', event => {
    if (event.target === container) {
      toggleMobileSidebar();
    }
  });
  
  // Add to document
  document.body.appendChild(container);
}



// Create floating sidebar toggle
function createFloatingSidebarToggle() {
  // Check if button already exists
  if (document.getElementById('floating-sidebar-toggle')) {
    return;
  }
  
  // Create button
  const button = document.createElement('div');
  button.id = 'floating-sidebar-toggle';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  `;
  
  // Add click handler
  button.addEventListener('click', toggleMobileSidebar);
  
  // Add to document
  document.body.appendChild(button);
}

// Document ready event handler
document.addEventListener('DOMContentLoaded', function() {
  // Create global CSS
  createGlobalCSS();
  
  // Create UI elements
  createMobileSidebar();
  createFloatingSidebarToggle();
  
  // Initialize
  fetchArticles(currentLanguage);
  
  // Set up mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  

  
  // Share article link
  document.getElementById('share-button').addEventListener('click', () => {
    const articleLink = window.location.href.split('?')[0] + `?id=${currentArticleId}&lang=${currentLanguage}`;
    navigator.clipboard.writeText(articleLink).then(() => {
      showToast('Link copied to clipboard!', 'success');
    });
  });

  // Format button dropdown
  const formatButton = document.getElementById('format-button');
  const formatCard = document.getElementById('format-card');
  const closeFormatCard = document.getElementById('close-format-card');

  formatButton.addEventListener('click', (e) => {
    e.stopPropagation();
    formatCard.classList.toggle('show');
    
    // Close other dropdowns
    document.getElementById('language-dropdown').classList.remove('show');
  });

  closeFormatCard.addEventListener('click', () => {
    formatCard.classList.remove('show');
  });

  // Language button dropdown
  const languageButton = document.getElementById('language-button');
  const languageDropdown = document.getElementById('language-dropdown');

  languageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('show');
    
    // Close other dropdowns
    formatCard.classList.remove('show', 'floating');
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!formatButton.contains(e.target) && !formatCard.contains(e.target)) {
      formatCard.classList.remove('show');
    }
    
    if (!languageButton.contains(e.target) && !languageDropdown.contains(e.target)) {
      languageDropdown.classList.remove('show');
    }
  });

  // Apply Formatting
  const applyFormatButton = document.getElementById('apply-format');
  const resetFormatButton = document.getElementById('reset-format');
  const fontFamilySelector = document.getElementById('font-family');
  const articleBody = document.getElementById('article-body');

  applyFormatButton.addEventListener('click', () => {
    // Apply the selected font family
    const selectedFont = fontFamilySelector.value;
    if (selectedFont !== 'default') {
      articleBody.style.fontFamily = selectedFont;
    }
    
    formatCard.classList.remove('show');
    showToast('Formatting applied successfully!', 'success');
  });

  resetFormatButton.addEventListener('click', () => {
    // Reset to default formatting
    articleBody.style.fontSize = '';
    articleBody.style.textAlign = '';
    articleBody.style.fontFamily = '';
    fontFamilySelector.value = 'default';
    formatCard.classList.remove('show');
    showToast('Formatting reset to default', 'info');
  });

  // Font Size Controls
  document.getElementById('font-increase').addEventListener('click', (e) => {
    e.stopPropagation();
    const currentSize = parseFloat(window.getComputedStyle(articleBody).fontSize);
    articleBody.style.fontSize = `${currentSize + 2}px`;
  });

  document.getElementById('font-decrease').addEventListener('click', (e) => {
    e.stopPropagation();
    const currentSize = parseFloat(window.getComputedStyle(articleBody).fontSize);
    if (currentSize > 10) {
      articleBody.style.fontSize = `${currentSize - 2}px`;
    }
  });

  // Text Alignment Controls
  document.getElementById('text-left').addEventListener('click', (e) => {
    e.stopPropagation();
    articleBody.style.textAlign = 'left';
  });

  document.getElementById('text-justify').addEventListener('click', (e) => {
    e.stopPropagation();
    articleBody.style.textAlign = 'justify';
  });

  // Improve button labels for clarity
  const textJustifyButton = document.getElementById('text-justify');
  if (textJustifyButton) {
    textJustifyButton.setAttribute('title', 'Justify Text');
  }

  // Download PDF - use the enhanced PDF generation function
  document.getElementById('download-pdf').addEventListener('click', generatePDF);

  // Show more button - simplified for demo
  document.getElementById('show-more').addEventListener('click', function() {
    this.textContent = this.textContent === 'Show More' ? 'Show Less' : 'Show More';
    // Toggle additional content visibility would go here
  });
});