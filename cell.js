class Cell {
	constructor(numOptions, row, col) {
		this.row = row
		this.col = col
		this.collapsed = false;
		if (numOptions instanceof Array) {
			this.options = numOptions;
		} else {
			this.options = [];
			for (let i = 0; i < numOptions; i++) {
				this.options[i] = i;
			}
		}
	}
}