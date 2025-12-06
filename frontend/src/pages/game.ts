const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Game objects
const ball = { x: 400, y: 300, vx: 4, vy: 4, radius: 10 };
const paddleLeft = { x: 20, y: 250, width: 10, height: 100 };
const paddleRight = { x: 770, y: 250, width: 10, height: 100 };

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();

  // Draw paddles
  ctx.fillStyle = 'black';
  ctx.fillRect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height);
  ctx.fillRect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height);
}


async function update() {
	const res = await fetch('/api/game/state');
	const data = await res.json();
	document.getElementById('ball')!.textContent = 
	  `Ball: x=${data.ball.x}, y=${data.ball.y}`;
	document.getElementById('player1paddle')!.textContent = 
	  `player1paddle: y=${data.paddleLeft.y}`;
	document.getElementById('player2paddle')!.textContent = 
	  `player2paddle: y=${data.paddleRight.y}`;
}

// Keyboard controls
document.addEventListener('keydown', async (e) => {
	let action: { player: string; direction: string } | null = null;
	if (e.key === 'w') action = { player: 'left', direction: 'up' };
	if (e.key === 's') action = { player: 'left', direction: 'down' };
	if (e.key === 'ArrowUp') action = { player: 'right', direction: 'up' };
	if (e.key === 'ArrowDown') action = { player: 'right', direction: 'down' };

	if (action) {
		await fetch('/api/game/MovePaddle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(action),
		});
	}
});

function gameStart() {
	
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

//gameStart();
//loop();

export default function Game() {
	gameStart();
	loop();
	return `
	  <h1 class="text-2xl font-bold">Home</h1>
	  <p class="mt-2">Welcome to the home page.</p>
	`;
  }