class Piece {
    x: number;
    y: number;
    
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    
    move(newX: number, newY: number): void {
        if (this.checkAllowedMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }
    
    checkAllowedMove(newX: number, newY: number): boolean {
        // Beispiel: Validierung für ein 8x8 Brett
        return true;
    }
}

export default Piece;