// /api/salvar.js
export default async function handler(req, res) {
    // Permite apenas requisições POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { nomeArquivo, conteudoBase64 } = req.body;

    // O Token é lido de forma 100% segura das variáveis da Vercel
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "suportevitalsig-droid";
    const REPO = "Vitalsig";
    const PATH = "fichas_pdf"; // Pasta onde os PDFs vão ficar

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: "Token de segurança não configurado no servidor." });
    }

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}/${nomeArquivo}`;

    try {
        const githubResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Vitalsig-App'
            },
            body: JSON.stringify({
                message: `Upload de ficha em PDF: ${nomeArquivo}`,
                content: conteudoBase64,
                branch: "main"
            })
        });

        const data = await githubResponse.json();

        if (githubResponse.ok) {
            return res.status(200).json({ success: true, data });
        } else {
            return res.status(githubResponse.status).json({ error: data });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
