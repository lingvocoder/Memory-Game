class Card {
  constructor({ emoji = "", type = "", index = 0 } = {}) {
    this["emoji-type"] = type;
    this.emoji = emoji;
    this.index = index;
    this.render();
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
}

class Game {
  constructor(data = [], counter = 0, moves = 0) {
    this.data = data;
    this.counter = counter;
    this.moves = moves;
    this.timer = { min: 0, sec: 0 };
  }

  shuffleArray(arr) {
    return arr
      .map((a) => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);
  }

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

  init = () => {
    let shuffledEmojiArray = this.shuffleArray(this.data);
    this.cardsArray = shuffledEmojiArray.map((emoji) => {
      return new Card(emoji);
    });
    this.startCountDown(1 * 60);
    this.renderCards();
  };

  start = () => {
    document.addEventListener("DOMContentLoaded", this.init);
    this.turnCard();
    this.checkMatch();
    this.countMoves();
    this.showCountDown();
    this.resetField();
  };

  turnCard = () => {
    let container = document.getElementsByClassName("section")[0];
    container.addEventListener("click", function (ev) {
      let card = ev.target.closest(".section__card");

      if (!card) return;

      card.classList.toggle("section__card_turned");

      if (card.classList.contains("section__card_turned")) {
        game.increaseCounter();
        game.countMoves();
        card.children[1].setAttribute("data-index", game.counter);
      } else {
        game.decreaseCounter();
        card.children[1].setAttribute("data-index", game.counter);
      }
      game.checkMatch(ev);
      game.checkResult();
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
        "section__card_nomatch",
        "section__card_turned",
      ]);
      game.updateTurnedCards(matchCards);
      game.updateActiveCard(nextCard);
    }

    if (game.counter < 2) return;

    let turnedCardsFiltered = turnedCards.filter(
      (c) => c.children[1].getAttribute("data-index") > 0
    );

    let prevCardAttr = turnedCardsFiltered[0].children[1].getAttribute(
      "data-emoji-type"
    );
    let prevCardIdx = turnedCardsFiltered[0].children[1].getAttribute(
      "data-index"
    );

    let currCardAttr = turnedCardsFiltered[1].children[1].getAttribute(
      "data-emoji-type"
    );
    let currCardIdx = turnedCardsFiltered[1].children[1].getAttribute(
      "data-index"
    );

    if (prevCardIdx !== 0 && currCardIdx !== 0) {
      if (prevCardAttr === currCardAttr) {
        turnedCardsFiltered[0].classList.add("section__card_match");
        turnedCardsFiltered[1].classList.add("section__card_match");
      } else {
        turnedCardsFiltered[0].classList.add("section__card_nomatch");
        turnedCardsFiltered[1].classList.add("section__card_nomatch");
      }
    }
  };

  increaseCounter = () => this.counter++;

  decreaseCounter = () => this.counter--;

  setCounter = (value) => (this.counter = value);

  countMoves = () => this.moves++;

  startCountDown = (duration) => {
    let timer = duration,
      minutes,
      seconds;
    let display = document.getElementsByClassName("main__timer")[0];

    this.interval = setInterval(function () {
      minutes = parseInt(String(timer / 60), 10);
      seconds = parseInt(String(timer % 60), 10);

      minutes = (minutes < 10 ? "0" : "") + String(minutes);
      seconds = (seconds < 10 ? "0" : "") + String(seconds);

      display.textContent = minutes + ":" + seconds;

      game.gameIsOn = true;
      game.timer.min = parseInt(minutes);
      game.timer.sec = parseInt(seconds);

      timer--;
      if (timer < 0) {
        timer = 0;
        clearInterval(game.interval);
      }
    }, 1000);
  };

  showCountDown = () => {};

  checkResult = () => {
    let { sec, min } = this.timer;
    let win;
    let matchCards = Array.from(
      document.getElementsByClassName("section__card_match")
    );

    if (matchCards.length === game.cardsArray.length && sec > 0) {
      win = true;
      console.log(sec);
      console.log(win);
      this.showModal(win);
      clearInterval(game.interval);
    }
    if (matchCards.length < game.cardsArray.length && sec === 0 && min === 0) {
      win = false;
      console.log(sec);
      console.log(win);
      this.showModal(win);
      clearInterval(game.interval);
    }
  };

  showModal = (res) => {
    let modal = document.getElementsByClassName("modal-overlay")[0];
    let text = document.getElementsByClassName("modal-wrapper__title")[0];
    if (res === true) {
      modal.classList.remove("modal-overlay_hide");
      modal.classList.add("modal-overlay_show");
      text.textContent = "win";
    } else {
      modal.classList.remove("modal-overlay_hide");
      modal.classList.add("modal-overlay_show");
      text.textContent = "lose";
    }
  };

  updateActiveCard = (card) => {
    card.children[1].setAttribute("data-index", this.setCounter(1));
  };

  updateTurnedCards = (cardsArray, clArray) => {
    let cl = clArray || undefined;
    if (cl) {
      cardsArray.forEach((card) => {
        card.children[1].setAttribute("data-index", this.setCounter(0));
        card.classList.remove(...cl);
      });
    } else {
      cardsArray.forEach((card) => {
        card.children[1].setAttribute("data-index", this.setCounter(0));
      });
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
      matchCards.forEach((card) => {
        card.classList.remove("section__card_match");
      });
    });
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
