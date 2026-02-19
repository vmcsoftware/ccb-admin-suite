import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useResultadosBatismo, useResultadosSantaCeia, useResultadosEnsaioRegional, useCongregacoes } from '@/hooks/useData';
import { ResultadoBatismo, ResultadoSantaCeia, ResultadoEnsaioRegional } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Resultados() {
  const { resultados: batismos, adicionar: adicionarBatismo, remover: removerBatismo } = useResultadosBatismo();
  const { resultados: santaceias, adicionar: adicionarSantaCeia, remover: removerSantaCeia } = useResultadosSantaCeia();
  const { resultados: ensaios, adicionar: adicionarEnsaio, remover: removerEnsaio } = useResultadosEnsaioRegional();
  const { congregacoes } = useCongregacoes();

  const [activeTab, setActiveTab] = useState('batismo');

  // Estados para Batismo
  const [openBatismo, setOpenBatismo] = useState(false);
  const [formBatismo, setFormBatismo] = useState({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
  const [editingBatismo, setEditingBatismo] = useState<string | null>(null);

  // Estados para Santa Ceia
  const [openSantaCeia, setOpenSantaCeia] = useState(false);
  const [formSantaCeia, setFormSantaCeia] = useState({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
  const [editingSantaCeia, setEditingSantaCeia] = useState<string | null>(null);

  // Estados para Ensaio Regional
  const [openEnsaio, setOpenEnsaio] = useState(false);
  const [formEnsaio, setFormEnsaio] = useState({ data: '', titulo: '', local: '', musicos: [], organistas: 0, observacoes: '' });
  const [editingEnsaio, setEditingEnsaio] = useState<string | null>(null);
  const [novoMusico, setNovoMusico] = useState({ nome: '', instrumento: '', localidade: '' });

  const getCongregacaoNome = (id: string) => {
    const cong = congregacoes.find((c) => c.id === id);
    return cong?.nome || '—';
  };

  // Handlers Batismo
  const handleSubmitBatismo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBatismo.data || !formBatismo.congregacaoId) return;

    if (editingBatismo) {
      await removerBatismo(editingBatismo);
    }

    await adicionarBatismo({
      ...formBatismo,
      irmaos: Number(formBatismo.irmaos),
      irmas: Number(formBatismo.irmas),
    } as ResultadoBatismo);

    setFormBatismo({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
    setEditingBatismo(null);
    setOpenBatismo(false);
  };

  // Handlers Santa Ceia
  const handleSubmitSantaCeia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSantaCeia.data || !formSantaCeia.congregacaoId) return;

    if (editingSantaCeia) {
      await removerSantaCeia(editingSantaCeia);
    }

    await adicionarSantaCeia({
      ...formSantaCeia,
      irmaos: Number(formSantaCeia.irmaos),
      irmas: Number(formSantaCeia.irmas),
    } as ResultadoSantaCeia);

    setFormSantaCeia({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
    setEditingSantaCeia(null);
    setOpenSantaCeia(false);
  };

  // Handlers Ensaio Regional
  const handleSubmitEnsaio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEnsaio.data || !formEnsaio.titulo || !formEnsaio.local) return;

    if (editingEnsaio) {
      await removerEnsaio(editingEnsaio);
    }

    await adicionarEnsaio({
      ...formEnsaio,
      organistas: Number(formEnsaio.organistas),
    } as ResultadoEnsaioRegional);

    setFormEnsaio({ data: '', titulo: '', local: '', musicos: [], organistas: 0, observacoes: '' });
    setEditingEnsaio(null);
    setOpenEnsaio(false);
  };

  const adicionarMusico = () => {
    if (!novoMusico.nome || !novoMusico.instrumento) return;
    setFormEnsaio({
      ...formEnsaio,
      musicos: [
        ...formEnsaio.musicos,
        { id: `musico_${Date.now()}`, ...novoMusico },
      ],
    });
    setNovoMusico({ nome: '', instrumento: '', localidade: '' });
  };

  const removerMusico = (id: string) => {
    setFormEnsaio({
      ...formEnsaio,
      musicos: formEnsaio.musicos.filter((m: any) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
        <p className="text-sm text-muted-foreground mt-1">Registro de resultados de eventos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batismo">Batismo</TabsTrigger>
          <TabsTrigger value="santaceia">Santa Ceia</TabsTrigger>
          <TabsTrigger value="ensaio">Ensaios Regionais</TabsTrigger>
        </TabsList>

        {/* TAB: Batismo */}
        <TabsContent value="batismo" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resultados de Batismo</h2>
            <Dialog open={openBatismo} onOpenChange={setOpenBatismo}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setFormBatismo({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
                    setEditingBatismo(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Resultado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBatismo ? 'Editar Batismo' : 'Novo Batismo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitBatismo} className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={formBatismo.data} onChange={(e) => setFormBatismo({ ...formBatismo, data: e.target.value })} />
                  </div>
                  <div>
                    <Label>Congregação</Label>
                    <Select value={formBatismo.congregacaoId} onValueChange={(v) => setFormBatismo({ ...formBatismo, congregacaoId: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {congregacoes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Irmãos</Label>
                      <Input type="number" min="0" value={formBatismo.irmaos} onChange={(e) => setFormBatismo({ ...formBatismo, irmaos: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Irmãs</Label>
                      <Input type="number" min="0" value={formBatismo.irmas} onChange={(e) => setFormBatismo({ ...formBatismo, irmas: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Input value={formBatismo.observacoes} onChange={(e) => setFormBatismo({ ...formBatismo, observacoes: e.target.value })} placeholder="Opcional" />
                  </div>
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {batismos.map((batismo) => (
              <Card key={batismo.id} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{getCongregacaoNome(batismo.congregacaoId)}</p>
                        <Badge variant="outline">{new Date(batismo.data).toLocaleDateString('pt-BR')}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Irmãos</p>
                          <p className="text-lg font-bold text-primary">{batismo.irmaos}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Irmãs</p>
                          <p className="text-lg font-bold text-blue-600">{batismo.irmas}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">{batismo.irmaos + batismo.irmas}</p>
                        </div>
                      </div>
                      {batismo.observacoes && <p className="text-sm text-muted-foreground mt-2">{batismo.observacoes}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormBatismo(batismo);
                          setEditingBatismo(batismo.id);
                          setOpenBatismo(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removerBatismo(batismo.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: Santa Ceia */}
        <TabsContent value="santaceia" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resultados de Santa Ceia</h2>
            <Dialog open={openSantaCeia} onOpenChange={setOpenSantaCeia}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setFormSantaCeia({ data: '', congregacaoId: '', irmaos: 0, irmas: 0, observacoes: '' });
                    setEditingSantaCeia(null);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Resultado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSantaCeia ? 'Editar Santa Ceia' : 'Nova Santa Ceia'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitSantaCeia} className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={formSantaCeia.data} onChange={(e) => setFormSantaCeia({ ...formSantaCeia, data: e.target.value })} />
                  </div>
                  <div>
                    <Label>Congregação</Label>
                    <Select value={formSantaCeia.congregacaoId} onValueChange={(v) => setFormSantaCeia({ ...formSantaCeia, congregacaoId: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {congregacoes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Irmãos</Label>
                      <Input type="number" min="0" value={formSantaCeia.irmaos} onChange={(e) => setFormSantaCeia({ ...formSantaCeia, irmaos: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Irmãs</Label>
                      <Input type="number" min="0" value={formSantaCeia.irmas} onChange={(e) => setFormSantaCeia({ ...formSantaCeia, irmas: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Input value={formSantaCeia.observacoes} onChange={(e) => setFormSantaCeia({ ...formSantaCeia, observacoes: e.target.value })} placeholder="Opcional" />
                  </div>
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {santaceias.map((santaceia) => (
              <Card key={santaceia.id} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{getCongregacaoNome(santaceia.congregacaoId)}</p>
                        <Badge variant="outline">{new Date(santaceia.data).toLocaleDateString('pt-BR')}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Irmãos</p>
                          <p className="text-lg font-bold text-primary">{santaceia.irmaos}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Irmãs</p>
                          <p className="text-lg font-bold text-blue-600">{santaceia.irmas}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">{santaceia.irmaos + santaceia.irmas}</p>
                        </div>
                      </div>
                      {santaceia.observacoes && <p className="text-sm text-muted-foreground mt-2">{santaceia.observacoes}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormSantaCeia(santaceia);
                          setEditingSantaCeia(santaceia.id);
                          setOpenSantaCeia(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removerSantaCeia(santaceia.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: Ensaios Regionais */}
        <TabsContent value="ensaio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resultados de Ensaios Regionais</h2>
            <Dialog open={openEnsaio} onOpenChange={setOpenEnsaio}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setFormEnsaio({ data: '', titulo: '', local: '', musicos: [], organistas: 0, observacoes: '' });
                    setEditingEnsaio(null);
                    setNovoMusico({ nome: '', instrumento: '', localidade: '' });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Resultado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEnsaio ? 'Editar Ensaio' : 'Novo Ensaio Regional'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitEnsaio} className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={formEnsaio.data} onChange={(e) => setFormEnsaio({ ...formEnsaio, data: e.target.value })} />
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input value={formEnsaio.titulo} onChange={(e) => setFormEnsaio({ ...formEnsaio, titulo: e.target.value })} placeholder="Ex: Ensaio Regional de Música" />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input value={formEnsaio.local} onChange={(e) => setFormEnsaio({ ...formEnsaio, local: e.target.value })} placeholder="Ex: Ituiutaba" />
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm mb-3">Músicos</h3>
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Nome" value={novoMusico.nome} onChange={(e) => setNovoMusico({ ...novoMusico, nome: e.target.value })} />
                        <Input placeholder="Instrumento" value={novoMusico.instrumento} onChange={(e) => setNovoMusico({ ...novoMusico, instrumento: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Localidade (opcional)" value={novoMusico.localidade} onChange={(e) => setNovoMusico({ ...novoMusico, localidade: e.target.value })} />
                        <Button type="button" variant="outline" onClick={adicionarMusico}>
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    {formEnsaio.musicos.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {(formEnsaio.musicos as any[]).map((musico: any) => (
                          <div key={musico.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg text-sm">
                            <div>
                              <p className="font-medium">{musico.nome}</p>
                              <p className="text-xs text-muted-foreground">{musico.instrumento} {musico.localidade && `- ${musico.localidade}`}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerMusico(musico.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Organistas</Label>
                    <Input type="number" min="0" value={formEnsaio.organistas} onChange={(e) => setFormEnsaio({ ...formEnsaio, organistas: parseInt(e.target.value) || 0 })} />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Input value={formEnsaio.observacoes} onChange={(e) => setFormEnsaio({ ...formEnsaio, observacoes: e.target.value })} placeholder="Opcional" />
                  </div>
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {ensaios.map((ensaio) => {
              const instrumentos = (ensaio.musicos as any[]).reduce((acc: Record<string, number>, m: any) => {
                acc[m.instrumento] = (acc[m.instrumento] || 0) + 1;
                return acc;
              }, {});

              return (
                <Card key={ensaio.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{ensaio.titulo}</p>
                          <Badge variant="outline">{new Date(ensaio.data).toLocaleDateString('pt-BR')}</Badge>
                          <Badge className="text-xs">{ensaio.local}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Músicos</p>
                            <p className="text-lg font-bold text-primary">{ensaio.musicos.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Organistas</p>
                            <p className="text-lg font-bold text-blue-600">{ensaio.organistas}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-lg font-bold text-foreground">{ensaio.musicos.length + ensaio.organistas}</p>
                          </div>
                        </div>
                        {Object.keys(instrumentos).length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Instrumentos:</p>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(instrumentos).map(([inst, count]: [string, any]) => (
                                <Badge key={inst} variant="secondary" className="text-xs">
                                  {inst}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {ensaio.observacoes && <p className="text-sm text-muted-foreground mt-2">{ensaio.observacoes}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormEnsaio(ensaio);
                            setEditingEnsaio(ensaio.id);
                            setOpenEnsaio(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removerEnsaio(ensaio.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
