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

/* ============ 1.5) НЕОНОВАЯ СЕТЬ НА ВЕСЬ ФОН САЙТА ============ */
// Этот холст закреплён на весь экран и виден за всеми секциями.
// Рисуем точки, которые медленно плавают, и соединяем линиями те, что рядом, —
// получается "живая сеть", как в фантастике.
const bgfx = document.querySelector('#bgfx');
const bx = bgfx.getContext('2d');
let W, H, particles;

function initBg() {
  W = bgfx.width = window.innerWidth;
  H = bgfx.height = window.innerHeight;
  // количество точек зависит от размера экрана (но не больше 90, чтобы не тормозило)
  const count = Math.min(90, Math.floor((W * H) / 17000));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, // скорость по горизонтали
      vy: (Math.random() - 0.5) * 0.4  // скорость по вертикали
    });
  }
}
initBg();
window.addEventListener('resize', initBg);

function drawBg() {
  bx.clearRect(0, 0, W, H); // стираем прошлый кадр (фон остаётся прозрачным)

  // двигаем и рисуем точки
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    // если точка дошла до края — разворачиваем её обратно
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    bx.fillStyle = 'rgba(0, 255, 156, 0.7)';
    bx.beginPath();
    bx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    bx.fill();
  }

  // соединяем линиями точки, которые ближе 130px (чем ближе — тем ярче линия)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        bx.strokeStyle = 'rgba(0, 255, 156, ' + (0.16 * (1 - dist / 130)) + ')';
        bx.lineWidth = 1;
        bx.beginPath();
        bx.moveTo(particles[i].x, particles[i].y);
        bx.lineTo(particles[j].x, particles[j].y);
        bx.stroke();
      }
    }
  }
  requestAnimationFrame(drawBg); // просим браузер нарисовать следующий кадр (плавно)
}
drawBg();

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
