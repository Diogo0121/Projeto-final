const http = require('http') // Usado para criar o servidor WEB
const fs = require('fs') // FS = File System
const path = require('path') // Para manipular arquivos e pastas

require('dotenv').config({ quiet: true })

const { executarQueryNeon, buscarCategorias, insertCategoria } = require('./script_db_quantum')

const PORTA = process.env.PORT || 3001

const arquivos = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/app.js': { arquivo: 'app.js', tipo: 'text/javascript; charset=utf-8' }
    // falta o css e arquivos complementares
}

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(dados))
}

function lerCorpo(req) {
    return new Promise((resolve, reject) => {
        let corpo = ''
        req.on('data', pedaco => corpo += pedaco)

        req.on('end', () => {
            try {
                resolve(JSON.parse(corpo || '{}'))
            } catch (erro) {
                reject(erro)
            }
        })

        req.on('error', reject)
    })
}

const servidor = http.createServer(async (req, res) => {
    // quero listar os itens da tabela categoria do DB via GET
    if (req.url === '/api/categorias' && req.method === 'GET') {
        const linhas = await buscarCategorias()
        if (linhas === null) {
            return responderJSON(res, 500, { erro: 'Falha ao buscar no banco' })
        }
        return responderJSON(res, 200, linhas)
    }

    if (req.url === '/api/categorias' && req.method === 'POST') {
        let corpo
        try {
            corpo = await lerCorpo(req)
        } catch (erro) {
            return responderJSON(res, 400, { erro: 'JSON inválido' })
        }

        const descricao = (corpo.descricao || '').trim()
        if (!descricao) {
            return responderJSON(res, 400, { erro: 'Informe a descrição' })
        }

        const novaCategoria = await insertCategoria(descricao)

        if (novaCategoria === null) {
            return responderJSON(res, 500, { erro: 'Falha ao inserir no banco' })
        }

        return responderJSON(res, 201, novaCategoria)
    }

    const rota = arquivos[req.url]
    if (rota) {
        res.writeHead(200, { 'Content-Type': rota.tipo })
        return fs.createReadStream(path.join(__dirname, rota.arquivo)).pipe(res)
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Página não encontrada')
})

servidor.listen(PORTA, () => {
    console.log('Servidor Online')
    console.log('Loja do Zé')
    console.log(`link: http://localhost:${PORTA}`)
})
