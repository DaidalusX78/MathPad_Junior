/**
 * Algorithmic Math Error Diagnosis & Step-by-Step Breakdown Engine
 * Detects specific student computational misconceptions (e.g. carry placement,
 * smaller-from-larger subtraction without borrowing, factor slips) and generates
 * pedagogical hints and column-by-column breakdowns.
 */

export class DiagnosisEngine {
  /**
   * Diagnoses an incorrect answer for a given math problem.
   * @param {string|number} userAnswer - The answer submitted by the student
   * @param {Object} questionItem - The current question object
   * @param {string} lang - 'en' | 'es'
   * @returns {Object|null} Diagnosis result with specific hints and step breakdown
   */
  static diagnose(userAnswer, questionItem, lang = 'en') {
    if (!userAnswer || !questionItem) return null;

    const userNum = parseInt(userAnswer.toString().replace(/[^0-9-]/g, ''), 10);
    if (isNaN(userNum)) return null;

    // Extract operator and operands from metadata or question text
    const parsed = this.parseProblem(questionItem);
    if (!parsed) return null;

    const { op, a, b, expectedAns } = parsed;
    if (userNum === expectedAns) return null; // Not an error

    switch (op) {
      case '+':
        return this.diagnoseAddition(userNum, a, b, expectedAns, lang);
      case '−':
      case '-':
        return this.diagnoseSubtraction(userNum, a, b, expectedAns, lang);
      case '×':
      case '*':
        return this.diagnoseMultiplication(userNum, a, b, expectedAns, lang);
      case '÷':
      case ':':
      case '/':
        return this.diagnoseDivision(userNum, a, b, expectedAns, lang);
      default:
        return null;
    }
  }

  /**
   * Helper: Extracts numbers and operator from question metadata or equation text
   */
  static parseProblem(qItem) {
    if (qItem.meta && qItem.meta.op && qItem.meta.a !== undefined && qItem.meta.b !== undefined) {
      const a = parseInt(qItem.meta.a, 10);
      const b = parseInt(qItem.meta.b, 10);
      const op = qItem.meta.op;
      let expectedAns;
      if (op === '+') expectedAns = a + b;
      else if (op === '−' || op === '-') expectedAns = a - b;
      else if (op === '×' || op === '*') expectedAns = a * b;
      else if (op === '÷' || op === ':') expectedAns = Math.floor(a / b);
      return { op, a, b, expectedAns };
    }

    // Fallback: Parse question string (e.g. "348 + 275 =" or "7 × 8 =")
    const rawQ = (qItem.q_en || '').replace(/,/g, '');
    const match = rawQ.match(/(\d+)\s*([+\-−×*÷:/])\s*(\d+)/);
    if (match) {
      const a = parseInt(match[1], 10);
      const rawOp = match[2];
      const b = parseInt(match[3], 10);
      let op = rawOp;
      if (rawOp === '*') op = '×';
      if (rawOp === '-') op = '−';
      if (rawOp === ':' || rawOp === '/') op = '÷';

      let expectedAns;
      if (op === '+') expectedAns = a + b;
      else if (op === '−') expectedAns = a - b;
      else if (op === '×') expectedAns = a * b;
      else if (op === '÷') expectedAns = Math.floor(a / b);
      return { op, a, b, expectedAns };
    }

    return null;
  }

  // =========================================================================
  // 1. COLUMN ADDITION DIAGNOSIS
  // =========================================================================
  static diagnoseAddition(userNum, a, b, expectedAns, lang = 'en') {
    const isEs = lang === 'es';
    const aStr = a.toString();
    const bStr = b.toString();
    const maxLen = Math.max(aStr.length, bStr.length);
    const padA = aStr.padStart(maxLen, '0');
    const padB = bStr.padStart(maxLen, '0');

    // 1. Check if student completely ignored all carries (e.g. 348 + 275 -> 513)
    let noCarryDigits = '';
    for (let i = 0; i < maxLen; i++) {
      const colSum = (parseInt(padA[i], 10) + parseInt(padB[i], 10)) % 10;
      noCarryDigits += colSum.toString();
    }
    if (userNum === parseInt(noCarryDigits, 10)) {
      return {
        type: 'add_no_carries',
        hint: isEs
          ? '¡Si una columna suma 10 o más, escribe las unidades y llévate 1 a la siguiente columna!'
          : 'When numbers add to 10 or more, write the ones and carry 1 to next door!'
      };
    }

    // 2. Check column-by-column carry omissions & displacements
    let carry = 0;
    const carries = [];
    for (let i = maxLen - 1; i >= 0; i--) {
      const d1 = parseInt(padA[i], 10);
      const d2 = parseInt(padB[i], 10);
      const colSum = d1 + d2 + carry;
      carries.unshift(colSum >= 10 ? 1 : 0);
      carry = colSum >= 10 ? 1 : 0;
    }

    // Check if the error is exactly missing the carry in a specific column
    const diff = expectedAns - userNum;
    if (diff === 10) {
      return {
        type: 'add_missed_tens_carry',
        hint: isEs
          ? 'Mira la columna de las Decenas: ¿te acordaste de sumar el 1 que te llevabas?'
          : 'Look at the Tens column: remember to add the carried 1 from next door!'
      };
    }
    if (diff === 100) {
      return {
        type: 'add_missed_hundreds_carry',
        hint: isEs
          ? 'Mira la columna de las Centenas: ¿te acordaste de sumar el 1 que te llevabas?'
          : 'Look at the Hundreds column: remember to add the carried 1 from next door!'
      };
    }
    if (diff === 1) {
      return {
        type: 'add_ones_slip',
        hint: isEs
          ? '¡Super cerca! Échale otro vistazo a la columna de las Unidades.'
          : 'Super close! Take another look at the Ones column.'
      };
    }

    // Check operation confusion: Subtracted instead of Added
    if (userNum === Math.abs(a - b)) {
      return {
        type: 'operation_subtracted',
        hint: isEs
          ? '¡Has restado los números! Recuerda que este ejercicio es una SUMA (+).'
          : 'You subtracted! Remember this problem is an ADDITION (+).'
      };
    }

    // Default encouragement
    return {
      type: 'add_general',
      hint: isEs
        ? 'Suma cada columna de derecha a izquierda. ¡Llévate 1 si suma 10 o más!'
        : 'Add each column from right to left. Remember to carry if it makes 10 or more!'
    };
  }

  // =========================================================================
  // 2. COLUMN SUBTRACTION DIAGNOSIS
  // =========================================================================
  static diagnoseSubtraction(userNum, a, b, expectedAns, lang = 'en') {
    const isEs = lang === 'es';
    const aStr = a.toString();
    const bStr = b.toString();
    const maxLen = Math.max(aStr.length, bStr.length);
    const padA = aStr.padStart(maxLen, '0');
    const padB = bStr.padStart(maxLen, '0');

    // 1. Check "Smaller from Larger" mistake (No borrowing, e.g. 5-3 instead of borrowing for 3-5)
    let smallerFromLarger = '';
    for (let i = 0; i < maxLen; i++) {
      const d1 = parseInt(padA[i], 10);
      const d2 = parseInt(padB[i], 10);
      smallerFromLarger += Math.abs(d1 - d2).toString();
    }
    if (userNum === parseInt(smallerFromLarger, 10)) {
      return {
        type: 'sub_smaller_from_larger',
        hint: isEs
          ? 'El número de arriba es más pequeño que el de abajo. ¡Pide 10 prestados al vecino!'
          : 'The top number is smaller than the bottom number. Borrow 10 from next door!'
      };
    }

    // 2. Check if student added instead of subtracted
    if (userNum === a + b) {
      return {
        type: 'operation_added',
        hint: isEs
          ? '¡Has sumado los números! Recuerda que este ejercicio es una RESTA (−).'
          : 'You added! Remember this problem is a SUBTRACTION (−).'
      };
    }

    // 3. Borrowed without decrementing the donor digit (off by 10 or 100)
    const diff = userNum - expectedAns;
    if (diff === 10) {
      return {
        type: 'sub_forgot_decrement_tens',
        hint: isEs
          ? 'Cuando pides 10 prestados, ¡recuerda tachar al vecino de al lado y quitarle 1!'
          : 'When you borrow 10, remember to cross out the neighbor and make it 1 less!'
      };
    }
    if (diff === 100) {
      return {
        type: 'sub_forgot_decrement_hundreds',
        hint: isEs
          ? 'Cuando pides 10 prestados, ¡recuerda tachar al vecino de al lado y quitarle 1!'
          : 'When you borrow 10, remember to cross out the neighbor and make it 1 less!'
      };
    }

    return {
      type: 'sub_general',
      hint: isEs
        ? 'Empieza por la derecha. Si el número de arriba es menor, ¡pide 10 prestados!'
        : 'Start on the right. If the top number is smaller, borrow 10 from next door!'
    };
  }

  // =========================================================================
  // 3. MULTIPLICATION DIAGNOSIS
  // =========================================================================
  static diagnoseMultiplication(userNum, a, b, expectedAns, lang = 'en') {
    const isEs = lang === 'es';

    // Added instead of multiplied (e.g. 7 x 8 = 15)
    if (userNum === a + b) {
      return {
        type: 'mult_added_instead',
        hint: isEs
          ? `Has sumado ${a} + ${b} = ${userNum}. ¡Recuerda multiplicar: ${a} veces ${b}!`
          : `You added ${a} + ${b} = ${userNum}. Remember to multiply: ${a} groups of ${b}!`
      };
    }

    // Off by one factor (e.g. 7 x 8 = 49 which is 7 x 7)
    if (userNum === a * (b - 1)) {
      return {
        type: 'mult_off_by_one_below',
        hint: isEs
          ? `${userNum} es ${a} × ${b - 1}. Para ${a} × ${b}, ¡añade un ${a} más (${userNum} + ${a} = ?)!`
          : `${userNum} is ${a} × ${b - 1}. For ${a} × ${b}, add one more ${a} (${userNum} + ${a} = ?)!`
      };
    }
    if (userNum === a * (b + 1)) {
      return {
        type: 'mult_off_by_one_above',
        hint: isEs
          ? `${userNum} es ${a} × ${b + 1}. Para ${a} × ${b}, resta un ${a} (${userNum} − ${a} = ?)!`
          : `${userNum} is ${a} × ${b + 1}. For ${a} × ${b}, subtract one ${a} (${userNum} − ${a} = ?)!`
      };
    }

    // Multiple of 10 slip (e.g. 30 x 4 = 12 instead of 120)
    if (expectedAns === userNum * 10) {
      return {
        type: 'mult_missing_zero',
        hint: isEs
          ? '¡Casi! No olvides poner el 0 al final para las decenas.'
          : "Almost! Don't forget to put a 0 on the end for tens!"
      };
    }

    return {
      type: 'mult_general',
      hint: isEs
        ? `Cuenta en grupos de ${a}, o revisa la tabla del ${a}.`
        : `Count up in groups of ${a}, or look at your ${a} times table!`
    };
  }

  // =========================================================================
  // 4. DIVISION DIAGNOSIS
  // =========================================================================
  static diagnoseDivision(userNum, a, b, expectedAns, lang = 'en') {
    const isEs = lang === 'es';

    if (userNum === a * b) {
      return {
        type: 'div_multiplied_instead',
        hint: isEs
          ? `¡Has multiplicado! Dividir significa repartir ${a} en ${b} partes iguales.`
          : `You multiplied! Division means sharing ${a} equally into ${b} groups.`
      };
    }

    if (Math.abs(userNum - expectedAns) === 1) {
      return {
        type: 'div_off_by_one',
        hint: isEs
          ? `¡Super cerca! Piensa: ¿cuántos ${b} hacen falta para llegar a ${a}? (${b} × ? = ${a})`
          : `Super close! Think: how many ${b}s make ${a}? (${b} × ? = ${a})`
      };
    }

    return {
      type: 'div_general',
      hint: isEs
        ? `Piensa: ¿qué número multiplicado por ${b} da ${a}?`
        : `Think: what number times ${b} gives ${a}?`
    };
  }

  // =========================================================================
  // 5. STEP-BY-STEP BREAKDOWN GENERATOR
  // =========================================================================
  static generateStepBreakdown(questionItem, lang = 'en') {
    const parsed = this.parseProblem(questionItem);
    if (!parsed) return null;

    const { op, a, b, expectedAns } = parsed;
    const isEs = lang === 'es';

    if (op === '+') {
      return this.generateAdditionSteps(a, b, expectedAns, isEs);
    }
    if (op === '−' || op === '-') {
      return this.generateSubtractionSteps(a, b, expectedAns, isEs);
    }
    if (op === '×') {
      return this.generateMultiplicationSteps(a, b, expectedAns, isEs);
    }
    if (op === '÷') {
      return this.generateDivisionSteps(a, b, expectedAns, isEs);
    }

    return null;
  }

  static generateAdditionSteps(a, b, expectedAns, isEs) {
    const aStr = a.toString();
    const bStr = b.toString();
    const maxLen = Math.max(aStr.length, bStr.length);
    const padA = aStr.padStart(maxLen, '0');
    const padB = bStr.padStart(maxLen, '0');

    const colNamesEn = ['Thousands', 'Hundreds', 'Tens', 'Ones'];
    const colNamesEs = ['Millares', 'Centenas', 'Decenas', 'Unidades'];

    const steps = [];
    let carry = 0;

    for (let i = maxLen - 1; i >= 0; i--) {
      const d1 = parseInt(padA[i], 10);
      const d2 = parseInt(padB[i], 10);
      const nameIndex = 4 - (maxLen - i);
      const colName = isEs ? colNamesEs[nameIndex] : colNamesEn[nameIndex];
      const sum = d1 + d2 + carry;
      const writeDigit = sum % 10;
      const nextCarry = Math.floor(sum / 10);

      let text = '';
      if (isEs) {
        text = carry > 0
          ? `${colName}: ${carry} (llevada) + ${d1} + ${d2} = ${sum}. Escribe ${writeDigit}${nextCarry > 0 ? ` y te llevas ${nextCarry}` : ''}.`
          : `${colName}: ${d1} + ${d2} = ${sum}. Escribe ${writeDigit}${nextCarry > 0 ? ` y te llevas ${nextCarry}` : ''}.`;
      } else {
        text = carry > 0
          ? `${colName}: ${carry} (carried) + ${d1} + ${d2} = ${sum}. Write ${writeDigit}${nextCarry > 0 ? `, carry ${nextCarry}` : ''}.`
          : `${colName}: ${d1} + ${d2} = ${sum}. Write ${writeDigit}${nextCarry > 0 ? `, carry ${nextCarry}` : ''}.`;
      }

      steps.push({
        colName,
        d1,
        d2,
        carryIn: carry,
        sum,
        writeDigit,
        carryOut: nextCarry,
        text
      });

      carry = nextCarry;
    }

    if (carry > 0) {
      steps.push({
        colName: isEs ? 'Última llevada' : 'Final carry',
        d1: 0,
        d2: 0,
        carryIn: carry,
        sum: carry,
        writeDigit: carry,
        carryOut: 0,
        text: isEs ? `Escribe el ${carry} final a la izquierda.` : `Write the remaining ${carry} at the front.`
      });
    }

    return {
      type: 'addition',
      a,
      b,
      expectedAns,
      steps
    };
  }

  static generateSubtractionSteps(a, b, expectedAns, isEs) {
    const aStr = a.toString();
    const bStr = b.toString();
    const maxLen = Math.max(aStr.length, bStr.length);
    const digitsA = aStr.padStart(maxLen, '0').split('').map(d => parseInt(d, 10));
    const digitsB = bStr.padStart(maxLen, '0').split('').map(d => parseInt(d, 10));

    const colNamesEn = ['Thousands', 'Hundreds', 'Tens', 'Ones'];
    const colNamesEs = ['Millares', 'Centenas', 'Decenas', 'Unidades'];

    const steps = [];

    for (let i = maxLen - 1; i >= 0; i--) {
      let d1 = digitsA[i];
      const d2 = digitsB[i];
      const nameIndex = 4 - (maxLen - i);
      const colName = isEs ? colNamesEs[nameIndex] : colNamesEn[nameIndex];
      let borrowed = false;

      if (d1 < d2) {
        // Need to borrow from left
        borrowed = true;
        let k = i - 1;
        while (k >= 0 && digitsA[k] === 0) {
          digitsA[k] = 9;
          k--;
        }
        if (k >= 0) {
          digitsA[k] -= 1;
        }
        d1 += 10;
        digitsA[i] = d1;
      }

      const diff = d1 - d2;
      let text = '';
      if (isEs) {
        text = borrowed
          ? `${colName}: Pide prestado 10. Ahora tenemos ${d1} − ${d2} = ${diff}. Escribe ${diff}.`
          : `${colName}: ${d1} − ${d2} = ${diff}. Escribe ${diff}.`;
      } else {
        text = borrowed
          ? `${colName}: Borrow 10 from next door. Now ${d1} − ${d2} = ${diff}. Write ${diff}.`
          : `${colName}: ${d1} − ${d2} = ${diff}. Write ${diff}.`;
      }

      steps.push({
        colName,
        d1,
        d2,
        borrowed,
        diff,
        text
      });
    }

    return {
      type: 'subtraction',
      a,
      b,
      expectedAns,
      steps
    };
  }

  static generateMultiplicationSteps(a, b, expectedAns, isEs) {
    const steps = [];
    if (b <= 12 && a <= 12) {
      steps.push({
        text: isEs
          ? `Tabla de multiplicar: ${a} × ${b} = ${expectedAns}.`
          : `Multiplication table: ${a} × ${b} = ${expectedAns}.`
      });
      steps.push({
        text: isEs
          ? `Piensa en sumar ${a}, ${b} veces: ${Array(b).fill(a).join(' + ')} = ${expectedAns}.`
          : `Think of adding ${a}, ${b} times: ${Array(b).fill(a).join(' + ')} = ${expectedAns}.`
      });
    } else {
      // 2-digit multiplication breakdown: a x b = (tens + ones) x b
      const tens = Math.floor(a / 10) * 10;
      const ones = a % 10;
      steps.push({
        text: isEs
          ? `Descompón ${a} en ${tens} + ${ones}.`
          : `Break ${a} into ${tens} + ${ones}.`
      });
      if (ones > 0) {
        steps.push({
          text: isEs
            ? `Paso 1: Multiplica las unidades: ${ones} × ${b} = ${ones * b}.`
            : `Step 1: Multiply the ones: ${ones} × ${b} = ${ones * b}.`
        });
      }
      if (tens > 0) {
        steps.push({
          text: isEs
            ? `Paso 2: Multiplica las decenas: ${tens} × ${b} = ${tens * b}.`
            : `Step 2: Multiply the tens: ${tens} × ${b} = ${tens * b}.`
        });
      }
      steps.push({
        text: isEs
          ? `Paso 3: Suma los resultados: ${tens * b} + ${ones * b} = ${expectedAns}.`
          : `Step 3: Add the partial products: ${tens * b} + ${ones * b} = ${expectedAns}.`
      });
    }

    return {
      type: 'multiplication',
      a,
      b,
      expectedAns,
      steps
    };
  }

  static generateDivisionSteps(a, b, expectedAns, isEs) {
    const steps = [];
    steps.push({
      text: isEs
        ? `Queremos averiguar cuántas veces cabe ${b} en ${a}.`
        : `We want to find how many times ${b} fits into ${a}.`
    });
    steps.push({
      text: isEs
        ? `Multiplica hacia atrás: ${b} × ${expectedAns} = ${a}.`
        : `Multiply in reverse: ${b} × ${expectedAns} = ${a}.`
    });
    steps.push({
      text: isEs
        ? `Por lo tanto: ${a} ÷ ${b} = ${expectedAns}.`
        : `Therefore: ${a} ÷ ${b} = ${expectedAns}.`
    });

    return {
      type: 'division',
      a,
      b,
      expectedAns,
      steps
    };
  }
}
