import { useState } from 'react';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useReforcos, useCongregacoes, useMembros } from '@/hooks/useData';
import { Reforco } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';

export default function Reforcos() {
  const { reforcos, adicionar, remover } = useReforcos();
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data: '',
    tipo: 'Culto' as Reforco['tipo'],
    congregacaoId: '',
    membros: [] as string[],
    observacoes: '',
  });

  const toggleMembro = (id: string) => {
    setForm((f) => ({
      ...f,
      membros: f.membros.includes(id) ? f.membros.filter((m) => m !== id) : [...f.membros, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data || !form.congregacaoId) return;
    adicionar(form);
    setForm({ data: '', tipo: 'Culto', congregacaoId: '', membros: [], observacoes: '' });
    setOpen(false);
  };

  const getCongNome = (id: string) => congregacoes.find((c) => c.id === id)?.nome || '—';
  const getMembroNome = (id: string) => membros.find((m) => m.id === id)?.nome || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Reforços</h1>
          <p className="text-sm text-muted-foreground mt-1">Agendar atendimentos de cultos e RJM</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Reforço</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Reforço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Reforco['tipo'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Culto">Culto</SelectItem>
                      <SelectItem value="RJM">RJM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Congregação</Label>
                <Select value={form.congregacaoId} onValueChange={(v) => setForm({ ...form, congregacaoId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {congregacoes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {membros.length > 0 && (
                <div>
                  <Label>Membros Escalados</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto rounded-lg border border-border p-3">
                    {membros.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.membros.includes(m.id)}
                          onCheckedChange={() => toggleMembro(m.id)}
                        />
                        <span className="text-foreground">{m.nome}</span>
                        <span className="text-muted-foreground text-xs">({m.ministerio})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Observações</Label>
                <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Opcional" />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reforcos.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Nenhum reforço agendado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reforcos.map((r) => (
            <div key={r.id} className="glass-card stat-card-hover rounded-xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {new Date(r.data + 'T12:00:00').getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{getCongNome(r.congregacaoId)}</p>
                    {r.observacoes && <p className="text-xs text-muted-foreground">{r.observacoes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={r.tipo === 'Culto' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/20 text-accent-foreground border-accent/30'}>
                    {r.tipo}
                  </Badge>
                  <button onClick={() => remover(r.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {r.membros.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.membros.map((mid) => (
                    <span key={mid} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {getMembroNome(mid)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
