import { configureStore } from '@reduxjs/toolkit'
import impactReducer from './impactSlice'

export const store = configureStore({
  reducer: {
    impact: impactReducer,
  },
})