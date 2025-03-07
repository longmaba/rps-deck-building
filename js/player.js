/**
 * Player class to handle player state and actions
 */
class Player {
  /**
   * Create a new player
   * @param {string} name - The player's name
   * @param {number} hp - The player's starting health
   * @param {Deck} deck - The player's deck
   * @param {boolean} isOpponent - Whether this is an opponent player
   */
  constructor(name, hp, deck, isOpponent = false) {
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.gold = 0;
    this.deck = deck.cards;
    this.hand = [];
    this.battleCards = [];
    this.discardPile = [];
    this.isOpponent = isOpponent;

    // Shuffle the deck initially
    this.shuffleDeck();
  }

  /**
   * Shuffle the player's deck
   */
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * Draw a specified number of cards from the deck
   * @param {number} count - Number of cards to draw
   */
  drawCards(count) {
    for (let i = 0; i < count; i++) {
      // If deck is empty, reshuffle discard pile
      if (this.deck.length === 0 && this.discardPile.length > 0) {
        this.deck = [...this.discardPile];
        this.discardPile = [];
        this.shuffleDeck();
      }

      // Draw a card if available
      if (this.deck.length > 0) {
        const card = this.deck.pop();
        this.hand.push(card);
      } else {
        break; // No more cards available
      }
    }
  }

  /**
   * Select a card from hand to play in battle
   * @param {number} handIndex - Index of the card in hand
   * @returns {Card|null} The selected card or null if invalid
   */
  selectCardForBattle(handIndex) {
    if (handIndex < 0 || handIndex >= this.hand.length) {
      return null;
    }

    // Reinstate the 5-card limit for battle cards
    if (this.battleCards.length >= 5) {
      return null;
    }

    const card = this.hand.splice(handIndex, 1)[0];

    // Handle utility cards separately
    if (card.type === "utility") {
      return card; // Return the utility card, but don't add to battle cards
    }

    this.battleCards.push(card);
    return card;
  }

  /**
   * Remove a card from the battle lineup
   * @param {number} battleIndex - Index of the card in battle lineup
   * @returns {Card|null} The removed card or null if invalid
   */
  removeCardFromBattle(battleIndex) {
    if (battleIndex < 0 || battleIndex >= this.battleCards.length) {
      return null;
    }

    const card = this.battleCards.splice(battleIndex, 1)[0];
    this.hand.push(card);
    return card;
  }

  /**
   * Take damage to player's health
   * @param {number} amount - Amount of damage to take
   * @returns {number} The actual damage taken
   */
  takeDamage(amount) {
    const actualDamage = Math.min(this.hp, amount);
    this.hp -= actualDamage;
    return actualDamage;
  }

  /**
   * Heal the player
   * @param {number} amount - Amount to heal
   */
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * Reset after a battle round
   */
  endBattle() {
    // Move all battle cards to discard pile
    this.discardPile.push(...this.battleCards);
    this.battleCards = [];

    // Move remaining hand to discard pile
    this.discardPile.push(...this.hand);
    this.hand = [];
  }

  /**
   * Check if player has enough cards for battle
   * @returns {boolean} True if player has at least 5 cards in deck + discard
   */
  hasEnoughCards() {
    return this.deck.length + this.discardPile.length >= 5;
  }

  /**
   * Check if player is defeated
   * @returns {boolean} True if player's HP is 0 or below
   */
  isDefeated() {
    return this.hp <= 0;
  }

  /**
   * Apply any start-of-turn effects
   */
  startTurn() {
    // Reset card damage to base values
    for (const card of this.hand) {
      card.damage = card.calculateDamage();
    }
  }

  /**
   * Let the AI choose cards for battle (for opponent)
   * @param {Game} game - The game instance
   */
  aiSelectBattleCards(game) {
    if (!this.isOpponent) return;

    // First, use any utility cards
    const utilityCards = this.hand.filter((card) => card.type === "utility");
    for (const card of utilityCards) {
      const index = this.hand.indexOf(card);
      const selectedCard = this.selectCardForBattle(index);
      if (selectedCard) {
        selectedCard.applyUtilityEffect(game, this);
        this.discardPile.push(selectedCard);
      }
    }

    // Simple AI: Choose cards randomly until we have 5 or run out of cards
    while (this.battleCards.length < 5 && this.hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.hand.length);
      this.selectCardForBattle(randomIndex);
    }
  }

  /**
   * Discard only battle cards (keeping hand cards)
   */
  discardBattleCards() {
    // Move battle cards to discard pile
    this.discardPile.push(...this.battleCards);
    this.battleCards = [];
  }
}
