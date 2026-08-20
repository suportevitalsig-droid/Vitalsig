const express = require('express');
const cors = require('cors');
const { Octokit } = require("@octokit/rest");

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Conecta à API do GitHub usando o Token das Variáveis de Ambiente
const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN 
});

// Endpoint de salvamento do PDF
app.post('/api/salvar-pdf', async (req, res) => {
    try {
        const { pdfBase64, nomeDoArquivo } = req.body;

        if (!pdfBase64 || !nomeDoArquivo) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        // Faz o upload direto para o repositório do GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: 'suportevitalsig-droid',
            repo: 'Vitalsig',
            path: `fichas_pdf/${nomeDoArquivo}`,
            message: `Backup automático de ficha: ${nomeDoArquivo}`,
            content: pdfBase64,
            branch: 'main'
        });

        console.log(`Ficha ${nomeDoArquivo} salva no GitHub em fichas_pdf/!`);
        return res.status(200).json({ success: true, message: 'Backup concluído!' });

    } catch (error) {
        console.error('Erro ao enviar para o GitHub:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de backup ativo na porta ${PORT}`));
