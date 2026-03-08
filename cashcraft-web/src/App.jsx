import { useState } from 'react';
import { Home, Users, Camera, BarChart2, Settings } from 'lucide-react';
import { Colors } from './constants/theme';
import { useAppStore } from './store';

// Onboarding
import WelcomeScreen from './screens/onboarding/WelcomeScreen';
import SalaryScreen from './screens/onboarding/SalaryScreen';
import BudgetRuleScreen from './screens/onboarding/BudgetRuleScreen';
import ConfirmScreen from './screens/onboarding/ConfirmScreen';

// Home
import HomeScreen from './screens/home/HomeScreen';
import AddExpenseScreen from './screens/home/AddExpenseScreen';
import ExpenseHistoryScreen from './screens/home/ExpenseHistoryScreen';

// Split
import GroupsListScreen from './screens/split/GroupsListScreen';
import CreateGroupScreen from './screens/split/CreateGroupScreen';
import GroupDetailScreen from './screens/split/GroupDetailScreen';
import AddBillScreen from './screens/split/AddBillScreen';
import SettleUpScreen from './screens/split/SettleUpScreen';

// Scan
import ScanScreen from './screens/scan/ScanScreen';
import ScanResultsScreen from './screens/scan/ScanResultsScreen';

// Analytics
import AnalyticsScreen from './screens/analytics/AnalyticsScreen';

// Settings
import SettingsScreen from './screens/settings/SettingsScreen';

const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'groups', label: 'Groups', Icon: Users },
  { id: 'scan', label: 'Scan', Icon: Camera },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

// Simple stack navigator per tab
function useStackNav(initial) {
  const [stack, setStack] = useState([{ screen: initial, params: {} }]);
  const current = stack[stack.length - 1];

  const navigate = (screen, params = {}) => {
    if (screen === 'back') {
      setStack((s) => s.length > 1 ? s.slice(0, -1) : s);
    } else {
      setStack((s) => [...s, { screen, params }]);
    }
  };

  return { current, navigate, canGoBack: stack.length > 1 };
}

function TabStack({ tab }) {
  const { current, navigate } = useStackNav(tab);
  const { screen, params } = current;

  const props = { navigate, params };

  if (tab === 'home') {
    if (screen === 'home' || screen === tab) return <HomeScreen {...props} />;
    if (screen === 'addExpense') return <AddExpenseScreen {...props} />;
    if (screen === 'history') return <ExpenseHistoryScreen {...props} />;
    if (screen === 'addBill') return <AddBillScreen {...props} />;
  }

  if (tab === 'groups') {
    if (screen === 'groups' || screen === tab) return <GroupsListScreen {...props} />;
    if (screen === 'createGroup') return <CreateGroupScreen {...props} />;
    if (screen === 'groupDetail') return <GroupDetailScreen {...props} />;
    if (screen === 'addBill') return <AddBillScreen {...props} />;
    if (screen === 'settleUp') return <SettleUpScreen {...props} />;
  }

  if (tab === 'scan') {
    if (screen === 'scan' || screen === tab) return <ScanScreen {...props} />;
    if (screen === 'scanResults') return <ScanResultsScreen {...props} />;
  }

  if (tab === 'analytics') return <AnalyticsScreen {...props} />;
  if (tab === 'settings') return <SettingsScreen {...props} />;

  return null;
}

function OnboardingFlow({ onDone }) {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (step === 0) return <WelcomeScreen onNext={next} />;
  if (step === 1) return <SalaryScreen onNext={next} onBack={back} />;
  if (step === 2) return <BudgetRuleScreen onNext={next} onBack={back} />;
  if (step === 3) return <ConfirmScreen onBack={back} />;
  return null;
}

export default function App() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
    }}>
      {/* Phone frame */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        height: '100%',
        maxHeight: '100dvh',
        background: Colors.bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {!isOnboarded ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <OnboardingFlow />
          </div>
        ) : (
          <>
            {/* Main content */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {TABS.map((tab) => (
                <div
                  key={tab.id}
                  style={{
                    position: 'absolute', inset: 0,
                    display: activeTab === tab.id ? 'flex' : 'none',
                    flexDirection: 'column',
                  }}
                >
                  <TabStack tab={tab.id} />
                </div>
              ))}
            </div>

            {/* Bottom Tab Bar */}
            <div style={{
              height: 72,
              background: Colors.card,
              borderTop: `1px solid ${Colors.border}`,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              paddingBottom: 4,
            }}>
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                const isScan = id === 'scan';
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 4, height: '100%',
                      background: 'none', border: 'none', cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {isScan ? (
                      <div style={{
                        width: 48, height: 48, borderRadius: 24,
                        background: active ? 'linear-gradient(135deg, #34D399, #10B981)' : Colors.cardElevated,
                        border: active ? 'none' : `1px solid ${Colors.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: -12,
                        boxShadow: active ? '0 4px 16px rgba(52,211,153,0.35)' : 'none',
                      }}>
                        <Icon size={22} color={active ? '#050505' : Colors.textTertiary} />
                      </div>
                    ) : (
                      <Icon size={22} color={active ? Colors.accent : Colors.textTertiary} />
                    )}
                    {!isScan && (
                      <span style={{ fontSize: 10, fontWeight: '600', color: active ? Colors.accent : Colors.textTertiary }}>
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
