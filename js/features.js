// Navigation functions
function navigateTo(page) {
    switch(page) {
      case 'home':
        window.open('../index.html', '_self');
        break;
      case 'blog':
        window.open('my-blog/index.html', '_self');
        break;
      case 'fiqh':
        window.open('my-blog/index.html', '_self');
        break;
      // Add more pages as needed
    }
  }
  
  // Initialize page navigation
  document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation links
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', function() {
        navigateTo(this.getAttribute('data-navigate'));
      });
    });
  });