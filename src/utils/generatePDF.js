import jsPDF from "jspdf"

export const generatePDF = async (order) => {
	const doc = new jsPDF()
	let y = 10

	// formatação da Data e Hora;
	const date = order.dataHora.replace(" - ", " / ").replace("T", " ").split("")
	const year = []
	const month = []
	const day = []
	const newFormatDate = []
	for (let i = 0; i < date.length; i++) {
		if (i < 4) {
			year.push(date[i])
		} else if (i > 4 && i < 7) {
			month.push(date[i])
		} else if (i > 7 && i < 10) {
			day.push(date[i])
		}
	}

	// Header & Footer
	const addHeader = () => {
		doc.setFontSize(24)
		doc.text(
			"ORDEM DE SERVIÇO JJ LAVA-JATO LTDA",
			105,
			10,
			null,
			null,
			"center"
		)
		doc.setFontSize(14)
		doc.text("CNPJ: 58.736.525/0001-70", 105, 16, null, null, "center")
		y = 30
	}

	const addFooter = () => {
		doc.setFontSize(15)
		doc.text(`Página ${order.carroNumero}`, 105, 290, null, null, "center")
	}

	// formatação do Valor Total e Caixinha
	const totalPagoFormatado = new Intl.NumberFormat("pr-BR", {
		style: "currency",
		currency: "BRL"
	}).format(+order.total)
	const caixinhaFormatado = new Intl.NumberFormat("pr-BR", {
		style: "currency",
		currency: "BRL"
	}).format(+order.caixinha)
	const cantinaFormatado = new Intl.NumberFormat("pr-BR", {
		style: "currency",
		currency: "BRL"
	}).format(+order.cantina)

	const addLine = (text) => {
		doc.setFontSize(16)
		doc.text(text, 10, y)
		y += 12
	}

	addHeader()

	addLine(`Status: ${order.status.toUpperCase()}`)
	addLine(
		`Data e Hora: ${newFormatDate
			.concat(day, "/", month, "/", year)
			.join("")} - ${date.slice(11).join("")}`
	)
	addLine(`Responsável: ${order.responsavel.toUpperCase().trim()}`)
	addLine(`Carro N°: ${order.carroNumero}`)

	addLine(`Modelo do Carro: ${order.modeloCarro.toUpperCase().trim()}`)
	addLine(`Placa do Carro: ${order.placaCarro.toUpperCase().trim()}`)

	addLine("Tipo de Veículo:")
	order.tipoVeiculo.forEach((s) => addLine(`- ${s}`))

	addLine("Serviços Solicitados:")
	order.servicos.forEach((s) => addLine(`- ${s}`))

	addLine(`Total a Pagar: ${totalPagoFormatado}`)
	addLine(`Caixinha: ${caixinhaFormatado}`)
	addLine(`Cantina: ${cantinaFormatado}`)

	addLine(`Forma de Pagamento: ${order.formaPagamento}`)
	if (order.formaPagamento === "Outros") {
		addLine(`Descrição do Pagamento: `)
		const descricao = (order.descricaoOutros ?? "").toString()
		const descricaoText =
			descricao.charAt(0).toUpperCase() + descricao.slice(1).toLowerCase()
		const descricaoLines = doc.splitTextToSize(descricaoText, 180)

		descricaoLines.forEach((line) => {
			addLine(line)
		})
	}

	addLine("Observações: ")
	if (order.observacoes !== "") {
		const observacoes = (order.observacoes ?? "").toString()
		const obsText =
			observacoes.charAt(0).toUpperCase() + observacoes.slice(1).toLowerCase()
		const observacoesLines = doc.splitTextToSize(obsText, 180)

		observacoesLines.forEach((line) => {
			addLine(line)
		})
	} else {
		addLine("Nenhuma")
	}

	addFooter()

	// Adiciona a imagem da nota fiscal se existir
	if (order.notaFiscalUrl) {
		doc.addPage()
		doc.addImage(order.notaFiscalUrl, "JPEG", 10, 10, 180, 160)
	}

	//doc.save(`VEÍCULO-${order.carroNumero}.pdf`)

	const isHunter = order.tipoVeiculo.includes("Hunter")
	const fileName = `VEÍCULO-${order.carroNumero}${
		isHunter ? "-HUNTER" : ""
	}.pdf`

	doc.save(fileName)
}
