import { useState } from 'react';
import { FileText, Download, Calendar as CalIcon } from 'lucide-react';
import { useCongregacoes, useMembros, useReforcos, useEventos } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';

export default function Listas() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { reforcos } = useReforcos();
  const { eventos } = useEventos();

  const [selectedCongs, setSelectedCongs] = useState<string[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<string[]>([]);
  const [incluirReforcos, setIncluirReforcos] = useState(false);
  const [incluirEventos, setIncluirEventos] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const toggleCong = (id: string) => {
    setSelectedCongs((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const toggleMembro = (id: string) => {
    setSelectedMembros((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const getEventosFiltrados = () => {
    let filtered = [...eventos];
    if (dataInicio) filtered = filtered.filter((e) => e.data >= dataInicio);
    if (dataFim) filtered = filtered.filter((e) => e.data <= dataFim);
    return filtered.sort((a, b) => a.data.localeCompare(b.data));
  };

  const getReforcosFiltrados = () => {
    let filtered = [...reforcos];
    if (dataInicio) filtered = filtered.filter((r) => r.data >= dataInicio);
    if (dataFim) filtered = filtered.filter((r) => r.data <= dataFim);
    return filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  };

  const getCongregacaoNome = (id: string) => {
    const congregacao = congregacoes.find((c) => c.id === id);
    if (!congregacao) return '';
    return congregacao.nome.toLowerCase().includes('central')
      ? `${congregacao.nome} (${congregacao.cidade})`
      : congregacao.nome;
  };

  const gerarPDF = () => {
    const congsData = congregacoes
      .filter((c) => selectedCongs.includes(c.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const membrosData = membros
      .filter((m) => selectedMembros.includes(m.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const eventosData = incluirEventos ? getEventosFiltrados() : [];
    const reforcosFiltrados = incluirReforcos ? getReforcosFiltrados() : [];

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > 280) {
        pdf.addPage();
        y = 20;
      }
    };

    // Header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ADMINISTRAÇÃO ITUIUTABA', pageWidth / 2, y, { align: 'center' });
    y += 7;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Congregação Cristã no Brasil', pageWidth / 2, y, { align: 'center' });
    y += 7;
    pdf.setFontSize(9);
    if (dataInicio || dataFim) {
      const periodo = `${dataInicio ? new Date(dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : '—'} a ${dataFim ? new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}`;
      pdf.text(`Período: ${periodo}`, pageWidth / 2, y, { align: 'center' });
      y += 4;
    }
    pdf.text('Lista gerada em ' + new Date().toLocaleDateString('pt-BR'), pageWidth / 2, y, { align: 'center' });
    y += 4;

    // Line
    pdf.setDrawColor(30, 58, 95);
    pdf.setLineWidth(0.5);
    pdf.line(14, y, pageWidth - 14, y);
    y += 10;

    // Congregações
    if (congsData.length > 0) {
      checkPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 95);
      pdf.text('Congregações', 14, y);
      y += 8;
      pdf.setTextColor(0, 0, 0);

      congsData.forEach((c) => {
        checkPage(30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(c.nome, 18, y);
        y += 5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        if (c.endereco || c.bairro) {
          pdf.text(`Endereço: ${c.endereco}, ${c.bairro} - ${c.cidade}`, 22, y);
          y += 4;
        }
        if (c.diasCultos) { pdf.text(`Cultos: ${c.diasCultos}`, 22, y); y += 4; }
        if (c.diasRJM) { pdf.text(`RJM: ${c.diasRJM}`, 22, y); y += 4; }
        if (c.diasEnsaios) { pdf.text(`Ensaios: ${c.diasEnsaios}`, 22, y); y += 4; }
        y += 3;
      });
      y += 4;
    }

    // Eventos Agendados
    if (eventosData.length > 0) {
      checkPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 95);
      pdf.text('Eventos Agendados', 14, y);
      y += 8;
      pdf.setTextColor(0, 0, 0);

      eventosData.forEach((e) => {
        checkPage(16);
        const cong = congregacoes.find((c) => c.id === e.congregacaoId);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const dataFormatada = new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR');
        const horario = e.horario ? ` ${e.horario}` : '';
        const subtipo = e.subtipoReuniao || e.tipo;
        const congNome = cong ? (cong.nome.toLowerCase().includes('central') ? `${cong.nome} (${cong.cidade})` : cong.nome) : '—';
        pdf.text(`${dataFormatada}${horario} — ${subtipo} — ${congNome}`, 18, y);
        y += 5;
        if (e.anciaoAtende) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Ancião: ${e.anciaoAtende}`, 22, y);
          y += 4;
        }
        if (e.diaconoResponsavel) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Diácono: ${e.diaconoResponsavel}`, 22, y);
          y += 4;
        }
        y += 2;
      });
      y += 4;
    }

    // Ministério
    if (membrosData.length > 0) {
      checkPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 95);
      pdf.text('Ministério', 14, y);
      y += 8;
      pdf.setTextColor(0, 0, 0);

      // Table header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(240, 240, 245);
      pdf.rect(14, y - 4, pageWidth - 28, 7, 'F');
      pdf.text('Nome', 18, y);
      pdf.text('Ministério', 110, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      membrosData.forEach((m) => {
        checkPage(8);
        pdf.text(m.nome, 18, y);
        pdf.text(m.ministerio, 110, y);
        y += 5;
      });
      y += 6;
    }

    // Reforços
    if (incluirReforcos && reforcosFiltrados.length > 0) {
      checkPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 95);
      pdf.text('Reforços Agendados', 14, y);
      y += 8;
      pdf.setTextColor(0, 0, 0);

      reforcosFiltrados.forEach((r) => {
        checkPage(16);
        const cong = congregacoes.find((c) => c.id === r.congregacaoId);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const congNome = cong ? (cong.nome.toLowerCase().includes('central') ? `${cong.nome} (${cong.cidade})` : cong.nome) : '—';
        pdf.text(`${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')} — ${r.tipo} — ${congNome}`, 18, y);
        y += 5;
        if (r.membros.length > 0) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const nomes = [...r.membros]
            .map((id) => ({ id, nome: membros.find((m) => m.id === id)?.nome || '—' }))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
            .map((m) => m.nome);
          pdf.text(`Escalados: ${nomes.join(', ')}`, 22, y);
          y += 5;
        }
        y += 3;
      });
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
    }

    pdf.save(`lista-ccb-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const hasSelection = selectedCongs.length > 0 || selectedMembros.length > 0 || incluirReforcos || incluirEventos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Listas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione os dados para gerar uma lista exportável
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Congregações */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold font-display text-foreground">Congregações</h3>
          {congregacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma congregação cadastrada.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
      <div className="glass-card rounded-xl p-5 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={incluirEventos} onCheckedChange={(v) => setIncluirEventos(!!v)} />
          <span className="font-semibold font-display text-foreground">Incluir Eventos Agendados</span>
          <span className="text-sm text-muted-foreground">({eventos.length})</span>
        </label>
        
        {incluirEventos && (
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div>
              <Label className="text-xs">Data Início (opcional)</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data Fim (opcional)</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Filtro de Período para Reforços */}
      {incluirReforcos && (
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold font-display text-foreground text-sm">Filtrar Reforços por Período</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data Início (opcional)</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data Fim (opcional)</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Preview e Botões */}
      <div className="flex gap-2">
        <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" /> {showPreview ? 'Ocultar' : 'Visualizar'} Preview
        </Button>
        <Button onClick={gerarPDF} disabled={!hasSelection} className="gap-2">
          <Download className="h-4 w-4" /> Gerar PDF e Baixar
        </Button>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="glass-card rounded-xl p-8 space-y-6 bg-white">
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
      )}
    </div>
  );
}
