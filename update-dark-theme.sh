#!/bin/bash

# Script to update all HTML files with dark theme support
# This script adds the dark-theme.css link and theme initialization script to all HTML files

# Function to update HTML files in the root directory
update_root_html() {
    echo "Updating HTML files in root directory..."
    
    # Find all HTML files in the root directory
    for file in *.html; do
        if [ -f "$file" ]; then
            echo "Processing $file..."
            
            # Add dark-theme.css link if not already present
            if ! grep -q "dark-theme.css" "$file"; then
                sed -i 's|<link rel="stylesheet" href="css/mobile.css">|<link rel="stylesheet" href="css/mobile.css">\n    <link rel="stylesheet" href="css/dark-theme.css">|' "$file"
            fi
            
            # Add theme initialization script if not already present
            if ! grep -q "theme initialization script" "$file"; then
                sed -i 's|<link rel="apple-touch-icon" href="images/icons/icon-192x192.png">|<link rel="apple-touch-icon" href="images/icons/icon-192x192.png">\n\n    <!-- Theme initialization script -->\n    <script>\n        // Check for saved theme preference and apply it immediately\n        (function() {\n            const savedTheme = localStorage.getItem("theme");\n            if (savedTheme === "dark") {\n                document.documentElement.classList.add("dark-theme");\n            }\n        })();\n    </script>|' "$file"
            fi
            
            # Add theme-manager.js script if not already present
            if ! grep -q "theme-manager.js" "$file"; then
                sed -i 's|<script src="js/auth-store.js"></script>|<script src="js/auth-store.js"></script>\n    <script src="js/theme-manager.js"></script>|' "$file"
            fi
        fi
    done
}

# Function to update HTML files in the html directory
update_html_directory() {
    echo "Updating HTML files in html directory..."
    
    # Find all HTML files in the html directory
    for file in html/*.html; do
        if [ -f "$file" ]; then
            echo "Processing $file..."
            
            # Add dark-theme.css link if not already present
            if ! grep -q "dark-theme.css" "$file"; then
                sed -i 's|<link rel="stylesheet" href="../css/mobile.css">|<link rel="stylesheet" href="../css/mobile.css">\n    <link rel="stylesheet" href="../css/dark-theme.css">|' "$file"
            fi
            
            # Add theme initialization script if not already present
            if ! grep -q "theme initialization script" "$file"; then
                sed -i 's|<link rel="apple-touch-icon" href="../images/icons/icon-192x192.png">|<link rel="apple-touch-icon" href="../images/icons/icon-192x192.png">\n\n    <!-- Theme initialization script -->\n    <script>\n        // Check for saved theme preference and apply it immediately\n        (function() {\n            const savedTheme = localStorage.getItem("theme");\n            if (savedTheme === "dark") {\n                document.documentElement.classList.add("dark-theme");\n            }\n        })();\n    </script>|' "$file"
            fi
            
            # Add theme-manager.js script if not already present
            if ! grep -q "theme-manager.js" "$file"; then
                sed -i 's|<script src="../js/auth-store.js"></script>|<script src="../js/auth-store.js"></script>\n    <script src="../js/theme-manager.js"></script>|' "$file"
            fi
        fi
    done
}

# Function to update HTML files in the admin directory
update_admin_directory() {
    echo "Updating HTML files in admin directory..."
    
    # Find all HTML files in the admin directory
    for file in html/admin/*.html; do
        if [ -f "$file" ]; then
            echo "Processing $file..."
            
            # Add dark-theme.css link if not already present
            if ! grep -q "dark-theme.css" "$file"; then
                sed -i 's|<link rel="stylesheet" href="../../css/mobile.css">|<link rel="stylesheet" href="../../css/mobile.css">\n    <link rel="stylesheet" href="../../css/dark-theme.css">|' "$file"
            fi
            
            # Add theme initialization script if not already present
            if ! grep -q "theme initialization script" "$file"; then
                sed -i 's|<link rel="apple-touch-icon" href="../../images/icons/icon-192x192.png">|<link rel="apple-touch-icon" href="../../images/icons/icon-192x192.png">\n\n    <!-- Theme initialization script -->\n    <script>\n        // Check for saved theme preference and apply it immediately\n        (function() {\n            const savedTheme = localStorage.getItem("theme");\n            if (savedTheme === "dark") {\n                document.documentElement.classList.add("dark-theme");\n            }\n        })();\n    </script>|' "$file"
            fi
            
            # Add theme-manager.js script if not already present
            if ! grep -q "theme-manager.js" "$file"; then
                sed -i 's|<script src="../../js/auth-store.js"></script>|<script src="../../js/auth-store.js"></script>\n    <script src="../../js/theme-manager.js"></script>|' "$file"
            fi
        fi
    done
}

# Main execution
echo "Starting dark theme update for all HTML files..."

# Update HTML files in different directories
update_root_html
update_html_directory
update_admin_directory

echo "Dark theme update completed!"
