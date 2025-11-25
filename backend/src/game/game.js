let ball = { x: 400, y: 300, vx: 4, vy: 4, radius: 10 };
let paddleLeft = { x: 20, y: 250, width: 10, height: 100, dy: 0 };
let paddleRight = { x: 770, y: 250, width: 10, height: 100, dy: 0 };

// Update game state
function updateGame() {
	// Move paddles
	paddleLeft.y += paddleLeft.dy;
	paddleRight.y += paddleRight.dy;
  
	// Keep paddles in bounds
	paddleLeft.y = Math.max(0, Math.min(canvas.height - paddleLeft.height, paddleLeft.y));
	paddleRight.y = Math.max(0, Math.min(canvas.height - paddleRight.height, paddleRight.y));
  
	// Move ball
	ball.x += ball.vx;
	ball.y += ball.vy;
  
	// Ball collision with top/bottom
	if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
	  ball.vy *= -1;
	}
  
	// Ball collision with paddles
	if (
	  ball.x - ball.radius < paddleLeft.x + paddleLeft.width &&
	  ball.y > paddleLeft.y &&
	  ball.y < paddleLeft.y + paddleLeft.height
	) {
	  ball.vx *= -1;
	  ball.x = paddleLeft.x + paddleLeft.width + ball.radius;
	}
	if (
	  ball.x + ball.radius > paddleRight.x &&
	  ball.y > paddleRight.y &&
	  ball.y < paddleRight.y + paddleRight.height
	) {
	  ball.vx *= -1;
	  ball.x = paddleRight.x - ball.radius;
	}
  
	// Ball out of bounds (reset)
	if (ball.x < 0 || ball.x > canvas.width) {
	  ball.x = 400;
	  ball.y = 300;
	  ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
	  ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
	}
  }

function update() {

}