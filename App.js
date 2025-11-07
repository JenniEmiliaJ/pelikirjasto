import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SelaaPeleja from './components/SelaaPeleja';
import LisaaPeli from './components/LisaaPeli';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SelaaPeleja">
        <Stack.Screen name="Pelikirjasto" component={SelaaPeleja} />
        <Stack.Screen name="Lisää peli" component={LisaaPeli} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
