// Tipos para Cultos
export type TipoCulto = 'Culto Oficial' | 'Reunião de Jovens e Menores';

export interface DiaCulto {
  diasemana: string; // 'Segunda', 'Terça', etc
  horario: string; // 'HH:mm'
  tipo: TipoCulto;
}

export type TipoMinisterioFuncao = 'Ancião' | 'Diácono' | 'Cooperador do Ofício' | 'Cooperador de Jovens e Menores';

export interface MinisterioMembro {
  id: string;
  nome: string;
  funcao: TipoMinisterioFuncao;
  ehLocalidade: boolean; // Se é da localidade (negrito)
  ehResponsavel: boolean; // Se é responsável pela localidade (itálico)
}

// Tipos para Ensaios da Congregação
export type TipoEnsaioCongregacao = 'Local' | 'Regional' | 'DARPE' | 'GEM' | 'GERAL';

export interface DiaEnsaio {
  id: string;
  semanaDoMes: number; // 1, 2, 3, 4 ou 5
  diaSemana: string; // 'Segunda', 'Terça', etc
  horario: string; // 'HH:mm'
  tipo: TipoEnsaioCongregacao;
  meses: number[]; // Array de meses (1-12) quando ocorre o ensaio
}

export interface Congregacao {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  numeroRelatorio?: string; // Número de relatório da congregação
  // Novos campos para múltiplos dias/horários
  diasCultos?: DiaCulto[];
  diasRJM?: DiaCulto[];
  diasEnsaios?: DiaEnsaio[]; // Dias de ensaios
  // Campos legados para compatibilidade
  diasCultosLegado?: string;
  diasRJMLegado?: string;
  diasEnsaiosLegado?: string;
  // Ministério da congregação
  ministerio?: MinisterioMembro[];
}

export type TipoMinisterio = 'Ancião' | 'Diácono' | 'Cooperador do Ofício' | 'Cooperador de Jovens e Menores';

export interface Membro {
  id: string;
  nome: string;
  ministerio: TipoMinisterio;
  congregacaoId?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  horario?: string; // 'HH:mm'
  tipo: 'Culto' | 'RJM' | 'Ensaio' | 'Reunião' | 'Jovens' | 'Outro';
  subtipoReuniao?: string; // Para tipos específicos de reunião
  congregacaoId?: string;
  descricao?: string;
  // Campos para Batismo
  anciaoAtende?: string; // Nome do ancião
  anciaoLocalidade?: string; // Localidade do ancião
  // Campos para Ensaio Regional
  encarregadoRegional?: string; // Nome do encarregado regional
  encarregadoLocalidade?: string; // Localidade do encarregado
  // Campos para Santa Ceia
  diaconoResponsavel?: string; // Nome do diácono responsável
  diaconoAuxiliar?: string; // Nome do diácono auxiliar
  responsavelContagem?: string; // Responsável pela contagem
}

export interface Reforco {
  id: string;
  data: string;
  horario?: string; // 'HH:mm'
  tipo: 'Culto' | 'RJM';
  congregacaoId: string;
  membros: string[];
  membrosOutrasLocalidades?: Array<{ nome: string; localidade: string; ministerio: TipoMinisterio }>;
  observacoes?: string;
}

// Tipos para Ensaios
export type NivelEnsaio = 'Local' | 'Regional';

export interface RegrasEnsaio {
  meses?: number[]; // 1-12 (janeiro-dezembro)
  semanas?: number[]; // 1-4 (primeira até quarta semana)
  dias?: number[]; // 1-31 (dia do mês)
  diasSemana?: string[]; // 'Segunda', 'Terça', etc
  horario: string; // 'HH:mm'
}

export interface Ensaio {
  id: string;
  titulo: string;
  nivel: NivelEnsaio;
  local: string;
  descricao?: string;
  regras: RegrasEnsaio[];
  ativo: boolean;
  criadoEm?: string;
}
