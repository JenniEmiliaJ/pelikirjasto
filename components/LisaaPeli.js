import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Button, TextInput } from 'react-native';
import { useState } from 'react';

import { app } from '../firebaseConfig';
import { getDatabase, ref, push } from 'firebase/database';

const database = getDatabase(app);

export default function LisaaPeli() {
  const [peli, setPeli] = useState({
    pelinNimi: '',
    pelinTyyppi: '',
    minPelaajat: '',
    maxPelaajat: '',
    minKesto: '',
    maxKesto: '',
    kuva: '',
    omistaja: '',
  });

  const handleSave = () => {
    if (
      peli.pelinNimi &&
      peli.pelinTyyppi &&
      peli.minPelaajat &&
      peli.maxPelaajat &&
      peli.minKesto &&
      peli.maxKesto &&
      peli.omistaja
    ) {
      push(ref(database, 'pelit/'), peli);
    } else {
      Alert.alert('Error', 'Lisää ensin pelin tiedot');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Pelin nimi: "
        onChangeText={(text) => setPeli({ ...peli, pelinNimi: text })}
        value={peli.pelinNimi}
      />
      <TextInput
        placeholder="Pelin tyyppi: "
        onChangeText={(text) => setPeli({ ...peli, pelinTyyppi: text })}
        value={peli.pelinTyyppi}
      />
      <TextInput
        placeholder="Min pelaajamäärä: "
        onChangeText={(text) => setPeli({ ...peli, minPelaajat: text })}
        value={peli.minPelaajat}
      />
      <TextInput
        placeholder="Max pelaajamäärä: "
        onChangeText={(text) => setPeli({ ...peli, maxPelaajat: text })}
        value={peli.maxPelaajat}
      />
      <TextInput
        placeholder="Min pelin kesto: "
        onChangeText={(text) => setPeli({ ...peli, minKesto: text })}
        value={peli.minKesto}
      />
      <TextInput
        placeholder="Max pelin kesto: "
        onChangeText={(text) => setPeli({ ...peli, maxKesto: text })}
        value={peli.maxKesto}
      />
      <TextInput
        placeholder="Omistaja: "
        onChangeText={(text) => setPeli({ ...peli, omistaja: text })}
        value={peli.omistaja}
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
