import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { getDatabase, ref as dbRef, update, remove } from 'firebase/database';
import { app } from '../firebaseConfig';

const storage = getStorage(app);
const database = getDatabase(app);

export default function MuokkaaPeli({ navigation, route }) {
  const { peli, peliId } = route.params;

  const TYPE_OPTIONS = [
    'Strategia',
    'Korttipeli',
    'Seikkailu',
    'Noppapeli',
    'Yhteistyö',
    'Resurssinhallinta',
    'Perhepeli',
    'Abstrakti',
    'Nopea',
    'Pakanrakennus',
  ];

  const [selectedTypes, setSelectedTypes] = useState(peli.pelinTyyppi || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(peli.pelinKuva || null);
  const [peliData, setPeliData] = useState({
    pelinNimi: peli.pelinNimi || '',
    minPelaajat: peli.minPelaajat || '',
    maxPelaajat: peli.maxPelaajat || '',
    minKesto: peli.minKesto || '',
    maxKesto: peli.maxKesto || '',
    omistaja: peli.omistaja?.join(', ') || '',
  });

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Lupa tarvitaan',
          'Sovellus tarvitsee luvan kuvien käyttöön.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadImage = async () => {
    if (!image) return null;
    const response = await fetch(image);
    const blob = await response.blob();
    const filename = `${Date.now()}_${peliData.pelinNimi}.jpg`;
    const storageReference = storageRef(storage, `pelikuvat/${filename}`);
    await uploadBytes(storageReference, blob);
    const downloadURL = await getDownloadURL(storageReference);
    return downloadURL;
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (
      peliData.pelinNimi &&
      selectedTypes.length > 0 &&
      peliData.minPelaajat &&
      peliData.maxPelaajat &&
      peliData.minKesto &&
      peliData.maxKesto &&
      peliData.omistaja
    ) {
      try {
        const uudetOmistajat = peliData.omistaja
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n !== '');
        const imageUrl = await uploadImage();

        const uusiPeli = {
          pelinKuva: imageUrl || image || null,
          pelinNimi: peliData.pelinNimi,
          pelinTyyppi: selectedTypes,
          minPelaajat: peliData.minPelaajat,
          maxPelaajat: peliData.maxPelaajat,
          minKesto: peliData.minKesto,
          maxKesto: peliData.maxKesto,
          omistaja: uudetOmistajat,
        };

        await update(dbRef(database, `pelit/${peliId}`), uusiPeli);
        Alert.alert('Onnistui', 'Peli päivitetty!');
        navigation.goBack();
      } catch (error) {
        console.error(error);
        Alert.alert('Virhe', 'Tietojen tallennus epäonnistui.');
      }
    } else {
      Alert.alert('Virhe', 'Täytä kaikki kentät ja valitse pelityyppi.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Vahvista poisto',
      `Haluatko varmasti poistaa pelin "${peli.pelinNimi}"?`,
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            try {
              // Poista kuva Firebase Storagesta jos olemassa
              if (peli.pelinKuva) {
                const imageRef = storageRef(storage, peli.pelinKuva);
                await deleteObject(imageRef).catch(() => {});
              }
              await remove(dbRef(database, `pelit/${peliId}`));
              Alert.alert('Onnistui', 'Peli poistettu.');
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert('Virhe', 'Pelien poisto epäonnistui.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Muokkaa peliä" titleStyle={{ color: '#fff' }} />
        <Card.Content>
          <TextInput
            label="Pelin nimi"
            value={peliData.pelinNimi}
            onChangeText={(text) =>
              setPeliData({ ...peliData, pelinNimi: text })
            }
            style={styles.input}
          />
          <TextInput
            label="Min pelaajamäärä"
            value={peliData.minPelaajat}
            onChangeText={(text) =>
              setPeliData({ ...peliData, minPelaajat: text })
            }
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Max pelaajamäärä"
            value={peliData.maxPelaajat}
            onChangeText={(text) =>
              setPeliData({ ...peliData, maxPelaajat: text })
            }
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Min pelin kesto"
            value={peliData.minKesto}
            onChangeText={(text) =>
              setPeliData({ ...peliData, minKesto: text })
            }
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Max pelin kesto"
            value={peliData.maxKesto}
            onChangeText={(text) =>
              setPeliData({ ...peliData, maxKesto: text })
            }
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Omistaja"
            value={peliData.omistaja}
            onChangeText={(text) =>
              setPeliData({ ...peliData, omistaja: text })
            }
            style={styles.input}
          />

          {selectedTypes.length > 0 && (
            <Text style={{ marginBottom: 12, color: '#fff' }}>
              Valitut: {selectedTypes.join(', ')}
            </Text>
          )}

          <Button
            mode="outlined"
            onPress={() => setModalVisible(true)}
            style={{ marginBottom: 12, backgroundColor: '#fff' }}
          >
            Valitse pelityypit
          </Button>

          <Button
            mode="contained"
            onPress={pickImage}
            style={{ marginBottom: 12 }}
          >
            Valitse kuva
          </Button>
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <Button
            mode="contained"
            onPress={handleSave}
            style={{ marginBottom: 12 }}
          >
            Tallenna peli
          </Button>

          <Button
            mode="contained"
            buttonColor="#660214ff"
            onPress={handleDelete}
          >
            Poista peli
          </Button>
        </Card.Content>
      </Card>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <Card>
            <Card.Title title="Valitse pelityypit" />
            <Card.Content>
              {TYPE_OPTIONS.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleType(type)}
                  style={{
                    padding: 10,
                    marginVertical: 4,
                    borderRadius: 4,
                    backgroundColor: selectedTypes.includes(type)
                      ? '#6200ee'
                      : '#eee',
                  }}
                >
                  <Text
                    style={{
                      color: selectedTypes.includes(type) ? '#fff' : '#000',
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setModalVisible(false)}>Sulje</Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#212121',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#333',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
