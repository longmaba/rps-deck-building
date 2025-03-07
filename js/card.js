/**
 * Card class to represent a playing card in the game
 */
class Card {
  /**
   * Creates a new card
   * @param {string} type - 'rock', 'paper', 'scissors', or 'utility'
   * @param {string} variant - 'plain', 'foil', 'steel', 'golden', or 'holo'
   */
  constructor(type, variant) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.type = type;
    this.variant = variant;
    this.baseDamage = 1;
    this.damage = this.calculateDamage();
    this.effect = this.getEffect();
    this.symbol = this.getSymbol();
    this.description = this.getDescription();
    this.element = null;
  }

  /**
   * Calculate the damage value based on card variant
   * @returns {number} The card's damage value
   */
  calculateDamage() {
    switch (this.variant) {
      case "foil":
        return this.baseDamage + 1;
      default:
        return this.baseDamage;
    }
  }

  /**
   * Get the card's effect description
   * @returns {string} Description of the card's effect
   */
  getEffect() {
    if (this.type === "utility") {
      switch (this.variant) {
        case "redraw":
          return "Discard your hand and draw 7 new cards";
        case "banish":
          return "Remove one of the opponent's cards from their hand this turn";
        case "buff":
          return "Increase all your cards' damage by 1 for this turn";
        case "swap":
          return "Trade one card in your hand with one from your deck";
        default:
          return "One-time effect";
      }
    }

    switch (this.variant) {
      case "plain":
        return "No additional effect";
      case "foil":
        return "Deals +1 damage if it wins";
      case "steel":
        return "Reduces damage taken by 1 if it loses";
      case "golden":
        return "Gain 1 gold if it wins";
      case "holo":
        return `All ${this.type} cards in hand gain +1 damage this turn`;
      default:
        return "Unknown effect";
    }
  }

  /**
   * Get the symbol representing the card type
   * @returns {string} Symbol for the card
   */
  getSymbol() {
    switch (this.type) {
      case "rock":
        return "✊";
      case "paper":
        return "✋";
      case "scissors":
        return "✌";
      case "utility":
        switch (this.variant) {
          case "redraw":
            return "🔄";
          case "banish":
            return "❌";
          case "buff":
            return "💪";
          case "swap":
            return "🔄";
          default:
            return "🔧";
        }
      default:
        return "❓";
    }
  }

  /**
   * Get a readable description of the card
   * @returns {string} Card description
   */
  getDescription() {
    if (this.type === "utility") {
      return this.variant.charAt(0).toUpperCase() + this.variant.slice(1);
    }

    return `${this.variant.charAt(0).toUpperCase() + this.variant.slice(1)} ${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
  }

  /**
   * Apply card effect during battle
   * @param {Game} game - The game instance
   * @param {Player} owner - The card owner (player or opponent)
   * @param {boolean} isWinner - Whether this card won its comparison
   */
  applyEffect(game, owner, isWinner) {
    // Skip utility cards as they are applied immediately when selected
    if (this.type === "utility") return;

    if (this.variant === "golden" && isWinner) {
      if (owner === game.player) {
        game.player.gold += 1;
        if (game.ui) {
          game.ui.updatePlayerStats();
          game.ui.showMessage(`You gained 1 gold from ${this.description}`);
        }
      }
    }

    // Steel effect is applied during damage calculation
    // Holo effects are applied at the beginning of the comparison phase
  }

  /**
   * Apply utility card effect
   * @param {Game} game - The game instance
   * @param {Player} owner - The card owner (player or opponent)
   */
  applyUtilityEffect(game, owner) {
    if (this.type !== "utility") return;

    switch (this.variant) {
      case "redraw":
        // Discard current hand and draw new cards
        owner.hand = [];
        owner.drawCards(7);
        if (game.ui) {
          game.ui.updateHand();
          game.ui.showMessage("Your hand has been redrawn");
        }
        break;
      case "banish":
        // For simplicity in this implementation, randomly remove an opponent card
        if (owner === game.player && game.opponent.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * game.opponent.hand.length);
          game.opponent.hand.splice(randomIndex, 1);
          if (game.ui) {
            game.ui.showMessage("Banished one card from opponent's hand");
          }
        }
        break;
      case "buff":
        // Increase all battle cards' damage by 1 for this turn
        for (const card of owner.battleCards) {
          card.damage += 1;
        }
        if (game.ui) {
          game.ui.showMessage("All your battle cards' damage increased by 1");
        }
        break;
      case "swap":
        // For simplicity, add a random card from deck to hand
        if (owner.deck.length > 0) {
          const randomIndex = Math.floor(Math.random() * owner.deck.length);
          const newCard = owner.deck.splice(randomIndex, 1)[0];
          owner.hand.push(newCard);
          if (game.ui) {
            game.ui.updateHand();
            game.ui.showMessage(`Swapped for a ${newCard.description}`);
          }
        }
        break;
    }
  }

  /**
   * Apply holo card effect at the start of battle
   * @param {Game} game - The game instance
   * @param {Player} owner - The card owner (player or opponent)
   */
  applyHoloEffect(game, owner) {
    if (this.variant !== "holo") return;

    // Boost all cards of the same type in owner's hand and battle cards
    const targetType = this.type;
    const cardsToBoost = [...owner.hand, ...owner.battleCards].filter((card) => card.type === targetType);

    for (const card of cardsToBoost) {
      if (card.id !== this.id) {
        // Don't boost self
        card.damage += 1;
      }
    }

    if (game.ui) {
      game.ui.showMessage(`Holo effect: All ${targetType} cards gain +1 damage`);
    }
  }

  /**
   * Determine if this card beats another card in a comparison
   * @param {Card} otherCard - The card to compare against
   * @returns {boolean|null} True if this card wins, false if it loses, null if it's a tie
   */
  beats(otherCard) {
    // Handle undefined card
    if (!otherCard) {
      return null;
    }

    // Utility cards can't be compared
    if (this.type === "utility" || otherCard.type === "utility") {
      return null;
    }

    if (this.type === otherCard.type) {
      return null; // Tie
    }

    if (this.type === "rock" && otherCard.type === "scissors") {
      return true;
    }

    if (this.type === "scissors" && otherCard.type === "paper") {
      return true;
    }

    if (this.type === "paper" && otherCard.type === "rock") {
      return true;
    }

    return false;
  }

  /**
   * Create a DOM element for this card
   * @returns {HTMLElement} The card's DOM element
   */
  createElement() {
    const cardElement = document.createElement("div");
    cardElement.className = `card ${this.type} ${this.variant}`;
    cardElement.dataset.id = this.id;

    // Add title attribute for tooltip with variant description
    cardElement.title = `${this.description} - ${this.effect}`;

    // Create header with damage value only (for non-utility cards)
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    if (this.type !== "utility") {
      const cardDamage = document.createElement("div");
      cardDamage.className = "card-damage";
      cardDamage.textContent = this.damage;
      cardHeader.appendChild(cardDamage);
    }

    // Main card content showing the symbol
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.textContent = this.symbol;

    // Add all elements to the card
    cardElement.appendChild(cardHeader);
    cardElement.appendChild(cardContent);

    this.element = cardElement;
    return cardElement;
  }
}
