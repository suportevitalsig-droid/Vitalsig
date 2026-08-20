const { Octokit } = require("@octokit/rest");

module.exports = async (req, res) => {
    // Configura os cabeçalhos de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Trata a requisição OPTIONS (preflight do navegador)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { pdfBase64, nomeDoArquivo } = req.body;

        if (!pdfBase64 || !nomeDoArquivo) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        const octokit = new Octokit({ 
            auth: process.env.GITHUB_TOKEN 
        });

        // Envia o arquivo diretamente para a pasta fichas_pdf/ no repositório
        await octokit.repos.createOrUpdateFileContents({
            owner: 'suportevitalsig-droid',
            repo: 'Vitalsig',
            path: `fichas_pdf/${nomeDoArquivo}`,
            message: `Backup automático: ${nomeDoArquivo}`,
            content: pdfBase64,
            branch: 'main'
        });

        return res.status(200).json({ success: true, message: 'Backup realizado com sucesso!' });

    } catch (error) {
        console.error('Erro no backup:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
