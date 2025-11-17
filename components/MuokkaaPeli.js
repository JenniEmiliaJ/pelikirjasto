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
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, update } from 'firebase/database';
import { app } from '../firebaseConfig';

const storage = getStorage(app);
const database = getDatabase(app);

export default function MuokkaaPeli({ navigation, route }) {
  const { peli, peliId } = route.params; // Peli ja sen id route paramsista

  const TYPE_OPTIONS = [
    'Strategia', 'Korttipeli', 'Seikkailu', 'Noppapeli',
    'Yhteistyö', 'Resurssinhallinta', 'Perhepeli', 'Abstrakti',
    'Nopea', 'Pakanrakennus'
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

  // Valitse kuva
  const pickImage = async () => {
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

  // Toggle tyyppi modalista
  const toggleType = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
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
        const uudetOmistajat = peliData.omistaja.split(',').map(n => n.trim()).filter(n => n !== '');
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
        console.error('Virhe tallennuksessa:', error);
        Alert.alert('Virhe', 'Tietojen tallennus epäonnistui.');
      }
    } else {
      Alert.alert('Virhe', 'Täytä kaikki kentät ja valitse pelityyppi.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Pelin nimi"
        style={styles.input}
        value={peliData.pelinNimi}
        onChangeText={(text) => setPeliData({ ...peliData, pelinNimi: text })}
      />

      <TextInput
        placeholder="Min pelaajamäärä"
        style={styles.input}
        keyboardType="numeric"
        value={peliData.minPelaajat}
        onChangeText={(text) => setPeliData({ ...peliData, minPelaajat: text })}
      />
      <TextInput
        placeholder="Max pelaajamäärä"
        style={styles.input}
        keyboardType="numeric"
        value={peliData.maxPelaajat}
        onChangeText={(text) => setPeliData({ ...peliData, maxPelaajat: text })}
      />
      <TextInput
        placeholder="Min pelin kesto"
        style={styles.input}
        keyboardType="numeric"
        value={peliData.minKesto}
        onChangeText={(text) => setPeliData({ ...peliData, minKesto: text })}
      />
      <TextInput
        placeholder="Max pelin kesto"
        style={styles.input}
        keyboardType="numeric"
        value={peliData.maxKesto}
        onChangeText={(text) => setPeliData({ ...peliData, maxKesto: text })}
      />
      <TextInput
        placeholder="Omistaja"
        style={styles.input}
        value={peliData.omistaja}
        onChangeText={(text) => setPeliData({ ...peliData, omistaja: text })}
      />

      {selectedTypes.length > 0 && (
        <Text style={{ alignSelf: 'flex-start', marginVertical: 6 }}>
          Valitut: {selectedTypes.join(', ')}
        </Text>
      )}

      <Button title="Valitse pelityypit" onPress={() => setModalVisible(true)} />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor:'white', margin:20, borderRadius:8, padding:20 }}>
            {TYPE_OPTIONS.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => toggleType(type)}
                style={{
                  padding:10,
                  marginVertical:4,
                  borderRadius:4,
                  backgroundColor: selectedTypes.includes(type) ? '#4A148C' : '#eee'
                }}
              >
                <Text style={{ color: selectedTypes.includes(type) ? 'white':'black' }}>{type}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Sulje" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Button title="Valitse kuva" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={{ marginVertical:16 }}>
        <Button title="Tallenna peli" onPress={handleSave} />
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding:16,
    alignItems:'center',
  },
  input: {
    width:'100%',
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    padding:8,
    marginVertical:6,
  },
  image: {
    width:200,
    height:200,
    marginVertical:10,
    borderRadius:12,
  }
});
