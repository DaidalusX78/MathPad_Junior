/**
 * MathPad Junior - The Pencil Case (Shop & Customization Data Catalog)
 * Defines all unlockable pens, papers, palm rest desk mats, mascot gear, and reward stickers.
 */

export const pencilCaseCatalog = {
  version: "1.0.0",
  currency: {
    name: "Math Coins",
    symbol: "🪙",
    icon: "🪙"
  },
  categories: [
    { id: "inks", label: "Magic Pens & Inks", icon: "🖊️", desc: "Special dynamic inks, neon glows, and rainbow trails" },
    { id: "papers", label: "Scratchpad Papers", icon: "📐", desc: "Custom notebook paper grids and texture themes" },
    { id: "deskMats", label: "Palm Rest Skins", icon: "🖼️", desc: "Custom desk mats and wrist guard textures" },
    { id: "accessories", label: "Mascot Gear", icon: "👑", desc: "Hats, shades, and accessories for your avatar" },
    { id: "stickers", label: "Reward Stickers", icon: "⭐", desc: "Collect and stick badges onto your palm rest" }
  ],
  items: {
    // ------------------- 1. MAGIC INKS -------------------
    inks: [
      {
        id: "ink_lilac",
        name: "Classic Lilac",
        name_es: "Lila Clásico",
        price: 0,
        unlockedByDefault: true,
        type: "solid",
        color: "#b57edc",
        desc: "The default cheerful stylus ink.",
        desc_es: "La tinta alegre predeterminada.",
        previewHtml: "<span style='color:#b57edc; font-weight:900; font-size:1.2rem;'>12 × 12 = 144</span>"
      },
      {
        id: "ink_rainbow",
        name: "Rainbow Trail Pen",
        name_es: "Pluma Arcoíris",
        price: 120,
        unlockedByDefault: false,
        type: "gradient",
        gradient: "linear-gradient(90deg, #f87171, #fbbf24, #34d399, #38bdf8, #818cf8)",
        desc: "Strokes smoothly cycle through vibrant rainbow hues as you draw.",
        desc_es: "Los trazos cambian de color como un arcoíris al escribir.",
        previewHtml: "<div style='width:80%; height:10px; border-radius:5px; background:linear-gradient(90deg, #f87171, #fbbf24, #34d399, #38bdf8, #818cf8);'></div>"
      },
      {
        id: "ink_neon_green",
        name: "Neon Glow Chalk",
        name_es: "Tiza Neón Brillante",
        price: 150,
        unlockedByDefault: false,
        type: "glow",
        color: "#22c55e",
        glowColor: "#4ade80",
        desc: "Electric radiant ink with an ambient glowing light aura.",
        desc_es: "Tinta radiante que brilla con luz verde neón.",
        previewHtml: "<span style='color:#22c55e; text-shadow:0 0 10px #4ade80; font-weight:900; font-size:1.2rem;'>24 ÷ 6 = 4</span>"
      },
      {
        id: "ink_gold_glitter",
        name: "Glitter Sparkle Pen",
        name_es: "Pluma Brillante Dorada",
        price: 200,
        unlockReq: { type: "streak", value: 3, label: "3-Day Practice Streak" },
        unlockedByDefault: false,
        type: "sparkle",
        color: "#f59e0b",
        desc: "Golden metallic ink leaving delicate sparkles in your wake.",
        desc_es: "Tinta dorada reluciente para grandes triunfos.",
        previewHtml: "<span style='color:#b45309; text-shadow:0 0 8px #fde047; font-weight:900; font-size:1.2rem;'>⭐ 100% Score</span>"
      },
      {
        id: "ink_cyber_cyan",
        name: "Electric Cyan",
        name_es: "Cian Eléctrico",
        price: 80,
        unlockedByDefault: false,
        type: "solid",
        color: "#06b6d4",
        desc: "Ultra-crisp cyan ink that cuts cleanly across any paper.",
        desc_es: "Tinta cian ultra nítida y brillante.",
        previewHtml: "<span style='color:#06b6d4; font-weight:900; font-size:1.2rem;'>8 × 9 = 72</span>"
      }
    ],

    // ------------------- 2. PAPER TEXTURES -------------------
    papers: [
      {
        id: "paper_blank",
        name: "Clean Blank",
        name_es: "Blanco Limpio",
        price: 0,
        unlockedByDefault: true,
        className: "paper-blank",
        desc: "Smooth unlined whiteboard for freehand thinking.",
        desc_es: "Pizarra blanca lisa para calcular libremente.",
        previewHtml: "<div class='mini-paper-preview paper-blank'><span class='mini-paper-tag'>Whiteboard</span></div>"
      },
      {
        id: "paper_squares",
        name: "Math Squares",
        name_es: "Cuadrícula Matemática",
        price: 0,
        unlockedByDefault: true,
        className: "paper-squares",
        desc: "Classic 24px square grid for column addition & multiplication.",
        desc_es: "Cuadrícula tradicional para operaciones en columna.",
        previewHtml: "<div class='mini-paper-preview paper-squares'><span class='mini-paper-tag'>Math Grid</span></div>"
      },
      {
        id: "paper_dots",
        name: "Dot Matrix",
        name_es: "Matriz de Puntos",
        price: 0,
        unlockedByDefault: true,
        className: "paper-dots",
        desc: "Subtle coordinate dots for neat notes and geometry.",
        desc_es: "Puntos guía discretos para geometría y notas limpias.",
        previewHtml: "<div class='mini-paper-preview paper-dots'><span class='mini-paper-tag'>Dot Matrix</span></div>"
      },
      {
        id: "paper_chalkboard",
        name: "Dark Slate Chalkboard",
        name_es: "Pizarra de Tiza Oscura",
        price: 180,
        unlockReq: { type: "streak", value: 5, label: "5-Day Practice Streak" },
        unlockedByDefault: false,
        className: "paper-chalkboard",
        desc: "Cozy dark mode slate blackboard with faint chalk dust.",
        desc_es: "Modo oscuro clásico estilo pizarra de aula escolar.",
        previewHtml: "<div class='mini-paper-preview paper-chalkboard'><span class='mini-paper-tag' style='color:#e2e8f0; background:rgba(15,23,42,0.7);'>Slate Dust</span></div>"
      },
      {
        id: "paper_galaxy",
        name: "Galaxy Starlight",
        name_es: "Galaxia Estrellada",
        price: 220,
        unlockedByDefault: false,
        className: "paper-galaxy",
        desc: "Deep cosmic nebula texture with glowing stellar coordinates.",
        desc_es: "Fondo espacial cósmico con estrellas guía.",
        previewHtml: "<div class='mini-paper-preview paper-galaxy'><span class='mini-paper-tag' style='color:#fbcfe8; background:rgba(15,23,42,0.75);'>Nebula Stars</span></div>"
      },
      {
        id: "paper_parchment",
        name: "Treasure Parchment",
        name_es: "Pergamino Antiguo",
        price: 140,
        unlockedByDefault: false,
        className: "paper-parchment",
        desc: "Antique warm papyrus scroll texture for young adventurers.",
        desc_es: "Textura de mapa del tesoro antiguo para explorar matemáticas.",
        previewHtml: "<div class='mini-paper-preview paper-parchment'><span class='mini-paper-tag' style='color:#78350f; background:rgba(254,243,199,0.85);'>Old Papyrus</span></div>"
      }
    ],

    // ------------------- 3. PALM REST DESK MATS -------------------
    deskMats: [
      {
        id: "mat_slate",
        name: "Default Frosted Slate",
        name_es: "Pizarra Translúcida",
        price: 0,
        unlockedByDefault: true,
        style: "linear-gradient(to top, rgba(241, 245, 249, 0.96) 0%, rgba(248, 250, 252, 0.82) 85%, transparent 100%)",
        desc: "Clean minimal wrist shield with subtle grip texture.",
        previewHtml: "<div class='mini-mat-preview mat_slate'><div class='mini-mat-seam'></div><span class='mini-mat-tag'>Frosted Slate</span></div>"
      },
      {
        id: "mat_woodcraft",
        name: "Woodcraft Study Table",
        name_es: "Madera de Taller",
        price: 110,
        unlockedByDefault: false,
        style: "linear-gradient(to top, #78350f 0%, #92400e 70%, transparent 100%)",
        desc: "Warm oak workshop table feel for your workstation.",
        previewHtml: "<div class='mini-mat-preview mat_woodcraft'><div class='mini-mat-seam' style='border-color:#d97706;'></div><span class='mini-mat-tag' style='color:#fef3c7;'>Warm Oak</span></div>"
      },
      {
        id: "mat_space",
        name: "Cosmic Nebula Pad",
        name_es: "Alfombrilla Nebulosa",
        price: 190,
        unlockedByDefault: false,
        style: "linear-gradient(to top, #1e1b4b 0%, #312e81 70%, transparent 100%)",
        desc: "Deep indigo and violet galaxy desk mat.",
        previewHtml: "<div class='mini-mat-preview mat_space'><div class='mini-mat-seam' style='border-color:#818cf8;'></div><span class='mini-mat-tag' style='color:#e0e7ff;'>Starlight Space</span></div>"
      },
      {
        id: "mat_neon_cyber",
        name: "Neon Gamer Mat",
        name_es: "Tapete Gamer Neón",
        price: 240,
        unlockReq: { type: "perfectQuiz", value: 3, label: "3 Perfect 10/10 Quizzes" },
        unlockedByDefault: false,
        style: "linear-gradient(to top, #09090b 0%, #18181b 75%, transparent 100%)",
        desc: "Sleek matte gamer surface with reactive neon edge piping.",
        previewHtml: "<div class='mini-mat-preview mat_neon_cyber'><div class='mini-mat-seam' style='border-color:#06b6d4; box-shadow:0 0 8px #06b6d4;'></div><span class='mini-mat-tag' style='color:#67e8f9;'>Cyber Cyan</span></div>"
      }
    ],

    // ------------------- 4. MASCOT ACCESSORIES -------------------
    accessories: [
      {
        id: "acc_wizard_hat",
        name: "Math Wizard Hat",
        name_es: "Sombrero de Mago",
        price: 220,
        icon: "🧙‍♂️",
        desc: "Crown your mascot avatar with a starry sorcerer hat."
      },
      {
        id: "acc_sunglasses",
        name: "Cool Shades",
        name_es: "Gafas de Sol Guays",
        price: 130,
        icon: "🕶️",
        desc: "Slick aviator sunglasses for confident mathematicians."
      },
      {
        id: "acc_gold_crown",
        name: "Champion's Gold Crown",
        name_es: "Corona de Campeón",
        price: 300,
        unlockReq: { type: "streak", value: 7, label: "7-Day Practice Streak" },
        icon: "👑",
        desc: "The ultimate sparkling crown for top arithmetic masters."
      },
      {
        id: "acc_space_helmet",
        name: "Astronaut Bubble",
        name_es: "Casco de Astronauta",
        price: 170,
        icon: "👨‍🚀",
        desc: "Blast off into advanced mental math with a space helmet."
      }
    ],

    // ------------------- 5. REWARD STICKERS -------------------
    stickers: [
      { id: "stk_star", icon: "⭐", name: "Gold Star", price: 30, desc: "A shining reward for great practice." },
      { id: "stk_rocket", icon: "🚀", name: "Speed Rocket", price: 40, desc: "For solving problems at lightning speed!" },
      { id: "stk_fire", icon: "🔥", name: "Hot Streak", price: 50, desc: "Awarded for keeping your practice streak alive." },
      { id: "stk_brain", icon: "🧠", name: "Big Brain", price: 60, desc: "For conquering tough word problems." },
      { id: "stk_diamond", icon: "💎", name: "Diamond Gem", price: 75, desc: "Flawless precision calculation badge." },
      { id: "stk_pizza", icon: "🍕", name: "Pizza Slice", price: 35, desc: "A tasty fraction reward sticker." }
    ]
  }
};
