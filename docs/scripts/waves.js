const cvs   = document.getElementById('wave');
const ctx   = cvs.getContext('2d');
const DPR   = window.devicePixelRatio || 1;

let lineWidth = 1.5;
let tempo = 0.035; // breathiness

// const baseAmplitude = 110;
// let amplitude = 140; // px
// let freq = 1/50;
// let lambda = -1 * 0.2;

// let speed = 0.05;   // radians per frame
// let stroke = 'hotpink';
// let spreadX = 0.15; // [0, 1]



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

// let t = 0;
// function render() {
//   ctx.clearRect(0, 0, cvs.width, cvs.height);
//   const midY = cvs.height / 2;
//   const midX = cvs.width / 2;
//   const breathe = spreadX * Math.cos(t); // bouncing factor
//   // const breathe = spreadX * 0.08 * ampCustom(t); // bouncing factor

//   // const amp = baseAmplitude * (1 + spread * Math.cos(t));
//   // const amp = ampCustom(t) * 0.45;
//   // const amp = noise1D(t)*30;

//   ctx.beginPath();
//   for (let xScreen = 0; xScreen <= cvs.width; xScreen++) {
//     // map screen -> waves
//     const xFromCenter = xScreen - midX;

//     const p = 0.8; // 0 < p < 1 -> stretch anchors too
//     const power = Math.pow(1 - Math.abs(xFromCenter) / midX, p);
//     const localScale = 1 + breathe * power;
//     const scaledX = xFromCenter / localScale; // fix

//     const decay = Math.exp(lambda * Math.abs(freq * scaledX));
//     const y = midY - decay * Math.cos(2 * Math.PI * freq * scaledX) * baseAmplitude;
//     if (xScreen === 0) {
//       ctx.moveTo(xScreen, y);
//     } else {
//       ctx.lineTo(xScreen, y);
//     }
//   }
//   ctx.strokeStyle = stroke;
//   ctx.stroke();

//   t += tempo; 
//   requestAnimationFrame(render);
// }

// render();

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
    lineWidth,
    strokeStyle: "hotpink",
    animationDirection: "x",
    spread: 0.05,
    amplitude: 110,
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
    lineWidth,
    strokeStyle: "lime",
    animationDirection: "y",
    spread: 0.15,
    amplitude: 50,
    freq: 1/100,
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
    lineWidth,
    strokeStyle: "white",
    animationDirection: "y",
    spread: 0.18,
    amplitude: 50,
    freq: 1/100,
    p: 0.8,
    shapeFn(x) {
      const lambda = -0.55;
      const decay = 0.02*Math.exp(lambda * (1.5 - Math.abs(this.freq * x)));
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