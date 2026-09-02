/**
 * MathPad Junior - Procedural Question Generation Engine
 * Algorithmic generator producing infinite, dynamically-crafted math questions with bilingual support.
 * Includes tiered difficulty rankings (easy, medium, hard) and session deduplication.
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
   * Helper: Shuffle array in place (Fisher-Yates)
   */
  static shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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
    } else if (unit === 'g') {
      list.add(`${raw}g`);
      list.add(`${raw} g`);
      list.add(`${raw} gramos`);
    } else if (unit === 'km/h') {
      list.add(`${raw}km/h`);
      list.add(`${raw} km/h`);
    }

    return Array.from(list);
  }

  // =========================================================================
  // 1. TIMES TABLES (1x1 to 12x12 & Advanced Factor Chains)
  // =========================================================================
  static generateTables(difficulty = 'medium') {
    let a, b;

    if (difficulty === 'easy') {
      // 2, 3, 4, 5, 10 times tables up to 10
      a = this.pick([2, 3, 4, 5, 10]);
      b = this.randInt(2, 10);
    } else if (difficulty === 'hard') {
      // Challenging tables (12 to 19, or mixed advanced products)
      const isTeen = Math.random() > 0.4;
      if (isTeen) {
        a = this.randInt(12, 19);
        b = this.randInt(3, 12);
      } else {
        a = this.randInt(8, 12);
        b = this.randInt(8, 12);
      }
    } else {
      // Medium: 6, 7, 8, 9, 11, 12 times tables
      a = this.pick([6, 7, 8, 9, 11, 12]);
      b = this.randInt(3, 12);
    }

    const ans = a * b;

    return {
      id: `gen_tbl_${Date.now()}_${Math.random()}`,
      cat: 'tables',
      q_en: `${a} × ${b} =`,
      q_es: `${a} × ${b} =`,
      a_en: ans.toString(),
      a_es: ans.toString(),
      num: ans.toString(),
      meta: { op: '×', a, b, difficulty },
      aliases: this.generateAliases(ans)
    };
  }

  // =========================================================================
  // 2. MULTIPLICATION (Multi-digit, brackets & advanced scaling)
  // =========================================================================
  static generateMultiplication(difficulty = 'medium') {
    if (difficulty === 'easy') {
      const type = this.pick(['multiple_of_ten', 'two_by_one_simple']);
      if (type === 'multiple_of_ten') {
        const a = this.pick([20, 30, 40, 50]);
        const b = this.randInt(2, 5);
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
      } else {
        const a = this.pick([12, 13, 14, 15, 21, 22, 23]);
        const b = this.randInt(2, 4);
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
    }

    if (difficulty === 'hard') {
      const type = this.pick(['two_by_two', 'three_by_one', 'compound_brackets']);

      if (type === 'two_by_two') {
        const a = this.randInt(24, 78);
        const b = this.randInt(14, 46);
        const ans = a * b;
        return {
          id: `gen_mult_${Date.now()}_${Math.random()}`,
          cat: 'mult',
          q_en: `${a} × ${b} =`,
          q_es: `${a} × ${b} =`,
          a_en: this.formatNum(ans, 'en'),
          a_es: this.formatNum(ans, 'es'),
          num: ans.toString(),
          meta: { op: '×', a, b },
          aliases: this.generateAliases(ans)
        };
      }

      if (type === 'three_by_one') {
        const a = this.randInt(165, 845);
        const b = this.randInt(6, 9);
        const ans = a * b;
        return {
          id: `gen_mult_${Date.now()}_${Math.random()}`,
          cat: 'mult',
          q_en: `${this.formatNum(a, 'en')} × ${b} =`,
          q_es: `${this.formatNum(a, 'es')} × ${b} =`,
          a_en: this.formatNum(ans, 'en'),
          a_es: this.formatNum(ans, 'es'),
          num: ans.toString(),
          meta: { op: '×', a, b },
          aliases: this.generateAliases(ans)
        };
      }

      // Compound Brackets
      const a = this.randInt(12, 25);
      const b = this.randInt(8, 15);
      const c = this.randInt(6, 14);
      const d = this.randInt(5, 12);
      const term1 = a * b;
      const term2 = c * d;
      const isAdd = Math.random() > 0.35;
      const ans = isAdd ? (term1 + term2) : (term1 - Math.min(term2, term1 - 20));
      const op = isAdd ? '+' : '−';

      return {
        id: `gen_mult_${Date.now()}_${Math.random()}`,
        cat: 'mult',
        q_en: `(${a} × ${b}) ${op} (${c} × ${d}) =`,
        q_es: `(${a} × ${b}) ${op} (${c} × ${d}) =`,
        a_en: this.formatNum(ans, 'en'),
        a_es: this.formatNum(ans, 'es'),
        num: ans.toString(),
        aliases: this.generateAliases(ans)
      };
    }

    // Medium Difficulty (Default)
    const type = this.pick(['two_by_one', 'multiple_of_ten', 'bracket_expression']);

    if (type === 'multiple_of_ten') {
      const a = this.pick([30, 40, 50, 60, 70, 80, 90]);
      const b = this.randInt(4, 9);
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

    // Standard 2-digit by 1-digit
    const a = this.randInt(28, 76);
    const b = this.randInt(4, 8);
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
  // 3. DIVISION (Exact dividends with tiered quotient complexity)
  // =========================================================================
  static generateDivision(difficulty = 'medium') {
    let divisor, quotient;

    if (difficulty === 'easy') {
      // Basic division within times tables (e.g. 24 ÷ 4, 35 ÷ 5, 48 ÷ 6)
      divisor = this.randInt(2, 9);
      quotient = this.randInt(2, 10);
    } else if (difficulty === 'hard') {
      // 3-digit and 4-digit dividends divided by 1 or 2-digit divisor
      const isTwoDigitDivisor = Math.random() > 0.5;
      if (isTwoDigitDivisor) {
        divisor = this.pick([11, 12, 14, 15, 16, 18, 20, 24]);
        quotient = this.randInt(25, 95);
      } else {
        divisor = this.randInt(6, 9);
        quotient = this.randInt(125, 680);
      }
    } else {
      // Medium: 2-digit & 3-digit dividend with 2-digit quotient (12 to 75)
      divisor = this.randInt(3, 9);
      quotient = this.randInt(14, 75);
    }

    const dividend = divisor * quotient;

    return {
      id: `gen_div_${Date.now()}_${Math.random()}`,
      cat: 'div',
      q_en: `${this.formatNum(dividend, 'en')} ÷ ${divisor} =`,
      q_es: `${this.formatNum(dividend, 'es')} : ${divisor} =`,
      a_en: this.formatNum(quotient, 'en'),
      a_es: this.formatNum(quotient, 'es'),
      num: quotient.toString(),
      meta: { op: '÷', a: dividend, b: divisor },
      aliases: this.generateAliases(quotient)
    };
  }

  // =========================================================================
  // 4. COLUMN ADDITION (2-digit, 3-digit, 4-digit & 3 addends)
  // =========================================================================
  static generateAddition(difficulty = 'medium') {
    if (difficulty === 'easy') {
      const a = this.randInt(24, 78);
      const b = this.randInt(15, 68);
      const sum = a + b;
      return {
        id: `gen_add_${Date.now()}_${Math.random()}`,
        cat: 'add',
        q_en: `${a} + ${b} =`,
        q_es: `${a} + ${b} =`,
        a_en: sum.toString(),
        a_es: sum.toString(),
        num: sum.toString(),
        meta: { op: '+', a, b },
        aliases: this.generateAliases(sum)
      };
    }

    if (difficulty === 'hard') {
      const isTripleAddend = Math.random() > 0.55;
      if (isTripleAddend) {
        const a = this.randInt(1250, 4850);
        const b = this.randInt(1120, 3950);
        const c = this.randInt(850, 2450);
        const sum = a + b + c;
        return {
          id: `gen_add_${Date.now()}_${Math.random()}`,
          cat: 'add',
          q_en: `${this.formatNum(a, 'en')} + ${this.formatNum(b, 'en')} + ${this.formatNum(c, 'en')} =`,
          q_es: `${this.formatNum(a, 'es')} + ${this.formatNum(b, 'es')} + ${this.formatNum(c, 'es')} =`,
          a_en: this.formatNum(sum, 'en'),
          a_es: this.formatNum(sum, 'es'),
          num: sum.toString(),
          meta: { op: '+', a, b, c },
          aliases: this.generateAliases(sum)
        };
      } else {
        const a = this.randInt(3480, 8950);
        const b = this.randInt(2850, 7890);
        const sum = a + b;
        return {
          id: `gen_add_${Date.now()}_${Math.random()}`,
          cat: 'add',
          q_en: `${this.formatNum(a, 'en')} + ${this.formatNum(b, 'en')} =`,
          q_es: `${this.formatNum(a, 'es')} + ${this.formatNum(b, 'es')} =`,
          a_en: this.formatNum(sum, 'en'),
          a_es: this.formatNum(sum, 'es'),
          num: sum.toString(),
          meta: { op: '+', a, b },
          aliases: this.generateAliases(sum)
        };
      }
    }

    // Medium: 3-digit + 3-digit with carrying
    const a = this.randInt(265, 845);
    const b = this.randInt(185, 765);
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
  // 5. COLUMN SUBTRACTION (Regrouping across 10s, 100s, 1000s & zeros)
  // =========================================================================
  static generateSubtraction(difficulty = 'medium') {
    let a, b;

    if (difficulty === 'easy') {
      a = this.randInt(48, 98);
      b = this.randInt(14, a - 12);
    } else if (difficulty === 'hard') {
      // 4-digit subtraction with consecutive borrowing across zero (e.g. 5,000 - 2,437)
      const isZeroTrap = Math.random() > 0.45;
      if (isZeroTrap) {
        a = this.pick([4000, 5000, 6000, 7000, 8000, 9000, 5020, 7050, 8005]);
        b = this.randInt(1485, a - 550);
      } else {
        a = this.randInt(5200, 9850);
        b = this.randInt(1850, a - 650);
      }
    } else {
      // Medium: 3-digit subtraction with regrouping
      const isZeroEnd = Math.random() > 0.4;
      if (isZeroEnd) {
        a = this.pick([500, 600, 700, 800, 900, 1000]);
        b = this.randInt(145, a - 80);
      } else {
        a = this.randInt(420, 980);
        b = this.randInt(125, a - 60);
      }
    }

    const diff = a - b;

    return {
      id: `gen_sub_${Date.now()}_${Math.random()}`,
      cat: 'sub',
      q_en: `${this.formatNum(a, 'en')} − ${this.formatNum(b, 'en')} =`,
      q_es: `${this.formatNum(a, 'es')} − ${this.formatNum(b, 'es')} =`,
      a_en: this.formatNum(diff, 'en'),
      a_es: this.formatNum(diff, 'es'),
      num: diff.toString(),
      meta: { op: '−', a, b },
      aliases: this.generateAliases(diff)
    };
  }

  // =========================================================================
  // 6. WORD PROBLEMS (Tiered Storytelling with Real-World Context)
  // =========================================================================
  static generateWordProblem(difficulty = 'medium') {
    const easyTemplates = [
      () => {
        const boxes = this.randInt(3, 6);
        const perBox = this.randInt(4, 9);
        const total = boxes * perBox;
        return {
          q_en: `A bakery packs ${total} cupcakes equally into ${boxes} boxes. How many cupcakes are in each box?`,
          q_es: `Una pastelería guarda ${total} magdalenas en ${boxes} cajas a partes iguales. ¿Cuántas hay en cada caja?`,
          ans: perBox,
          unit: ''
        };
      },
      () => {
        const count = this.randInt(3, 6);
        const price = this.randInt(2, 5);
        const total = count * price;
        return {
          q_en: `Leo buys ${count} pencils for £${price} each. How much does he spend in total?`,
          q_es: `Leo compra ${count} lápices por ${price} € cada uno. ¿Cuánto gasta en total?`,
          ans: total,
          unit: ''
        };
      },
      () => {
        const initial = this.randInt(25, 45);
        const added = this.randInt(14, 28);
        const total = initial + added;
        return {
          q_en: `There are ${initial} birds in a park. ${added} more fly in. How many birds are there now?`,
          q_es: `Hay ${initial} pájaros en un parque. Llegan ${added} más. ¿Cuántos pájaros hay ahora?`,
          ans: total,
          unit: 'birds'
        };
      }
    ];

    const mediumTemplates = [
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
      () => {
        const weekly = this.randInt(5, 9);
        const weeks = this.randInt(6, 11);
        const saved = weekly * weeks;
        return {
          q_en: `Liam saves £${weekly} each week for ${weeks} weeks. How much money in total has he saved?`,
          q_es: `Liam ahorra ${weekly} € cada semana durante ${weeks} semanas. ¿Cuánto dinero ha ahorrado en total?`,
          ans: saved,
          unit: ''
        };
      }
    ];

    const hardTemplates = [
      () => {
        const adultPrice = this.randInt(12, 18);
        const childPrice = this.randInt(7, 10);
        const adults = 2;
        const children = this.randInt(2, 4);
        const total = (adultPrice * adults) + (childPrice * children);
        return {
          q_en: `Cinema tickets cost £${adultPrice} for adults and £${childPrice} for children. How much do ${adults} adults and ${children} children pay in total?`,
          q_es: `Las entradas de cine cuestan ${adultPrice} € para adultos y ${childPrice} € para niños. ¿Cuánto pagan en total ${adults} adultos y ${children} niños?`,
          ans: total,
          unit: ''
        };
      },
      () => {
        const basePeople = 4;
        const baseFlour = this.pick([240, 280, 320, 360]);
        const targetPeople = 6;
        const flourPerPerson = baseFlour / basePeople;
        const targetFlour = flourPerPerson * targetPeople;
        return {
          q_en: `A recipe for ${basePeople} people needs ${baseFlour} g of flour. How many grams of flour are needed for ${targetPeople} people?`,
          q_es: `Una receta para ${basePeople} personas necesita ${baseFlour} g de harina. ¿Cuántos gramos de harina se necesitan para ${targetPeople} personas?`,
          ans: targetFlour,
          unit: 'g'
        };
      },
      () => {
        const crates = this.randInt(12, 18);
        const perCrate = this.randInt(25, 40);
        const total = crates * perCrate;
        const shipped = this.randInt(120, 220);
        const remaining = total - shipped;
        return {
          q_en: `A warehouse has ${crates} crates with ${perCrate} cartons in each crate. If ${shipped} cartons are shipped, how many cartons remain?`,
          q_es: `Un almacén tiene ${crates} cajas grandes con ${perCrate} paquetes cada una. Si se envían ${shipped} paquetes, ¿cuántos quedan?`,
          ans: remaining,
          unit: ''
        };
      },
      () => {
        const speed = this.pick([14, 16, 18, 20]);
        const hours = this.randInt(3, 5);
        const distance = speed * hours;
        return {
          q_en: `A cyclist travels ${distance} km at a steady speed of ${speed} km/h. How many hours does the journey take?`,
          q_es: `Un ciclista recorre ${distance} km a una velocidad constante de ${speed} km/h. ¿Cuántas horas tarda el viaje?`,
          ans: hours,
          unit: 'hours'
        };
      }
    ];

    let pool = mediumTemplates;
    if (difficulty === 'easy') pool = easyTemplates;
    else if (difficulty === 'hard') pool = hardTemplates;

    const built = this.pick(pool)();

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
  static generateGeometry(difficulty = 'medium') {
    const easyTemplates = [
      () => {
        const s = this.randInt(4, 10);
        const p = 4 * s;
        return {
          q_en: `Square with side length ${s} cm. What is its perimeter in cm?`,
          q_es: `Cuadrado con lado de ${s} cm. ¿Cuál es su perímetro en cm?`,
          ans: p,
          unit: 'cm'
        };
      },
      () => {
        const l = this.randInt(5, 9);
        const w = this.randInt(2, 4);
        const p = 2 * (l + w);
        return {
          q_en: `Rectangle: length ${l} cm, width ${w} cm. What is its perimeter in cm?`,
          q_es: `Rectángulo: largo ${l} cm, ancho ${w} cm. ¿Cuál es su perímetro en cm?`,
          ans: p,
          unit: 'cm'
        };
      },
      () => {
        const s = this.randInt(5, 12);
        const p = 3 * s;
        return {
          q_en: `Equilateral triangle with sides of ${s} cm. What is its perimeter in cm?`,
          q_es: `Triángulo equilátero con lados de ${s} cm. ¿Cuál es su perímetro en cm?`,
          ans: p,
          unit: 'cm'
        };
      }
    ];

    const mediumTemplates = [
      () => {
        const l = this.randInt(8, 16);
        const w = this.randInt(4, 9);
        const area = l * w;
        return {
          q_en: `Rectangle: length ${l} cm, width ${w} cm. What is its area in cm²?`,
          q_es: `Rectángulo: largo ${l} cm, ancho ${w} cm. ¿Cuál es su área en cm²?`,
          ans: area,
          unit: 'cm²'
        };
      },
      () => {
        const b = this.pick([8, 10, 12, 14, 16]);
        const h = this.randInt(5, 10);
        const area = (b * h) / 2;
        return {
          q_en: `Triangle with base ${b} cm and height ${h} cm. What is its area in cm²?`,
          q_es: `Triángulo con base ${b} cm y altura ${h} cm. ¿Cuál es su área en cm²?`,
          ans: area,
          unit: 'cm²'
        };
      },
      () => {
        const s = this.randInt(3, 7);
        const vol = s * s * s;
        return {
          q_en: `A cube has edges of length ${s} cm. What is its volume in cm³?`,
          q_es: `Un cubo tiene aristas de ${s} cm de longitud. ¿Cuál es su volumen en cm³?`,
          ans: vol,
          unit: 'cm³'
        };
      },
      () => {
        const a = this.randInt(45, 75);
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

    const hardTemplates = [
      () => {
        const width = this.randInt(6, 12);
        const length = this.randInt(14, 25);
        const area = length * width;
        return {
          q_en: `A rectangle has an area of ${area} cm² and a width of ${width} cm. What is its length in cm?`,
          q_es: `Un rectángulo tiene un área de ${area} cm² y un ancho de ${width} cm. ¿Cuál es su longitud en cm?`,
          ans: length,
          unit: 'cm'
        };
      },
      () => {
        const length = this.randInt(15, 28);
        const width = this.randInt(8, 16);
        const perim = 2 * (length + width);
        return {
          q_en: `A rectangle has a perimeter of ${perim} cm and a length of ${length} cm. What is its width in cm?`,
          q_es: `Un rectángulo tiene un perímetro de ${perim} cm y una longitud de ${length} cm. ¿Cuál es su ancho en cm?`,
          ans: width,
          unit: 'cm'
        };
      },
      () => {
        const l = this.randInt(6, 10);
        const w = this.randInt(4, 7);
        const h = this.randInt(5, 9);
        const vol = l * w * h;
        return {
          q_en: `A cuboid has length ${l} cm, width ${w} cm, and height ${h} cm. What is its volume in cm³?`,
          q_es: `Un prisma rectangular mide ${l} cm de largo, ${w} cm de ancho y ${h} cm de alto. ¿Cuál es su volumen en cm³?`,
          ans: vol,
          unit: 'cm³'
        };
      },
      () => {
        const a1 = this.randInt(75, 110);
        const a2 = this.randInt(80, 115);
        const a3 = this.randInt(70, 105);
        const a4 = 360 - (a1 + a2 + a3);
        return {
          q_en: `A quadrilateral has angles measuring ${a1}°, ${a2}°, and ${a3}°. What is the fourth angle in degrees?`,
          q_es: `Un cuadrilátero tiene ángulos de ${a1}°, ${a2}° y ${a3}°. ¿Cuánto mide el cuarto ángulo en grados?`,
          ans: a4,
          unit: '°'
        };
      }
    ];

    let pool = mediumTemplates;
    if (difficulty === 'easy') pool = easyTemplates;
    else if (difficulty === 'hard') pool = hardTemplates;

    const built = this.pick(pool)();

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
  static generateQuestionByCategory(category, difficulty = 'medium') {
    switch (category) {
      case 'tables':
        return this.generateTables(difficulty);
      case 'mult':
        return this.generateMultiplication(difficulty);
      case 'div':
        return this.generateDivision(difficulty);
      case 'add':
        return this.generateAddition(difficulty);
      case 'sub':
        return this.generateSubtraction(difficulty);
      case 'word':
        return this.generateWordProblem(difficulty);
      case 'geo':
        return this.generateGeometry(difficulty);
      default:
        return this.generateTables(difficulty);
    }
  }

  /**
   * Generates a question set tailored to the active mode, count, and difficulty.
   * Enforces session-wide deduplication so students never get repeating questions in a round.
   */
  static generateQuiz(mode, count = 10, difficulty = 'medium') {
    const list = [];
    const categories = ['tables', 'mult', 'div', 'add', 'sub', 'word', 'geo'];
    const seenSignatures = new Set();

    const getUniqueQuestion = (cat) => {
      let attempts = 0;
      while (attempts < 30) {
        attempts++;
        const q = this.generateQuestionByCategory(cat, difficulty);
        const sig = `${q.cat}:${q.q_en.trim()}`;
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          return q;
        }
      }
      // Fallback if domain is exhausted
      return this.generateQuestionByCategory(cat, difficulty);
    };

    if (mode === 'all_seq') {
      // Shuffle category sequence so rounds don't always start on the same category
      const shuffledCats = this.shuffle([...categories]);
      for (let i = 0; i < count; i++) {
        const cat = shuffledCats[i % shuffledCats.length];
        list.push(getUniqueQuestion(cat));
      }
    } else if (mode === 'random') {
      let lastCat = null;
      for (let i = 0; i < count; i++) {
        // Avoid repeating the exact same category immediately consecutively
        const available = categories.filter(c => c !== lastCat);
        const cat = this.pick(available.length > 0 ? available : categories);
        lastCat = cat;
        list.push(getUniqueQuestion(cat));
      }
    } else {
      // Targeted practice in one specific category
      for (let i = 0; i < count; i++) {
        list.push(getUniqueQuestion(mode));
      }
    }

    return list;
  }
}
