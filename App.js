import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import * as React from 'react';

import SelaaPeleja from './components/SelaaPeleja';
import LisaaPeli from './components/LisaaPeli';
import MuokkaaPeli from './components/MuokkaaPeli';
import EtsiPeli from './components/EtsiPeli';

const Stack = createNativeStackNavigator();

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#212121', // grey[900]
      surface: '#FFFFFF', // kortit
      onSurface: '#311B92', // deepPurple[900]
      primary: '#4A148C', // painikkeet
      onPrimary: '#FFFFFF', // painikkeiden teksti
      secondaryContainer: '#E1BEE7', // slider
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SelaaPeleja">
          <Stack.Screen name="SelaaPeleja" component={SelaaPeleja} />
          <Stack.Screen name="LisaaPeli" component={LisaaPeli} />
          <Stack.Screen name="MuokkaaPeli" component={MuokkaaPeli} />
          <Stack.Screen name="EtsiPeli" component={EtsiPeli} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
