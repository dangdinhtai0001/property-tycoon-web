# Property Tycoon Web 🏘️

**Một game board bất động sản chơi trên browser với hoạt ảnh 2D chất lượng cao.**

Property Tycoon Web là một game property-trading local multiplayer chạy hoàn toàn trên trình duyệt desktop. Hỗ trợ 2–6 người chơi thay phiên nhau trên cùng một máy, với hệ thống tài chính nâng cao bao gồm bán công trình, thế chấp tài sản, gỡ nợ và xử lý phá sản.

---

## 🎮 Giới Thiệu

### Một dòng mô tả (One-Liner)

Property Tycoon Web là một game board bất động sản chơi trên browser, hỗ trợ 2–6 người chơi thay phiên nhau trên cùng một máy, tập trung vào mua tài sản, thu tiền thuê, xây công trình, quản lý nợ, thế chấp tài sản và loại đối thủ khỏi cuộc chơi bằng sức mạnh tài chính.

### Đặc Điểm Chính

- **Board 40 ô** với 6 nhóm tài sản, trạm, tiện ích, card, và các ô đặc biệt
- **2–6 người chơi** cùng chơi trên một thiết bị
- **Hệ thống tài chính nâng cao**: bán công trình, thế chấp, gỡ thế chấp với lãi cố định
- **Debt Resolution** — xử lý nợ với nhiều lựa chọn trước khi phá sản
- **Emergency Loan** — quy tắc tùy chọn để tránh phá sản
- **Hoạt ảnh 2D chất lượng cao** với Phaser game engine
- **Save/Load local** trong browser localStorage
- **UI rõ ràng** với modal, panel và game screen tương tác

---

## 🛠️ Tech Stack

### Frontend
- **Vite** — Build tool cực nhanh
- **React 19** — UI library
- **TypeScript** — Type safety
- **Phaser 4** — Game engine cho rendering board, token, dice
- **Zustand** — State management
- **Tailwind CSS** — Styling
- **Framer Motion** — Animation library cho UI

### Testing & Tools
- **Vitest** — Unit testing
- **Playwright** — E2E testing
- **ESLint** — Code linting

### Architecture: Hybrid (Game Engine + React DOM)

Game logic tách khỏi rendering:
- **Phaser**: Board, Token, Dice rendering (Canvas/WebGL)
- **React DOM**: UI Layer (Modal, Menu, Panel)
- **Zustand**: Centralized game state
- **PhaserBridge**: State synchronization

---

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu
- Node.js 18+
- npm hoặc yarn

### Cài Đặt

```bash
# Clone project
git clone <repository-url>
cd property-tycoon-web

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

### Scripts

```bash
npm run dev       # Dev server (http://localhost:5173)
npm run build     # Build production
npm run lint      # ESLint
npm run test      # Unit tests
npm run preview   # Preview build
```

---

## 📖 Gameplay

### Core Loop

1. **Tung xúc xắc** → Kiếm số điểm
2. **Di chuyển token** → Kiếm pass-start bonus ($200)
3. **Resolve ô hiện tại**:
   - Tài sản chưa có chủ → Mua hoặc đấu giá
   - Tài sản có chủ → Trả tiền thuê
   - Card → Rút card Cơ Hội/Khí Vận
   - Thuế → Trả tiền
   - Tù → Nhập tù
4. **Quản lý tài sản** (xây công trình, bán, thế chấp)
5. **Xử lý nợ** (Debt Resolution nếu thiếu tiền)
6. **Chuyển lượt**

Game kết thúc khi chỉ còn 1 người chưa phá sản.

---

## 📁 Cấu Trúc Project

```
src/
├── game-engine/           # Game logic (TypeScript)
│   ├── actions/
│   ├── rules/
│   ├── reducers/
│   ├── selectors/
│   ├── data/boards/       # Board config
│   └── types/
│
├── ui/                    # UI Layer (React + Phaser)
│   ├── phaser/            # Phaser scenes & sprites
│   │   ├── scenes/        # BoardScene, PreloaderScene
│   │   ├── sprites/       # Tile, Token, Dice, Building
│   │   ├── bridge/        # PhaserBridge (state sync)
│   │   └── effects/       # Animations, particles
│   ├── panels/            # Info panels
│   ├── modals/            # Dialog modals
│   ├── screens/           # Full screens
│   ├── animation/         # Celebration effects
│   └── index.css
│
├── App.tsx                # Root component
└── index.tsx              # Entry point

docs/                      # Design documentation
├── 000-overview.md
├── 001-product-scope.md
├── 003-board-design.md
├── 005-ui-ux-scope.md
├── 006-technical-design.md
├── 007-testing-and-acceptance.md
└── 008-roadmap-and-backlog.md
```

---

## 🎯 Phase Hiện Tại

**Phase 5 — Advanced 2D Polish & Juicy Animations** ✨

Tích hợp Phaser game engine:
- ✅ Phaser scenes & sprite system
- ✅ PhaserBridge state synchronization
- ✅ Animation system (Tweens, Particles)
- ✅ Board & UI panels
- ✅ Celebration effects
- 🔄 Fine-tuning animations

---

## 🧪 Testing

```bash
npm run test              # Unit tests
npm run test -- --ui      # With UI
npm run test -- watch     # Watch mode
```

**Lưu ý**: Phaser Canvas rendering không test với React Testing Library. Dùng:
- E2E tests (Playwright) cho user flows
- Manual testing cho animations
- Mocking Phaser trong unit tests

---

## 📚 Documentation

| File | Nội Dung |
|------|----------|
| `000-overview.md` | 🎯 Project overview & decisions |
| `001-product-scope.md` | 📋 MVP scope |
| `003-board-design.md` | 🎲 Board design |
| `005-ui-ux-scope.md` | 🖼️ UI/UX screens |
| `006-technical-design.md` | 🏗️ Architecture |
| `007-testing-and-acceptance.md` | ✅ Test cases |
| `008-roadmap-and-backlog.md` | 🗓️ Roadmap |

**Bắt đầu từ**: `docs/000-overview.md`

---

## 💻 Development Guidelines

- **Immutability**: Không mutate objects
- **Simplicity**: Simple > Clever
- **Type Safety**: TypeScript, không `any`
- **Components**: <50 lines, focused
- **Files**: <800 lines

### Before Committing

- [ ] `npm run build` ✅
- [ ] `npm run test` ✅
- [ ] `npm run lint` ✅
- [ ] No console.log, no secrets

---

## 🔗 IP Note

**Original game design** — không clone Monopoly:
- ❌ Không: Monopoly name, layout, property names
- ✅ Tạo riêng: Tên game, theme, properties, colors, visuals

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit (`git commit -am 'feat: ...'`)
4. Push (`git push origin feature/your-feature`)
5. Open Pull Request

**PR Requirements:**
- All tests pass
- Code review approved
- Documentation updated

---

## 📞 Support

- 📖 Docs: `docs/` folder
- 🐛 Bug: Open issue with reproduction steps
- 💡 Feature: Start discussion

---

## 🎓 Resources

- [Phaser Docs](https://phaser.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 📝 License

**Status**: Draft/Early Development  
Original game design — no affiliation with commercial IP

---

**Last Updated**: May 3, 2026  
**Status**: Phase 5 — Advanced 2D Polish & Juicy Animations  
**Next**: Phase 6 — Online Multiplayer
