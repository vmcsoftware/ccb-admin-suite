import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useCongregacoes, useMembros, useReforcos } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';

export default function Listas() {
  const { congregacoes } = useCongregacoes();
  const { membros } = useMembros();
  const { reforcos } = useReforcos();

  const [selectedCongs, setSelectedCongs] = useState<string[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<string[]>([]);
  const [incluirReforcos, setIncluirReforcos] = useState(false);

  const toggleCong = (id: string) => {
    setSelectedCongs((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const toggleMembro = (id: string) => {
    setSelectedMembros((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const gerarPDF = () => {
    const congsData = congregacoes
      .filter((c) => selectedCongs.includes(c.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const membrosData = membros
      .filter((m) => selectedMembros.includes(m.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

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
    if (incluirReforcos && reforcos.length > 0) {
      checkPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 95);
      pdf.text('Reforços Agendados', 14, y);
      y += 8;
      pdf.setTextColor(0, 0, 0);

      [...reforcos]
        .sort((a, b) => {
          const dateCmp = new Date(a.data).getTime() - new Date(b.data).getTime();
          if (dateCmp !== 0) return dateCmp;
          const congA = congregacoes.find((c) => c.id === a.congregacaoId)?.nome || '';
          const congB = congregacoes.find((c) => c.id === b.congregacaoId)?.nome || '';
          return congA.localeCompare(congB, 'pt-BR');
        })
        .forEach((r) => {
          checkPage(16);
          const cong = congregacoes.find((c) => c.id === r.congregacaoId);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')} — ${r.tipo} — ${cong?.nome || '—'}`, 18, y);
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

  const hasSelection = selectedCongs.length > 0 || selectedMembros.length > 0 || incluirReforcos;

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

      <Button onClick={gerarPDF} disabled={!hasSelection} className="gap-2">
        <Download className="h-4 w-4" /> Gerar e Baixar Lista
      </Button>
    </div>
  );
}
