/**
 * NAVBAR INTERACTION FIX
 * Handles dropdown menus, active states, and keyboard navigation
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }

    function initNavbar() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navTabs = document.getElementById('navTabs');
        
        if (navToggle && navTabs) {
            navToggle.addEventListener('click', () => {
                navTabs.classList.toggle('active');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navTabs.contains(e.target)) {
                    navTabs.classList.remove('active');
                }
            });
        }

        // Handle all dropdowns
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.nav-dropdown-toggle');
            const menu = dropdown.querySelector('.nav-dropdown-menu');
            
            if (!toggle || !menu) return;

            // Click to toggle dropdown
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.nav-dropdown-menu');
                        const otherToggle = otherDropdown.querySelector('.nav-dropdown-toggle');
                        if (otherMenu) otherMenu.classList.remove('show');
                        if (otherToggle) otherToggle.classList.remove('menu-open');
                        otherDropdown.classList.remove('menu-active');
                    }
                });
                
                // Toggle current dropdown
                const isOpen = menu.classList.toggle('show');
                toggle.classList.toggle('menu-open', isOpen);
                dropdown.classList.toggle('menu-active', isOpen);
            });

            // Track when hovering inside dropdown menu
            menu.addEventListener('mouseenter', () => {
                dropdown.classList.add('menu-active');
            });

            menu.addEventListener('mouseleave', () => {
                // Only remove if not clicked open
                if (!menu.classList.contains('show')) {
                    dropdown.classList.remove('menu-active');
                }
            });

            // Handle submenu toggles
            const submenuLabels = dropdown.querySelectorAll('.nav-dropdown-submenu-label');
            submenuLabels.forEach(label => {
                label.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const submenuItems = label.nextElementSibling;
                    if (submenuItems) {
                        submenuItems.classList.toggle('show');
                    }
                });
            });
        });

        // Close all dropdowns when clicking outside
        document.addEventListener('click', () => {
            dropdowns.forEach(dropdown => {
                const menu = dropdown.querySelector('.nav-dropdown-menu');
                const toggle = dropdown.querySelector('.nav-dropdown-toggle');
                if (menu) menu.classList.remove('show');
                if (toggle) toggle.classList.remove('menu-open');
                dropdown.classList.remove('menu-active');
            });
        });

        // Close dropdowns on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdowns.forEach(dropdown => {
                    const menu = dropdown.querySelector('.nav-dropdown-menu');
                    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
                    if (menu) menu.classList.remove('show');
                    if (toggle) toggle.classList.remove('menu-open');
                    dropdown.classList.remove('menu-active');
                });
            }
        });

        // Set active states based on current route
        setActiveNavStates();
    }

    function setActiveNavStates() {
        const currentPath = window.location.pathname;
        
        // Remove all active classes first
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            dropdown.classList.remove('current-section');
        });
        document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
            link.classList.remove('active');
        });

        // Route to dropdown mapping
        const routeMap = {
            '/solar-shades': 'interventionsDropdown',
            '/murals': 'interventionsDropdown',
            '/urban-farming': 'interventionsDropdown',
            '/unreal-viewer': 'exploreDropdown',
            '/digital-twin': 'exploreDropdown',
            '/puhc-puede': 'exploreDropdown',
            '/innovation-alleys-map': 'exploreDropdown',
            '/aura-report': 'exploreDropdown'
        };

        // Check if current path is in a dropdown
        const dropdownId = routeMap[currentPath];
        
        if (dropdownId) {
            // Mark the parent dropdown as current section
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                const parentDropdown = dropdown.closest('.nav-dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('current-section');
                }
            }

            // Mark the specific link as active
            document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath) {
                    link.classList.add('active');
                }
            });
        } else {
            // Check top-level nav tabs
            document.querySelectorAll('.nav-tab a').forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath || (currentPath === '/' && href === '/')) {
                    link.parentElement.classList.add('active');
                }
            });
        }
    }
})();
