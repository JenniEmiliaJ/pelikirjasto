import { StyleSheet, Text, View, FlatList, Image } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useTheme } from 'react-native-paper';

import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';

const database = getDatabase(app);

export default function SelaaPeleja({ navigation }) {
  const [pelit, setPelit] = useState([]);
  const { colors } = useTheme();

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.pelinKuva && (
            <Image source={{ uri: item.pelinKuva }} style={styles.peliKuva} />
          )}

          
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.title}>{item.pelinNimi}</Text>
            <Text style={styles.text}>Tyyppi: {item.pelinTyyppi}</Text>
            <Text style={styles.text}>
              Pelaajia: {item.minPelaajat}–{item.maxPelaajat}
            </Text>
            <Text style={styles.text}>
              Kesto: {item.minKesto}–{item.maxKesto} min
            </Text>
            <Text style={styles.text}>
              Omistaja:{' '}
              {Array.isArray(item.omistaja)
                ? item.omistaja.join(', ')
                : item.omistaja}
            </Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button>Muokkaa</Button>
        <Button>Lisää omistaja</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Card>
        <Card.Content>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Button
              onPress={() => navigation.navigate('LisaaPeli')}
              mode="contained"
              style={{ flex: 1, marginRight: 10 }}
            >
              Lisää peli
            </Button>
            <Button mode="contained" style={{ flex: 1 }}>
              Etsi peli
            </Button>
          </View>
        </Card.Content>
      </Card>

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
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffffff',
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
  peliKuva: {
  width: 80,
  height: 80,
  borderRadius: 8,
},
});
