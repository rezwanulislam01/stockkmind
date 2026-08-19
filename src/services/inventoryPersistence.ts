import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, PurchaseOrder, AIActionItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ACTION_QUEUE, INITIAL_PURCHASE_ORDERS } from '../data/mockInventory';

/**
 * Initializes or seeds user inventory data if user's store is empty
 */
export async function initializeUserInventory(userId: string) {
  const path = `users/${userId}/products`;
  try {
    const productsColl = collection(db, 'users', userId, 'products');
    const snap = await getDocs(productsColl);

    if (snap.empty) {
      console.log('Seeding initial inventory for user', userId);
      const batch = writeBatch(db);

      // 1. Seed Products
      INITIAL_PRODUCTS.forEach((product) => {
        const prodRef = doc(db, 'users', userId, 'products', product.id);
        batch.set(prodRef, { ...product, userId });
      });

      // 2. Seed Purchase Orders
      INITIAL_PURCHASE_ORDERS.forEach((po) => {
        const poRef = doc(db, 'users', userId, 'purchaseOrders', po.id);
        batch.set(poRef, { ...po, userId });
      });

      // 3. Seed Action Queue
      INITIAL_ACTION_QUEUE.forEach((action) => {
        const actionRef = doc(db, 'users', userId, 'actionQueue', action.id);
        batch.set(actionRef, { ...action, userId });
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes in real-time to user's Products collection
 */
export function subscribeToUserProducts(
  userId: string,
  onUpdate: (products: Product[]) => void
) {
  const path = `users/${userId}/products`;
  const coll = collection(db, 'users', userId, 'products');

  return onSnapshot(
    coll,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((docSnap) => {
        prods.push(docSnap.data() as Product);
      });
      if (prods.length > 0) {
        onUpdate(prods);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes in real-time to user's Purchase Orders collection
 */
export function subscribeToUserPurchaseOrders(
  userId: string,
  onUpdate: (orders: PurchaseOrder[]) => void
) {
  const path = `users/${userId}/purchaseOrders`;
  const coll = collection(db, 'users', userId, 'purchaseOrders');

  return onSnapshot(
    coll,
    (snapshot) => {
      const pos: PurchaseOrder[] = [];
      snapshot.forEach((docSnap) => {
        pos.push(docSnap.data() as PurchaseOrder);
      });
      if (pos.length > 0) {
        onUpdate(pos);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes in real-time to user's AI Action Queue collection
 */
export function subscribeToUserActionQueue(
  userId: string,
  onUpdate: (actions: AIActionItem[]) => void
) {
  const path = `users/${userId}/actionQueue`;
  const coll = collection(db, 'users', userId, 'actionQueue');

  return onSnapshot(
    coll,
    (snapshot) => {
      const actions: AIActionItem[] = [];
      snapshot.forEach((docSnap) => {
        actions.push(docSnap.data() as AIActionItem);
      });
      if (actions.length > 0) {
        onUpdate(actions);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Saves or updates a product in Firestore
 */
export async function saveProductToFirestore(userId: string, product: Product) {
  const path = `users/${userId}/products/${product.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'products', product.id);
    await setDoc(docRef, { ...product, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves or updates a Purchase Order in Firestore
 */
export async function savePurchaseOrderToFirestore(userId: string, po: PurchaseOrder) {
  const path = `users/${userId}/purchaseOrders/${po.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'purchaseOrders', po.id);
    await setDoc(docRef, { ...po, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates an Action Queue item status in Firestore
 */
export async function updateActionInFirestore(userId: string, action: AIActionItem) {
  const path = `users/${userId}/actionQueue/${action.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'actionQueue', action.id);
    await setDoc(docRef, { ...action, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
