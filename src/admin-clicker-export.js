import {
  generateClicker3mf,
  generateMechanical3mf,
} from "../server/clicker-print.ts";
import { keyringFonts } from "./keyring-font-picker.js";

export async function exportClicker(design) {
  const readFont = async (key) => {
    if (!keyringFonts[key]) throw new Error("Unknown font");
    return fetch("/assets/fonts/keyring/" + keyringFonts[key]);
  };
  const bytes =
    design.style === "mechanical"
      ? await generateMechanical3mf(
          { ...design, text: design.keys.map((key) => key.text).join("") },
          readFont,
        )
      : await generateClicker3mf(design, await readFont(design.font));
  const url = URL.createObjectURL(new Blob([bytes], { type: "model/3mf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "OGS-clicker.3mf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
