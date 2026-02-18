import { useState } from 'react';
import { Plus, Trash2, Calendar as CalIcon, Eye } from 'lucide-react';
import { useEventos, useCongregacoes } from '@/hooks/useData';
import { Evento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const tiposEvento: Evento['tipo'][] = ['Culto', 'RJM', 'Ensaio', 'Reunião', 'Jovens', 'Outro'];

const tiposReunioes = [
  'Reuniões',
  'Santa-Ceia',
  'Batismo',
  'Reunião para Mocidade',
  'Busca dos Dons',
  'Reunião Setorial',
  'Reunião Ministerial',
  'Reunião Extra',
  'Culto para Jovens',
  'Ensaio Regional',
  'Ordenação'
];

const tipoCor: Record<Evento['tipo'], string> = {
  Culto: 'bg-primary/10 text-primary border-primary/20',
  RJM: 'bg-accent/20 text-accent-foreground border-accent/30',
  Ensaio: 'bg-success/10 text-success border-success/20',
  Reunião: 'bg-warning/20 text-warning-foreground border-warning/30',
  Jovens: 'bg-violet/10 text-violet border-violet/20',
  Outro: 'bg-muted text-muted-foreground border-border',
};

export default function Agenda() {
  const { eventos, adicionar, remover } = useEventos();
  const { congregacoes } = useCongregacoes();
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [subtipoReunioes, setSubtipoReunioes] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    data: '',
    horario: '',
    tipo: 'Culto' as Evento['tipo'],
    congregacaoId: '',
    descricao: '',
    anciaoAtende: '',
    anciaoLocalidade: '',
    encarregadoRegional: '',
    encarregadoLocalidade: '',
    diaconoResponsavel: '',
    diaconoAuxiliar: '',
    responsavelContagem: '',
  });

  const abrirComTipoReunioes = (tipoReuniao: string) => {
    setForm({
      titulo: '',
      data: '',
      horario: '',
      tipo: 'Reunião',
      congregacaoId: '',
      descricao: '',
      anciaoAtende: '',
      anciaoLocalidade: '',
      encarregadoRegional: '',
      encarregadoLocalidade: '',
      diaconoResponsavel: '',
      diaconoAuxiliar: '',
      responsavelContagem: '',
    });
    setSubtipoReunioes(tipoReuniao);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let titulo = form.titulo;
    if (form.tipo === 'Reunião' && subtipoReunioes && !titulo) {
      titulo = subtipoReunioes;
    }
    if (!titulo || !form.data) return;
    adicionar({ ...form, titulo, subtipoReuniao: subtipoReunioes });
    setForm({
      titulo: '',
      data: '',
      horario: '',
      tipo: 'Culto',
      congregacaoId: '',
      descricao: '',
      anciaoAtende: '',
      anciaoLocalidade: '',
      encarregadoRegional: '',
      encarregadoLocalidade: '',
      diaconoResponsavel: '',
      diaconoAuxiliar: '',
      responsavelContagem: '',
    });
    setSubtipoReunioes('');
    setOpen(false);
  };

  const sorted = [...eventos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">Eventos e programações</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setForm({
              titulo: '',
              data: '',
              horario: '',
              tipo: 'Culto',
              congregacaoId: '',
              descricao: '',
              anciaoAtende: '',
              anciaoLocalidade: '',
              encarregadoRegional: '',
              encarregadoLocalidade: '',
              diaconoResponsavel: '',
              diaconoAuxiliar: '',
              responsavelContagem: '',
            });
            setSubtipoReunioes('');
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título do evento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
                <div>
                  <Label>Horário (opcional)</Label>
                  <Input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => {
                    setForm({ ...form, tipo: v as Evento['tipo'] });
                    if (v !== 'Reunião') setSubtipoReunioes('');
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tiposEvento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.tipo === 'Reunião' && (
                <div>
                  <Label>Tipo de Reunião</Label>
                  <Select value={subtipoReunioes} onValueChange={setSubtipoReunioes}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo de reunião" /></SelectTrigger>
                    <SelectContent>
                      {tiposReunioes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {congregacoes.length > 0 && (
                <div>
                  <Label>Congregação (opcional)</Label>
                  <Select value={form.congregacaoId} onValueChange={(v) => setForm({ ...form, congregacaoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {[...congregacoes]
                        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome.toLowerCase().includes('central') ? `${c.nome} (${c.cidade})` : c.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {subtipoReunioes === 'Batismo' && (
                <>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm mb-3">Dados do Batismo</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ancião</Label>
                      <Input value={form.anciaoAtende} onChange={(e) => setForm({ ...form, anciaoAtende: e.target.value })} placeholder="Nome do ancião" />
                    </div>
                    <div>
                      <Label>Localidade do Ancião</Label>
                      <Input value={form.anciaoLocalidade} onChange={(e) => setForm({ ...form, anciaoLocalidade: e.target.value })} placeholder="Local" />
                    </div>
                  </div>
                </>
              )}
              {subtipoReunioes === 'Ensaio Regional' && (
                <>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm mb-3">Dados do Ensaio Regional</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ancião</Label>
                      <Input value={form.anciaoAtende} onChange={(e) => setForm({ ...form, anciaoAtende: e.target.value })} placeholder="Nome do ancião" />
                    </div>
                    <div>
                      <Label>Localidade do Ancião</Label>
                      <Input value={form.anciaoLocalidade} onChange={(e) => setForm({ ...form, anciaoLocalidade: e.target.value })} placeholder="Local" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Encarregado Regional</Label>
                      <Input value={form.encarregadoRegional} onChange={(e) => setForm({ ...form, encarregadoRegional: e.target.value })} placeholder="Nome" />
                    </div>
                    <div>
                      <Label>Localidade do Encarregado</Label>
                      <Input value={form.encarregadoLocalidade} onChange={(e) => setForm({ ...form, encarregadoLocalidade: e.target.value })} placeholder="Local" />
                    </div>
                  </div>
                </>
              )}
              {subtipoReunioes === 'Santa-Ceia' && (
                <>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm mb-3">Dados da Santa Ceia</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ancião</Label>
                      <Input value={form.anciaoAtende} onChange={(e) => setForm({ ...form, anciaoAtende: e.target.value })} placeholder="Nome do ancião" />
                    </div>
                    <div>
                      <Label>Localidade do Ancião</Label>
                      <Input value={form.anciaoLocalidade} onChange={(e) => setForm({ ...form, anciaoLocalidade: e.target.value })} placeholder="Local" />
                    </div>
                  </div>
                  <div>
                    <Label>Diácono Responsável</Label>
                    <Input value={form.diaconoResponsavel} onChange={(e) => setForm({ ...form, diaconoResponsavel: e.target.value })} placeholder="Nome" />
                  </div>
                  <div>
                    <Label>Diácono Auxiliar</Label>
                    <Input value={form.diaconoAuxiliar} onChange={(e) => setForm({ ...form, diaconoAuxiliar: e.target.value })} placeholder="Nome" />
                  </div>
                  <div>
                    <Label>Responsável pela Contagem</Label>
                    <Input value={form.responsavelContagem} onChange={(e) => setForm({ ...form, responsavelContagem: e.target.value })} placeholder="Nome" />
                  </div>
                </>
              )}
              <div>
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Opcional" />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Botões de Tipos de Reuniões */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {tiposReunioes.map((tipo) => (
          <button
            key={tipo}
            onClick={() => abrirComTipoReunioes(tipo)}
            className="px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/30 transition-colors text-sm font-medium"
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Modal de Visualização de Detalhes */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedEvent?.subtipoReuniao || selectedEvent?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-medium">{new Date(selectedEvent.data + 'T12:00:00').toLocaleDateString('pt-BR')} {selectedEvent.horario && `às ${selectedEvent.horario}`}</p>
              </div>
              {selectedEvent.titulo && (
                <div>
                  <p className="text-xs text-muted-foreground">Título</p>
                  <p className="font-medium">{selectedEvent.titulo}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge className={tipoCor[selectedEvent.tipo]}>{selectedEvent.tipo}</Badge>
              </div>
              {selectedEvent.anciaoAtende && (
                <div>
                  <p className="text-xs text-muted-foreground">Ancião</p>
                  <p className="font-medium">{selectedEvent.anciaoAtende} {selectedEvent.anciaoLocalidade && `(${selectedEvent.anciaoLocalidade})`}</p>
                </div>
              )}
              {selectedEvent.encarregadoRegional && (
                <div>
                  <p className="text-xs text-muted-foreground">Encarregado Regional</p>
                  <p className="font-medium">{selectedEvent.encarregadoRegional} {selectedEvent.encarregadoLocalidade && `(${selectedEvent.encarregadoLocalidade})`}</p>
                </div>
              )}
              {selectedEvent.diaconoResponsavel && (
                <div>
                  <p className="text-xs text-muted-foreground">Diácono Responsável</p>
                  <p className="font-medium">{selectedEvent.diaconoResponsavel}</p>
                </div>
              )}
              {selectedEvent.diaconoAuxiliar && (
                <div>
                  <p className="text-xs text-muted-foreground">Diácono Auxiliar</p>
                  <p className="font-medium">{selectedEvent.diaconoAuxiliar}</p>
                </div>
              )}
              {selectedEvent.responsavelContagem && (
                <div>
                  <p className="text-xs text-muted-foreground">Responsável pela Contagem</p>
                  <p className="font-medium">{selectedEvent.responsavelContagem}</p>
                </div>
              )}
              {selectedEvent.descricao && (
                <div>
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedEvent.descricao}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {sorted.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CalIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Nenhum evento na agenda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ev) => (
            <div key={ev.id} className="glass-card stat-card-hover rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-center min-w-[50px] flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {new Date(ev.data + 'T12:00:00').getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    {ev.subtipoReuniao && (
                      <p className="font-semibold text-foreground text-lg">{ev.subtipoReuniao}</p>
                    )}
                    {ev.titulo && (
                      <p className="text-sm text-muted-foreground">{ev.titulo}</p>
                    )}
                    {ev.horario && (
                      <p className="text-xs text-muted-foreground mt-1">🕐 {ev.horario}</p>
                    )}
                    {ev.descricao && (
                      <p className="text-xs text-muted-foreground mt-1">{ev.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedEvent(ev);
                      setViewModalOpen(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Visualizar detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => remover(ev.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={tipoCor[ev.tipo]}>{ev.tipo}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
