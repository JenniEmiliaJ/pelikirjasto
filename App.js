import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';

import SelaaPeleja from './components/SelaaPeleja';
import LisaaPeli from './components/LisaaPeli';
import MuokkaaPeli from './components/MuokkaaPeli';
import EtsiPeli from './components/EtsiPeli';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="SelaaPeleja"
        component={SelaaPeleja}
        options={{
          title: 'Selaa pelejä',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cards-playing-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="EtsiPeli"
        component={EtsiPeli}
        options={{
          title: 'Etsi pelejä',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="magnify"
              color={color}
              size={size}
            />
          ),
          }}
      />
      <Tab.Screen
        name="LisaaPeli"
        component={LisaaPeli}
        options={{
          title: 'Lisää peli',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus"
              color={color}
              size={size}
            />
          ),
          }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#212121',
      surface: '#FFFFFF',
      onSurface: '#311B92',
      primary: '#4A148C',
      onPrimary: '#FFFFFF',
      secondaryContainer: '#E1BEE7',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Etusivu = Tabs */}
          <Stack.Screen name="Tabs" component={Tabs} />

          {/* Ei tabissa näkyviä sivuja */}
          <Stack.Screen name="MuokkaaPeli" component={MuokkaaPeli} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
