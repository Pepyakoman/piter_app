if (navigator.appName = "Microsoft Internet Explorer") {
	var _mutation = (function () { // eslint-disable-line no-unused-vars

		function isNode(object) {
			// DOM, Level2
			if (typeof Node === 'function') {
				return object instanceof Node;
			}
			// Older browsers, check if it looks like a Node instance)
			return object &&
				typeof object === "object" && 
				object.nodeName && 
				object.nodeType >= 1 &&
				object.nodeType <= 12;
		}

		// http://dom.spec.whatwg.org/#mutation-method-macro
		return function mutation(nodes) {
			if (nodes.length === 1) {
				return isNode(nodes[0]) ? nodes[0] : document.createTextNode(nodes[0] + '');
			}

			var fragment = document.createDocumentFragment();
			for (var i = 0; i < nodes.length; i++) {
				fragment.appendChild(isNode(nodes[i]) ? nodes[i] : document.createTextNode(nodes[i] + ''));

			}
			return fragment;
		};
	}());

	if (!Element.prototype.remove) {
	    Element.prototype.remove = function remove() {
	      if (this.parentNode) {
	        this.parentNode.removeChild(this);
	      }
	    };
	}

	if (!Document.prototype.prepend || !Element.prototype.prepend) {
		Document.prototype.prepend = Element.prototype.prepend = function prepend() {
			this.insertBefore(_mutation(arguments), this.firstChild);
		};
	}

	if (!Document.prototype.append || !Element.prototype.append) {
		Document.prototype.append = Element.prototype.append = function append() {
			this.appendChild(_mutation(arguments));
		};
	}

	if (!Document.prototype.after || !Element.prototype.after) {
		Document.prototype.after = Element.prototype.after = function after() {
			if (this.parentNode) {
				var args = Array.prototype.slice.call(arguments),
						viableNextSibling = this.nextSibling,
						idx = viableNextSibling ? args.indexOf(viableNextSibling) : -1;

				while (idx !== -1) {
					viableNextSibling = viableNextSibling.nextSibling;
					if (!viableNextSibling) {
						break;
					}
					idx = args.indexOf(viableNextSibling);
				}
				
				this.parentNode.insertBefore(_mutation(arguments), viableNextSibling);
			}
		};
	}

	if (!Document.prototype.replaceWith || !Element.prototype.replaceWith) {
		Document.prototype.replaceWith = Element.prototype.replaceWith = function replaceWith() {
			if (this.parentNode) {
				this.parentNode.replaceChild(_mutation(arguments), this);
			}
		};

		// Not all UAs support the Text constructor.  Polyfill on the Text constructor only where it exists
		// TODO: Add a polyfill for the Text constructor, and make it a dependency of this polyfill.
		if ('Text' in this) {
			Text.prototype.replaceWith = Element.prototype.replaceWith;
		}
	}

	// 7.3.5. CreateMethodProperty ( O, P, V )
	function CreateMethodProperty(O, P, V) { // eslint-disable-line no-unused-vars
		// 1. Assert: Type(O) is Object.
		// 2. Assert: IsPropertyKey(P) is true.
		// 3. Let newDesc be the PropertyDescriptor{[[Value]]: V, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true}.
		var newDesc = {
			value: V,
			writable: true,
			enumerable: false,
			configurable: true
		};
		// 4. Return ? O.[[DefineOwnProperty]](P, newDesc).
		Object.defineProperty(O, P, newDesc);
	}

	/* global GetV, IsCallable */
	// 7.3.9. GetMethod ( V, P )
	function GetMethod(V, P) { // eslint-disable-line no-unused-vars
		// 1. Assert: IsPropertyKey(P) is true.
		// 2. Let func be ? GetV(V, P).
		var func = GetV(V, P);
		// 3. If func is either undefined or null, return undefined.
		if (func === null || func === undefined) {
			return undefined;
		}
		// 4. If IsCallable(func) is false, throw a TypeError exception.
		if (IsCallable(func) === false) {
			throw new TypeError('Method not callable: ' + P);
		}
		// 5. Return func.
		return func;
	}

	if (!Array.from) {
		/* globals
			IsCallable, GetMethod, Symbol, IsConstructor, Construct, ArrayCreate, GetIterator, IteratorClose,
			ToString, IteratorStep, IteratorValue, Call, CreateDataPropertyOrThrow, ToObject, ToLength, Get, CreateMethodProperty
		*/
		(function () {
			var toString = Object.prototype.toString;
			var stringMatch = String.prototype.match;
			// A cross-realm friendly way to detect if a value is a String object or literal.
			function isString(value) {
				if (typeof value === 'string') { return true; }
				if (typeof value !== 'object') { return false; }
				return toString.call(value) === '[object String]';
			}

			// 22.1.2.1. Array.from ( items [ , mapfn [ , thisArg ] ] )
			CreateMethodProperty(Array, 'from', function from(items /* [ , mapfn [ , thisArg ] ] */) { // eslint-disable-line no-undef
				// 1. Let C be the this value.
				var C = this;
				// 2. If mapfn is undefined, let mapping be false.
				var mapfn = arguments.length > 1 ? arguments[1] : undefined;
				if (mapfn === undefined) {
					var mapping = false;
					// 3. Else,
				} else {
					// a. If IsCallable(mapfn) is false, throw a TypeError exception.
					if (IsCallable(mapfn) === false) {
						throw new TypeError(Object.prototype.toString.call(mapfn) + ' is not a function.');
					}
					// b. If thisArg is present, let T be thisArg; else let T be undefined.
					var thisArg = arguments.length > 2 ? arguments[2] : undefined;
					if (thisArg !== undefined) {
						var T = thisArg;
					} else {
						T = undefined;
					}
					// c. Let mapping be true.
					mapping = true;

				}
				// 4. Let usingIterator be ? GetMethod(items, @@iterator).
				var usingIterator = GetMethod(items, Symbol.iterator);
				// 5. If usingIterator is not undefined, then
				if (usingIterator !== undefined) {
					// a. If IsConstructor(C) is true, then
					if (IsConstructor(C)) {
						// i. Let A be ? Construct(C).
						var A = Construct(C);
						// b. Else,
					} else {
						// i. Let A be ! ArrayCreate(0).
						A = ArrayCreate(0);
					}
					// c. Let iteratorRecord be ? GetIterator(items, usingIterator).
					var iteratorRecord = GetIterator(items, usingIterator);
					// d. Let k be 0.
					var k = 0;
					// e. Repeat,
					while (true) {
						// i. If k ≥ 2^53-1, then
						if (k >= (Math.pow(2, 53) - 1)) {
							// 1. Let error be Completion{[[Type]]: throw, [[Value]]: a newly created TypeError object, [[Target]]: empty}.
							var error = new TypeError('Iteration count can not be greater than or equal 9007199254740991.');
							// 2. Return ? IteratorClose(iteratorRecord, error).
							return IteratorClose(iteratorRecord, error);
						}
						// ii. Let Pk be ! ToString(k).
						var Pk = ToString(k);
						// iii. Let next be ? IteratorStep(iteratorRecord).
						var next = IteratorStep(iteratorRecord);
						// iv. If next is false, then
						if (next === false) {
							// 1. Perform ? Set(A, "length", k, true).
							A["length"] = k;
							// 2. Return A.
							return A;
						}
						// v. Let nextValue be ? IteratorValue(next).
						var nextValue = IteratorValue(next);
						// vi. If mapping is true, then
						if (mapping) {
							try {
								// Polyfill.io - The try catch accounts for step 2.
								// 1. Let mappedValue be Call(mapfn, T, « nextValue, k »).
								var mappedValue = Call(mapfn, T, [nextValue, k]);
								// 2. If mappedValue is an abrupt completion, return ? IteratorClose(iteratorRecord, mappedValue).
								// 3. Let mappedValue be mappedValue.[[Value]].
							} catch (e) {
								return IteratorClose(iteratorRecord, e);
							}

							// vii. Else, let mappedValue be nextValue.
						} else {
							mappedValue = nextValue;
						}
						try {
							// Polyfill.io - The try catch accounts for step ix.
							// viii. Let defineStatus be CreateDataPropertyOrThrow(A, Pk, mappedValue).
							CreateDataPropertyOrThrow(A, Pk, mappedValue);
							// ix. If defineStatus is an abrupt completion, return ? IteratorClose(iteratorRecord, defineStatus).
						} catch (e) {
							return IteratorClose(iteratorRecord, e);
						}
						// x. Increase k by 1.
						k = k + 1;
					}
				}
				// 6. NOTE: items is not an Iterable so assume it is an array-like object.
				// 7. Let arrayLike be ! ToObject(items).
				// Polyfill.io - For Strings we need to split astral symbols into surrogate pairs.
				if (isString(items)) {
					var arrayLike = stringMatch.call(items, /[\uD800-\uDBFF][\uDC00-\uDFFF]?|[^\uD800-\uDFFF]|./g) || [];
				} else {
					arrayLike = ToObject(items);
				}
				// 8. Let len be ? ToLength(? Get(arrayLike, "length")).
				var len = ToLength(Get(arrayLike, "length"));
				// 9. If IsConstructor(C) is true, then
				if (IsConstructor(C)) {
					// a. Let A be ? Construct(C, « len »).
					A = Construct(C, [len]);
					// 10. Else,
				} else {
					// a. Let A be ? ArrayCreate(len).
					A = ArrayCreate(len);
				}
				// 11. Let k be 0.
				k = 0;
				// 12. Repeat, while k < len
				while (k < len) {
					// a. Let Pk be ! ToString(k).
					Pk = ToString(k);
					// b. Let kValue be ? Get(arrayLike, Pk).
					var kValue = Get(arrayLike, Pk);
					// c. If mapping is true, then
					if (mapping === true) {
						// i. Let mappedValue be ? Call(mapfn, T, « kValue, k »).
						mappedValue = Call(mapfn, T, [kValue, k]);
						// d. Else, let mappedValue be kValue.
					} else {
						mappedValue = kValue;
					}
					// e. Perform ? CreateDataPropertyOrThrow(A, Pk, mappedValue).
					CreateDataPropertyOrThrow(A, Pk, mappedValue);
					// f. Increase k by 1.
					k = k + 1;
				}
				// 13. Perform ? Set(A, "length", len, true).
				A["length"] = len;
				// 14. Return A.
				return A;
			});
		}());
	}

	/* global ToObject */
	// 7.3.2 GetV (V, P)
	function GetV(v, p) { // eslint-disable-line no-unused-vars
		// 1. Assert: IsPropertyKey(P) is true.
		// 2. Let O be ? ToObject(V).
		var o = ToObject(v);
		// 3. Return ? O.[[Get]](P, V).
		return o[p];
	}

	// 7.1.13 ToObject ( argument )
	// The abstract operation ToObject converts argument to a value of type Object according to Table 12:
	// Table 12: ToObject Conversions
	/*
	|----------------------------------------------------------------------------------------------------------------------------------------------------|
	| Argument Type | Result                                                                                                                             |
	|----------------------------------------------------------------------------------------------------------------------------------------------------|
	| Undefined     | Throw a TypeError exception.                                                                                                       |
	| Null          | Throw a TypeError exception.                                                                                                       |
	| Boolean       | Return a new Boolean object whose [[BooleanData]] internal slot is set to argument. See 19.3 for a description of Boolean objects. |
	| Number        | Return a new Number object whose [[NumberData]] internal slot is set to argument. See 20.1 for a description of Number objects.    |
	| String        | Return a new String object whose [[StringData]] internal slot is set to argument. See 21.1 for a description of String objects.    |
	| Symbol        | Return a new Symbol object whose [[SymbolData]] internal slot is set to argument. See 19.4 for a description of Symbol objects.    |
	| Object        | Return argument.                                                                                                                   |
	|----------------------------------------------------------------------------------------------------------------------------------------------------|
	*/
	function ToObject(argument) { // eslint-disable-line no-unused-vars
		if (argument === null || argument === undefined) {
			throw TypeError();
		}
	  return Object(argument);
	}

	/* global ToInteger */
	// 7.1.15. ToLength ( argument )
	function ToLength(argument) { // eslint-disable-line no-unused-vars
		// 1. Let len be ? ToInteger(argument).
		var len = ToInteger(argument);
		// 2. If len ≤ +0, return +0.
		if (len <= 0) {
			return 0;
		}
		// 3. Return min(len, 253-1).
		return Math.min(len, Math.pow(2, 53) -1);
	}

	// 7.3.1. Get ( O, P )
	function Get(O, P) { // eslint-disable-line no-unused-vars
		// 1. Assert: Type(O) is Object.
		// 2. Assert: IsPropertyKey(P) is true.
		// 3. Return ? O.[[Get]](P, O).
		return O[P];
	}

	// 7.1.4. ToInteger ( argument )
	function ToInteger(argument) { // eslint-disable-line no-unused-vars
		// 1. Let number be ? ToNumber(argument).
		var number = Number(argument);
		// 2. If number is NaN, return +0.
		if (isNaN(number)) {
			return 0;
		}
		// 3. If number is +0, -0, +∞, or -∞, return number.
		if (1/number === Infinity || 1/number === -Infinity || number === Infinity || number === -Infinity) {
			return number;
		}
		// 4. Return the number value that is the same sign as number and whose magnitude is floor(abs(number)).
		return ((number < 0) ? -1 : 1) * Math.floor(Math.abs(number));
	}

	/* global Type */
	// 7.2.4. IsConstructor ( argument )
	function IsConstructor(argument) { // eslint-disable-line no-unused-vars
		// 1. If Type(argument) is not Object, return false.
		if (Type(argument) !== 'object') {
			return false;
		}
		// 2. If argument has a [[Construct]] internal method, return true.
		// 3. Return false.

		// Polyfill.io - `new argument` is the only way  to truly test if a function is a constructor.
		// We choose to not use`new argument` because the argument could have side effects when called.
		// Instead we check to see if the argument is a function and if it has a prototype.
		// Arrow functions do not have a [[Construct]] internal method, nor do they have a prototype.
		return typeof argument === 'function' && !!argument.prototype;
	}

	// "Type(x)" is used as shorthand for "the type of x"...
	function Type(x) { // eslint-disable-line no-unused-vars
		switch (typeof x) {
			case 'undefined':
				return 'undefined';
			case 'boolean':
				return 'boolean';
			case 'number':
				return 'number';
			case 'string':
				return 'string';
			case 'symbol':
				return 'symbol';
			default:
				// typeof null is 'object'
				if (x === null) return 'null';
				// Polyfill.io - This is here because a Symbol polyfill will have a typeof `object`.
				if ('Symbol' in this && x instanceof this.Symbol) return 'symbol';
				return 'object';
		}
	}

	/* global IsConstructor, OrdinaryCreateFromConstructor, Call */
	// 7.3.13. Construct ( F [ , argumentsList [ , newTarget ]] )
	function Construct(F /* [ , argumentsList [ , newTarget ]] */) { // eslint-disable-line no-unused-vars
		// 1. If newTarget is not present, set newTarget to F.
		var newTarget = arguments.length > 2 ? arguments[2] : F;

		// 2. If argumentsList is not present, set argumentsList to a new empty List.
		var argumentsList = arguments.length > 1 ? arguments[1] : [];

		// 3. Assert: IsConstructor(F) is true.
		if (!IsConstructor(F)) {
			throw new TypeError('F must be a constructor.');
		}

		// 4. Assert: IsConstructor(newTarget) is true.
		if (!IsConstructor(newTarget)) {
			throw new TypeError('newTarget must be a constructor.');
		}

		// 5. Return ? F.[[Construct]](argumentsList, newTarget).
		// Polyfill.io - If newTarget is the same as F, it is equivalent to new F(...argumentsList).
		if (newTarget === F) {
			return new (Function.prototype.bind.apply(F, [null].concat(argumentsList)))();
		} else {
			// Polyfill.io - This is mimicking section 9.2.2 step 5.a.
			var obj = OrdinaryCreateFromConstructor(newTarget, Object.prototype);
			return Call(F, obj, argumentsList);
		}
	}

	/* global Type, ToPrimitive */
	// 7.1.12. ToString ( argument )
	// The abstract operation ToString converts argument to a value of type String according to Table 11:
	// Table 11: ToString Conversions
	/*
	|---------------|--------------------------------------------------------|
	| Argument Type | Result                                                 |
	|---------------|--------------------------------------------------------|
	| Undefined     | Return "undefined".                                    |
	|---------------|--------------------------------------------------------|
	| Null	        | Return "null".                                         |
	|---------------|--------------------------------------------------------|
	| Boolean       | If argument is true, return "true".                    |
	|               | If argument is false, return "false".                  |
	|---------------|--------------------------------------------------------|
	| Number        | Return NumberToString(argument).                       |
	|---------------|--------------------------------------------------------|
	| String        | Return argument.                                       |
	|---------------|--------------------------------------------------------|
	| Symbol        | Throw a TypeError exception.                           |
	|---------------|--------------------------------------------------------|
	| Object        | Apply the following steps:                             |
	|               | Let primValue be ? ToPrimitive(argument, hint String). |
	|               | Return ? ToString(primValue).                          |
	|---------------|--------------------------------------------------------|
	*/
	function ToString(argument) { // eslint-disable-line no-unused-vars
		switch(Type(argument)) {
			case 'symbol':
				throw new TypeError('Cannot convert a Symbol value to a string');
				break;
			case 'object':
				var primValue = ToPrimitive(argument, 'string');
				return ToString(primValue);
			default:
				return String(argument);
		}
	}

	/* global CreateDataProperty */
	// 7.3.6. CreateDataPropertyOrThrow ( O, P, V )
	function CreateDataPropertyOrThrow(O, P, V) { // eslint-disable-line no-unused-vars
		// 1. Assert: Type(O) is Object.
		// 2. Assert: IsPropertyKey(P) is true.
		// 3. Let success be ? CreateDataProperty(O, P, V).
		var success = CreateDataProperty(O, P, V);
		// 4. If success is false, throw a TypeError exception.
		if (!success) {
			throw new TypeError('Cannot assign value `' + Object.prototype.toString.call(V) + '` to property `' + Object.prototype.toString.call(P) + '` on object `' + Object.prototype.toString.call(O) + '`');
		}
		// 5. Return success.
		return success;
	}

	// 7.3.4. CreateDataProperty ( O, P, V )
	// NOTE
	// This abstract operation creates a property whose attributes are set to the same defaults used for properties created by the ECMAScript language assignment operator.
	// Normally, the property will not already exist. If it does exist and is not configurable or if O is not extensible, [[DefineOwnProperty]] will return false.
	function CreateDataProperty(O, P, V) { // eslint-disable-line no-unused-vars
		// 1. Assert: Type(O) is Object.
		// 2. Assert: IsPropertyKey(P) is true.
		// 3. Let newDesc be the PropertyDescriptor{ [[Value]]: V, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
		var newDesc = {
			value: V,
			writable: true,
			enumerable: true,
			configurable: true
		};
		// 4. Return ? O.[[DefineOwnProperty]](P, newDesc).
		try {
			Object.defineProperty(O, P, newDesc);
			return true;
		} catch (e) {
			return false;
		}
	}

	(function (Object, GOPS, global) {

		var	setDescriptor;
		var id = 0;
		var random = '' + Math.random();
		var prefix = '__\x01symbol:';
		var prefixLength = prefix.length;
		var internalSymbol = '__\x01symbol@@' + random;
		var DP = 'defineProperty';
		var DPies = 'defineProperties';
		var GOPN = 'getOwnPropertyNames';
		var GOPD = 'getOwnPropertyDescriptor';
		var PIE = 'propertyIsEnumerable';
		var ObjectProto = Object.prototype;
		var hOP = ObjectProto.hasOwnProperty;
		var pIE = ObjectProto[PIE];
		var toString = ObjectProto.toString;
		var concat = Array.prototype.concat;
		var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
		var nGOPN = Object[GOPN];
		var gOPN = function getOwnPropertyNames (obj) {
			if (toString.call(obj) === '[object Window]') {
				try {
					return nGOPN(obj);
				} catch (e) {
					// IE bug where layout engine calls userland gOPN for cross-domain `window` objects
					return concat.call([], cachedWindowNames);
				}
			}
			return nGOPN(obj);
		};
		var gOPD = Object[GOPD];
		var create = Object.create;
		var keys = Object.keys;
		var freeze = Object.freeze || Object;
		var defineProperty = Object[DP];
		var $defineProperties = Object[DPies];
		var descriptor = gOPD(Object, GOPN);
		var addInternalIfNeeded = function (o, uid, enumerable) {
			if (!hOP.call(o, internalSymbol)) {
				try {
					defineProperty(o, internalSymbol, {
						enumerable: false,
						configurable: false,
						writable: false,
						value: {}
					});
				} catch (e) {
					o[internalSymbol] = {};
				}
			}
			o[internalSymbol]['@@' + uid] = enumerable;
		};
		var createWithSymbols = function (proto, descriptors) {
			var self = create(proto);
			gOPN(descriptors).forEach(function (key) {
				if (propertyIsEnumerable.call(descriptors, key)) {
					$defineProperty(self, key, descriptors[key]);
				}
			});
			return self;
		};
		var copyAsNonEnumerable = function (descriptor) {
			var newDescriptor = create(descriptor);
			newDescriptor.enumerable = false;
			return newDescriptor;
		};
		var get = function get(){};
		var onlyNonSymbols = function (name) {
			return name != internalSymbol &&
				!hOP.call(source, name);
		};
		var onlySymbols = function (name) {
			return name != internalSymbol &&
				hOP.call(source, name);
		};
		var propertyIsEnumerable = function propertyIsEnumerable(key) {
			var uid = '' + key;
			return onlySymbols(uid) ? (
				hOP.call(this, uid) &&
				this[internalSymbol]['@@' + uid]
			) : pIE.call(this, key);
		};
		var setAndGetSymbol = function (uid) {
			var descriptor = {
				enumerable: false,
				configurable: true,
				get: get,
				set: function (value) {
				setDescriptor(this, uid, {
					enumerable: false,
					configurable: true,
					writable: true,
					value: value
				});
				addInternalIfNeeded(this, uid, true);
				}
			};
			try {
				defineProperty(ObjectProto, uid, descriptor);
			} catch (e) {
				ObjectProto[uid] = descriptor.value;
			}
			return freeze(source[uid] = defineProperty(
				Object(uid),
				'constructor',
				sourceConstructor
			));
		};
		var Symbol = function Symbol() {
			var description = arguments[0];
			if (this instanceof Symbol) {
				throw new TypeError('Symbol is not a constructor');
			}
			return setAndGetSymbol(
				prefix.concat(description || '', random, ++id)
			);
			};
		var source = create(null);
		var sourceConstructor = {value: Symbol};
		var sourceMap = function (uid) {
			return source[uid];
			};
		var $defineProperty = function defineProp(o, key, descriptor) {
			var uid = '' + key;
			if (onlySymbols(uid)) {
				setDescriptor(o, uid, descriptor.enumerable ?
					copyAsNonEnumerable(descriptor) : descriptor);
				addInternalIfNeeded(o, uid, !!descriptor.enumerable);
			} else {
				defineProperty(o, key, descriptor);
			}
			return o;
		};

		var onlyInternalSymbols = function (obj) {
			return function (name) {
				return hOP.call(obj, internalSymbol) && hOP.call(obj[internalSymbol], '@@' + name);
			};
		};
		var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
			return gOPN(o).filter(o === ObjectProto ? onlyInternalSymbols(o) : onlySymbols).map(sourceMap);
			}
		;

		descriptor.value = $defineProperty;
		defineProperty(Object, DP, descriptor);

		descriptor.value = $getOwnPropertySymbols;
		defineProperty(Object, GOPS, descriptor);

		descriptor.value = function getOwnPropertyNames(o) {
			return gOPN(o).filter(onlyNonSymbols);
		};
		defineProperty(Object, GOPN, descriptor);

		descriptor.value = function defineProperties(o, descriptors) {
			var symbols = $getOwnPropertySymbols(descriptors);
			if (symbols.length) {
			keys(descriptors).concat(symbols).forEach(function (uid) {
				if (propertyIsEnumerable.call(descriptors, uid)) {
				$defineProperty(o, uid, descriptors[uid]);
				}
			});
			} else {
			$defineProperties(o, descriptors);
			}
			return o;
		};
		defineProperty(Object, DPies, descriptor);

		descriptor.value = propertyIsEnumerable;
		defineProperty(ObjectProto, PIE, descriptor);

		descriptor.value = Symbol;
		defineProperty(global, 'Symbol', descriptor);

		// defining `Symbol.for(key)`
		descriptor.value = function (key) {
			var uid = prefix.concat(prefix, key, random);
			return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
		};
		defineProperty(Symbol, 'for', descriptor);

		// defining `Symbol.keyFor(symbol)`
		descriptor.value = function (symbol) {
			if (onlyNonSymbols(symbol))
			throw new TypeError(symbol + ' is not a symbol');
			return hOP.call(source, symbol) ?
			symbol.slice(prefixLength * 2, -random.length) :
			void 0
			;
		};
		defineProperty(Symbol, 'keyFor', descriptor);

		descriptor.value = function getOwnPropertyDescriptor(o, key) {
			var descriptor = gOPD(o, key);
			if (descriptor && onlySymbols(key)) {
			descriptor.enumerable = propertyIsEnumerable.call(o, key);
			}
			return descriptor;
		};
		defineProperty(Object, GOPD, descriptor);

		descriptor.value = function (proto, descriptors) {
			return arguments.length === 1 || typeof descriptors === "undefined" ?
			create(proto) :
			createWithSymbols(proto, descriptors);
		};
		defineProperty(Object, 'create', descriptor);

		descriptor.value = function () {
			var str = toString.call(this);
			return (str === '[object String]' && onlySymbols(this)) ? '[object Symbol]' : str;
		};
		defineProperty(ObjectProto, 'toString', descriptor);


		setDescriptor = function (o, key, descriptor) {
			var protoDescriptor = gOPD(ObjectProto, key);
			delete ObjectProto[key];
			defineProperty(o, key, descriptor);
			if (o !== ObjectProto) {
				defineProperty(ObjectProto, key, protoDescriptor);
			}
		};

	}(Object, 'getOwnPropertySymbols', this));

	Element.prototype.closest = function closest(selector) {
		var node = this;

		while (node) {
			if (node.matches(selector)) return node;
			else node = 'SVGElement' in window && node instanceof SVGElement ? node.parentNode : node.parentElement;
		}

		return null;
	};

	Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || function matches(selector) {

		var element = this;
		var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
		var index = 0;

		while (elements[index] && elements[index] !== element) {
			++index;
		}

		return !!elements[index];
	};

	// 7.2.3. IsCallable ( argument )
	function IsCallable(argument) { // eslint-disable-line no-unused-vars
		// 1. If Type(argument) is not Object, return false.
		// 2. If argument has a [[Call]] internal method, return true.
		// 3. Return false.

		// Polyfill.io - Only function objects have a [[Call]] internal method. This means we can simplify this function to check that the argument has a type of function.
		return typeof argument === 'function';
	}

	/* global IsCallable */
	// 7.3.12. Call ( F, V [ , argumentsList ] )
	function Call(F, V /* [, argumentsList] */) { // eslint-disable-line no-unused-vars
		// 1. If argumentsList is not present, set argumentsList to a new empty List.
		var argumentsList = arguments.length > 2 ? arguments[2] : [];
		// 2. If IsCallable(F) is false, throw a TypeError exception.
		if (IsCallable(F) === false) {
			throw new TypeError(Object.prototype.toString.call(F) + 'is not a function.');
		}
		// 3. Return ? F.[[Call]](V, argumentsList).
		return F.apply(V, argumentsList);
	}

	/* global Call, CreateMethodProperty, Get, IsCallable, ToBoolean, ToLength, ToObject, ToString */
	// 22.1.3.8 Array.prototype.find ( predicate [ , thisArg ] )
	CreateMethodProperty(Array.prototype, 'find', function find( predicate /* [ , thisArg ] */) {
		// 1. Let O be ? ToObject(this value).
		var O = ToObject(this);
		// 2. Let len be ? ToLength(? Get(O, "length")).
		var len = ToLength(Get(O, "length"));
		// 3. If IsCallable(predicate) is false, throw a TypeError exception.
		if (IsCallable(predicate) === false) {
			throw new TypeError(predicate + ' is not a function');
		}
		// 4. If thisArg is present, let T be thisArg; else let T be undefined.
		var T = arguments.length > 1 ? arguments[1] : undefined;
		// 5. Let k be 0.
		var k = 0;
		// 6. Repeat, while k < len
		while (k < len) {
			// a. Let Pk be ! ToString(k).
			var Pk = ToString(k);
			// b. Let kValue be ? Get(O, Pk).
			var kValue = Get(O, Pk);
			// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
			var testResult = ToBoolean(Call(predicate, T, [kValue, k, O ]));
			// d. If testResult is true, return kValue.
			if (testResult) {
				return kValue;
			}
			// e. Increase k by 1.
			var k = k + 1;
		}
		// 7. Return undefined.
		return undefined;
	});

	// 7.1.2. ToBoolean ( argument )
	// The abstract operation ToBoolean converts argument to a value of type Boolean according to Table 9:
	/*
	--------------------------------------------------------------------------------------------------------------
	| Argument Type | Result                                                                                     |
	--------------------------------------------------------------------------------------------------------------
	| Undefined     | Return false.                                                                              |
	| Null          | Return false.                                                                              |
	| Boolean       | Return argument.                                                                           |
	| Number        | If argument is +0, -0, or NaN, return false; otherwise return true.                        |
	| String        | If argument is the empty String (its length is zero), return false; otherwise return true. |
	| Symbol        | Return true.                                                                               |
	| Object        | Return true.                                                                               |
	--------------------------------------------------------------------------------------------------------------
	*/
	function ToBoolean(argument) { // eslint-disable-line no-unused-vars
		return Boolean(argument);
	}
}