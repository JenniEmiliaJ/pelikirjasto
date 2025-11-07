import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SelaaPeleja from './components/SelaaPeleja';
import LisaaPeli from './components/LisaaPeli';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SelaaPeleja">
        <Stack.Screen name="SelaaPeleja" component={SelaaPeleja} />
        <Stack.Screen name="LisaaPeli" component={LisaaPeli} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
