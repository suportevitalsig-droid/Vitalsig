export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { pdfBase64, nomeDoArquivo } = req.body;

  if (!pdfBase64 || !nomeDoArquivo) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const TOKEN = process.env.GITHUB_TOKEN;
  const REPO = 'suportevitalsig-droid/Vitalsig';
  const PATH = `fichas_pdf/${nomeDoArquivo}.pdf`;

  // Remove o cabeçalho base64 se presente
  const conteudoClean = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({
        message: `Backup ficha PDF: ${nomeDoArquivo}`,
        content: conteudoClean,
        branch: 'main'
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'PDF salvo no GitHub!' });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ error: 'Erro ao salvar no GitHub', details: errorData });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}
