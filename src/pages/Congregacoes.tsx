import { useState } from 'react';
import { Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { useCongregacoes } from '@/hooks/useData';
import { Congregacao } from '@/types';
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

const emptyForm: Omit<Congregacao, 'id'> = {
  nome: '',
  endereco: '',
  cidade: 'Ituiutaba',
  bairro: '',
  diasCultos: '',
  diasRJM: '',
  diasEnsaios: '',
};

export default function Congregacoes() {
  const { congregacoes, adicionar, remover } = useCongregacoes();
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) return;
    adicionar(form);
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Congregações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as congregações da Administração
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Congregação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Nova Congregação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome da congregação"
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
                <div>
                  <Label>Dias de Cultos</Label>
                  <Input
                    value={form.diasCultos}
                    onChange={(e) => setForm({ ...form, diasCultos: e.target.value })}
                    placeholder="Ex: Qua, Dom"
                  />
                </div>
                <div>
                  <Label>Dias de RJM</Label>
                  <Input
                    value={form.diasRJM}
                    onChange={(e) => setForm({ ...form, diasRJM: e.target.value })}
                    placeholder="Ex: Sáb"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Dias de Ensaios</Label>
                  <Input
                    value={form.diasEnsaios}
                    onChange={(e) => setForm({ ...form, diasEnsaios: e.target.value })}
                    placeholder="Ex: Sex"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                <button
                  onClick={() => remover(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {c.endereco ? `${c.endereco}, ${c.bairro}` : c.bairro || 'Sem endereço'}
                </p>
                {c.diasCultos && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Cultos: {c.diasCultos}
                  </p>
                )}
                {c.diasRJM && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> RJM: {c.diasRJM}
                  </p>
                )}
                {c.diasEnsaios && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Ensaios: {c.diasEnsaios}
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground/60">{c.cidade}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
