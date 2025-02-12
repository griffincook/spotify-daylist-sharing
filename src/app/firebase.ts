// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAv0pktjTeRRTCJtaaKwbgICPGilAjvHIQ",
  authDomain: "spotify-daylist-sharing.firebaseapp.com",
  projectId: "spotify-daylist-sharing",
  storageBucket: "spotify-daylist-sharing.appspot.com",
  messagingSenderId: "166702937908",
  appId: "1:166702937908:web:9f01348074e2c695dc5761",
  measurementId: "G-L1W7MFSD9K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export const getAllPlaylists = async (groupId: string) => {
  const q = query(collection(db, "playlists"), where("groupId", "==", groupId));

  const playlists: any[] = [];
  const querySnapshot = await getDocs(q);
  console.log("querySnapshot", querySnapshot);
  querySnapshot.forEach((doc) => {
    playlists.push({ id: doc.id, ...doc.data() });
  });

  console.log(playlists);
  return playlists;
};

export const getPlaylist = async (playlistId: string) => {
  const docRef = doc(db, "playlists", playlistId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.log("No such document!");
    return null;
  }
};

export const updatePlaylist = async (playlistId: string, data: any) => {
  const document = getPlaylist(playlistId);
  if (!document) {
    await putPlaylist(data);
  } else {
    await patchPlaylist(playlistId, data);
  }
};

export const patchPlaylist = async (playlistId: string, data: any) => {
  const docRef = doc(db, "playlists", playlistId);
  await updateDoc(docRef, data);
};

export const putPlaylist = async (data: any) => {
  // Add a new document with a generated id.
  const createdAt = new Date();
  await addDoc(collection(db, "playlists"), { ...data, createdAt });
};

export const getAllGroups = async () => {
  const q = query(collection(db, "groups"));

  const groups: any[] = [];
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() });
  });

  return groups;
};

export const getGroup = async (groupId: string): Promise<any> => {
  const docRef = doc(db, "groups", groupId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.log("No such document!");
    return null;
  }
};
