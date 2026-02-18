import { useState } from 'react';
import { Plus, Trash2, MapPin, Clock, X } from 'lucide-react';
import { useCongregacoes } from '@/hooks/useData';
import { Congregacao, DiaCulto, TipoCulto } from '@/types';import { formatarHora24 } from '@/lib/utils';import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const tiposCulto: TipoCulto[] = ['Culto Oficial', 'Reunião de Jovens e Menores'];

const emptyForm: Omit<Congregacao, 'id'> = {
  nome: '',
  endereco: '',
  cidade: 'Ituiutaba',
  bairro: '',
  diasCultos: [],
  diasRJM: [],
  diasEnsaios: '',
};

const emptyDiaCulto: DiaCulto = {
  diasemana: '',
  horario: '19:00',
  tipo: 'Culto Oficial',
};

const removeRenderingErrorDuringEdit = (congregacao: Congregacao): typeof emptyForm => {
  return {
    nome: congregacao.nome || '',
    endereco: congregacao.endereco || '',
    cidade: congregacao.cidade || '',
    bairro: congregacao.bairro || '',
    // Garante que são arrays, nunca strings
    diasCultos: Array.isArray(congregacao.diasCultos) 
      ? congregacao.diasCultos 
      : [],
    diasRJM: Array.isArray(congregacao.diasRJM) 
      ? congregacao.diasRJM 
      : [],
    diasEnsaios: typeof congregacao.diasEnsaios === 'string' 
      ? congregacao.diasEnsaios 
      : '',
  };
};

export default function Congregacoes() {
  const { congregacoes, adicionar, remover, atualizar } = useCongregacoes();
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cultos' | 'rjm'>('cultos');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) return;

    if (editingId) {
      atualizar(editingId, form);
      setEditingId(null);
    } else {
      adicionar(form);
    }

    setForm(emptyForm);
    setOpen(false);
  };

  const handleEdit = (congregacao: Congregacao) => {
    setForm(removeRenderingErrorDuringEdit(congregacao));
    setEditingId(congregacao.id);
    setOpen(true);
  };

  const addDiaCulto = () => {
    if (activeTab === 'cultos') {
      setForm({
        ...form,
        diasCultos: [...(form.diasCultos || []), { ...emptyDiaCulto }],
      });
    } else {
      setForm({
        ...form,
        diasRJM: [...(form.diasRJM || []), { ...emptyDiaCulto }],
      });
    }
  };

  const removeDiaCulto = (index: number) => {
    if (activeTab === 'cultos') {
      setForm({
        ...form,
        diasCultos: form.diasCultos?.filter((_, i) => i !== index) || [],
      });
    } else {
      setForm({
        ...form,
        diasRJM: form.diasRJM?.filter((_, i) => i !== index) || [],
      });
    }
  };

  const updateDiaCulto = (index: number, updates: Partial<DiaCulto>) => {
    const array = activeTab === 'cultos' ? form.diasCultos : form.diasRJM;
    if (array) {
      const updated = [...array];
      updated[index] = { ...updated[index], ...updates };
      if (activeTab === 'cultos') {
        setForm({ ...form, diasCultos: updated });
      } else {
        setForm({ ...form, diasRJM: updated });
      }
    }
  };

  const dias = activeTab === 'cultos' ? form.diasCultos : form.diasRJM;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Congregações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as congregações da Administração
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setForm(emptyForm);
              setEditingId(null);
              setActiveTab('cultos');
            }
            setOpen(isOpen);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Congregação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? 'Editar' : 'Nova'} Congregação
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome da congregação"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <Separator />

              {/* Dias de Cultos e RJM */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('cultos')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === 'cultos'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Cultos Oficiais
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rjm')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === 'rjm'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Reunião de Jovens e Menores
                  </button>
                </div>

                <div className="space-y-3">
                  {!dias || dias.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum dia adicionado
                    </p>
                  ) : (
                    dias.map((dia, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-end gap-3">
                          <div className="flex-1 grid gap-3 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs">Dia da Semana</Label>
                              <Select
                                value={dia.diasemana}
                                onValueChange={(value) =>
                                  updateDiaCulto(idx, { diasemana: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {diasSemana.map((d) => (
                                    <SelectItem key={d} value={d}>
                                      {d}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Horário (24h)</Label>
                              <Input
                                type="time"
                                value={dia.horario}
                                onChange={(e) => {
                                  const hora = formatarHora24(e.target.value);
                                  updateDiaCulto(idx, { horario: hora });
                                }}
                                step="60"
                                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                                placeholder="HH:mm"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Tipo</Label>
                              <Select
                                value={dia.tipo}
                                onValueChange={(value) =>
                                  updateDiaCulto(idx, { tipo: value as TipoCulto })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {tiposCulto.map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>
                                      {tipo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDiaCulto(idx)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addDiaCulto}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Dia
                  </Button>
                </div>
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
                  {editingId ? 'Atualizar' : 'Criar'} Congregação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Congregações */}
      {congregacoes.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Nenhuma congregação cadastrada.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {congregacoes.map((c) => (
            <div key={c.id} className="glass-card stat-card-hover rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground font-display text-lg">{c.nome}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => remover(c.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {c.endereco ? `${c.endereco}, ${c.bairro}` : c.bairro || 'Sem endereço'}
                </p>

                {/* Cultos Oficiais */}
                {(() => {
                  const cultos = c.diasCultos;
                  if (!Array.isArray(cultos) || cultos.length === 0) return null;
                  
                  return (
                    <div>
                      <p className="font-semibold text-xs text-foreground/70 mb-1">
                        Cultos Oficiais:
                      </p>
                      <div className="space-y-1 ml-5">
                        {cultos.map((dia, idx) => {
                          if (dia && typeof dia === 'object' && 'diasemana' in dia) {
                            return (
                              <p key={idx} className="flex items-center gap-2 text-xs">
                                <Clock className="h-3 w-3" />
                                {String(dia.diasemana)} às {formatarHora24(String(dia.horario || '19:00'))}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* RJM */}
                {(() => {
                  const rjm = c.diasRJM;
                  if (!Array.isArray(rjm) || rjm.length === 0) return null;
                  
                  return (
                    <div>
                      <p className="font-semibold text-xs text-foreground/70 mb-1">
                        Reunião de Jovens e Menores:
                      </p>
                      <div className="space-y-1 ml-5">
                        {rjm.map((dia, idx) => {
                          if (dia && typeof dia === 'object' && 'diasemana' in dia) {
                            return (
                              <p key={idx} className="flex items-center gap-2 text-xs">
                                <Clock className="h-3 w-3" />
                                {String(dia.diasemana)} às {formatarHora24(String(dia.horario || '19:00'))}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="text-xs text-muted-foreground/60">{c.cidade}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
