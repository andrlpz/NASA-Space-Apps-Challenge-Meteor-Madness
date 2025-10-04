import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  impactEvent: null,
  showSliders: false,
  showAsteroidList: true,
  diameter: 550,
  velocity: 42,
  selectedAsteroid: null,
  lastActiveMode: 'asteroids', // Nuevo campo para recordar el último modo activo
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
      // Restaurar según el último modo activo
      if (state.lastActiveMode === 'sliders') {
        state.showSliders = true
        state.showAsteroidList = false
      } else {
        state.showSliders = false
        state.showAsteroidList = true
      }
    },
    showSliders: (state) => {
      state.showSliders = true
      state.showAsteroidList = false
      state.lastActiveMode = 'sliders'
      state.impactEvent = null // AGREGAR ESTA LÍNEA - Limpiar impacto al mostrar sliders
      state.selectedAsteroid = null // También limpiar asteroide seleccionado
    },
    hideSliders: (state) => {
      state.showSliders = false
    },
    showAsteroidList: (state) => {
      state.showSliders = false
      state.showAsteroidList = true
      state.lastActiveMode = 'asteroids'
      state.impactEvent = null // AGREGAR ESTA LÍNEA - Limpiar impacto al mostrar asteroides
      state.selectedAsteroid = null // También limpiar asteroide seleccionado
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