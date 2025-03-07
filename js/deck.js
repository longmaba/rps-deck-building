/**
 * Deck class for managing a collection of cards
 */
class Deck {
  /**
   * Create a new deck
   */
  constructor() {
    this.cards = [];
  }

  /**
   * Add a card to the deck
   * @param {Card} card - The card to add
   */
  addCard(card) {
    this.cards.push(card);
  }

  /**
   * Create a standard starting deck (5 of each type)
   * @returns {Deck} The created deck
   */
  static createStarterDeck() {
    const deck = new Deck();

    // Add 5 Rock cards
    deck.addCard(new Card("rock", "plain"));
    deck.addCard(new Card("rock", "foil"));
    deck.addCard(new Card("rock", "steel"));
    deck.addCard(new Card("rock", "golden"));
    deck.addCard(new Card("rock", "holo"));

    // Add 5 Paper cards
    deck.addCard(new Card("paper", "plain"));
    deck.addCard(new Card("paper", "foil"));
    deck.addCard(new Card("paper", "steel"));
    deck.addCard(new Card("paper", "golden"));
    deck.addCard(new Card("paper", "holo"));

    // Add 5 Scissors cards
    deck.addCard(new Card("scissors", "plain"));
    deck.addCard(new Card("scissors", "foil"));
    deck.addCard(new Card("scissors", "steel"));
    deck.addCard(new Card("scissors", "golden"));
    deck.addCard(new Card("scissors", "holo"));

    // Add 5 Utility cards
    deck.addCard(new Card("utility", "redraw"));
    deck.addCard(new Card("utility", "banish"));
    deck.addCard(new Card("utility", "buff"));
    deck.addCard(new Card("utility", "swap"));
    deck.addCard(new Card("utility", "redraw")); // Second redraw card for simplicity

    return deck;
  }

  /**
   * Create a random opponent deck
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   * @returns {Deck} The created opponent deck
   */
  static createOpponentDeck(difficulty = "easy") {
    const deck = new Deck();
    const types = ["rock", "paper", "scissors"];
    const variants = ["plain", "foil", "steel", "golden", "holo"];
    const utilityVariants = ["redraw", "banish", "buff", "swap"];

    // Number of cards based on difficulty
    let cardCount = 20;
    if (difficulty === "medium") cardCount = 25;
    if (difficulty === "hard") cardCount = 30;

    // Basic distribution ratio
    let rockRatio = 0.33;
    let paperRatio = 0.33;
    let scissorsRatio = 0.34;
    let utilityRatio = 0.2; // Proportion of the deck that will be utility cards

    // Modify distribution based on difficulty
    if (difficulty === "medium" || difficulty === "hard") {
      // Bias the deck toward a particular strategy based on a random choice
      const bias = Math.floor(Math.random() * 3);

      if (bias === 0) {
        rockRatio = 0.5;
        paperRatio = 0.25;
        scissorsRatio = 0.25;
      } else if (bias === 1) {
        rockRatio = 0.25;
        paperRatio = 0.5;
        scissorsRatio = 0.25;
      } else {
        rockRatio = 0.25;
        paperRatio = 0.25;
        scissorsRatio = 0.5;
      }

      // Increase utility cards for harder difficulties
      utilityRatio = difficulty === "medium" ? 0.25 : 0.3;
    }

    // Calculate card distribution
    const utilityCount = Math.floor(cardCount * utilityRatio);
    const remainingCount = cardCount - utilityCount;
    const rockCount = Math.floor(remainingCount * rockRatio);
    const paperCount = Math.floor(remainingCount * paperRatio);
    const scissorsCount = remainingCount - rockCount - paperCount;

    // Add Rock cards
    for (let i = 0; i < rockCount; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      deck.addCard(new Card("rock", variant));
    }

    // Add Paper cards
    for (let i = 0; i < paperCount; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      deck.addCard(new Card("paper", variant));
    }

    // Add Scissors cards
    for (let i = 0; i < scissorsCount; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      deck.addCard(new Card("scissors", variant));
    }

    // Add Utility cards
    for (let i = 0; i < utilityCount; i++) {
      const variant = utilityVariants[Math.floor(Math.random() * utilityVariants.length)];
      deck.addCard(new Card("utility", variant));
    }

    return deck;
  }

  /**
   * Shuffle the deck
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Draw a card from the deck
   * @returns {Card|null} The drawn card or null if the deck is empty
   */
  drawCard() {
    if (this.cards.length === 0) {
      return null;
    }
    return this.cards.pop();
  }

  /**
   * Draw multiple cards from the deck
   * @param {number} count - The number of cards to draw
   * @returns {Card[]} The drawn cards
   */
  drawCards(count) {
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) {
        drawnCards.push(card);
      } else {
        break; // Stop if the deck is empty
      }
    }
    return drawnCards;
  }

  /**
   * Get the number of remaining cards in the deck
   * @returns {number} The number of cards
   */
  get size() {
    return this.cards.length;
  }

  /**
   * Check if the deck is empty
   * @returns {boolean} True if the deck is empty
   */
  isEmpty() {
    return this.cards.length === 0;
  }
}
