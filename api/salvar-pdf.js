async function enviarPdfParaBackup(pdfBase64, nomeArquivo) {
  try {
    const resposta = await fetch('https://vitalsig-backup.loca.lt/api/salvar-pdf', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true'
      },
      body: JSON.stringify({
        pdfBase64: pdfBase64,
        nomeDoArquivo: nomeArquivo
      })
    });

    const resultado = await resposta.json();
    if (resposta.ok) {
      console.log('Backup do PDF realizado com sucesso!');
    } else {
      console.error('Falha no backup:', resultado);
    }
  } catch (erro) {
    console.error('Erro de rede ao enviar PDF:', erro);
  }
}
