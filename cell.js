class Cell {
	constructor(numOptions, col, row) {
		this.col = col
		this.row = row
		this.step = ""
		this.state = "uncertain";
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