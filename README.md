# Formalsurf web browser

![screenshot](https://github.com/FormalSnake/Formalsurf/blob/main/assets/screenshot.png)

A simple web browser built with Electron and React, it is not the most efficient but it works pretty well and is mostly just an experiment.

The intention of this browser is to only implement basic browser features that I truly need, which means I do not want this to become a configuration hell.

## Roadmap
- [x] Tabs with proper management (drag and drop is not implemented yet)
- [x] Bookmarks (pinning tabs)
- [ ] Downloads
- [ ] History
- [x] Find in page
- [x] Functional navigation
- [x] Keyboard shortcuts
- [x] Persistence
- [x] Context menu (Downloading is currently broken)
- [ ] Settings
- [ ] Extensions
- [ ] Profiles
- [ ] Spaces
- [ ] Tab folders and trails

## Project Setup

### Install
_You can also use Bun instead of npm, doesn't matter that much tho_
```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
# For windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```
