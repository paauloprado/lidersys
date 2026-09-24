const fs = require('fs');
const path = require('path');

const escolas = [
  'ESCOLA MUNICIPAL BENEDITO DOS SANTOS LIMA',
  'ESCOLA MUNICIPAL BENEDITO SILVESTRE DE LIMA',
  'ESCOLA MUNICIPAL JOSE ARIMATEIA CARVALHO',
  'ESCOLA MUNICIPAL ALTAIR PIRES ATHAYDE',
  'ESCOLA MUNICIPAL GODOFREDO DE MIRANDA',
  'UNIDADE ESCOLAR JEANETE SOUZA',
  'CCL MONSENHOR ANTÃ”NIO SAMPAIO (GALHANONI)',
  'ESCOLA MUNICIPAL MONSENHOR MARIO JOSE DE MENEZES',
  'ESCOLA MUNICIPAL PEDRO PEREIRA FONTENELE',
  'ESCOLA MUNICIPAL PROF. ANTONIO SIELIGMANN',
  'ESCOLA MUNICIPAL MIRIAM LOPES DO NASCIMENTO',
  'ESCOLA MUNICIPAL JOSE ALEXANDRE',
  'UNIDADE ESCOLAR FRANCISCO CORREIA (ESCOLA DE APLICAÃ‡ÃƒO)',
  'UNIVERSIDADE FEDERAL DO DELTA DO PARNAÃBA - UFDPAR',
  'ESCOLA MUNICIPAL DR. JOAO SILVA FILHO',
  'ESCOLA MUNICIPAL MONSENHOR ANTONIO SAMPAIO',
  'ESCOLA MUNICIPAL CORAÃ‡ÃƒO IMACULADO DE MARIA',
  'ESCOLA MUNICIPAL RECREACAO BOA ESPERANCA',
  'ESCOLA MUNICIPAL PROF. JOSÃ‰ LAUREANO HENRIQUE DA COSTA',
  'ESCOLA MUNICIPAL FREI ANASTACIO',
  'ESCOLA MUNICIPAL JOZIMO DE MORAES TAVARES',
  'ESCOLA MUNICIPAL PROF. BENEDICTO JONAS CORREIA',
  'UNIDADE ESCOLAR DR. JOÃƒO SILVA FILHO',
  'UNIVERSIDADE ESTADUAL DO PIAUI - UESPI',
  'COLEGIO DIOCESANO',
  'CEEP MIN. PETRÃ”NIO PORTELA',
  'ESCOLA MUNICIPAL HENRIETTE SÃ“TER CASTELO BRANCO',
  'UNIDADE ESCOLAR EDISON CUNHA',
  'ESCOLA MUNICIPAL SÃƒO JOSÃ‰',
  'UNIDADE ESCOLAR CÃ‚NDIDO OLIVEIRA',
  'CIRCULO OPERARIO DE PARNAIBA',
  'ESCOLA MUNICIPAL JOSE DE LIMA COUTO',
  'ESCOLA MUNICIPAL CANDIDO ATHAYDE',
  'LICEU PARNAÃBANO',
  'UNIDADE ESCOLAR OZIAS CORREIA',
  'ESCOLA MUNICIPAL PROF. JOÃƒO ORLANDO DE MORAIS CORREA',
  'ESCOLA MUNICIPAL JOSE DE SOUZA PIRES SANTANA',
  'ESCOLA INTEGRADA DEPUTADO MORAES SOUZA (SESI)',
  'FACULDADE MAURÃCIO DE NASSAU',
  'ESCOLA MUNICIPAL BORGES MACHADO',
  'SENAI',
  'ESCOLA MUNICIPAL FRANCISCA RIBEIRO BORGES DOS REIS',
  'UNIDADE ESCOLAR PADRE RAIMUNDO JOSÃ‰ VIEIRA',
  'ESCOLA MUNICIPAL MARIA CELESTE DE JESUS',
  'UNIDADE ESCOLAR DEPUTADA FRANCISCA TRINDADE II',
  'ESCOLA MUNICIPAL RENATO CASTELO BRANCO',
  'ESCOLA MUNICIPAL JOSÃ‰ RODRIGUES DO NASCIMENTO',
  'ESCOLA MUNICIPAL ADEMAR NEVES',
  'ESCOLA MUNICIPAL HERMILA MILOCA RAMOS',
  'COLÃ‰GIO ESTADUAL SENADOR CHAGAS RODRIGUES',
  'ESCOLA MUNICIPAL COMENDADOR CORTEZ',
  'ESCOLA MUNICIPAL PROF. ANTONIO TOMAZ FILHO',
  'ESCOLA MUNICIPAL ROLAND JACOB',
  'ESCOLA MUNICIPAL IZAIAS PEREIRA GALENO',
  'ESCOLA MUNICIPAL PROF. MARIA DO AMPARO MORAES DOS SANTOS',
  'CETI LIMA REBELO (ESTADUAL)',
  'UNIDADE ESCOLAR EDSON DA PAZ CUNHA',
  'ESCOLA MUNICIPAL DR. FRANCISCO DAS CHAGAS VIEIRA',
  'ESCOLA MUNICIPAL GASTÃƒO NEVES RODRIGUES',
  'ESCOLA MUNICIPAL LAURO CORREIA',
  'ESCOLA MUNICIPAL ANTONIETA MARTINS DE OLIVEIRA',
  'UNIDADE ESCOLAR RAQUEL MAGALHAES',
  'UNIDADE ESCOLAR JOSÃ‰ EUCLIDES DE MIRANDA',
  'ESCOLA MUNICIPAL PLAUTILA LOPES DO NASCIMENTO',
  'CETI POLIVALENTE LIMA REBELO',
  'ESCOLA MUNICIPAL ALBERTINA FURTADO C. BRANCO - CAIC',
  'UNIDADE ESCOLAR EVANGELINA ROSA',
  'UNIDADE ESCOLAR RUI BARBOSA',
  'ESCOLA MUNICIPAL PROF. JOSÃ‰ RODRIGUES E SILVA',
  'ESCOLA MUNICIPAL SAMUEL SANTOS'
];

const filePath = path.join(__dirname, 'app/dashboard/liderados/LideradosClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startToken = 'const ESCOLAS_PARNAIBA = [';
const endToken = '\\n]';

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newArrayStr = startToken + '\\n  ' + escolas.map(s => '"' + s + '"').join(',\\n  ');
  content = content.substring(0, startIndex) + newArrayStr + content.substring(endIndex);
}

// Transform the 'voting_location' inputs into native selects
const targetInput1 = '<input name="voting_location" list="escolas-parnaiba" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Ex: Escola Municipal Pedro II" />';
const replacementSelect1 = `<select name="voting_location" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>`;

const targetInput2 = '<input name="voting_location" list="escolas-parnaiba" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Ex: Escola Municipal Pedro II" />';
const replacementSelect2 = `<select name="voting_location" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>`;

content = content.replace(targetInput1, replacementSelect1);
content = content.replace(targetInput2, replacementSelect2); // It might just replace the first one twice if I use replaceAll, wait, .replace() only replaces the first occurrence each time. So calling it twice replaces both!

// Remove the datalist entirely
const datalistStart = '{/* Datalists invisÃ­veis para Autocomplete AutomÃ¡tico do Navegador */}';
const datalistEnd = '</datalist>';
const dlStartIdx = content.indexOf(datalistStart);
const dlEndIdx = content.indexOf(datalistEnd, dlStartIdx);
if (dlStartIdx !== -1 && dlEndIdx !== -1) {
  content = content.substring(0, dlStartIdx) + content.substring(dlEndIdx + datalistEnd.length);
}

fs.writeFileSync(filePath, content);
console.log('Update finished!');
