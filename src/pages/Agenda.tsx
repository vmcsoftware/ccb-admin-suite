import { useState } from 'react';
import { Plus, Trash2, Calendar as CalIcon } from 'lucide-react';
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

const tiposEvento: Evento['tipo'][] = ['Culto', 'RJM', 'Ensaio', 'Reunião', 'Outro'];

const tiposReunioes = [
  'Reuniões',
  'Santa-Ceia',
  'Batismo',
  'Reunião para Mocidade',
  'Busca dos Dons',
  'Reunião Setorial',
  'Reunião Ministerial',
  'Reunião Extra',
  'Ordenação'
];

const tipoCor: Record<Evento['tipo'], string> = {
  Culto: 'bg-primary/10 text-primary border-primary/20',
  RJM: 'bg-accent/20 text-accent-foreground border-accent/30',
  Ensaio: 'bg-success/10 text-success border-success/20',
  Reunião: 'bg-warning/20 text-warning-foreground border-warning/30',
  Outro: 'bg-muted text-muted-foreground border-border',
};

export default function Agenda() {
  const { eventos, adicionar, remover } = useEventos();
  const { congregacoes } = useCongregacoes();
  const [open, setOpen] = useState(false);
  const [subtipoReunioes, setSubtipoReunioes] = useState('');
  const [form, setForm] = useState({ titulo: '', data: '', tipo: 'Culto' as Evento['tipo'], congregacaoId: '', descricao: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let titulo = form.titulo;
    if (form.tipo === 'Reunião' && subtipoReunioes && !titulo) {
      titulo = subtipoReunioes;
    }
    if (!titulo || !form.data) return;
    adicionar({ ...form, titulo });
    setForm({ titulo: '', data: '', tipo: 'Culto', congregacaoId: '', descricao: '' });
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
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
                        .map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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

      {sorted.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CalIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Nenhum evento na agenda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ev) => (
            <div key={ev.id} className="glass-card stat-card-hover rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[50px]">
                  <p className="text-xs text-muted-foreground">
                    {new Date(ev.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {new Date(ev.data + 'T12:00:00').getDate()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{ev.titulo}</p>
                  {ev.descricao && <p className="text-xs text-muted-foreground">{ev.descricao}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={tipoCor[ev.tipo]}>{ev.tipo}</Badge>
                <button onClick={() => remover(ev.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
