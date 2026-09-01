/**
 * Math Answer Validator & Candidate Matcher
 */

export class MathValidator {
  static normalizeString(str) {
    if (!str) return '';
    return str.toString().toLowerCase().replace(/[^0-9a-z]/g, '');
  }

  static getValidAnswerSet(questionItem) {
    const validAnswers = new Set();
    const rawNum = (questionItem.num || '').toString().trim();
    const rawEn = (questionItem.a_en || '').toString().trim();
    const rawEs = (questionItem.a_es || '').toString().trim();

    if (rawNum) {
      validAnswers.add(this.normalizeString(rawNum));
      const parsedF = parseFloat(rawNum);
      if (!isNaN(parsedF)) {
        validAnswers.add(this.normalizeString(parsedF.toString()));
        validAnswers.add(this.normalizeString(parsedF.toFixed(2)));
      }
    }

    if (rawEn) validAnswers.add(this.normalizeString(rawEn));
    if (rawEs) validAnswers.add(this.normalizeString(rawEs));

    if (questionItem.aliases && Array.isArray(questionItem.aliases)) {
      questionItem.aliases.forEach((alias) => {
        validAnswers.add(this.normalizeString(alias));
      });
    }

    return validAnswers;
  }

  static checkCandidates(candidateList, questionItem) {
    if (!candidateList || candidateList.length === 0) return false;
    const validSet = this.getValidAnswerSet(questionItem);
    const rawNum = (questionItem.num || '').toString().trim();
    const targetFloat = rawNum && !isNaN(parseFloat(rawNum)) ? parseFloat(rawNum) : null;

    return candidateList.some((candidate) => {
      const cleaned = this.normalizeString(candidate.toString());
      if (!cleaned) return false;
      if (validSet.has(cleaned)) return true;

      // Numeric equivalence check
      const candFloat = parseFloat(cleaned);
      if (!isNaN(candFloat) && targetFloat !== null && candFloat === targetFloat) {
        return true;
      }
      return false;
    });
  }
}
