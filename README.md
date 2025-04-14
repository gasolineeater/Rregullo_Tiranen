# Rregullo Tiranen

A web application for reporting city problems in Tirana, Albania, with advanced mobile features and Progressive Web App (PWA) capabilities.

## Features

- Report urban issues in four main categories:
  - Infrastructure problems
  - Environmental concerns
  - Public services issues
  - Community improvements
- Interactive map to pinpoint issue locations
- Form for detailed problem reporting
- View all reported issues on a map
- Filter issues by category, status, and date
- Progressive Web App (PWA) with offline capabilities
- Advanced mobile features and touch gestures
- Accessibility enhancements for all users
- Analytics integration for usage tracking
- User feedback collection system

## Technologies

- HTML5, CSS3, JavaScript
- Leaflet.js for interactive maps
- Local storage for data persistence
- Service Workers for offline functionality
- Web Vitals for performance monitoring
- Intersection Observer API for lazy loading

## Mobile Enhancements

We've implemented a comprehensive set of mobile enhancements to improve the user experience on mobile devices:

### Progressive Web App (PWA) Features

- **Enhanced Service Worker**: Improved caching strategy for offline access to critical resources
- **Offline Mode**: Comprehensive offline page showing available cached content
- **App Installation**: Improved install prompt and "Add to Home Screen" experience
- **Network Status Indicator**: Visual feedback when the user goes offline or comes back online
- **App Updates**: Notification system for when a new version is available

### Performance Optimization

- **Code Splitting**: Dynamic loading of JavaScript files based on current page needs
- **Script Loader**: Prioritized loading of critical scripts before non-essential ones
- **Responsive Images**: Optimized image loading with proper sizing and lazy loading
- **Resource Prioritization**: Critical CSS and above-the-fold content loading optimization
- **Performance Monitoring**: Integration with Web Vitals for real-time performance tracking

### Mobile-Specific Features

- **Swipe Gestures**: Navigation through swipe gestures (left/right for navigation, up/down for scrolling)
- **Pinch-to-Zoom**: Enhanced zoom functionality for maps with multi-touch gestures
- **Haptic Feedback**: Vibration feedback for touch interactions on supported devices
- **Mobile Animations**: Optimized animations and transitions for touch interfaces
- **Touch-Friendly UI**: Larger touch targets and mobile-optimized forms

### Accessibility Improvements

- **ARIA Attributes**: Enhanced screen reader support with proper ARIA roles and labels
- **Keyboard Navigation**: Improved keyboard navigation for all interactive elements
- **Skip to Content**: Skip links for keyboard users to bypass navigation
- **High Contrast Mode**: Optional high contrast mode for users with visual impairments
- **Focus Styles**: Enhanced focus indicators for keyboard navigation
- **Reduced Motion**: Support for users who prefer reduced motion

### Analytics Integration

- **Mobile-Specific Analytics**: Tracking of mobile-specific interactions and behaviors
- **Performance Metrics**: Collection of Web Vitals and other performance metrics
- **User Journey Tracking**: Analysis of user flows and navigation patterns
- **Error Tracking**: Monitoring of JavaScript errors and network issues
- **Device Information**: Collection of device and browser information for debugging

### User Testing Framework

- **Feedback Collection**: In-app mechanism for users to provide feedback on mobile features
- **Admin Dashboard**: Administrative interface for viewing and managing feedback
- **Device Information**: Automatic collection of device data with feedback submissions
- **Export Functionality**: CSV export of feedback data for further analysis
- **Filtering and Searching**: Tools for filtering and searching through feedback

## How to Use

### For Users

1. **Visit the Application**: Open the application in a mobile browser
2. **Install as PWA** (optional): Use the "Add to Home Screen" option or the install prompt
3. **Report Issues**: Use the report form to submit urban issues
4. **View Issues**: Explore the map to see reported issues
5. **Provide Feedback**: Use the feedback button to share your experience

### For Administrators

1. **Access Admin Dashboard**: Navigate to `/admin/index.html`
2. **View Feedback**: Check the feedback dashboard at `/admin/feedback-dashboard.html`
3. **Analyze Data**: Use the filtering and export tools to analyze feedback
4. **Manage Content**: Review and manage reported issues

## Offline Capabilities

The application works offline with the following features:

- **Cached Pages**: Core pages are available offline
- **Offline Indicator**: Visual indication when working offline
- **Cached Data**: Previously loaded reports are available offline
- **Offline Submission**: Forms can be filled offline and submitted when online

## Browser Compatibility

- **Modern Browsers**: Full support in Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: Optimized for Chrome and Safari on Android and iOS
- **Older Browsers**: Graceful degradation with core functionality

## Future Plans

- Backend integration for permanent data storage
- User authentication and issue tracking
- Real-time notifications for issue updates
- Advanced analytics and reporting features
- Community engagement tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
