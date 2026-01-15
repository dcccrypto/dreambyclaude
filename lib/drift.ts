/**
 * Drift management for the story
 * Drift starts at 0 and gradually increases, with occasional reductions when too high
 */

const DRIFT_INCREMENT_MIN = 0.02
const DRIFT_INCREMENT_MAX = 0.05
const DRIFT_THRESHOLD = 0.8
const DRIFT_REDUCTION_MIN = 0.1
const DRIFT_REDUCTION_MAX = 0.2

/**
 * Calculate the next drift level
 * @param currentDrift Current drift level
 * @returns New drift level
 */
export function calculateNextDrift(currentDrift: number): number {
  // If drift is too high, reduce it (but never to zero)
  if (currentDrift > DRIFT_THRESHOLD) {
    const reduction = 
      DRIFT_REDUCTION_MIN + 
      Math.random() * (DRIFT_REDUCTION_MAX - DRIFT_REDUCTION_MIN)
    const newDrift = Math.max(0.1, currentDrift - reduction)
    return Math.round(newDrift * 100) / 100 // Round to 2 decimal places
  }
  
  // Otherwise, increment drift gradually
  const increment = 
    DRIFT_INCREMENT_MIN + 
    Math.random() * (DRIFT_INCREMENT_MAX - DRIFT_INCREMENT_MIN)
  const newDrift = currentDrift + increment
  return Math.round(newDrift * 100) / 100 // Round to 2 decimal places
}

/**
 * Get drift description for Claude prompt
 * @param drift Current drift level
 * @returns Description string
 */
export function getDriftDescription(drift: number): string {
  if (drift < 0.2) {
    return "very low (realistic, grounded)"
  } else if (drift < 0.4) {
    return "low (mostly realistic with subtle oddities)"
  } else if (drift < 0.6) {
    return "moderate (noticeable dreamlike elements)"
  } else if (drift < 0.8) {
    return "high (strongly dreamlike, surreal)"
  } else {
    return "very high (deeply surreal, dream logic)"
  }
}
