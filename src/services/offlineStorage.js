import { openDB } from 'idb';

const DB_NAME = 'selify-offline-db';
const DB_VERSION = 1;
const MESSAGES_STORE = 'offline-messages';
const CHATS_STORE = 'offline-chats';

export const offlineStorage = {
  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create store for offline messages
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          db.createObjectStore(MESSAGES_STORE, { keyPath: 'id', autoIncrement: true });
        }
        // Create store for cached chats
        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          db.createObjectStore(CHATS_STORE, { keyPath: 'chatId' });
        }
      },
    });
  },

  async saveOfflineMessage(message) {
    const db = await this.initDB();
    return db.add(MESSAGES_STORE, {
      ...message,
      status: 'pending',
      timestamp: new Date().toISOString(),
    });
  },

  async getOfflineMessages() {
    const db = await this.initDB();
    return db.getAll(MESSAGES_STORE);
  },

  async removeOfflineMessage(id) {
    const db = await this.initDB();
    return db.delete(MESSAGES_STORE, id);
  },

  async cacheChat(chatId, chatData) {
    const db = await this.initDB();
    return db.put(CHATS_STORE, {
      chatId,
      ...chatData,
      lastUpdated: new Date().toISOString(),
    });
  },

  async getCachedChat(chatId) {
    const db = await this.initDB();
    return db.get(CHATS_STORE, chatId);
  },

  async getCachedChats() {
    const db = await this.initDB();
    return db.getAll(CHATS_STORE);
  },

  async updateCachedChat(chatId, updates) {
    const db = await this.initDB();
    const chat = await this.getCachedChat(chatId);
    if (chat) {
      return db.put(CHATS_STORE, {
        ...chat,
        ...updates,
        lastUpdated: new Date().toISOString(),
      });
    }
  },
};

export default offlineStorage;
