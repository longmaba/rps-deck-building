/**
 * Main Game class that manages the game state and logic
 */
class Game {
  /**
   * Create a new game instance
   */
  constructor() {
    // Game state
    this.phase = "preparation"; // 'preparation' or 'comparison'
    this.currentOpponentLevel = 1;
    this.playerLastBattleTypes = []; // For opponent AI to adapt

    // Create UI first
    this.ui = new UI(this);

    // Initialize player and opponent
    this.initializeGame();
  }

  /**
   * Initialize the game with a new player and opponent
   */
  initializeGame() {
    // Create player with starting deck
    const playerDeck = Deck.createStarterDeck();
    this.player = new Player("Player", 20, playerDeck);

    // Create first opponent
    this.opponent = Opponent.createOpponent(this.currentOpponentLevel);

    // Initial draw
    this.startNewTurn();
  }

  /**
   * Start a new turn (preparation phase)
   */
  startNewTurn() {
    this.phase = "preparation";

    // Reset all card effects
    this.player.startTurn();
    this.opponent.startTurn();

    // Calculate how many cards each player needs to draw to reach 7
    const playerCardsToDraw = Math.max(0, 7 - this.player.hand.length);
    const opponentCardsToDraw = Math.max(0, 7 - this.opponent.hand.length);

    // Draw cards
    this.player.drawCards(playerCardsToDraw);
    this.opponent.drawCards(opponentCardsToDraw);

    // Have opponent choose their cards
    this.opponent.aiSelectBattleCards(this);

    // Update UI if it exists
    if (this.ui) {
      // First update opponent stats to ensure deck information is current
      this.ui.updateOpponentStats();

      // Then update everything else
      this.ui.updateAll();
      this.ui.showMessage("Preparation phase: Select cards for battle");
    }
  }

  /**
   * Start the comparison phase
   */
  startComparison() {
    // Allow battle with any number of cards in hand
    // Empty slots will count as automatic losses

    // Try to have opponent select as many cards as possible from their hand
    while (this.opponent.battleCards.length < 5 && this.opponent.hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.opponent.hand.length);
      this.opponent.selectCardForBattle(randomIndex);
    }

    // Proceed with battle even if players have fewer than 5 cards
    this.phase = "comparison";

    // Disable both buttons during comparison phase
    this.ui.elements.startBattleBtn.disabled = true;
    this.ui.elements.endTurnBtn.disabled = true;

    this.ui.updateButtons();
    this.ui.updateOpponentCards();
    this.ui.showMessage("Comparison phase: Cards will be compared one by one");

    // Start comparisons with a slight delay for effect
    setTimeout(() => this.runComparisons(), 1000);
  }

  /**
   * Run the comparisons between player and opponent cards
   */
  async runComparisons() {
    const results = [];

    // Apply holo effects before comparisons
    for (const card of [...this.player.battleCards, ...this.opponent.battleCards]) {
      if (card.variant === "holo") {
        const owner = this.player.battleCards.includes(card) ? this.player : this.opponent;
        card.applyHoloEffect(this, owner);
      }
    }

    // Store player card types for opponent AI in future rounds
    this.playerLastBattleTypes = this.player.battleCards.map((card) => card.type);

    // Compare each pair of cards
    for (let i = 0; i < 5; i++) {
      const playerCard = this.player.battleCards[i];
      const opponentCard = this.opponent.battleCards[i];

      // Handle case where one or both cards are missing
      if (!playerCard && !opponentCard) {
        // Both missing - no comparison needed
        if (this.ui) {
          this.ui.showMessage("Position " + (i + 1) + ": Both players missing a card - no effect");
        }
        continue;
      } else if (!playerCard) {
        // Player missing a card - automatic win for opponent
        if (this.ui) {
          this.ui.showMessage("Position " + (i + 1) + ": Player missing a card - opponent wins");
        }

        // Create a result with opponent as winner
        results.push({
          playerCard: null,
          opponentCard,
          winner: "opponent",
          damage: opponentCard ? opponentCard.damage : 1, // Use card damage or default
        });

        // Apply damage to player
        const damage = opponentCard ? opponentCard.damage : 1;
        this.player.takeDamage(damage);

        // Apply effects if opponent card exists
        if (opponentCard) {
          opponentCard.applyEffect(this, this.opponent, true);
        }

        // Update UI
        this.ui.showComparisonResults(results);
        this.ui.updatePlayerStats();
        this.ui.updateOpponentStats();

        // Check if game over
        if (this.checkGameOver()) {
          return;
        }

        await delay(1000);
        continue;
      } else if (!opponentCard) {
        // Opponent missing a card - automatic win for player
        if (this.ui) {
          this.ui.showMessage("Position " + (i + 1) + ": Opponent missing a card - player wins");
        }

        // Create a result with player as winner
        results.push({
          playerCard,
          opponentCard: null,
          winner: "player",
          damage: playerCard.damage,
        });

        // Apply damage to opponent
        this.opponent.takeDamage(playerCard.damage);

        // Apply effects
        playerCard.applyEffect(this, this.player, true);

        // Update UI
        this.ui.showComparisonResults(results);
        this.ui.updatePlayerStats();
        this.ui.updateOpponentStats();

        // Check if game over
        if (this.checkGameOver()) {
          return;
        }

        await delay(1000);
        continue;
      }

      // Normal comparison when both cards exist
      const winnerString = determineWinner(playerCard, opponentCard);
      let winner = null;
      let damage = 0;

      if (winnerString === "card1") {
        winner = "player";
        damage = calculateDamage(playerCard.damage, playerCard, opponentCard);
        this.opponent.takeDamage(damage);
        playerCard.applyEffect(this, this.player, true);
        opponentCard.applyEffect(this, this.opponent, false);
      } else if (winnerString === "card2") {
        winner = "opponent";
        damage = calculateDamage(opponentCard.damage, opponentCard, playerCard);
        this.player.takeDamage(damage);
        playerCard.applyEffect(this, this.player, false);
        opponentCard.applyEffect(this, this.opponent, true);
      } else {
        // Tie - no damage
        playerCard.applyEffect(this, this.player, false);
        opponentCard.applyEffect(this, this.opponent, false);
      }

      results.push({
        playerCard,
        opponentCard,
        winner,
        damage,
      });

      // Update UI after each comparison
      this.ui.showComparisonResults(results);
      this.ui.updatePlayerStats();
      this.ui.updateOpponentStats();

      // Check if game over
      if (this.checkGameOver()) {
        return; // Stop comparisons if game is over
      }

      // Delay between comparisons
      await delay(1000);
    }

    // End turn after all comparisons
    setTimeout(() => this.endComparison(), 1500);
  }

  /**
   * End the comparison phase and check for game over
   */
  endComparison() {
    if (this.checkGameOver()) {
      return; // Game is over
    }

    // Update opponent stats after battle
    if (this.ui) {
      this.ui.updateOpponentStats();
    }

    // Automatically end the turn instead of enabling the end turn button
    this.ui.showMessage("Battle complete. Starting next turn...");

    // Add a short delay before starting the next turn
    setTimeout(() => this.endTurn(), 1500);
  }

  /**
   * End the current turn
   */
  endTurn() {
    // Only discard battle cards, not the entire hand
    this.player.discardBattleCards();
    this.opponent.discardBattleCards();
    this.ui.clearComparisonResults();

    // Update opponent stats after discarding cards
    if (this.ui) {
      this.ui.updateOpponentStats();
    }

    // Check if game over
    if (this.checkGameOver()) {
      return; // Game is over
    }

    // Start a new turn
    this.startNewTurn();
  }

  /**
   * Check if the game is over
   * @returns {boolean} True if the game is over
   */
  checkGameOver() {
    if (this.player.isDefeated()) {
      // Player lost
      this.handleDefeat();
      return true;
    } else if (this.opponent.isDefeated()) {
      // Player won
      this.handleVictory();
      return true;
    }

    return false;
  }

  /**
   * Handle player victory
   */
  handleVictory() {
    this.ui.showGameOver(true);
    this.currentOpponentLevel++;
  }

  /**
   * Handle player defeat
   */
  handleDefeat() {
    this.ui.showGameOver(false);
  }

  /**
   * Reset the game to start a new run
   */
  resetGame() {
    this.initializeGame();
    this.ui.updateAll();
    this.ui.showMessage("New game started!");
  }
}
