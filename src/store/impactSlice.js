import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  impactEvent: null,
  showSliders: false,
  showAsteroidList: true,
  diameter: 550,
  velocity: 42,
  selectedAsteroid: null,
  lastActiveMode: 'asteroids', // Nuevo campo para recordar el último modo activo
  is3DMap: true, // Track whether we're showing 3D or 2D map
  currentZoomLevel: 2, // Track current zoom level
  previousZoomLevel: 2, // Track previous zoom level to determine direction
  zoomThresholdFor2D: 3.5, // Zoom level to switch to 2D map (higher zoom = more detailed view)
  zoomThresholdFor3D: 3.5, // Zoom level to switch back to 3D map (lower zoom = global view)
  showModeChangeNotification: false, // Show notification when mode changes automatically
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
    toggleMapMode: (state) => {
      state.is3DMap = !state.is3DMap
    },
    updateZoomLevel: (state, action) => {
      const newZoomLevel = action.payload
      const previousZoomLevel = state.currentZoomLevel
      state.previousZoomLevel = previousZoomLevel
      state.currentZoomLevel = newZoomLevel
      
      // Determine zoom direction
      const isZoomingIn = newZoomLevel > previousZoomLevel
      const isZoomingOut = newZoomLevel < previousZoomLevel
      
      // Directional auto-switching logic
      if (state.is3DMap && isZoomingIn && newZoomLevel >= state.zoomThresholdFor2D) {
        // Switch from 3D to 2D only when zooming IN
        state.is3DMap = false
        state.showModeChangeNotification = true
      } else if (!state.is3DMap && isZoomingOut && newZoomLevel <= state.zoomThresholdFor3D) {
        // Switch from 2D to 3D only when zooming OUT
        state.is3DMap = true
        state.showModeChangeNotification = true
      }
    },
    setZoomThresholds: (state, action) => {
      const { for2D, for3D } = action.payload
      state.zoomThresholdFor2D = for2D
      state.zoomThresholdFor3D = for3D
    },
    setMapMode: (state, action) => {
      state.is3DMap = action.payload
    },
    hideNotification: (state) => {
      state.showModeChangeNotification = false
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
  toggleMapMode,
  updateZoomLevel,
  setZoomThresholds,
  setMapMode,
  hideNotification,
} = impactSlice.actions

export default impactSlice.reducer