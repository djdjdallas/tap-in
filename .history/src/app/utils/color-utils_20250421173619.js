// Color mappings between short codes and Tailwind classes
export const colorMappings = {
  backgrounds: {
    wht: "bg-white",
    gry50: "bg-gray-50",
    gry100: "bg-gray-100",
    blu50: "bg-blue-50",
    grn50: "bg-green-50",
    pnk50: "bg-pink-50",
  },
  text: {
    gry900: "text-gray-900",
    gry600: "text-gray-600",
    blu600: "text-blue-600",
    grn600: "text-green-600",
    prp600: "text-purple-600",
  },
  buttons: {
    gry100: "bg-gray-100",
    blu100: "bg-blue-100",
    grn100: "bg-green-100",
    pnk100: "bg-pink-100",
    prp100: "bg-purple-100",
  },
};

// Function to convert Tailwind class to css color value
export const tailwindToCssColor = (tailwindClass) => {
  const colorMap = {
    "bg-white": "#ffffff",
    "bg-gray-50": "#f9fafb",
    "bg-gray-100": "#f3f4f6",
    "bg-blue-50": "#eff6ff",
    "bg-green-50": "#f0fdf4",
    "bg-pink-50": "#fdf2f8",
    "text-gray-900": "#111827",
    "text-gray-600": "#4b5563",
    "text-blue-600": "#2563eb",
    "text-green-600": "#16a34a",
    "text-purple-600": "#9333ea",
    "bg-blue-100": "#dbeafe",
    "bg-green-100": "#dcfce7",
    "bg-pink-100": "#fce7f3",
    "bg-purple-100": "#f3e8ff",
  };

  return colorMap[tailwindClass] || "#ffffff";
};

// Function to convert css color to a custom Tailwind class
export const cssColorToTailwindClass = (cssColor, type) => {
  // For simplicity, just create a custom inline style class
  if (type.startsWith("profile_bg")) {
    return `bg-[${cssColor}]`;
  } else if (type.startsWith("button_bg")) {
    return `bg-[${cssColor}]`;
  } else {
    return `text-[${cssColor}]`;
  }
};

export const getInitialTailwindClass = (shortCode, type) => {
  if (!shortCode) {
    // Default values for each type
    const defaults = {
      profile_bg_color: "bg-white",
      profile_text_color: "text-gray-900",
      button_bg_color: "bg-gray-100",
      button_text_color: "text-gray-900",
    };
    return defaults[type];
  }

  // Check if it's a custom color (starts with #)
  if (shortCode.startsWith("#")) {
    return cssColorToTailwindClass(shortCode, type);
  }

  // Map the shortcode to the corresponding Tailwind class based on type
  switch (type) {
    case "profile_bg_color":
      return colorMappings.backgrounds[shortCode] || "bg-white";
    case "profile_text_color":
    case "button_text_color":
      return colorMappings.text[shortCode] || "text-gray-900";
    case "button_bg_color":
      return colorMappings.buttons[shortCode] || "bg-gray-100";
    default:
      return null;
  }
};

// Determine if a class is a custom color
export const isCustomColor = (tailwindClass) => {
  return tailwindClass.includes("bg-[") || tailwindClass.includes("text-[");
};

// Extract custom color from tailwind class
export const extractCustomColor = (tailwindClass) => {
  if (isCustomColor(tailwindClass)) {
    const match = tailwindClass.match(/\[(.*?)\]/);
    return match ? match[1] : "#ffffff";
  }
  return tailwindToCssColor(tailwindClass);
};

// Reverse mappings for converting Tailwind classes back to short codes for storage
export const reverseColorMappings = {
  backgrounds: Object.entries(colorMappings.backgrounds).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
  text: Object.entries(colorMappings.text).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
  buttons: Object.entries(colorMappings.buttons).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
};

// Color options for the UI
export const colorOptions = {
  cardBackgrounds: [
    { label: "White", value: colorMappings.backgrounds.wht },
    { label: "Light Gray", value: colorMappings.backgrounds.gry50 },
    { label: "Cool Gray", value: colorMappings.backgrounds.gry100 },
    { label: "Light Blue", value: colorMappings.backgrounds.blu50 },
    { label: "Light Green", value: colorMappings.backgrounds.grn50 },
    { label: "Light Pink", value: colorMappings.backgrounds.pnk50 },
  ],
  textColors: [
    { label: "Dark Gray", value: colorMappings.text.gry900 },
    { label: "Medium Gray", value: colorMappings.text.gry600 },
    { label: "Blue", value: colorMappings.text.blu600 },
    { label: "Green", value: colorMappings.text.grn600 },
    { label: "Purple", value: colorMappings.text.prp600 },
  ],
  buttonBackgrounds: [
    { label: "Gray", value: colorMappings.buttons.gry100 },
    { label: "Blue", value: colorMappings.buttons.blu100 },
    { label: "Green", value: colorMappings.buttons.grn100 },
    { label: "Pink", value: colorMappings.buttons.pnk100 },
    { label: "Purple", value: colorMappings.buttons.prp100 },
  ],
};
