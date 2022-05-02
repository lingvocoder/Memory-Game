class Card {
    constructor({emoji = "", type = ""} = {}) {
        this.type = type;
        this.emoji = emoji;
        this.index = 0;
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
        if (!game.gameIsOn) {
            game.gameIsOn = true;
            game.startCountDown(60);
        }

        if (!currentCard) return;
        currentCard.classList.toggle("section__card_turned");

        if (currentCard.classList.contains("section__card_turned")) {
            game.increaseCounter();
            game.playFlipSound();
            currentCard.children[1].setAttribute("data-index", String(game.counter));
        } else {
            game.decreaseCounter();
            currentCard.children[1].setAttribute("data-index", String(game.counter));
        }
        game.checkMatch(currentCard);
    }

    handleClick() {
        let container = document.getElementsByClassName("section")[0];
        container.addEventListener("click", this.turnCard);
        container.addEventListener("click", game.checkResult);
    }
}

class Game {
    constructor(data = [], counter = 0) {
        this.data = [...data];
        this.counter = counter;
        this.gameIsOn = false;
        this.timer = null;
        this.cardsArray = [];
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

    updateCurrentCard = (card) => {
        card.children[1].setAttribute("data-index", this.setCounter(1));
    };

    playFlipSound() {
        let flipSound = new Audio("assets/flip.wav");
        flipSound.volume = 0.5;
        flipSound.play();
    }

    clearTurnedCards = (cardsArray, clsArray) => {
        let cls = clsArray || [];
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
            console.log(card);
            let cardObjEntries = Object.entries(card).filter(
                (e) => e.indexOf("element") && e.indexOf("emoji")
            );
            container.append(card.element);
            for (const [key, value] of cardObjEntries) {
                card.element.children[1].setAttribute(`data-${key}`, String(value));
            }
            card.element.children[1].innerHTML = String.fromCodePoint(
                card.emoji.codePointAt(0)
            );
        });
    };

    checkMatch = (card) => {
        let nextCard = card;

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
            game.clearTurnedCards(noMatchCards, [
                "section__card_nomatch",
                "section__card_turned",
            ]);
            game.clearTurnedCards(matchCards);
            game.updateCurrentCard(nextCard);
        }

        if (game.counter < 2) return;

        let turnedCardsFiltered = turnedCards.filter(
            (c) => c.children[1].getAttribute("data-index") > 0
        );
        let [prevCard, currCard] = turnedCardsFiltered;

        let prevCardIdx = prevCard.children[1].getAttribute("data-index");
        let prevCardAttr = prevCard.children[1].getAttribute("data-type");

        let currCardIdx = currCard.children[1].getAttribute("data-index");
        let currCardAttr = currCard.children[1].getAttribute("data-type");

        if (prevCardIdx !== "0" && currCardIdx !== "0") {
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
            if (game.gameIsOn === false) {
                display.textContent = minutes + ":" + seconds;
            }
            diff = duration - (((Date.now() - start) / 1000) | 0);

            minutes = (diff / 60) | 0;
            seconds = diff % 60 | 0;

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (diff <= 0) {
                minutes = 0;
                seconds = 0;
                game.gameIsOn = false;
                game.checkResult();
            }
            if (game.gameIsOn === false) {
                clearInterval(game.timer);
            }
        }

        timer();
        this.timer = setInterval(timer, 0);
    };

    checkResult = () => {
        let win;
        let matchCards = Array.from(
            document.getElementsByClassName("section__card_match")
        );

        if (
            matchCards.length === game.cardsArray.length &&
            game.gameIsOn === true
        ) {
            win = true;
            this.showModal(win);
            this.resetField();
            game.gameIsOn = false;
        }
        if (matchCards.length < game.cardsArray.length && game.gameIsOn === false) {
            win = false;
            this.showModal(win);
            this.resetField();
            game.gameIsOn = false;
        }
    };

    showModal = (check) => {
        let modal = document.getElementsByClassName("modal-overlay")[0];
        let titleWrapper = document.getElementsByClassName(
            "modal-wrapper__title"
        )[0];
        let messageText = check === true ? "Win" : "Lose";
        titleWrapper.innerHTML = messageText
            .split("")
            .map((letter) => {
                return `<span class="modal-wrapper__letter">${letter}</span>`;
            })
            .join("");
        setTimeout(function () {
            titleWrapper.childNodes.forEach((node, idx) => {
                setTimeout(() => {
                    node.classList.add("modal-wrapper__letter_animated");
                }, idx * 200);
            });
            modal.classList.toggle("modal-overlay_hide");
        }, 250);
    };

    resetField = () => {
        let btn = document.getElementsByClassName("modal-wrapper__btn")[0];
        let modal = document.getElementsByClassName("modal-overlay")[0];
        let turnedCards = [
            ...document.getElementsByClassName("section__card_turned"),
        ];
        let container = document.getElementsByClassName("section")[0];

        btn.addEventListener("click", function () {
            modal.classList.add("modal-overlay_hide");
            game.clearTurnedCards(turnedCards, [
                "section__card_turned",
                "section__card_match",
                "section__card_nomatch",
            ]);

            setTimeout(function () {
                game.shuffleArray(turnedCards).forEach((card) => {
                    container.append(card);
                });
            }, 200);
        });
    };

    init = () => {
        let shuffledEmojiArray = this.shuffleArray(this.data);
        this.cardsArray = shuffledEmojiArray.map((emoji) => {
            return new Card(emoji);
        });
        this.renderCards();
        game.startCountDown(60);
    };

    start = () => {
        document.addEventListener("DOMContentLoaded", this.init);
        this.checkMatch();
        this.checkResult();
    };
}

let emojiArray = [
    {emoji: "🐭", type: "mouse"},
    {emoji: "🐹", type: "hamster"},
    {emoji: "🐰", type: "rabbit"},
    {emoji: "🐻", type: "bear"},
    {emoji: "🐶", type: "dog"},
    {emoji: "🐱", type: "cat"},
    {emoji: "🐭", type: "mouse"},
    {emoji: "🐹", type: "hamster"},
    {emoji: "🐰", type: "rabbit"},
    {emoji: "🐻", type: "bear"},
    {emoji: "🐶", type: "dog"},
    {emoji: "🐱", type: "cat"},
];
let game = new Game(emojiArray, 0);
game.start();
