import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../constants/theme';
import { defaultStackOptions } from './screenOptions';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import GroupsListScreen from '../screens/split/GroupsListScreen';
import ScanScreen from '../screens/scan/ScanScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Stack screens
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import ExpenseHistoryScreen from '../screens/expenses/ExpenseHistoryScreen';
import CreateGroupScreen from '../screens/split/CreateGroupScreen';
import GroupDetailScreen from '../screens/split/GroupDetailScreen';
import AddBillScreen from '../screens/split/AddBillScreen';
import SettleUpScreen from '../screens/split/SettleUpScreen';
import ScanResultsScreen from '../screens/scan/ScanResultsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ITEMS = [
  { name: 'Home', icon: 'home' },
  { name: 'Split', icon: 'users' },
  { name: 'Scan', icon: 'camera' },
  { name: 'Analytics', icon: 'bar-chart-2' },
  { name: 'Settings', icon: 'settings' },
];

// Extracted into its own component so hooks are called at top-level
const TabItem = ({ route, isFocused, isScan, navigation, item }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  if (isScan) {
    return (
      <Pressable key={route.key} style={styles.scanButton} onPress={handlePress}>
        <Animated.View style={[animatedStyle, styles.scanCircle]}>
          <Feather name="camera" size={22} color="#050505" />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable key={route.key} style={styles.tabItem} onPress={handlePress}>
      <Animated.View style={[animatedStyle, styles.tabInner]}>
        <Feather
          name={item?.icon || 'circle'}
          size={22}
          color={isFocused ? Colors.accent : Colors.textTertiary}
        />
        {isFocused && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || Spacing.base }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isScan = route.name === 'Scan';
        const item = TAB_ITEMS.find((t) => t.name === route.name);

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            isScan={isScan}
            navigation={navigation}
            item={item}
          />
        );
      })}
    </View>
  );
};

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
      <Stack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} options={{ title: 'All Expenses' }} />
    </Stack.Navigator>
  );
}

// Split Stack
function SplitStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="GroupsList" component={GroupsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'New Group' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="AddBill" component={AddBillScreen} options={{ title: 'Add Bill' }} />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} options={{ title: 'Settle Up' }} />
    </Stack.Navigator>
  );
}

// Scan Stack
function ScanStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="ScanMain" component={ScanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScanResults" component={ScanResultsScreen} options={{ title: 'Scan Results' }} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Split" component={SplitStack} />
      <Tab.Screen name="Scan" component={ScanStack} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  tabInner: {
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  scanButton: {
    flex: 1,
    alignItems: 'center',
    marginTop: -20,
  },
  scanCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
