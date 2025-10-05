import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  country: null,
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
  zoomThresholdFor3D: 2, // Zoom level to switch back to 3D map (lower zoom = global view)
  showModeChangeNotification: false, // Show notification when mode changes automatically
  showAsteroidSelectionNotification: false, // Show notification when user tries to simulate without selecting asteroid
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

      // Re-enable automatic switching with safer conditions
      // Only switch when crossing thresholds in the direction of zoom
      
      // Switch to 2D only when zooming in past the threshold
      if (
        state.is3DMap &&
        previousZoomLevel < state.zoomThresholdFor2D &&
        newZoomLevel >= state.zoomThresholdFor2D &&
        newZoomLevel > previousZoomLevel
      ) {
        state.is3DMap = false
      }
      // Switch to 3D only when zooming out past the threshold
      else if (
        !state.is3DMap &&
        previousZoomLevel > state.zoomThresholdFor3D &&
        newZoomLevel <= state.zoomThresholdFor3D &&
        newZoomLevel < previousZoomLevel
      ) {
        state.is3DMap = true
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
    showAsteroidSelectionNotification: (state) => {
      state.showAsteroidSelectionNotification = true
    },
    hideAsteroidSelectionNotification: (state) => {
      state.showAsteroidSelectionNotification = false
    },
    setCountry: (state, action) => {
      state.country = action.payload
    },
    loadStateFromURL: (state, action) => {
      const urlState = action.payload
      
      // Apply URL state to current state
      if (urlState.is3DMap !== undefined) {
        state.is3DMap = urlState.is3DMap
      }
      
      if (urlState.impactType === 'custom') {
        state.showSliders = true
        state.showAsteroidList = false
        state.lastActiveMode = 'sliders'
        state.diameter = urlState.customDiameter
        state.velocity = urlState.customVelocity
      } else if (urlState.impactType === 'asteroid') {
        state.showSliders = false
        state.showAsteroidList = false  // Hide asteroid list since one is already selected from URL
        state.lastActiveMode = 'asteroids'
        // The actual asteroid selection will be handled in the component
        // after the asteroid list is loaded
      }
    },
    restoreImpactFromURL: (state, action) => {
      const { impactEvent, selectedAsteroid } = action.payload
      
      if (impactEvent) {
        state.impactEvent = impactEvent
      }
      
      if (selectedAsteroid) {
        state.selectedAsteroid = selectedAsteroid
      }
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
  showAsteroidSelectionNotification,
  hideAsteroidSelectionNotification,
  setCountry,
  loadStateFromURL,
  restoreImpactFromURL,
} = impactSlice.actions

export default impactSlice.reducer