import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Congregacao, Membro, Evento, Reforco, Ensaio } from '@/types';

/**
 * Normaliza dados de Congregacao do formato antigo para o novo
 */
function normalizeCongregacao(data: Record<string, unknown>): Congregacao {
  const normalizeDiaCulto = (dia: any) => {
    if (typeof dia === 'object' && dia !== null) {
      return {
        diasemana: typeof dia.diasemana === 'string' ? dia.diasemana : '',
        horario: typeof dia.horario === 'string' ? dia.horario : '19:00',
        tipo: typeof dia.tipo === 'string' ? dia.tipo : 'Culto Oficial',
      };
    }
    return { diasemana: '', horario: '19:00', tipo: 'Culto Oficial' };
  };

  const normalizeMinisterio = (ministerio: any) => {
    if (!Array.isArray(ministerio)) return [];
    return ministerio.map((m: any) => ({
      id: typeof m.id === 'string' ? m.id : `temp_${Date.now()}`,
      nome: typeof m.nome === 'string' ? m.nome : '',
      funcao: typeof m.funcao === 'string' ? m.funcao : 'Ancião',
      ehLocalidade: typeof m.ehLocalidade === 'boolean' ? m.ehLocalidade : false,
      ehResponsavel: typeof m.ehResponsavel === 'boolean' ? m.ehResponsavel : false,
    }));
  };

  const normalizeDiaEnsaio = (ensaio: any) => {
    if (typeof ensaio === 'object' && ensaio !== null) {
      return {
        id: typeof ensaio.id === 'string' ? ensaio.id : `ensaio_${Date.now()}`,
        semanaDoMes: typeof ensaio.semanaDoMes === 'number' ? ensaio.semanaDoMes : 1,
        diaSemana: typeof ensaio.diaSemana === 'string' ? ensaio.diaSemana : 'Segunda',
        horario: typeof ensaio.horario === 'string' ? ensaio.horario : '19:00',
        tipo: typeof ensaio.tipo === 'string' ? ensaio.tipo : 'Local',
        meses: Array.isArray(ensaio.meses) ? ensaio.meses : [],
      };
    }
    return { id: `ensaio_${Date.now()}`, semanaDoMes: 1, diaSemana: 'Segunda', horario: '19:00', tipo: 'Local', meses: [] };
  };

  return {
    id: (data.id as string) || '',
    nome: (data.nome as string) || '',
    endereco: (data.endereco as string) || '',
    cidade: (data.cidade as string) || '',
    bairro: (data.bairro as string) || '',
    numeroRelatorio: (data.numeroRelatorio as string) || '',
    // Se for array, normaliza cada item; se for string vazia, converte para array vazio
    diasCultos: Array.isArray(data.diasCultos) 
      ? data.diasCultos.map(normalizeDiaCulto) 
      : [],
    diasRJM: Array.isArray(data.diasRJM) 
      ? data.diasRJM.map(normalizeDiaCulto) 
      : [],
    diasEnsaios: Array.isArray(data.diasEnsaios)
      ? data.diasEnsaios.map(normalizeDiaEnsaio)
      : [],
    ministerio: normalizeMinisterio(data.ministerio),
  };
}

function useFirestoreCollection<T extends { id: string }>(collectionName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const rawData = { id: doc.id, ...doc.data() };
        
        // Normalizar congregações se necessário
        if (collectionName === 'congregacoes') {
          return normalizeCongregacao(rawData) as T;
        }
        
        return rawData as T;
      });
      setItems(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [collectionName]);

  const adicionar = async (item: Omit<T, 'id'>) => {
    await addDoc(collection(db, collectionName), item);
  };

  const remover = async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  const atualizar = async (id: string, data: Partial<T>) => {
    await updateDoc(doc(db, collectionName, id), data as Record<string, unknown>);
  };

  return { items, loading, adicionar, remover, atualizar };
}

export function useCongregacoes() {
  const { items: congregacoes, loading, adicionar, remover, atualizar } =
    useFirestoreCollection<Congregacao>('congregacoes');
  return { congregacoes, loading, adicionar, remover, atualizar };
}

export function useMembros() {
  const { items: membros, loading, adicionar, remover, atualizar } =
    useFirestoreCollection<Membro>('membros');
  return { membros, loading, adicionar, remover, atualizar };
}

export function useEventos() {
  const { items: eventos, loading, adicionar, remover } =
    useFirestoreCollection<Evento>('eventos');
  return { eventos, loading, adicionar, remover };
}

export function useReforcos() {
  const { items: reforcos, loading, adicionar, remover } =
    useFirestoreCollection<Reforco>('reforcos');
  return { reforcos, loading, adicionar, remover };
}

export function useEnsaios() {
  const { items: ensaios, loading, adicionar, remover, atualizar } =
    useFirestoreCollection<Ensaio>('ensaios');
  return { ensaios, loading, adicionar, remover, atualizar };
}
