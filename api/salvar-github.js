export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { caminho, conteudoBase64, mensagemCommit } = req.body;
    
    // Dados do repositório baseado nas suas imagens
    const OWNER = 'suportevitalsig-droid';
    const REPO = 'Vitalsig';
    const TOKEN = process.env.GITHUB_TOKEN; // Configurado nas variáveis de ambiente da Vercel

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${caminho}`;

    try {
        // Verifica se o arquivo já existe para obter o 'sha' (necessário para atualização)
        let sha = null;
        const resChecagem = await fetch(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        if (resChecagem.ok) {
            const dadosExistentes = await resChecagem.json();
            sha = dadosExistentes.sha;
        }

        // Salva ou atualiza o arquivo no GitHub
            const resGitHub = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Vitalsig-App'
            },
            body: JSON.stringify({
                message: mensagemCommit,
                content: conteudoBase64,
                sha: sha || undefined
            })
        });

        if (!resGitHub.ok) {
            const erro = await resGitHub.json();
            return res.status(resGitHub.status).json({ error: erro });
        }

        return res.status(200).json({ message: 'Arquivo salvo com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
