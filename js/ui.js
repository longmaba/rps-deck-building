/**
 * UI class to handle the game's user interface
 */
class UI {
  /**
   * Create a new UI handler
   * @param {Game} game - The game instance
   */
  constructor(game) {
    this.game = game;
    this.elements = {
      playerHp: document.getElementById("player-hp-value"),
      playerGold: document.getElementById("player-gold-value"),
      opponentName: document.getElementById("opponent-name"),
      opponentHp: document.getElementById("opponent-hp-value"),
      opponentRockCount: document.getElementById("opponent-rock-count"),
      opponentPaperCount: document.getElementById("opponent-paper-count"),
      opponentScissorsCount: document.getElementById("opponent-scissors-count"),
      opponentUtilityCount: document.getElementById("opponent-utility-count"),
      playerHand: document.getElementById("player-hand"),
      playerBattleCards: document.getElementById("player-battle-cards"),
      opponentCards: document.getElementById("opponent-cards"),
      comparisonResults: document.getElementById("comparison-results"),
      gameMessages: document.getElementById("game-messages"),
      startBattleBtn: document.getElementById("start-battle"),
      endTurnBtn: document.getElementById("end-turn"),
      gameOverlay: document.getElementById("game-overlay"),
      dialogTitle: document.getElementById("dialog-title"),
      dialogContent: document.getElementById("dialog-content"),
      dialogButton: document.getElementById("dialog-button"),
    };

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners() {
    // Start battle button
    this.elements.startBattleBtn.addEventListener("click", () => {
      this.game.startComparison();
    });

    // End turn button
    this.elements.endTurnBtn.addEventListener("click", () => {
      this.game.endTurn();
    });

    // Dialog button
    this.elements.dialogButton.addEventListener("click", () => {
      this.hideDialog();
      if (this.onDialogClose) {
        this.onDialogClose();
        this.onDialogClose = null;
      }
    });
  }

  /**
   * Update player stats display
   */
  updatePlayerStats() {
    this.elements.playerHp.textContent = this.game.player.hp;
    this.elements.playerGold.textContent = this.game.player.gold;
  }

  /**
   * Update opponent stats display
   */
  updateOpponentStats() {
    this.elements.opponentName.textContent = this.game.opponent.name;
    this.elements.opponentHp.textContent = this.game.opponent.hp;

    // Update deck statistics
    this.updateOpponentDeckStats();
  }

  /**
   * Update opponent deck statistics
   */
  updateOpponentDeckStats() {
    // Count cards by type in opponent's deck, hand, and discard pile
    const allOpponentCards = [
      ...this.game.opponent.deck,
      ...this.game.opponent.hand,
      ...this.game.opponent.battleCards,
      ...this.game.opponent.discardPile,
    ];

    // Count by type
    const rockCount = allOpponentCards.filter((card) => card.type === "rock").length;
    const paperCount = allOpponentCards.filter((card) => card.type === "paper").length;
    const scissorsCount = allOpponentCards.filter((card) => card.type === "scissors").length;
    const utilityCount = allOpponentCards.filter((card) => card.type === "utility").length;

    // Add visual indicator for count changes - flash animation if counts change
    this.updateCountWithAnimation("opponent-rock-count", rockCount);
    this.updateCountWithAnimation("opponent-paper-count", paperCount);
    this.updateCountWithAnimation("opponent-scissors-count", scissorsCount);
    this.updateCountWithAnimation("opponent-utility-count", utilityCount);

    // Show a message about the opponent's cards
    const total = rockCount + paperCount + scissorsCount + utilityCount;
    this.showMessage(`Opponent has ${total} cards total: ${rockCount} Rock, ${paperCount} Paper, ${scissorsCount} Scissors, ${utilityCount} Utility`);
  }

  /**
   * Update a count element with animation if the value has changed
   * @param {string} elementId - The ID of the element to update
   * @param {number} newValue - The new count value
   */
  updateCountWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    const oldValue = parseInt(element.textContent);

    // Update the element's text
    element.textContent = newValue;

    // If the value has changed, add a flash animation
    if (oldValue !== newValue) {
      // Add flash class (will be defined in CSS)
      element.classList.add("count-flash");

      // Remove the class after animation completes
      setTimeout(() => {
        element.classList.remove("count-flash");
      }, 1000);
    }
  }

  /**
   * Update player's hand display
   */
  updateHand() {
    const handElement = this.elements.playerHand;
    handElement.innerHTML = "";

    // Create and add card elements for each card in hand
    for (const card of this.game.player.hand) {
      const cardElement = card.createElement();

      // Add click event for card selection
      cardElement.addEventListener("click", () => {
        // If it's a utility card, play it immediately
        if (card.type === "utility") {
          const index = this.game.player.hand.indexOf(card);
          if (index !== -1) {
            const selectedCard = this.game.player.selectCardForBattle(index);
            if (selectedCard) {
              selectedCard.applyUtilityEffect(this.game, this.game.player);
              this.game.player.discardPile.push(selectedCard);
              this.updateHand();
              this.updateBattleCards();
            }
          }
        } else {
          // Regular card - add to battle (removed the 5-card limit)
          const index = this.game.player.hand.indexOf(card);
          if (index !== -1) {
            this.game.player.selectCardForBattle(index);
            this.updateHand();
            this.updateBattleCards();

            // Update battle button state
            this.updateButtons();
          }
        }
      });

      handElement.appendChild(cardElement);
    }
  }

  /**
   * Update player's battle cards display
   */
  updateBattleCards() {
    const battleCardsElement = this.elements.playerBattleCards;
    battleCardsElement.innerHTML = "";

    // Create and add card elements for each battle card
    for (const card of this.game.player.battleCards) {
      const cardElement = card.createElement();

      // Add click event to return card to hand
      cardElement.addEventListener("click", () => {
        const index = this.game.player.battleCards.indexOf(card);
        if (index !== -1) {
          this.game.player.removeCardFromBattle(index);
          this.updateHand();
          this.updateBattleCards();

          // Update button state
          this.updateButtons();
        }
      });

      battleCardsElement.appendChild(cardElement);
    }
  }

  /**
   * Update opponent's cards display
   */
  updateOpponentCards() {
    const opponentCardsElement = this.elements.opponentCards;
    opponentCardsElement.innerHTML = "";

    // For real game, we'd show back of cards or placeholder during preparation
    if (this.game.phase === "preparation") {
      // Show opponent hand count
      for (let i = 0; i < this.game.opponent.hand.length; i++) {
        const cardBack = document.createElement("div");
        cardBack.className = "card card-back";

        // Add a card back design
        const cardBackInner = document.createElement("div");
        cardBackInner.className = "card-back-design";
        cardBackInner.innerHTML = '<i class="fas fa-question"></i>';

        const cardBackLabel = document.createElement("div");
        cardBackLabel.className = "card-back-label";
        cardBackLabel.textContent = "Opponent Card";

        cardBack.appendChild(cardBackInner);
        cardBack.appendChild(cardBackLabel);

        opponentCardsElement.appendChild(cardBack);
      }
    } else if (this.game.phase === "comparison") {
      // Show opponent's battle cards during comparison
      for (const card of this.game.opponent.battleCards) {
        const cardElement = card.createElement();
        opponentCardsElement.appendChild(cardElement);
      }
    }
  }

  /**
   * Show comparison results
   * @param {Array} results - Array of comparison results
   */
  showComparisonResults(results) {
    const resultsElement = this.elements.comparisonResults;
    resultsElement.innerHTML = "";

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const resultElement = document.createElement("div");
      resultElement.className = "comparison-result";

      // Create placeholder for missing cards
      const createPlaceholder = () => {
        const placeholder = document.createElement("div");
        placeholder.className = "card card-placeholder";
        placeholder.textContent = "No Card";
        return placeholder;
      };

      // Create elements for player and opponent cards
      const playerCardElement = result.playerCard ? result.playerCard.createElement() : createPlaceholder();
      const opponentCardElement = result.opponentCard ? result.opponentCard.createElement() : createPlaceholder();

      // Add result indicator
      const resultIndicator = document.createElement("div");
      resultIndicator.className = "result-indicator";

      if (result.winner === "player") {
        resultIndicator.textContent = "👑 Player wins";
        resultIndicator.style.color = "#4CAF50";
        playerCardElement.style.boxShadow = "0 0 10px 3px #4CAF50";
      } else if (result.winner === "opponent") {
        resultIndicator.textContent = "👑 Opponent wins";
        resultIndicator.style.color = "#F44336";
        opponentCardElement.style.boxShadow = "0 0 10px 3px #F44336";
      } else {
        resultIndicator.textContent = "🤝 Tie";
        resultIndicator.style.color = "#FFC107";
      }

      // Add damage indicator
      if (result.damage > 0) {
        const damageIndicator = document.createElement("div");
        damageIndicator.className = "damage-indicator";
        damageIndicator.textContent = `Damage: ${result.damage}`;
        resultElement.appendChild(damageIndicator);
      }

      // Add all elements to the result container
      resultElement.appendChild(opponentCardElement);
      resultElement.appendChild(resultIndicator);
      resultElement.appendChild(playerCardElement);

      resultsElement.appendChild(resultElement);
    }
  }

  /**
   * Clear comparison results
   */
  clearComparisonResults() {
    this.elements.comparisonResults.innerHTML = "";
  }

  /**
   * Show a message to the player
   * @param {string} message - The message to display
   */
  showMessage(message) {
    this.elements.gameMessages.textContent = message;

    // Clear message after a few seconds
    setTimeout(() => {
      if (this.elements.gameMessages.textContent === message) {
        this.elements.gameMessages.textContent = "";
      }
    }, 3000);
  }

  /**
   * Show a dialog
   * @param {string} title - Dialog title
   * @param {string} content - Dialog content
   * @param {function} callback - Function to call when dialog is closed
   */
  showDialog(title, content, callback) {
    this.elements.dialogTitle.textContent = title;
    this.elements.dialogContent.textContent = content;
    this.elements.gameOverlay.classList.remove("hidden");
    this.onDialogClose = callback;
  }

  /**
   * Hide the dialog
   */
  hideDialog() {
    this.elements.gameOverlay.classList.add("hidden");
  }

  /**
   * Enable/disable buttons based on game state
   */
  updateButtons() {
    // Start battle button - enabled as long as player has at least 1 card selected
    // (or can be enabled with 0 cards if we want to allow auto-losing)
    this.elements.startBattleBtn.disabled = this.game.player.battleCards.length < 1;

    // End turn button - enabled only during preparation phase
    this.elements.endTurnBtn.disabled = this.game.phase !== "preparation";
  }

  /**
   * Update all UI elements
   */
  updateAll() {
    this.updatePlayerStats();
    this.updateOpponentStats();
    this.updateHand();
    this.updateBattleCards();
    this.updateOpponentCards();
    this.updateButtons();
  }

  /**
   * Show game over screen
   * @param {boolean} isVictory - Whether the player won
   */
  showGameOver(isVictory) {
    const title = isVictory ? "Victory!" : "Defeat!";
    const content = isVictory ? "Congratulations! You have defeated your opponent." : "You have been defeated. Better luck next time!";

    this.showDialog(title, content, () => {
      // Restart the game
      this.game.resetGame();
    });
  }
}
