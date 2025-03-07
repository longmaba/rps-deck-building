# Rock Paper Scissors Roguelike

A card-based roguelike game implemented in HTML5 and JavaScript, combining Rock-Paper-Scissors mechanics with roguelike elements.

## Game Description

In Rock Paper Scissors Roguelike, players battle opponents using a deck of cards based on the classic Rock-Paper-Scissors game. The game features strategic deck building, card effects, and roguelike progression.

### Features

- **Card Types**: Rock, Paper, Scissors, and Utility cards
- **Card Variants**: Plain, Foil, Steel, Golden, and Holo variants with different effects
- **Turn-Based Gameplay**: Preparation phase for card selection and Comparison phase for battle
- **Roguelike Progression**: Face increasingly difficult opponents
- **Strategic Gameplay**: Build your deck and plan your card selections to counter opponents

### Game Mechanics

1. **Deck Composition**:

   - Players start with a 20-card deck (5 Rock, 5 Paper, 5 Scissors, 5 Utility)
   - Cards have different variants with unique effects

2. **Game Loop**:

   - **Preparation Phase**: Draw 7 cards, select 5 for battle
   - **Comparison Phase**: Cards are compared one by one using Rock-Paper-Scissors rules
   - Winner deals damage to the loser based on the card's damage value

3. **Card Effects**:

   - **Plain**: No additional effect
   - **Foil**: Deals +1 damage
   - **Steel**: Reduces damage taken by 1
   - **Golden**: Gains 1 gold on win
   - **Holo**: Boosts all cards of the same type in hand

4. **Utility Cards**:

   - Used immediately during Preparation phase
   - Provide unique effects like redrawing cards or modifying damage

5. **Victory Conditions**:
   - Reduce opponent's HP to 0
   - Progress to next opponent after victory

## How to Play

1. Open `index.html` in a web browser
2. During the Preparation phase:
   - Select up to 5 cards from your hand for battle
   - Use Utility cards immediately for their effects
3. Click "Start Battle" when you've selected 5 cards
4. Watch the Comparison phase as cards are compared
5. After all comparisons, click "End Turn" to continue
6. Continue until you or your opponent is defeated

## Implementation Details

The game is implemented using modern HTML5, CSS, and JavaScript, featuring:

- Object-oriented design with classes for Cards, Deck, Player, Opponent, Game, and UI
- Responsive design that works on desktop and mobile browsers
- Visual effects and animations for an engaging experience
- Modular code organization for easy maintenance and extension

## Future Enhancements

- Local storage for saving game progress
- Additional card types and effects
- More opponent variety and strategies
- Special events and rewards
- Meta-progression between runs

## Development

To modify or enhance the game:

1. Edit the HTML, CSS, or JavaScript files
2. Refresh the browser to see changes
3. Use the browser's developer tools for debugging

## License

This project is available for personal and educational use.

## Credits

Developed as part of a coding project using HTML5 and JavaScript.
