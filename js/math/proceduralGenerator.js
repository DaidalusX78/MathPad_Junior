/**
 * MathPad Junior - Procedural Question Generation Engine
 * Algorithmic generator producing infinite, dynamically-crafted math questions with bilingual support.
 */

export class ProceduralGenerator {
  /**
   * Helper: Get random integer between min and max (inclusive)
   */
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Helper: Pick random element from an array
   */
  static pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Helper: Format number with commas or periods
   */
  static formatNum(val, lang = 'en') {
    if (typeof val !== 'number') return val.toString();
    return lang === 'es' ? val.toLocaleString('es-ES') : val.toLocaleString('en-US');
  }

  /**
   * Helper: Generate common aliases for numbers and values
   */
  static generateAliases(numVal, unit = '') {
    const raw = numVal.toString();
    const formattedEn = (typeof numVal === 'number') ? numVal.toLocaleString('en-US') : raw;
    const formattedEs = (typeof numVal === 'number') ? numVal.toLocaleString('es-ES') : raw;

    const list = new Set([raw, formattedEn, formattedEs]);

    if (unit) {
      list.add(`${raw}${unit}`);
      list.add(`${raw} ${unit}`);
      list.add(`${formattedEn}${unit}`);
      list.add(`${formattedEn} ${unit}`);
    }

    // Common abbreviations
    if (unit === 'cm') {
      list.add(`${raw}cm`);
    } else if (unit === 'm') {
      list.add(`${raw}m`);
    } else if (unit === 'mins') {
      list.add(`${raw} mins`);
      list.add(`${raw}min`);
      list.add(`${raw} minutos`);
    } else if (unit === 'cm²') {
      list.add(`${raw}cm2`);
      list.add(`${raw} cm2`);
    } else if (unit === 'cm³') {
      list.add(`${raw}cm3`);
      list.add(`${raw} cm3`);
    }

    return Array.from(list);
  }

  // =========================================================================
  // 1. TIMES TABLES (1x1 to 12x12)
  // =========================================================================
  static generateTables() {
    const a = this.randInt(2, 12);
    const b = this.randInt(2, 12);
    const ans = a * b;

    return {
      id: `gen_tbl_${Date.now()}_${Math.random()}`,
      cat: 'tables',
      q_en: `${a} × ${b} =`,
      q_es: `${a} × ${b} =`,
      a_en: ans.toString(),
      a_es: ans.toString(),
      num: ans.toString(),
      meta: { op: '×', a, b },
      aliases: this.generateAliases(ans)
    };
  }

  // =========================================================================
  // 2. MULTIPLICATION (2-digit, multiples of 10, bracketed expressions)
  // =========================================================================
  static generateMultiplication() {
    const type = this.pick(['two_by_one', 'multiple_of_ten', 'bracket_expression', 'double_two_digit']);

    if (type === 'multiple_of_ten') {
      const a = this.pick([20, 30, 40, 50, 60, 70, 80, 90]);
      const b = this.randInt(3, 9);
      const ans = a * b;
      return {
        id: `gen_mult_${Date.now()}_${Math.random()}`,
        cat: 'mult',
        q_en: `${a} × ${b} =`,
        q_es: `${a} × ${b} =`,
        a_en: ans.toString(),
        a_es: ans.toString(),
        num: ans.toString(),
        meta: { op: '×', a, b },
        aliases: this.generateAliases(ans)
      };
    }

    if (type === 'bracket_expression') {
      const a = this.randInt(4, 9);
      const b = this.randInt(4, 9);
      const c = this.randInt(3, 8);
      const d = this.randInt(2, 6);
      const isAdd = Math.random() > 0.4;
      const term1 = a * b;
      const term2 = c * d;
      const ans = isAdd ? (term1 + term2) : (term1 - Math.min(term2, term1 - 5));
      const op = isAdd ? '+' : '−';

      return {
        id: `gen_mult_${Date.now()}_${Math.random()}`,
        cat: 'mult',
        q_en: `(${a} × ${b}) ${op} (${c} × ${d}) =`,
        q_es: `(${a} × ${b}) ${op} (${c} × ${d}) =`,
        a_en: ans.toString(),
        a_es: ans.toString(),
        num: ans.toString(),
        aliases: this.generateAliases(ans)
      };
    }

    if (type === 'double_two_digit') {
      const a = this.pick([12, 13, 14, 15, 16, 20, 25]);
      const b = this.randInt(3, 8);
      const ans = a * b;
      return {
        id: `gen_mult_${Date.now()}_${Math.random()}`,
        cat: 'mult',
        q_en: `${a} × ${b} =`,
        q_es: `${a} × ${b} =`,
        a_en: ans.toString(),
        a_es: ans.toString(),
        num: ans.toString(),
        meta: { op: '×', a, b },
        aliases: this.generateAliases(ans)
      };
    }

    // Default: 2-digit by 1-digit
    const a = this.randInt(14, 48);
    const b = this.randInt(3, 7);
    const ans = a * b;
    return {
      id: `gen_mult_${Date.now()}_${Math.random()}`,
      cat: 'mult',
      q_en: `${a} × ${b} =`,
      q_es: `${a} × ${b} =`,
      a_en: ans.toString(),
      a_es: ans.toString(),
      num: ans.toString(),
      meta: { op: '×', a, b },
      aliases: this.generateAliases(ans)
    };
  }

  // =========================================================================
  // 3. DIVISION (2-digit, 3-digit, 4-digit exact dividends)
  // =========================================================================
  static generateDivision() {
    const divisor = this.randInt(3, 9);
    const quotient = this.randInt(11, 75);
    const dividend = divisor * quotient;

    return {
      id: `gen_div_${Date.now()}_${Math.random()}`,
      cat: 'div',
      q_en: `${dividend} ÷ ${divisor} =`,
      q_es: `${dividend} : ${divisor} =`,
      a_en: quotient.toString(),
      a_es: quotient.toString(),
      num: quotient.toString(),
      meta: { op: '÷', a: dividend, b: divisor },
      aliases: this.generateAliases(quotient)
    };
  }

  // =========================================================================
  // 4. COLUMN ADDITION (3-digit & 4-digit with carrying)
  // =========================================================================
  static generateAddition() {
    const isFourDigit = Math.random() > 0.65;
    const a = isFourDigit ? this.randInt(500, 1500) : this.randInt(185, 780);
    const b = isFourDigit ? this.randInt(350, 1200) : this.randInt(145, 680);
    const sum = a + b;

    return {
      id: `gen_add_${Date.now()}_${Math.random()}`,
      cat: 'add',
      q_en: `${this.formatNum(a, 'en')} + ${this.formatNum(b, 'en')} =`,
      q_es: `${this.formatNum(a, 'es')} + ${this.formatNum(b, 'es')} =`,
      a_en: sum.toString(),
      a_es: sum.toString(),
      num: sum.toString(),
      meta: { op: '+', a, b },
      aliases: this.generateAliases(sum)
    };
  }

  // =========================================================================
  // 5. COLUMN SUBTRACTION (Regrouping across 10s, 100s, 1000s)
  // =========================================================================
  static generateSubtraction() {
    const isZeroEnd = Math.random() > 0.5;
    let a, b;

    if (isZeroEnd) {
      a = this.pick([500, 600, 700, 800, 900, 1000, 1200, 1500]);
      b = this.randInt(145, a - 80);
    } else {
      a = this.randInt(420, 1600);
      b = this.randInt(125, a - 60);
    }

    const diff = a - b;

    return {
      id: `gen_sub_${Date.now()}_${Math.random()}`,
      cat: 'sub',
      q_en: `${this.formatNum(a, 'en')} − ${this.formatNum(b, 'en')} =`,
      q_es: `${this.formatNum(a, 'es')} − ${this.formatNum(b, 'es')} =`,
      a_en: diff.toString(),
      a_es: diff.toString(),
      num: diff.toString(),
      meta: { op: '−', a, b },
      aliases: this.generateAliases(diff)
    };
  }

  // =========================================================================
  // 6. WORD PROBLEMS (Rich bilingual storytelling)
  // =========================================================================
  static generateWordProblem() {
    const templates = [
      // 1. Equal Packaging
      () => {
        const perBox = this.randInt(6, 14);
        const boxes = this.randInt(4, 9);
        const total = perBox * boxes;
        const itemEn = this.pick(['cookies', 'cupcakes', 'apples', 'stickers']);
        const itemEs = itemEn === 'cookies' ? 'galletas' : itemEn === 'cupcakes' ? 'magdalenas' : itemEn === 'apples' ? 'manzanas' : 'pegatinas';
        return {
          q_en: `A bakery packs ${total} ${itemEn} equally into ${boxes} boxes. How many in each box?`,
          q_es: `Una pastelería coloca ${total} ${itemEs} en ${boxes} cajas a partes iguales. ¿Cuántas van en cada caja?`,
          ans: perBox,
          unit: ''
        };
      },
      // 2. Money & Change
      () => {
        const priceEach = this.pick([2, 3, 4, 5]);
        const count = this.randInt(2, 4);
        const totalCost = priceEach * count;
        const note = totalCost <= 8 ? 10 : 20;
        const change = note - totalCost;
        return {
          q_en: `You buy ${count} books for £${priceEach} each and pay with a £${note} note. What is your change?`,
          q_es: `Compras ${count} libros por ${priceEach} € cada uno y pagas con un billete de ${note} €. ¿Cuánto te devuelven?`,
          ans: change,
          unit: ''
        };
      },
      // 3. School Classes
      () => {
        const classes = this.randInt(6, 9);
        const perClass = this.randInt(24, 30);
        const total = classes * perClass;
        return {
          q_en: `A school has ${classes} classes with ${perClass} students in each class. How many students in total?`,
          q_es: `Un colegio tiene ${classes} clases con ${perClass} alumnos en cada una. ¿Cuántos alumnos hay en total?`,
          ans: total,
          unit: 'students'
        };
      },
      // 4. Cutting Ribbons
      () => {
        const lengthM = this.randInt(2, 6);
        const pieces = this.pick([2, 4, 5]);
        const cmPerPiece = (lengthM * 100) / pieces;
        return {
          q_en: `A ribbon is ${lengthM} metres long and cut into ${pieces} equal pieces. How many centimetres is each piece?`,
          q_es: `Una cinta mide ${lengthM} metros de largo y se corta en ${pieces} partes iguales. ¿Cuántos centímetros mide cada trozo?`,
          ans: cmPerPiece,
          unit: 'cm'
        };
      },
      // 5. Savings Over Weeks
      () => {
        const weekly = this.randInt(4, 9);
        const weeks = this.randInt(5, 10);
        const saved = weekly * weeks;
        return {
          q_en: `Liam saves £${weekly} each week for ${weeks} weeks. How much money in total has he saved?`,
          q_es: `Liam ahorra ${weekly} € cada semana durante ${weeks} semanas. ¿Cuánto dinero ha ahorrado en total?`,
          ans: saved,
          unit: ''
        };
      },
      // 6. Perimeter of Sports Field
      () => {
        const length = this.randInt(60, 100);
        const width = this.randInt(30, 50);
        const perim = 2 * (length + width);
        return {
          q_en: `A sports pitch is ${length} m long and ${width} m wide. What is the total perimeter in metres?`,
          q_es: `Un campo de deportes mide ${length} m de largo y ${width} m de ancho. ¿Cuál es su perímetro total en metros?`,
          ans: perim,
          unit: 'm'
        };
      },
      // 7. Sharing Pizza
      () => {
        const totalSlices = 16;
        const eaten1 = this.randInt(3, 5);
        const eaten2 = this.randInt(4, 6);
        const left = totalSlices - (eaten1 + eaten2);
        return {
          q_en: `A pizza has ${totalSlices} slices. Leo eats ${eaten1} and Maya eats ${eaten2}. How many slices are left?`,
          q_es: `Una pizza tiene ${totalSlices} porciones. Leo come ${eaten1} y Maya come ${eaten2}. ¿Cuántas porciones quedan?`,
          ans: left,
          unit: 'slices'
        };
      }
    ];

    const built = this.pick(templates)();

    return {
      id: `gen_word_${Date.now()}_${Math.random()}`,
      cat: 'word',
      q_en: built.q_en,
      q_es: built.q_es,
      a_en: `${built.ans}${built.unit ? ' ' + built.unit : ''}`,
      a_es: `${built.ans}${built.unit ? ' ' + built.unit : ''}`,
      num: built.ans.toString(),
      aliases: this.generateAliases(built.ans, built.unit)
    };
  }

  // =========================================================================
  // 7. GEOMETRY & MEASURE
  // =========================================================================
  static generateGeometry() {
    const templates = [
      // 1. Rectangle Perimeter
      () => {
        const l = this.randInt(6, 15);
        const w = this.randInt(3, 9);
        const p = 2 * (l + w);
        return {
          q_en: `Rectangle: length ${l} cm, width ${w} cm. What is its perimeter in cm?`,
          q_es: `Rectángulo: largo ${l} cm, ancho ${w} cm. ¿Cuál es su perímetro en cm?`,
          ans: p,
          unit: 'cm'
        };
      },
      // 2. Square Area
      () => {
        const s = this.randInt(4, 12);
        const area = s * s;
        return {
          q_en: `Square with side length ${s} cm. What is its area in cm²?`,
          q_es: `Cuadrado con lado de ${s} cm. ¿Cuál es su área en cm²?`,
          ans: area,
          unit: 'cm²'
        };
      },
      // 3. Triangle Area
      () => {
        const b = this.pick([6, 8, 10, 12, 14]);
        const h = this.randInt(4, 10);
        const area = (b * h) / 2;
        return {
          q_en: `Triangle with base ${b} cm and height ${h} cm. What is its area in cm²?`,
          q_es: `Triángulo con base ${b} cm y altura ${h} cm. ¿Cuál es su área en cm²?`,
          ans: area,
          unit: 'cm²'
        };
      },
      // 4. Cube Volume
      () => {
        const s = this.randInt(2, 6);
        const vol = s * s * s;
        return {
          q_en: `A cube has edges of length ${s} cm. What is its volume in cm³?`,
          q_es: `Un cubo tiene aristas de ${s} cm de longitud. ¿Cuál es su volumen en cm³?`,
          ans: vol,
          unit: 'cm³'
        };
      },
      // 5. Rounding to Nearest Hundred
      () => {
        const n = this.randInt(1240, 8980);
        const rounded = Math.round(n / 100) * 100;
        return {
          q_en: `What is ${this.formatNum(n, 'en')} rounded to the nearest hundred?`,
          q_es: `¿Cuál es el número ${this.formatNum(n, 'es')} redondeado a la centena más cercana?`,
          ans: rounded,
          unit: ''
        };
      },
      // 6. Time Conversion (Hours & Minutes to Minutes)
      () => {
        const hrs = this.randInt(2, 4);
        const mins = this.pick([15, 20, 25, 30, 45]);
        const total = (hrs * 60) + mins;
        return {
          q_en: `How many minutes are in ${hrs} hours and ${mins} minutes?`,
          q_es: `¿Cuántos minutos son en total ${hrs} horas y ${mins} minutos?`,
          ans: total,
          unit: 'mins'
        };
      },
      // 7. Triangle Angle Sum
      () => {
        const a = this.randInt(40, 70);
        const b = this.randInt(40, 70);
        const c = 180 - (a + b);
        return {
          q_en: `A triangle has angles ${a}° and ${b}°. What is the third angle in degrees?`,
          q_es: `Un triángulo tiene ángulos de ${a}° y ${b}°. ¿Cuánto mide el tercer ángulo en grados?`,
          ans: c,
          unit: '°'
        };
      }
    ];

    const built = this.pick(templates)();

    return {
      id: `gen_geo_${Date.now()}_${Math.random()}`,
      cat: 'geo',
      q_en: built.q_en,
      q_es: built.q_es,
      a_en: `${built.ans}${built.unit ? ' ' + built.unit : ''}`,
      a_es: `${built.ans}${built.unit ? ' ' + built.unit : ''}`,
      num: built.ans.toString(),
      aliases: this.generateAliases(built.ans, built.unit)
    };
  }

  // =========================================================================
  // 8. MASTER GENERATOR / SESSION BUILDER
  // =========================================================================
  static generateQuestionByCategory(category) {
    switch (category) {
      case 'tables':
        return this.generateTables();
      case 'mult':
        return this.generateMultiplication();
      case 'div':
        return this.generateDivision();
      case 'add':
        return this.generateAddition();
      case 'sub':
        return this.generateSubtraction();
      case 'word':
        return this.generateWordProblem();
      case 'geo':
        return this.generateGeometry();
      default:
        return this.generateTables();
    }
  }

  /**
   * Generates a question set tailored to the active mode, count, and difficulty
   */
  static generateQuiz(mode, count = 10, difficulty = 'medium') {
    const list = [];
    const categories = ['tables', 'mult', 'div', 'add', 'sub', 'word', 'geo'];

    if (mode === 'all_seq') {
      // Balanced sequence across categories
      for (let i = 0; i < count; i++) {
        const cat = categories[i % categories.length];
        list.push(this.generateQuestionByCategory(cat, difficulty));
      }
    } else if (mode === 'random') {
      // Random mix of categories
      for (let i = 0; i < count; i++) {
        const cat = this.pick(categories);
        list.push(this.generateQuestionByCategory(cat, difficulty));
      }
    } else {
      // Questions in selected category
      for (let i = 0; i < count; i++) {
        list.push(this.generateQuestionByCategory(mode, difficulty));
      }
    }

    return list;
  }
}
