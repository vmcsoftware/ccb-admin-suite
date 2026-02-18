import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useEnsaios, useCongregacoes } from '@/hooks/useData';
import { Ensaio, NivelEnsaio, RegrasEnsaio, DiaEnsaio } from '@/types';
import { formatarHora24 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const semanas = ['1ª semana', '2ª semana', '3ª semana', '4ª semana'];

const emptyRegra: RegrasEnsaio = {
  meses: [],
  semanas: [],
  dias: [],
  diasSemana: [],
  horario: '19:00',
};

const emptyForm: Omit<Ensaio, 'id'> = {
  titulo: '',
  nivel: 'Local',
  local: '',
  descricao: '',
  regras: [{ ...emptyRegra }],
  ativo: true,
};

export default function Ensaios() {
  const { ensaios, adicionar, remover, atualizar } = useEnsaios();
  const { congregacoes } = useCongregacoes();
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'general' | 'congregacoes'>('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.local || form.regras.length === 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      await atualizar(editingId, form);
      setEditingId(null);
    } else {
      await adicionar(form);
    }

    setForm(emptyForm);
    setOpen(false);
  };

  const handleAddRules = () => {
    setForm({
      ...form,
      regras: [...form.regras, { ...emptyRegra }],
    });
  };

  const handleRemoveRule = (index: number) => {
    if (form.regras.length > 1) {
      setForm({
        ...form,
        regras: form.regras.filter((_, i) => i !== index),
      });
    }
  };

  const updateRegra = (index: number, novaRegra: Partial<RegrasEnsaio>) => {
    const updatedRegras = [...form.regras];
    updatedRegras[index] = { ...updatedRegras[index], ...novaRegra };
    setForm({ ...form, regras: updatedRegras });
  };

  const handleEdit = (ensaio: Ensaio) => {
    setForm(ensaio);
    setEditingId(ensaio.id);
    setOpen(true);
  };

  const levelColor = (nivel: NivelEnsaio) => ({
    Local: 'bg-blue-100 text-blue-800',
    Regional: 'bg-purple-100 text-purple-800',
  }[nivel]);

  // Agregar ensaios de todas as congregações
  const ensaiosCongregacoes: Array<DiaEnsaio & { congregacaoNome: string; congregacaoId: string }> = [];
  congregacoes.forEach((cong) => {
    if (cong.diasEnsaios && Array.isArray(cong.diasEnsaios)) {
      cong.diasEnsaios.forEach((ensaio) => {
        ensaiosCongregacoes.push({
          ...ensaio,
          congregacaoNome: cong.nome,
          congregacaoId: cong.id,
        });
      });
    }
  });

  // Ordenar ensaios das congregações alfabeticamente por congregação e depois por tipo
  const ensaiosCongregacoesOrdenados = [...ensaiosCongregacoes].sort((a, b) => {
    const congCmp = a.congregacaoNome.localeCompare(b.congregacaoNome, 'pt-BR');
    if (congCmp !== 0) return congCmp;
    return a.tipo.localeCompare(b.tipo, 'pt-BR');
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Ensaios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os ensaios com regras de recorrência
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setForm(emptyForm);
            setEditingId(null);
          }
          setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Ensaio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? 'Editar' : 'Novo'} Ensaio
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Título</Label>
                  <Input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ex: Ensaio Coral"
                    required
                  />
                </div>

                <div>
                  <Label>Nível</Label>
                  <Select
                    value={form.nivel}
                    onValueChange={(value) =>
                      setForm({ ...form, nivel: value as NivelEnsaio })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Local</Label>
                  <Input
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                    placeholder="Ex: Congregação Ituiutaba"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={form.descricao || ''}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Detalhes adicionais"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Regras de Recorrência</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRules}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Regra
                  </Button>
                </div>

                {form.regras.map((regra, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm">Regra {idx + 1}</h4>
                        {form.regras.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        {/* Horário */}
                        <div>
                          <Label className="text-sm">Horário (24h)</Label>
                          <Input
                            type="time"
                            value={regra.horario}
                            onChange={(e) => {
                              const hora = formatarHora24(e.target.value);
                              updateRegra(idx, { horario: hora });
                            }}
                            step="60"
                            pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                            placeholder="HH:mm"
                            required
                          />
                        </div>

                        {/* Dias da Semana */}
                        <div>
                          <Label className="text-sm mb-2 block">Dias da Semana</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {diasSemana.map((dia) => (
                              <div key={dia} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dia-${idx}-${dia}`}
                                  checked={regra.diasSemana?.includes(dia) || false}
                                  onCheckedChange={(checked) => {
                                    const updated = regra.diasSemana || [];
                                    if (checked) {
                                      updateRegra(idx, {
                                        diasSemana: [...updated, dia],
                                      });
                                    } else {
                                      updateRegra(idx, {
                                        diasSemana: updated.filter((d) => d !== dia),
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`dia-${idx}-${dia}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {dia.slice(0, 3)}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Meses */}
                        <div>
                          <Label className="text-sm mb-2 block">Meses</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {meses.map((mes, mesIdx) => (
                              <div key={mes} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mes-${idx}-${mes}`}
                                  checked={
                                    regra.meses?.includes(mesIdx + 1) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const updated = regra.meses || [];
                                    if (checked) {
                                      updateRegra(idx, {
                                        meses: [...updated, mesIdx + 1].sort(),
                                      });
                                    } else {
                                      updateRegra(idx, {
                                        meses: updated.filter((m) => m !== mesIdx + 1),
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`mes-${idx}-${mes}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {mes.slice(0, 3)}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Semanas do Mês */}
                        <div>
                          <Label className="text-sm mb-2 block">Semanas do Mês</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {semanas.map((semana, semanaIdx) => (
                              <div key={semana} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`semana-${idx}-${semana}`}
                                  checked={
                                    regra.semanas?.includes(semanaIdx + 1) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const updated = regra.semanas || [];
                                    if (checked) {
                                      updateRegra(idx, {
                                        semanas: [...updated, semanaIdx + 1].sort(),
                                      });
                                    } else {
                                      updateRegra(idx, {
                                        semanas: updated.filter(
                                          (s) => s !== semanaIdx + 1
                                        ),
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`semana-${idx}-${semana}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {semana}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dias do Mês */}
                        <div>
                          <Label className="text-sm mb-2 block">Dias do Mês</Label>
                          <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                              <button
                                key={dia}
                                type="button"
                                onClick={() => {
                                  const updated = regra.dias || [];
                                  if (updated.includes(dia)) {
                                    updateRegra(idx, {
                                      dias: updated.filter((d) => d !== dia),
                                    });
                                  } else {
                                    updateRegra(idx, {
                                      dias: [...updated, dia].sort(),
                                    });
                                  }
                                }}
                                className={`h-8 w-8 text-xs rounded border ${
                                  regra.dias?.includes(dia)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:bg-muted'
                                }`}
                              >
                                {dia}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingId(null);
                    setOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? 'Atualizar' : 'Criar'} Ensaio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Abas de visualização */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setViewMode('general')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            viewMode === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Ensaios Gerais
        </button>
        <button
          onClick={() => setViewMode('congregacoes')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            viewMode === 'congregacoes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Ensaios de Congregações
        </button>
      </div>

      {/* Lista de Ensaios Gerais */}
      {viewMode === 'general' && (
        <div className="grid gap-4">
          {ensaios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum ensaio cadastrado</p>
            </div>
          ) : (
            [...ensaios]
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
              .map((ensaio) => (
            <Card key={ensaio.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{ensaio.titulo}</CardTitle>
                      <Badge className={levelColor(ensaio.nivel)}>
                        {ensaio.nivel}
                      </Badge>
                      <Badge variant={ensaio.ativo ? 'default' : 'secondary'}>
                        {ensaio.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ensaio.local}</p>
                    {ensaio.descricao && (
                      <p className="text-sm mt-1">{ensaio.descricao}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ensaio)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remover(ensaio.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ensaio.regras.map((regra, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg text-sm space-y-2">
                    <div className="font-semibold text-xs">Regra {idx + 1}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {regra.horario && (
                        <div>
                          <span className="text-muted-foreground">Horário:</span>{' '}
                          {formatarHora24(regra.horario)}
                        </div>
                      )}
                      {regra.diasSemana && regra.diasSemana.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Dias:</span>{' '}
                          {regra.diasSemana.join(', ')}
                        </div>
                      )}
                      {regra.meses && regra.meses.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Meses:</span>{' '}
                          {regra.meses.map(m => meses[m - 1]).join(', ')}
                        </div>
                      )}
                      {regra.semanas && regra.semanas.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Semanas:</span>{' '}
                          {regra.semanas
                            .map((s) => semanas[s - 1])
                            .join(', ')}
                        </div>
                      )}
                      {regra.dias && regra.dias.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Dias do mês:</span>{' '}
                          {regra.dias.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
        </div>
      )}

      {/* Lista de Ensaios de Congregações */}
      {viewMode === 'congregacoes' && (
        <div className="grid gap-4">
          {ensaiosCongregacoesOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum ensaio de congregação cadastrado</p>
            </div>
          ) : (
            ensaiosCongregacoesOrdenados.map((ensaio, idx) => (
              <Card key={`${ensaio.congregacaoId}-${idx}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{ensaio.tipo}</CardTitle>
                        <Badge variant="outline">{ensaio.congregacaoNome}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        💍 Dias: {Array.isArray(ensaio.diasSemana) ? ensaio.diasSemana.join(', ') : 'N/A'}
                      </p>
                      {ensaio.horario && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ⏰ Horário: {formatarHora24(ensaio.horario)}
                        </p>
                      )}
                      {ensaio.descricao && (
                        <p className="text-sm mt-2 text-foreground">{ensaio.descricao}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
