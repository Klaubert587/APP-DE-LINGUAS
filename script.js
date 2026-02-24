let bancoDeDados = {}; 
let gramaticaSalva = {};
let respostaCoreanaCorreta = ""; 
let respostaPortuguesCorreta = ""; 
let modoEstudo = "pergunta";
let indexEditando = null; 
let pastaEditando = null;
let seqAtual = 0; 

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
