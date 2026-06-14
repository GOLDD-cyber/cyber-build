/*
  JavaScript сайта NEON FORGE.
  Здесь 4 части:
  1) "Цифровой дождь" (matrix-эффект) на главном экране.
  2) Плавное появление блоков при прокрутке вниз.
  3) Кнопка "наверх".
  4) Кнопки "купить"/"в корзину" и форма консультации.
*/

/* ============ 1) MATRIX-ДОЖДЬ НА ГЛАВНОМ ЭКРАНЕ ============ */
// Находим <canvas> — это "холст", на котором можно рисовать через JS.
const canvas = document.querySelector('#matrix');
const ctx = canvas.getContext('2d'); // "ctx" — инструмент для рисования на холсте

// Подгоняем размер холста под размер экрана.
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas); // пересчитать при изменении окна

// Символы, которые будут "падать".
const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/\\|=+'.split('');
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize); // на сколько колонок делим экран
let drops = new Array(columns).fill(1);            // позиция капли в каждой колонке

// Эта функция рисует один "кадр" дождя. Она вызывается много раз в секунду.
function drawMatrix() {
  // Полупрозрачный чёрный поверх — создаёт "шлейф" за падающими символами.
  ctx.fillStyle = 'rgba(4, 20, 13, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ff9c';        // неоновый зелёный
  ctx.font = fontSize + 'px monospace';

  // Для каждой колонки рисуем случайный символ на текущей высоте.
  for (let i = 0; i < drops.length; i++) {
    const char = symbols[Math.floor(Math.random() * symbols.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);

    // Если капля ушла за низ экрана — иногда отправляем её обратно наверх.
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++; // капля опускается ниже
  }
}
setInterval(drawMatrix, 50); // вызываем drawMatrix каждые 50 миллисекунд

/* ============ 2) ПОЯВЛЕНИЕ БЛОКОВ ПРИ ПРОКРУТКЕ ============ */
// IntersectionObserver — "наблюдатель", который сообщает, когда элемент
// появился в видимой части экрана. Тогда добавляем класс с анимацией.
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {                       // блок попал в зону видимости?
      entry.target.classList.add('reveal--visible');  // включаем анимацию появления
      observer.unobserve(entry.target);               // больше за ним не следим
    }
  });
}, { threshold: 0.15 }); // сработает, когда видно ~15% блока

// Подписываем все блоки с классом .reveal на наблюдение.
document.querySelectorAll('.reveal').forEach(function (el) {
  observer.observe(el);
});

/* ============ 3) КНОПКА "НАВЕРХ" ============ */
const toTop = document.querySelector('#toTop');

// Показываем кнопку, когда пользователь прокрутил вниз больше 600px.
window.addEventListener('scroll', function () {
  if (window.scrollY > 600) {
    toTop.classList.add('visible');
  } else {
    toTop.classList.remove('visible');
  }
});

// По клику — плавно прокручиваем страницу в самый верх.
toTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============ 4) КНОПКИ ПОКУПКИ И ФОРМА ============ */
// Все кнопки "Купить"/"В корзину" имеют класс .buy.
// При клике даём короткую обратную связь (меняем текст на пару секунд).
document.querySelectorAll('.buy').forEach(function (button) {
  button.addEventListener('click', function () {
    const original = button.textContent;
    button.textContent = '✓ Добавлено';
    setTimeout(function () { button.textContent = original; }, 1500);
  });
});

// Обработка формы консультации (не перезагружаем страницу, показываем "спасибо").
const form = document.querySelector('#consultForm');
const success = document.querySelector('#formSuccess');
form.addEventListener('submit', function (event) {
  event.preventDefault();
  success.textContent = '✓ ' + form.name.value + ', заявка принята! Инженер свяжется с вами в течение 15 минут.';
  form.reset();
});

/* ============ 5) ОКНО РЕГИСТРАЦИИ ============ */
const authModal = document.querySelector('#authModal');   // само окно
const openAuthBtn = document.querySelector('#openAuth');   // круглая кнопка в шапке

// Открыть окно: показываем его.
function openModal() {
  authModal.classList.add('modal--open');
  authModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // запрещаем прокрутку фона, пока окно открыто
}
// Закрыть окно.
function closeModal() {
  authModal.classList.remove('modal--open');
  authModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // возвращаем прокрутку
}

// Клик по круглой кнопке — открываем окно.
openAuthBtn.addEventListener('click', openModal);

// Любой элемент с атрибутом data-close (крестик и тёмный фон) — закрывает окно.
authModal.querySelectorAll('[data-close]').forEach(function (el) {
  el.addEventListener('click', closeModal);
});

// Клавиша Esc тоже закрывает окно.
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeModal();
});

// Обработка самой формы регистрации.
const registerForm = document.querySelector('#registerForm');
const registerMessage = document.querySelector('#registerMessage');
registerForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // Проверяем, что оба пароля совпадают.
  const pass1 = registerForm.password.value;
  const pass2 = registerForm.password2.value;

  if (pass1 !== pass2) {
    // Не совпали — показываем ошибку красным и выходим.
    registerMessage.className = 'form__error';
    registerMessage.textContent = '✕ Пароли не совпадают';
    return;
  }

  // Всё хорошо — показываем приветствие зелёным.
  registerMessage.className = 'form__success';
  registerMessage.textContent = '✓ Добро пожаловать, ' + registerForm.name.value + '! Аккаунт создан.';
  registerForm.reset();
});
