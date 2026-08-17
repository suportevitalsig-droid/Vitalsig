export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { dados, nomeArquivo } = req.body;
    const token = process.env.GITHUB_TOKEN;

    const url = `https://api.github.com/repos/suportevitalsig-droid/Vitalsig/contents/fichas-atendimento/${nomeArquivo}`;
    const conteudoJson = JSON.stringify(dados, null, 2);
    const conteudoBase64 = Buffer.from(conteudoJson).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Vitalsig-App'
            },
            body: JSON.stringify({
                message: `Nova ficha registrada: ${nomeArquivo}`,
                content: conteudoBase64
            })
        });

        if (response.ok) return res.status(200).json({ success: true, message: 'Salvo com sucesso!' });
        
        const err = await response.json();
        return res.status(500).json({ error: err.message });
    } catch (error) {
        return res.status(500).json({ error: 'Erro de conexão com o GitHub' });
    }
}
