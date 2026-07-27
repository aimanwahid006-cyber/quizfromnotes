const notesEl = document.getElementById('notes');
const numQuestionsEl = document.getElementById('numQuestions');
const difficultyEl = document.getElementById('difficulty');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');

const quizSection = document.getElementById('quiz-section');
const quizContainer = document.getElementById('quizContainer');
const submitBtn = document.getElementById('submitBtn');
const resultBox = document.getElementById('resultBox');
const restartBtn = document.getElementById('restartBtn');

const historySection = document.getElementById('history-section');
const historyList = document.getElementById('historyList');

let currentQuiz = null;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#f87171' : '#9aa0ab';
}

generateBtn.addEventListener('click', async () => {
  const notes = notesEl.value.trim();
  if (!notes) {
    setStatus('Paste some notes or a topic first.', true);
    return;
  }

  generateBtn.disabled = true;
  setStatus('Generating your quiz... this can take a few seconds.');
  quizSection.classList.add('hidden');
  resultBox.classList.add('hidden');
  submitBtn.classList.add('hidden');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes,
        numQuestions: numQuestionsEl.value,
        difficulty: difficultyEl.value
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server error (${res.status})`);
    }

    const data = await res.json();
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('The AI did not return a valid quiz. Try again.');
    }

    currentQuiz = data.questions;
    renderQuiz(currentQuiz);
    setStatus('');
    quizSection.classList.remove('hidden');
    submitBtn.classList.remove('hidden');
  } catch (err) {
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  } finally {
    generateBtn.disabled = false;
  }
});

function renderQuiz(questions) {
  quizContainer.innerHTML = '';
  questions.forEach((q, qIndex) => {
    const block = document.createElement('div');
    block.className = 'question-block';

    const title = document.createElement('div');
    title.className = 'q-title';
    title.textContent = `${qIndex + 1}. ${q.question}`;
    block.appendChild(title);

    q.options.forEach((opt, optIndex) => {
      const label = document.createElement('label');
      label.className = 'option';
      label.innerHTML = `<input type="radio" name="q${qIndex}" value="${optIndex}"> ${opt}`;
      block.appendChild(label);
    });

    quizContainer.appendChild(block);
  });
}

submitBtn.addEventListener('click', () => {
  if (!currentQuiz) return;

  let score = 0;
  const blocks = quizContainer.querySelectorAll('.question-block');

  currentQuiz.forEach((q, qIndex) => {
    const block = blocks[qIndex];
    const options = block.querySelectorAll('.option');
    const selected = block.querySelector(`input[name="q${qIndex}"]:checked`);
    const selectedValue = selected ? parseInt(selected.value) : -1;
    const correctIndex = q.options.findIndex(
      (o) => o.trim().toLowerCase() === String(q.answer).trim().toLowerCase()
    );
    const correctIdx = correctIndex >= 0 ? correctIndex : 0;

    if (selectedValue === correctIdx) score++;

    options.forEach((optEl, optIndex) => {
      optEl.style.pointerEvents = 'none';
      if (optIndex === correctIdx) {
        optEl.classList.add('correct');
      } else if (optIndex === selectedValue) {
        optEl.classList.add('incorrect');
      }
    });

    if (q.explanation) {
      const exp = document.createElement('div');
      exp.className = 'explanation';
      exp.textContent = `💡 ${q.explanation}`;
      block.appendChild(exp);
    }
  });

  resultBox.textContent = `You scored ${score} / ${currentQuiz.length}`;
  resultBox.classList.remove('hidden');
  submitBtn.classList.add('hidden');
  restartBtn.classList.remove('hidden');

  saveHistory(score, currentQuiz.length);
});

restartBtn.addEventListener('click', () => {
  quizSection.classList.add('hidden');
  restartBtn.classList.add('hidden');
  notesEl.value = '';
  notesEl.focus();
});

function saveHistory(score, total) {
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  history.unshift({
    date: new Date().toLocaleString(),
    score,
    total,
    topic: notesEl.value.trim().slice(0, 60)
  });
  localStorage.setItem('quizHistory', JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  if (history.length === 0) {
    historySection.classList.add('hidden');
    return;
  }
  historySection.classList.remove('hidden');
  historyList.innerHTML = '';
  history.forEach((h) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${h.topic || 'Untitled'}</span><span>${h.score}/${h.total} · ${h.date}</span>`;
    historyList.appendChild(item);
  });
}

renderHistory();
