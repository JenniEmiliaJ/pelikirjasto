import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { getDatabase, ref, onValue, update } from 'firebase/database';
import { app } from '../firebaseConfig';

const database = getDatabase(app);

export default function SelaaPeleja({ navigation }) {
  const [pelit, setPelit] = useState([]);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [nimi, setNimi] = useState('');
  const [valittuPeliId, setValittuPeliId] = useState(null);

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

  const LisaaOmistaja = async (peli) => {
    if (!nimi.trim()) {
      Alert.alert('Virhe', 'Anna nimi');
      return;
    }

    try {
      const nykyisetOmistajat = Array.isArray(peli.omistaja)
        ? peli.omistaja
        : peli.omistaja
        ? [peli.omistaja]
        : [];

      const uusiLista = [...nykyisetOmistajat, nimi.trim()];
      await update(ref(database, `pelit/${peli.id}`), { omistaja: uusiLista });

      setNimi('');
      setValittuPeliId(null); // piilota Input
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
          onPress={() =>
            setValittuPeliId(item.id === valittuPeliId ? null : item.id)
          }
        >
          Lisää omistaja
        </Button>
      </Card.Actions>

      {valittuPeliId === item.id && (
        <View style={{ flexDirection: 'row', padding: 8 }}>
          <TextInput
            placeholder="Nimi"
            value={nimi}
            onChangeText={setNimi}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              padding: 6,
            }}
          />
          <Button
            mode="contained"
            onPress={() => LisaaOmistaja(item)}
            style={{ marginLeft: 8 }}
          >
            Lisää
          </Button>
        </View>
      )}
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 16,
        }}
      >
        <Button
          mode="contained"
          icon="magnify"
          onPress={() => navigation.navigate('EtsiPeli')}
          textColor="#ffffff"
        >
          Etsi peli
        </Button>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('LisaaPeli')}
          textColor="#ffffff"
        >
          Lisää peli
        </Button>
      </View>

      <FlatList
        data={pelit}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <Card>
            <Card.Title title="Lisää omistaja" />
            <Card.Content>
              <TextInput
                placeholder="Nimi"
                value={nimi}
                onChangeText={setNimi}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 8,
                }}
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setModalVisible(false)}>Peruuta</Button>
              <Button mode="contained" onPress={LisaaOmistaja}>
                Lisää
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
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
