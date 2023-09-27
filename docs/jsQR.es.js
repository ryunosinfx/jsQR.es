(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();
	else if (typeof define === 'function' && define.amd) define([], factory);
	else if (typeof exports === 'object') exports['jsQR'] = factory();
	else root['jsQR'] = factory();
})(typeof self !== 'undefined' ? self : this, function () {
	return /******/ (function (modules) {
		// webpackBootstrap
		/******/ // The module cache
		/******/ var installedModules = {};
		/******/
		/******/ // The require function
		/******/ function __webpack_require__(moduleId) {
			/******/
			/******/ // Check if module is in cache
			/******/ if (installedModules[moduleId]) {
				/******/ return installedModules[moduleId].exports;
				/******/
			}
			/******/ // Create a new module (and put it into the cache)
			/******/ var module = (installedModules[moduleId] = {
				/******/ i: moduleId,
				/******/ l: false,
				/******/ exports: {},
				/******/
			});
			/******/
			/******/ // Execute the module function
			/******/ modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
			/******/
			/******/ // Flag the module as loaded
			/******/ module.l = true;
			/******/
			/******/ // Return the exports of the module
			/******/ return module.exports;
			/******/
		}
		/******/
		/******/
		/******/ // expose the modules object (__webpack_modules__)
		/******/ __webpack_require__.m = modules;
		/******/
		/******/ // expose the module cache
		/******/ __webpack_require__.c = installedModules;
		/******/
		/******/ // define getter function for harmony exports
		/******/ __webpack_require__.d = function (exports, name, getter) {
			/******/ if (!__webpack_require__.o(exports, name)) {
				/******/ Object.defineProperty(exports, name, {
					/******/ configurable: false,
					/******/ enumerable: true,
					/******/ get: getter,
					/******/
				});
				/******/
			}
			/******/
		};
		/******/
		/******/ // getDefaultExport function for compatibility with non-harmony modules
		/******/ __webpack_require__.n = function (module) {
			/******/ var getter =
				module && module.__esModule
					? /******/ function getDefault() {
							return module['default'];
					  }
					: /******/ function getModuleExports() {
							return module;
					  };
			/******/ __webpack_require__.d(getter, 'a', getter);
			/******/ return getter;
			/******/
		};
		/******/
		/******/ // Object.prototype.hasOwnProperty.call
		/******/ __webpack_require__.o = function (object, property) {
			return Object.prototype.hasOwnProperty.call(object, property);
		};
		/******/
		/******/ // __webpack_public_path__
		/******/ __webpack_require__.p = '';
		/******/
		/******/ // Load entry module and return exports
		/******/ return __webpack_require__((__webpack_require__.s = 3));
		/******/
	})(
		/************************************************************************/
		/******/ [
			/* 0 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';
				Object.defineProperty(exports, '__esModule', { value: true });
				class BitMatrix {
					constructor(data, width) {
						this.width = width;
						this.height = data.length / width;
						this.data = data;
					}
					static createEmpty(width, height) {
						return new BitMatrix(new Uint8ClampedArray(width * height), width);
					}
					get(x, y) {
						if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
						return !!this.data[y * this.width + x];
					}
					set(x, y, v) {
						this.data[y * this.width + x] = v ? 1 : 0;
					}
					setRegion(left, top, width, height, v) {
						for (let y = top; y < top + height; y++)
							for (let x = left; x < left + width; x++) this.set(x, y, !!v);
					}
				}
				exports.BitMatrix = BitMatrix;
			},
			/* 1 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';
				Object.defineProperty(exports, '__esModule', { value: true });
				const GenericGFPoly_1 = __webpack_require__(2);
				function addOrSubtractGF(a, b) {
					return a ^ b; // tslint:disable-line:no-bitwise
				}
				exports.addOrSubtractGF = addOrSubtractGF;
				class GenericGF {
					constructor(primitive, size, genBase) {
						this.primitive = primitive;
						this.size = size;
						this.generatorBase = genBase;
						this.expTable = new Array(this.size);
						this.logTable = new Array(this.size);
						let x = 1;
						for (var i = 0; i < this.size; i++) {
							this.expTable[i] = x;
							x = x * 2;
							if (x >= this.size) x = (x ^ this.primitive) & (this.size - 1); // tslint:disable-line:no-bitwise
						}
						for (let i = 0; i < this.size - 1; i++) this.logTable[this.expTable[i]] = i;
						this.zero = new GenericGFPoly_1.default(this, Uint8ClampedArray.from([0]));
						this.one = new GenericGFPoly_1.default(this, Uint8ClampedArray.from([1]));
					}
					multiply(a, b) {
						if (a === 0 || b === 0) return 0;
						return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
					}
					inverse(a) {
						if (a === 0) throw new Error("Can't invert 0");
						return this.expTable[this.size - this.logTable[a] - 1];
					}
					buildMonomial(degree, coefficient) {
						if (degree < 0) throw new Error('Invalid monomial degree less than 0');
						if (coefficient === 0) return this.zero;
						const coefficients = new Uint8ClampedArray(degree + 1);
						coefficients[0] = coefficient;
						return new GenericGFPoly_1.default(this, coefficients);
					}
					log(a) {
						if (a === 0) throw new Error("Can't take log(0)");
						return this.logTable[a];
					}
					exp(a) {
						return this.expTable[a];
					}
				}
				exports.default = GenericGF;
			},
			/* 2 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';
				Object.defineProperty(exports, '__esModule', { value: true });
				const GenericGF_1 = __webpack_require__(1);
				class GenericGFPoly {
					constructor(field, coefficients) {
						if (coefficients.length === 0) throw new Error('No coefficients.');
						this.field = field;
						const coefficientsLength = coefficients.length;
						if (coefficientsLength > 1 && coefficients[0] === 0) {
							let firstNonZero = 1; // Leading term must be non-zero for anything except the constant polynomial "0"
							while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0)
								firstNonZero++;
							if (firstNonZero === coefficientsLength) this.coefficients = field.zero.coefficients;
							else {
								this.coefficients = new Uint8ClampedArray(coefficientsLength - firstNonZero);
								for (let i = 0; i < this.coefficients.length; i++)
									this.coefficients[i] = coefficients[firstNonZero + i];
							}
						} else this.coefficients = coefficients;
					}
					degree() {
						return this.coefficients.length - 1;
					}
					isZero() {
						return this.coefficients[0] === 0;
					}
					getCoefficient(degree) {
						return this.coefficients[this.coefficients.length - 1 - degree];
					}
					addOrSubtract(other) {
						let _a;
						if (this.isZero()) return other;
						if (other.isZero()) return this;
						const smallerCoefficients = this.coefficients;
						const largerCoefficients = other.coefficients;
						if (smallerCoefficients.length > largerCoefficients.length) {
							(_a = [largerCoefficients, smallerCoefficients]),
								(smallerCoefficients = _a[0]),
								(largerCoefficients = _a[1]);
						}
						const sumDiff = new Uint8ClampedArray(largerCoefficients.length);
						const lengthDiff = largerCoefficients.length - smallerCoefficients.length;
						for (let i = 0; i < lengthDiff; i++) sumDiff[i] = largerCoefficients[i];
						for (let i = lengthDiff; i < largerCoefficients.length; i++)
							sumDiff[i] = GenericGF_1.addOrSubtractGF(
								smallerCoefficients[i - lengthDiff],
								largerCoefficients[i]
							);
						return new GenericGFPoly(this.field, sumDiff);
					}
					multiply(scalar) {
						if (scalar === 0) return this.field.zero;
						if (scalar === 1) return this;
						const size = this.coefficients.length;
						const product = new Uint8ClampedArray(size);
						for (let i = 0; i < size; i++) product[i] = this.field.multiply(this.coefficients[i], scalar);
						return new GenericGFPoly(this.field, product);
					}
					multiplyPoly(other) {
						if (this.isZero() || other.isZero()) return this.field.zero;
						const aCoefficients = this.coefficients;
						const aLength = aCoefficients.length;
						const bCoefficients = other.coefficients;
						const bLength = bCoefficients.length;
						const product = new Uint8ClampedArray(aLength + bLength - 1);
						for (let i = 0; i < aLength; i++) {
							const aCoeff = aCoefficients[i];
							for (let j = 0; j < bLength; j++)
								product[i + j] = GenericGF_1.addOrSubtractGF(
									product[i + j],
									this.field.multiply(aCoeff, bCoefficients[j])
								);
						}
						return new GenericGFPoly(this.field, product);
					}
					multiplyByMonomial(degree, coefficient) {
						if (degree < 0) throw new Error('Invalid degree less than 0');
						if (coefficient === 0) return this.field.zero;
						const size = this.coefficients.length;
						const product = new Uint8ClampedArray(size + degree);
						for (let i = 0; i < size; i++)
							product[i] = this.field.multiply(this.coefficients[i], coefficient);
						return new GenericGFPoly(this.field, product);
					}
					evaluateAt(a) {
						let result = 0;
						if (a === 0) return this.getCoefficient(0); // Just return the x^0 coefficient
						const size = this.coefficients.length;
						if (a === 1) {
							this.coefficients.forEach(function (coefficient) {
								result = GenericGF_1.addOrSubtractGF(result, coefficient);
							}); // Just the sum of the coefficients
							return result;
						}
						result = this.coefficients[0];
						for (let i = 1; i < size; i++)
							result = GenericGF_1.addOrSubtractGF(this.field.multiply(a, result), this.coefficients[i]);
						return result;
					}
				}
				exports.default = GenericGFPoly;
			},
			/* 3 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';
				Object.defineProperty(exports, '__esModule', { value: true });
				const binarizer_1 = __webpack_require__(4);
				const decoder_1 = __webpack_require__(5);
				const extractor_1 = __webpack_require__(11);
				const locator_1 = __webpack_require__(12);
				function scan(matrix) {
					const locations = locator_1.locate(matrix);
					if (!locations) return null;
					let locations_1 = locations;
					for (let _i = 0; _i < locations_1.length; _i++) {
						const location_1 = locations_1[_i];
						const extracted = extractor_1.extract(matrix, location_1);
						const decoded = decoder_1.decode(extracted.matrix);
						if (decoded)
							return {
								binaryData: decoded.bytes,
								data: decoded.text,
								chunks: decoded.chunks,
								version: decoded.version,
								location: {
									topRightCorner: extracted.mappingFunction(location_1.dimension, 0),
									topLeftCorner: extracted.mappingFunction(0, 0),
									bottomRightCorner: extracted.mappingFunction(
										location_1.dimension,
										location_1.dimension
									),
									bottomLeftCorner: extracted.mappingFunction(0, location_1.dimension),
									topRightFinderPattern: location_1.topRight,
									topLeftFinderPattern: location_1.topLeft,
									bottomLeftFinderPattern: location_1.bottomLeft,
									bottomRightAlignmentPattern: location_1.alignmentPattern,
								},
							};
					}
					return null;
				}
				const defaultOptions = {
					inversionAttempts: 'attemptBoth',
				};
				const jsQR = function (data, width, height, providedOptions = {}) {
					const options = defaultOptions ? defaultOptions : {};
					for (const opt in options) options[opt] = providedOptions[opt] || options[opt];
					const shouldInvert =
						options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst';
					const tryInvertedFirst =
						options.inversionAttempts === 'onlyInvert' || options.inversionAttempts === 'invertFirst';
					const _a = binarizer_1.binarize(data, width, height, shouldInvert),
						binarized = _a.binarized,
						inverted = _a.inverted;
					let result = scan(tryInvertedFirst ? inverted : binarized);
					if (
						!result &&
						(options.inversionAttempts === 'attemptBoth' || options.inversionAttempts === 'invertFirst')
					)
						result = scan(tryInvertedFirst ? binarized : inverted);
					return result;
				};
				jsQR.default = jsQR;
				exports.default = jsQR;
			},
			/* 4 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				const BitMatrix_1 = __webpack_require__(0);
				const REGION_SIZE = 8;
				const MIN_DYNAMIC_RANGE = 24;
				function numBetween(value, min, max) {
					return value < min ? min : value > max ? max : value;
				}
				// Like BitMatrix but accepts arbitry Uint8 values
				class Matrix {
					constructor(width, height) {
						this.width = width;
						this.data = new Uint8ClampedArray(width * height);
					}
					get(x, y) {
						return this.data[y * this.width + x];
					}
					set(x, y, value) {
						this.data[y * this.width + x] = value;
					}
				}
				function binarize(data, width, height, returnInverted) {
					if (data.length !== width * height * 4) throw new Error('Malformed data passed to binarizer.');
					const greyscalePixels = new Matrix(width, height); // Convert image to greyscale
					for (let x = 0; x < width; x++)
						for (let y = 0; y < height; y++) {
							const r = data[(y * width + x) * 4 + 0];
							const g = data[(y * width + x) * 4 + 1];
							const b = data[(y * width + x) * 4 + 2];
							greyscalePixels.set(x, y, 0.2126 * r + 0.7152 * g + 0.0722 * b);
						}
					const horizontalRegionCount = Math.ceil(width / REGION_SIZE);
					const verticalRegionCount = Math.ceil(height / REGION_SIZE);
					const blackPoints = new Matrix(horizontalRegionCount, verticalRegionCount);
					for (let verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++) {
						for (
							let hortizontalRegion = 0;
							hortizontalRegion < horizontalRegionCount;
							hortizontalRegion++
						) {
							let sum = 0;
							let min = Infinity;
							let max = 0;
							for (let y = 0; y < REGION_SIZE; y++)
								for (let x = 0; x < REGION_SIZE; x++) {
									let pixelLumosity = greyscalePixels.get(
										hortizontalRegion * REGION_SIZE + x,
										verticalRegion * REGION_SIZE + y
									);
									sum += pixelLumosity;
									min = Math.min(min, pixelLumosity);
									max = Math.max(max, pixelLumosity);
								}
							let average = sum / Math.pow(REGION_SIZE, 2);
							if (max - min <= MIN_DYNAMIC_RANGE) {
								// If variation within the block is low, assume this is a block with only light or only
								// dark pixels. In that case we do not want to use the average, as it would divide this
								// low contrast area into black and white pixels, essentially creating data out of noise.
								//
								// Default the blackpoint for these blocks to be half the min - effectively white them out
								average = min / 2;
								if (verticalRegion > 0 && hortizontalRegion > 0) {
									// Correct the "white background" assumption for blocks that have neighbors by comparing
									// the pixels in this block to the previously calculated black points. This is based on
									// the fact that dark barcode symbology is always surrounded by some amount of light
									// background for which reasonable black point estimates were made. The bp estimated at
									// the boundaries is used for the interior.
									// The (min < bp) is arbitrary but works better than other heuristics that were tried.
									const averageNeighborBlackPoint =
										(blackPoints.get(hortizontalRegion, verticalRegion - 1) +
											2 * blackPoints.get(hortizontalRegion - 1, verticalRegion) +
											blackPoints.get(hortizontalRegion - 1, verticalRegion - 1)) /
										4;
									if (min < averageNeighborBlackPoint) average = averageNeighborBlackPoint;
								}
							}
							blackPoints.set(hortizontalRegion, verticalRegion, average);
						}
					}
					const binarized = BitMatrix_1.BitMatrix.createEmpty(width, height);
					let inverted = null;
					if (returnInverted) inverted = BitMatrix_1.BitMatrix.createEmpty(width, height);
					for (let verticalRegion = 0; verticalRegion < verticalRegionCount; verticalRegion++)
						for (
							let hortizontalRegion = 0;
							hortizontalRegion < horizontalRegionCount;
							hortizontalRegion++
						) {
							const left = numBetween(hortizontalRegion, 2, horizontalRegionCount - 3);
							const top_1 = numBetween(verticalRegion, 2, verticalRegionCount - 3);
							let sum = 0;
							for (let xRegion = -2; xRegion <= 2; xRegion++)
								for (let yRegion = -2; yRegion <= 2; yRegion++)
									sum += blackPoints.get(left + xRegion, top_1 + yRegion);
							const threshold = sum / 25;
							for (let xRegion = 0; xRegion < REGION_SIZE; xRegion++)
								for (let yRegion = 0; yRegion < REGION_SIZE; yRegion++) {
									const x = hortizontalRegion * REGION_SIZE + xRegion;
									const y = verticalRegion * REGION_SIZE + yRegion;
									const lum = greyscalePixels.get(x, y);
									binarized.set(x, y, lum <= threshold);
									if (returnInverted) inverted.set(x, y, !(lum <= threshold));
								}
						}
					return returnInverted ? { binarized, inverted } : { binarized };
				}
				exports.binarize = binarize;
			},
			/* 5 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				const BitMatrix_1 = __webpack_require__(0);
				const decodeData_1 = __webpack_require__(6);
				const reedsolomon_1 = __webpack_require__(9);
				const version_1 = __webpack_require__(10);
				class U {
					// tslint:disable:no-bitwise
					static numBitsDiffering(x, y) {
						let z = x ^ y;
						let bitCount = 0;
						while (z) {
							bitCount++;
							z &= z - 1;
						}
						return bitCount;
					}
					static pushBit(bit, byte) {
						return (byte << 1) | bit;
					}
					// tslint:enable:no-bitwise
					static FORMAT_INFO_TABLE = [
						{ bits: 0x5412, formatInfo: { errorCorrectionLevel: 1, dataMask: 0 } },
						{ bits: 0x5125, formatInfo: { errorCorrectionLevel: 1, dataMask: 1 } },
						{ bits: 0x5e7c, formatInfo: { errorCorrectionLevel: 1, dataMask: 2 } },
						{ bits: 0x5b4b, formatInfo: { errorCorrectionLevel: 1, dataMask: 3 } },
						{ bits: 0x45f9, formatInfo: { errorCorrectionLevel: 1, dataMask: 4 } },
						{ bits: 0x40ce, formatInfo: { errorCorrectionLevel: 1, dataMask: 5 } },
						{ bits: 0x4f97, formatInfo: { errorCorrectionLevel: 1, dataMask: 6 } },
						{ bits: 0x4aa0, formatInfo: { errorCorrectionLevel: 1, dataMask: 7 } },
						{ bits: 0x77c4, formatInfo: { errorCorrectionLevel: 0, dataMask: 0 } },
						{ bits: 0x72f3, formatInfo: { errorCorrectionLevel: 0, dataMask: 1 } },
						{ bits: 0x7daa, formatInfo: { errorCorrectionLevel: 0, dataMask: 2 } },
						{ bits: 0x789d, formatInfo: { errorCorrectionLevel: 0, dataMask: 3 } },
						{ bits: 0x662f, formatInfo: { errorCorrectionLevel: 0, dataMask: 4 } },
						{ bits: 0x6318, formatInfo: { errorCorrectionLevel: 0, dataMask: 5 } },
						{ bits: 0x6c41, formatInfo: { errorCorrectionLevel: 0, dataMask: 6 } },
						{ bits: 0x6976, formatInfo: { errorCorrectionLevel: 0, dataMask: 7 } },
						{ bits: 0x1689, formatInfo: { errorCorrectionLevel: 3, dataMask: 0 } },
						{ bits: 0x13be, formatInfo: { errorCorrectionLevel: 3, dataMask: 1 } },
						{ bits: 0x1ce7, formatInfo: { errorCorrectionLevel: 3, dataMask: 2 } },
						{ bits: 0x19d0, formatInfo: { errorCorrectionLevel: 3, dataMask: 3 } },
						{ bits: 0x0762, formatInfo: { errorCorrectionLevel: 3, dataMask: 4 } },
						{ bits: 0x0255, formatInfo: { errorCorrectionLevel: 3, dataMask: 5 } },
						{ bits: 0x0d0c, formatInfo: { errorCorrectionLevel: 3, dataMask: 6 } },
						{ bits: 0x083b, formatInfo: { errorCorrectionLevel: 3, dataMask: 7 } },
						{ bits: 0x355f, formatInfo: { errorCorrectionLevel: 2, dataMask: 0 } },
						{ bits: 0x3068, formatInfo: { errorCorrectionLevel: 2, dataMask: 1 } },
						{ bits: 0x3f31, formatInfo: { errorCorrectionLevel: 2, dataMask: 2 } },
						{ bits: 0x3a06, formatInfo: { errorCorrectionLevel: 2, dataMask: 3 } },
						{ bits: 0x24b4, formatInfo: { errorCorrectionLevel: 2, dataMask: 4 } },
						{ bits: 0x2183, formatInfo: { errorCorrectionLevel: 2, dataMask: 5 } },
						{ bits: 0x2eda, formatInfo: { errorCorrectionLevel: 2, dataMask: 6 } },
						{ bits: 0x2bed, formatInfo: { errorCorrectionLevel: 2, dataMask: 7 } },
					];
					static DATA_MASKS = [
						function (p) {
							return (p.y + p.x) % 2 === 0;
						},
						function (p) {
							return p.y % 2 === 0;
						},
						function (p) {
							return p.x % 3 === 0;
						},
						function (p) {
							return (p.y + p.x) % 3 === 0;
						},
						function (p) {
							return (Math.floor(p.y / 2) + Math.floor(p.x / 3)) % 2 === 0;
						},
						function (p) {
							return ((p.x * p.y) % 2) + ((p.x * p.y) % 3) === 0;
						},
						function (p) {
							return (((p.y * p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0;
						},
						function (p) {
							return (((p.y + p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0;
						},
					];
					static buildFunctionPatternMask(version) {
						const dimension = 17 + 4 * version.versionNumber;
						const matrix = BitMatrix_1.BitMatrix.createEmpty(dimension, dimension);
						matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
						matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
						matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format
						// Alignment patterns
						for (let _i = 0, _a = version.alignmentPatternCenters; _i < _a.length; _i++) {
							const x = _a[_i];
							for (let _b = 0, _c = version.alignmentPatternCenters; _b < _c.length; _b++) {
								const y = _c[_b];
								if (
									!(
										(x === 6 && y === 6) ||
										(x === 6 && y === dimension - 7) ||
										(x === dimension - 7 && y === 6)
									)
								)
									matrix.setRegion(x - 2, y - 2, 5, 5, true);
							}
						}
						matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
						matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern
						if (version.versionNumber > 6) {
							matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
							matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
						}
						return matrix;
					}
					static readCodewords(matrix, version, formatInfo) {
						const dataMask = DATA_MASKS[formatInfo.dataMask];
						const dimension = matrix.height;
						const functionPatternMask = U.buildFunctionPatternMask(version);
						const codewords = [];
						let currentByte = 0;
						let bitsRead = 0;
						let readingUp = true; // Read columns in pairs, from right to left
						for (let columnIndex = dimension - 1; columnIndex > 0; columnIndex -= 2) {
							if (columnIndex === 6) columnIndex--; // Skip whole column with vertical alignment pattern;
							for (let i = 0; i < dimension; i++) {
								const y = readingUp ? dimension - 1 - i : i;
								for (let columnOffset = 0; columnOffset < 2; columnOffset++) {
									const x = columnIndex - columnOffset;
									if (!functionPatternMask.get(x, y)) {
										bitsRead++;
										let bit = matrix.get(x, y);
										if (dataMask({ y: y, x: x })) bit = !bit;
										currentByte = pushBit(bit, currentByte);
										if (bitsRead === 8) {
											codewords.push(currentByte); // Whole bytes
											bitsRead = 0;
											currentByte = 0;
										}
									}
								}
							}
							readingUp = !readingUp;
						}
						return codewords;
					}
					static readVersion(matrix) {
						const dimension = matrix.height;
						const provisionalVersion = Math.floor((dimension - 17) / 4);
						if (provisionalVersion <= 6) return version_1.VERSIONS[provisionalVersion - 1]; // 6 and under dont have version info in the QR code
						let topRightVersionBits = 0;
						for (let y = 5; y >= 0; y--)
							for (let x = dimension - 9; x >= dimension - 11; x--)
								topRightVersionBits = U.pushBit(matrix.get(x, y), topRightVersionBits);
						let bottomLeftVersionBits = 0;
						for (let x = 5; x >= 0; x--)
							for (let y = dimension - 9; y >= dimension - 11; y--)
								bottomLeftVersionBits = U.pushBit(matrix.get(x, y), bottomLeftVersionBits);
						let bestDifference = Infinity;
						let bestVersion;
						for (let _i = 0, VERSIONS_1 = version_1.VERSIONS; _i < VERSIONS_1.length; _i++) {
							const version = VERSIONS_1[_i];
							if (version.infoBits === topRightVersionBits || version.infoBits === bottomLeftVersionBits)
								return version;
							const difference1 = U.numBitsDiffering(topRightVersionBits, version.infoBits);
							if (difference1 < bestDifference) {
								bestVersion = version;
								bestDifference = difference1;
							}
							const difference2 = U.numBitsDiffering(bottomLeftVersionBits, version.infoBits);
							if (difference2 < bestDifference) {
								bestVersion = version;
								bestDifference = difference2;
							}
						}
						// We can tolerate up to 3 bits of error since no two version info codewords will
						// differ in less than 8 bits.
						if (bestDifference <= 3) return bestVersion;
					}
					static readFormatInformation(matrix) {
						let topLeftFormatInfoBits = 0;
						for (let x = 0; x <= 8; x++)
							if (x !== 6) topLeftFormatInfoBits = U.pushBit(matrix.get(x, 8), topLeftFormatInfoBits); // Skip timing pattern bit
						for (let y = 7; y >= 0; y--)
							if (y !== 6) topLeftFormatInfoBits = U.pushBit(matrix.get(8, y), topLeftFormatInfoBits); // Skip timing pattern bit
						const dimension = matrix.height;
						let topRightBottomRightFormatInfoBits = 0;
						for (let y = dimension - 1; y >= dimension - 7; y--)
							topRightBottomRightFormatInfoBits = U.pushBit(
								matrix.get(8, y),
								topRightBottomRightFormatInfoBits
							); // bottom left
						for (let x = dimension - 8; x < dimension; x++)
							topRightBottomRightFormatInfoBits = U.pushBit(
								matrix.get(x, 8),
								topRightBottomRightFormatInfoBits
							); // top right
						let bestDifference = Infinity;
						let bestFormatInfo = null;
						for (
							let _i = 0, FORMAT_INFO_TABLE_1 = FORMAT_INFO_TABLE;
							_i < FORMAT_INFO_TABLE_1.length;
							_i++
						) {
							const _a = FORMAT_INFO_TABLE_1[_i],
								bits = _a.bits,
								formatInfo = _a.formatInfo;
							if (bits === topLeftFormatInfoBits || bits === topRightBottomRightFormatInfoBits)
								return formatInfo;
							const difference1 = U.numBitsDiffering(topLeftFormatInfoBits, bits);
							if (difference1 < bestDifference) {
								bestFormatInfo = formatInfo;
								bestDifference = difference1;
							}
							if (topLeftFormatInfoBits !== topRightBottomRightFormatInfoBits) {
								const difference = U.numBitsDiffering(topRightBottomRightFormatInfoBits, bits); // also try the other option
								if (difference < bestDifference) {
									bestFormatInfo = formatInfo;
									bestDifference = difference;
								}
							}
						}
						return bestDifference <= 3 ? bestFormatInfo : null; // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
					}
					static getDataBlocks(codewords, version, ecLevel) {
						const ecInfo = version.errorCorrectionLevels[ecLevel];
						const dataBlocks = [];
						let totalCodewords = 0;
						for (const block of ecInfo.ecBlocks)
							for (let i = 0; i < block.numBlocks; i++) {
								dataBlocks.push({ numDataCodewords: block.dataCodewordsPerBlock, codewords: [] });
								totalCodewords += block.dataCodewordsPerBlock + ecInfo.ecCodewordsPerBlock;
							}
						// In some cases the QR code will be malformed enough that we pull off more or less than we should.
						// If we pull off less there's nothing we can do.
						// If we pull off more we can safely truncate
						if (codewords.length < totalCodewords) return null;
						codewords = codewords.slice(0, totalCodewords);
						const shortBlockSize = ecInfo.ecBlocks[0].dataCodewordsPerBlock;
						for (let i = 0; i < shortBlockSize; i++)
							for (const dataBlock of dataBlocks) dataBlock.codewords.push(codewords.shift()); // Pull codewords to fill the blocks up to the minimum size
						// If there are any large blocks, pull codewords to fill the last element of those
						if (ecInfo.ecBlocks.length > 1) {
							const smallBlockCount = ecInfo.ecBlocks[0].numBlocks;
							const largeBlockCount = ecInfo.ecBlocks[1].numBlocks;
							for (let i = 0; i < largeBlockCount; i++)
								dataBlocks[smallBlockCount + i].codewords.push(codewords.shift());
						}
						while (codewords.length > 0)
							for (const dataBlock of dataBlocks) dataBlock.codewords.push(codewords.shift()); // Add the rest of the codewords to the blocks. These are the error correction codewords.
						return dataBlocks;
					}
					static decodeMatrix(matrix) {
						const version = U.readVersion(matrix);
						if (!version) return null;
						const formatInfo = U.readFormatInformation(matrix);
						if (!formatInfo) return null;
						const codewords = U.readCodewords(matrix, version, formatInfo);
						const dataBlocks = U.getDataBlocks(codewords, version, formatInfo.errorCorrectionLevel);
						if (!dataBlocks) return null;
						const totalBytes = dataBlocks.reduce(function (a, b) {
							return a + b.numDataCodewords;
						}, 0); // Count total number of data bytes
						const resultBytes = new Uint8ClampedArray(totalBytes);
						let resultIndex = 0;
						for (const dataBlock of dataBlocks) {
							const correctedBytes = reedsolomon_1.decode(
								dataBlock.codewords,
								dataBlock.codewords.length - dataBlock.numDataCodewords
							);
							if (!correctedBytes) return null;
							for (let i = 0; i < dataBlock.numDataCodewords; i++)
								resultBytes[resultIndex++] = correctedBytes[i];
						}
						try {
							return decodeData_1.decode(resultBytes, version.versionNumber);
						} catch (_a) {
							return null;
						}
					}
				}
				function decode(matrix) {
					if (matrix == null) return null;
					const result = U.decodeMatrix(matrix);
					if (result) return result;
					// Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
					for (let x = 0; x < matrix.width; x++)
						for (let y = x + 1; y < matrix.height; y++)
							if (matrix.get(x, y) !== matrix.get(y, x)) {
								matrix.set(x, y, !matrix.get(x, y));
								matrix.set(y, x, !matrix.get(y, x));
							}
					return U.decodeMatrix(matrix);
				}
				exports.decode = decode;
			},
			/* 6 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				// tslint:disable:no-bitwise
				const BitStream_1 = __webpack_require__(7);
				const shiftJISTable_1 = __webpack_require__(8);
				if (!exports.Mode) exports.Mode = {};
				const Mode = exports.Mode;
				Mode['Numeric'] = 'numeric';
				Mode['Alphanumeric'] = 'alphanumeric';
				Mode['Byte'] = 'byte';
				Mode['Kanji'] = 'kanji';
				Mode['ECI'] = 'eci';
				const ModeByte = {};
				ModeByte[(ModeByte['Terminator'] = 0)] = 'Terminator';
				ModeByte[(ModeByte['Numeric'] = 1)] = 'Numeric';
				ModeByte[(ModeByte['Alphanumeric'] = 2)] = 'Alphanumeric';
				ModeByte[(ModeByte['Byte'] = 4)] = 'Byte';
				ModeByte[(ModeByte['Kanji'] = 8)] = 'Kanji';
				ModeByte[(ModeByte['ECI'] = 7)] = 'ECI';
				// StructuredAppend = 0x3,
				// FNC1FirstPosition = 0x5,
				// FNC1SecondPosition = 0x9,
				class N {
					static decodeNumeric(stream, size) {
						const bytes = [],
							characterCountSize = [10, 12, 14][size];
						let text = '',
							length = stream.readBits(characterCountSize);
						while (length >= 3) {
							const num = stream.readBits(10); // Read digits in groups of 3
							if (num >= 1000) throw new Error('Invalid numeric value above 999');
							const a = Math.floor(num / 100),
								b = Math.floor(num / 10) % 10,
								c = num % 10;
							bytes.push(48 + a, 48 + b, 48 + c);
							text += a.toString() + b.toString() + c.toString();
							length -= 3;
						}
						if (length === 2) {
							const num = stream.readBits(7); // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
							if (num >= 100) throw new Error('Invalid numeric value above 99');
							const a = Math.floor(num / 10),
								b = num % 10;
							bytes.push(48 + a, 48 + b);
							text += a.toString() + b.toString();
						} else if (length === 1) {
							const num = stream.readBits(4);
							if (num >= 10) throw new Error('Invalid numeric value above 9');
							bytes.push(48 + num);
							text += num.toString();
						}
						return { bytes, text };
					}
					static AlphanumericCharacterCodes = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.split('');
					static decodeAlphanumeric(stream, size) {
						const bytes = [],
							characterCountSize = [9, 11, 13][size];
						let text = '',
							length = stream.readBits(characterCountSize);
						while (length >= 2) {
							const v = stream.readBits(11),
								a = Math.floor(v / 45),
								b = v % 45;
							bytes.push(
								N.AlphanumericCharacterCodes[a].charCodeAt(0),
								N.AlphanumericCharacterCodes[b].charCodeAt(0)
							);
							text += N.AlphanumericCharacterCodes[a] + N.AlphanumericCharacterCodes[b];
							length -= 2;
						}
						if (length === 1) {
							const a = stream.readBits(6);
							bytes.push(N.AlphanumericCharacterCodes[a].charCodeAt(0));
							text += N.AlphanumericCharacterCodes[a];
						}
						return { bytes, text };
					}
					static decodeByte(stream, size) {
						const bytes = [],
							characterCountSize = [8, 16, 16][size];
						let text = '',
							length = stream.readBits(characterCountSize);
						for (let i = 0; i < length; i++) bytes.push(stream.readBits(8));
						try {
							text += decodeURIComponent(
								bytes
									.map((b) => {
										return '%' + ('0' + b.toString(16)).substr(-2);
									})
									.join('')
							);
						} catch (_a) {
							// failed to decode
						}
						return { bytes, text };
					}
					static decodeKanji(stream, size) {
						const bytes = [],
							characterCountSize = [8, 10, 12][size];
						let text = '',
							length = stream.readBits(characterCountSize);
						for (let i = 0; i < length; i++) {
							const k = stream.readBits(13);
							let c = (Math.floor(k / 0xc0) << 8) | k % 0xc0;
							c += c < 0x1f00 ? 0x8140 : 0xc140;
							bytes.push(c >> 8, c & 0xff);
							text += String.fromCharCode(shiftJISTable_1.shiftJISTable[c]);
						}
						return { bytes, text };
					}
					static decode(data, version) {
						let _a, _b, _c, _d;
						const stream = new BitStream_1.BitStream(data);
						const size = version <= 9 ? 0 : version <= 26 ? 1 : 2; // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
						const result = {
							text: '',
							bytes: [],
							chunks: [],
							version: version,
						};
						while (stream.available() >= 4) {
							const mode = stream.readBits(4);
							if (mode === ModeByte.Terminator) return result;
							else if (mode === ModeByte.ECI) {
								if (stream.readBits(1) === 0)
									result.chunks.push({
										type: Mode.ECI,
										assignmentNumber: stream.readBits(7),
									});
								else if (stream.readBits(1) === 0)
									result.chunks.push({
										type: Mode.ECI,
										assignmentNumber: stream.readBits(14),
									});
								else if (stream.readBits(1) === 0)
									result.chunks.push({
										type: Mode.ECI,
										assignmentNumber: stream.readBits(21),
									});
								else
									result.chunks.push({
										type: Mode.ECI,
										assignmentNumber: -1,
									}); // ECI data seems corrupted
							} else if (mode === ModeByte.Numeric) {
								const numericResult = N.decodeNumeric(stream, size);
								result.text += numericResult.text;
								(_a = result.bytes).push.apply(_a, numericResult.bytes);
								result.chunks.push({
									type: Mode.Numeric,
									text: numericResult.text,
								});
							} else if (mode === ModeByte.Alphanumeric) {
								const alphanumericResult = N.decodeAlphanumeric(stream, size);
								result.text += alphanumericResult.text;
								(_b = result.bytes).push.apply(_b, alphanumericResult.bytes);
								result.chunks.push({
									type: Mode.Alphanumeric,
									text: alphanumericResult.text,
								});
							} else if (mode === ModeByte.Byte) {
								const byteResult = N.decodeByte(stream, size);
								result.text += byteResult.text;
								(_c = result.bytes).push.apply(_c, byteResult.bytes);
								result.chunks.push({
									type: Mode.Byte,
									bytes: byteResult.bytes,
									text: byteResult.text,
								});
							} else if (mode === ModeByte.Kanji) {
								const kanjiResult = N.decodeKanji(stream, size);
								result.text += kanjiResult.text;
								(_d = result.bytes).push.apply(_d, kanjiResult.bytes);
								result.chunks.push({
									type: Mode.Kanji,
									bytes: kanjiResult.bytes,
									text: kanjiResult.text,
								});
							}
						}
						if (stream.available() === 0 || stream.readBits(stream.available()) === 0) return result; // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
					}
				}
				exports.decode = N.decode;
			},
			/* 7 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				// tslint:disable:no-bitwise
				Object.defineProperty(exports, '__esModule', { value: true });
				class BitStream {
					constructor(bytes) {
						this.byteOffset = 0;
						this.bitOffset = 0;
						this.bytes = bytes;
					}
					readBits(numBits) {
						if (numBits < 1 || numBits > 32 || numBits > this.available())
							throw new Error('Cannot read ' + numBits.toString() + ' bits');
						let result = 0;
						if (this.bitOffset > 0) {
							const bitsLeft = 8 - this.bitOffset, // First, read remainder from current byte
								toRead = numBits < bitsLeft ? numBits : bitsLeft,
								bitsToNotRead = bitsLeft - toRead,
								mask = (0xff >> (8 - toRead)) << bitsToNotRead;
							result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
							numBits -= toRead;
							this.bitOffset += toRead;
							if (this.bitOffset === 8) {
								this.bitOffset = 0;
								this.byteOffset++;
							}
						}
						if (numBits > 0) {
							while (numBits >= 8) {
								result = (result << 8) | (this.bytes[this.byteOffset] & 0xff); // Next read whole bytes
								this.byteOffset++;
								numBits -= 8;
							}
							if (numBits > 0) {
								const bitsToNotRead = 8 - numBits, // Finally read a partial byte
									mask = (0xff >> bitsToNotRead) << bitsToNotRead;
								result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
								this.bitOffset += numBits;
							}
						}
						return result;
					}
					available() {
						return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
					}
				}
				exports.BitStream = BitStream;
			},
			/* 8 */
			/***/ async function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				class V {
					static cc() {
						return document.createElement('canvas');
					}
					static compess2dURI(u8a) {
						const b = u8a.length,
							s = Math.ceil(Math.sqrt(Math.ceil(b / 3) + 2)),
							c = V.cc();
						c.width = c.height = s;
						const x = c.getContext('2d'),
							d = x.createImageData(s, s),
							l = d.data.length,
							n = new Uint8Array(l);
						n.fill(255);
						n[l - 3] = b % 256;
						n[l - 2] = b >>> 8;
						for (let i = 0, j = 0; j < b; i++) if (i % 4 !== 3) n[i] = u8a[j++];
						for (let i = 0; i < l; i++) d.data[i] = n[i];
						x.putImageData(d, 0, 0);
						return c.toDataURL('image/png');
					}
					static decompress4DURI(dURI) {
						return new Promise((r) => {
							const i = new Image();
							i.onload = () => {
								const s = i.width,
									l = s * s * 4,
									c = V.cc();
								c.width = c.height = s;
								const x = c.getContext('2d');
								x.drawImage(i, 0, 0);
								const d = x.getImageData(0, 0, s, s),
									n = d.data,
									b = (n[l - 2] << 8) + n[l - 3],
									u = new Uint8Array(b);
								for (let j = 0, k = 0; k < b; j++) if (j % 4 !== 3) u[k++] = n[j];
								r(u);
							};
							i.src = dURI;
						});
					}
					static compress(t) {
						const k = Object.keys(t),
							u8a = new Uint8Array(k.length * 4);
						let c = 0;
						u8a.fill(0);
						for (const [k, v] of Object.entries(t)) {
							const n = k * 1;
							u8a[c + 0] = n >> 8;
							u8a[c + 1] = n % 256;
							u8a[c + 2] = v >> 8;
							u8a[c + 3] = v % 256;
							c += 4;
						}
						return u8a;
					}
					static decompress(u8a) {
						const m = {},
							l = u8a.length;
						for (let c = 0; c < l; c += 4)
							m[((u8a[c + 0] << 8) | u8a[c + 1]) + ''] = (u8a[c + 2] << 8) | u8a[c + 3];
						return m;
					}
				}
				const SJIS_dURI =
					'data:image/png;base64,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';
				exports.shiftJISTable = V.decode(await V.decompress4DURI(SJIS_dURI));
			},
			/* 9 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				var GenericGF_1 = __webpack_require__(1);
				var GenericGFPoly_1 = __webpack_require__(2);
				function runEuclideanAlgorithm(field, a, b, R) {
					var _a;
					// Assume a's degree is >= b's
					if (a.degree() < b.degree()) {
						(_a = [b, a]), (a = _a[0]), (b = _a[1]);
					}
					var rLast = a;
					var r = b;
					var tLast = field.zero;
					var t = field.one;
					// Run Euclidean algorithm until r's degree is less than R/2
					while (r.degree() >= R / 2) {
						var rLastLast = rLast;
						var tLastLast = tLast;
						rLast = r;
						tLast = t;
						// Divide rLastLast by rLast, with quotient in q and remainder in r
						if (rLast.isZero()) {
							// Euclidean algorithm already terminated?
							return null;
						}
						r = rLastLast;
						var q = field.zero;
						var denominatorLeadingTerm = rLast.getCoefficient(rLast.degree());
						var dltInverse = field.inverse(denominatorLeadingTerm);
						while (r.degree() >= rLast.degree() && !r.isZero()) {
							var degreeDiff = r.degree() - rLast.degree();
							var scale = field.multiply(r.getCoefficient(r.degree()), dltInverse);
							q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
							r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
						}
						t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);
						if (r.degree() >= rLast.degree()) {
							return null;
						}
					}
					var sigmaTildeAtZero = t.getCoefficient(0);
					if (sigmaTildeAtZero === 0) {
						return null;
					}
					var inverse = field.inverse(sigmaTildeAtZero);
					return [t.multiply(inverse), r.multiply(inverse)];
				}
				function findErrorLocations(field, errorLocator) {
					// This is a direct application of Chien's search
					var numErrors = errorLocator.degree();
					if (numErrors === 1) {
						return [errorLocator.getCoefficient(1)];
					}
					var result = new Array(numErrors);
					var errorCount = 0;
					for (var i = 1; i < field.size && errorCount < numErrors; i++) {
						if (errorLocator.evaluateAt(i) === 0) {
							result[errorCount] = field.inverse(i);
							errorCount++;
						}
					}
					if (errorCount !== numErrors) {
						return null;
					}
					return result;
				}
				function findErrorMagnitudes(field, errorEvaluator, errorLocations) {
					// This is directly applying Forney's Formula
					var s = errorLocations.length;
					var result = new Array(s);
					for (var i = 0; i < s; i++) {
						var xiInverse = field.inverse(errorLocations[i]);
						var denominator = 1;
						for (var j = 0; j < s; j++) {
							if (i !== j) {
								denominator = field.multiply(
									denominator,
									GenericGF_1.addOrSubtractGF(1, field.multiply(errorLocations[j], xiInverse))
								);
							}
						}
						result[i] = field.multiply(errorEvaluator.evaluateAt(xiInverse), field.inverse(denominator));
						if (field.generatorBase !== 0) {
							result[i] = field.multiply(result[i], xiInverse);
						}
					}
					return result;
				}
				function decode(bytes, twoS) {
					var outputBytes = new Uint8ClampedArray(bytes.length);
					outputBytes.set(bytes);
					var field = new GenericGF_1.default(0x011d, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
					var poly = new GenericGFPoly_1.default(field, outputBytes);
					var syndromeCoefficients = new Uint8ClampedArray(twoS);
					var error = false;
					for (var s = 0; s < twoS; s++) {
						var evaluation = poly.evaluateAt(field.exp(s + field.generatorBase));
						syndromeCoefficients[syndromeCoefficients.length - 1 - s] = evaluation;
						if (evaluation !== 0) {
							error = true;
						}
					}
					if (!error) {
						return outputBytes;
					}
					var syndrome = new GenericGFPoly_1.default(field, syndromeCoefficients);
					var sigmaOmega = runEuclideanAlgorithm(field, field.buildMonomial(twoS, 1), syndrome, twoS);
					if (sigmaOmega === null) {
						return null;
					}
					var errorLocations = findErrorLocations(field, sigmaOmega[0]);
					if (errorLocations == null) {
						return null;
					}
					var errorMagnitudes = findErrorMagnitudes(field, sigmaOmega[1], errorLocations);
					for (var i = 0; i < errorLocations.length; i++) {
						var position = outputBytes.length - 1 - field.log(errorLocations[i]);
						if (position < 0) {
							return null;
						}
						outputBytes[position] = GenericGF_1.addOrSubtractGF(outputBytes[position], errorMagnitudes[i]);
					}
					return outputBytes;
				}
				exports.decode = decode;

				/***/
			},
			/* 10 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				exports.VERSIONS = [
					{
						infoBits: null,
						versionNumber: 1,
						alignmentPatternCenters: [],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 7,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 19 }],
							},
							{
								ecCodewordsPerBlock: 10,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
							},
							{
								ecCodewordsPerBlock: 13,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 13 }],
							},
							{
								ecCodewordsPerBlock: 17,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 9 }],
							},
						],
					},
					{
						infoBits: null,
						versionNumber: 2,
						alignmentPatternCenters: [6, 18],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 10,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 34 }],
							},
							{
								ecCodewordsPerBlock: 16,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 28 }],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 22 }],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 16 }],
							},
						],
					},
					{
						infoBits: null,
						versionNumber: 3,
						alignmentPatternCenters: [6, 22],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 15,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 55 }],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 44 }],
							},
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 17 }],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 13 }],
							},
						],
					},
					{
						infoBits: null,
						versionNumber: 4,
						alignmentPatternCenters: [6, 26],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 20,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 80 }],
							},
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 32 }],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 24 }],
							},
							{
								ecCodewordsPerBlock: 16,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 9 }],
							},
						],
					},
					{
						infoBits: null,
						versionNumber: 5,
						alignmentPatternCenters: [6, 30],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [{ numBlocks: 1, dataCodewordsPerBlock: 108 }],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 43 }],
							},
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 15 },
									{ numBlocks: 2, dataCodewordsPerBlock: 16 },
								],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 11 },
									{ numBlocks: 2, dataCodewordsPerBlock: 12 },
								],
							},
						],
					},
					{
						infoBits: null,
						versionNumber: 6,
						alignmentPatternCenters: [6, 34],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 68 }],
							},
							{
								ecCodewordsPerBlock: 16,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 27 }],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 19 }],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 15 }],
							},
						],
					},
					{
						infoBits: 0x07c94,
						versionNumber: 7,
						alignmentPatternCenters: [6, 22, 38],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 20,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 78 }],
							},
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 31 }],
							},
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 14 },
									{ numBlocks: 4, dataCodewordsPerBlock: 15 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 13 },
									{ numBlocks: 1, dataCodewordsPerBlock: 14 },
								],
							},
						],
					},
					{
						infoBits: 0x085bc,
						versionNumber: 8,
						alignmentPatternCenters: [6, 24, 42],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 97 }],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 38 },
									{ numBlocks: 2, dataCodewordsPerBlock: 39 },
								],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 18 },
									{ numBlocks: 2, dataCodewordsPerBlock: 19 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 14 },
									{ numBlocks: 2, dataCodewordsPerBlock: 15 },
								],
							},
						],
					},
					{
						infoBits: 0x09a99,
						versionNumber: 9,
						alignmentPatternCenters: [6, 26, 46],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [{ numBlocks: 2, dataCodewordsPerBlock: 116 }],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 36 },
									{ numBlocks: 2, dataCodewordsPerBlock: 37 },
								],
							},
							{
								ecCodewordsPerBlock: 20,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 16 },
									{ numBlocks: 4, dataCodewordsPerBlock: 17 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 12 },
									{ numBlocks: 4, dataCodewordsPerBlock: 13 },
								],
							},
						],
					},
					{
						infoBits: 0x0a4d3,
						versionNumber: 10,
						alignmentPatternCenters: [6, 28, 50],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 18,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 68 },
									{ numBlocks: 2, dataCodewordsPerBlock: 69 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 43 },
									{ numBlocks: 1, dataCodewordsPerBlock: 44 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 19 },
									{ numBlocks: 2, dataCodewordsPerBlock: 20 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 15 },
									{ numBlocks: 2, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x0bbf6,
						versionNumber: 11,
						alignmentPatternCenters: [6, 30, 54],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 20,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 81 }],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 1, dataCodewordsPerBlock: 50 },
									{ numBlocks: 4, dataCodewordsPerBlock: 51 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 22 },
									{ numBlocks: 4, dataCodewordsPerBlock: 23 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 12 },
									{ numBlocks: 8, dataCodewordsPerBlock: 13 },
								],
							},
						],
					},
					{
						infoBits: 0x0c762,
						versionNumber: 12,
						alignmentPatternCenters: [6, 32, 58],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 92 },
									{ numBlocks: 2, dataCodewordsPerBlock: 93 },
								],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 36 },
									{ numBlocks: 2, dataCodewordsPerBlock: 37 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 20 },
									{ numBlocks: 6, dataCodewordsPerBlock: 21 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 7, dataCodewordsPerBlock: 14 },
									{ numBlocks: 4, dataCodewordsPerBlock: 15 },
								],
							},
						],
					},
					{
						infoBits: 0x0d847,
						versionNumber: 13,
						alignmentPatternCenters: [6, 34, 62],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [{ numBlocks: 4, dataCodewordsPerBlock: 107 }],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 37 },
									{ numBlocks: 1, dataCodewordsPerBlock: 38 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 20 },
									{ numBlocks: 4, dataCodewordsPerBlock: 21 },
								],
							},
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 12, dataCodewordsPerBlock: 11 },
									{ numBlocks: 4, dataCodewordsPerBlock: 12 },
								],
							},
						],
					},
					{
						infoBits: 0x0e60d,
						versionNumber: 14,
						alignmentPatternCenters: [6, 26, 46, 66],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 115 },
									{ numBlocks: 1, dataCodewordsPerBlock: 116 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 40 },
									{ numBlocks: 5, dataCodewordsPerBlock: 41 },
								],
							},
							{
								ecCodewordsPerBlock: 20,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 16 },
									{ numBlocks: 5, dataCodewordsPerBlock: 17 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 12 },
									{ numBlocks: 5, dataCodewordsPerBlock: 13 },
								],
							},
						],
					},
					{
						infoBits: 0x0f928,
						versionNumber: 15,
						alignmentPatternCenters: [6, 26, 48, 70],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 22,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 87 },
									{ numBlocks: 1, dataCodewordsPerBlock: 88 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 41 },
									{ numBlocks: 5, dataCodewordsPerBlock: 42 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 24 },
									{ numBlocks: 7, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 12 },
									{ numBlocks: 7, dataCodewordsPerBlock: 13 },
								],
							},
						],
					},
					{
						infoBits: 0x10b78,
						versionNumber: 16,
						alignmentPatternCenters: [6, 26, 50, 74],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 98 },
									{ numBlocks: 1, dataCodewordsPerBlock: 99 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 7, dataCodewordsPerBlock: 45 },
									{ numBlocks: 3, dataCodewordsPerBlock: 46 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [
									{ numBlocks: 15, dataCodewordsPerBlock: 19 },
									{ numBlocks: 2, dataCodewordsPerBlock: 20 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 15 },
									{ numBlocks: 13, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1145d,
						versionNumber: 17,
						alignmentPatternCenters: [6, 30, 54, 78],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 1, dataCodewordsPerBlock: 107 },
									{ numBlocks: 5, dataCodewordsPerBlock: 108 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 10, dataCodewordsPerBlock: 46 },
									{ numBlocks: 1, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 1, dataCodewordsPerBlock: 22 },
									{ numBlocks: 15, dataCodewordsPerBlock: 23 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 14 },
									{ numBlocks: 17, dataCodewordsPerBlock: 15 },
								],
							},
						],
					},
					{
						infoBits: 0x12a17,
						versionNumber: 18,
						alignmentPatternCenters: [6, 30, 56, 82],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 120 },
									{ numBlocks: 1, dataCodewordsPerBlock: 121 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 9, dataCodewordsPerBlock: 43 },
									{ numBlocks: 4, dataCodewordsPerBlock: 44 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 17, dataCodewordsPerBlock: 22 },
									{ numBlocks: 1, dataCodewordsPerBlock: 23 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 14 },
									{ numBlocks: 19, dataCodewordsPerBlock: 15 },
								],
							},
						],
					},
					{
						infoBits: 0x13532,
						versionNumber: 19,
						alignmentPatternCenters: [6, 30, 58, 86],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 113 },
									{ numBlocks: 4, dataCodewordsPerBlock: 114 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 44 },
									{ numBlocks: 11, dataCodewordsPerBlock: 45 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 17, dataCodewordsPerBlock: 21 },
									{ numBlocks: 4, dataCodewordsPerBlock: 22 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 9, dataCodewordsPerBlock: 13 },
									{ numBlocks: 16, dataCodewordsPerBlock: 14 },
								],
							},
						],
					},
					{
						infoBits: 0x149a6,
						versionNumber: 20,
						alignmentPatternCenters: [6, 34, 62, 90],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 107 },
									{ numBlocks: 5, dataCodewordsPerBlock: 108 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 41 },
									{ numBlocks: 13, dataCodewordsPerBlock: 42 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 15, dataCodewordsPerBlock: 24 },
									{ numBlocks: 5, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 15, dataCodewordsPerBlock: 15 },
									{ numBlocks: 10, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x15683,
						versionNumber: 21,
						alignmentPatternCenters: [6, 28, 50, 72, 94],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 116 },
									{ numBlocks: 4, dataCodewordsPerBlock: 117 },
								],
							},
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 42 }],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 17, dataCodewordsPerBlock: 22 },
									{ numBlocks: 6, dataCodewordsPerBlock: 23 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 16 },
									{ numBlocks: 6, dataCodewordsPerBlock: 17 },
								],
							},
						],
					},
					{
						infoBits: 0x168c9,
						versionNumber: 22,
						alignmentPatternCenters: [6, 26, 50, 74, 98],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 111 },
									{ numBlocks: 7, dataCodewordsPerBlock: 112 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 46 }],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 7, dataCodewordsPerBlock: 24 },
									{ numBlocks: 16, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 24,
								ecBlocks: [{ numBlocks: 34, dataCodewordsPerBlock: 13 }],
							},
						],
					},
					{
						infoBits: 0x177ec,
						versionNumber: 23,
						alignmentPatternCenters: [6, 30, 54, 74, 102],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 121 },
									{ numBlocks: 5, dataCodewordsPerBlock: 122 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 47 },
									{ numBlocks: 14, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 24 },
									{ numBlocks: 14, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 16, dataCodewordsPerBlock: 15 },
									{ numBlocks: 14, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x18ec4,
						versionNumber: 24,
						alignmentPatternCenters: [6, 28, 54, 80, 106],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 117 },
									{ numBlocks: 4, dataCodewordsPerBlock: 118 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 45 },
									{ numBlocks: 14, dataCodewordsPerBlock: 46 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 24 },
									{ numBlocks: 16, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 30, dataCodewordsPerBlock: 16 },
									{ numBlocks: 2, dataCodewordsPerBlock: 17 },
								],
							},
						],
					},
					{
						infoBits: 0x191e1,
						versionNumber: 25,
						alignmentPatternCenters: [6, 32, 58, 84, 110],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 26,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 106 },
									{ numBlocks: 4, dataCodewordsPerBlock: 107 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 47 },
									{ numBlocks: 13, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 7, dataCodewordsPerBlock: 24 },
									{ numBlocks: 22, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 22, dataCodewordsPerBlock: 15 },
									{ numBlocks: 13, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1afab,
						versionNumber: 26,
						alignmentPatternCenters: [6, 30, 58, 86, 114],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 10, dataCodewordsPerBlock: 114 },
									{ numBlocks: 2, dataCodewordsPerBlock: 115 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 46 },
									{ numBlocks: 4, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 28, dataCodewordsPerBlock: 22 },
									{ numBlocks: 6, dataCodewordsPerBlock: 23 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 33, dataCodewordsPerBlock: 16 },
									{ numBlocks: 4, dataCodewordsPerBlock: 17 },
								],
							},
						],
					},
					{
						infoBits: 0x1b08e,
						versionNumber: 27,
						alignmentPatternCenters: [6, 34, 62, 90, 118],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 122 },
									{ numBlocks: 4, dataCodewordsPerBlock: 123 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 22, dataCodewordsPerBlock: 45 },
									{ numBlocks: 3, dataCodewordsPerBlock: 46 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 8, dataCodewordsPerBlock: 23 },
									{ numBlocks: 26, dataCodewordsPerBlock: 24 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 12, dataCodewordsPerBlock: 15 },
									{ numBlocks: 28, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1cc1a,
						versionNumber: 28,
						alignmentPatternCenters: [6, 26, 50, 74, 98, 122],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 117 },
									{ numBlocks: 10, dataCodewordsPerBlock: 118 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 3, dataCodewordsPerBlock: 45 },
									{ numBlocks: 23, dataCodewordsPerBlock: 46 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 24 },
									{ numBlocks: 31, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 15 },
									{ numBlocks: 31, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1d33f,
						versionNumber: 29,
						alignmentPatternCenters: [6, 30, 54, 78, 102, 126],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 7, dataCodewordsPerBlock: 116 },
									{ numBlocks: 7, dataCodewordsPerBlock: 117 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 21, dataCodewordsPerBlock: 45 },
									{ numBlocks: 7, dataCodewordsPerBlock: 46 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 1, dataCodewordsPerBlock: 23 },
									{ numBlocks: 37, dataCodewordsPerBlock: 24 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 15 },
									{ numBlocks: 26, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1ed75,
						versionNumber: 30,
						alignmentPatternCenters: [6, 26, 52, 78, 104, 130],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 5, dataCodewordsPerBlock: 115 },
									{ numBlocks: 10, dataCodewordsPerBlock: 116 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 47 },
									{ numBlocks: 10, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 15, dataCodewordsPerBlock: 24 },
									{ numBlocks: 25, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 23, dataCodewordsPerBlock: 15 },
									{ numBlocks: 25, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x1f250,
						versionNumber: 31,
						alignmentPatternCenters: [6, 30, 56, 82, 108, 134],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 13, dataCodewordsPerBlock: 115 },
									{ numBlocks: 3, dataCodewordsPerBlock: 116 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 46 },
									{ numBlocks: 29, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 42, dataCodewordsPerBlock: 24 },
									{ numBlocks: 1, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 23, dataCodewordsPerBlock: 15 },
									{ numBlocks: 28, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x209d5,
						versionNumber: 32,
						alignmentPatternCenters: [6, 34, 60, 86, 112, 138],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [{ numBlocks: 17, dataCodewordsPerBlock: 115 }],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 10, dataCodewordsPerBlock: 46 },
									{ numBlocks: 23, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 10, dataCodewordsPerBlock: 24 },
									{ numBlocks: 35, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 15 },
									{ numBlocks: 35, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x216f0,
						versionNumber: 33,
						alignmentPatternCenters: [6, 30, 58, 86, 114, 142],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 17, dataCodewordsPerBlock: 115 },
									{ numBlocks: 1, dataCodewordsPerBlock: 116 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 14, dataCodewordsPerBlock: 46 },
									{ numBlocks: 21, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 29, dataCodewordsPerBlock: 24 },
									{ numBlocks: 19, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 11, dataCodewordsPerBlock: 15 },
									{ numBlocks: 46, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x228ba,
						versionNumber: 34,
						alignmentPatternCenters: [6, 34, 62, 90, 118, 146],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 13, dataCodewordsPerBlock: 115 },
									{ numBlocks: 6, dataCodewordsPerBlock: 116 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 14, dataCodewordsPerBlock: 46 },
									{ numBlocks: 23, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 44, dataCodewordsPerBlock: 24 },
									{ numBlocks: 7, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 59, dataCodewordsPerBlock: 16 },
									{ numBlocks: 1, dataCodewordsPerBlock: 17 },
								],
							},
						],
					},
					{
						infoBits: 0x2379f,
						versionNumber: 35,
						alignmentPatternCenters: [6, 30, 54, 78, 102, 126, 150],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 12, dataCodewordsPerBlock: 121 },
									{ numBlocks: 7, dataCodewordsPerBlock: 122 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 12, dataCodewordsPerBlock: 47 },
									{ numBlocks: 26, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 39, dataCodewordsPerBlock: 24 },
									{ numBlocks: 14, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 22, dataCodewordsPerBlock: 15 },
									{ numBlocks: 41, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x24b0b,
						versionNumber: 36,
						alignmentPatternCenters: [6, 24, 50, 76, 102, 128, 154],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 121 },
									{ numBlocks: 14, dataCodewordsPerBlock: 122 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 6, dataCodewordsPerBlock: 47 },
									{ numBlocks: 34, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 46, dataCodewordsPerBlock: 24 },
									{ numBlocks: 10, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 2, dataCodewordsPerBlock: 15 },
									{ numBlocks: 64, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x2542e,
						versionNumber: 37,
						alignmentPatternCenters: [6, 28, 54, 80, 106, 132, 158],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 17, dataCodewordsPerBlock: 122 },
									{ numBlocks: 4, dataCodewordsPerBlock: 123 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 29, dataCodewordsPerBlock: 46 },
									{ numBlocks: 14, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 49, dataCodewordsPerBlock: 24 },
									{ numBlocks: 10, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 24, dataCodewordsPerBlock: 15 },
									{ numBlocks: 46, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x26a64,
						versionNumber: 38,
						alignmentPatternCenters: [6, 32, 58, 84, 110, 136, 162],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 4, dataCodewordsPerBlock: 122 },
									{ numBlocks: 18, dataCodewordsPerBlock: 123 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 13, dataCodewordsPerBlock: 46 },
									{ numBlocks: 32, dataCodewordsPerBlock: 47 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 48, dataCodewordsPerBlock: 24 },
									{ numBlocks: 14, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 42, dataCodewordsPerBlock: 15 },
									{ numBlocks: 32, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x27541,
						versionNumber: 39,
						alignmentPatternCenters: [6, 26, 54, 82, 110, 138, 166],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 20, dataCodewordsPerBlock: 117 },
									{ numBlocks: 4, dataCodewordsPerBlock: 118 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 40, dataCodewordsPerBlock: 47 },
									{ numBlocks: 7, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 43, dataCodewordsPerBlock: 24 },
									{ numBlocks: 22, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 10, dataCodewordsPerBlock: 15 },
									{ numBlocks: 67, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
					{
						infoBits: 0x28c69,
						versionNumber: 40,
						alignmentPatternCenters: [6, 30, 58, 86, 114, 142, 170],
						errorCorrectionLevels: [
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 19, dataCodewordsPerBlock: 118 },
									{ numBlocks: 6, dataCodewordsPerBlock: 119 },
								],
							},
							{
								ecCodewordsPerBlock: 28,
								ecBlocks: [
									{ numBlocks: 18, dataCodewordsPerBlock: 47 },
									{ numBlocks: 31, dataCodewordsPerBlock: 48 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 34, dataCodewordsPerBlock: 24 },
									{ numBlocks: 34, dataCodewordsPerBlock: 25 },
								],
							},
							{
								ecCodewordsPerBlock: 30,
								ecBlocks: [
									{ numBlocks: 20, dataCodewordsPerBlock: 15 },
									{ numBlocks: 61, dataCodewordsPerBlock: 16 },
								],
							},
						],
					},
				];

				/***/
			},
			/* 11 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				var BitMatrix_1 = __webpack_require__(0);
				function squareToQuadrilateral(p1, p2, p3, p4) {
					var dx3 = p1.x - p2.x + p3.x - p4.x;
					var dy3 = p1.y - p2.y + p3.y - p4.y;
					if (dx3 === 0 && dy3 === 0) {
						// Affine
						return {
							a11: p2.x - p1.x,
							a12: p2.y - p1.y,
							a13: 0,
							a21: p3.x - p2.x,
							a22: p3.y - p2.y,
							a23: 0,
							a31: p1.x,
							a32: p1.y,
							a33: 1,
						};
					} else {
						var dx1 = p2.x - p3.x;
						var dx2 = p4.x - p3.x;
						var dy1 = p2.y - p3.y;
						var dy2 = p4.y - p3.y;
						var denominator = dx1 * dy2 - dx2 * dy1;
						var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
						var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
						return {
							a11: p2.x - p1.x + a13 * p2.x,
							a12: p2.y - p1.y + a13 * p2.y,
							a13: a13,
							a21: p4.x - p1.x + a23 * p4.x,
							a22: p4.y - p1.y + a23 * p4.y,
							a23: a23,
							a31: p1.x,
							a32: p1.y,
							a33: 1,
						};
					}
				}
				function quadrilateralToSquare(p1, p2, p3, p4) {
					// Here, the adjoint serves as the inverse:
					var sToQ = squareToQuadrilateral(p1, p2, p3, p4);
					return {
						a11: sToQ.a22 * sToQ.a33 - sToQ.a23 * sToQ.a32,
						a12: sToQ.a13 * sToQ.a32 - sToQ.a12 * sToQ.a33,
						a13: sToQ.a12 * sToQ.a23 - sToQ.a13 * sToQ.a22,
						a21: sToQ.a23 * sToQ.a31 - sToQ.a21 * sToQ.a33,
						a22: sToQ.a11 * sToQ.a33 - sToQ.a13 * sToQ.a31,
						a23: sToQ.a13 * sToQ.a21 - sToQ.a11 * sToQ.a23,
						a31: sToQ.a21 * sToQ.a32 - sToQ.a22 * sToQ.a31,
						a32: sToQ.a12 * sToQ.a31 - sToQ.a11 * sToQ.a32,
						a33: sToQ.a11 * sToQ.a22 - sToQ.a12 * sToQ.a21,
					};
				}
				function times(a, b) {
					return {
						a11: a.a11 * b.a11 + a.a21 * b.a12 + a.a31 * b.a13,
						a12: a.a12 * b.a11 + a.a22 * b.a12 + a.a32 * b.a13,
						a13: a.a13 * b.a11 + a.a23 * b.a12 + a.a33 * b.a13,
						a21: a.a11 * b.a21 + a.a21 * b.a22 + a.a31 * b.a23,
						a22: a.a12 * b.a21 + a.a22 * b.a22 + a.a32 * b.a23,
						a23: a.a13 * b.a21 + a.a23 * b.a22 + a.a33 * b.a23,
						a31: a.a11 * b.a31 + a.a21 * b.a32 + a.a31 * b.a33,
						a32: a.a12 * b.a31 + a.a22 * b.a32 + a.a32 * b.a33,
						a33: a.a13 * b.a31 + a.a23 * b.a32 + a.a33 * b.a33,
					};
				}
				function extract(image, location) {
					var qToS = quadrilateralToSquare(
						{ x: 3.5, y: 3.5 },
						{ x: location.dimension - 3.5, y: 3.5 },
						{ x: location.dimension - 6.5, y: location.dimension - 6.5 },
						{ x: 3.5, y: location.dimension - 3.5 }
					);
					var sToQ = squareToQuadrilateral(
						location.topLeft,
						location.topRight,
						location.alignmentPattern,
						location.bottomLeft
					);
					var transform = times(sToQ, qToS);
					var matrix = BitMatrix_1.BitMatrix.createEmpty(location.dimension, location.dimension);
					var mappingFunction = function (x, y) {
						var denominator = transform.a13 * x + transform.a23 * y + transform.a33;
						return {
							x: (transform.a11 * x + transform.a21 * y + transform.a31) / denominator,
							y: (transform.a12 * x + transform.a22 * y + transform.a32) / denominator,
						};
					};
					for (var y = 0; y < location.dimension; y++) {
						for (var x = 0; x < location.dimension; x++) {
							var xValue = x + 0.5;
							var yValue = y + 0.5;
							var sourcePixel = mappingFunction(xValue, yValue);
							matrix.set(x, y, image.get(Math.floor(sourcePixel.x), Math.floor(sourcePixel.y)));
						}
					}
					return {
						matrix: matrix,
						mappingFunction: mappingFunction,
					};
				}
				exports.extract = extract;

				/***/
			},
			/* 12 */
			/***/ function (module, exports, __webpack_require__) {
				'use strict';

				Object.defineProperty(exports, '__esModule', { value: true });
				var MAX_FINDERPATTERNS_TO_SEARCH = 4;
				var MIN_QUAD_RATIO = 0.5;
				var MAX_QUAD_RATIO = 1.5;
				var distance = function (a, b) {
					return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
				};
				function sum(values) {
					return values.reduce(function (a, b) {
						return a + b;
					});
				}
				// Takes three finder patterns and organizes them into topLeft, topRight, etc
				function reorderFinderPatterns(pattern1, pattern2, pattern3) {
					var _a, _b, _c, _d;
					// Find distances between pattern centers
					var oneTwoDistance = distance(pattern1, pattern2);
					var twoThreeDistance = distance(pattern2, pattern3);
					var oneThreeDistance = distance(pattern1, pattern3);
					var bottomLeft;
					var topLeft;
					var topRight;
					// Assume one closest to other two is B; A and C will just be guesses at first
					if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
						(_a = [pattern2, pattern1, pattern3]),
							(bottomLeft = _a[0]),
							(topLeft = _a[1]),
							(topRight = _a[2]);
					} else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
						(_b = [pattern1, pattern2, pattern3]),
							(bottomLeft = _b[0]),
							(topLeft = _b[1]),
							(topRight = _b[2]);
					} else {
						(_c = [pattern1, pattern3, pattern2]),
							(bottomLeft = _c[0]),
							(topLeft = _c[1]),
							(topRight = _c[2]);
					}
					// Use cross product to figure out whether bottomLeft (A) and topRight (C) are correct or flipped in relation to topLeft (B)
					// This asks whether BC x BA has a positive z component, which is the arrangement we want. If it's negative, then
					// we've got it flipped around and should swap topRight and bottomLeft.
					if (
						(topRight.x - topLeft.x) * (bottomLeft.y - topLeft.y) -
							(topRight.y - topLeft.y) * (bottomLeft.x - topLeft.x) <
						0
					) {
						(_d = [topRight, bottomLeft]), (bottomLeft = _d[0]), (topRight = _d[1]);
					}
					return { bottomLeft: bottomLeft, topLeft: topLeft, topRight: topRight };
				}
				// Computes the dimension (number of modules on a side) of the QR Code based on the position of the finder patterns
				function computeDimension(topLeft, topRight, bottomLeft, matrix) {
					var moduleSize =
						(sum(countBlackWhiteRun(topLeft, bottomLeft, matrix, 5)) / 7 + // Divide by 7 since the ratio is 1:1:3:1:1
							sum(countBlackWhiteRun(topLeft, topRight, matrix, 5)) / 7 +
							sum(countBlackWhiteRun(bottomLeft, topLeft, matrix, 5)) / 7 +
							sum(countBlackWhiteRun(topRight, topLeft, matrix, 5)) / 7) /
						4;
					if (moduleSize < 1) {
						throw new Error('Invalid module size');
					}
					var topDimension = Math.round(distance(topLeft, topRight) / moduleSize);
					var sideDimension = Math.round(distance(topLeft, bottomLeft) / moduleSize);
					var dimension = Math.floor((topDimension + sideDimension) / 2) + 7;
					switch (dimension % 4) {
						case 0:
							dimension++;
							break;
						case 2:
							dimension--;
							break;
					}
					return { dimension: dimension, moduleSize: moduleSize };
				}
				// Takes an origin point and an end point and counts the sizes of the black white run from the origin towards the end point.
				// Returns an array of elements, representing the pixel size of the black white run.
				// Uses a variant of http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
				function countBlackWhiteRunTowardsPoint(origin, end, matrix, length) {
					var switchPoints = [{ x: Math.floor(origin.x), y: Math.floor(origin.y) }];
					var steep = Math.abs(end.y - origin.y) > Math.abs(end.x - origin.x);
					var fromX;
					var fromY;
					var toX;
					var toY;
					if (steep) {
						fromX = Math.floor(origin.y);
						fromY = Math.floor(origin.x);
						toX = Math.floor(end.y);
						toY = Math.floor(end.x);
					} else {
						fromX = Math.floor(origin.x);
						fromY = Math.floor(origin.y);
						toX = Math.floor(end.x);
						toY = Math.floor(end.y);
					}
					var dx = Math.abs(toX - fromX);
					var dy = Math.abs(toY - fromY);
					var error = Math.floor(-dx / 2);
					var xStep = fromX < toX ? 1 : -1;
					var yStep = fromY < toY ? 1 : -1;
					var currentPixel = true;
					// Loop up until x == toX, but not beyond
					for (var x = fromX, y = fromY; x !== toX + xStep; x += xStep) {
						// Does current pixel mean we have moved white to black or vice versa?
						// Scanning black in state 0,2 and white in state 1, so if we find the wrong
						// color, advance to next state or end if we are in state 2 already
						var realX = steep ? y : x;
						var realY = steep ? x : y;
						if (matrix.get(realX, realY) !== currentPixel) {
							currentPixel = !currentPixel;
							switchPoints.push({ x: realX, y: realY });
							if (switchPoints.length === length + 1) {
								break;
							}
						}
						error += dy;
						if (error > 0) {
							if (y === toY) {
								break;
							}
							y += yStep;
							error -= dx;
						}
					}
					var distances = [];
					for (var i = 0; i < length; i++) {
						if (switchPoints[i] && switchPoints[i + 1]) {
							distances.push(distance(switchPoints[i], switchPoints[i + 1]));
						} else {
							distances.push(0);
						}
					}
					return distances;
				}
				// Takes an origin point and an end point and counts the sizes of the black white run in the origin point
				// along the line that intersects with the end point. Returns an array of elements, representing the pixel sizes
				// of the black white run. Takes a length which represents the number of switches from black to white to look for.
				function countBlackWhiteRun(origin, end, matrix, length) {
					var _a;
					var rise = end.y - origin.y;
					var run = end.x - origin.x;
					var towardsEnd = countBlackWhiteRunTowardsPoint(origin, end, matrix, Math.ceil(length / 2));
					var awayFromEnd = countBlackWhiteRunTowardsPoint(
						origin,
						{ x: origin.x - run, y: origin.y - rise },
						matrix,
						Math.ceil(length / 2)
					);
					var middleValue = towardsEnd.shift() + awayFromEnd.shift() - 1; // Substract one so we don't double count a pixel
					return (_a = awayFromEnd.concat(middleValue)).concat.apply(_a, towardsEnd);
				}
				// Takes in a black white run and an array of expected ratios. Returns the average size of the run as well as the "error" -
				// that is the amount the run diverges from the expected ratio
				function scoreBlackWhiteRun(sequence, ratios) {
					var averageSize = sum(sequence) / sum(ratios);
					var error = 0;
					ratios.forEach(function (ratio, i) {
						error += Math.pow(sequence[i] - ratio * averageSize, 2);
					});
					return { averageSize: averageSize, error: error };
				}
				// Takes an X,Y point and an array of sizes and scores the point against those ratios.
				// For example for a finder pattern takes the ratio list of 1:1:3:1:1 and checks horizontal, vertical and diagonal ratios
				// against that.
				function scorePattern(point, ratios, matrix) {
					try {
						var horizontalRun = countBlackWhiteRun(point, { x: -1, y: point.y }, matrix, ratios.length);
						var verticalRun = countBlackWhiteRun(point, { x: point.x, y: -1 }, matrix, ratios.length);
						var topLeftPoint = {
							x: Math.max(0, point.x - point.y) - 1,
							y: Math.max(0, point.y - point.x) - 1,
						};
						var topLeftBottomRightRun = countBlackWhiteRun(point, topLeftPoint, matrix, ratios.length);
						var bottomLeftPoint = {
							x: Math.min(matrix.width, point.x + point.y) + 1,
							y: Math.min(matrix.height, point.y + point.x) + 1,
						};
						var bottomLeftTopRightRun = countBlackWhiteRun(point, bottomLeftPoint, matrix, ratios.length);
						var horzError = scoreBlackWhiteRun(horizontalRun, ratios);
						var vertError = scoreBlackWhiteRun(verticalRun, ratios);
						var diagDownError = scoreBlackWhiteRun(topLeftBottomRightRun, ratios);
						var diagUpError = scoreBlackWhiteRun(bottomLeftTopRightRun, ratios);
						var ratioError = Math.sqrt(
							horzError.error * horzError.error +
								vertError.error * vertError.error +
								diagDownError.error * diagDownError.error +
								diagUpError.error * diagUpError.error
						);
						var avgSize =
							(horzError.averageSize +
								vertError.averageSize +
								diagDownError.averageSize +
								diagUpError.averageSize) /
							4;
						var sizeError =
							(Math.pow(horzError.averageSize - avgSize, 2) +
								Math.pow(vertError.averageSize - avgSize, 2) +
								Math.pow(diagDownError.averageSize - avgSize, 2) +
								Math.pow(diagUpError.averageSize - avgSize, 2)) /
							avgSize;
						return ratioError + sizeError;
					} catch (_a) {
						return Infinity;
					}
				}
				function recenterLocation(matrix, p) {
					var leftX = Math.round(p.x);
					while (matrix.get(leftX, Math.round(p.y))) {
						leftX--;
					}
					var rightX = Math.round(p.x);
					while (matrix.get(rightX, Math.round(p.y))) {
						rightX++;
					}
					var x = (leftX + rightX) / 2;
					var topY = Math.round(p.y);
					while (matrix.get(Math.round(x), topY)) {
						topY--;
					}
					var bottomY = Math.round(p.y);
					while (matrix.get(Math.round(x), bottomY)) {
						bottomY++;
					}
					var y = (topY + bottomY) / 2;
					return { x: x, y: y };
				}
				function locate(matrix) {
					var finderPatternQuads = [];
					var activeFinderPatternQuads = [];
					var alignmentPatternQuads = [];
					var activeAlignmentPatternQuads = [];
					var _loop_1 = function (y) {
						var length_1 = 0;
						var lastBit = false;
						var scans = [0, 0, 0, 0, 0];
						var _loop_2 = function (x) {
							var v = matrix.get(x, y);
							if (v === lastBit) {
								length_1++;
							} else {
								scans = [scans[1], scans[2], scans[3], scans[4], length_1];
								length_1 = 1;
								lastBit = v;
								// Do the last 5 color changes ~ match the expected ratio for a finder pattern? 1:1:3:1:1 of b:w:b:w:b
								var averageFinderPatternBlocksize = sum(scans) / 7;
								var validFinderPattern =
									Math.abs(scans[0] - averageFinderPatternBlocksize) <
										averageFinderPatternBlocksize &&
									Math.abs(scans[1] - averageFinderPatternBlocksize) <
										averageFinderPatternBlocksize &&
									Math.abs(scans[2] - 3 * averageFinderPatternBlocksize) <
										3 * averageFinderPatternBlocksize &&
									Math.abs(scans[3] - averageFinderPatternBlocksize) <
										averageFinderPatternBlocksize &&
									Math.abs(scans[4] - averageFinderPatternBlocksize) <
										averageFinderPatternBlocksize &&
									!v; // And make sure the current pixel is white since finder patterns are bordered in white
								// Do the last 3 color changes ~ match the expected ratio for an alignment pattern? 1:1:1 of w:b:w
								var averageAlignmentPatternBlocksize = sum(scans.slice(-3)) / 3;
								var validAlignmentPattern =
									Math.abs(scans[2] - averageAlignmentPatternBlocksize) <
										averageAlignmentPatternBlocksize &&
									Math.abs(scans[3] - averageAlignmentPatternBlocksize) <
										averageAlignmentPatternBlocksize &&
									Math.abs(scans[4] - averageAlignmentPatternBlocksize) <
										averageAlignmentPatternBlocksize &&
									v; // Is the current pixel black since alignment patterns are bordered in black
								if (validFinderPattern) {
									// Compute the start and end x values of the large center black square
									var endX_1 = x - scans[3] - scans[4];
									var startX_1 = endX_1 - scans[2];
									var line = { startX: startX_1, endX: endX_1, y: y };
									// Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
									// that line as the starting point.
									var matchingQuads = activeFinderPatternQuads.filter(function (q) {
										return (
											(startX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
											(endX_1 >= q.bottom.startX && startX_1 <= q.bottom.endX) ||
											(startX_1 <= q.bottom.startX &&
												endX_1 >= q.bottom.endX &&
												scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
												scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO)
										);
									});
									if (matchingQuads.length > 0) {
										matchingQuads[0].bottom = line;
									} else {
										activeFinderPatternQuads.push({ top: line, bottom: line });
									}
								}
								if (validAlignmentPattern) {
									// Compute the start and end x values of the center black square
									var endX_2 = x - scans[4];
									var startX_2 = endX_2 - scans[3];
									var line = { startX: startX_2, y: y, endX: endX_2 };
									// Is there a quad directly above the current spot? If so, extend it with the new line. Otherwise, create a new quad with
									// that line as the starting point.
									var matchingQuads = activeAlignmentPatternQuads.filter(function (q) {
										return (
											(startX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
											(endX_2 >= q.bottom.startX && startX_2 <= q.bottom.endX) ||
											(startX_2 <= q.bottom.startX &&
												endX_2 >= q.bottom.endX &&
												scans[2] / (q.bottom.endX - q.bottom.startX) < MAX_QUAD_RATIO &&
												scans[2] / (q.bottom.endX - q.bottom.startX) > MIN_QUAD_RATIO)
										);
									});
									if (matchingQuads.length > 0) {
										matchingQuads[0].bottom = line;
									} else {
										activeAlignmentPatternQuads.push({ top: line, bottom: line });
									}
								}
							}
						};
						for (var x = -1; x <= matrix.width; x++) {
							_loop_2(x);
						}
						finderPatternQuads.push.apply(
							finderPatternQuads,
							activeFinderPatternQuads.filter(function (q) {
								return q.bottom.y !== y && q.bottom.y - q.top.y >= 2;
							})
						);
						activeFinderPatternQuads = activeFinderPatternQuads.filter(function (q) {
							return q.bottom.y === y;
						});
						alignmentPatternQuads.push.apply(
							alignmentPatternQuads,
							activeAlignmentPatternQuads.filter(function (q) {
								return q.bottom.y !== y;
							})
						);
						activeAlignmentPatternQuads = activeAlignmentPatternQuads.filter(function (q) {
							return q.bottom.y === y;
						});
					};
					for (var y = 0; y <= matrix.height; y++) {
						_loop_1(y);
					}
					finderPatternQuads.push.apply(
						finderPatternQuads,
						activeFinderPatternQuads.filter(function (q) {
							return q.bottom.y - q.top.y >= 2;
						})
					);
					alignmentPatternQuads.push.apply(alignmentPatternQuads, activeAlignmentPatternQuads);
					var finderPatternGroups = finderPatternQuads
						.filter(function (q) {
							return q.bottom.y - q.top.y >= 2;
						}) // All quads must be at least 2px tall since the center square is larger than a block
						.map(function (q) {
							var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
							var y = (q.top.y + q.bottom.y + 1) / 2;
							if (!matrix.get(Math.round(x), Math.round(y))) {
								return;
							}
							var lengths = [
								q.top.endX - q.top.startX,
								q.bottom.endX - q.bottom.startX,
								q.bottom.y - q.top.y + 1,
							];
							var size = sum(lengths) / lengths.length;
							var score = scorePattern({ x: Math.round(x), y: Math.round(y) }, [1, 1, 3, 1, 1], matrix);
							return { score: score, x: x, y: y, size: size };
						})
						.filter(function (q) {
							return !!q;
						}) // Filter out any rejected quads from above
						.sort(function (a, b) {
							return a.score - b.score;
						})
						// Now take the top finder pattern options and try to find 2 other options with a similar size.
						.map(function (point, i, finderPatterns) {
							if (i > MAX_FINDERPATTERNS_TO_SEARCH) {
								return null;
							}
							var otherPoints = finderPatterns
								.filter(function (p, ii) {
									return i !== ii;
								})
								.map(function (p) {
									return {
										x: p.x,
										y: p.y,
										score: p.score + Math.pow(p.size - point.size, 2) / point.size,
										size: p.size,
									};
								})
								.sort(function (a, b) {
									return a.score - b.score;
								});
							if (otherPoints.length < 2) {
								return null;
							}
							var score = point.score + otherPoints[0].score + otherPoints[1].score;
							return { points: [point].concat(otherPoints.slice(0, 2)), score: score };
						})
						.filter(function (q) {
							return !!q;
						}) // Filter out any rejected finder patterns from above
						.sort(function (a, b) {
							return a.score - b.score;
						});
					if (finderPatternGroups.length === 0) {
						return null;
					}
					var _a = reorderFinderPatterns(
							finderPatternGroups[0].points[0],
							finderPatternGroups[0].points[1],
							finderPatternGroups[0].points[2]
						),
						topRight = _a.topRight,
						topLeft = _a.topLeft,
						bottomLeft = _a.bottomLeft;
					var alignment = findAlignmentPattern(matrix, alignmentPatternQuads, topRight, topLeft, bottomLeft);
					var result = [];
					if (alignment) {
						result.push({
							alignmentPattern: { x: alignment.alignmentPattern.x, y: alignment.alignmentPattern.y },
							bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
							dimension: alignment.dimension,
							topLeft: { x: topLeft.x, y: topLeft.y },
							topRight: { x: topRight.x, y: topRight.y },
						});
					}
					// We normally use the center of the quads as the location of the tracking points, which is optimal for most cases and will account
					// for a skew in the image. However, In some cases, a slight skew might not be real and instead be caused by image compression
					// errors and/or low resolution. For those cases, we'd be better off centering the point exactly in the middle of the black area. We
					// compute and return the location data for the naively centered points as it is little additional work and allows for multiple
					// attempts at decoding harder images.
					var midTopRight = recenterLocation(matrix, topRight);
					var midTopLeft = recenterLocation(matrix, topLeft);
					var midBottomLeft = recenterLocation(matrix, bottomLeft);
					var centeredAlignment = findAlignmentPattern(
						matrix,
						alignmentPatternQuads,
						midTopRight,
						midTopLeft,
						midBottomLeft
					);
					if (centeredAlignment) {
						result.push({
							alignmentPattern: {
								x: centeredAlignment.alignmentPattern.x,
								y: centeredAlignment.alignmentPattern.y,
							},
							bottomLeft: { x: midBottomLeft.x, y: midBottomLeft.y },
							topLeft: { x: midTopLeft.x, y: midTopLeft.y },
							topRight: { x: midTopRight.x, y: midTopRight.y },
							dimension: centeredAlignment.dimension,
						});
					}
					if (result.length === 0) {
						return null;
					}
					return result;
				}
				exports.locate = locate;
				function findAlignmentPattern(matrix, alignmentPatternQuads, topRight, topLeft, bottomLeft) {
					var _a;
					// Now that we've found the three finder patterns we can determine the blockSize and the size of the QR code.
					// We'll use these to help find the alignment pattern but also later when we do the extraction.
					var dimension;
					var moduleSize;
					try {
						(_a = computeDimension(topLeft, topRight, bottomLeft, matrix)),
							(dimension = _a.dimension),
							(moduleSize = _a.moduleSize);
					} catch (e) {
						return null;
					}
					// Now find the alignment pattern
					var bottomRightFinderPattern = {
						x: topRight.x - topLeft.x + bottomLeft.x,
						y: topRight.y - topLeft.y + bottomLeft.y,
					};
					var modulesBetweenFinderPatterns =
						(distance(topLeft, bottomLeft) + distance(topLeft, topRight)) / 2 / moduleSize;
					var correctionToTopLeft = 1 - 3 / modulesBetweenFinderPatterns;
					var expectedAlignmentPattern = {
						x: topLeft.x + correctionToTopLeft * (bottomRightFinderPattern.x - topLeft.x),
						y: topLeft.y + correctionToTopLeft * (bottomRightFinderPattern.y - topLeft.y),
					};
					var alignmentPatterns = alignmentPatternQuads
						.map(function (q) {
							var x = (q.top.startX + q.top.endX + q.bottom.startX + q.bottom.endX) / 4;
							var y = (q.top.y + q.bottom.y + 1) / 2;
							if (!matrix.get(Math.floor(x), Math.floor(y))) {
								return;
							}
							var sizeScore = scorePattern({ x: Math.floor(x), y: Math.floor(y) }, [1, 1, 1], matrix);
							var score = sizeScore + distance({ x: x, y: y }, expectedAlignmentPattern);
							return { x: x, y: y, score: score };
						})
						.filter(function (v) {
							return !!v;
						})
						.sort(function (a, b) {
							return a.score - b.score;
						});
					// If there are less than 15 modules between finder patterns it's a version 1 QR code and as such has no alignmemnt pattern
					// so we can only use our best guess.
					var alignmentPattern =
						modulesBetweenFinderPatterns >= 15 && alignmentPatterns.length
							? alignmentPatterns[0]
							: expectedAlignmentPattern;
					return { alignmentPattern: alignmentPattern, dimension: dimension };
				}

				/***/
			},
			/******/
		]
	)['default'];
});
