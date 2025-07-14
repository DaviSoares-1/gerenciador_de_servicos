// src/utils/RelatorioPDF.js
import jsPDF from "jspdf"

export const generateRelatorioDiarioPDF = ({
	totalServicosPrestados,
	valoresRecebidos,
	gastos
}) => {
	const doc = new jsPDF()
	let y = 10

	const formatBRL = (valor) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL"
		}).format(+valor)

	const addHeader = () => {
		doc.setFontSize(20)
		doc.text("RELATÓRIO DIÁRIO - JJ LAVA-JATO", 105, y, null, null, "center")
		y += 10
		doc.setFontSize(12)
    doc.setLineWidth(0.5)
		doc.line(10, y, 200, y)
		y += 6
		const dataAtual = new Date().toLocaleString("pt-BR")
		doc.text(`Gerado em: ${dataAtual}`, 105, y, null, null, "center")
		y += 10
	}

	const addSectionTitle = (title) => {
		doc.setFontSize(16)
		doc.text(title, 10, y)
		y += 10
	}

	const addLine = (text) => {
		doc.setFontSize(16)
		doc.text(text, 10, y)
		y += 12
		if (y > 280) {
			doc.addPage()
			y = 10
		}
	}

	addHeader()

	// Quantidade de veículos
	addSectionTitle("Quantidade de Veículos")
	addLine(`• Total de serviços prestados: ${totalServicosPrestados}`)

	// Valores recebidos
	addSectionTitle("Valores Recebidos")
	addLine(`• Dinheiro: ${formatBRL(valoresRecebidos.Dinheiro)}`)
	addLine(
		`• Cartão de Crédito/Débito: ${formatBRL(
			valoresRecebidos["Cartão de Crédito/Débito"]
		)}`
	)
	addLine(`• PIX: ${formatBRL(valoresRecebidos.PIX)}`)
	addLine(`• Caixinha: ${formatBRL(valoresRecebidos.Caixinha)}`)
	addLine(`• Cantina: ${formatBRL(valoresRecebidos.Cantina)}`)
	addLine(`• Total Recebido: ${formatBRL(valoresRecebidos.total)}`)

	// Gastos
	addSectionTitle("Gastos Diários")
	if (gastos.length > 0) {
		gastos.forEach((g) => {
			addLine(`• ${g.descricao}: ${formatBRL(g.valor)}`)
		})
		const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0)
		addLine(`• Total de Gastos: ${formatBRL(totalGastos)}`)
	} else {
		addLine("• Nenhum gasto registrado.")
	}

	doc.save("RELATORIO-DIARIO-JJ-LAVAJATO.pdf")
}
