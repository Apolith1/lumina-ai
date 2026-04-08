import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  getDocFromServer
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Chat, Message, GalleryItem } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  async saveChat(chat: Chat) {
    const path = `chats/${chat.id}`;
    try {
      await setDoc(doc(db, 'chats', chat.id), {
        ...chat,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getChats(userId: string) {
    const path = 'chats';
    try {
      const q = query(
        collection(db, 'chats'), 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Chat);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    const path = 'chats';
    const q = query(
      collection(db, 'chats'), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => doc.data() as Chat);
      callback(chats);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async deleteChat(chatId: string) {
    const path = `chats/${chatId}`;
    try {
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async saveGalleryItem(item: GalleryItem) {
    const path = `gallery/${item.id}`;
    try {
      await setDoc(doc(db, 'gallery', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getGalleryItems(userId: string) {
    const path = 'gallery';
    try {
      const q = query(
        collection(db, 'gallery'), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as GalleryItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveUser(user: any) {
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Date.now()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToMemory(userId: string, callback: (facts: string[]) => void) {
    const path = `users/${userId}/memory/data`;
    return onSnapshot(doc(db, 'users', userId, 'memory', 'data'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().facts || []);
      } else {
        callback([]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async addUserMemory(userId: string, newFacts: string[]) {
    if (!newFacts || newFacts.length === 0) return;
    const path = `users/${userId}/memory/data`;
    try {
      const docRef = doc(db, 'users', userId, 'memory', 'data');
      const docSnap = await getDoc(docRef);
      let existingFacts: string[] = [];
      if (docSnap.exists()) {
        existingFacts = docSnap.data().facts || [];
      }
      const updatedFacts = Array.from(new Set([...existingFacts, ...newFacts]));
      await setDoc(docRef, { facts: updatedFacts }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
