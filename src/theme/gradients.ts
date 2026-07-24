// src/theme/gradients.ts

import Colors from "./colors";

export const Gradients = {
  primary: [Colors.primary, Colors.primaryLight],
  secondary: [Colors.secondary, Colors.secondaryLight],
  sunset: ["#FF9F1C", "#FFBF69"],
  ocean: ["#2EC4B6", "#CBF3F0"],
} as const;

export default Gradients;