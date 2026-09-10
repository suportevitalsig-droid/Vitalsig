const { UTApi, UTFile } = require("uploadthing/server");

// O UTApi lê automaticamente o UPLOADTHING_TOKEN do arquivo .env ou da Vercel
const utapi = new UTApi();

module.exports = async (req, res) => {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { pdfBase64, nomeArquivo } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Nenhum PDF fornecido' });
    }

    // Remove o cabeçalho base64 se existir (ex: data:application/pdf;base64,)
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    // Prepara o arquivo para o UploadThing
    const file = new UTFile([pdfBuffer], nomeArquivo || "documento.pdf", {
      type: "application/pdf"
    });

    // Envia o arquivo para o UploadThing
    const response = await utapi.uploadFiles([file]);

    if (response[0].error) {
      console.error("Erro no UploadThing:", response[0].error);
      return res.status(500).json({ error: response[0].error.message });
    }

    // Retorna a URL pública gerada no UploadThing
    return res.status(200).json({
      sucesso: true,
      url: response[0].data.url,
      key: response[0].data.key
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: error.message });
  }
};
