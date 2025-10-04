import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  impactEvent: null,
  showSliders: false,
  showAsteroidList: true,
  diameter: 550,
  velocity: 550,
  selectedAsteroid: null,
}

const impactSlice = createSlice({
  name: 'impact',
  initialState,
  reducers: {
    setImpactEvent: (state, action) => {
      state.impactEvent = action.payload
    },
    resetImpact: (state) => {
      state.impactEvent = null
      state.selectedAsteroid = null
      state.showAsteroidList = true
      state.showSliders = false
    },
    showSliders: (state) => {
      state.showSliders = true
      state.showAsteroidList = false
    },
    hideSliders: (state) => {
      state.showSliders = false
    },
    showAsteroidList: (state) => {
      state.showSliders = false
      state.showAsteroidList = true
    },
    hideAsteroidList: (state) => {
      state.showAsteroidList = false
    },
    setDiameter: (state, action) => {
      state.diameter = action.payload
    },
    setVelocity: (state, action) => {
      state.velocity = action.payload
    },
    setSelectedAsteroid: (state, action) => {
      state.selectedAsteroid = action.payload
    },
  },
})

export const {
  setImpactEvent,
  resetImpact,
  showSliders,
  hideSliders,
  showAsteroidList,
  hideAsteroidList,
  setDiameter,
  setVelocity,
  setSelectedAsteroid,
} = impactSlice.actions

export default impactSlice.reducer