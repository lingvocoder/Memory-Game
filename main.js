let container = getElementsBySelector("section", "class", 0);
document.addEventListener("DOMContentLoaded", insertEmoji);
container.addEventListener("click", turnCard, true);
let counter = 0;
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

/*Utilities*/
function increaseCounter() {
  return counter++;
}

function decreaseCounter() {
  return counter--;
}

function setCounter(value) {
  return (counter = value);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function insertEmoji() {
  let emojiCards = Array.from(
    getElementsBySelector("section__card_back", "class")
  );
  let shuffledEmojiArray = shuffleArray(emojiArray);
  emojiCards.forEach((card, idx) => {
    handleAttribute(
      card,
      "data",
      "emoji",
      "set",
      shuffledEmojiArray[idx]["emoji"]
    );
    handleAttribute(
      card,
      "data",
      "emoji-type",
      "set",
      shuffledEmojiArray[idx]["type"]
    );
    handleAttribute(card, "data", "idx", "set", 0);
  });
}

function getElementsBySelector(selector, type, idx) {
  let nodes;
  if (selector !== undefined) {
    if (type === "id") {
      nodes = document.getElementById(selector);
    } else if (type === "class" && idx === undefined) {
      nodes = document.getElementsByClassName(selector);
    } else if (type === "class" && idx !== undefined) {
      nodes = document.getElementsByClassName(selector)[idx];
    }
  }
  return nodes;
}

function handleAttribute(elem, prefix, attr, action, value) {
  if (elem === undefined) return;
  let pfx = prefix.concat("-");
  if (action === "get")
    return pfx !== undefined
      ? elem.getAttribute(`${pfx}${attr}`)
      : elem.getAttribute(`${attr}`);
  if (action === "set")
    return pfx !== undefined
      ? elem.setAttribute(`${pfx}${attr}`, value)
      : elem.setAttribute(`${attr}`);
}

function getChildNode(elem) {
  if (elem === undefined) return;
  let childrenArray = Array.from(elem.children);
  let len = childrenArray.length;
  let resArr = [];

  while (len--) {
    if (childrenArray[len].nodeType === 1) {
      resArr.push(childrenArray[len]);
    }
  }
  return resArr;
}

/*Game*/
function turnCard(ev) {
  let card = ev.target.closest(".section__card");
  if (!card) return;

  card.classList.toggle("section__card_turned");

  if (card.classList.contains("section__card_turned")) {
    increaseCounter();
    handleAttribute(card.children[1], "data", "idx", "set", counter);
  } else {
    decreaseCounter();
    handleAttribute(card.children[1], "data", "idx", "set", counter);
  }
  checkMatch(ev);
}

function checkMatch(ev) {
  let noMatchCards = Array.from(
    getElementsBySelector("section__card_nomatch", "class")
  );
  let turnedCards = Array.from(
    getElementsBySelector("section__card_turned", "class")
  );
  let matchCards = Array.from(
    getElementsBySelector("section__card_match", "class")
  );
  let nextCard = ev.target.closest(".section__card");

  if (counter === 3) {
    console.log("counter = " + counter);
    updateTurnedCards(noMatchCards, [
      "section__card_nomatch",
      "section__card_turned",
    ]);
    updateTurnedCards(matchCards);
    updateActiveCard(nextCard);
  }

  if (counter < 2) return;
  let turnedCardsFiltered = turnedCards.filter(
    (c) => c.children[1].getAttribute("data-idx") > 0
  );
  console.log(turnedCardsFiltered);

  let prevCardAttr = handleAttribute(
    getChildNode(turnedCardsFiltered[0])[0],
    "data",
    "emoji-type",
    "get"
  );
  let prevCardIdx = handleAttribute(
    getChildNode(turnedCardsFiltered[0])[0],
    "data",
    "idx",
    "get"
  );

  let currCardAttr = handleAttribute(
    getChildNode(turnedCardsFiltered[1])[0],
    "data",
    "emoji-type",
    "get"
  );
  let currCardIdx = handleAttribute(
    getChildNode(turnedCardsFiltered[1])[0],
    "data",
    "idx",
    "get"
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
}

function updateActiveCard(card) {
  handleAttribute(getChildNode(card)[0], "data", "idx", "set", setCounter(1));
}

function updateTurnedCards(cardsArray, clArray) {
  let cl = clArray || undefined;
  if (cl) {
    cardsArray.forEach((card) => {
      handleAttribute(
        getChildNode(card)[0],
        "data",
        "idx",
        "set",
        setCounter(0)
      );
      card.classList.remove(...cl);
    });
  } else {
    cardsArray.forEach((card) => {
      handleAttribute(
        getChildNode(card)[0],
        "data",
        "idx",
        "set",
        setCounter(0)
      );
    });
  }
}

// function countDown() {
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
// }
