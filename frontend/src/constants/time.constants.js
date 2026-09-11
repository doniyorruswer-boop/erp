/**
 * EduHub Timeouts, Durations & Debounce Constants
 * Eliminates magic numbers from timer delays, timeouts, and UI transitions.
 */

export const TIME_CONSTANTS = {
  API_TIMEOUT: 8000,
  TOAST_DURATION: {
    DEFAULT: 4500,
    INFO: 4500,
    WARNING: 5000,
    ERROR: 6000,
    SHORT: 2500,
  },
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    INPUT: 400,
    RESIZE: 150,
  },
  ALERT_AUTO_DISMISS: 4000,
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  SIMULATION_DELAY: 800,
};

export default TIME_CONSTANTS;
