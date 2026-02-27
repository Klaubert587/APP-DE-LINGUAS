let bancoDeDados = {}; 
let gramaticaSalva = {};
let respostaCoreanaCorreta = ""; 
let respostaPortuguesCorreta = ""; 
let modoEstudo = "pergunta";
let indexEditando = null; 
let pastaEditando = null;
let seqAtual = 0;
let modoDitadoAtivo = false; 

window.onload = function() { 
    carregarTudo(); 
    configurarEventosIniciais();
};

function configurarEventosIniciais() {
    // Lógica do Checkbox para habilitar campo de português
    const chk = document.getElementById('chk-usar-portugues');
    const inputPort = document.getElementById('escrita-portugues');
    chk.addEventListener('change', () => {
        inputPort.disabled = !chk.checked;
        inputPort.style.backgroundColor = chk.checked ? "white" : "#f0f0f0";
        if(!chk.checked) inputPort.value = "";
    });

    // Revelar Romanização ao clicar no texto "ROMANIZAÇÃO"
    document.getElementById('label-romanizacao').addEventListener('click', revelarDica);
}

function carregarTudo() {
    const exerciciosSalvos = localStorage.getItem('meuAppCoreano');
    const gramaticaSalvaDB = localStorage.getItem('minhaGramaticaPastas');
    
    // Agora ele só restaura o padrão se o banco estiver COMPLETAMENTE vazio
    if (!exerciciosSalvos) {
        bancoDeDados = {
            "01-TRABALHO ESSENCIAL": [
                { coreano: "안녕하세요", traducao: "Bom dia / Olá", romanizacao: "Annyeong-haseyo", ordem: 0 }
            ]
        };
        atualizarArmazenamento();
    } else {
        bancoDeDados = JSON.parse(exerciciosSalvos);
    }

    if (gramaticaSalvaDB) gramaticaSalva = JSON.parse(gramaticaSalvaDB);
    atualizarMenuPastas();
}

// NOVA FUNÇÃO: Transforma texto em palavras clicáveis para ouvir individualmente
function formatarTextoClicavel(texto, lingua) {
    const container = document.getElementById('texto-pergunta');
    container.innerHTML = "";
    
    // Divide por espaços para pegar palavras individuais
    const palavras = texto.split(" ");
    
    palavras.forEach(palavra => {
        const span = document.createElement('span');
        span.innerText = palavra + " ";
        span.className = "palavra-clicavel";
        span.onclick = (e) => {
            e.stopPropagation(); // Impede disparar o clique da caixa
            falarPalavra(palavra, lingua);
        };
        container.appendChild(span);
    });
}

function falarPalavra(palavra, lingua) {
    const msg = new SpeechSynthesisUtterance(palavra);
    msg.lang = (lingua === 'COREANO') ? 'ko-KR' : 'pt-BR';
    window.speechSynthesis.speak(msg);
}

function verificarResposta() {
    const uk = document.getElementById('escrita-coreano').value.trim();
    const up = document.getElementById('escrita-portugues').value.trim().toLowerCase();
    const usarPortugues = document.getElementById('chk-usar-portugues').checked;
    
    // Função interna para limpar espaços e pontuação para uma comparação justa
    const limpar = (texto) => texto.replace(/[\s\.\?\!\,\~]/g, '');

    // Comparação inteligente (ignora espaços e pontuação)
    const coreanoOk = limpar(uk) === limpar(respostaCoreanaCorreta);
    
    let portuguesOk = true; 
    if (usarPortugues) {
        portuguesOk = limpar(up) === limpar(respostaPortuguesCorreta.toLowerCase());
    }

    if (coreanoOk && portuguesOk) {
        alert("🎯 PERFEITO!\nVocê acertou!");
        document.getElementById('escrita-coreano').style.backgroundColor = "#d1f7ec";
        if(usarPortugues) document.getElementById('escrita-portugues').style.backgroundColor = "#d1f7ec";
    } else {
        let msg = "❌ AINDA NÃO!\n\nO CORRETO ERA:\n";
        msg += `🇰🇷: ${respostaCoreanaCorreta}`;
        
        if (usarPortugues) {
            msg += `\n🇧🇷: ${respostaPortuguesCorreta}`;
        }
        
        alert(msg);
        
        document.getElementById('escrita-coreano').style.backgroundColor = coreanoOk ? "#d1f7ec" : "#ffdce0";
        if(usarPortugues) {
            document.getElementById('escrita-portugues').style.backgroundColor = portuguesOk ? "#d1f7ec" : "#ffdce0";
        }
    }
}
// LOGICA DO PLAY ATUALIZADA (AVISO NO ÚLTIMO ITEM)
document.getElementById('play-btn').addEventListener('click', () => {
    const p = document.getElementById('pasta-treino').value;
    const lista = bancoDeDados[p];
    const displayPergunta = document.getElementById('texto-pergunta');
    
    if (lista && lista.length > 0) {
        let ex;
        
        // Se a sequência passou do fim, reseta para o começo
        if (seqAtual >= lista.length) {
            seqAtual = 0;
        }

        if (p.includes("DIALOGO") || p.includes("DIÁLOGO")) {
            ex = lista[seqAtual];
        } else {
            ex = lista[Math.floor(Math.random() * lista.length)];
        }
        
        // Incrementa ANTES de checar se é o último
        seqAtual++;

        const textoDisplay = (modoEstudo === 'pergunta') ? ex.coreano : ex.traducao;
        const linguaAtiva = (modoEstudo === 'pergunta') ? "COREANO" : "TRADUÇÃO";
        
        formatarTextoClicavel(textoDisplay, linguaAtiva);
        
        // CHECAGEM: Se o contador chegou no tamanho da lista, este é o último item!
        if (seqAtual === lista.length) {
            const aviso = document.createElement('div');
            aviso.innerHTML = "<span style='color: #ff4d4d; font-size: 0.6em; font-weight: bold; display: block; margin-bottom: 5px;'>&lt;FINALIZADO&gt;</span>";
            displayPergunta.prepend(aviso); 
        }
        
        document.getElementById('indicador-lingua').innerText = linguaAtiva;
        document.getElementById('texto-dica').innerText = ex.romanizacao;
        document.getElementById('texto-dica').style.display = 'none';
        
        respostaCoreanaCorreta = ex.coreano;
        respostaPortuguesCorreta = ex.traducao;
        
        document.getElementById('escrita-coreano').value = "";
        document.getElementById('escrita-portugues').value = "";
        document.getElementById('escrita-coreano').style.backgroundColor = "white";
        if(document.getElementById('chk-usar-portugues').checked) {
             document.getElementById('escrita-portugues').style.backgroundColor = "white";
        }
    }
});

// Funções Auxiliares mantidas ou levemente ajustadas
function revelarDica() { 
    const d = document.getElementById('texto-dica'); 
    d.style.display = (d.style.display === 'none') ? 'block' : 'none'; 
}

function ouvirPergunta() { 
    const textoTodo = Array.from(document.querySelectorAll('.palavra-clicavel')).map(s => s.innerText).join(" ");
    const lingua = document.getElementById('indicador-lingua').innerText;
    const msg = new SpeechSynthesisUtterance(textoTodo);
    msg.lang = (lingua === 'COREANO') ? 'ko-KR' : 'pt-BR';
    window.speechSynthesis.speak(msg);
}

function atualizarArmazenamento() {
    localStorage.setItem('meuAppCoreano', JSON.stringify(bancoDeDados));
    localStorage.setItem('minhaGramaticaPastas', JSON.stringify(gramaticaSalva));
}

function salvarExercicioDinâmico() {
    const pasta = document.getElementById('cad-pasta-nome').value.trim().toUpperCase();
    const ordem = parseInt(document.getElementById('cad-ordem').value) || 0;
    const coreano = document.getElementById('cad-coreano').value.trim();
    const traducao = document.getElementById('cad-traducao').value.trim();
    const romanizacao = document.getElementById('cad-romanizacao').value.trim();
    if (pasta && coreano && traducao) {
        if (indexEditando !== null) { 
            bancoDeDados[pastaEditando].splice(indexEditando, 1); 
            if (bancoDeDados[pastaEditando].length === 0) delete bancoDeDados[pastaEditando]; 
        }
        if (!bancoDeDados[pasta]) bancoDeDados[pasta] = [];
        bancoDeDados[pasta].push({ coreano, traducao, romanizacao, ordem });
        bancoDeDados[pasta].sort((a, b) => a.ordem - b.ordem);
        atualizarArmazenamento(); resetarFormulario(); renderizarListaExercicios(); atualizarMenuPastas();
        alert("Salvo!");
    }
}

function renderizarListaExercicios() {
    const listaDiv = document.getElementById('visualizacao-arquivos');
    listaDiv.innerHTML = "";
    Object.keys(bancoDeDados).forEach(nomePasta => {
        const pastaContainer = document.createElement('div');
        pastaContainer.style = "margin-bottom: 15px; border-bottom: 2px solid #00664d; padding-bottom: 10px;";
        pastaContainer.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; background:#00664d; color:white; padding:5px 10px; border-radius:5px;"><strong>📂 ${nomePasta}</strong><button onclick="excluirPastaCompleta('${nomePasta}')" class="btn-excluir">APAGAR</button></div>`;
        
        bancoDeDados[nomePasta].forEach((ex, index) => {
            const item = document.createElement('div');
            item.className = "item-lista";
            
            // Verifica se o exercício já foi marcado como concluído
            const concluido = ex.concluido ? 'checked' : '';
            const estiloTexto = ex.concluido ? 'text-decoration: line-through; color: #888;' : '';

            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" ${concluido} onclick="alternarConclusao('${nomePasta}', ${index})">
                    <span style="${estiloTexto}">#${ex.ordem || index+1} - ${ex.coreano}</span>
                </div>
                <div>
                    <button onclick="prepararEdicao('${nomePasta}', ${index})" class="btn-editar">EDITAR</button>
                    <button onclick="excluirExercicio('${nomePasta}', ${index})" class="btn-excluir">X</button>
                </div>`;
            pastaContainer.appendChild(item);
        });
        listaDiv.appendChild(pastaContainer);
    });
}

function alternarConclusao(pasta, index) {
    // Inverte o estado de concluído (se true vira false, se false vira true)
    bancoDeDados[pasta][index].concluido = !bancoDeDados[pasta][index].concluido;
    
    // Salva a alteração no armazenamento do navegador
    atualizarArmazenamento();
    
    // Recarrega a lista para aplicar o efeito visual de riscado
    renderizarListaExercicios();
}

function exportarDados() {
    const blob = new Blob([JSON.stringify({ exercicios: bancoDeDados, gramatica: gramaticaSalva })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `backup_coreano.json`; a.click();
}

function importarDados(input) {
    const arquivo = input.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data && data.exercicios) {
                // Soma os novos dados aos atuais
                bancoDeDados = Object.assign({}, bancoDeDados, data.exercicios);
                
                if (data.gramatica) {
                    gramaticaSalva = data.gramatica;
                }

                atualizarArmazenamento();
                
                // ATENÇÃO: Aqui usamos o nome correto da sua função de desenho
                renderizarListaExercicios(); 
                
                // Atualiza também o menu de seleção (o dropdown)
                atualizarMenuPastas();
                
                alert("Novos exercícios adicionados com sucesso!");
            } else {
                alert("Este arquivo não parece ter exercícios válidos.");
            }
        } catch (err) {
            alert("Erro ao ler o arquivo. Certifique-se de que é um .json válido.");
        }
    };
    leitor.readAsText(arquivo);
}

function atualizarMenuPastas() { const s = document.getElementById('pasta-treino'); s.innerHTML = ""; Object.keys(bancoDeDados).forEach(p => { let o = document.createElement('option'); o.value = p; o.innerText = "ESTUDAR: " + p; s.appendChild(o); }); }
function prepararEdicao(p, i) { const ex = bancoDeDados[p][i]; document.getElementById('cad-pasta-nome').value = p; document.getElementById('cad-ordem').value = ex.ordem; document.getElementById('cad-coreano').value = ex.coreano; document.getElementById('cad-traducao').value = ex.traducao; document.getElementById('cad-romanizacao').value = ex.romanizacao; indexEditando = i; pastaEditando = p; }
function resetarFormulario() { indexEditando = null; pastaEditando = null; document.getElementById('cad-pasta-nome').value = ""; document.getElementById('cad-ordem').value = ""; document.getElementById('cad-coreano').value = ""; document.getElementById('cad-traducao').value = ""; document.getElementById('cad-romanizacao').value = ""; }
function abrirArquivos() { document.getElementById('tela-cadastro').style.display = 'block'; renderizarListaExercicios(); }
function fecharCadastro() { document.getElementById('tela-cadastro').style.display = 'none'; }
function trocarModo(m) { modoEstudo = m; document.getElementById('btn-modo-pergunta').classList.toggle('modo-ativo', m === 'pergunta'); document.getElementById('btn-modo-resposta').classList.toggle('modo-ativo', m === 'resposta'); }


function reconhecerVoz() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return alert("Navegador não suporta voz");
    
    const r = new Rec();
    r.lang = 'ko-KR';
    r.interimResults = false;

    document.getElementById('btn-falar').innerText = "OUVINDO...";
    document.getElementById('btn-falar').style.background = "#ff4d4d";

    r.start();

    r.onresult = (e) => {
        const falaUsuario = e.results[0][0].transcript;
        const fraseCorreta = respostaCoreanaCorreta;
        const score = calcularSimilaridade(falaUsuario, fraseCorreta);
        const porcentagem = Math.round(score * 100);

        let feedback = "";
        if (porcentagem >= 85) feedback = `🌟 EXCELENTE! (${porcentagem}%)`;
        else if (porcentagem >= 75) feedback = `✨ ÓTIMO! (${porcentagem}%)`;
        else if (porcentagem >= 60) feedback = `👍 BOM! (${porcentagem}%)`;
        else feedback = `❌ TENTE NOVAMENTE (${porcentagem}%)`;

        alert(`${feedback}\n\nVocê disse: "${falaUsuario}"\nO correto é: "${fraseCorreta}"`);
        document.getElementById('escrita-coreano').value = falaUsuario;
    };

    r.onend = () => {
        document.getElementById('btn-falar').innerText = "FALAR";
        document.getElementById('btn-falar').style.background = "#007bff";
    };
}

// A PARTIR DAQUI CONTINUA O SEU CÓDIGO ORIGINAL (resetarSequencia, etc...)
function resetarSequencia() { seqAtual = 0; }
function excluirExercicio(p, i) { bancoDeDados[p].splice(i, 1); atualizarArmazenamento(); renderizarListaExercicios(); }
function excluirPastaCompleta(p) { delete bancoDeDados[p]; atualizarArmazenamento(); renderizarListaExercicios(); atualizarMenuPastas(); }
function abrirGramatica() { document.getElementById('tela-gramatica').style.display = 'block'; renderizarListaGramatica(); }
function fecharGramatica() { document.getElementById('tela-gramatica').style.display = 'none'; }

function salvarNovaGramatica() {
    const t = document.getElementById('gram-titulo').value.trim();
    const txt = document.getElementById('gram-texto').value.trim();
    if(t && txt) { gramaticaSalva[t] = txt; atualizarArmazenamento(); renderizarListaGramatica(); document.getElementById('gram-titulo').value=""; document.getElementById('gram-texto').value=""; }
}

function renderizarListaGramatica() {
    const d = document.getElementById('lista-gramatica'); d.innerHTML = "";
    Object.keys(gramaticaSalva).forEach(t => {
        const item = document.createElement('div');
        item.style = "background:#f9f9f9; padding:10px; margin-bottom:10px; border-radius:5px; border-left:5px solid #00664d;";
        item.innerHTML = `<strong>${t}</strong><p style="font-size:12px; margin:5px 0;">${gramaticaSalva[t]}</p><button onclick="excluirGramatica('${t}')" style="background:red; color:white; border:none; padding:2px 5px; border-radius:3px; cursor:pointer; font-size:10px;">EXCLUIR</button>`;
        d.appendChild(item);
    });
}
function excluirGramatica(t) { delete gramaticaSalva[t]; atualizarArmazenamento(); renderizarListaGramatica(); }

function calcularSimilaridade(s1, s2) {
    let longa = s1.length < s2.length ? s2 : s1;
    let curta = s1.length < s2.length ? s1 : s2;
    let tamLonga = longa.length;
    if (tamLonga === 0) return 1.0;

    const editDistance = (s1, s2) => {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };

    return (tamLonga - editDistance(longa, curta)) / tamLonga;
} //

// --- LÓGICA DE TREINO DEFINITIVA (COM DICA E VOZ 0.3) ---
let treinoItemCorreto = null;

function abrirModoTreino() {
    const pasta = document.getElementById('pasta-treino').value;
    if (!bancoDeDados[pasta] || bancoDeDados[pasta].length < 1) {
        return alert("Selecione uma pasta com exercícios primeiro!");
    }
    document.getElementById('tela-treino-escolha').style.display = 'block';
    gerarNovoExercicioTreino();
}

function fecharModoTreino() {
    document.getElementById('tela-treino-escolha').style.display = 'none';
    window.speechSynthesis.cancel(); 
}

function gerarNovoExercicioTreino() {
    const pasta = document.getElementById('pasta-treino').value;
    const lista = bancoDeDados[pasta];
    
    if (!lista || lista.length === 0) return;

    treinoItemCorreto = lista[seqAtual + 1];
    const perguntaAtual = lista[seqAtual];

    if (!perguntaAtual || !treinoItemCorreto) {
    seqAtual = 0;
    return gerarNovoExercicioTreino();
}
    
    let opcoes = [treinoItemCorreto];
    let todasAsFrases = Object.values(bancoDeDados).flat();
    while(opcoes.length < 4 && todasAsFrases.length >= 4) {
        let sorteio = todasAsFrases[Math.floor(Math.random() * todasAsFrases.length)];
        if (!opcoes.find(o => o.coreano === sorteio.coreano)) {
            opcoes.push(sorteio);
        }
    }
    opcoes.sort(() => Math.random() - 0.5);

    // Atualiza Textos
    document.getElementById('pergunta-treino-pt').innerText = perguntaAtual.traducao;
    
    // Mostra a "cola" em coreano clarinho
    const dica = document.getElementById('dica-coreano-treino');
    if (dica) {
        dica.innerText = perguntaAtual.coreano;
    }

    const input = document.getElementById('input-treino-coreano');
    input.value = ""; 
    input.style.backgroundColor = "white";
    input.placeholder = "Escolha o quadrado e ESCREVA...";
    
    const displayTraducao = document.getElementById('traducao-resultado-treino');
    if(displayTraducao) displayTraducao.innerText = "";

    const grid = document.getElementById('grid-opcoes-coreano');
    grid.innerHTML = "";
    opcoes.forEach(opt => {
        const btn = document.createElement('div');
        btn.style = "background: white; color: #014736; padding: 15px 5px; border-radius: 8px; text-align: center; font-weight: bold; cursor: pointer; font-size: 1.0em; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #ddd;";
        btn.innerText = opt.coreano;
        btn.onclick = (event) => {
            window.speechSynthesis.cancel();
            falarPalavra(opt.coreano, 'COREANO'); 
            validarEscolhaTreino(opt.coreano, event);
        };
        grid.appendChild(btn);
    });
}

function validarEscolhaTreino(escolha, event) {
    const input = document.getElementById('input-treino-coreano');
    const limpar = (t) => t.replace(/[\s\.\?\!\,\~]/g, '');

    if (limpar(escolha) === limpar(treinoItemCorreto.coreano)) {
        input.style.backgroundColor = "#d1f7ec";
        input.focus();
    } else {

        // Remove erro antigo se já existir
        const antigo = event.currentTarget.querySelector('.erro-x');
        if (antigo) antigo.remove();

        // Cria o X vermelho
        const erro = document.createElement("div");
        erro.innerText = "✖";
        erro.className = "erro-x";
        erro.style = "color:red; font-size:14px; margin-top:5px;";

        event.currentTarget.appendChild(erro);
    }
}

function verificarEscritaTreino() {
    const input = document.getElementById('input-treino-coreano');
    const displayTraducao = document.getElementById('traducao-resultado-treino');
    const limpar = (t) => t.replace(/[\s\.\?\!\,\~]/g, '');
    if (limpar(input.value) === limpar(treinoItemCorreto.coreano)) {
        input.style.backgroundColor = "#d1f7ec";
        if(displayTraducao) displayTraducao.innerText = "Tradução: " + treinoItemCorreto.traducao;
    } else {
        if(displayTraducao) displayTraducao.innerText = "";
    }
}

function ouvirLento() {
    if (!treinoItemCorreto) return;
    window.speechSynthesis.cancel(); 
    const msg = new SpeechSynthesisUtterance(treinoItemCorreto.coreano);
    msg.lang = 'ko-KR';
    msg.rate = 0.7; // Velocidade bem lenta
    window.speechSynthesis.speak(msg);
}

function reconhecerVozTreino() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return alert("Navegador não suporta voz");
    const r = new Rec();
    r.lang = 'ko-KR';
    const btn = document.getElementById('btn-falar-treino');
    btn.innerText = "OUVINDO...";
    r.start();
    r.onresult = (e) => {
        const fala = e.results[0][0].transcript;
        document.getElementById('input-treino-coreano').value = fala;
        verificarEscritaTreino();
    };
    r.onend = () => { btn.innerText = "FALAR"; };
}

function proximoExercicioDialogo() {
    seqAtual++;
    gerarNovoExercicioTreino();
}

// VARIÁVEIS DE CONTROLE DA NOVA PÁGINA
let dialogoAtualSimulado = null;

function irParaProximaPaginaTreino() {
    const pasta = document.getElementById('pasta-treino').value;
    if (!bancoDeDados[pasta] || bancoDeDados[pasta].length < 2) {
        return alert("Esta pasta precisa de pelo menos 2 frases para um diálogo!");
    }
    document.getElementById('tela-dialogo-simulado').style.display = 'block';
    seqAtual = 0; // Começa do início do diálogo
    carregarPerguntaSimulada();
}

function voltarParaTreino() {
    document.getElementById('tela-dialogo-simulado').style.display = 'none';
    window.speechSynthesis.cancel();
}

function carregarPerguntaSimulada() {
    const pasta = document.getElementById('pasta-treino').value;
    const lista = bancoDeDados[pasta];
    
    // O APP sempre pega o índice atual (Ex: #1, #3, #5...)
    dialogoAtualSimulado = lista[seqAtual];
    
    if (dialogoAtualSimulado) {
        document.getElementById('pergunta-app-simulado').innerText = dialogoAtualSimulado.coreano;
        document.getElementById('area-dica-simulada').innerText = ""; // Limpa dicas anteriores
    } else {
        alert("Fim do diálogo!");
        seqAtual = 0;
        carregarPerguntaSimulada();
    }
}

function revelarDicaSimulada(tipo) {
    const pasta = document.getElementById('pasta-treino').value;
    const lista = bancoDeDados[pasta];
    const areaDica = document.getElementById('area-dica-simulada');
    
    if (tipo === 'traducao') {
        // Apenas mostra o texto da tradução da pergunta atual
        areaDica.innerText = dialogoAtualSimulado.traducao;
    } 
    else if (tipo === 'resposta') {
        // Localiza o próximo item (a resposta que o usuário deve dar)
        const respostaEsperada = lista[seqAtual + 1];
        
        if (respostaEsperada) {
            // 1. Mostra o texto na tela
            areaDica.innerText = "Dica: " + respostaEsperada.coreano;
            
            // 2. Executa o áudio em velocidade moderada (0.8)
            window.speechSynthesis.cancel(); // Para qualquer áudio em execução
            const msg = new SpeechSynthesisUtterance(respostaEsperada.coreano);
            msg.lang = 'ko-KR';
            msg.rate = 0.8; // Velocidade moderada para facilitar a memorização
            window.speechSynthesis.speak(msg);
        } else {
            areaDica.innerText = "Fim do diálogo.";
        }
    }
}

function ouvirPerguntaSimulada(modo) {
    if (!dialogoAtualSimulado) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(dialogoAtualSimulado.coreano);
    msg.lang = 'ko-KR';
    msg.rate = (modo === 'lento') ? 0.6 : 1.0;
    window.speechSynthesis.speak(msg);
}

function proximoPassoSimulado() {
    // Pula de 2 em 2 (O app pula a sua resposta e vai para a próxima pergunta dele)
    seqAtual += 2;
    carregarPerguntaSimulada();
}

function reconhecerVozSimulada() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return alert("Navegador não suporta voz");
    
    const pasta = document.getElementById('pasta-treino').value;
    const respostaEsperada = bancoDeDados[pasta][seqAtual + 1];

    if (!respostaEsperada) return alert("Não há resposta para comparar.");

    const r = new Rec();
    r.lang = 'ko-KR';
    const btn = document.getElementById('btn-falar-simulado');
    btn.style.background = "#ffdce0";

    r.start();
    r.onresult = (e) => {
        const falaUsuario = e.results[0][0].transcript;
        const score = calcularSimilaridade(falaUsuario, respostaEsperada.coreano);
        const porcentagem = Math.round(score * 100);

        if (porcentagem >= 70) {
            alert(`✅ Muito bem! (${porcentagem}%)\nVocê disse: ${falaUsuario}`);
        } else {
            alert(`❌ Tente de novo (${porcentagem}%)\nVocê disse: ${falaUsuario}\nEsperado: ${respostaEsperada.coreano}`);
        }
    };
    r.onend = () => { btn.style.background = "white"; };
}

let selecionadoPergunta = null;
let selecionadoResposta = null;

function abrirAssociacao() {
    document.getElementById('tela-associacao').style.display = 'block';
    // Sincroniza o select da nova tela com as pastas existentes
    const s = document.getElementById('pasta-associacao');
    s.innerHTML = document.getElementById('pasta-treino').innerHTML;
    s.value = document.getElementById('pasta-treino').value;
    iniciarAssociacao();
}

function fecharAssociacao() {
    document.getElementById('tela-associacao').style.display = 'none';
}

function iniciarAssociacao() {
    const pasta = document.getElementById('pasta-associacao').value;
    const lista = [...bancoDeDados[pasta]];
    if (lista.length < 2) return alert("Adicione mais itens para jogar!");

    const colP = document.getElementById('coluna-perguntas');
    const colR = document.getElementById('coluna-respostas');
    colP.innerHTML = ""; colR.innerHTML = "";
    selecionadoPergunta = null; selecionadoResposta = null;

    // Embaralha para as colunas ficarem diferentes
    const perguntas = lista.filter((_, i) => i % 2 === 0).sort(() => Math.random() - 0.5);
    const respostas = lista.filter((_, i) => i % 2 !== 0).sort(() => Math.random() - 0.5);

    perguntas.forEach(item => criarCardAssociacao(item, colP, 'pergunta'));
    respostas.forEach(item => criarCardAssociacao(item, colR, 'resposta'));
}

function criarCardAssociacao(item, container, tipo) {
    const div = document.createElement('div');
    div.innerText = item.coreano;
    div.className = "card-jogo";
    div.style = "background: white; padding: 15px 10px; border-radius: 8px; text-align: center; font-weight: bold; cursor: pointer; font-size: 0.9em; border: 2px solid transparent; min-height: 50px; display: flex; align-items: center; justify-content: center;";
    
    div.onclick = () => {
        falarPalavra(item.coreano, 'COREANO'); // Reutiliza sua função de voz
        
        if (tipo === 'pergunta') {
            if (selecionadoPergunta) selecionadoPergunta.style.borderColor = "transparent";
            selecionadoPergunta = { div, item };
            div.style.borderColor = "#00664d";
        } else {
            if (selecionadoResposta) selecionadoResposta.style.borderColor = "transparent";
            selecionadoResposta = { div, item };
            div.style.borderColor = "#00664d";
        }
        verificarPar();
    };
    container.appendChild(div);
}

function verificarPar() {
    if (!selecionadoPergunta || !selecionadoResposta) return;

    // A lógica assume que a resposta correta é o item imediatamente após a pergunta no banco
    const pasta = document.getElementById('pasta-associacao').value;
    const lista = bancoDeDados[pasta];
    const idxPergunta = lista.findIndex(x => x.coreano === selecionadoPergunta.item.coreano);
    
    if (lista[idxPergunta + 1] && lista[idxPergunta + 1].coreano === selecionadoResposta.item.coreano) {
        // ACERTO: Desaparecem
        setTimeout(() => {
            selecionadoPergunta.div.style.visibility = "hidden";
            selecionadoResposta.div.style.visibility = "hidden";
            selecionadoPergunta = null; selecionadoResposta = null;
            if (checarFimJogo()) alert("Parabéns! Você completou o diálogo!");
        }, 300);
    } else {
        // ERRO: Pisca vermelho
        const pDiv = selecionadoPergunta.div;
        const rDiv = selecionadoResposta.div;
        
        // Animação de piscar
        let piscadas = 0;
        const intervalo = setInterval(() => {
            pDiv.style.opacity = rDiv.style.opacity = (piscadas % 3 === 0) ? "1.0" : "1";
            piscadas++;
            if (piscadas > 4) {
                clearInterval(intervalo);
                pDiv.style.backgroundColor = rDiv.style.backgroundColor = "white";
                pDiv.style.borderColor = rDiv.style.borderColor = "transparent";
                selecionadoPergunta = null; selecionadoResposta = null;
            }
        }, 150);
    }
}

function checarFimJogo() {
    return Array.from(document.querySelectorAll('.card-jogo')).every(c => c.style.visibility === "hidden");
}

let exercicioMontagemAtual = null;
let palavrasEmbaralhadas = [];
let respostaUsuario = [];

function abrirMontarFrase() {
    document.getElementById("tela-associacao").style.display = "none";
    document.getElementById("tela-montar-frase").style.display = "block";

    const select = document.getElementById("pasta-montar-frase");
    select.innerHTML = document.getElementById("pasta-associacao").innerHTML;

    iniciarMontarFrase();
}

function proximaMontagem() {
    iniciarMontarFrase();
}

// BOTÃO VOLTAR DA PÁGINA 5
function voltarParaAssociacao() {
    document.getElementById("tela-montar-frase").style.display = "none";
    document.getElementById("tela-associacao").style.display = "block";
}

function iniciarMontarFrase() {
    const pasta = document.getElementById("pasta-montar-frase").value;
    if (!bancoDeDados[pasta]) return;

    const lista = bancoDeDados[pasta];
    exercicioMontagemAtual = lista[Math.floor(Math.random() * lista.length)];

    document.getElementById("pergunta-montar-pt").innerText = exercicioMontagemAtual.traducao;

    palavrasEmbaralhadas = exercicioMontagemAtual.coreano.split(" ");
    palavrasEmbaralhadas.sort(() => Math.random() - 0.5);

    respostaUsuario = [];

    renderizarPalavras();
}

function renderizarPalavras() {
    const area = document.getElementById("area-palavras");
    const resposta = document.getElementById("area-resposta");

    area.innerHTML = "";
    resposta.innerHTML = respostaUsuario.join(" ");

    palavrasEmbaralhadas.forEach((palavra, index) => {
        const btn = document.createElement("button");
        btn.innerText = palavra;
        btn.onclick = () => selecionarPalavra(index);
        area.appendChild(btn);
    });
}

function selecionarPalavra(index) {
    respostaUsuario.push(palavrasEmbaralhadas[index]);
    palavrasEmbaralhadas.splice(index, 1);
    renderizarPalavras();
}

function voltarUltimaPalavra() {
    if (respostaUsuario.length === 0) return;

    const palavra = respostaUsuario.pop();
    palavrasEmbaralhadas.push(palavra);

    renderizarPalavras();
}

function verificarMontagem() {
    const respostaCorreta = exercicioMontagemAtual.coreano.trim();
    const resposta = respostaUsuario.join(" ").trim();

    if (resposta === respostaCorreta) {
        alert("Correto!");
    } else {
        alert("Ainda não está correto. Clique em REFazer exercício.");

        const botao = document.getElementById("btn-refazer-montagem");
        if (botao) botao.style.display = "block";
    }
}

function refazerExercicioMontagem() {
    respostaUsuario = [];
    
    palavrasEmbaralhadas = exercicioMontagemAtual.coreano.split(" ");
    palavrasEmbaralhadas.sort(() => Math.random() - 0.5);

    renderizarPalavras();

    const botao = document.getElementById("btn-refazer-montagem");
    if (botao) botao.style.display = "none";
}

function proximaMontagem() {
    iniciarMontarFrase();
}

function alternarModoDitado() {
    // Pegamos o container onde o texto fica (o balão de cima)
    const displayTexto = document.getElementById('texto-pergunta');
    const labelDitado = document.getElementById('label-ditado');
    
    modoDitadoAtivo = !modoDitadoAtivo;

    if (modoDitadoAtivo) {
        // OPACITY 0 deixa o texto invisível para o olho humano,
        // mas o seu código de áudio ainda consegue "ler" o conteúdo que está lá.
        displayTexto.style.opacity = "0";
        labelDitado.style.color = "#ff4d4d"; 
        labelDitado.innerHTML = "<strong>DITADO: ON</strong>";
    } else {
        // Volta a opacidade para 1 (visível)
        displayTexto.style.opacity = "1";
        labelDitado.style.color = "#b1c7c2";
        labelDitado.innerText = "DITADO";
    }
}

// Função para o áudio lento
function ouvirFraseLenta() {
    const displayTexto = document.getElementById('texto-pergunta');
    if (displayTexto && displayTexto.innerText.trim() !== "" && displayTexto.innerText !== "SELECIONE UMA PASTA E APERTE PLAY") {
        falarTexto(displayTexto.innerText, 'ko-KR', 0.6);
    }
}

// Função de voz ajustada para aceitar velocidade (rate)
function falarTexto(texto, lingua, velocidade = 1) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = lingua;
    utterance.rate = velocidade; // 0.5 é lento, 1 é normal
    window.speechSynthesis.speak(utterance);
}


