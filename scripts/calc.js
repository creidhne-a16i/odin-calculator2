let c = Object.create(null);
c.button = Object.create(null);
c.handler = Object.create(null);
c.range = 12;
c.hotkeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', 'Escape', 'Enter', 'Delete', '.', ',', 'Backspace'];
c.locked = false;

c.setup = function() {
	// setup numpad buttons
	for (let i = 0; i <= 9; i++) {
		c.button['n' + i] = document.querySelector('#n' + i);
		c.button['n' + i].addEventListener('click', c.handler.numpad);
	}
	// setup function buttons
	c.button.invert = document.querySelector('#binvert');
	c.button.invert.addEventListener('click', c.handler.sign);
	c.button.dot = document.querySelector('#bdot');
	c.button.dot.addEventListener('click', c.handler.dot);
	c.button.C = document.querySelector('#bC');
	c.button.C.addEventListener('click', c.handler.reset);
	c.button.back = document.querySelector('#bback');
	c.button.back.addEventListener('click', c.handler.backspace);
	// setup operator buttons
	c.button.plus = document.querySelector('#bplus');
	c.button.plus.addEventListener('click', c.handler.func);
	c.button.minus = document.querySelector('#bminus');
	c.button.minus.addEventListener('click', c.handler.func);
	c.button.mult = document.querySelector('#bmult');
	c.button.mult.addEventListener('click', c.handler.func);
	c.button.div = document.querySelector('#bdiv');
	c.button.div.addEventListener('click', c.handler.func);
	c.button.equals = document.querySelector('#bequals');
	c.button.equals.addEventListener('click', c.handler.equals);
	// global hotkey capture
	document.addEventListener('keydown', event => {
		// if capture keycode doesn't match our hotkeys, quit instead of checking rest of the conditions
		if (c.hotkeys.indexOf(event.key) === -1) { return; }
		// prevent browser hotkeys from capturing the event
		event.preventDefault();
		event.stopPropagation();
		// handle captured keys
		if (c.hotkeys.indexOf(event.key) >= 0 && c.hotkeys.indexOf(event.key) < 10) {
			c.button['n' + event.key].click();
		}
		else if (event.key === '+') { c.button.plus.click(); }
		else if (event.key === '-') { c.button.minus.click(); }
		else if (event.key === '*') { c.button.mult.click(); }
		else if (event.key === '/') { c.button.div.click(); }
		else if (event.key === '.' || event.key === ',') { c.button.dot.click(); }
		else if (event.key === 'Escape' || event.key === 'Delete') { c.button.C.click(); }
		else if (event.key === 'Enter') { c.button.equals.click(); }
		else if (event.key === 'Backspace') { c.button.back.click(); }
	});
	// setup displays
	c.main = c.Display.new('#displayMain');
	c.sub = c.Display.Sub.new('#displaySub');
	c.handler.reset();
};

c.handler.reset = function handlerReset() {
	c.operandCurrent = c.Operand.new();
	c.operandStored = null;
	c.operator = null;
	c.locked = false;
	c.sub.clear();
	c.main.clear();
	c.main.el.innerHTML = '0';
};

c.Display = {
	new(element) {
		let o = Object.setPrototypeOf({}, c.Display);
		o.el = document.querySelector(element);
		return o;
	},
	clear() {
		this.el.innerHTML = '';
	},
	lock() {
	},
	update() {
		if (c.operator && !c.operandCurrent) { this.el.innerHTML = c.operator; }
		else { this.el.innerHTML = c.operandCurrent.value; }
	}
};

c.Display.Sub = {
	new(element) {
		let o = c.Display.new(element);
		Object.setPrototypeOf(o, c.Display.Sub);
		return o;
	},
	update() {
		if (!c.operandStored) { this.el.innerHTML = ''; }
		else if (c.operandStored && c.operator && !c.operandCurrent) {
			this.el.innerHTML = c.operandStored.value;
		}
		else { this.el.innerHTML = `${c.operandStored.value} ${c.operator}`; }
	}
};
Object.setPrototypeOf(c.Display.Sub, c.Display);

c.Operand = {
	new(_value = '0', isResult = false) {
		return Object.setPrototypeOf({
			_value: Number(_value).toString(),
			isResult,
			isComplete: false,
			get value() {
				return this._value;
			},
			set value(i) {
				if (this.isComplete) { return; }
				this._value = i;
				c.main.update();
			},
			get lengthunsigned() {
				return (this._value.charAt(0) === '-') ? this._value.length - 1 : this._value.length;
			},
			get lengthraw() {
				let x = Math.round(this._value).toString().length;
				return (this._value.charAt(0) === '-') ? x - 1 : x;
			}
		}, c.Operand);
	},
	hasDot() {
		if (this.value.indexOf('.') !== -1) { return true; }
		else { return false; }
	},
	trimTrailingDot() {
		if (this.value.indexOf('.') === (this.value.length - 1)) {
			this.value = this.value.substring(0, this.value.length - 1);
		}
	},
	hasE() {
		if (this.value.indexOf('e') !== -1) { return true; }
		else { return false; }
	},
	isZero() {
		if (this.value === '0') { return true; }
		else { return false; }
	},
	isNegative() {
		if (this.value.charAt(0) === '-') { return true; }
		else { return false; }
	},
	isNearMaxRange() { // to help prevent adding a dot if it would be the last character added
		if (this.lengthunsigned > c.range - 2) { return true; }
		else { return false; }
	},
	isMaxRange() {
		if (this.lengthunsigned === c.range) { return true; }
		else { return false; }
	},
	exceedsRange() {
		if (this.lengthunsigned > c.range) { return true; }
		else { return false; }
	},
};

c.handler.numpad = function handlerNumpad() {
	if (c.locked) { return; }
	if (c.operator && !c.operandCurrent) {
		c.operandCurrent = c.Operand.new();
		c.main.update();
		c.sub.update();
	}
	if (c.operandCurrent.isMaxRange()) { return; }
	if (c.operandCurrent.isZero()) {
		c.operandCurrent.value = event.target.innerHTML;
	}
	else { c.operandCurrent.value += event.target.innerHTML; }
};
c.handler.dot = function handlerDot() {
	if (c.locked) { return; }
	if (!c.operandCurrent) { return; }
	if (c.operandCurrent.hasDot()) { return; }
	if (c.operandCurrent.isNearMaxRange()) { return; }
	c.operandCurrent.value += event.target.innerHTML;
};
c.handler.func = function handlerFunc() {
	if (c.locked) { return; }
	if (c.operandStored && c.operandCurrent && c.operator) { c.handler.equals(); }
	if (c.locked) { return; }
	if (c.operandCurrent && !c.operator) {
		c.operandCurrent.isResult = false;
		c.operandCurrent.trimTrailingDot();
		c.operandCurrent.isComplete = true;
		c.operandStored = c.operandCurrent;
		c.operandCurrent = null;
	}
	c.operator = event.target.innerHTML;
	c.sub.update();
	c.main.update();
};
c.handler.sign = function handlerSign() {
	if (c.locked) { return; }
	if (!c.operandCurrent) { return; }
	if (c.operandCurrent.isZero()) { return; }
	if (c.operandCurrent.isNegative()) {
		c.operandCurrent.value = c.operandCurrent.value.substring(1, c.operandCurrent.value.length);
	}
	else {
		c.operandCurrent.value = '-' + c.operandCurrent.value;
	}
};
c.handler.backspace = function handlerBackspace() {
	if (c.locked) { return; }
	if (!c.operandStored && !c.operator && c.operandCurrent.isZero()) { return; }
	if (c.operandCurrent && c.operandCurrent.lengthunsigned > 1) {
		c.operandCurrent.value = c.operandCurrent.value.substring(0, c.operandCurrent.value.length - 1);
		return;
	}
	if (!c.operandCurrent || c.operandCurrent.lengthunsigned < 2) {
		if (c.operandCurrent && !c.operandStored && !c.operator) {
			c.operandCurrent.value = '0';
		}
		else if (!c.operandCurrent && c.operator && c.operandStored){
			c.operandCurrent = c.operandStored;
			c.operandCurrent.isComplete = false;
			c.operandStored = null;
			c.operator = null;
		}
		else {
			c.operandCurrent = null;
		}
		c.sub.update();
		c.main.update();
	}
};
c.handler.equals = function handlerEquals() {
	if (c.locked) { return; }
	if (!c.operator || !c.operandCurrent || !c.operandStored) { return; }
	if (c.operandCurrent.isZero() && c.operator === '/') {
		c.locked = true;
		c.sub.el.innerHTML = '';
		c.main.el.innerHTML = 'divide by zero';
	}
	let result;
	let a = parseFloat(c.operandStored.value);
	let b = parseFloat(c.operandCurrent.value);
	if (c.operator === '+') { result = a + b; }
	else if (c.operator === '-') { result = a - b; }
	else if (c.operator === '*') { result = a * b; }
	else if (c.operator === '/') { result = a / b; }
	result = c.Operand.new(result, true);
	if (result.hasE() || (result.exceedsRange() && !result.hasDot()) || (result.lengthraw > c.range)) {
		console.log('out of range variant triggered');
		c.locked = true;
		c.sub.el.innerHTML = '';
		c.main.el.innerHTML = 'out of range';
		return;
	}
	// at this point, the result of operation like 9998.8*100 is 999879.9999999999
	// js sucks for floating point operations
	// code below should round things accurately using exponentials
	let safeDecimals;
	if (result.exceedsRange()) { // if it exceeds range still, then it must have a dot
		console.log('safeDecimals: exceeds range true');
		safeDecimals = (result.value.length - result.value.indexOf('.') - 1) - (result.value.length - c.range);
	}
	else { // doesn't exceed range, but may have dot
		console.log('safeDecimals: exceeds range false');
		safeDecimals = result.value.length - (result.hasDot() ? result.value.indexOf('.') + 1 : result.value.length);
	}
	result.value = Number(Math.round(result.value + 'e' + safeDecimals) + 'e-' + safeDecimals).toString();
	c.operandCurrent = result;
	c.operandStored = null;
	c.operator = null;
	c.sub.update();
	c.main.update();
};