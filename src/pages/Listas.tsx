import { useState, useRef, useEffect } from 'react';
import { FileText, Download, Settings, Eye, Edit2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useCongregacoes, useMembros, useReforcos, useEventos } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Categoria {
  id: string;
  nome: string;
}

interface Lista {
  id: string;
  nome: string;
  mes: number;
  ano: number;
  ativa: boolean;
  data: string;
  dataInicio?: string;
  dataFim?: string;
  categorias: Categoria[];
}

export default function Listas() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { reforcos } = useReforcos();
  const { eventos } = useEventos();
  const previewRef = useRef<HTMLDivElement>(null);

  const [tela, setTela] = useState<'inicial' | 'formulario' | 'editor' | 'gerenciar'>('inicial');
  const [listas, setListas] = useState<Lista[]>([]);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [listaEditando, setListaEditando] = useState<Lista | null>(null);
  const [categoriasFiltro, setCategoriasFiltro] = useState('todas');
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  // Estado do formulário de nova lista
  const [formLista, setFormLista] = useState({
    nome: 'Lista de Batismos e Diversos',
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
    dataInicio: new Date().toISOString().slice(0, 10),
    dataFim: new Date().toISOString().slice(0, 10),
  });

  // Estado do editor
  const [aba, setAba] = useState<'dados' | 'filtros' | 'preview'>('dados');
  const [selectedCongs, setSelectedCongs] = useState<string[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<string[]>([]);
  const [incluirReforcos, setIncluirReforcos] = useState(false);
  const [incluirEventos, setIncluirEventos] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroTiposReunioes, setFiltroTiposReunioes] = useState<string[]>([]);
  const [filtroTiposEventos, setFiltroTiposEventos] = useState<string[]>([]);

  // Estado da tela gerenciar
  const [abaGerenciar, setAbaGerenciar] = useState<'reunioes' | 'avisos' | 'preview'>('reunioes');
  const [filtroSetorGerenciar, setFiltroSetorGerenciar] = useState('todos');
  const [filtroCategoriasGerenciar, setFiltroCategoriasGerenciar] = useState('todas');

  // Carregar listas do localStorage
  useEffect(() => {
    const listasArmazenadas = localStorage.getItem('listas-ccb');
    if (listasArmazenadas) {
      try {
        setListas(JSON.parse(listasArmazenadas));
      } catch (e) {
        console.error('Erro ao carregar listas:', e);
      }
    }
  }, []);

  // Salvar listas no localStorage
  useEffect(() => {
    localStorage.setItem('listas-ccb', JSON.stringify(listas));
  }, [listas]);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const novaLista = () => {
    setFormLista({
      nome: 'Lista de Batismos e Diversos',
      mes: new Date().getMonth(),
      ano: new Date().getFullYear(),
      dataInicio: new Date().toISOString().slice(0, 10),
      dataFim: new Date().toISOString().slice(0, 10),
    });
    setTela('formulario');
  };

  const salvarFormularioLista = () => {
    const novaLista: Lista = {
      id: Date.now().toString(),
      nome: formLista.nome,
      mes: formLista.mes,
      ano: formLista.ano,
      ativa: true,
      data: new Date().toISOString().slice(0, 10),
      categorias: [],
    };
    setListaEditando(novaLista);
    setTela('gerenciar');
    setCategoriasFiltro('todas');
    setNovaCategoriaNome('');
    setAbaGerenciar('reunioes');
    setFiltroSetorGerenciar('todos');
    setFiltroCategoriasGerenciar('todas');
    resetFormulario();
  };

  const editarLista = (lista: Lista) => {
    setListaEditando(lista);
    setAbaGerenciar('reunioes');
    setFiltroSetorGerenciar('todos');
    setFiltroCategoriasGerenciar('todas');
    setTela('editor');
  };

  const deletarLista = (id: string) => {
    setListas((prev) => prev.filter((l) => l.id !== id));
  };

  const salvarLista = () => {
    if (!listaEditando) return;
    if (listaEditando.id && listas.find((l) => l.id === listaEditando.id)) {
      setListas((prev) => prev.map((l) => (l.id === listaEditando.id ? listaEditando : l)));
    } else {
      setListas((prev) => [...prev, listaEditando]);
    }
    setTela('gerenciar');
    setCategoriasFiltro('todas');
    setNovaCategoriaNome('');
    setAbaGerenciar('reunioes');
    setFiltroSetorGerenciar('todos');
    setFiltroCategoriasGerenciar('todas');
  };

  const adicionarCategoria = () => {
    if (!listaEditando || !novaCategoriaNome.trim()) return;
    const novaCategoria: Categoria = {
      id: Date.now().toString(),
      nome: novaCategoriaNome,
    };
    setListaEditando((prev) =>
      prev
        ? { ...prev, categorias: [...prev.categorias, novaCategoria] }
        : null
    );
    setNovaCategoriaNome('');
  };

  const removerCategoria = (id: string) => {
    setListaEditando((prev) =>
      prev
        ? { ...prev, categorias: prev.categorias.filter((c) => c.id !== id) }
        : null
    );
  };

  const editarCategoria = (id: string, nome: string) => {
    setListaEditando((prev) =>
      prev
        ? {
            ...prev,
            categorias: prev.categorias.map((c) =>
              c.id === id ? { ...c, nome } : c
            ),
          }
        : null
    );
  };

  const listasFiltradas = listas.filter((l) => l.ano === anoFiltro).sort((a, b) => a.mes - b.mes);

  const resetFormulario = () => {
    setSelectedCongs([]);
    setSelectedMembros([]);
    setIncluirReforcos(false);
    setIncluirEventos(false);
    setDataInicio('');
    setDataFim('');
    setFiltroTiposReunioes([]);
    setFiltroTiposEventos([]);
    setAbaGerenciar('reunioes');
    setFiltroSetorGerenciar('todos');
    setFiltroCategoriasGerenciar('todas');
  };

  const tiposReunioesDisponiveis = ['Batismo', 'Santa-Ceia', 'Reunião para Mocidade', 'Busca dos Dons', 'Reunião Setorial', 'Reunião Ministerial', 'Reunião Extra', 'Culto para Jovens', 'Ensaio Regional', 'Ordenação'];
  const tiposEventosDisponiveis = ['Culto', 'RJM', 'Ensaio', 'Jovens', 'Outro'];
  const tiposReforcoDisponiveis = ['Culto', 'RJM'];

  const toggleCong = (id: string) => {
    setSelectedCongs((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const toggleMembro = (id: string) => {
    setSelectedMembros((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const toggleFiltroTipoReuniao = (tipo: string) => {
    setFiltroTiposReunioes((s) => (s.includes(tipo) ? s.filter((i) => i !== tipo) : [...s, tipo]));
  };

  const toggleFiltroTipoEvento = (tipo: string) => {
    setFiltroTiposEventos((s) => (s.includes(tipo) ? s.filter((i) => i !== tipo) : [...s, tipo]));
  };

  const getEventosFiltrados = () => {
    let filtered = [...eventos];
    if (dataInicio) filtered = filtered.filter((e) => e.data >= dataInicio);
    if (dataFim) filtered = filtered.filter((e) => e.data <= dataFim);
    if (filtroTiposEventos.length > 0) {
      filtered = filtered.filter((e) => filtroTiposEventos.includes(e.tipo));
    }
    if (filtroTiposReunioes.length > 0) {
      filtered = filtered.filter((e) => e.subtipoReuniao && filtroTiposReunioes.includes(e.subtipoReuniao));
    }
    return filtered.sort((a, b) => a.data.localeCompare(b.data));
  };

  const getReforcosFiltrados = () => {
    let filtered = [...reforcos];
    if (dataInicio) filtered = filtered.filter((r) => r.data >= dataInicio);
    if (dataFim) filtered = filtered.filter((r) => r.data <= dataFim);
    if (tiposReforcoDisponiveis.length > 0 && filtroTiposEventos.length > 0) {
      filtered = filtered.filter((r) => filtroTiposEventos.includes(r.tipo));
    }
    return filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  };

  const getCongregacaoNome = (id: string) => {
    const congregacao = congregacoes.find((c) => c.id === id);
    if (!congregacao) return '';
    return congregacao.nome.toLowerCase().includes('central')
      ? `${congregacao.nome} (${congregacao.cidade})`
      : congregacao.nome;
  };

  const gerarPDF = async () => {
    if (!previewRef.current) return;
    
    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 5;
      
      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`lista-ccb-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const hasSelection = selectedCongs.length > 0 || selectedMembros.length > 0 || incluirReforcos || incluirEventos;

  // TELA: FORMULÁRIO NOVA LISTA
  if (tela === 'formulario') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setTela('inicial')}
        />
        
        {/* Modal */}
        <div className="relative glass-card rounded-2xl p-8 w-full max-w-md shadow-2xl border border-border/50">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-foreground">Nova Lista</h2>
            <p className="text-sm text-muted-foreground mt-1">Crie uma nova lista de eventos</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Nome da Lista */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Nome da Lista</Label>
              <Input
                value={formLista.nome}
                onChange={(e) => setFormLista({ ...formLista, nome: e.target.value })}
                placeholder="Lista de Batismos e Diversos"
                className="w-full"
              />
            </div>

            {/* Mês e Ano - Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Mês</Label>
                <select
                  value={formLista.mes}
                  onChange={(e) => setFormLista({ ...formLista, mes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {meses.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Ano</Label>
                <select
                  value={formLista.ano}
                  onChange={(e) => setFormLista({ ...formLista, ano: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data Início e Fim - Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Data Início</Label>
                <Input
                  type="date"
                  value={formLista.dataInicio}
                  onChange={(e) => setFormLista({ ...formLista, dataInicio: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Data Fim</Label>
                <Input
                  type="date"
                  value={formLista.dataFim}
                  onChange={(e) => setFormLista({ ...formLista, dataFim: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button
              onClick={() => setTela('inicial')}
              variant="outline"
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              onClick={salvarFormularioLista}
              className="flex-1 gap-2"
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Funções auxiliares para gerenciar
  const eventosSalvos = eventos.filter(e => {
    if (listaEditando?.dataInicio) {
      const eventoDate = e.data;
      const dataInicio = listaEditando?.dataInicio ? new Date(listaEditando.dataInicio + 'T00:00:00') : null;
      const dataFim = listaEditando?.dataFim ? new Date(listaEditando.dataFim + 'T23:59:59') : null;
      if (dataInicio && eventoDate < new Date(dataInicio).toISOString().slice(0, 10)) return false;
      if (dataFim && eventoDate > new Date(dataFim).toISOString().slice(0, 10)) return false;
    }
    return true;
  }).sort((a, b) => a.data.localeCompare(b.data));

  const eventosReuniao = eventosSalvos.filter(e => e.subtipoReuniao);
  const eventosAvisos = eventosSalvos.filter(e => !e.subtipoReuniao);

  const tiposEventosUnicos = [...new Set(eventosAvisos.map(e => e.tipo))].sort();

  // TELA: GERENCIAR CATEGORIAS
  if (tela === 'gerenciar' && listaEditando) {
    const categoriasFiltradas = categoriasFiltro === 'todas' ? listaEditando.categorias : listaEditando.categorias.filter(c => c.nome === categoriasFiltro);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setTela('inicial'); setListaEditando(null); }}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold font-display text-foreground">
            {meses[listaEditando.mes]} de {listaEditando.ano}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Atualizar
            </Button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => setAbaGerenciar('reunioes')}
            className={`px-4 py-2 font-medium ${
              abaGerenciar === 'reunioes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reuniões
          </button>
          <button
            onClick={() => setAbaGerenciar('avisos')}
            className={`px-4 py-2 font-medium ${
              abaGerenciar === 'avisos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Avisos
          </button>
          <button
            onClick={() => setAbaGerenciar('preview')}
            className={`px-4 py-2 font-medium ${
              abaGerenciar === 'preview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>

        {/* ABA: REUNIÕES */}
        {abaGerenciar === 'reunioes' && (
          <div className="space-y-6">
            {/* SEÇÃO: EVENTOS IMPORTADOS */}
            {eventosReuniao.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Eventos Agendados Importados</h3>
                  <Badge variant="secondary">{eventosReuniao.length} eventos</Badge>
                </div>

                {[...new Set(eventosReuniao.map(e => e.subtipoReuniao))].sort().map((tipoReuniao) => {
                  const eventosPorTipo = eventosReuniao.filter(e => e.subtipoReuniao === tipoReuniao);
                  return (
                    <div key={tipoReuniao} className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground uppercase">{tipoReuniao}</h4>
                      <div className="glass-card rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border">
                              <th className="px-4 py-2 text-left">Data</th>
                              <th className="px-4 py-2 text-left">Hora</th>
                              <th className="px-4 py-2 text-left">Localidade</th>
                              <th className="px-4 py-2 text-left">Responsável</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventosPorTipo.map((e) => (
                              <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                                <td className="px-4 py-2">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-2">{e.horario || '—'}</td>
                                <td className="px-4 py-2">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                                <td className="px-4 py-2">{e.anciaoAtende || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {eventosReuniao.length === 0 && (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Nenhum evento agendado para este período.</p>
              </div>
            )}

            {/* DIVISOR */}
            {eventosReuniao.length > 0 && (
              <div className="border-t border-border pt-6" />
            )}

            {/* SEÇÃO: GERENCIAMENTO DE CATEGORIAS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Categorias da Lista</h3>

              {/* Filtro e Botão */}
              <div className="flex items-center justify-between">
                <select
                  value={categoriasFiltro}
                  onChange={(e) => setCategoriasFiltro(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todas">Todas</option>
                  {[...new Set(listaEditando.categorias.map(c => c.nome))].map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
                <Button className="gap-2">
                  Nova Categoria
                </Button>
              </div>

              {/* Lista de Categorias */}
              <div className="space-y-2">
                {categoriasFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma categoria adicionada
                  </div>
                ) : (
                  categoriasFiltradas.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 glass-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded border border-border" />
                        <span className="font-medium text-foreground">{cat.nome}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removerCategoria(cat.id)}
                          className="px-3 py-1.5 rounded text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Remover
                        </button>
                        <button
                          className="px-3 py-1.5 rounded text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" /> Editar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Nova Categoria */}
              <div className="glass-card rounded-xl p-5 space-y-3">
                <Label className="font-semibold text-foreground">Adicionar Nova Categoria</Label>
                <div className="flex gap-2">
                  <Input
                    value={novaCategoriaNome}
                    onChange={(e) => setNovaCategoriaNome(e.target.value)}
                    placeholder="Nome da categoria (ex: Batismos)"
                    onKeyPress={(e) => e.key === 'Enter' && adicionarCategoria()}
                  />
                  <Button onClick={adicionarCategoria}>Adicionar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: AVISOS */}
        {abaGerenciar === 'avisos' && (
          <div className="space-y-4">
            {eventosAvisos.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-muted-foreground">Nenhum aviso agendado para este período.</p>
              </div>
            ) : (
              <>
                {tiposEventosUnicos.map((tipo) => {
                  const eventosPorTipo = eventosAvisos.filter(e => e.tipo === tipo);
                  return (
                    <div key={tipo} className="space-y-2">
                      <h4 className="font-bold text-sm text-foreground uppercase">{tipo}</h4>
                      <div className="glass-card rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border">
                              <th className="px-4 py-2 text-left">Data</th>
                              <th className="px-4 py-2 text-left">Hora</th>
                              <th className="px-4 py-2 text-left">Localidade</th>
                              <th className="px-4 py-2 text-left">Responsável</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventosPorTipo.map((e) => (
                              <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                                <td className="px-4 py-2">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-2">{e.horario || '—'}</td>
                                <td className="px-4 py-2">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                                <td className="px-4 py-2">{e.anciaoAtende || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ABA: PREVIEW */}
        {abaGerenciar === 'preview' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <select
                value={filtroSetorGerenciar}
                onChange={(e) => setFiltroSetorGerenciar(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos setores</option>
                {congregacoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCongregacaoNome(c.id)}
                  </option>
                ))}
              </select>
              <select
                value={filtroCategoriasGerenciar}
                onChange={(e) => setFiltroCategoriasGerenciar(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todas">Todas categorias</option>
                {[...new Set(eventosSalvos.map(e => e.subtipoReuniao || e.tipo))].
                  filter(Boolean)
                  .sort()
                  .map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
              </select>
            </div>

            {/* Tabela de eventos */}
            {eventosSalvos.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-muted-foreground">Nenhum evento agendado para este período.</p>
              </div>
            ) : (
              <div className="glass-card rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-2 text-left">Data</th>
                      <th className="px-4 py-2 text-left">Hora</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Localidade</th>
                      <th className="px-4 py-2 text-left">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosSalvos
                      .filter((e) =>
                        (filtroSetorGerenciar === 'todos' || e.congregacaoId === filtroSetorGerenciar) &&
                        (filtroCategoriasGerenciar === 'todas' || e.subtipoReuniao === filtroCategoriasGerenciar || e.tipo === filtroCategoriasGerenciar)
                      )
                      .map((e) => (
                        <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-2">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-2">{e.horario || '—'}</td>
                          <td className="px-4 py-2 font-medium">{e.subtipoReuniao || e.tipo}</td>
                          <td className="px-4 py-2">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                          <td className="px-4 py-2">{e.anciaoAtende || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setTela('inicial'); setListaEditando(null); }}>
            Cancelar
          </Button>
          <Button onClick={() => { const novaListaAtualizada = listaEditando; setListas((prev) => prev.map((l) => l.id === novaListaAtualizada.id ? novaListaAtualizada : l)); setTela('inicial'); setListaEditando(null); }}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    );
  }

  if (tela === 'inicial') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Listas</h1>
          </div>
          <Button onClick={novaLista} className="gap-2">
            <FileText className="h-4 w-4" /> Nova Lista
          </Button>
        </div>

        {/* Filtro de Ano */}
        <div className="flex items-center gap-4">
          <Label className="font-semibold">Ano</Label>
          <select
            value={anoFiltro}
            onChange={(e) => setAnoFiltro(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela de Listas */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left font-semibold text-foreground">Lista</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Mês</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhuma lista para {anoFiltro}
                  </td>
                </tr>
              ) : (
                listasFiltradas.map((lista) => (
                  <tr key={lista.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 text-foreground">{lista.nome}</td>
                    <td className="px-6 py-3 text-foreground">{meses[lista.mes]} - {lista.ano}</td>
                    <td className="px-6 py-3 text-center">
                      <Badge variant={lista.ativa ? 'default' : 'secondary'}>
                        {lista.ativa ? 'Ativada' : 'Desativada'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editarLista(lista)}
                          className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                          title="Editar lista"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletarLista(lista.id)}
                          className="p-2 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                          title="Deletar lista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (tela === 'editor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Listas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize e exporte dados de congregações, eventos e reforços
            </p>
          </div>
          <Button onClick={() => { setTela('inicial'); setListaEditando(null); }} variant="outline" className="gap-2">
            Voltar
          </Button>
        </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setAba('dados')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            aba === 'dados'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dados
        </button>
        <button
          onClick={() => setAba('filtros')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            aba === 'filtros'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Filtros
        </button>
        <button
          onClick={() => setAba('preview')}
          className={`px-4 py-2 font-medium text-sm transition-all ${
            aba === 'preview'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Preview
        </button>
      </div>

      {/* ABA: DADOS */}
      {aba === 'dados' && (
        <div className="space-y-6">
          {/* Informações da Lista */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h3 className="font-semibold font-display text-foreground">Informações da Lista</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm mb-2 block">Nome da Lista</Label>
                <Input
                  value={listaEditando?.nome || ''}
                  onChange={(e) => setListaEditando((prev) => prev ? { ...prev, nome: e.target.value } : null)}
                  placeholder="Nome da lista"
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Mês</Label>
                <select
                  value={listaEditando?.mes || 0}
                  onChange={(e) => setListaEditando((prev) => prev ? { ...prev, mes: parseInt(e.target.value) } : null)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {meses.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Ano</Label>
                <select
                  value={listaEditando?.ano || new Date().getFullYear()}
                  onChange={(e) => setListaEditando((prev) => prev ? { ...prev, ano: parseInt(e.target.value) } : null)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Congregações */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-semibold font-display text-foreground">Congregações</h3>
            {congregacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma congregação cadastrada.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...congregacoes]
                  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                  .map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selectedCongs.includes(c.id)} onCheckedChange={() => toggleCong(c.id)} />
                    <span className="text-foreground">{c.nome}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Ministério */}
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-semibold font-display text-foreground">Ministério</h3>
            {membros.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum membro cadastrado.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...membros]
                  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                  .map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selectedMembros.includes(m.id)} onCheckedChange={() => toggleMembro(m.id)} />
                    <span className="text-foreground">{m.nome}</span>
                    <span className="text-muted-foreground text-xs">({m.ministerio})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Reforços */}
          <div className="glass-card rounded-xl p-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incluirReforcos} onCheckedChange={(v) => setIncluirReforcos(!!v)} />
              <span className="font-semibold font-display text-foreground">Incluir Reforços Agendados</span>
              <span className="text-sm text-muted-foreground">({reforcos.length})</span>
            </label>
          </div>

          {/* Eventos */}
          <div className="glass-card rounded-xl p-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incluirEventos} onCheckedChange={(v) => setIncluirEventos(!!v)} />
              <span className="font-semibold font-display text-foreground">Incluir Eventos Agendados</span>
              <span className="text-sm text-muted-foreground">({eventos.length})</span>
            </label>
          </div>
        </div>
      )}

      {/* ABA: FILTROS */}
      {aba === 'filtros' && (
        <div className="space-y-6">
          {/* Período */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h3 className="font-semibold font-display text-foreground">Período</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-2 block">Data Início (opcional)</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Data Fim (opcional)</Label>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
            </div>
            {(dataInicio || dataFim) && (
              <p className="text-xs text-muted-foreground pt-2">
                Filtro ativo: {dataInicio ? new Date(dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : '—'} a{' '}
                {dataFim ? new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
              </p>
            )}
          </div>

          {/* Tipos de Reuniões */}
          {incluirEventos && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold font-display text-foreground">Tipos de Reuniões</h3>
                {filtroTiposReunioes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{filtroTiposReunioes.length} selecionados</Badge>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tiposReunioesDisponiveis.map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={filtroTiposReunioes.includes(tipo)}
                      onCheckedChange={() => toggleFiltroTipoReuniao(tipo)}
                    />
                    <span className="text-foreground">{tipo}</span>
                  </label>
                ))}
              </div>
              {filtroTiposReunioes.length > 0 && (
                <Button
                  onClick={() => setFiltroTiposReunioes([])}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  Limpar Filtro de Reuniões
                </Button>
              )}
            </div>
          )}

          {/* Tipos de Eventos */}
          {incluirEventos && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold font-display text-foreground">Tipos de Eventos</h3>
                {filtroTiposEventos.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{filtroTiposEventos.length} selecionados</Badge>
                )}
              </div>
              <div className="space-y-2">
                {tiposEventosDisponiveis.map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={filtroTiposEventos.includes(tipo)}
                      onCheckedChange={() => toggleFiltroTipoEvento(tipo)}
                    />
                    <span className="text-foreground">{tipo}</span>
                  </label>
                ))}
              </div>
              {filtroTiposEventos.length > 0 && (
                <Button
                  onClick={() => setFiltroTiposEventos([])}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  Limpar Filtro de Eventos
                </Button>
              )}
            </div>
          )}

          {/* Tipos de Reforços */}
          {incluirReforcos && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h3 className="font-semibold font-display text-foreground">Tipos de Reforços</h3>
              <div className="space-y-2">
                {tiposReforcoDisponiveis.map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox defaultChecked disabled />
                    <span className="text-foreground">{tipo}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Todos os tipos de reforço estão inclusos</p>
            </div>
          )}

          {/* Botão para limpar todos os filtros */}
          {(filtroTiposReunioes.length > 0 || filtroTiposEventos.length > 0 || dataInicio || dataFim) && (
            <Button
              onClick={() => {
                setFiltroTiposReunioes([]);
                setFiltroTiposEventos([]);
                setDataInicio('');
                setDataFim('');
              }}
              variant="outline"
              className="w-full gap-2"
            >
              <Settings className="h-4 w-4" /> Limpar Todos os Filtros
            </Button>
          )}
        </div>
      )}

      {/* ABA: PREVIEW */}
      {/* ABA: PREVIEW */}
      {aba === 'preview' && (
        <div className="space-y-6">
          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button onClick={gerarPDF} disabled={!hasSelection} className="gap-2">
              <Download className="h-4 w-4" /> Gerar PDF e Baixar
            </Button>
            <Button onClick={salvarLista} className="gap-2">
              <FileText className="h-4 w-4" /> Salvar Lista
            </Button>
          </div>

          {/* Preview Section */}
          <div ref={previewRef} className="glass-card rounded-xl p-8 space-y-6 bg-white">
          {/* Cabeçalho do Documento */}
          <div className="text-center space-y-2 pb-4 border-b-2 border-gray-800">
            <div className="text-sm font-semibold">CONGREGAÇÃO CRISTÃ</div>
            <div className="text-sm font-semibold">NO</div>
            <div className="text-sm font-semibold">BRASIL</div>
            <div className="text-lg font-bold mt-3">LISTA DE BATISMOS E DIVERSOS</div>
            <div className="text-sm font-semibold mt-2">ADMINISTRAÇÃO ITUIUTABA</div>
            {(dataInicio || dataFim) && (
              <div className="text-xs font-semibold mt-1">
                {dataInicio ? new Date(dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : 'Início'} A {dataFim ? new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR') : 'Fim'}
              </div>
            )}
          </div>

          {/* Tabelas por tipo de evento */}
          <div className="space-y-6">
            {/* TODOS OS EVENTOS AGENDADOS */}
            {incluirEventos && getEventosFiltrados().length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-center pb-2 border-b border-gray-400">TODOS OS EVENTOS AGENDADOS</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border border-gray-400">
                      <td className="border border-gray-400 px-2 py-1 font-bold">DATA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">HORA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">TIPO</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">LOCALIDADE</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">RESPONSÁVEL</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getEventosFiltrados()
                      .map((e) => (
                        <tr key={e.id} className="border border-gray-400">
                          <td className="border border-gray-400 px-2 py-1">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.horario || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.subtipoReuniao || e.tipo || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.anciaoAtende || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BATISMO */}
            {incluirEventos && getEventosFiltrados().filter(e => e.subtipoReuniao === 'Batismo').length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-center pb-2 border-b border-gray-400">BATISMO</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border border-gray-400">
                      <td className="border border-gray-400 px-2 py-1 font-bold">DATA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">HORA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">LOCALIDADE</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">ANCIÃO</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getEventosFiltrados()
                      .filter(e => e.subtipoReuniao === 'Batismo')
                      .map((e) => (
                        <tr key={e.id} className="border border-gray-400">
                          <td className="border border-gray-400 px-2 py-1">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.horario || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.anciaoAtende || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SANTA-CEIA */}
            {incluirEventos && getEventosFiltrados().filter(e => e.subtipoReuniao === 'Santa-Ceia').length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-center pb-2 border-b border-gray-400">SANTA-CEIA</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border border-gray-400">
                      <td className="border border-gray-400 px-2 py-1 font-bold">DATA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">HORA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">LOCALIDADE</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">ANCIÃO</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getEventosFiltrados()
                      .filter(e => e.subtipoReuniao === 'Santa-Ceia')
                      .map((e) => (
                        <tr key={e.id} className="border border-gray-400">
                          <td className="border border-gray-400 px-2 py-1">{new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.horario || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{getCongregacaoNome(e.congregacaoId) || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{e.anciaoAtende || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REFORÇO - CULTO OFICIAL */}
            {incluirReforcos && getReforcosFiltrados().filter(r => r.tipo === 'Culto').length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-center pb-2 border-b border-gray-400">REFORÇO - CULTO OFICIAL</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border border-gray-400">
                      <td className="border border-gray-400 px-2 py-1 font-bold">DATA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">HORA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">LOCALIDADE</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">RESPONSÁVEL</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getReforcosFiltrados()
                      .filter(r => r.tipo === 'Culto')
                      .map((r) => (
                        <tr key={r.id} className="border border-gray-400">
                          <td className="border border-gray-400 px-2 py-1">{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.horario || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{getCongregacaoNome(r.congregacaoId) || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.membros.length > 0 ? r.membros.map((id) => membros.find((m) => m.id === id)?.nome || '—').join(', ') : '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* REFORÇO - RJM */}
            {incluirReforcos && getReforcosFiltrados().filter(r => r.tipo === 'RJM').length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-center pb-2 border-b border-gray-400">REFORÇO - RJM</h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border border-gray-400">
                      <td className="border border-gray-400 px-2 py-1 font-bold">DATA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">HORA</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">LOCALIDADE</td>
                      <td className="border border-gray-400 px-2 py-1 font-bold">RESPONSÁVEL</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getReforcosFiltrados()
                      .filter(r => r.tipo === 'RJM')
                      .map((r) => (
                        <tr key={r.id} className="border border-gray-400">
                          <td className="border border-gray-400 px-2 py-1">{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.horario || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{getCongregacaoNome(r.congregacaoId) || '—'}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.membros.length > 0 ? r.membros.map((id) => membros.find((m) => m.id === id)?.nome || '—').join(', ') : '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {incluirEventos && getEventosFiltrados().length === 0 && incluirReforcos && getReforcosFiltrados().length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Nenhum evento ou reforço no período selecionado.</p>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
    );
  }

  return null;
}
