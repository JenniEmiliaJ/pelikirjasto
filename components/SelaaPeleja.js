import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
import { Card } from 'react-native-paper';
import { useState, useEffect } from 'react';

import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';

const database = getDatabase(app);

export default function SelaaPeleja({ navigation }) {
  const [pelit, setPelit] = useState([]);

  useEffect(() => {
    const pelitRef = ref(database, 'pelit/');
    onValue(pelitRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lisatytPelit = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setPelit(lisatytPelit);
      } else {
        setPelit([]);
      }
    });
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{item.pelinNimi}</Text>
        <Text style={styles.text}>Tyyppi: {item.pelinTyyppi}</Text>
        <Text style={styles.text}>
          Pelaajia: {item.minPelaajat}–{item.maxPelaajat}
        </Text>
        <Text style={styles.text}>
          Kesto: {item.minKesto}–{item.maxKesto} min
        </Text>
        {/* 🔽 Tämä on uusi kohta: näytetään omistajat */}
        <Text style={styles.text}>
          Omistaja:{' '}
          {Array.isArray(item.omistaja)
            ? item.omistaja.join(', ')
            : item.omistaja}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text>Selaa pelejä</Text>
      <Button
        onPress={() => navigation.navigate('LisaaPeli')}
        title="Lisää peli"
      />
      <FlatList
        data={pelit}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
