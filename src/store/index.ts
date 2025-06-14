import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import gameStatsReducer from './gameStatsSlice'

// Redux Persist設定
const persistConfig = {
  key: 'mobile-last-war-v2',
  version: 1,
  storage,
  whitelist: ['stats'] // 永続化する状態を指定
}

const persistedGameStatsReducer = persistReducer(persistConfig, gameStatsReducer)

// Store設定
export const store = configureStore({
  reducer: {
    gameStats: persistedGameStatsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

export const persistor = persistStore(store)

// TypeScript型定義
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch