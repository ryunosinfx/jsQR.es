import fs from 'fs';
import http from 'http';
const exts = {
	js: 'text/javascript',
	css: 'text/css',
	html: 'text/html',
};
const PORT = 8089;

http.createServer((req, res) => {
	const url = req.url.replace('../', '/'),
		t = url.split('.'),
		ext = t[t.length - 1];
	console.log(`req url:${url}`);
	const header = {
		'Content-Type': exts[ext] ? exts[ext] : 'text/plain',
	};
	try {
		res.writeHead(200, header);
		res.end(fs.readFileSync(`.${url}`));
	} catch (e) {
		res.writeHead(404, header);
		console.log(`req e:${e}`);
		res.end('NOT FOUND');
	}
}).listen(PORT, '127.0.0.1');
