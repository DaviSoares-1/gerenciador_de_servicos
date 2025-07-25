import jsPDF from "jspdf"

export const generateRelatorioDiarioPDF = ({
	totalServicosPrestados,
	valoresRecebidos,
	valoresCantina,
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
		doc.setFontSize(24)
		doc.text(
			"ORDEM DE SERVIÇO JJ LAVA-JATO LTDA",
			105,
			y,
			null,
			null,
			"center"
		)
		y += 10
		doc.setFontSize(14)
		const dataAtual = new Date().toLocaleString("pt-BR")
		doc.text(`Gerado em: ${dataAtual}`, 105, y, null, null, "center")
		y = 25
		doc.setLineWidth(0.5)
		doc.line(10, y, 200, y)
		y += 14
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
	addSectionTitle("QUANTIDADE DE VEÍCULOS")
	addLine(`• Total de serviços prestados: ${totalServicosPrestados}`)

	// Valores recebidos
	addSectionTitle("VALORES RECEBIDOS")
	addLine(`• Dinheiro: ${formatBRL(valoresRecebidos.Dinheiro)}`)
	addLine(
		`• Cartão de Crédito/Débito: ${formatBRL(
			valoresRecebidos["Cartão de Crédito/Débito"]
		)}`
	)
	addLine(`• PIX: ${formatBRL(valoresRecebidos.PIX)}`)
	addLine(`• Caixinha: ${formatBRL(valoresRecebidos.Caixinha)}`)
	addLine(`• Total Recebido: ${formatBRL(valoresRecebidos.total)}`)

	// Vendas da Cantina
	addSectionTitle("VENDAS DA CANTINA")
	addLine(`• Dinheiro: ${formatBRL(valoresCantina.Dinheiro)}`)
	addLine(
		`• Cartão de Crédito/Débito: ${formatBRL(
			valoresCantina["Cartão de Crédito/Débito"]
		)}`
	)
	addLine(`• PIX: ${formatBRL(valoresCantina.PIX)}`)
	addLine(`• Total Recebido: ${formatBRL(valoresCantina.total)}`)

	// Gastos
	addSectionTitle("GASTOS DIÁRIOS")
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
