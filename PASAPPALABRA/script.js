const roscoElement = document.getElementById("rosco");
const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answer-input");
const submitButton = document.getElementById("submit-answer");
const startButton = document.getElementById("start-game");
const skipButton = document.getElementById("skip-question");
const restartButton = document.getElementById("restart-game");

let questions = [];  // Array para las preguntas cargadas
let filteredQuestions = [];  // Array de preguntas jugables (sin "exclude")
let currentQuestionIndex = 0;

// Función para cargar las preguntas desde el archivo JSON
function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            filteredQuestions = questions.filter(q => q.status !== "exclude"); // Excluir las preguntas marcadas
            createRosco();
            startButton.classList.remove("hidden");  // Mostrar el botón de inicio
        })
        .catch(error => {
            console.error('Error al cargar las preguntas:', error);
            alert('Hubo un problema al cargar las preguntas. Intenta de nuevo más tarde.');
        });
}

// Función para crear el rosco
function createRosco() {
    roscoElement.innerHTML = "";
    filteredQuestions.forEach((q) => {
        const letterElement = document.createElement("div");
        letterElement.className = "letter";
        letterElement.textContent = q.letter;
        roscoElement.appendChild(letterElement);
    });
}

// Función para iniciar el juego
function startGame() {
    currentQuestionIndex = 0;
    filteredQuestions.forEach(q => q.status = "unanswered");  // Reiniciar preguntas jugables

    // Restablecer colores de las letras
    resetRoscoColors();

    // Mostrar las preguntas y controles
    questionContainer.classList.remove("hidden");

    // Ocultar el botón de inicio y mostrar el de reiniciar
    startButton.classList.add("hidden");
    restartButton.classList.add("hidden");

    // Mostrar la primera pregunta
    showQuestion();
}

// Restablecer los colores de las letras del rosco
function resetRoscoColors() {
    const letterElements = document.querySelectorAll(".letter");
    letterElements.forEach(letter => {
        letter.classList.remove("correct", "wrong", "skipped");
        letter.classList.add("unanswered");  // Clase por defecto
    });
}

// Mostrar una pregunta
function showQuestion() {
    let attempts = 0;

    while (
        (filteredQuestions[currentQuestionIndex].status === "correct" ||
            filteredQuestions[currentQuestionIndex].status === "wrong") &&
        attempts < filteredQuestions.length
    ) {
        currentQuestionIndex = (currentQuestionIndex + 1) % filteredQuestions.length;
        attempts++;
    }

    if (attempts >= filteredQuestions.length) {
        checkEndGame();
        return;
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
}

// Procesar respuesta
function processAnswer() {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const answer = answerInput.value.trim().toLowerCase();

    const letterElements = document.querySelectorAll(".letter");

    if (answer === currentQuestion.answer) {
        letterElements[currentQuestionIndex].classList.remove("skipped");
        letterElements[currentQuestionIndex].classList.add("correct");
        currentQuestion.status = "correct";
    } else {
        letterElements[currentQuestionIndex].classList.remove("skipped");
        letterElements[currentQuestionIndex].classList.add("wrong");
        currentQuestion.status = "wrong";
    }

    answerInput.value = "";
    checkEndGame() || nextQuestion();
}

// Saltar pregunta
function skipQuestion() {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const letterElements = document.querySelectorAll(".letter");

    if (currentQuestion.status === "unanswered") {
        letterElements[currentQuestionIndex].classList.add("skipped");
        currentQuestion.status = "skipped";
    }

    nextQuestion();
}

// Ir a la siguiente pregunta
function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % filteredQuestions.length;
    showQuestion();
}

// Verificar si el juego terminó
function checkEndGame() {
    const pendingQuestions = filteredQuestions.some(
        (q) => q.status === "unanswered" || q.status === "skipped"
    );

    if (!pendingQuestions) {
        alert("¡Juego terminado!");
        questionContainer.classList.add("hidden");
        restartButton.classList.remove("hidden");
        return true;
    }
    return false;
}

// Función para reiniciar el juego
function restartGame() {
    startGame();
}

// Event listeners
startButton.addEventListener("click", startGame);
submitButton.addEventListener("click", processAnswer);
skipButton.addEventListener("click", skipQuestion);
restartButton.addEventListener("click", restartGame);

// Cargar preguntas al inicio
loadQuestions();
