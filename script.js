let bancoDeDados = {}; 
let gramaticaSalva = {};
let respostaCoreanaCorreta = ""; 
let respostaPortuguesCorreta = ""; 
let modoEstudo = "pergunta";
let indexEditando = null; 
let pastaEditando = null;
let seqAtual = 0; 

window.onload = function() { carregarTudo(); };

function carregarTudo() {
    const exerciciosSalvos = localStorage.getItem('meuAppCoreano');
    const gramaticaSalvaDB = localStorage.getItem('minhaGramaticaPastas');
    
    // CARREGAMENTO INICIAL COM 5 PASTAS + 10 DIÁLOGOS (5 FRASES CADA)
    if (!exerciciosSalvos || Object.keys(JSON.parse(exerciciosSalvos)).length < 10) {
        bancoDeDados = {
            "01-TRABALHO ESSENCIAL": [
                { coreano: "안녕하세요", traducao: "Bom dia / Olá", romanizacao: "Annyeong-haseyo", ordem: 0 },
                { coreano: "감사합니다", traducao: "Obrigado", romanizacao: "Gam-sa-ham-ni-da", ordem: 0 },
                { coreano: "수고하세요", traducao: "Bom trabalho", romanizacao: "Sugo-haseyo", ordem: 0 },
                { coreano: "네", traducao: "Sim", romanizacao: "Ne", ordem: 0 },
                { coreano: "아니요", traducao: "Não", romanizacao: "A-ni-yo", ordem: 0 }
            ],
            "02-ESCRITÓRIO": [
                { coreano: "컴퓨터", traducao: "Computador", romanizacao: "Keom-pyu-teo", ordem: 0 },
                { coreano: "회의실", traducao: "Sala de reunião", romanizacao: "Hoe-ui-sil", ordem: 0 },
                { coreano: "서류", traducao: "Documentos", romanizacao: "Seo-ryu", ordem: 0 },
                { coreano: "이메일", traducao: "E-mail", romanizacao: "I-me-il", ordem: 0 },
                { coreano: "전화", traducao: "Telefone", romanizacao: "Jeon-hwa", ordem: 0 }
            ],
            "03-HORÁRIOS": [
                { coreano: "몇 시예요?", traducao: "Que horas são?", romanizacao: "Myeot si-ye-yo?", ordem: 0 },
                { coreano: "지금", traducao: "Agora", romanizacao: "Ji-geum", ordem: 0 },
                { coreano: "오늘", traducao: "Hoje", romanizacao: "O-neul", ordem: 0 },
                { coreano: "내일", traducao: "Amanhã", romanizacao: "Nae-il", ordem: 0 },
                { coreano: "어제", traducao: "Ontem", romanizacao: "Eo-je", ordem: 0 }
            ],
            "04-AÇÕES": [
                { coreano: "도와주세요", traducao: "Ajude-me", romanizacao: "Do-wa-ju-se-yo", ordem: 0 },
                { coreano: "확인해 주세요", traducao: "Verifique, por favor", romanizacao: "Hwa-gin-hae ju-se-yo", ordem: 0 },
                { coreano: "기다려 주세요", traducao: "Espere, por favor", romanizacao: "Gi-da-ryeo ju-se-yo", ordem: 0 },
                { coreano: "보여주세요", traducao: "Mostre-me", romanizacao: "Bo-yeo-ju-se-yo", ordem: 0 },
                { coreano: "말씀하세요", traducao: "Pode falar", romanizacao: "Mal-sseum-ha-se-yo", ordem: 0 }
            ],
            "05-STATUS": [
                { coreano: "다 했어요", traducao: "Terminei", romanizacao: "Da haess-eo-yo", ordem: 0 },
                { coreano: "바빠요", traducao: "Estou ocupado", romanizacao: "Bappa-yo", ordem: 0 },
                { coreano: "괜찮아요", traducao: "Está tudo bem", romanizacao: "Gwaen-chan-ha-yo", ordem: 0 },
                { coreano: "어려워요", traducao: "É difícil", romanizacao: "Eo-ryeo-wo-yo", ordem: 0 },
                { coreano: "쉬워요", traducao: "É fácil", romanizacao: "Swi-wo-yo", ordem: 0 }
            ],
            "DIALOGO 01-CHEGADA": [
                { coreano: "안녕하세요", traducao: "Bom dia", romanizacao: "Annyeong", ordem: 1 },
                { coreano: "네, 안녕하세요. 잘 잤어요?", traducao: "Sim, bom dia. Dormiu bem?", romanizacao: "Jal jass-eo-yo?", ordem: 2 },
                { coreano: "네, 잘 잤어요. 오늘 덥네요", traducao: "Sim, dormi bem. Hoje está quente", romanizacao: "Oneul deop-ne-yo", ordem: 3 },
                { coreano: "맞아요. 커피 마실래요?", traducao: "Verdade. Quer tomar um café?", romanizacao: "Keopi ma-sil-lae-yo?", ordem: 4 },
                { coreano: "좋아요. 갑시다", traducao: "Ótimo. Vamos", romanizacao: "Jo-a-yo. Gap-si-da", ordem: 5 }
            ],
            "DIALOGO 02-PEDIDO": [
                { coreano: "이것 좀 도와주세요", traducao: "Me ajude com isso aqui", romanizacao: "Do-wa-ju-se-yo", ordem: 1 },
                { coreano: "네, 알겠습니다. 뭐예요?", traducao: "Sim, entendi. O que é?", romanizacao: "Mwo-ye-yo?", ordem: 2 },
                { coreano: "서류가 안 보여요", traducao: "Não encontro os documentos", romanizacao: "Seo-ryu-ga an bo-yeo-yo", ordem: 3 },
                { coreano: "여기 있어요. 보세요", traducao: "Está aqui. Veja", romanizacao: "Yeo-gi iss-eo-yo", ordem: 4 },
                { coreano: "아! 감사합니다", traducao: "Ah! Obrigado", romanizacao: "Gam-sa-ham-ni-da", ordem: 5 }
            ],
            "DIALOGO 03-REUNIÃO": [
                { coreano: "회의 언제 시작해요?", traducao: "Quando começa a reunião?", romanizacao: "Eon-je si-jak-hae-yo?", ordem: 1 },
                { coreano: "열 시에 시작해요", traducao: "Começa às dez horas", romanizacao: "Yeol si-e", ordem: 2 },
                { coreano: "준비 다 했어요?", traducao: "Já preparou tudo?", romanizacao: "Jun-bi da haess-eo-yo?", ordem: 3 },
                { coreano: "네, 서류 여기 있어요", traducao: "Sim, aqui estão os papéis", romanizacao: "Seo-ryu", ordem: 4 },
                { coreano: "좋아요. 들어갑시다", traducao: "Ótimo. Vamos entrar", romanizacao: "Deul-eo-gap-si-da", ordem: 5 }
            ],
            "DIALOGO 04-ALMOÇO": [
                { coreano: "식사 하러 가요", traducao: "Vamos comer", romanizacao: "Sik-sa ha-reo ga-yo", ordem: 1 },
                { coreano: "메뉴가 뭐예요?", traducao: "Qual é o menu?", romanizacao: "Me-nyu-ga mwo-ye-yo?", ordem: 2 },
                { coreano: "김치찌개 어때요?", traducao: "Que tal Kimchi Jjigae?", romanizacao: "Kimchi-jjigae", ordem: 3 },
                { coreano: "좋아요. 배고파요", traducao: "Gostei. Estou com fome", romanizacao: "Bae-go-pa-yo", ordem: 4 },
                { coreano: "빨리 갑시다", traducao: "Vamos rápido", romanizacao: "Ppal-li gap-si-da", ordem: 5 }
            ],
            "DIALOGO 05-FIM DO DIA": [
                { coreano: "일 다 했어요?", traducao: "Terminou o trabalho?", romanizacao: "Il da haess-eo-yo?", ordem: 1 },
                { coreano: "네, 다 끝났어요", traducao: "Sim, tudo terminado", romanizacao: "Da kkeut-nass-eo-yo", ordem: 2 },
                { coreano: "그럼 퇴근합시다", traducao: "Então vamos embora", romanizacao: "Toe-geun-hap-si-da", ordem: 3 },
                { coreano: "오늘 고생 많았어요", traducao: "Você se esforçou muito hoje", romanizacao: "Go-saeng man-ass-eo-yo", ordem: 4 },
                { coreano: "네, 내일 봐요", traducao: "Sim, até amanhã", romanizacao: "Nae-il bwa-yo", ordem: 5 }
            ],
            "DIALOGO 06-TELEFONE": [
                { coreano: "여보세요?", traducao: "Alô?", romanizacao: "Yeo-bo-se-yo?", ordem: 1 },
                { coreano: "김 선생님 계세요?", traducao: "O Sr. Kim está?", romanizacao: "Kim seon-saeng-nim?", ordem: 2 },
                { coreano: "잠시만 기다려 주세요", traducao: "Espere um momento, por favor", romanizacao: "Jam-si-man", ordem: 3 },
                { coreano: "네, 알겠습니다", traducao: "Sim, entendi", romanizacao: "Ne", ordem: 4 },
                { coreano: "전화 연결해 드릴게요", traducao: "Vou transferir a ligação", romanizacao: "Yeon-gyeol", ordem: 5 }
            ],
            "DIALOGO 07-PROBLEMA": [
                { coreano: "문제가 생겼어요", traducao: "Surgiu um problema", romanizacao: "Mun-je-ga", ordem: 1 },
                { coreano: "무슨 문제예요?", traducao: "Que problema é?", romanizacao: "Mu-sun mun-je?", ordem: 2 },
                { coreano: "인터넷이 안 돼요", traducao: "A internet não funciona", romanizacao: "In-teo-net", ordem: 3 },
                { coreano: "다시 켜보세요", traducao: "Tente ligar de novo", romanizacao: "Da-si kyeo-bo-se-yo", ordem: 4 },
                { coreano: "이제 돼요. 고마워요", traducao: "Agora funciona. Obrigado", romanizacao: "I-je dwae-yo", ordem: 5 }
            ],
            "DIALOGO 08-ERRO": [
                { coreano: "죄송합니다. 실수했어요", traducao: "Desculpe. Eu errei", romanizacao: "Sil-su-haess-eo-yo", ordem: 1 },
                { coreano: "괜찮아요. 다시 하세요", traducao: "Tudo bem. Faça de novo", romanizacao: "Gwaen-chan-ha-yo", ordem: 2 },
                { coreano: "네, 지금 할게요", traducao: "Sim, vou fazer agora", romanizacao: "Ji-geum hal-ge-yo", ordem: 3 },
                { coreano: "확인 부탁드립니다", traducao: "Peço que verifique", romanizacao: "Hwa-gin bu-tak", ordem: 4 },
                { coreano: "네, 잘 됐네요", traducao: "Sim, ficou bom", romanizacao: "Jal dwaess-ne-yo", ordem: 5 }
            ],
            "DIALOGO 09-SAÍDA": [
                { coreano: "먼저 가겠습니다", traducao: "Vou indo primeiro", romanizacao: "Meon-jeo ga-gess-seum-ni-da", ordem: 1 },
                { coreano: "네, 수고하셨습니다", traducao: "Sim, bom trabalho", romanizacao: "Sugo-ha-syeoss-seum-ni-da", ordem: 2 },
                { coreano: "주말 잘 보내세요", traducao: "Bom final de semana", romanizacao: "Ju-mal jal bo-nae-se-yo", ordem: 3 },
                { coreano: "당신도요. 내일 봐요", traducao: "Você também. Até amanhã", romanizacao: "Dang-sin-do-yo", ordem: 4 },
                { coreano: "조심히 가세요", traducao: "Vá com cuidado", romanizacao: "Jo-sim-hi", ordem: 5 }
            ],
            "DIALOGO 10-DÚVIDA": [
                { coreano: "이게 뭐예요?", traducao: "O que é isso?", romanizacao: "I-ge mwo-ye-yo?", ordem: 1 },
                { coreano: "제 보고서예요", traducao: "É o meu relatório", romanizacao: "Je bo-go-seo", ordem: 2 },
                { coreano: "읽어보세요", traducao: "Leia, por favor", romanizacao: "Ilg-eo-bo-se-yo", ordem: 3 },
                { coreano: "아주 좋네요", traducao: "Está muito bom", romanizacao: "A-ju jo-ne-yo", ordem: 4 },
                { coreano: "감사합니다. 다행이에요", traducao: "Obrigado. Que alívio", romanizacao: "Da-haeng-i-e-yo", ordem: 5 }
            ]
        };
        atualizarArmazenamento();
    } else {
        bancoDeDados = JSON.parse(exerciciosSalvos);
    }
    if (gramaticaSalvaDB) gramaticaSalva = JSON.parse(gramaticaSalvaDB);
    atualizarMenuPastas();
}

function verificarResposta() {
    const uk = document.getElementById('escrita-coreano').value.trim();
    const up = document.getElementById('escrita-portugues').value.trim().toLowerCase();
    
    const coreanoOk = (uk === respostaCoreanaCorreta);
    const portuguesOk = (up === respostaPortuguesCorreta.toLowerCase());

    if (coreanoOk && portuguesOk) {
        alert("🎯 PERFEITO!\nVocê acertou tudo!");
        document.getElementById('escrita-coreano').style.backgroundColor = "#d1f7ec";
        document.getElementById('escrita-portugues').style.backgroundColor = "#d1f7ec";
    } else {
        // FEEDBACK COMPLETO MOSTRANDO O CORRETO
        let msg = "❌ AINDA NÃO!\n\n";
        msg += "O CORRETO ERA:\n";
        msg += `🇰🇷 Coreano: ${respostaCoreanaCorreta}\n`;
        msg += `🇧🇷 Tradução: ${respostaPortuguesCorreta}\n\n`;
        msg += "Continue tentando!";
        
        alert(msg);
        
        document.getElementById('escrita-coreano').style.backgroundColor = coreanoOk ? "#d1f7ec" : "#ffdce0";
        document.getElementById('escrita-portugues').style.backgroundColor = portuguesOk ? "#d1f7ec" : "#ffdce0";
    }
}

function atualizarArmazenamento() {
    localStorage.setItem('meuAppCoreano', JSON.stringify(bancoDeDados));
    localStorage.setItem('minhaGramaticaPastas', JSON.stringify(gramaticaSalva));
}

// LOGICA DO PLAY
document.getElementById('play-btn').addEventListener('click', () => {
    const p = document.getElementById('pasta-treino').value;
    const lista = bancoDeDados[p];
    if (lista && lista.length > 0) {
        let ex;
        if (p.includes("DIALOGO") || p.includes("DIÁLOGO")) {
            if (seqAtual >= lista.length) seqAtual = 0;
            ex = lista[seqAtual];
            seqAtual++;
        } else {
            ex = lista[Math.floor(Math.random() * lista.length)];
        }
        document.getElementById('texto-pergunta').innerText = (modoEstudo === 'pergunta') ? ex.coreano : ex.traducao;
        document.getElementById('indicador-lingua').innerText = (modoEstudo === 'pergunta') ? "COREANO" : "TRADUÇÃO";
        document.getElementById('texto-dica').innerText = ex.romanizacao;
        document.getElementById('texto-dica').style.display = 'none';
        respostaCoreanaCorreta = ex.coreano;
        respostaPortuguesCorreta = ex.traducao;
        document.getElementById('escrita-coreano').value = "";
        document.getElementById('escrita-portugues').value = "";
        document.getElementById('escrita-coreano').style.backgroundColor = "white";
        document.getElementById('escrita-portugues').style.backgroundColor = "white";
    }
});

// FUNÇÕES DE INTERFACE MANTIDAS
function salvarExercicioDinâmico() {
    const pasta = document.getElementById('cad-pasta-nome').value.trim().toUpperCase();
    const ordem = parseInt(document.getElementById('cad-ordem').value) || 0;
    const coreano = document.getElementById('cad-coreano').value.trim();
    const traducao = document.getElementById('cad-traducao').value.trim();
    const romanizacao = document.getElementById('cad-romanizacao').value.trim();
    if (pasta && coreano && traducao) {
        if (indexEditando !== null) { bancoDeDados[pastaEditando].splice(indexEditando, 1); if (bancoDeDados[pastaEditando].length === 0) delete bancoDeDados[pastaEditando]; }
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
            item.innerHTML = `<span>#${ex.ordem || index+1} - ${ex.coreano}</span><div><button onclick="prepararEdicao('${nomePasta}', ${index})" class="btn-editar">EDITAR</button><button onclick="excluirExercicio('${nomePasta}', ${index})" class="btn-excluir">X</button></div>`;
            pastaContainer.appendChild(item);
        });
        listaDiv.appendChild(pastaContainer);
    });
}

function exportarDados() {
    const blob = new Blob([JSON.stringify({ exercicios: bancoDeDados, gramatica: gramaticaSalva })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `backup_coreano.json`; a.click();
}

function importarDados(input) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        bancoDeDados = data.exercicios; gramaticaSalva = data.gramatica;
        atualizarArmazenamento(); carregarTudo(); renderizarListaExercicios();
    };
    reader.readAsText(input.files[0]);
}

function atualizarMenuPastas() { const s = document.getElementById('pasta-treino'); s.innerHTML = ""; Object.keys(bancoDeDados).forEach(p => { let o = document.createElement('option'); o.value = p; o.innerText = "ESTUDAR: " + p; s.appendChild(o); }); }
function prepararEdicao(p, i) { const ex = bancoDeDados[p][i]; document.getElementById('cad-pasta-nome').value = p; document.getElementById('cad-ordem').value = ex.ordem; document.getElementById('cad-coreano').value = ex.coreano; document.getElementById('cad-traducao').value = ex.traducao; document.getElementById('cad-romanizacao').value = ex.romanizacao; indexEditando = i; pastaEditando = p; }
function resetarFormulario() { indexEditando = null; pastaEditando = null; document.getElementById('cad-pasta-nome').value = ""; document.getElementById('cad-ordem').value = ""; document.getElementById('cad-coreano').value = ""; document.getElementById('cad-traducao').value = ""; document.getElementById('cad-romanizacao').value = ""; }
function abrirArquivos() { document.getElementById('tela-cadastro').style.display = 'block'; renderizarListaExercicios(); }
function fecharCadastro() { document.getElementById('tela-cadastro').style.display = 'none'; }
function revelarDica() { const d = document.getElementById('texto-dica'); d.style.display = (d.style.display === 'none') ? 'block' : 'none'; }
function trocarModo(m) { modoEstudo = m; document.getElementById('btn-modo-pergunta').classList.toggle('modo-ativo', m === 'pergunta'); document.getElementById('btn-modo-resposta').classList.toggle('modo-ativo', m === 'resposta'); }
function ouvirPergunta() { const msg = new SpeechSynthesisUtterance(document.getElementById('texto-pergunta').innerText); msg.lang = (modoEstudo === 'pergunta') ? 'ko-KR' : 'pt-BR'; window.speechSynthesis.speak(msg); }
function reconhecerVoz() { const Rec = window.SpeechRecognition || window.webkitSpeechRecognition; const r = new Rec(); r.lang = 'ko-KR'; r.start(); r.onresult = (e) => { if (e.results[0][0].transcript === respostaCoreanaCorreta) alert("🎯 PERFEITO!"); }; }
function resetarSequencia() { seqAtual = 0; }
function excluirExercicio(p, i) { bancoDeDados[p].splice(i, 1); atualizarArmazenamento(); renderizarListaExercicios(); }
function excluirPastaCompleta(p) { delete bancoDeDados[p]; atualizarArmazenamento(); renderizarListaExercicios(); atualizarMenuPastas(); }
function abrirGramatica() { document.getElementById('tela-gramatica').style.display = 'block'; }
function fecharGramatica() { document.getElementById('tela-gramatica').style.display = 'none'; }