// Contrast ratio analysis for the intern management system
// WCAG AA standards: 4.5:1 for normal text, 3:1 for large text (18pt+)

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function getLuminance(r, g, b) {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Test problematic color combinations from the CSS
const colorTests = [
  // Mineral Light Theme
  {
    name: "Mineral Light - Primary",
    foreground: { r: 255, g: 255, b: 255 }, // primary-foreground
    background: { r: 74, g: 124, b: 125 },  // primary
  },
  {
    name: "Mineral Light - Secondary Text",
    foreground: { r: 34, g: 38, b: 43 },    // secondary-foreground  
    background: { r: 226, g: 232, b: 240 }, // secondary
  },
  {
    name: "Mineral Light - Muted Text",
    foreground: { r: 100, g: 110, b: 120 }, // muted-foreground
    background: { r: 241, g: 243, b: 245 }, // muted
  },
  
  // Mineral Dark Theme
  {
    name: "Mineral Dark - Primary",
    foreground: { r: 18, g: 20, b: 23 },    // primary-foreground
    background: { r: 107, g: 158, b: 159 }, // primary
  },
  {
    name: "Mineral Dark - Secondary Text", 
    foreground: { r: 224, g: 229, b: 235 }, // secondary-foreground
    background: { r: 58, g: 63, b: 69 },    // secondary
  },
  {
    name: "Mineral Dark - Muted Text",
    foreground: { r: 156, g: 163, b: 175 }, // muted-foreground
    background: { r: 34, g: 38, b: 43 },    // muted
  },
  
  // Obsidian Light Theme - FIXED
  {
    name: "Obsidian Light - Primary",
    foreground: { r: 255, g: 255, b: 255 }, // primary-foreground
    background: { r: 30, g: 99, b: 216 },  // primary
  },
  {
    name: "Obsidian Light - Secondary Text (FIXED)",
    foreground: { r: 28, g: 27, b: 35 },   // foreground
    background: { r: 95, g: 105, b: 120 },  // secondary - LIGHTENED
  },
  
  // Embercore Light Theme - FIXED
  {
    name: "Embercore Light - Warning (FIXED)",
    foreground: { r: 255, g: 255, b: 255 }, // warning-foreground
    background: { r: 180, g: 90, b: 40 },   // warning - DARKENED
  },
  {
    name: "Embercore Light - Secondary (FIXED)",
    foreground: { r: 41, g: 18, b: 12 },    // secondary-foreground
    background: { r: 135, g: 95, b: 75 },   // secondary - FURTHER LIGHTENED
  },
  
  // Badge variants - FIXED
  {
    name: "Success Badge (Light - FIXED)",
    foreground: { r: 255, g: 255, b: 255 }, // success-foreground
    background: { r: 60, g: 140, b: 110 },  // success - FULL BACKGROUND
  },
  {
    name: "Warning Badge (Light - FIXED)", 
    foreground: { r: 255, g: 255, b: 255 }, // warning-foreground
    background: { r: 180, g: 90, b: 40 },   // warning - FULL BACKGROUND
  }
];

console.log("=== CONTRAST RATIO ANALYSIS ===\n");

colorTests.forEach(test => {
  const ratio = getContrastRatio(test.foreground, test.background);
  const passes = ratio >= 4.5 ? "✅ PASS" : ratio >= 3.0 ? "⚠️  LARGE TEXT ONLY" : "❌ FAIL";
  
  console.log(`${test.name}: ${ratio.toFixed(2)}:1 ${passes}`);
  console.log(`  Foreground: ${rgbToHex(test.foreground.r, test.foreground.g, test.foreground.b)}`);
  console.log(`  Background: ${rgbToHex(test.background.r, test.background.g, test.background.b)}`);
  console.log('');
});

console.log("=== WCAG STANDARDS ===");
console.log("AA Standard: 4.5:1 for normal text, 3:1 for large text (18pt+)");
console.log("AAA Standard: 7:1 for normal text, 4.5:1 for large text");
