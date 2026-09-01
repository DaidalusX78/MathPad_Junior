/**
 * Dynamic Math Problem Generator (Division, Multiplication, Addition, Subtraction)
 */

export class DivisionEngine {
  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateDivisionProblem(level = 'medium') {
    let divisor, quotient;
    if (level === 'easy') {
      divisor = this.getRandomInt(2, 6);
      quotient = this.getRandomInt(2, 10);
    } else if (level === 'hard') {
      divisor = this.getRandomInt(6, 12);
      quotient = this.getRandomInt(12, 35);
    } else {
      divisor = this.getRandomInt(3, 9);
      quotient = this.getRandomInt(10, 25);
    }

    const dividend = divisor * quotient;
    return {
      id: `dyn_div_${Date.now()}_${Math.random()}`,
      cat: 'div',
      q_en: `${dividend} ÷ ${divisor} =`,
      q_es: `${dividend} : ${divisor} =`,
      a_en: quotient.toString(),
      a_es: quotient.toString(),
      num: quotient.toString(),
      aliases: [quotient.toString()]
    };
  }

  static generateMultiplicationProblem() {
    const a = this.getRandomInt(4, 15);
    const b = this.getRandomInt(3, 12);
    const prod = a * b;
    return {
      id: `dyn_mult_${Date.now()}_${Math.random()}`,
      cat: 'mult',
      q_en: `${a} × ${b} =`,
      q_es: `${a} × ${b} =`,
      a_en: prod.toString(),
      a_es: prod.toString(),
      num: prod.toString(),
      aliases: [prod.toString()]
    };
  }

  static generateAdditionProblem() {
    const a = this.getRandomInt(120, 890);
    const b = this.getRandomInt(110, 890);
    const sum = a + b;
    return {
      id: `dyn_add_${Date.now()}_${Math.random()}`,
      cat: 'add',
      q_en: `${a} + ${b} =`,
      q_es: `${a} + ${b} =`,
      a_en: sum.toString(),
      a_es: sum.toString(),
      num: sum.toString(),
      aliases: [sum.toString(), sum.toLocaleString('en-US'), sum.toLocaleString('es-ES')]
    };
  }

  static generateSubtractionProblem() {
    const a = this.getRandomInt(350, 1500);
    const b = this.getRandomInt(120, a - 50);
    const diff = a - b;
    return {
      id: `dyn_sub_${Date.now()}_${Math.random()}`,
      cat: 'sub',
      q_en: `${a.toLocaleString('en-US')} − ${b.toLocaleString('en-US')} =`,
      q_es: `${a.toLocaleString('es-ES')} − ${b.toLocaleString('es-ES')} =`,
      a_en: diff.toString(),
      a_es: diff.toString(),
      num: diff.toString(),
      aliases: [diff.toString(), diff.toLocaleString('en-US'), diff.toLocaleString('es-ES')]
    };
  }
}
