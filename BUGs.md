# Known Bugs

## GUI

### GameUI
- Assuming a chord is pressed, and we release the notes one by one. The bug is that it's always the last played note of the chord that is seems to be released in the GameUI, even if it's not the one that the user actually released.
- When pausing the clock any active notes from the AI are keep scrolling (until we start the clock again)
### KeyboardUI
- In the scenario where not all the keyboard keys appear on screen (i.e due to resizing), if the user or the AI play one of these not-shown notes, there is a error thrown
