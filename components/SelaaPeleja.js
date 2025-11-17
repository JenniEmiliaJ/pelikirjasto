import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';
import { update } from 'lodash';

const database = getDatabase(app);

export default function SelaaPeleja({ navigation }) {
  const [pelit, setPelit] = useState([]);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [nimi, setNimi] = useState('');
  const [valittuPeli, setValittuPeli] = useState(null);

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

  const LisaaOmistaja = async () => {
    if (!nimi.trim()) {
      Alert.alert('Virhe', 'Anna nimi');
      return;
    }
    try {
      const uusiLista = [...nykyisetOmistajat, nimi.trim()];
      await update(ref(database, `pelit/${peliId}`), { omistaja: uusiLista });
      setModalVisible(false);
      setNimi('');
      onUpdate(uusiLista); // Päivitetään UI
    } catch (error) {
      console.error(error);
      Alert.alert('Virhe', 'Omistajan lisääminen epäonnistui.');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.pelinKuva ? (
            <Image source={{ uri: item.pelinKuva }} style={styles.peliKuva} />
          ) : (
            <View style={[styles.peliKuva, styles.placeholder]}>
              <Text style={styles.placeholderText}>Ei kuvaa</Text>
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.title}>{item.pelinNimi}</Text>
            <Text style={styles.text}>
              Tyyppi:{' '}
              {Array.isArray(item.pelinTyyppi)
                ? item.pelinTyyppi.join(', ')
                : item.pelinTyyppi}
            </Text>
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
        <Button icon="pencil" onPress={() => handleEdit(item)}>
          Muokkaa
        </Button>
        <Button
          icon="account-plus"
          onPress={() => {
            setValittuPeli(item);
            setModalVisible(true);
          }}
        >
          Lisää omistaja
        </Button>
      </Card.Actions>
    </Card>
  );

  const handleEdit = (peli) => {
    navigation.navigate('MuokkaaPeli', {
      peli: peli,
      peliId: peli.id,
    });
  };

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
              icon="playlist-plus"
            >
              Lisää peli
            </Button>
            <Button mode="contained" style={{ flex: 1 }} icon="magnify">
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
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 5,
  },
  placeholderText: {
    color: '#000000ff',
    backgroundColor: '#ccc',
    fontSize: 12,
    width: 90,
    height: 90,
    textAlign: 'center', // vaakasuuntainen keskitys
    textAlignVertical: 'center',
  },
});
