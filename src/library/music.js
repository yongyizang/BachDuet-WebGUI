import { note, transpose } from "@tonaljs/tonal"
import { enharmonic } from "@tonaljs/note"

export function createRange(from, to) {
  let fromNote = note(from)
  const toNote = note(to)

  if (fromNote.height >= toNote.height) {
    throw new Error("Reverse ranges are not yet implemented.")
  }

  if (fromNote.acc === "b") {
    fromNote = note(enharmonic(fromNote))
  }

  let range = []

  for (let i = 0, l = toNote.height - fromNote.height, currNote = fromNote; i < l; i++) {
    range.push(currNote)
    currNote = note(enharmonic(transpose(currNote, "m2")))
  }

  return range
}

export const durationMap = {
  1 : "16",
  2 : "8",
  3 : "d8",
  4 : "4",
  5 : ["4", "16"],
  6 : "d4",
  7 : "dd4",
  8 : "2",
  9 : ["2", "16"],
  10 : ["2", "8"],
  11 : ["2", "8", "16"],
  12 : "d2",
  13 : ["d2", "16"],
  14 : "dd2",
  15 : ["dd2", "16"],
  16 : "1"
}
