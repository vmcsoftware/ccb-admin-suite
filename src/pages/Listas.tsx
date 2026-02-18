import { useState, useRef } from 'react';
import { FileText, Download, Settings } from 'lucide-react';
import { useCongregacoes, useMembros, useReforcos, useEventos } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Listas() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { reforcos } = useReforcos();
  const { eventos } = useEventos();
  const previewRef = useRef<HTMLDivElement>(null);

  const [aba, setAba] = useState<'dados' | 'filtros' | 'preview'>('dados');
  const [selectedCongs, setSelectedCongs] = useState<string[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<string[]>([]);
  const [incluirReforcos, setIncluirReforcos] = useState(false);
  const [incluirEventos, setIncluirEventos] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroTiposReunioes, setFiltroTiposReunioes] = useState<string[]>([]);
  const [filtroTiposEventos, setFiltroTiposEventos] = useState<string[]>([]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Listas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize e exporte dados de congregações, eventos e reforços
        </p>
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
