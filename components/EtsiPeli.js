import { StyleSheet, Text, View, Image, FlatList, Alert } from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebaseConfig';

const database = getDatabase(app);

export default function EtsiPeli({ navigation }) {
  const { colors } = useTheme();
  const [pelit, setPelit] = useState([]);
  const [listaus, setListaus] = useState([]);
  const [nimi, setNimi] = useState('');
  const [pelaajat, setPelaajat] = useState('');
  const [kesto, setKesto] = useState('');

  // Hae pelit Firebase:sta
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
        setListaus(lisatytPelit);
      } else {
        setPelit([]);
        setListaus([]);
      }
    });
  }, []);

  const hae = () => {
    if (!pelit) return;

    const tulos = pelit.filter((peli) => {
      const peliNimi = peli.pelinNimi || '';
      const minP = Number(peli.minPelaajat) || 0;
      const maxP = Number(peli.maxPelaajat) || 100;
      const minK = Number(peli.minKesto) || 0;
      const maxK = Number(peli.maxKesto) || 1000;

      const nimiOk =
        peliNimi === '' || peliNimi.toUpperCase().includes(nimi.toUpperCase());
      const pelaajatOk =
        pelaajat === '' ||
        (Number(pelaajat) >= minP && Number(pelaajat) <= maxP);
      const kestoOk =
        kesto === '' || (Number(kesto) >= minK && Number(kesto) <= maxK);

      return nimiOk && pelaajatOk && kestoOk;
    });

    if (tulos.length === 0) {
      Alert.alert('Info', 'Ei tuloksia hakuehdoilla');
    }

    setListaus(tulos);
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
            <Text style={styles.title}>{item.pelinNimi || '-'}</Text>
            <Text style={styles.text}>
              Tyyppi:{' '}
              {Array.isArray(item.pelinTyyppi)
                ? item.pelinTyyppi.join(', ')
                : item.pelinTyyppi || '-'}
            </Text>
            <Text style={styles.text}>
              Pelaajia: {item.minPelaajat || '-'}–{item.maxPelaajat || '-'}
            </Text>
            <Text style={styles.text}>
              Kesto: {item.minKesto || '-'}–{item.maxKesto || '-'} min
            </Text>
            <Text style={styles.text}>
              Omistaja:{' '}
              {Array.isArray(item.omistaja)
                ? item.omistaja.join(', ')
                : item.omistaja || '-'}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={listaus}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
                color: '#fff',
              }}
            >
              Hae pelejä usealla ehdolla
            </Text>

            {/* Syöttökentät */}
            <TextInput
              label="Pelin nimi"
              value={nimi}
              onChangeText={setNimi}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Pelaajamäärä"
              value={pelaajat}
              onChangeText={setPelaajat}
              keyboardType="numeric"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Kesto (min)"
              value={kesto}
              onChangeText={setKesto}
              keyboardType="numeric"
              style={{ marginBottom: 12 }}
            />

            <Button mode="contained" onPress={hae} style={{ marginBottom: 16 }}>
              Hae
            </Button>

            {/* Jos ei tuloksia */}
            {listaus.length === 0 && (
              <Text
                style={{ color: '#fff', textAlign: 'center', marginTop: 16 }}
              >
                Ei tuloksia
              </Text>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
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
  placeholder: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  text: {
    marginBottom: 2,
  },
});
