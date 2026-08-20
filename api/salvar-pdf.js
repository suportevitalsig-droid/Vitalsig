async function enviarPdfParaBackup(pdfBase64, nomeArquivo) {
  try {
    const resposta = await fetch('https://flat-streets-drop.loca.lt/api/salvar-pdf', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Remainder': 'true' // Evita o bloqueio de segurança do LocalTunnel
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
