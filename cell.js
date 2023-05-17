class Cell {
	constructor(numOptions, row, col) {
		this.row = row
		this.col = col
		this.step = stepCount++ // increment stepCount and assign to this cell
		// console.log (`Created cell at (${this.row}, ${this.col})`)
		// console.log(this.step);
		console.log("stepCount: " + stepCount)

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