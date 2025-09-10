import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { ThemeProvider } from './src/contexts/ThemeContext';
import CreatePlanScreen from './src/screens/CreatePlanScreen';
import PlanScreen from './src/screens/PlanScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="CreatePlan"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#6366f1',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="CreatePlan" 
                component={CreatePlanScreen}
                options={{ title: 'Create Plan' }}
              />
              <Stack.Screen 
                name="Plan" 
                component={PlanScreen}
                options={{ title: 'Your Plan' }}
              />
              <Stack.Screen 
                name="History" 
                component={HistoryScreen}
                options={{ title: 'Previous Plans' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}