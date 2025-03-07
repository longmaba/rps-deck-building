/**
 * Opponent class extending Player with AI functionality
 */
class Opponent extends Player {
  /**
   * Create a new opponent
   * @param {string} name - The opponent's name
   * @param {number} hp - The opponent's starting health
   * @param {Deck} deck - The opponent's deck
   * @param {string} difficulty - The difficulty level ('easy', 'medium', 'hard')
   */
  constructor(name, hp, deck, difficulty = "easy") {
    super(name, hp, deck, true);
    this.difficulty = difficulty;
    this.bias = this.determineBias();
  }

  /**
   * Determine the opponent's bias towards certain card types
   * @returns {string} The biased card type ('rock', 'paper', 'scissors', or 'balanced')
   */
  determineBias() {
    const types = ["rock", "paper", "scissors", "balanced"];
    const biasIndex = Math.floor(Math.random() * types.length);
    return types[biasIndex];
  }

  /**
   * AI implementation for selecting cards for battle
   * More sophisticated than the base Player class implementation
   * @param {Game} game - The game instance
   */
  aiSelectBattleCards(game) {
    // First, process utility cards (same as base class)
    const utilityCards = this.hand.filter((card) => card.type === "utility");
    for (const card of utilityCards) {
      const index = this.hand.indexOf(card);
      const selectedCard = this.selectCardForBattle(index);
      if (selectedCard) {
        selectedCard.applyUtilityEffect(game, this);
        this.discardPile.push(selectedCard);
      }
    }

    // Score each card based on type, variant, and difficulty/bias
    const scoredCards = this.hand.map((card) => {
      let score = 0;

      // Base score by variant
      switch (card.variant) {
        case "holo":
          score += 5;
          break;
        case "golden":
          score += 4;
          break;
        case "foil":
          score += 3;
          break;
        case "steel":
          score += 2;
          break;
        case "plain":
          score += 1;
          break;
      }

      // Bias score by type
      if (this.bias !== "balanced") {
        if (card.type === this.bias) {
          score += 2;
        }
      }

      // In medium/hard difficulty, try to counter player's cards from last round
      if (this.difficulty !== "easy" && game.playerLastBattleTypes) {
        // Count player's last battle types
        const typeCount = {};
        for (const type of game.playerLastBattleTypes) {
          typeCount[type] = (typeCount[type] || 0) + 1;
        }

        // Score cards that would beat the most common type
        const mostCommonType = Object.keys(typeCount).reduce((a, b) => (typeCount[a] > typeCount[b] ? a : b), Object.keys(typeCount)[0]);

        if (mostCommonType === "rock" && card.type === "paper") {
          score += 3;
        } else if (mostCommonType === "paper" && card.type === "scissors") {
          score += 3;
        } else if (mostCommonType === "scissors" && card.type === "rock") {
          score += 3;
        }
      }

      return { card, score, index: this.hand.indexOf(card) };
    });

    // Sort by score (highest first)
    scoredCards.sort((a, b) => b.score - a.score);

    // Select up to 5 cards for battle based on scores
    for (let i = 0; i < Math.min(5, scoredCards.length); i++) {
      // Get the real current index of the card (since it changes after each selection)
      const currentIndex = this.hand.indexOf(scoredCards[i].card);
      if (currentIndex !== -1) {
        this.selectCardForBattle(currentIndex);
      }
    }

    // If we still don't have 5 cards, select randomly from what's left
    while (this.battleCards.length < 5 && this.hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.hand.length);
      this.selectCardForBattle(randomIndex);
    }
  }

  /**
   * Create an opponent with a predefined name and strategy
   * @param {number} level - The opponent level (determines difficulty)
   * @returns {Opponent} A new opponent
   */
  static createOpponent(level) {
    const names = [
      "Rookie Randy",
      "Beginner Betty",
      "Novice Nancy", // Easy
      "Average Alex",
      "Mediocre Mike",
      "Standard Sally", // Medium
      "Expert Edward",
      "Pro Paula",
      "Master Morgan", // Hard
    ];

    let difficulty = "easy";
    let hp = 15;

    if (level >= 4 && level <= 6) {
      difficulty = "medium";
      hp = 20;
    } else if (level >= 7) {
      difficulty = "hard";
      hp = 25;
    }

    // Pick a name based on level
    const nameIndex = Math.min(level - 1, names.length - 1);
    const name = names[nameIndex];

    // Create the opponent's deck
    const deck = Deck.createOpponentDeck(difficulty);

    return new Opponent(name, hp, deck, difficulty);
  }
}
