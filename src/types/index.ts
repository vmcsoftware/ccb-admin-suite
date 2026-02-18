// Tipos para Cultos
export type TipoCulto = 'Culto Oficial' | 'Reunião de Jovens e Menores';

export interface DiaCulto {
  diasemana: string; // 'Segunda', 'Terça', etc
  horario: string; // 'HH:mm'
  tipo: TipoCulto;
}

export interface Congregacao {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  // Novos campos para múltiplos dias/horários
  diasCultos?: DiaCulto[];
  diasRJM?: DiaCulto[];
  // Campos legados para compatibilidade
  diasCultosLegado?: string;
  diasRJMLegado?: string;
  diasEnsaios?: string;
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
  tipo: 'Culto' | 'RJM' | 'Ensaio' | 'Reunião' | 'Outro';
  congregacaoId?: string;
  descricao?: string;
}

export interface Reforco {
  id: string;
  data: string;
  tipo: 'Culto' | 'RJM';
  congregacaoId: string;
  membros: string[];
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
