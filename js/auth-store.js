/**
 * Authentication module for Rregullo Tiranen
 * Handles user registration, login, and profile management
 */

const AuthStore = (function() {
    // Storage keys
    const USERS_KEY = 'rregullo_tiranen_users';
    const CURRENT_USER_KEY = 'rregullo_tiranen_current_user';
    const USER_REPORTS_KEY = 'rregullo_tiranen_user_reports';
    const NOTIFICATIONS_KEY = 'rregullo_tiranen_notifications';
    
    // Get all users from localStorage
    function getAllUsers() {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    }
    
    // Get current user from localStorage
    function getCurrentUser() {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
    
    // Check if user is logged in
    function isLoggedIn() {
        return getCurrentUser() !== null;
    }
    
    // Register a new user
    function registerUser(userData) {
        const users = getAllUsers();
        
        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
            return {
                success: false,
                message: 'Ky email është tashmë i regjistruar. Ju lutemi përdorni një email tjetër.'
            };
        }
        
        // Create user object
        const newUser = {
            id: Date.now().toString(),
            fullname: userData.fullname,
            email: userData.email,
            phone: userData.phone || '',
            password: hashPassword(userData.password), // In a real app, use proper hashing
            neighborhood: userData.neighborhood || '',
            created: new Date().toISOString(),
            notifications: {
                status: true,
                comments: true,
                nearby: true,
                email: true,
                push: true
            }
        };
        
        // Add to users array and save back to localStorage
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Create a copy without the password for the return value
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        
        return {
            success: true,
            message: 'Regjistrimi u krye me sukses!',
            user: userWithoutPassword
        };
    }
    
    // Login user
    function loginUser(email, password, remember = false) {
        const users = getAllUsers();
        const user = users.find(user => user.email === email);
        
        if (!user) {
            return {
                success: false,
                message: 'Email-i ose fjalëkalimi është i pasaktë.'
            };
        }
        
        if (user.password !== hashPassword(password)) {
            return {
                success: false,
                message: 'Email-i ose fjalëkalimi është i pasaktë.'
            };
        }
        
        // Create a copy without the password for the current user
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        // Save current user to localStorage
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        
        return {
            success: true,
            message: 'Hyrja u krye me sukses!',
            user: userWithoutPassword
        };
    }
    
    // Logout user
    function logoutUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
        return {
            success: true,
            message: 'Dalja u krye me sukses!'
        };
    }
    
    // Update user profile
    function updateUserProfile(userData) {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'Ju nuk jeni të identifikuar.'
            };
        }
        
        const users = getAllUsers();
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Përdoruesi nuk u gjet.'
            };
        }
        
        // Update user data
        users[userIndex].fullname = userData.fullname || users[userIndex].fullname;
        users[userIndex].phone = userData.phone || users[userIndex].phone;
        users[userIndex].neighborhood = userData.neighborhood || users[userIndex].neighborhood;
        
        // Save updated users array
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Update current user
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        
        return {
            success: true,
            message: 'Profili u përditësua me sukses!',
            user: updatedUser
        };
    }
    
    // Change user password
    function changePassword(currentPassword, newPassword) {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'Ju nuk jeni të identifikuar.'
            };
        }
        
        const users = getAllUsers();
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Përdoruesi nuk u gjet.'
            };
        }
        
        // Verify current password
        if (users[userIndex].password !== hashPassword(currentPassword)) {
            return {
                success: false,
                message: 'Fjalëkalimi aktual është i pasaktë.'
            };
        }
        
        // Update password
        users[userIndex].password = hashPassword(newPassword);
        
        // Save updated users array
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        return {
            success: true,
            message: 'Fjalëkalimi u ndryshua me sukses!'
        };
    }
    
    // Delete user account
    function deleteAccount(password) {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'Ju nuk jeni të identifikuar.'
            };
        }
        
        const users = getAllUsers();
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Përdoruesi nuk u gjet.'
            };
        }
        
        // Verify password
        if (users[userIndex].password !== hashPassword(password)) {
            return {
                success: false,
                message: 'Fjalëkalimi është i pasaktë.'
            };
        }
        
        // Remove user from array
        users.splice(userIndex, 1);
        
        // Save updated users array
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Remove current user
        localStorage.removeItem(CURRENT_USER_KEY);
        
        return {
            success: true,
            message: 'Llogaria juaj u fshi me sukses!'
        };
    }
    
    // Update notification settings
    function updateNotificationSettings(settings) {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return {
                success: false,
                message: 'Ju nuk jeni të identifikuar.'
            };
        }
        
        const users = getAllUsers();
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Përdoruesi nuk u gjet.'
            };
        }
        
        // Update notification settings
        users[userIndex].notifications = {
            ...users[userIndex].notifications,
            ...settings
        };
        
        // Save updated users array
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Update current user
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        
        return {
            success: true,
            message: 'Cilësimet e njoftimeve u përditësuan me sukses!',
            user: updatedUser
        };
    }
    
    // Get user reports
    function getUserReports(userId) {
        const reports = DataStore.getAllReports();
        return reports.filter(report => report.userId === userId);
    }
    
    // Get user notifications
    function getUserNotifications(userId) {
        const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
        const allNotifications = notificationsJson ? JSON.parse(notificationsJson) : [];
        return allNotifications.filter(notification => notification.userId === userId);
    }
    
    // Add a notification
    function addNotification(userId, notification) {
        const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
        const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
        
        const newNotification = {
            id: Date.now().toString(),
            userId,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        
        notifications.push(newNotification);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        
        return newNotification;
    }
    
    // Mark notification as read
    function markNotificationAsRead(notificationId) {
        const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
        const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
        
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
            notifications[notificationIndex].read = true;
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
            return true;
        }
        
        return false;
    }
    
    // Delete notification
    function deleteNotification(notificationId) {
        const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
        const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
        
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        
        if (updatedNotifications.length !== notifications.length) {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
            return true;
        }
        
        return false;
    }
    
    // Simple password hashing (for demo purposes only)
    // In a real app, use a proper hashing library like bcrypt
    function hashPassword(password) {
        // This is NOT secure, just for demonstration
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    
    // Initialize with sample user if none exist
    function initializeSampleUser() {
        const users = getAllUsers();
        
        if (users.length === 0) {
            const sampleUser = {
                id: '1234567890',
                fullname: 'Përdorues Demo',
                email: 'demo@example.com',
                phone: '355691234567',
                password: hashPassword('password123'), // In a real app, use proper hashing
                neighborhood: 'njesia5',
                created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                notifications: {
                    status: true,
                    comments: true,
                    nearby: true,
                    email: true,
                    push: true
                }
            };
            
            users.push(sampleUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            
            // Add sample notifications
            const sampleNotifications = [
                {
                    id: '1',
                    userId: '1234567890',
                    type: 'status',
                    title: 'Statusi i raportimit u përditësua',
                    message: 'Raportimi juaj "Gropë e madhe në rrugën Myslym Shyri" ka ndryshuar statusin në "Në proces".',
                    reportId: '1',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    read: false
                },
                {
                    id: '2',
                    userId: '1234567890',
                    type: 'comment',
                    title: 'Koment i ri në raportin tuaj',
                    message: 'Bashkia e Tiranës: "Faleminderit për raportimin. Ekipi ynë do të jetë në vendngjarje brenda 48 orëve."',
                    reportId: '1',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    read: true
                },
                {
                    id: '3',
                    userId: '1234567890',
                    type: 'nearby',
                    title: 'Problem i ri në zonën tuaj',
                    message: 'Një problem i ri "Ndriçim i dëmtuar në Bulevardin Zhan D\'Ark" u raportua pranë zonës suaj.',
                    reportId: '2',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
                    read: false
                }
            ];
            
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sampleNotifications));
            
            console.log('Sample user initialized');
        }
        
        // Update existing reports with user IDs
        const reports = DataStore.getAllReports();
        let updated = false;
        
        reports.forEach(report => {
            if (!report.userId) {
                report.userId = '1234567890';
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem('rregullo_tiranen_reports', JSON.stringify(reports));
            console.log('Updated reports with user IDs');
        }
    }
    
    // Public API
    return {
        getAllUsers,
        getCurrentUser,
        isLoggedIn,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        changePassword,
        deleteAccount,
        updateNotificationSettings,
        getUserReports,
        getUserNotifications,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        initializeSampleUser
    };
})();

// Initialize sample user when the script loads
document.addEventListener('DOMContentLoaded', function() {
    AuthStore.initializeSampleUser();
});
