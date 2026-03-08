# CashCraft

A personal finance and expense-splitting app built with React Native + Expo for HackBU 2026.

## Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **npm** or **yarn**
- **Expo CLI** — install globally if needed:
  ```bash
  npm install -g expo-cli
  ```
- **iOS Simulator** — requires Xcode installed from the Mac App Store
  - After installing Xcode, open it once and accept the license agreement
  - Go to **Xcode → Settings → Platforms** and install an iOS simulator
- **Android Emulator** — requires Android Studio (optional)

## Setup

```bash
cd cashcraft
npm install
```

## Run on iOS Simulator

```bash
npx expo start --ios
```

Or start the dev server first, then press `i`:

```bash
npx expo start
# Press 'i' to open in iOS Simulator
```

## Run on Android Emulator

```bash
npx expo start --android
# Or press 'a' after running npx expo start
```

## Run on Physical Device

1. Install the **Expo Go** app from the App Store or Google Play
2. Run `npx expo start`
3. Scan the QR code with your camera (iOS) or the Expo Go app (Android)

## Project Structure

```
cashcraft/
├── src/
│   ├── constants/       # Theme, colors, typography, categories
│   ├── context/         # Zustand stores (budget, expenses, groups, OCR, user)
│   ├── navigation/      # AppNavigator (onboarding gate) + TabNavigator (5 tabs)
│   ├── components/      # Reusable UI components
│   ├── screens/         # All app screens
│   │   ├── onboarding/  # Welcome → Salary → BudgetRule → Confirm
│   │   ├── home/        # HomeScreen, AddExpense, ExpenseHistory
│   │   ├── split/       # GroupsList, CreateGroup, GroupDetail, AddBill, SettleUp
│   │   ├── scan/        # ScanScreen, ScanResultsScreen
│   │   ├── analytics/   # AnalyticsScreen
│   │   └── settings/    # SettingsScreen
│   ├── utils/           # Formatters, budgetCalculator, debtSimplifier, ocrParser
│   └── hooks/           # useHaptic
├── app.json
├── babel.config.js
└── package.json
```

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.83 + Expo SDK 55 |
| Navigation | React Navigation 7 (Bottom Tabs + Native Stack) |
| State | Zustand 5 + AsyncStorage |
| Animations | React Native Reanimated 4.2 |
| Charts | react-native-svg |
| Icons | @expo/vector-icons (Feather) |
| Gradients | expo-linear-gradient |
| Haptics | expo-haptics |

## Scripts

| Command | Description |
|---------|-------------|
| `npx expo start` | Start the dev server |
| `npx expo start --ios` | Start and open iOS Simulator directly |
| `npx expo start --android` | Start and open Android Emulator directly |
| `npx expo start --web` | Start in browser (limited support) |
| `npx expo export --platform ios` | Build a production bundle |

## Troubleshooting

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**Dependency issues:**
```bash
rm -rf node_modules
npm install
```

**iOS Simulator not appearing:**
- Make sure Xcode Command Line Tools are installed: `xcode-select --install`
- Try opening Simulator manually: `open -a Simulator`
