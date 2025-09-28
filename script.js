// --- Listas de Nomes ---
const presidentes = ["Caio Santos", "Mauri Silvino", "Wander Antônio", "Marlon Antônio", "Jose Ailton"];
const farao_oracao = ["Jatil Pereira", "Douglas Frias", "Marcos Braga", "Isael Coelho", "Ivan Junior"];
const farao_tesouros_discurso_1 = ["Valdir Junior", "Jan Luiz", "Michel Barcelos", "Luiz Carlos", "Ivan Junior"];
const farao_joias_espirituais = ["Mauri Silvino", "Jeroni Andrade", "Celso da Cruz", "Luiz Carlos"];
const farao_vida_crista_parte_1 = ["Celso Cruz", "Marlon Antônio", "Jose Ailton", "Wander Antônio"];
const farao_vida_crista_estudo = ["Marlon Antônio", "Luiz Oliveira", "Mauri Silvino", "Jose Ailton"];
const estudantes_homens = ["Matheus Bessa", "Isaque Marques", "Vitor Costa", "Douglas Frias", "Jovani Coelho"];
const farao_discurso_estudante = ["Jovani Coelho", "Douglas Frias", "Matheus Bessa"];
const mulheres_estudantes = [
    "Aline Santos","Ana Clara","Ana Cristina","Ana Paula","Andrea Souza","Ariana Bernardes","Camila Avelar","Carla Antônio","Celle Mendes","Cesarina","Elaine Antonio","Eliane da Silva","Elisangela Ramalho","Francisca Cremilda","Ione","Irani Avelar","Jessica Silva","Josania Motta","Larissa Andrade","Larissa Antônio","Lídia Henriques","Luciana Araujo","Luma de Oliveira","Marcia Angelina","Maria Alcidene","Maria das Graças","Maria de Lourdes","Maria Hilda","Marilia Antônio","Monica Oliveira","Mônica Oliveira","Naira Gomes","Natalia Feitosa","Nercina da Cruz","Nicole Ávila","Nicolle Marques","Nycolle Cristine","Paula Soares","Raquel Amancio","Regina","Rejane Moraes","Rogeria","Rose Braga","Sandra Ávila","Silvia Pereira","Sofia Feitosa","Thais Antõnio","Thayane Romão","Vivian Santo","Yane Barcelos"
];

let ultima_designacao = {};

function parsePastedText(text) {
    const cleanText = text.replace(/\u00A0/g, ' ');

    const weeklyData = [];
    const weekBlocks = cleanText.split(/(?=\d{1,2}(?:-\d{1,2})?\s+DE\s+\w+)/i);

    // Nova função auxiliar para analisar cada secção de forma robusta
    const parseSection = (sectionText) => {
        if (!sectionText) return [];
        const parts = [];
        // Divide a secção em blocos para cada parte numerada (ex: "1. Tema...", "2. Tema...")
        const partBlocks = sectionText.split(/\n(?=\d+\.\s)/).filter(p => p.trim());
        
        for (const partBlock of partBlocks) {
            const lines = partBlock.trim().split('\n');
            const firstLine = lines[0] || '';
            const numberMatch = firstLine.match(/^(\d+)\.\s+/);
            const number = numberMatch ? numberMatch[1] : '';

            const theme = firstLine.replace(/^\d+\.\s+/, '').trim();
            let time = "x min";

            const timeMatch = partBlock.match(/\((.*?min.*?)\)/);
            if (timeMatch) {
                time = timeMatch[1].trim();
            }
            parts.push({ number, theme, time });
        }
        return parts;
    };

    let startDate = null;
    const monthMap = {
        JANEIRO: 0, FEVEREIRO: 1, MARÇO: 2, ABRIL: 3, MAIO: 4, JUNHO: 5,
        JULHO: 6, AGOSTO: 7, SETEMBRO: 8, OUTUBRO: 9, NOVEMBRO: 10, DEZEMBRO: 11
    };
    const dateMatch = cleanText.match(/(\d{1,2})(?:-\d{1,2})?\s+DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const monthName = dateMatch[2].toUpperCase();
        const month = monthMap[monthName];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const year = (month < currentMonth && currentMonth - month > 6) ? currentYear + 1 : currentYear;
        if (month !== undefined) startDate = new Date(year, month, day);
    }
    if (!startDate) {
        startDate = new Date();
        const hoje = startDate.getDay();
        startDate.setDate(startDate.getDate() - hoje + (hoje === 0 ? -6 : 1));
    }

    for (const block of weekBlocks) {
        if (block.trim().length < 50) continue;
        let data = {};
        const lines = block.trim().split('\n');
        if (lines.length > 1 && !lines[1].toLowerCase().includes('cântico')) {
            data.leituraBiblia = lines[1].trim();
        } else {
            let matchLeitura = block.match(/LEITURA SEMANAL DA BÍBLIA\s*[,|]?\s*(.*?)(?=,?\s*Presidente:)/i);
            data.leituraBiblia = matchLeitura ? matchLeitura[1].trim() : "[LEITURA SEMANAL]";
        }
        
        const tesourosBlockMatch = block.match(/TESOUROS DA PALAVRA DE DEUS([\s\S]*?)FAÇA SEU MELHOR NO MINISTÉRIO/i);
        data.tesouros = parseSection(tesourosBlockMatch ? tesourosBlockMatch[1] : "");
        
        const vidaCristaBlockMatch = block.match(/NOSSA VIDA CRISTÃ([\s\S]*?)Comentários finais/i);
        data.vidaCrista = parseSection(vidaCristaBlockMatch ? vidaCristaBlockMatch[1] : "");

        const songMatches = block.matchAll(/Cântico\s+(\d+)/gi);
        data.songs = Array.from(songMatches, match => match[1]);
        
        const ministerioBlockMatch = block.match(/FAÇA SEU MELHOR NO MINISTÉRIO([\s\S]*?)(?:NOSSA VIDA CRISTÃ|Cântico \d+)/i);
        data.ministerio = parseSection(ministerioBlockMatch ? ministerioBlockMatch[1] : "");

        weeklyData.push(data);
    }
    return { weeklyData, startDate };
}

function get_next_person(lista, data_atual, dias_min, ...exclude) {
    lista.sort(() => 0.5 - Math.random());
    const lista_ordenada = [...lista].sort((a, b) => (ultima_designacao[a] || 0) - (ultima_designacao[b] || 0));
    for (const nome of lista_ordenada) {
        if (exclude.includes(nome)) continue;
        const ultima_vez_timestamp = ultima_designacao[nome] || 0;
        const diff_dias = (data_atual.getTime() - ultima_vez_timestamp) / (1000 * 3600 * 24);
        if (!ultima_vez_timestamp || diff_dias >= dias_min) {
            ultima_designacao[nome] = data_atual.getTime();
            return nome;
        }
    }
    for (const nome of lista_ordenada) {
        if (!exclude.includes(nome)) {
            ultima_designacao[nome] = data_atual.getTime();
            return nome;
        }
    }
    return "N/A";
}

function get_next_pair(lista, data_atual, dias_min, exclude_list) {
    const p1 = get_next_person(lista, data_atual, dias_min, ...exclude_list);
    if (!exclude_list.includes(p1)) exclude_list.push(p1);
    const p2 = get_next_person(lista, data_atual, dias_min, ...exclude_list);
    if (!exclude_list.includes(p2)) exclude_list.push(p2);
    return `${p1} / ${p2}`;
}

function generateSchedule() {
    document.getElementById('scheduleOutput').innerHTML = '';
    ultima_designacao = {};
    
    const fullContent = document.getElementById('fullContentInput').value;
    if (fullContent.trim() === '') {
        alert('Por favor, cole o conteúdo da apostila antes de gerar a programação.');
        return;
    }
    
    const parsedData = parsePastedText(fullContent);
    const weeklyThemes = parsedData.weeklyData;
    const data_inicio = parsedData.startDate;

    const num_semanas = weeklyThemes.length;
    const dias_sem_repetir = 20;
    
    if (num_semanas === 0) {
        alert('Nenhuma semana encontrada no texto. Verifique se o texto foi colado corretamente.');
        return;
    }
    
    for (let i = 0; i < num_semanas; i++) {
        const data_semana = new Date(data_inicio);
        data_semana.setDate(data_semana.getDate() + (i * 7));
        
        let usados_na_semana_homens = [];
        const presidente = get_next_person(presidentes, data_semana, dias_sem_repetir, ...usados_na_semana_homens); usados_na_semana_homens.push(presidente);
        const oracao_inicial = get_next_person(farao_oracao, data_semana, dias_sem_repetir, ...usados_na_semana_homens); usados_na_semana_homens.push(oracao_inicial);
        
        const data_fim_semana = new Date(data_semana);
        data_fim_semana.setDate(data_fim_semana.getDate() + 6);
        const mes_pt = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data_semana);
        const data_formatada = `${data_semana.getDate()}-${data_fim_semana.getDate()} DE ${mes_pt.toUpperCase()}`;
        
        const temas = weeklyThemes[i];
        
        const cantico_1 = temas.songs[0] || "[Nº]";
        const cantico_2 = temas.songs[1] || "[Nº]";
        const cantico_3 = temas.songs[2] || "[Nº]";
        
        let tesourosHtml = '';
        if (temas.tesouros && temas.tesouros.length > 0) {
            const oradoresTesouros = [farao_tesouros_discurso_1, farao_joias_espirituais, estudantes_homens];
            for (let j = 0; j < temas.tesouros.length; j++) {
                const part = temas.tesouros[j];
                const listaDeNomes = oradoresTesouros[j] || farao_tesouros_discurso_1;
                const orador = get_next_person(listaDeNomes, data_semana, dias_sem_repetir, ...usados_na_semana_homens);
                usados_na_semana_homens.push(orador);
                const label = part.theme.toLowerCase().includes('leitura da bíblia') ? 'Estudante: ' : '';
                const padding = " ".repeat(Math.max(0, 35 - part.theme.length));
                tesourosHtml += `\n${part.number}. ${part.theme} (${part.time})${padding}${label}${orador}`;
            }
        }
        
        let vidaCristaHtml = '';
        if (temas.vidaCrista && temas.vidaCrista.length > 0) {
            const oradoresVidaCrista = [farao_vida_crista_parte_1, farao_vida_crista_estudo, farao_vida_crista_parte_1];
            for (let j = 0; j < temas.vidaCrista.length; j++) {
                 const part = temas.vidaCrista[j];
                 const listaDeNomes = oradoresVidaCrista[j] || farao_vida_crista_parte_1;
                 const orador = get_next_person(listaDeNomes, data_semana, dias_sem_repetir, ...usados_na_semana_homens);
                 usados_na_semana_homens.push(orador);
                 const label = part.theme.toLowerCase().includes('estudo bíblico') ? 'Dirigente/leitor: ' : '';
                 const padding = " ".repeat(Math.max(0, 35 - part.theme.length));
                 vidaCristaHtml += `\n${part.number}. ${part.theme} (${part.time})${padding}${label}${orador}`;
            }
        }
        
        let ministerioHtml = '';
        let usadas_na_semana_mulheres = [];
        if (temas.ministerio && temas.ministerio.length > 0) {
            for (let j = 0; j < temas.ministerio.length; j++) {
                const part = temas.ministerio[j];
                let designacao = '';
                if (part.theme.toLowerCase().includes('discurso')) {
                    const estudanteHomem = get_next_person(farao_discurso_estudante, data_semana, dias_sem_repetir, ...usados_na_semana_homens);
                    usados_na_semana_homens.push(estudanteHomem);
                    designacao = `Estudante: ${estudanteHomem}`;
                } else {
                    const dupla = get_next_pair(mulheres_estudantes, data_semana, dias_sem_repetir, usadas_na_semana_mulheres);
                    designacao = `Estudante/ajudante: ${dupla}`;
                }
                const padding = " ".repeat(Math.max(0, 35 - part.theme.length));
                ministerioHtml += `\n${part.number}. ${part.theme} (${part.time})${padding}${designacao}`;
            }
        }

        const oracao_final = get_next_person(farao_oracao, data_semana, dias_sem_repetir, ...usados_na_semana_homens);
        
        const bloco_semana = document.createElement('div');
        bloco_semana.className = 'semana';
        bloco_semana.innerText = `JARDIM CAMPINHO                                Programação da reunião do meio de semana
--------------------------------------------------------------------------------------------------------------------
${data_formatada} | ${temas.leituraBiblia}               Presidente: ${presidente}

Cântico ${cantico_1}                                     Oração: ${oracao_inicial}
Comentários iniciais (1 min)

TESOUROS DA PALAVRA DE DEUS${tesourosHtml}

FAÇA SEU MELHOR NO MINISTÉRIO${ministerioHtml}

NOSSA VIDA CRISTÃ
Cântico ${cantico_2}
${vidaCristaHtml}
Comentários finais (3 min)
Cântico ${cantico_3}                                     Oração: ${oracao_final}
--------------------------------------------------------------------------------------------------------------------`;
        document.getElementById('scheduleOutput').appendChild(bloco_semana);
    }
}

document.getElementById('generateBtn').addEventListener('click', generateSchedule);
document.getElementById('printBtn').addEventListener('click', () => { window.print(); });