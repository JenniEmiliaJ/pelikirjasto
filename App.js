import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Button, TextInput } from 'react-native';
import { useState } from 'react';

import { app } from './firebaseConfig';
import { getDatabase, ref, push } from 'firebase/database';

const database = getDatabase(app);

export default function App() {
  const [testi, setTesti] = useState({
    testidata1: '',
    testidata2: '',
  });
  const [testisisalto, setTestisisalto] = useState([]);

  const handleSave = () => {
    if (testi.testidata2 && testi.testidata1) {
      push(ref(database, 'testit/'), testi);
    } else {
      Alert.alert('Error', 'Type product and amount first');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Testihomma"
        onChangeText={(text) => setTesti({ ...testi, testidata1: text })}
        value={testi.testidata1}
      />
      <TextInput
        placeholder="Testihomma2"
        onChangeText={(text) => setTesti({ ...testi, testidata2: text })}
        value={testi.testidata2}
      />
      <Button onPress={handleSave} title="Save" />
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

