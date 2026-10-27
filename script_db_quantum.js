// Roda no Node (npm start), não no navegador: fora do navegador não existe CORS
// e a senha do banco fica no .env, fora do código.
require('dotenv').config({ quiet: true })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    throw new Error(
        'DATABASE_URL não definida. Verifique se existe um arquivo .env na raiz do projeto ' +
        '(mesma pasta do package.json) com a linha DATABASE_URL=postgresql://... ' +
        'e se o nome do arquivo é exatamente ".env" — no Windows ele costuma virar ".env.txt".'
    )
}

const host = new URL(DATABASE_URL).host
const neonHttpEndpoint = `[${host}](https://${host}/sql)`

async function executarQueryNeon(querySQL, parametros = []) {
    try {
        const resposta = await fetch(neonHttpEndpoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL,
                params: parametros
            })
        })

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`)
        }

        const dados = await resposta.json();
        return dados.rows;
    } catch (error) {
        console.error("Falha ao comunicar com o banco de dados: ", error)
        return null
    }
}

async function buscarCategorias() {
    return await executarQueryNeon('SELECT * FROM categoria ORDER BY descricao')
}

async function insertCategoria(descricao) {
    const linhas = await executarQueryNeon(
        'INSERT INTO categoria (descricao) VALUES ($1) RETURNING *',
        [descricao]
    )
    return linhas && linhas[0] ? linhas[0] : null
}

const categoriaMock = [
    { categoria: 'Eletronicos' },
    { categoria: 'Biblioteca' },
    { categoria: 'Moveis' },
    { categoria: 'Roupas' }
]

async function insertData(table, coluna, data) {
    const query = `INSERT INTO ${table} (${coluna}) VALUES ($1) RETURNING *`
    const params = [data]
    console.log(query, params)
    const linhas = await executarQueryNeon(query, params);
    return linhas !== null;
}

async function testeInsert() {
    for (const element of categoriaMock) {
        await insertData("categoria", "descricao", element.categoria)
    }
}

// Só insere os dados de teste quando rodado direto (npm run seed).
// Quando o server.js importa este arquivo, só as funções são usadas.
if (require.main === module) {
    testeInsert();
}

module.exports = { executarQueryNeon, insertData, buscarCategorias, insertCategoria }
