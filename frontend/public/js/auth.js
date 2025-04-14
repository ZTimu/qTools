/**
 * Auth state management for client-side
 */

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Update navigation based on auth state
function updateNavigation() {
  const loggedIn = isLoggedIn();
  
  // Find navbar elements
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  
  // Get current path
  const currentPath = window.location.pathname;
  
  if (loggedIn) {
    // User is logged in
    navLinks.innerHTML = `
      <li><a href="/dashboard" class="${currentPath === '/dashboard' ? 'active' : ''}">Dashboard</a></li>
      <li><a href="javascript:void(0)" onclick="logout()">Logout</a></li>
    `;
    
    // Add username to navigation if available
    const user = getCurrentUser();
    if (user && user.name) {
      // Insert a welcome message before the nav links
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (!document.querySelector('.user-greeting')) {
          const greeting = document.createElement('div');
          greeting.className = 'user-greeting';
          greeting.textContent = `Welcome, ${user.name}`;
          navbar.insertBefore(greeting, navLinks);
        }
      }
    }
  } else {
    // User is not logged in
    navLinks.innerHTML = `
      <li><a href="/login" class="${currentPath === '/login' ? 'active' : ''}">Login</a></li>
      <li><a href="/register" class="${currentPath === '/register' ? 'active' : ''}">Register</a></li>
    `;
    
    // Remove any existing greeting
    const greeting = document.querySelector('.user-greeting');
    if (greeting) greeting.remove();
  }
}

// Initialize auth state
document.addEventListener('DOMContentLoaded', function() {
  updateNavigation();
  
  // Add logout handler for logout links
  document.body.addEventListener('click', function(e) {
    if (e.target.matches('a[href="/logout"]')) {
      e.preventDefault();
      logout();
    }
  });
});

// Add styles for user greeting
const style = document.createElement('style');
style.textContent = `
  .user-greeting {
    color: var(--text-color);
    font-size: 0.9rem;
    margin-right: 24px;
  }
  
  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .user-greeting {
      margin-right: 0;
    }
  }
`;
document.head.appendChild(style); 