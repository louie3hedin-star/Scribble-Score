# Scribble Score Game

A fun web-based game where you draw scribbles and get scored based on various "mutations" detected in your drawing.

## How to Play

1. Draw on the canvas using your mouse.
2. Click "Score My Scribble" to analyze your drawing and get a score and tier.
3. Use "Clear" to start over.

## Mutations Detected

The game detects various scribble features and awards points accordingly:

- Straight lines, curves, zigzags, circles, ovals, dots
- Intersections between lines
- Closed shapes
- And more!

## Tiers

Based on your total score:

- Tiny Spark (0-1,000)
- Line Jumper (1,001-5,000)
- Curve Conjurer (5,001-10,000)
- Chaos Overlord (10,001-20,000)
- Mutation God (20,001-35,000)
- Quantum Scribbler (35,001+)

## Running the Game

Open `index.html` in a web browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.