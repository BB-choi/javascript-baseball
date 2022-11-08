const MissionUtils = require("@woowacourse/mission-utils");
const Utils = require("./Utils");
const { Console } = MissionUtils;
const {
  createUniqueNumbers,
  isNumber,
  hasDuplicateElmentInList,
  isEmptyInput,
  hasWhiteSpace,
} = Utils;

class App {
  _userNumber = null;
  _answer = null;
  _isPlaying = false;

  constructor(digit = 3, minNumber = 1, maxNumber = 9) {
    this.digit = digit;
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
    this.MESSAGES = {
      START: "숫자 야구 게임을 시작합니다.",
      END: "게임 종료",
      RESTART: "게임을 새로 시작하려면 1, 종료하려면 2를 입력하세요.",
      INSERT_NUMBER: `${this.digit}자리 숫자(각 자리 수: ${this.minNumber}~${this.maxNumber})를 입력해주세요 : `,
      ERROR: {
        INSERT: "올바르지 않은 입력입니다.",
        RANGE: `\n각 자리의 수는 ${this.minNumber}부터 ${this.maxNumber}까지 입력할 수 있습니다.`,
        TYPE: "\n숫자만 입력할 수 있습니다.",
        DIGIT: `\n${this.digit}자리 수가 입력되어야 합니다.`,
        DUPLICATE: "\n각 자리의 수는 중복되지 않아야 합니다.",
        END: "\n프로그램을 종료합니다.",
      },
      RESULT: {
        NOTHING: "낫싱",
        CORRECT: `${this.digit}개의 숫자를 모두 맞히셨습니다!`,
        BALL(num) {
          return (num && `${num}볼`) || "";
        },
        STRIKE(num) {
          return (num && `${num}스트라이크`) || "";
        },
      },
    };
  }

  set isPlaying(boolean) {
    this._isPlaying = boolean;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  set answer(number) {
    this._answer = number;
  }

  get answer() {
    return this._answer;
  }

  set userNumber(number) {
    this._userNumber = number;
  }

  get userNumber() {
    return this._userNumber;
  }

  isValidDigit(numbers) {
    return numbers.length === this.digit;
  }

  isValidNumber(number) {
    return number >= this.minNumber && number <= this.maxNumber;
  }

  isValidUserNumberInput(input) {
    const numbers = input.split("").map(Number);

    if (isEmptyInput(input)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}\n입력된 글자가 없습니다.${this.MESSAGES.ERROR.END}`
      );
    }

    if (hasWhiteSpace(input)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}\n입력에 공백이 있습니다.${this.MESSAGES.ERROR.END}`
      );
    }

    if (!numbers.every(isNumber)) {
      throw new TypeError(
        `${this.MESSAGES.ERROR.INSERT}${this.MESSAGES.ERROR.TYPE}${this.MESSAGES.ERROR.END}`
      );
    }

    if (!this.isValidDigit(numbers)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}${this.MESSAGES.ERROR.DIGIT}${this.MESSAGES.ERROR.END}`
      );
    }

    if (!numbers.every(this.isValidNumber.bind(this))) {
      throw new RangeError(
        `${this.MESSAGES.ERROR.INSERT}${this.MESSAGES.ERROR.RANGE}${this.MESSAGES.ERROR.END}`
      );
    }

    if (hasDuplicateElmentInList(numbers)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}${this.MESSAGES.ERROR.DUPLICATE}${this.MESSAGES.ERROR.END}`
      );
    }

    return true;
  }

  inputUserNumbers(input) {
    if (!this.isValidUserNumberInput(input)) {
      return;
    }

    this.userNumber = input.split("").map(Number);
    this.isPlaying = true;
  }
  restart(input) {
    const COMMANDS = {
      1: this.newGame.bind(this),
      2: this.exitGame.bind(this),
    };

    // TODO: 검증 부분 분리
    // TODO: 에러 메시지 정리

    if (isEmptyInput(input)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}\n입력된 글자가 없습니다.${this.MESSAGES.ERROR.END}`
      );
    }

    if (hasWhiteSpace(input)) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}\n입력에 공백이 있습니다.${this.MESSAGES.ERROR.END}`
      );
    }

    if (!COMMANDS[input]) {
      throw new Error(
        `${this.MESSAGES.ERROR.INSERT}${this.MESSAGES.ERROR.END}`
      );
    }
    COMMANDS[input]();
  }

  confirmRestart() {
    Console.readLine(this.MESSAGES.RESTART, this.restart.bind(this));
  }

  continueGame(input) {
    this.inputUserNumbers(input);
    this.compareNumbers();

    if (!this.isPlaying) {
      this.confirmRestart();
      return;
    }

    this.runGame();
  }

  getGameResult({ sameDigitCount, sameNumberCount }) {
    console.log(this.answer);
    if (!sameDigitCount && !sameNumberCount) {
      return this.MESSAGES.RESULT.NOTHING;
    }

    if (sameDigitCount === this.digit) {
      this.isPlaying = false;

      let result = this.MESSAGES.RESULT.STRIKE(sameDigitCount);
      result += "\n";
      result += this.MESSAGES.RESULT.CORRECT;
      result += this.MESSAGES.END;

      return result;
    }

    let result = `${this.MESSAGES.RESULT.BALL(sameNumberCount)}`;
    if (sameNumberCount && sameDigitCount) {
      result += " ";
    }
    result += `${this.MESSAGES.RESULT.STRIKE(sameDigitCount)}`;

    return result;
  }

  compareNumbers() {
    let sameDigitCount = 0;
    let sameNumberCount = 0;

    this.userNumber.forEach((number, idx) => {
      if (number === this.answer[idx]) {
        sameDigitCount++;
        return;
      }

      if (this.answer.includes(number)) {
        sameNumberCount++;
      }
    });

    Console.print(this.getGameResult({ sameDigitCount, sameNumberCount }));
  }

  setAnswer() {
    this.answer = createUniqueNumbers({
      count: this.digit,
      minNumber: this.minNumber,
      maxNumber: this.maxNumber,
    });
  }

  runGame() {
    Console.readLine(this.MESSAGES.INSERT_NUMBER, this.continueGame.bind(this));
  }

  exitGame() {
    Console.print(this.MESSAGES.END);
    Console.close();
  }

  newGame() {
    this.setAnswer();
    this.runGame();
  }

  startGame() {
    Console.print(this.MESSAGES.START);
    this.newGame();
  }

  play() {
    this.startGame();
  }
}

const app = new App();
app.play();

module.exports = App;
