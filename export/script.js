// ===== Global Variables =====
let currentView = 'dashboard';
let sidebarCollapsed = false;
let isDarkMode = false;

// ===== DOM Elements =====
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    collapseBtn: document.getElementById('collapseBtn'),
    sidebarItems: document.querySelectorAll('.sidebar-item'),
    
    // Mobile
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    drawerClose: document.getElementById('drawerClose'),
    drawerItems: document.querySelectorAll('.drawer-item'),
    
    // Content
    dashboardContent: document.getElementById('dashboardContent'),
    addTransactionContent: document.getElementById('addTransactionContent'),
    attendanceContent: document.getElementById('attendanceContent'),
    
    // Cards
    serviceCards: document.querySelectorAll('.service-card'),
    
    // Form
    backToDashboard: document.getElementById('backToDashboard'),
    cancelForm: document.getElementById('cancelForm'),
    saveForm: document.getElementById('saveForm'),
    
    // Dark mode
    darkModeToggle: document.getElementById('darkModeToggle'),
    sunIcon: document.querySelector('.sun-icon'),
    moonIcon: document.querySelector('.moon-icon'),
    
    // Collapse icons
    expandIcon: document.querySelector('.expand-icon'),
    collapseIcon: document.querySelector('.collapse-icon'),
    collapseText: document.querySelector('.collapse-text')
};

// ===== Utility Functions =====
function showContent(contentId) {
    // Hide all content
    document.querySelectorAll('.page-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected content
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
}

function setActiveMenuItem(key) {
    // Remove active class from all items
    elements.sidebarItems.forEach(item => {
        item.classList.remove('active');
    });
    elements.drawerItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected items
    const sidebarItem = document.querySelector(`.sidebar-item[data-key="${key}"]`);
    const drawerItem = document.querySelector(`.drawer-item[data-key="${key}"]`);
    
    if (sidebarItem) sidebarItem.classList.add('active');
    if (drawerItem) drawerItem.classList.add('active');
}

function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    elements.sidebar.classList.toggle('collapsed', sidebarCollapsed);
    
    // Toggle collapse button icons and text
    if (sidebarCollapsed) {
        elements.expandIcon.style.display = 'none';
        elements.collapseIcon.style.display = 'block';
        elements.collapseText.textContent = 'توسيع';
    } else {
        elements.expandIcon.style.display = 'block';
        elements.collapseIcon.style.display = 'none';
        elements.collapseText.textContent = 'طيّ';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    
    // Toggle dark mode icons
    if (isDarkMode) {
        elements.sunIcon.style.display = 'block';
        elements.moonIcon.style.display = 'none';
    } else {
        elements.sunIcon.style.display = 'none';
        elements.moonIcon.style.display = 'block';
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

function openMobileDrawer() {
    elements.mobileDrawer.classList.add('open');
}

function closeMobileDrawer() {
    elements.mobileDrawer.classList.remove('open');
}

function navigateToView(view) {
    currentView = view;
    
    switch (view) {
        case 'dashboard':
            showContent('dashboardContent');
            setActiveMenuItem('dashboard');
            break;
        case 'add':
            showContent('addTransactionContent');
            setActiveMenuItem('request_new');
            break;
        case 'attendance_report':
            showContent('attendanceContent');
            setActiveMenuItem('attendance_report');
            break;
        case 'inbox':
            showContent('dashboardContent'); // For now, show dashboard
            setActiveMenuItem('inbox');
            break;
        case 'outbox':
            showContent('dashboardContent'); // For now, show dashboard
            setActiveMenuItem('outbox');
            break;
        default:
            showContent('dashboardContent');
            setActiveMenuItem('dashboard');
    }
}

function handleCardClick(card) {
    const action = card.dataset.action;
    
    switch (action) {
        case 'add':
            navigateToView('add');
            break;
        case 'inbox':
            navigateToView('inbox');
            break;
        case 'outbox':
            navigateToView('outbox');
            break;
        case 'attendance_report':
            navigateToView('attendance_report');
            break;
        default:
            console.log(`Card clicked: ${action || 'unknown'}`);
    }
}

function handleSidebarItemClick(item) {
    const key = item.dataset.key;
    
    switch (key) {
        case 'dashboard':
            navigateToView('dashboard');
            break;
        case 'request_new':
            navigateToView('add');
            break;
        case 'attendance_report':
            navigateToView('attendance_report');
            break;
        case 'inbox':
            navigateToView('inbox');
            break;
        case 'outbox':
            navigateToView('outbox');
            break;
        default:
            navigateToView('dashboard');
    }
}

function handleGroupHeaderClick(header) {
    const groupItems = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    
    if (groupItems) {
        const isHidden = groupItems.classList.contains('hidden');
        groupItems.classList.toggle('hidden', !isHidden);
        header.classList.toggle('collapsed', !isHidden);
    }
}

function saveTransaction() {
    // Simulate saving
    const saveBtn = elements.saveForm;
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `
        <svg class="icon animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
        </svg>
        جاري الحفظ...
    `;
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Show success message (you can customize this)
        alert('تم حفظ المعاملة بنجاح!');
        
        // Navigate back to dashboard
        navigateToView('dashboard');
    }, 1500);
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Sidebar toggle
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (elements.collapseBtn) {
        elements.collapseBtn.addEventListener('click', toggleSidebar);
    }
    
    // Dark mode toggle
    if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Mobile drawer
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', openMobileDrawer);
    }
    
    if (elements.drawerClose) {
        elements.drawerClose.addEventListener('click', closeMobileDrawer);
    }
    
    // Close drawer when clicking overlay
    if (elements.mobileDrawer) {
        elements.mobileDrawer.addEventListener('click', (e) => {
            if (e.target.classList.contains('drawer-overlay')) {
                closeMobileDrawer();
            }
        });
    }
    
    // Service cards
    elements.serviceCards.forEach(card => {
        card.addEventListener('click', () => handleCardClick(card));
    });
    
    // Sidebar items
    elements.sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            handleSidebarItemClick(item);
            closeMobileDrawer(); // Close mobile drawer if open
        });
    });
    
    // Drawer items
    elements.drawerItems.forEach(item => {
        item.addEventListener('click', () => {
            handleSidebarItemClick(item);
            closeMobileDrawer();
        });
    });
    
    // Group headers (for collapsing/expanding)
    document.querySelectorAll('.group-header').forEach(header => {
        header.addEventListener('click', () => handleGroupHeaderClick(header));
    });
    
    // Form navigation
    if (elements.backToDashboard) {
        elements.backToDashboard.addEventListener('click', () => navigateToView('dashboard'));
    }
    
    if (elements.cancelForm) {
        elements.cancelForm.addEventListener('click', () => navigateToView('dashboard'));
    }
    
    if (elements.saveForm) {
        elements.saveForm.addEventListener('click', saveTransaction);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC key to go back to dashboard
        if (e.key === 'Escape' && currentView !== 'dashboard') {
            navigateToView('dashboard');
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// ===== Animation Functions =====
function animateCards() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(0.5rem)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// ===== Initialization =====
function initializeApp() {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        toggleDarkMode();
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Set initial view
    navigateToView('dashboard');
    
    // Animate cards on load
    setTimeout(animateCards, 100);
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 50);
}

// ===== Search Functionality =====
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query === '') {
                // Show all cards
                elements.serviceCards.forEach(card => {
                    card.style.display = 'block';
                });
                return;
            }
            
            // Filter cards based on search query
            elements.serviceCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const subtitle = card.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (title.includes(query) || subtitle.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== Responsive Handling =====
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && elements.mobileDrawer.classList.contains('open')) {
        // Close mobile drawer on resize to desktop
        if (window.innerWidth > 768) {
            closeMobileDrawer();
        }
    }
}

// ===== Start Application =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeSearch();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    console.log('🚀 البوابة الإلكترونية - تم تحميل التطبيق بنجاح');
});

// ===== Export for potential external use =====
window.DashboardApp = {
    navigateToView,
    toggleSidebar,
    toggleDarkMode,
    currentView: () => currentView
};