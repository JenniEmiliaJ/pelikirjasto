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
import { Card, Button, TextInput, Chip } from 'react-native-paper';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { getDatabase, ref as dbRef, push, get } from 'firebase/database';
import { app } from '../firebaseConfig';

const storage = getStorage(app);
const database = getDatabase(app);

export default function LisaaPeli({ navigation }) {
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

  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [peli, setPeli] = useState({
    pelinNimi: '',
    minPelaajat: '',
    maxPelaajat: '',
    minKesto: '',
    maxKesto: '',
    omistaja: '',
  });

  // Kuva laitteelta
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
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Upload Firebase Storageen
  const uploadImage = async () => {
    if (!image) return null;
    const response = await fetch(image);
    const blob = await response.blob();
    const filename = `${Date.now()}_${peli.pelinNimi}.jpg`;
    const storageReference = storageRef(storage, `pelikuvat/${filename}`);
    await uploadBytes(storageReference, blob);
    const downloadURL = await getDownloadURL(storageReference);
    return downloadURL;
  };

  // Tallenna peli
  const handleSave = async () => {
    if (
      peli.pelinNimi &&
      selectedTypes.length > 0 &&
      peli.minPelaajat &&
      peli.maxPelaajat &&
      peli.minKesto &&
      peli.maxKesto &&
      peli.omistaja
    ) {
      try {
        const pelitSnapshot = await get(dbRef(database, 'pelit/'));
        const pelitData = pelitSnapshot.val() || {};

        const nimiOnKaytossa = Object.values(pelitData).some(
          (p) => p.pelinNimi.toLowerCase() === peli.pelinNimi.toLowerCase()
        );

        if (nimiOnKaytossa) {
          Alert.alert('Virhe', 'Tämän niminen peli löytyy jo pelikirjastosta');
          return;
        }

        const uudetOmistajat = peli.omistaja
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n !== '');
        const imageUrl = await uploadImage();

        const uusiPeli = {
          pelinKuva: imageUrl || null,
          pelinNimi: peli.pelinNimi,
          pelinTyyppi: selectedTypes,
          minPelaajat: peli.minPelaajat,
          maxPelaajat: peli.maxPelaajat,
          minKesto: peli.minKesto,
          maxKesto: peli.maxKesto,
          omistaja: uudetOmistajat,
        };

        await push(dbRef(database, 'pelit/'), uusiPeli);
        Alert.alert('Onnistui', `Lisättiin uusi peli "${peli.pelinNimi}".`);
        navigation.goBack();
      } catch (error) {
        console.error(error);
        Alert.alert('Virhe', 'Tietojen tallennus epäonnistui.');
      }
    } else {
      Alert.alert('Virhe', 'Täytä kaikki kentät ja valitse pelityyppi.');
    }
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const removeType = (typeToRemove) => {
    setSelectedTypes((prev) => prev.filter((type) => type !== typeToRemove));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Lisää uusi peli" titleStyle={{ color: '#fff' }} />
        <Card.Content>
          <TextInput
            label="Pelin nimi"
            value={peli.pelinNimi}
            onChangeText={(text) => setPeli({ ...peli, pelinNimi: text })}
            style={styles.input}
          />
          <TextInput
            label="Min pelaajamäärä"
            value={peli.minPelaajat}
            onChangeText={(text) => setPeli({ ...peli, minPelaajat: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Max pelaajamäärä"
            value={peli.maxPelaajat}
            onChangeText={(text) => setPeli({ ...peli, maxPelaajat: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Min pelin kesto"
            value={peli.minKesto}
            onChangeText={(text) => setPeli({ ...peli, minKesto: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Max pelin kesto"
            value={peli.maxKesto}
            onChangeText={(text) => setPeli({ ...peli, maxKesto: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Omistaja"
            value={peli.omistaja}
            onChangeText={(text) => setPeli({ ...peli, omistaja: text })}
            style={styles.input}
          />

          {/*selectedTypes.length > 0 && (
            <Text style={{ marginBottom: 12, color: '#fff' }}>Valitut: {selectedTypes.join(', ')}</Text>
          )*/}

          <Button
            mode="outlined"
            onPress={() => setModalVisible(true)}
            style={{ marginBottom: 12, backgroundColor: '#fff' }}
          >
            Valitse pelityypit
          </Button>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {selectedTypes.map((type) => (
              <Chip
                key={type}
                onLongPress={() => removeType(type)}
                style={{ margin: 1, marginBottom: 12 }}
              >
                {type}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={pickImage}
            style={{ marginBottom: 12 }}
          >
            Valitse kuva
          </Button>
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <Button mode="contained" onPress={handleSave}>
            Tallenna peli
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
                      ? '#4A148C'
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
