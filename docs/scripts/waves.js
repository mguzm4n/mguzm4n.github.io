const cvs = document.getElementById('waves');
// const myBlur = document.getElementById('blur-effect'); 

// function animateBlur(timestamp) {
//   if (!startTime) startTime = timestamp;
//   const elapsed = timestamp - startTime;
//   const progress = Math.min(elapsed / duration, 1);

//   const currentValue = startValue + (endValue - startValue) * progress;
//   myBlur.setAttribute('stdDeviation', currentValue);

//   cvs.style.filter = 'none'; // Temporarily remove
//   cvs.style.filter = 'url(#gaussian)'; // Re-apply

//   if (progress < 1) {
//     animationFrameId = requestAnimationFrame(animateBlur);
//   } else {
//     animationFrameId = null;
//   }
// }

// cvs.addEventListener('mouseenter', () => {
//   if (animationFrameId) {
//     cancelAnimationFrame(animationFrameId);
//   }
//   startTime = null;
//   startValue = parseFloat(myBlur.getAttribute('stdDeviation')) || 0; // Get current blur level
//   endValue = maxBlur;
//   animationFrameId = requestAnimationFrame(animateBlur);
// });

// cvs.addEventListener('mouseleave', () => {
//   if (animationFrameId) {
//     cancelAnimationFrame(animationFrameId);
//   }
//   startTime = null;
//   startValue = parseFloat(myBlur.getAttribute('stdDeviation')) || 0; // Get current blur level
//   endValue = 0;
//   animationFrameId = requestAnimationFrame(animateBlur);
// });

const ctx   = cvs.getContext('2d');
const DPR   = window.devicePixelRatio || 1;

let lineWidth = 3;
let tempo = 0.035; // breathiness

function ampCustom(t) {
  return 140 + 40 * Math.sin(0.8 * t) + 30 * Math.sin(0.13 * t);
}

function noise1D(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const rand = n => Math.sin(n * 127.1) * 43758.5453 % 1; // hash
  return (1 - u) * rand(i) + u * rand(i + 1);
}


class CanvasWave {
  lineWidth = 0;
  strokeStyle = 0;
  animationDirection = "";
  spread = 0;
  amplitude = 0;
  freq = 0;
  p = 1;


  breatheFn = null;
  shapeFn = null;

  constructor(opts) {
    Object.assign(this, opts);
  }

  draw(t, cvs, ctx) {
    const midY = cvs.height / 2;
    const midX = cvs.width / 2;

    const breathe = this.breatheFn(t);

    ctx.lineWidth = this.lineWidth * DPR;
    ctx.strokeStyle = this.strokeStyle;
    ctx.beginPath();
    for (let x = 0; x <= cvs.width; x++) {
      const xFromCenter = x - midX;
      let xNorm = xFromCenter;
      let amp = this.amplitude;

      if (this.animationDirection === "x") {
        const intensity = Math.pow(1 - Math.abs(xFromCenter) / midX, this.p);      
        const localScale = 1 + this.spread * (breathe * intensity);

        xNorm = xFromCenter / localScale;
      } else { // y
        amp = this.amplitude * (1 + this.spread * breathe);
      }

      let wave = amp * this.shapeFn(xNorm);
      const y = midY - wave;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

const waves = [
  new CanvasWave({
    lineWidth: 1.5,
    strokeStyle: "hotpink",
    animationDirection: "x",
    spread: 0.05,
    amplitude: 200,
    freq: 1/45,
    p: 0.5,
    shapeFn(x) {
      const lambda = -0.2;
      const decay = Math.exp(lambda * Math.abs(this.freq * x));
      return decay * Math.cos(2 * Math.PI * this.freq * x);
    },
    breatheFn(x) {
      return Math.cos(x);
    },
  }),
  new CanvasWave({
    lineWidth: 3,
    strokeStyle: "lime",
    animationDirection: "y",
    spread: 0.15,
    amplitude: 100,
    freq: 1/200,
    p: 0.8,
    shapeFn(x) {
      const lambda = -0.55;
      const decay = Math.exp(lambda * Math.abs(this.freq * x));
      return decay * Math.cos(2 * Math.PI * this.freq * x);
    },
    breatheFn(x) {
      return 2.5*noise1D(x);
    },
  }),
  new CanvasWave({
    lineWidth: 1.5,
    strokeStyle: "white",
    animationDirection: "y",
    spread: 0.010,
    amplitude: 50,
    freq: 1/100,
    shapeFn(x) {
      const lambda = -0.65;
      const decay = 0.015*Math.exp(lambda * (1 - Math.abs(this.freq * x)));
      return decay * Math.cos(2 * Math.PI * this.freq * x);
    },
    breatheFn(x) {
      return 0.5*ampCustom(x);
    },
  }),
]

function fitCanvas() {
  cvs.width  = cvs.clientWidth  * DPR;
  cvs.height = cvs.clientHeight * DPR;
}

fitCanvas();
addEventListener('resize', fitCanvas);

let t = 0;
function render() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  waves.forEach(w => w.draw(t, cvs, ctx));
  t += tempo;
  requestAnimationFrame(render);
}

render();