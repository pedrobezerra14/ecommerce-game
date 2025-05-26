const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

const PRODUTOS_FILE = './data/produtos.json';

// Função auxiliar para ler os produtos do arquivo
function lerProdutos() {
    try {
        const data = fs.readFileSync(PRODUTOS_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        return parsedData.produtos || []; 
    } catch (error) {
        console.error('Erro ao ler produtos.json:', error);
        return []; 
    }
}

// Função auxiliar para escrever os produtos no arquivo
function escreverProdutos(produtos) {
    try {
        const dataToSave = JSON.stringify({ produtos: produtos }, null, 2);
        fs.writeFileSync(PRODUTOS_FILE, dataToSave, 'utf8');
    } catch (error) {
        console.error('Erro ao escrever produtos.json:', error);
        throw new Error('Falha ao salvar os produtos.'); 
    }
}

// Rota GET para todos os produtos
app.get('/produtos', (req, res) => {
    const produtos = lerProdutos();
    res.json(produtos);
});

// Rota GET para um produto por ID
app.get('/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produtos = lerProdutos();
    const produto = produtos.find(p => p.id === id);

    if (produto) {
        res.json(produto);
    } else {
        res.status(404).json({ mensagem: 'Produto não encontrado' });
    }
});

// Rota POST para adicionar novo produto
app.post('/produtos', (req, res) => {
    const novoProduto = req.body;
    let produtos = lerProdutos();

    const newId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
    novoProduto.id = newId;

    produtos.push(novoProduto);

    try {
        escreverProdutos(produtos);
        res.status(201).json({ mensagem: 'Produto salvo com sucesso!', produto: novoProduto });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.delete('/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let produtos = lerProdutos();
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    produtos.splice(index, 1);

    try {
        escreverProdutos(produtos);
        res.json({ mensagem: 'Produto excluído com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.put('/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dadosAtualizados = req.body;
    let produtos = lerProdutos();
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    produtos[index] = { id: id, ...dadosAtualizados };

    try {
        escreverProdutos(produtos);
        res.json({ mensagem: 'Produto atualizado com sucesso', produto: produtos[index] });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});