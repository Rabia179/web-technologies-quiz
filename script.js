
const TOTAL_QUESTIONS = 5;
const TOTAL_SECONDS = 60;

/* Exactly 5 questions */
const questionBank = [
  {
    category: "HTML",
    question: "What is the main purpose of HTML?",
    options: [
      "To structure web pages",
      "To style web pages",
      "To manage databases",
      "To connect to Wi-Fi"
    ],
    answer: "To structure web pages"
  },
  {
    category: "CSS",
    question: "Which CSS property changes text color?",
    options: ["background", "font-style", "color", "text-align"],
    answer: "color"
  },
  {
    category: "JavaScript",
    question: "Which keyword declares a block-scoped variable?",
    options: ["varonly", "let", "define", "include"],
    answer: "let"
  },
  {
    category: "HTML",
    question: "Which HTML tag creates a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: "<a>"
  },
  {
    category: "CSS",
    question: "Which CSS property adds space inside an element's border?",
    options: ["margin", "padding", "outline", "spacing"],
    answer: "padding"
  }
];

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let timeLeft = TOTAL_SECONDS;
let timerInterval = null;
let quizFinished = false;

const $ = (id) => document.getElementById(id);

/* Shuffle answer options only */
function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/* Start or restart quiz */
function setupQuiz() {
  clearInterval(timerInterval);

  // Always use exactly these 5 questions in this order.
  questions = questionBank.map((question) => ({
    ...question,
    options: shuffle(question.options)
  }));

  currentQuestion = 0;
  userAnswers = Array(TOTAL_QUESTIONS).fill(null);
  timeLeft = TOTAL_SECONDS;
  quizFinished = false;

  if ($("quizPanel")) $("quizPanel").style.display = "";
  if ($("resultPanel")) $("resultPanel").style.display = "none";

  createProgressSegments();
  renderQuestion();
  updateTimerDisplay();
  startTimer();
}

/* Create 5 colored progress segments */
function createProgressSegments() {
  const bar = $("progressBar");
  if (!bar) return;

  bar.innerHTML = "";
  bar.style.display = "flex";
  bar.style.gap = "5px";
  bar.style.width = "100%";

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const segment = document.createElement("div");

    segment.style.cssText = `
      flex: 1;
      height: 7px;
      border-radius: 8px;
      background: #475569;
      transition: background .2s ease;
    `;

    bar.appendChild(segment);
  }
}

function updateProgress() {
  const segments = $("progressBar")?.children;

  if (segments) {
    for (let i = 0; i < segments.length; i++) {
      if (userAnswers[i] === null) {
        segments[i].style.background =
          i === currentQuestion ? "#3B82F6" : "#475569";
      } else {
        segments[i].style.background =
          userAnswers[i] === questions[i].answer
            ? "#22C55E"
            : "#EF4444";
      }
    }
  }

  if ($("progressText")) {
    $("progressText").textContent =
      `Question ${currentQuestion + 1} of ${TOTAL_QUESTIONS}`;
  }
}

/* Display question */
function renderQuestion() {
  if (quizFinished) return;

  const question = questions[currentQuestion];

  if ($("questionText")) {
    $("questionText").textContent = question.question;
  }

  if ($("questionCategory")) {
    $("questionCategory").textContent = question.category;
  }

  const container = $("answerOptions");
  if (!container) return;

  container.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.style.cursor = "pointer";

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option;

    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(option));

    container.appendChild(button);
  });

  updateAnswerStyles();
  updateProgress();
  updateNavigation();

  if ($("feedback")) {
    $("feedback").textContent = "";
    $("feedback").style.color = "";
  }
}

/* Select answer */
function selectAnswer(option) {
  if (quizFinished) return;

  userAnswers[currentQuestion] = option;

  updateAnswerStyles();
  updateProgress();
  updateNavigation();

  const feedback = $("feedback");

  if (feedback) {
    const correct = option === questions[currentQuestion].answer;

    feedback.textContent = correct
      ? "✓ Correct answer!"
      : `✗ Incorrect answer. Correct answer: ${questions[currentQuestion].answer}`;

    feedback.style.color = correct ? "#22C55E" : "#EF4444";
    feedback.style.fontWeight = "600";
  }
}

/* Highlight correct and incorrect options */
function updateAnswerStyles() {
  const question = questions[currentQuestion];
  const buttons = $("answerOptions")?.querySelectorAll(".answer-option");

  if (!buttons) return;

  buttons.forEach((button, index) => {
    const option = question.options[index];
    const selected = userAnswers[currentQuestion] === option;

    button.style.border = "2px solid transparent";
    button.style.background = "";

    if (userAnswers[currentQuestion] !== null) {
      if (option === question.answer) {
        button.style.background = "rgba(34,197,94,.15)";
        button.style.borderColor = "#22C55E";
      } else if (selected) {
        button.style.background = "rgba(239,68,68,.15)";
        button.style.borderColor = "#EF4444";
      }
    } else if (selected) {
      button.style.borderColor = "#3B82F6";
    }
  });
}

function updateNavigation() {
  if ($("previousBtn")) {
    $("previousBtn").disabled = currentQuestion === 0;
  }

  if ($("nextBtn")) {
    $("nextBtn").textContent =
      currentQuestion === TOTAL_QUESTIONS - 1
        ? "Finish Quiz"
        : "Next Question";
  }
}

/* Countdown timer */
function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (quizFinished) {
      clearInterval(timerInterval);
      return;
    }

    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function updateTimerDisplay() {
  const timer = $("timer");
  if (!timer) return;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timer.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  timer.style.color = timeLeft <= 30 ? "#EF4444" : "";
}

function goNext() {
  if (quizFinished) return;

  if (currentQuestion < TOTAL_QUESTIONS - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function goPrevious() {
  if (quizFinished || currentQuestion === 0) return;

  currentQuestion--;
  renderQuestion();
}

/* Calculate results */
function finishQuiz() {
  if (quizFinished) return;

  quizFinished = true;
  clearInterval(timerInterval);

  const correct = userAnswers.filter(
    (answer, i) => answer === questions[i].answer
  ).length;

  const wrong = userAnswers.filter(
    (answer, i) => answer !== null && answer !== questions[i].answer
  ).length;

  const unanswered = userAnswers.filter(
    (answer) => answer === null
  ).length;

  const percentage = Math.round((correct / TOTAL_QUESTIONS) * 100);

  if ($("quizPanel")) $("quizPanel").style.display = "none";
  if ($("resultPanel")) $("resultPanel").style.display = "block";

  if ($("resultPercent")) {
    $("resultPercent").textContent = `${percentage}%`;
  }

  if ($("resultHeading")) {
    $("resultHeading").textContent =
      percentage >= 80
        ? "Excellent Work!"
        : percentage >= 60
        ? "Good Job!"
        : "Keep Practicing!";
  }

  if ($("resultMessage")) {
    $("resultMessage").textContent =
      `You answered ${correct} out of ${TOTAL_QUESTIONS} questions correctly.`;
  }

  if ($("correctCount")) $("correctCount").textContent = correct;
  if ($("wrongCount")) $("wrongCount").textContent = wrong;
  if ($("unansweredCount")) $("unansweredCount").textContent = unanswered;

  renderAnswerReview();
  updateProgress();
}

/* Answer review on results screen */
function renderAnswerReview() {
  const container = $("answerReview");
  if (!container) return;

  container.innerHTML = "";

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const correct = userAnswer === question.answer;

    const card = document.createElement("div");

    card.style.cssText = `
      margin: 12px 0;
      padding: 14px;
      border-radius: 12px;
      border-left: 5px solid ${correct ? "#22C55E" : "#EF4444"};
      background: ${correct ? "rgba(34,197,94,.10)" : "rgba(239,68,68,.10)"};
    `;

    const heading = document.createElement("strong");
    heading.textContent = `Q${index + 1}. ${question.question}`;

    const yourAnswer = document.createElement("p");
    yourAnswer.style.margin = "8px 0 4px";
    yourAnswer.textContent =
      `Your answer: ${userAnswer === null ? "Not answered" : userAnswer}`;

    const correctAnswer = document.createElement("p");
    correctAnswer.style.margin = "4px 0";
    correctAnswer.style.color = "#22C55E";
    correctAnswer.textContent = `Correct answer: ${question.answer}`;

    const status = document.createElement("strong");
    status.style.color = correct ? "#16A34A" : "#DC2626";
    status.textContent = correct ? "✓ CORRECT" : "✗ INCORRECT";

    card.append(heading, yourAnswer, correctAnswer, status);
    container.appendChild(card);
  });
}

/* ==================================
   COLORED PDF REPORT - OPEN IN TAB
================================== */

function downloadPDF() {
  const jsPDF = window.jspdf?.jsPDF;

  if (!jsPDF) {
    alert(
      "PDF library load nahi hui. Internet check karo aur page refresh karo."
    );
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const correct = userAnswers.filter(
    (answer, i) => answer === questions[i].answer
  ).length;

  const wrong = userAnswers.filter(
    (answer, i) => answer !== null && answer !== questions[i].answer
  ).length;

  const unanswered = userAnswers.filter(
    (answer) => answer === null
  ).length;

  const percentage = Math.round((correct / TOTAL_QUESTIONS) * 100);

  const navy = [23, 37, 84];
  const blue = [37, 99, 235];
  const green = [22, 163, 74];
  const red = [220, 38, 38];
  const orange = [217, 119, 6];
  const light = [245, 247, 252];
  const dark = [31, 41, 55];
  const muted = [100, 116, 139];

  function roundedBox(x, y, w, h, color) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, h, 3, 3, "F");
  }

  function addFooter() {
    doc.setDrawColor(220, 225, 235);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("CSC336 | Web Technologies Quiz", margin, pageHeight - 8);
    doc.text(
      `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  /* Header */
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 48, "F");

  doc.setFillColor(...blue);
  doc.roundedRect(margin, 9, 3, 27, 1.5, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("WEB TECHNOLOGIES", margin + 8, 18);

  doc.setFontSize(12);
  doc.setTextColor(191, 219, 254);
  doc.text("QUIZ RESULTS REPORT", margin + 8, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text("CSC336 | Assignment 2 | Fall 2026", margin + 8, 34);

  /* Score cards */
  let y = 57;

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Performance Summary", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 7;

  const gap = 3;
  const cardWidth = (contentWidth - gap * 3) / 4;
  const cardHeight = 25;

  const stats = [
    { label: "FINAL SCORE", value: `${percentage}%`, color: blue },
    { label: "CORRECT", value: String(correct), color: green },
    { label: "INCORRECT", value: String(wrong), color: red },
    { label: "UNANSWERED", value: String(unanswered), color: orange }
  ];

  stats.forEach((stat, index) => {
    const x = margin + index * (cardWidth + gap);

    roundedBox(x, y, cardWidth, cardHeight, stat.color);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(stat.value, x + cardWidth / 2, y + 11, {
      align: "center"
    });

    doc.setFontSize(6.5);
    doc.text(stat.label, x + cardWidth / 2, y + 19, {
      align: "center"
    });
  });

  y += cardHeight + 8;

  /* Performance message */
  roundedBox(margin, y, contentWidth, 18, light);

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    percentage >= 80
      ? "Excellent Work!"
      : percentage >= 60
      ? "Good Job!"
      : "Keep Practicing!",
    margin + 5,
    y + 7
  );

  doc.setTextColor(...muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `You scored ${correct} out of ${TOTAL_QUESTIONS} questions correctly.`,
    margin + 5,
    y + 13
  );

  y += 27;

  /* Review heading */
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("QUESTION-BY-QUESTION REVIEW", margin, y);

  y += 8;

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.answer;
    const statusColor = isCorrect ? green : red;

    const questionLines = doc.splitTextToSize(
      `Q${index + 1}. ${question.question}`,
      contentWidth - 12
    );

    const userLines = doc.splitTextToSize(
      `Your answer: ${userAnswer === null ? "Not answered" : userAnswer}`,
      contentWidth - 12
    );

    const answerLines = doc.splitTextToSize(
      `Correct answer: ${question.answer}`,
      contentWidth - 12
    );

    const boxHeight =
      8 +
      questionLines.length * 4.5 +
      userLines.length * 4.5 +
      answerLines.length * 4.5 +
      5;

    if (y + boxHeight > pageHeight - 20) {
      addFooter();
      doc.addPage();
      y = 18;
    }

    roundedBox(margin, y, contentWidth, boxHeight, light);

    doc.setFillColor(...statusColor);
    doc.roundedRect(margin, y, 2, boxHeight, 1, 1, "F");

    let textY = y + 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    doc.text(questionLines, margin + 6, textY);

    textY += questionLines.length * 4.5 + 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...dark);
    doc.text(userLines, margin + 6, textY);

    textY += userLines.length * 4.5 + 1;

    doc.setTextColor(...green);
    doc.text(answerLines, margin + 6, textY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...statusColor);
    doc.text(
      isCorrect ? "CORRECT" : "INCORRECT",
      pageWidth - margin - 4,
      y + 6,
      { align: "right" }
    );

    y += boxHeight + 4;
  });

  addFooter();

  /* Open the generated PDF in a new browser tab */
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const pdfWindow = window.open(pdfUrl, "_blank");

  if (!pdfWindow) {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "WebTechnologies_Quiz_Results.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();

    alert(
      "Pop-up blocked hai, is liye PDF download kar di gayi. Browser mein pop-ups allow kar ke dobara try karo."
    );
  }

  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
}

/* Dark/light theme */
function toggleTheme() {
  document.body.classList.toggle("light-theme");

  try {
    localStorage.setItem(
      "quizTheme",
      document.body.classList.contains("light-theme") ? "light" : "dark"
    );
  } catch (_) {}
}

/* Connect buttons */
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (localStorage.getItem("quizTheme") === "light") {
      document.body.classList.add("light-theme");
    }
  } catch (_) {}

  $("themeToggle")?.addEventListener("click", toggleTheme);
  $("previousBtn")?.addEventListener("click", goPrevious);
  $("nextBtn")?.addEventListener("click", goNext);
  $("downloadPdfBtn")?.addEventListener("click", downloadPDF);
  $("restartBtn")?.addEventListener("click", setupQuiz);

  setupQuiz();
});
