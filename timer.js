function startTimer(duration) {
  var timer = duration,
    display,
    minutes,
    seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display = minutes + ":" + seconds;
    if (--timer < 0) {
      timer = duration;
    }
    console.log(display);
  }, 1000);
}

startTimer(1 * 60);
