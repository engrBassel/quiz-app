// select elements
const qNumSpan = document.querySelector(".header .q-num-span"),
  category = document.querySelector(".category-span"),
  timerDiv = document.querySelector(".timer"),
  theApp = document.querySelector(".app"),
  qTitleDiv = document.querySelector(".q-title"),
  submitBtn = document.querySelector(".app button"),
  success = document.getElementById("success"),
  fail = document.getElementById("fail");

let minutes,
  seconds,
  currentIndex = 0,
  rightAnswers = 0,
  qDuration = 60,
  timerInterval;

// fetch questions from json file
fetch("questions.json")
  .then((response) => {
    return response.json();
  })
  .then((questions) => {
    // set questions num
    let qNum = questions.length;

    // shuffle questions
    shuffle(questions, qNum, 0);

    // add questions num to page and create bullets
    createBullets(qNum);

    // add question to the page
    addQuestion(questions[currentIndex]);

    // start timer
    timer(qDuration);

    document.addEventListener("keyup", handleEnter);

    // submitBtn clicked
    submitBtn.addEventListener("click", function () {
      // get the right answer
      let rAnswer = questions[currentIndex].rightAnswer;

      // check answer
      checkAnswer(rAnswer);

      setTimeout(() => {
        // increase the index
        currentIndex++;

        // remove the last question
        qTitleDiv.textContent = "";
        theApp.children[1].remove();

        clearInterval(timerInterval);
        // handle the bullets and add question
        if (currentIndex < qNum) {
          handleBullets();
          addQuestion(questions[currentIndex]);
          timer(qDuration);
        } else {
          // show result
          showResult(qNum);
        }
      }, 500);
    });
  });

// add questions num to page and create bullets fn
function createBullets(qNum) {
  // create the bullets container
  let bulletsDiv = document.createElement("div");
  bulletsDiv.className = "bullets";

  // add questions num to page
  qNumSpan.textContent = qNum;

  // create bullets
  for (let i = 0; i < qNum; i++) {
    let bulletSpan = document.createElement("span");
    bulletSpan.className = "bullet";
    if (i == 0) {
      bulletSpan.classList.add("active");
    }
    bulletsDiv.appendChild(bulletSpan);
  }
  // put bulletsDiv before timerDiv
  timerDiv.before(bulletsDiv);
}

// add question to the page fn
function addQuestion(question) {
  // question category
  category.textContent = question.category;

  // question title
  let qTitleH2 = document.createElement("h2"),
    qTitleText = document.createTextNode(question.title);
  qTitleH2.appendChild(qTitleText);
  qTitleDiv.appendChild(qTitleH2);

  // question answers
  let qAnswersDiv = document.createElement("div");
  qAnswersDiv.className = "q-answers";

  // shuffle answers
  shuffle(question, 4, 1);

  // show answers
  for (let i = 1; i <= 4; i++) {
    // create elements
    let qAnswerDiv = document.createElement("div"),
      qInput = document.createElement("input"),
      qLabel = document.createElement("label");

    // set className of qAnswerDiv
    qAnswerDiv.className = "q-answer";

    // set qInput arrributes
    qInput.type = "radio";
    qInput.name = "answer";
    qInput.id = `q-${i}`;
    qInput.dataset.answer = question[`a${i}`];
    if (i == 1) {
      qInput.checked = true;
    }

    // set the qLabel textContent and attribute
    qLabel.textContent = question[`a${i}`];
    qLabel.htmlFor = `q-${i}`;

    // append divs
    qAnswerDiv.append(qInput, qLabel);
    qAnswersDiv.appendChild(qAnswerDiv);
  }

  // append final div
  qTitleDiv.after(qAnswersDiv);
  qAnswersDiv.children[0].children[0].focus();
}

// timer fn
function timer(duration) {
  timerDiv.classList.remove("danger");
  timerInterval = setInterval(() => {
    // calc minutes and seconds
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);

    if (minutes == 0) {
      timerDiv.classList.add("danger");
    }

    // reformat minutes and seconds
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    // show minutes and seconds in the page
    timerDiv.textContent = `${minutes}:${seconds}`;

    // check timer to clear interval
    if (--duration < 0) {
      clearInterval(timerInterval);
      // prevent to click button when timer is zero
      submitBtn.style.pointerEvents = "none";
      setTimeout(() => {
        submitBtn.style.pointerEvents = "initial";
      }, 500);
      submitBtn.click();
    }
  }, 1000);
}

// check answers fn
function checkAnswer(rAnswer) {
  let answersElements = document.getElementsByName("answer");
  for (let i of answersElements) {
    if (i.checked) {
      if (i.dataset.answer == rAnswer) {
        rightAnswers++;
        i.classList.add("right-answer");
        i.nextSibling.classList.add("right-answer");
        success.play();
      } else {
        i.classList.add("wrong-answer");
        i.nextSibling.classList.add("wrong-answer");
        fail.play();
      }
    }
  }
}

// handle bullets
function handleBullets() {
  let bulletsELements = document.querySelectorAll(".bullet");
  bulletsELements[currentIndex].classList.add("active");
}

// shuffle fn
function shuffle(toBeShffled, max, min) {
  // declare variables
  let random;

  // shuffling
  if (Array.isArray(toBeShffled)) {
    while (max > 0) {
      // get random index
      random = Math.floor(Math.random() * max) + min;
      max--;
      [toBeShffled[max], toBeShffled[random]] = [
        toBeShffled[random],
        toBeShffled[max],
      ];
    }
  } else {
    while (max > 0) {
      random = Math.floor(Math.random() * max) + min;
      [toBeShffled[`a${max}`], toBeShffled[`a${random}`]] = [
        toBeShffled[`a${random}`],
        toBeShffled[`a${max}`],
      ];
      max--;
    }
  }
}

// show result fn
function showResult(qNum) {
  // remove enter
  document.removeEventListener("keyup", handleEnter);
  // clear the app
  qTitleDiv.remove();
  submitBtn.remove();
  timerDiv.remove();

  // create result div
  let resultDiv = document.createElement("div"),
    playAgainBtn = document.createElement("button"),
    playAgainTxt = document.createTextNode("Play Again"),
    score = `You got ${rightAnswers} from ${qNum}`;
  resultDiv.className = "result";
  if (rightAnswers == qNum) {
    resultDiv.textContent = `Perfect! You answered all questions right`;
    resultDiv.classList.add("perfect");
  } else if (rightAnswers > qNum / 2 && rightAnswers < qNum) {
    resultDiv.textContent = `Good! ${score}`;
    resultDiv.classList.add("good");
  } else {
    resultDiv.textContent = `Bad! ${score}`;
    resultDiv.classList.add("bad");
  }
  playAgainBtn.appendChild(playAgainTxt);
  playAgainBtn.addEventListener("click", () => {
    location.reload();
  });
  theApp.append(resultDiv, playAgainBtn);
  playAgainBtn.focus();
}

function handleEnter(e) {
  if (e.key == "Enter" && document.activeElement.id != "submit") {
    submitBtn.click();
  }
}
