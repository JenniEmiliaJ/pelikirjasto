import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Alert,
  Button,
  TextInput,
  ScrollView,
  Image,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '../firebaseConfig';
import { getDatabase, ref as dbRef, push } from 'firebase/database';

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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        console.error('Virhe tallennuksessa:', error);
        Alert.alert('Virhe', 'Tietojen tallennus epäonnistui.');
      }
    } else {
      Alert.alert('Virhe', 'Täytä kaikki kentät ja valitse pelityyppi.');
    }
  };

  // Toggle valinta
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Pelin nimi"
        style={styles.input}
        value={peli.pelinNimi}
        onChangeText={(text) => setPeli({ ...peli, pelinNimi: text })}
      />

      <TextInput
        placeholder="Min pelaajamäärä"
        style={styles.input}
        keyboardType="numeric"
        value={peli.minPelaajat}
        onChangeText={(text) => setPeli({ ...peli, minPelaajat: text })}
      />
      <TextInput
        placeholder="Max pelaajamäärä"
        style={styles.input}
        keyboardType="numeric"
        value={peli.maxPelaajat}
        onChangeText={(text) => setPeli({ ...peli, maxPelaajat: text })}
      />
      <TextInput
        placeholder="Min pelin kesto"
        style={styles.input}
        keyboardType="numeric"
        value={peli.minKesto}
        onChangeText={(text) => setPeli({ ...peli, minKesto: text })}
      />
      <TextInput
        placeholder="Max pelin kesto"
        style={styles.input}
        keyboardType="numeric"
        value={peli.maxKesto}
        onChangeText={(text) => setPeli({ ...peli, maxKesto: text })}
      />
      <TextInput
        placeholder="Omistaja"
        style={styles.input}
        value={peli.omistaja}
        onChangeText={(text) => setPeli({ ...peli, omistaja: text })}
      />

      {selectedTypes.length > 0 && (
        <Text style={{ alignSelf: 'flex-start', marginVertical: 6 }}>
          Valitut: {selectedTypes.join(', ')}
        </Text>
      )}

            <Button
        title="Valitse pelityypit"
        
        onPress={() => setModalVisible(true)}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              margin: 20,
              borderRadius: 8,
              padding: 20,
            }}
          >
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
                    color: selectedTypes.includes(type) ? 'white' : 'black',
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
            <Button title="Sulje" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Button title="Valitse kuva" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={{ marginVertical: 16 }}>
        <Button title="Tallenna peli" onPress={handleSave} />
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 12,
  },
});
