export function generateMathCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = Math.random() < 0.5 ? "+" : "-";

  const expression = op === "-" && a < b ? `${b} - ${a}` : `${a} ${op} ${b}`;
  const answer = op === "+" ? a + b : a >= b ? a - b : b - a;

  const width = 120;
  const height = 44;
  const backgroundColor = "#015497";
  const textColor = "#ffffff";

  const noiseLines = Array.from({ length: 4 }, () => {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const strokeWidth = Math.random() * 1.2 + 0.3;
    const opacity = 0.6 + Math.random() * 0.3;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${textColor}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" />`;
  }).join("");

  const noiseDots = Array.from({ length: 25 }, () => {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = Math.random() * 1.2;
    const opacity = 0.4 + Math.random() * 0.4;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${textColor}" fill-opacity="${opacity}" />`;
  }).join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  ${noiseLines}
  ${noiseDots}
  <text x="50%" y="50%" font-size="20" font-family="sans-serif"
        text-anchor="middle" dy=".35em" fill="${textColor}">
    ${expression} = ?
  </text>
</svg>
  `.trim();

  return { svg, answer };
}
