# Theme Name: Pixel Arcade

# Vibe & Description:
Retro 8-bit game visuals, hard-edged outlines, high-saturation pixel colors, emphasizing no rounded corners, thick borders, and instant feedback, evoking classic arcade and indie-game nostalgia.

# Color

- Use a classic 8-bit palette; avoid gradients, alpha transitions, and soft colors.
- Use dark pixel black (#1A1C2C) for backgrounds and borders, bright white (#F4F4F4) for base backgrounds, and red (#FF004D), green (#00E436), blue (#29ADFF), and yellow (#FFEC27) for accents. The overall palette should be direct, vivid, and high-contrast, as clear and forceful as an early game interface.

# Font

- Use “ChillBitmap 16px” as the heading font. (https://resource-static.bj.bcebos.com/fonts-skill/ChillBitmap_16px.ttf)
- Use “Alibaba PuHuiTi” as the body font. (https://resource-static.bj.bcebos.com/fonts-skill/AlibabaPuHuiTi_Regular.ttf)

# Animation

- All interactions use instant hard cuts, with no easing, gradients, or opacity animations. On touch, elements move 1-2px down and to the right while the shadow shortens or disappears, creating feedback like a pressed physical button.
- Hover or selected states use Palette Swap, switching directly to another 8-bit accent color, such as a red button turning blue, with no intermediate transition.

# Layout

- Keep the page structure clearly segmented, using thick borders and hard-edged shadows to create hierarchy. Cards, buttons, and input fields should all stay square, with no rounded corners.
- In a mobile app, keep the grid compact but rhythmic, with clear spacing between modules. Key areas can use yellow headings, red action buttons, and blue-green status accents.

# Elements

- Use `border-4`, `rounded-none`, and `shadow-[4px_4px_0_#1a1c2c]` for buttons; shift them and remove the shadow on click.
- Cards use a white background, dark thick borders, and hard shadows, staying stable and clear like a game menu panel.
- Input fields keep a square outline; on focus, use a blue inner outline, with no glow or soft shadow.
- Decorative elements may include pixel stars, blocks, health bars, leaderboard items, and similar graphics, but keep them restrained to avoid weakening readability.