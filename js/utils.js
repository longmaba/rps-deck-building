/**
 * Utility functions for the game
 */

/**
 * Delay execution by a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} A promise that resolves after the delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} A random integer
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate damage with modifiers (e.g., steel cards reduce damage)
 * @param {number} baseDamage - The base damage amount
 * @param {Card} attackingCard - The card dealing damage
 * @param {Card} defendingCard - The card receiving damage
 * @returns {number} The final damage amount
 */
function calculateDamage(baseDamage, attackingCard, defendingCard) {
  let damage = baseDamage;

  // Apply steel card effect - reduce damage by 1 if defending card is steel
  if (defendingCard.variant === "steel") {
    damage = Math.max(0, damage - 1);
  }

  return damage;
}

/**
 * Determine the winner in a Rock-Paper-Scissors comparison
 * @param {Card} card1 - The first card
 * @param {Card} card2 - The second card
 * @returns {string|null} 'card1', 'card2', or null for a tie
 */
function determineWinner(card1, card2) {
  // Handle undefined cards
  if (!card1 || !card2) {
    return null;
  }

  const result = card1.beats(card2);

  if (result === true) {
    return "card1";
  } else if (result === false) {
    return "card2";
  } else {
    return null; // Tie
  }
}

/**
 * Format a number with a plus sign if positive
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num > 0 ? `+${num}` : `${num}`;
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random ID
 * @returns {string} A random ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
