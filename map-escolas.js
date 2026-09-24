const fs = require('fs');

const rawText = fs.readFileSync('raw_schools.txt', 'utf8');
const lines = rawText.split('\n').filter(Boolean);

const ESCOLAS_PARNAIBA = [
  'CCL MONSENHOR ANTÃ”NIO SAMPAIO (GALHANONI)', 'CEEP MIN. PETRÃ”NIO PORTELA', 'CETI LIMA REBELO (ESTADUAL)', 
  'CETI POLIVALENTE LIMA REBELO', 'CIRCULO OPERARIO DE PARNAIBA', 'COLEGIO DIOCESANO', 
  'COLÃ‰GIO ESTADUAL SENADOR CHAGAS RODRIGUES', 'ESCOLA INTEGRADA DEPUTADO MORAES SOUZA (SESI)', 
  'ESCOLA MUNICIPAL ADEMAR NEVES', 'ESCOLA MUNICIPAL ALBERTINA FURTADO C. BRANCO - CAIC', 
  'ESCOLA MUNICIPAL ALTAIR PIRES ATHAYDE', 'ESCOLA MUNICIPAL ANTONIETA MARTINS DE OLIVEIRA', 
  'ESCOLA MUNICIPAL BENEDITO DOS SANTOS LIMA', 'ESCOLA MUNICIPAL BENEDITO SILVESTRE DE LIMA', 
  'ESCOLA MUNICIPAL BORGES MACHADO', 'ESCOLA MUNICIPAL CANDIDO ATHAYDE', 'ESCOLA MUNICIPAL COMENDADOR CORTEZ', 
  'ESCOLA MUNICIPAL CORAÃ‡ÃƒO IMACULADO DE MARIA', 'ESCOLA MUNICIPAL DR. FRANCISCO DAS CHAGAS VIEIRA', 
  'ESCOLA MUNICIPAL DR. JOAO SILVA FILHO', 'ESCOLA MUNICIPAL FRANCISCA RIBEIRO BORGES DOS REIS', 
  'ESCOLA MUNICIPAL FREI ANASTACIO', 'ESCOLA MUNICIPAL GASTÃƒO NEVES RODRIGUES', 'ESCOLA MUNICIPAL GODOFREDO DE MIRANDA', 
  'ESCOLA MUNICIPAL HENRIETTE SÃ“TER CASTELO BRANCO', 'ESCOLA MUNICIPAL HERMILA MILOCA RAMOS', 
  'ESCOLA MUNICIPAL IZAIAS PEREIRA GALENO', 'ESCOLA MUNICIPAL JOSE ALEXANDRE', 'ESCOLA MUNICIPAL JOSE ARIMATEIA CARVALHO', 
  'ESCOLA MUNICIPAL JOSE DE LIMA COUTO', 'ESCOLA MUNICIPAL JOSE DE SOUZA PIRES SANTANA', 'ESCOLA MUNICIPAL JOSÃ‰ RODRIGUES DO NASCIMENTO', 
  'ESCOLA MUNICIPAL JOZIMO DE MORAES TAVARES', 'ESCOLA MUNICIPAL LAURO CORREIA', 'ESCOLA MUNICIPAL MARIA CELESTE DE JESUS', 
  'ESCOLA MUNICIPAL MIRIAM LOPES DO NASCIMENTO', 'ESCOLA MUNICIPAL MONSENHOR ANTONIO SAMPAIO', 'ESCOLA MUNICIPAL MONSENHOR MARIO JOSE DE MENEZES', 
  'ESCOLA MUNICIPAL PEDRO PEREIRA FONTENELE', 'ESCOLA MUNICIPAL PLAUTILA LOPES DO NASCIMENTO', 'ESCOLA MUNICIPAL PROF. ANTONIO SIELIGMANN', 
  'ESCOLA MUNICIPAL PROF. ANTONIO TOMAZ FILHO', 'ESCOLA MUNICIPAL PROF. BENEDICTO JONAS CORREIA', 'ESCOLA MUNICIPAL PROF. JOÃƒO ORLANDO DE MORAIS CORREA', 
  'ESCOLA MUNICIPAL PROF. JOSÃ‰ LAUREANO HENRIQUE DA COSTA', 'ESCOLA MUNICIPAL PROF. JOSÃ‰ RODRIGUES E SILVA', 'ESCOLA MUNICIPAL PROF. MARIA DO AMPARO MORAES DOS SANTOS', 
  'ESCOLA MUNICIPAL RECREACAO BOA ESPERANCA', 'ESCOLA MUNICIPAL RENATO CASTELO BRANCO', 'ESCOLA MUNICIPAL ROLAND JACOB', 
  'ESCOLA MUNICIPAL SAMUEL SANTOS', 'ESCOLA MUNICIPAL SÃƒO JOSÃ‰', 'FACULDADE MAURÃCIO DE NASSAU', 'LICEU PARNAÃBANO', 'SENAI', 
  'UNIDADE ESCOLAR CÃ‚NDIDO OLIVEIRA', 'UNIDADE ESCOLAR DEPUTADA FRANCISCA TRINDADE II', 'UNIDADE ESCOLAR DR. JOÃƒO SILVA FILHO', 
  'UNIDADE ESCOLAR EDISON CUNHA', 'UNIDADE ESCOLAR EDSON DA PAZ CUNHA', 'UNIDADE ESCOLAR EVANGELINA ROSA', 
  'UNIDADE ESCOLAR FRANCISCO CORREIA (ESCOLA DE APLICAÃ‡ÃƒO)', 'UNIDADE ESCOLAR JEANETE SOUZA', 'UNIDADE ESCOLAR JOSÃ‰ EUCLIDES DE MIRANDA', 
  'UNIDADE ESCOLAR OZIAS CORREIA', 'UNIDADE ESCOLAR PADRE RAIMUNDO JOSÃ‰ VIEIRA', 'UNIDADE ESCOLAR RAQUEL MAGALHAES', 
  'UNIDADE ESCOLAR RUI BARBOSA', 'UNIVERSIDADE ESTADUAL DO PIAUI - UESPI', 'UNIVERSIDADE FEDERAL DO DELTA DO PARNAÃBA - UFDPAR'
];

const BAIRROS_PARNAIBA = [
  'Alto Santa Maria', 'Bebedouro', 'Boa Esperanca', 'Broderville', 'Campestre', 
  'Canta Galo', 'Carmo', 'Catanduvas', 'Ceara', 'Centro', 'Conselheiro Alberto Silva', 
  'Dirceu Arcoverde', 'Do Carmo', 'Dom Rufino', 'Do Planalto', 'Floriopolis', 'Frei Higino', 
  'Guarita', 'IgaraÃ§u', 'Ilha Grande De Santa Isabel', 'Joao Xxiii', 'Nossa Senhora de Fatima', 
  'Nossa Senhora do Carmo', 'Nova Parnaiba', 'PiauÃ­', 'Planalto de Monteserra The', 'Primavera', 
  'Rodoviaria', 'Rosapolis', 'Santa Luzia', 'SÃ£o Benedito', 'SÃ£o Francisco da Guarita', 
  'Sao Jose', 'SÃ£o Judas Tadeu', 'Sao Pedro', 'Sao Vicente de Paula'
];

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

const bairroMap = {};

// Parse rawText to find Bairros for each school line
lines.forEach(line => {
  const matchCEP = line.match(/\. ([A-ZÃ€-Ãša-zÃ -Ãº0-9 ]+)\. 642/);
  let bairroEncontrado = null;
  if (matchCEP) {
    bairroEncontrado = matchCEP[1].trim();
  } else if (line.includes('sem dados de endereÃ§o')) {
    // try to guess from the name or ignore
  }

  // Find the matching escola from our ESCOLAS_PARNAIBA list
  const normLine = normalize(line);
  let bestEscola = null;
  let bestScore = 0;

  for (const escola of ESCOLAS_PARNAIBA) {
    const normEscola = normalize(escola);
    // basic substring check, or word overlap
    const words = normEscola.split(' ');
    let score = 0;
    words.forEach(w => {
      if (w.length > 2 && normLine.includes(w)) score++;
    });
    if (score > bestScore) {
      bestScore = score;
      bestEscola = escola;
    }
  }

  if (bestEscola && bairroEncontrado) {
    // Map the found bairro back to our official BAIRROS_PARNAIBA list
    const normBairroEncontrado = normalize(bairroEncontrado);
    let matchedOfficialBairro = null;
    let bBestScore = 0;
    for (const b of BAIRROS_PARNAIBA) {
      const normB = normalize(b);
      if (normB === normBairroEncontrado || normBairroEncontrado.includes(normB) || normB.includes(normBairroEncontrado)) {
        matchedOfficialBairro = b;
        break;
      }
    }
    
    if (!matchedOfficialBairro) {
      // Fuzzy matching fallback for neighborhoods
      for (const b of BAIRROS_PARNAIBA) {
        const normB = normalize(b);
        const w1 = normB.split(' ');
        const w2 = normBairroEncontrado.split(' ');
        let s = 0;
        w1.forEach(w => { if (w.length > 3 && normBairroEncontrado.includes(w)) s++; });
        if (s > bBestScore) { bBestScore = s; matchedOfficialBairro = b; }
      }
    }

    if (matchedOfficialBairro) {
      bairroMap[bestEscola] = matchedOfficialBairro;
    }
  }
});

// Some manual fallback for the ones that don't match well or are "sem dados de endereÃ§o"
// Based on the user's previous list or common sense.
const finalMapping = {};
BAIRROS_PARNAIBA.forEach(b => finalMapping[b] = []);

ESCOLAS_PARNAIBA.forEach(escola => {
  if (bairroMap[escola]) {
    finalMapping[bairroMap[escola]].push(escola);
  } else {
    // Default to Centro or something to avoid breaking if not found, or let's try to infer from the name
    const n = normalize(escola);
    if (n.includes('SAO JOSE')) finalMapping['Sao Jose'].push(escola);
    else if (n.includes('SAO BENEDITO')) finalMapping['SÃ£o Benedito'].push(escola);
    else if (n.includes('CARMO')) finalMapping['Nossa Senhora do Carmo'].push(escola);
    else if (n.includes('PLANALTO')) finalMapping['Planalto de Monteserra The'].push(escola);
    else if (n.includes('BOA ESPERANCA')) finalMapping['Boa Esperanca'].push(escola);
    else finalMapping['Centro'].push(escola); // fallback
  }
});

fs.writeFileSync('bairro_escolas_map.json', JSON.stringify(finalMapping, null, 2));
console.log('Mapping complete!');
