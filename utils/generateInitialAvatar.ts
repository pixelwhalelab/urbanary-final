export function generateInitialAvatar(fullName: string) {
  const initial = fullName.trim()[0].toUpperCase();

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 20); 
    const lightness = 50 + Math.floor(Math.random() * 10); 
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  const bgColor = getRandomColor();

  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%"
        font-size="130"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#FFFFFF"
        font-family="Arial, sans-serif">
        ${initial}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
