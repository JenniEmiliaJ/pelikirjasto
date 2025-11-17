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

export default function EtsiPeli() {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
