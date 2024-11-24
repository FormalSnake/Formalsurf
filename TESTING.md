# Manual Testing Guide for Formalsurf

This document outlines the features that should be tested manually before building the application.

## Core Features

### 1. Tab Management

- [ ] Create a new tab using the "+" button
- [ ] Create a new tab using `Cmd + T` shortcut
- [ ] Close a tab using the close button
- [ ] Close a tab using `Cmd + W` shortcut
- [ ] Verify that closing the last tab shows the welcome screen
- [ ] Check if tab titles update correctly when loading pages
- [ ] Verify tab favicons update correctly
- [ ] Test switching between tabs

### 2. Navigation

- [ ] Test URL bar functionality:
  - Enter a direct URL (e.g., https://google.com)
  - Enter a domain without protocol (e.g., google.com)
  - Enter a search term
  - Test localhost URLs (e.g., localhost:3000)
  - Test IP addresses
- [ ] Test navigation controls:
  - Back button
  - Forward button
  - Refresh button
- [ ] Verify page loading indicators work correctly

### 3. Sidebar

- [ ] Test sidebar toggle:
  - Using the sidebar button
  - Using `Cmd + B` shortcut
- [ ] Verify sidebar state persists between app restarts
- [ ] Check if sidebar tabs list updates correctly
- [ ] Test sidebar responsiveness on window resize

### 4. Find in Page

- [ ] Open find in page using `Cmd + F`
- [ ] Test search functionality:
  - Basic text search
  - Case sensitivity
  - Navigation between results using up/down arrows
  - Close find in page using Escape key
- [ ] Verify search highlight visibility
- [ ] Check if result count updates correctly

### 5. URL Handling

- [ ] Test URL suggestions in the new tab dialog
- [ ] Verify URL validation:
  - Valid URLs load correctly
  - Invalid URLs redirect to search
  - Special characters are handled properly
- [ ] Check if external links open in new tabs
- [ ] Test drag and drop URL functionality

### 6. Performance

- [ ] Verify smooth tab switching
- [ ] Check memory usage with multiple tabs
- [ ] Test application responsiveness during heavy load
- [ ] Verify no memory leaks when opening/closing many tabs

### 7. UI/UX

- [ ] Verify all animations are smooth
- [ ] Check dark/light theme consistency
- [ ] Test keyboard shortcuts
- [ ] Verify tooltips and context menus
- [ ] Check accessibility features
- [ ] Test responsive design at different window sizes

## Error Handling

### 1. Network Errors

- [ ] Test offline behavior
- [ ] Verify error pages for:
  - 404 Not Found
  - 500 Server Error
  - SSL/TLS errors
  - Connection timeouts

### 2. Application Errors

- [ ] Verify error recovery when:
  - A tab crashes
  - The renderer process fails
  - Invalid URLs are entered
  - System resources are low

## Platform Integration

### 1. System Integration

- [ ] Verify app icon in dock/taskbar
- [ ] Test window controls (minimize, maximize, close)
- [ ] Check if app restores previous session state
- [ ] Verify system notifications work correctly

### 2. Security

- [ ] Test sandbox restrictions
- [ ] Verify webview security settings
- [ ] Check CORS handling
- [ ] Test file download behavior

## Before Release Checklist

1. [ ] All core features work as expected
2. [ ] No console errors during normal operation
3. [ ] Memory usage is within acceptable limits
4. [ ] All keyboard shortcuts work correctly
5. [ ] Application startup and shutdown are clean
6. [ ] Previous session restoration works properly
7. [ ] All animations are smooth and performant
8. [ ] Error handling is consistent and user-friendly
