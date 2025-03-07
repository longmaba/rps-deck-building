/**
 * Main entry point for the game
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the game
  const game = new Game();

  // Show game introduction
  game.ui.showDialog(
    "Rock Paper Scissors Roguelike",
    `Welcome to Rock Paper Scissors Roguelike!
        
        In this game, you'll battle opponents using a deck of Rock, Paper, and Scissors cards.
        Each card has different variants with unique effects.
        
        How to play:
        1. During preparation, select 5 cards from your hand for battle.
        2. Utility cards are played immediately when selected.
        3. In battle, your cards will be compared against the opponent's from left to right.
        4. Rock beats Scissors, Scissors beats Paper, Paper beats Rock.
        5. The winner deals damage based on their card's damage value.
        
        Good luck!`,
    () => {
      // Start the first turn
      game.ui.showMessage("Game started! Select your cards for battle.");
    }
  );
});
