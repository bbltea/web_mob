import http from 'node:http';
import url from 'node:url';

const id_software = [
    { id: 1, name: 'John Carmack', pic: 'https://www.filfre.net/wp-content/uploads/2020/05/Ferrari.jpg' },
    { id: 2, name: 'John Romero', pic: 'https://i.imgur.com/SVXSpYE.jpeg' },
];

const server = http.createServer((req, res) => {
    req.body = '';

    req.on('data', (chunk) => {
        req.body += chunk;
    });

    req.on('end', () => {
        if (req.url.startsWith('/api') && req.method === "GET") {
            const queryObject = url.parse(req.url, true).query;
            const page = parseInt(queryObject.page) || 1;
            const limit = parseInt(queryObject.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            const paginatedData = id_software.slice(startIndex, endIndex);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                data: paginatedData,
                page,
                limit,
                total: id_software.length,
            }));
            
            return;
        }

        if (req.url === '/api' && req.method === "POST") {
            const body = JSON.parse(req.body);

            const { name, pic } = body;

            const maxId = Math.max(...id_software.map(id_software => id_software.id));

            id_software.push({ id: maxId + 1, name, pic });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(id_software));

            return;
        }

        if (req.url.startsWith('/api') && req.method === "PUT") {
            const body = JSON.parse(req.body);
            const id = parseInt(url.parse(req.url, true).pathname.split('/')[2]);
            const index = id_software.findIndex(id_software => id_software.id === id); 

            const { name, pic } = body;

            if (index !== -1) {
                id_software[index] = { id, name, pic };
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Not found!' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(id_software));

            return;
        }

        if (req.url.startsWith('/api') && req.method === "PATCH") {
            const body = JSON.parse(req.body);
            const id = parseInt(url.parse(req.url, true).pathname.split('/')[2]);
            const index = id_software.findIndex(id_software => id_software.id === id); 

            const { name, pic } = body;

            if (index !== -1) {
                if (name) {
                    id_software[index].name = name;
                }
                if (pic) {
                    id_software[index].pic = pic;
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Not found!' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(id_software));

            return;
        }

        if (req.url.startsWith('/api') && req.method === "DELETE") {
            const id = parseInt(url.parse(req.url, true).pathname.split('/')[2]);
            const index = id_software.findIndex(id_software => id_software.id === id); 

            if (index !== -1) {
                id_software.splice(index, 1);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Not found!' }));
                return;
            }
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Not found!',
        }));
    })
});

server.listen(8000);