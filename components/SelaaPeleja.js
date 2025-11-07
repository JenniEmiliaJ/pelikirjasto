import { StyleSheet, Text, View, Button } from 'react-native';
import LisaaPeli from './LisaaPeli';

export default function SelaaPeleja({ navigation }) {
return (
  <View style={styles.container}>
    <Text>Selaa pelejä</Text>
    <Button 
      onPress={() => navigation.navigate('LisaaPeli')}
      title="Lisää peli" />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});