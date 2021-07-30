class Card {
  constructor({ emoji = "", type = "", index = 0 } = {}) {
    this["emoji-type"] = type;
    this.emoji = emoji;
    this.index = index;
    this.render();
    this.handleClick();
  }

  get template() {
    return `
         <div class="section__card">
            <div class="section__card_front"></div>
            <div class="section__card_back"></div>
         </div>
          `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  turnCard(ev) {
    let currentCard = ev.target.closest(".section__card");
    game.gameIsOn = true;
    game.countDownIsOn = true;

    if (!currentCard) return;
    currentCard.classList.toggle("section__card_turned");

    if (currentCard.classList.contains("section__card_turned")) {
      game.increaseCounter();
      game.countMoves();
      const { counter } = game;
      currentCard.children[1].setAttribute("data-index", String(counter));
    } else {
      game.decreaseCounter();
      const { counter } = game;
      currentCard.children[1].setAttribute("data-index", String(counter));
    }
  }

  handleClick() {
    let container = document.getElementsByClassName("section")[0];
    container.addEventListener("click", this.turnCard);
    container.addEventListener("click", game.checkMatch);
  }
}

class Game {
  constructor(data = [], counter = 0, moves = 0) {
    this.data = data;
    this.counter = counter;
    this.moves = moves;
    this.gameIsOn = false;
    this.countDownIsOn = false;
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  increaseCounter = () => this.counter++;

  decreaseCounter = () => this.counter--;

  setCounter = (value) => (this.counter = value);

  countMoves = () => this.moves++;

  updateCurrentCard = (card) => {
    card.children[1].setAttribute("data-index", this.setCounter(1));
  };

  updateTurnedCards = (cardsArray, clsArray) => {
    let cls = clsArray || undefined;
    if (cls) {
      cardsArray.forEach((card) => {
        card.children[1].setAttribute("data-index", this.setCounter(0));
        card.classList.remove(...cls);
      });
    } else {
      cardsArray.forEach((card) => {
        card.children[1].setAttribute("data-index", this.setCounter(0));
      });
    }
  };

  renderCards = () => {
    let container = document.getElementsByClassName("section")[0];

    this.cardsArray.forEach((card) => {
      container.append(card.element);
      for (const cardKey in card) {
        cardKey !== "element"
          ? card.element.children[1].setAttribute(
              `data-${cardKey}`,
              card[cardKey]
            )
          : null;
      }
    });
  };

  checkMatch = (ev) => {
    let nextCard = ev.target.closest(".section__card");

    let noMatchCards = Array.from(
      document.getElementsByClassName("section__card_nomatch")
    );
    let turnedCards = Array.from(
      document.getElementsByClassName("section__card_turned")
    );
    let matchCards = Array.from(
      document.getElementsByClassName("section__card_match")
    );

    if (game.counter === 3) {
      game.updateTurnedCards(noMatchCards, [
        //обнуляем индексы в data-index, снимаем классы
        "section__card_nomatch",
        "section__card_turned",
      ]);
      game.updateTurnedCards(matchCards);
      game.updateCurrentCard(nextCard);
    }

    if (game.counter < 2) return;

    let turnedCardsFiltered = turnedCards.filter(
      (c) => c.children[1].getAttribute("data-index") > 0
    );
    let [prevCard, currCard] = turnedCardsFiltered; //получаем 0 и 1 элементы массива

    let prevCardIdx = prevCard.children[1].getAttribute("data-index");
    let prevCardAttr = prevCard.children[1].getAttribute("data-emoji-type");

    let currCardIdx = currCard.children[1].getAttribute("data-index");
    let currCardAttr = currCard.children[1].getAttribute("data-emoji-type");

    if (prevCardIdx !== "0" && currCardIdx !== "0") {
      //определяем совпадения
      if (prevCardAttr === currCardAttr) {
        prevCard.classList.add("section__card_match");
        currCard.classList.add("section__card_match");
      } else {
        prevCard.classList.add("section__card_nomatch");
        currCard.classList.add("section__card_nomatch");
      }
    }
  };

  startCountDown = (duration) => {
    let start = Date.now(),
      diff,
      minutes,
      seconds;

    function timer() {
      let display = document.getElementsByClassName("main__timer")[0];
      if (game.gameIsOn === false && game.countDownIsOn === false) {
        //показываем таймер при старте (формат: 01:00)
        display.textContent = minutes + ":" + seconds;
      }
      diff = duration - (((Date.now() - start) / 1000) | 0);

      minutes = (diff / 60) | 0;
      seconds = diff % 60 | 0;

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;
      console.log(
        `game:${game.gameIsOn} countDown:${game.countDownIsOn} timer: ${diff}`
      );

      if (diff <= 0) {
        minutes = 0;
        seconds = 0;
        game.gameIsOn = false;
        game.countDownIsOn = false;
        start = Date.now() + 1000;
        clearInterval(timer);
      }
    }

    timer();
    setInterval(timer, 1000);
  };

  checkResult = () => {
    let win;
    let matchCards = Array.from(
      document.getElementsByClassName("section__card_match")
    );
    let turnedCards = Array.from(
      document.getElementsByClassName("section__card_turned")
    );
    if (
      matchCards.length === game.cardsArray.length &&
      game.gameIsOn === true &&
      game.countDownIsOn === true //выиграли в рамках игрового времени
    ) {
      win = true;
      this.showModal(win);
      game.gameIsOn = false;
      game.countDownIsOn = false;
    }
    if (
      matchCards.length < game.cardsArray.length &&
      game.gameIsOn === false &&
      game.countDownIsOn === false
    ) {
      //проиграли в рамках игрового времени
      win = false;
      this.showModal(win);
      game.gameIsOn = false;
      game.countDownIsOn = false;
    }
  };

  showModal = (check) => {
    let modal = document.getElementsByClassName("modal-overlay")[0];
    let text = document.getElementsByClassName("modal-wrapper__title")[0];
    if (check === true) {
      modal.classList.remove("modal-overlay_hide");
      modal.classList.add("modal-overlay_show");
      text.textContent = "win";
    } else {
      modal.classList.remove("modal-overlay_hide");
      modal.classList.add("modal-overlay_show");
      text.textContent = "lose";
    }
  };

  resetField = () => {
    let btn = document.getElementsByClassName("modal-wrapper__btn")[0];
    let modal = document.getElementsByClassName("modal-overlay")[0];
    let matchCards = Array.from(
      document.getElementsByClassName("section__card_match")
    );
    btn.addEventListener("click", function () {
      modal.classList.remove("modal-overlay_show");
      modal.classList.add("modal-overlay_hide");
      game.updateTurnedCards(matchCards, [
        //обнуляем индексы в data-index, снимаем классы
        "section__card_match",
        "section__card_turned",
      ]);
    });
  };

  init = () => {
    let shuffledEmojiArray = this.shuffleArray(this.data);
    this.cardsArray = shuffledEmojiArray.map((emoji) => {
      return new Card(emoji);
    });
    this.startCountDown(60);
    this.renderCards();
  };

  start = () => {
    document.addEventListener("DOMContentLoaded", this.init);
    this.checkMatch();
    this.countMoves();
    this.resetField();
    this.checkResult();
  };
}

let emojiArray = [
  { emoji: "🐭", type: "mouse" },
  { emoji: "🐹", type: "hamster" },
  { emoji: "🐰", type: "rabbit" },
  { emoji: "🐻", type: "bear" },
  { emoji: "🐶", type: "dog" },
  { emoji: "🐱", type: "cat" },
  { emoji: "🐭", type: "mouse" },
  { emoji: "🐹", type: "hamster" },
  { emoji: "🐰", type: "rabbit" },
  { emoji: "🐻", type: "bear" },
  { emoji: "🐶", type: "dog" },
  { emoji: "🐱", type: "cat" },
];
let game = new Game(emojiArray, 0);
game.start();

function countDown() {
  //      var start = Date.now(),
  //   diff,
  //       minutes,
  //       seconds;
  //   function timer() {
  //     // get the number of seconds that have elapsed since
  //     // startTimer() was called
  //     diff = duration - (((Date.now() - start) / 1000) | 0);
  //
  //     // does the same job as parseInt truncates the float
  //     minutes = (diff / 60) | 0;
  //     seconds = (diff % 60) | 0;
  //
  //     minutes = minutes < 10 ? "0" + minutes : minutes;
  //     seconds = seconds < 10 ? "0" + seconds : seconds;
  //
  //     display.textContent = minutes + ":" + seconds;
  //
  //     if (diff <= 0) {
  //       // add one second so that the count down starts at the full duration
  //       // example 05:00 not 04:59
  //       start = Date.now() + 1000;
  //     }
  //   };
  // // we don't want to wait a full second before the timer starts
  //   timer();
  //   setInterval(timer, 1000);
}

/*Срабатывал при  выигрыше и проигрыше (при клике по полю)*/
// let start = Date.now(),
//     diff,
//     minutes,
//     seconds;
//
// this.timer = setInterval(function () {
//   game.countDownIsOn = true;
//   game.gameIsOn = true;
//   let display = document.getElementsByClassName("main__timer")[0];
//
//   if (game.gameIsOn === false && game.countDownIsOn === false) {
//     display.textContent = minutes + ":" + seconds;
//   }
//   diff = duration - (((Date.now() - start) / 1000) | 0);
//
//   minutes = (diff / 60) | 0;
//   seconds = diff % 60 | 0;
//
//   minutes = minutes < 10 ? "0" + minutes : minutes;
//   seconds = seconds < 10 ? "0" + seconds : seconds;
//
//   display.textContent = minutes + ":" + seconds;
//   console.log(game.gameIsOn + ":" + diff);
//
//   if (diff <= 0) {
//     add one second so that the count down starts at the full duration
//     example 05:00 not 04:59
// minutes = 0;
// seconds = 0;
// start = Date.now() + 1000;
// clearInterval(game.timer);
// game.checkResult();
// game.gameIsOn = false;
// game.countDownIsOn = false;
// console.log(game.gameIsOn + ":" + game.gameIsOn + ":" + diff);
// }
// }, 1000);
