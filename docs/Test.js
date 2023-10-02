import { jsQR } from './jsQR.es.min.js';
// import { jsQR } from './jsQR.js';
import { CanvasQRCode } from './qrcode.es.js';
const te = new TextEncoder('utf-8');
const td = new TextDecoder('utf-8');
const base64Regex = /^[0-9a-zA-Z/+=]+$/;
const base64UrlRegex = /^[0-9a-zA-Z-_]+$/;
class B64U {
	constructor() {}
	static toHex(buffer) {
		const byteArray = new Uint8Array(buffer);
		const hexCodes = [...byteArray].map((value) => {
			const hexCode = value.toString(16);
			const paddedHexCode = hexCode.padStart(2, '0');
			return paddedHexCode;
		});
		return hexCodes.join('');
	}
	static isBase64(value) {
		B64U;
		return value && typeof value === 'string' && value.length % 4 === 0 && base64Regex.test(value);
	}
	static isBase64Url(value) {
		return typeof value === 'string' && base64UrlRegex.test(value) && value !== 'undefined' && value !== 'null';
	}
	static objToJsonBase64Url(obj) {
		return B64U.ab2B64U(B64U.s2Ab(JSON.stringify(obj)));
	}
	static jsonB64U2Obj(base64url) {
		return JSON.parse(B64U.ab2S(B64U.b64u2Ab(base64url)));
	}
	static ab2B64(ab) {
		return btoa(B64U.ab2bs(ab.buffer ? ab.buffer : ab));
	}
	static ab2B64U(ab) {
		return B64U.toBase64Url(B64U.ab2B64(ab));
	}
	static b642Ab(b64) {
		return B64U.bs2Ab(atob(b64));
	}
	static b64u2Ab(b64u) {
		return B64U.b642Ab(B64U.toBase64(b64u));
	}
	static b64u2S(b64u) {
		return B64U.ab2S(B64U.b64u2Ab(b64u));
	}
	static stringToBase64url(str) {
		return B64U.ab2B64U(B64U.s2Ab(str));
	}
	static toBase64Url(base64) {
		return base64 ? base64.split('+').join('-').split('/').join('_').split('=').join('') : base64;
	}
	static toBase64(base64Url) {
		const len = base64Url.length;
		const count = len % 4 > 0 ? 4 - (len % 4) : 0;
		let resultBase64 = base64Url.split('-').join('+').split('_').join('/');
		for (let i = 0; i < count; i++) resultBase64 += '=';
		return resultBase64;
	}
	static bs2Ab(binaryString) {
		return B64U.bs2U8a(binaryString).buffer;
	}
	static ab2bs(ab) {
		return B64U.u8a2Bs(new Uint8Array(ab));
	}
	static ab2B64(ab) {
		return btoa(B64U.u8a2Bs(new Uint8Array(ab)));
	}
	static ab2dURI(ab, type = 'application/octet-stream') {
		return `data:${type};base64,${B64U.ab2B64(ab)}`;
	}
	static s2U8a(str) {
		return te.encode(str);
	}
	static s2Ab(str) {
		return te.encode(str).buffer;
	}
	static ab2S(ab) {
		return td.decode(new Uint8Array(ab));
	}
	static u8aToString(u8a) {
		return td.decode(new Uint8Array(u8a.buffer));
	}
	static joinU8as(u8as) {
		let sumLength = 0,
			offset = 0;
		for (const u8a of u8as) sumLength += u8a.byteLength;
		const united = new Uint8Array(sumLength);
		for (const u8a of u8as) united.set(u8a, offset);
		offset += u8a.byteLength;
		return united;
	}
	static bs2U8a(bs) {
		const rawLength = bs.length;
		const array = new Uint8Array(new ArrayBuffer(rawLength));
		for (let i = 0; i < rawLength; i++) array[i] = bs.charCodeAt(i);
		return array;
	}
	static u8a2Bs(u8a) {
		const r = [];
		for (const e of u8a) r.push(String.fromCharCode(e));
		return r.join('');
	}
	static bs2dURI(bs, type = 'application/octet-stream') {
		return `data:${type};base64,${btoa(bs)}`;
	}
	static b642dURI(base64, type = 'application/octet-stream') {
		return `data:${type};base64,${base64}`;
	}
	static b642Bs(base64) {
		return atob(base64);
	}
	static b642Ab(base64) {
		return B64U.bs2Ab(atob(base64));
	}
	static dURI2Bs(dataURI) {
		return atob(dataURI.split(',')[1]);
	}
	static dURI2Ab(dataURI) {
		return B64U.bs2U8a(atob(dataURI.split(',')[1])).buffer;
	}
	static ab2U8a(ab) {
		return new Uint8Array(ab);
	}
	static ab2U16a(ab) {
		return new Uint16Array(ab);
	}
	static ab2U32a(ab) {
		return new Uint32Array(ab);
	}
	static ab2Blob(val, type = 'application/octet-stream') {
		return new Blob([val], { type: type });
	}
	static readBlob(blob) {
		const reader = new FileReader();
		const promise = new Promise((resolve, reject) => {
			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);
		});
		return {
			asArrayBuffer() {
				reader.readAsArrayBuffer(blob);
				return promise;
			},
			asBinaryString() {
				reader.readAsBinaryString(blob);
				return promise;
			},
			asDataURL() {
				reader.readAsDataURL(blob);
				return promise;
			},
			asText() {
				reader.readAsText(blob);
				return promise;
			},
		};
	}
	static convertU8aToU16a(u8a) {
		const len = u8a.length;
		if (len % 2 > 0) throw new RangeError('Uint8Arrayの長さが2の倍数ではありません。');
		return new Uint16Array(u8a.buffer);
	}
}

class Hasher {
	static async digest(msg, algo = 'SHA-256', stretchCount = 1) {
		let result = te.encode(msg);
		for (let i = 0; i < stretchCount; i++) result = await window.crypto.subtle.digest(algo, result);
		return B64U.ab2B64U(result);
	}
}
export class Test {
	static canvas = document.createElement('canvas');
	static baseElm = document.createElement('div');
	static async exec(elm) {
		const results = [];
		let c = 0;
		for (let i = 0; i < 2; ) {
			const seed = i + '/' + Date.now() + Math.random() * Date.now();
			const text = await Hasher.digest(seed, 'SHA-512');
			const result = await Test.check(elm, text);
			c++;
			if (result === true) {
				continue;
			}

			i++;
			results.push(result);
		}
		console.log('=========================c:' + c);
		return results;
	}
	static a2S(a) {
		if (!a) return '';
		const l = a.length;
		const u8a = new Uint8Array(l);
		for (let i = 0; i < l; i++) {
			u8a[i] = a[i];
		}
		return B64U.u8aToString(u8a);
	}
	static async check(elm, text, s = Math.floor(Math.random() * 100) + 150) {
		const be = Test.baseElm;
		new CanvasQRCode(be, text, s, s);
		const c = be.firstChild;
		const x = c.getContext('2d');
		const d = x.getImageData(0, 0, s, s);
		const c2 = document.createElement('canvas');
		const s2 = Math.floor(s * 1.5);
		console.log('s:' + s + '/s2:' + s2);
		c2.width = c2.height = s2;
		const x2 = c2.getContext('2d'),
			d2 = x2.createImageData(s2, s2),
			l = d2.data.length,
			n = new Uint8Array(l);
		n.fill(255);
		for (let i = 0; i < l; i++) d2.data[i] = n[i];
		x2.putImageData(d2, 0, 0);
		const offsetW = Math.floor((Math.random() * s) / 2);
		const offsetH = Math.floor((Math.random() * s) / 2);
		x2.putImageData(d, offsetW, offsetH);
		const d3 = x2.getImageData(0, 0, s2, s2);
		const result = await jsQR(d3.data, s2, s2);
		const bd = result ? result.binaryData : result;
		const t = bd ? Test.a2S(bd) : null;
		const isOK = text === t;
		if (isOK) {
			while (be.firstChild) {
				be.removeChild(be.firstChild);
			}
			return true;
		}
		const dURI = c2.toDataURL('image/png');
		const i = document.createElement('img');
		const f = document.createElement('div');
		const g = document.createElement('div');
		const h = document.createElement('div');
		const j = document.createElement('div');
		g.appendChild(i);
		g.appendChild(f);
		g.appendChild(h);
		g.appendChild(j);

		f.classList.add('text');
		j.classList.add('duri');
		g.classList.add('test');
		f.textContent = '' + text;
		elm.appendChild(g);
		i.src = dURI;
		j.textContent = dURI;
		while (be.firstChild) {
			be.removeChild(be.firstChild);
		}
		console.log(result);
		g.classList.add(isOK ? 'OK' : 'NG');
		h.textContent = isOK ? 'OK' : 'NG ' + result;
		h.setAttribute('id', text);
		console.log(
			'text:' + text + '/h.textContent :' + h.textContent + ' /result:' + result + ' ' + isOK,
			d3.data,
			result
		);
		return { text, data: d3.data, s: s2, isOK, dURI };
	}
	static copy(dURI) {
		return () => {
			navigator.clipboard.writeText(dURI).then(() => alert('COPYED!'));
		};
	}
	static getRerunFunc(jsRQorigin, dURI, origin) {
		return () => {
			const f = async (resolve) => {
				const i = document.createElement('img');
				i.onload = async () => {
					const c = Test.canvas;
					const s = i.width;
					console.log('s:' + s);
					c.width = c.height = s;
					const x = c.getContext('2d');
					x.drawImage(i, 0, 0);
					const d = x.getImageData(0, 0, s, s);
					console.log('=== ES =======================================================');
					const re = await jsQR(d.data, s, s);
					console.log('===ORIGIN=======================================================');
					const ro = jsRQorigin(d.data, s, s);
					console.log('==========================================================');
					const bde = re ? re.binaryData : re;
					const te = bde ? Test.a2S(bde) : null;
					const bdo = ro ? ro.binaryData : ro;
					const to = bdo ? Test.a2S(bdo) : null;

					console.log(to && te === to ? 'OK' : 'NG');
					console.log(te, to, origin);
					resolve({ te, to });
				};
				i.src = dURI;
			};
			return new Promise(f);
		};
	}
}
