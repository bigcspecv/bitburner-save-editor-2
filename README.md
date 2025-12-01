# Bitburner Save Editor V2

> 🖥️ **Terminal-styled save editor for [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/)**

A web-based save file editor with a retro terminal aesthetic that matches Bitburner's cyberpunk hacker theme. Upload your save, modify stats/factions/companies/servers, and download a fresh save ready to import back into the game.

![Version](https://img.shields.io/badge/bitburner-v2.8.1+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🎨 **Terminal UI** - Authentic 1980s hacker aesthetic with scanline effects
- 🎯 **Game-Centric Design** - Organized by gameplay concepts, not save file structure
- ✅ **Type-Safe** - Runtime validation with Zod + TypeScript compile-time safety
- 💾 **Format Support** - Handles gzipped, base64, and plain JSON saves
- 🔄 **Safe Editing** - Maintains original save, revert changes anytime
- ⚡ **Modern Stack** - Vite, React 18, Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Bitburner save file (Settings → Export Game)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bitburner-save-editor.git
cd bitburner-save-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📖 Usage

1. **Export your save** from Bitburner (Settings → Export Game)
2. **Upload the file** in the editor
3. **Navigate sections** to edit game data (Player, Servers, Factions, etc.)
4. **Download modified save** when finished
5. **Import back** into Bitburner (Settings → Import Game)

---

## 🗂️ Editor Sections

The editor is organized by **gameplay concepts**, not save file structure:

### Core Sections

- **Player** - Stats, skills, money, karma, entropy
- **Augmentations** - Installed/queued augmentations, NeuroFlux Governor levels
- **Factions** - Membership, invitations, reputation, favor
- **Companies & Careers** - Company reputation, jobs, employment status
- **Servers** - All servers, purchased servers, RAM, money, access, backdoors
- **Gangs** - Gang stats, members, territory, power
- **Hacknet** - Hacknet nodes, hash manager, upgrades

### Advanced Sections

- **Progression** - BitNode, source files, playtime, exploits
- **Business** - Corporation, Bladeburner, Sleeves (if unlocked)
- **Stock Market** - Orders, access flags, money tracking
- **Special** - Stanek's Gift, Go minigame, Infiltrations
- **Settings** - Game settings, UI preferences

---

## 🛠️ Tech Stack

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[React 18](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Zod](https://zod.dev/)** - Runtime type validation
- **[Pako](https://github.com/nodeca/pako)** - Gzip compression/decompression

---

## 📋 TODO

### High Priority

- [x] Project setup & scaffolding
- [x] Terminal theme & UI components
  - [x] Button component
  - [x] Input component
  - [x] Textarea component
  - [x] Checkbox component
  - [x] Select component
  - [x] Label component
  - [x] Card component
  - [x] Table component
  - [x] Modal component
  - [x] Tabs component
- [x] Component demo page
- [x] Save file loader (gzip/base64/JSON)
- [x] Save file exporter
- [x] State management (Zustand or Context)
- [x] Section navigation scaffold (tabs + stubs)
- [x] Player section
  - [x] Stats & skills editor
  - [x] Money, karma, entropy
  - [x] Multipliers (read-only)
  - [x] Health computation (current/max)
- [ ] Servers section
  - [ ] All servers view
  - [ ] Purchased servers manager
  - [ ] Server details (RAM, money, flags)
  - [ ] Current server selector
- [x] Augmentations section
  - [x] Installed augmentations
  - [x] Queued augmentations
  - [x] NeuroFlux Governor special handling
  - [x] Add/remove augmentations
  - [x] Search/filter functionality
  - [ ] Filter by effect type (future enhancement)
- [x] Factions section
  - [x] Membership editor
  - [x] Reputation & favor
  - [x] Invitation manager
- [x] Companies section
  - [x] Company reputation & favor
  - [x] Jobs manager
  - [x] Company-job validation

### Medium Priority

- [ ] Gangs section
  - [ ] Player gang stats
  - [ ] Gang members (add/edit/remove)
  - [ ] Territory & power
- [ ] Hacknet section
  - [x] Hacknet nodes (add/edit/remove)
  - [ ] Hash manager & upgrades
- [ ] Progression section
  - [ ] BitNode & source files
  - [ ] Playtime tracking
  - [ ] Exploits display
- [ ] Stock Market section
  - [ ] Orders viewer/editor
  - [ ] Access flags
- [ ] Business section
  - [ ] Corporation (TBD)
  - [ ] Bladeburner (TBD)
  - [ ] Sleeves (TBD)

### Low Priority

- [ ] Special systems
  - [ ] Stanek's Gift
  - [ ] Go minigame
  - [ ] Infiltrations
- [ ] Settings section
  - [ ] Game settings
  - [ ] Theme customization
- [ ] Utilities
  - [ ] Aliases
  - [ ] Global aliases

### Testing & Polish

- [ ] Unit tests for save loader
- [ ] Integration tests for cross-references
- [ ] Error handling & user feedback
- [ ] Loading states
- [ ] Keyboard shortcuts
- [ ] Mobile responsive design
- [ ] Documentation

---

## 🧪 Testing

Run tests with:

```bash
npm run test
```

**Testing Philosophy**: We focus on high-value tests for save file integrity, not UI testing.

Tests cover:
- ✅ Save file loading (all formats)
- ✅ Save file export (roundtrip integrity)
- ✅ Cross-reference synchronization
- ✅ Reset operations
- ✅ Change detection

---

## 🤝 Contributing

This project is built **entirely via AI assistance** under human guidance. Contributions are welcome, but please note:

- The maintainer has not manually authored or deeply reviewed every line of code
- File issues/PRs with this context in mind
- AI-generated code may have unforeseen quirks

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Update README TODO checklist and `llm-context.md` if applicable
5. Test with real Bitburner save files
6. Submit a pull request

---

## ⚠️ Compatibility

- **Tested with**: Bitburner Steam version 2.8.1+
- **Browsers**: Modern browsers (Chrome, Firefox, Edge, Safari)
- **Save Formats**: `.json`, `.json.gz`, base64-encoded

**Note**: Older Bitburner versions may have different save formats. Always back up your save before editing!

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- **Original Project**: [Redmega's Bitburner Save Editor](https://github.com/Redmega/bitburner-save-editor)
- **Game**: [Bitburner by Hydroflame](https://store.steampowered.com/app/1812820/Bitburner/)
- **AI Assistant**: Claude (Anthropic) for code generation

---

## 📚 Documentation

- **Setup Guide**: See [SETUP.md](SETUP.md) for initial scaffolding instructions
- **LLM Context**: See [llm-context.md](llm-context.md) for AI agent development context
- **Bitburner Docs**: `.bitburner-src-dev/src/Documentation/` (if cloned locally)

---

## 🐛 Known Issues

None yet! Report issues on the [GitHub issue tracker](https://github.com/yourusername/bitburner-save-editor/issues).

---

## 💡 Tips

- **Always backup your save** before editing
- **Test imported saves** in Bitburner immediately after editing
- **Check the console** for validation errors if a save won't load
- **Use the reset button** if things go wrong - your original save is preserved

---

**Made with 💚 for the Bitburner community**
