import { useState } from 'react';
import { Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reforcos() {
  const { reforcos, adicionar, remover } = useReforcos();
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showOutraLocalidade, setShowOutraLocalidade] = useState(false);
  const [novoMembroOutraLocalidade, setNovoMembroOutraLocalidade] = useState({ nome: '', localidade: '' });
  const [form, setForm] = useState({
    data: '',
    tipo: 'Culto' as Reforco['tipo'],
    congregacaoId: '',
    membros: [] as string[],
    membrosOutrasLocalidades: [] as Array<{ nome: string; localidade: string }>,
    observacoes: '',
  });

  const toggleMembro = (id: string) => {
    setForm((f) => ({
      ...f,
      membros: f.membros.includes(id) ? f.membros.filter((m) => m !== id) : [...f.membros, id],
    }));
  };

  // Validar se já existe um reforço do mesmo tipo/congregação no mesmo mês
  const validateReforco = (data: string, tipo: Reforco['tipo'], congregacaoId: string): string | null => {
    if (!data) return null;

    const selectedDate = new Date(data + 'T12:00:00');
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const conflicting = reforcos.find((r) => {
      const reforcoDate = new Date(r.data + 'T12:00:00');
      return (
        reforcoDate.getMonth() === selectedMonth &&
        reforcoDate.getFullYear() === selectedYear &&
        r.tipo === tipo &&
        r.congregacaoId === congregacaoId
      );
    });

    if (conflicting) {
      const congNome = congregacoes.find((c) => c.id === congregacaoId)?.nome || 'Congregação';
      return `Já existe um reforço de ${tipo} para ${congNome} em ${selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}. Apenas um reforço por tipo de culto por mês é permitido.`;
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.data || !form.congregacaoId) return;

    const error = validateReforco(form.data, form.tipo, form.congregacaoId);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    adicionar(form);
    setForm({ data: '', tipo: 'Culto', congregacaoId: '', membros: [], membrosOutrasLocalidades: [], observacoes: '' });
    setShowOutraLocalidade(false);
    setNovoMembroOutraLocalidade({ nome: '', localidade: '' });
    setOpen(false);
  };

  const getCongNome = (id: string) => congregacoes.find((c) => c.id === id)?.nome || '—';
  const getMembroNome = (id: string) => membros.find((m) => m.id === id)?.nome || '—';

  // Ordenar reforços por data e depois por congregação
  const reforçosOrdenados = [...reforcos]
    .sort((a, b) => {
      const dateCmp = new Date(a.data).getTime() - new Date(b.data).getTime();
      if (dateCmp !== 0) return dateCmp;
      return getCongNome(a.congregacaoId).localeCompare(getCongNome(b.congregacaoId), 'pt-BR');
    });

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Reforços</h1>
            <p className="text-sm text-muted-foreground mt-1">Agendar atendimentos de cultos e RJM</p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setValidationError(null);
              setShowOutraLocalidade(false);
              setNovoMembroOutraLocalidade({ nome: '', localidade: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Reforço</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Novo Reforço</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input 
                      type="date" 
                      value={form.data} 
                      onChange={(e) => {
                        setForm({ ...form, data: e.target.value });
                        setValidationError(null);
                      }} 
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={form.tipo} 
                      onValueChange={(v) => {
                        setForm({ ...form, tipo: v as Reforco['tipo'] });
                        setValidationError(null);
                      }}
                    >
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
                  <Select 
                    value={form.congregacaoId} 
                    onValueChange={(v) => {
                      setForm({ ...form, congregacaoId: v });
                      setValidationError(null);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {[...congregacoes]
                        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                        .map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {membros.length > 0 && (
                  <div>
                    <Label>Irmãos</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto rounded-lg border border-border p-3">
                      {[...membros]
                        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                        .map((m) => (
                        <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={form.membros.includes(m.id)}
                            onCheckedChange={() => toggleMembro(m.id)}
                          />
                          <span className="text-foreground">{m.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={showOutraLocalidade}
                      onCheckedChange={setShowOutraLocalidade}
                    />
                    <span className="text-sm font-medium">Irmão de outra localidade</span>
                  </label>
                </div>
                {showOutraLocalidade && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <Label className="text-sm">Nome do Irmão</Label>
                      <Input
                        placeholder="Digite o nome"
                        value={novoMembroOutraLocalidade.nome}
                        onChange={(e) => setNovoMembroOutraLocalidade({ ...novoMembroOutraLocalidade, nome: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Localidade</Label>
                      <Input
                        placeholder="Digite a localidade"
                        value={novoMembroOutraLocalidade.localidade}
                        onChange={(e) => setNovoMembroOutraLocalidade({ ...novoMembroOutraLocalidade, localidade: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (novoMembroOutraLocalidade.nome && novoMembroOutraLocalidade.localidade) {
                            setForm({
                              ...form,
                              membrosOutrasLocalidades: [...form.membrosOutrasLocalidades, novoMembroOutraLocalidade],
                            });
                            setNovoMembroOutraLocalidade({ nome: '', localidade: '' });
                          }
                        }}
                        className="w-full"
                      >
                        + Adicionar Irmão
                      </Button>
                    </div>
                    {form.membrosOutrasLocalidades.length > 0 && (
                      <div className="col-span-2 space-y-2">
                        {form.membrosOutrasLocalidades.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border text-sm">
                            <div>
                              <span className="font-medium">{m.nome}</span>
                              <span className="text-muted-foreground"> - {m.localidade}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setForm({
                                ...form,
                                membrosOutrasLocalidades: form.membrosOutrasLocalidades.filter((_, i) => i !== idx),
                              })}
                              className="text-destructive hover:text-destructive/80"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
            {reforçosOrdenados.map((r) => (
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
                    {[...r.membros]
                      .map((mid) => ({ mid, nome: getMembroNome(mid) }))
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map(({ mid, nome }) => (
                        <span key={mid} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          {nome}
                        </span>
                    ))}
                    {r.membrosOutrasLocalidades && r.membrosOutrasLocalidades.map((m, idx) => (
                      <span key={`outro-${idx}`} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                        {m.nome} ({m.localidade})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar com tabela de reforços */}
      <div className="w-96 hidden xl:block">
        <Card className="sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Reforços Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            {reforçosOrdenados.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum reforço agendado</p>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {reforçosOrdenados.map((r) => (
                  <div key={r.id} className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${r.tipo === 'Culto' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/20 text-accent-foreground border-accent/30'}`}
                      >
                        {r.tipo}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {getCongNome(r.congregacaoId)}
                    </div>
                    {r.membros.length > 0 && (
                      <div className="pt-1.5 border-t border-border">
                        <p className="text-muted-foreground text-xs font-medium mb-1">Escalados:</p>
                        <div className="flex flex-wrap gap-1">
                          {[...r.membros]
                            .map((mid) => ({ mid, nome: getMembroNome(mid) }))
                            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                            .map(({ mid, nome }) => (
                              <span key={mid} className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                {nome}
                              </span>
                            ))}
                          {r.membrosOutrasLocalidades && r.membrosOutrasLocalidades.map((m, idx) => (
                            <span key={`outro-${idx}`} className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-xs">
                              {m.nome} ({m.localidade})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.observacoes && (
                      <div className="pt-1.5 border-t border-border text-muted-foreground italic">
                        {r.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
