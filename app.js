const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const lista = document.getElementById('lista-categorias')

async function carregarCategorias() {
    try {
        const resposta = await fetch('/api/categorias')
        const categorias = await resposta.json()

        if (!Array.isArray(categorias)) {
            lista.innerHTML = '<li>Nenhuma categoria encontrada</li>'
            return
        }

        lista.innerHTML = categorias
            .map(categoria => `<li>${categoria.descricao}</li>`)
            .join('')
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro)
        lista.innerHTML = '<li>Erro ao carregar</li>'
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()

    const descricao = campoDescricao.value.trim()
    if (!descricao) return

    try {
        const resposta = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            console.error('Falha ao cadastrar:', erro)
            return
        }

        campoDescricao.value = ''
        await carregarCategorias()
    } catch (erro) {
        console.error('Erro ao cadastrar:', erro)
    }
})

carregarCategorias()
