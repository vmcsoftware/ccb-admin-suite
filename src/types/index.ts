export interface Congregacao {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  diasCultos: string;
  diasRJM: string;
  diasEnsaios: string;
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
