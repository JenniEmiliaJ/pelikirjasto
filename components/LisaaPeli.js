import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Button, TextInput } from 'react-native';
import { useState } from 'react';

import { app } from '../firebaseConfig';
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  equalTo,
  get,
  update,
} from 'firebase/database';

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
    omistaja: '', // <-- pilkuilla erotettu syöte
  });

  const handleSave = async () => {
    // tarkistus
    if (
      peli.pelinNimi &&
      peli.pelinTyyppi &&
      peli.minPelaajat &&
      peli.maxPelaajat &&
      peli.minKesto &&
      peli.maxKesto &&
      peli.omistaja
    ) {
      try {
        // jaetaan pilkulla erotettu syöte listaksi
        const uudetOmistajat = peli.omistaja
          .split(',')
          .map((nimi) => nimi.trim())
          .filter((n) => n !== '');

        const pelitRef = ref(database, 'pelit/');
        const peliQuery = query(
          pelitRef,
          orderByChild('pelinNimi'),
          equalTo(peli.pelinNimi)
        );

        const snapshot = await get(peliQuery);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const peliId = Object.keys(data)[0];
          const peliData = data[peliId];

          // onko vanhat omistajat taulukko:
          const vanhatOmistajat = Array.isArray(peliData.omistaja)
            ? peliData.omistaja
            : peliData.omistaja
            ? [peliData.omistaja]
            : [];

          const yhdistetytOmistajat = [
            ...new Set([...vanhatOmistajat, ...uudetOmistajat]),
          ];

          await update(ref(database, `pelit/${peliId}`), {
            omistaja: yhdistetytOmistajat,
          });

          Alert.alert(
            'Onnistui',
            `Lisättiin omistaja "${uudetOmistajat.join(', ')}" peliin "${
              peli.pelinNimi
            }".`
          );
        } else {
          // uusi peli
          const uusiPeli = {
            pelinNimi: peli.pelinNimi,
            pelinTyyppi: peli.pelinTyyppi,
            minPelaajat: peli.minPelaajat,
            maxPelaajat: peli.maxPelaajat,
            minKesto: peli.minKesto,
            maxKesto: peli.maxKesto,
            kuva: peli.kuva,
            omistaja: uudetOmistajat,
          };

          await push(pelitRef, uusiPeli);
          Alert.alert('Onnistui', `Lisättiin uusi peli "${peli.pelinNimi}".`);
        }
      } catch (error) {
        console.error('Virhe tallennuksessa:', error);
        Alert.alert('Virhe', 'Tietojen tallennus epäonnistui.');
      }
    } else {
      Alert.alert('Virhe', 'Lisää ensin kaikki pelin tiedot.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Pelin nimi"
        onChangeText={(text) => setPeli({ ...peli, pelinNimi: text })}
        value={peli.pelinNimi}
      />
      <TextInput
        placeholder="Pelin tyyppi"
        onChangeText={(text) => setPeli({ ...peli, pelinTyyppi: text })}
        value={peli.pelinTyyppi}
      />
      <TextInput
        placeholder="Min pelaajamäärä"
        onChangeText={(text) => setPeli({ ...peli, minPelaajat: text })}
        value={peli.minPelaajat}
      />
      <TextInput
        placeholder="Max pelaajamäärä"
        onChangeText={(text) => setPeli({ ...peli, maxPelaajat: text })}
        value={peli.maxPelaajat}
      />
      <TextInput
        placeholder="Min pelin kesto"
        onChangeText={(text) => setPeli({ ...peli, minKesto: text })}
        value={peli.minKesto}
      />
      <TextInput
        placeholder="Max pelin kesto"
        onChangeText={(text) => setPeli({ ...peli, maxKesto: text })}
        value={peli.maxKesto}
      />
      <TextInput
        placeholder="Omistaja"
        onChangeText={(text) => setPeli({ ...peli, omistaja: text })}
        value={peli.omistaja}
      />
      <Button onPress={handleSave} title="Tallenna peli" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
