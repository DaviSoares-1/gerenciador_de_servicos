import React, { useState, useMemo, useEffect } from "react"
import useOrders from "../store/useOrders"

function RelatorioDiario() {
	const { orders, deletedOrders } = useOrders()
	const [gastos, setGastos] = useState([])
	const [descricao, setDescricao] = useState("")
	const [valorGasto, setValorGasto] = useState("")
	const [mostrarInputs, setMostrarInputs] = useState(false)
	const [gastoEditandoIndex, setGastoEditandoIndex] = useState(null)
	const [gastoEditado, setGastoEditado] = useState({ descricao: "", valor: 0 })

	// Carrega os gastos do localStorage ao montar o componente
	useEffect(() => {
		const gastosSalvos = JSON.parse(localStorage.getItem("gastosDiarios")) || []
		setGastos(gastosSalvos)
	}, [])

	// Salva os gastos no localStorage sempre que eles forem atualizados
	useEffect(() => {
		localStorage.setItem("gastosDiarios", JSON.stringify(gastos))
	}, [gastos])

	const formatarBRL = (valor) =>
		valor.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL"
		})

	const valoresReceber = useMemo(() => {
		let totalSemFormaPagamento = 0

		orders.forEach((order) => {
			if (order.status === "em processamento" && !order.formaPagamento) {
				totalSemFormaPagamento += parseFloat(order.total || 0) + parseFloat(order.cantina || 0)
			}
		})

		return {
			total: totalSemFormaPagamento
		}
	}, [orders])

	const valoresRecebidos = useMemo(() => {
		const totais = {
			Dinheiro: 0,
			"Cartão de Crédito/Débito": 0,
			PIX: 0,
			Caixinha: 0,
			Cantina: 0,
		}

		const ordensPersistentes =
			JSON.parse(localStorage.getItem("ordensPersistentes")) || {}

		orders.forEach((order) => {
			const id = order.id || order.numero || JSON.stringify(order)
			const valor = parseFloat(order.total || 0)
			const caixinha = parseFloat(order.caixinha || 0)
			const cantina = parseFloat(order.cantina || 0)

			// Se reaberta, zera os valores
			if (order.status !== "processada" || !order.formaPagamento) {
				ordensPersistentes[id] = {
					formaPagamento: "",
					total: 0,
					caixinha: 0,
					cantina: 0,
				}
			}

			// Se processada corretamente, atualiza os valores reais
			if (order.status === "processada" && order.formaPagamento) {
				ordensPersistentes[id] = {
					formaPagamento: order.formaPagamento,
					total: valor,
					caixinha: caixinha,
					cantina: cantina,
				}
			}
		})

		// Soma os totais a partir da lista atualizada
		Object.values(ordensPersistentes).forEach((order) => {
			if (order.formaPagamento && totais.hasOwnProperty(order.formaPagamento)) {
				totais[order.formaPagamento] += order.total + order.cantina
			}
			totais.Caixinha += order.caixinha
		})

		localStorage.setItem(
			"ordensPersistentes",
			JSON.stringify(ordensPersistentes)
		)

		return {
			...totais,
			total: totais.Dinheiro + totais["Cartão de Crédito/Débito"] + totais.PIX,
			persistidas: ordensPersistentes
		}
	}, [orders])

	const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0)
	const totalServicosPrestados = orders.length + deletedOrders.length

	const handleAdicionarGasto = () => {
		if (descricao.trim() && parseFloat(valorGasto) >= 0) {
			setGastos([...gastos, { descricao, valor: parseFloat(valorGasto) }])
			setDescricao("")
			setValorGasto("")
		}
	}

	const handleLimparDados = () => {
		if (
			window.confirm(
				"Tem certeza que deseja limpar todos os dados? Essa ação é irreversível."
			)
		) {
			localStorage.clear()
			setGastos([])
			window.location.reload() // força recarregamento para limpar visualmente os dados
		}
	}

	return (
		<div className="text-slate-900 space-y-6">
			<h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4">
				📊 Relatório Diário 📊
			</h2>

			{/* Quantidade de Veículos */}
			<div className="bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg p-4">
				<h3 className="text-xl font-semibold mb-2">
					🚗 Quantidade de Veículos:
				</h3>
				<ul className="space-y-1">
					<li>
						<span className="font-bold">• Total de serviços prestados: </span>
						{totalServicosPrestados}
					</li>
				</ul>
			</div>

			{/* Valores a Receber */}
			<div className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg p-4">
				<h3 className="text-xl font-semibold mb-2">💸 Valores a Receber:</h3>
				<ul className="space-y-1">
					<li>
						<span className="font-bold">• Total a ser recebido: </span>
						{formatarBRL(valoresReceber.total)}
					</li>
				</ul>
			</div>

			{/* Valores Recebidos */}
			<div className="bg-gradient-to-br from-lime-400 to-lime-600 rounded-lg p-4">
				<h3 className="text-xl font-semibold mb-2">💰 Valores Recebidos:</h3>
				<ul className="space-y-1">
					<li>
						{" "}
						<span className="font-bold">• Dinheiro: </span>{" "}
						{formatarBRL(valoresRecebidos.Dinheiro)}
					</li>
					<li>
						{" "}
						<span className="font-bold">• Cartão de Crédito/Débito: </span>{" "}
						{formatarBRL(valoresRecebidos["Cartão de Crédito/Débito"])}
					</li>
					<li>
						{" "}
						<span className="font-bold">• PIX: </span>{" "}
						{formatarBRL(valoresRecebidos.PIX)}
					</li>
					<li>
						{" "}
						<span className="font-bold">• Caixinhas: </span>{" "}
						{formatarBRL(valoresRecebidos.Caixinha)}
					</li>
					<li>
						{" "}
						<span className="font-bold">• Total Recebido: </span>{" "}
						{formatarBRL(valoresRecebidos.total)}
					</li>
				</ul>
			</div>

			{/* Controle de Gastos */}
			<div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-4">
				<h3 className="text-xl font-semibold mb-2">🗂️ Controle de Gastos:</h3>
				<label className="flex items-center gap-2 mb-4">
					<input
						type="checkbox"
						checked={mostrarInputs}
						onChange={() => setMostrarInputs(!mostrarInputs)}
					/>
					Adicionar Gastos Diários
				</label>

				{mostrarInputs && (
					<div className="space-y-4">
						<input
							type="text"
							placeholder="Descrição do gasto"
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
						/>
						<input
							type="number"
							min={0}
							step={0.1}
							placeholder="Valor gasto"
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							value={valorGasto}
							onChange={(e) => setValorGasto(e.target.value)}
						/>
						<button
							onClick={handleAdicionarGasto}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
						>
							Adicionar Gasto
						</button>
					</div>
				)}

				<ul className="mt-4 space-y-2">
					{gastos.map((g, i) => (
						<li key={i} className="text-lg flex items-center gap-2 flex-wrap">
							{gastoEditandoIndex === i ? (
								<>
									<input
										type="text"
										className="p-1 rounded bg-gray-200 border border-gray-500"
										value={gastoEditado.descricao}
										onChange={(e) =>
											setGastoEditado((prev) => ({
												...prev,
												descricao: e.target.value
											}))
										}
									/>
									<input
										type="number"
										min={0}
										step={0.1}
										className="p-1 rounded bg-gray-200 border border-gray-500"
										value={gastoEditado.valor}
										onChange={(e) =>
											setGastoEditado((prev) => ({
												...prev,
												valor: parseFloat(e.target.value)
											}))
										}
									/>
									<button
										className="bg-green-600 text-white px-2 py-1 rounded"
										onClick={() => {
											const atualizados = [...gastos]
											atualizados[i] = gastoEditado
											setGastos(atualizados)
											setGastoEditandoIndex(null)
										}}
									>
										Salvar
									</button>
									<button
										className="bg-gray-500 text-white px-2 py-1 rounded"
										onClick={() => setGastoEditandoIndex(null)}
									>
										Cancelar
									</button>
								</>
							) : (
								<>
									<span className="font-bold">
										• {g.descricao.toUpperCase()}:{" "}
									</span>
									{formatarBRL(g.valor)}
									<button
										className="bg-blue-700 text-white px-2 py-1 rounded ml-2"
										onClick={() => {
											setGastoEditandoIndex(i)
											setGastoEditado({ ...g })
										}}
									>
										Editar
									</button>
									<button
										className="bg-red-700 text-white px-2 py-1 rounded"
										onClick={() => {
											const atualizados = gastos.filter(
												(_, index) => index !== i
											)
											setGastos(atualizados)
										}}
									>
										Excluir
									</button>
								</>
							)}
						</li>
					))}
					<li>
						<span className="font-bold">• Total de Gastos: </span>{" "}
						{formatarBRL(totalGastos)}
					</li>
				</ul>
			</div>
			{/* Botão para limpar todos os dados */}
			<div className="text-center">
				<button
					onClick={handleLimparDados}
					className="mt-4 bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg text-lg font-bold cursor-pointer"
				>
					🧹 Limpar Dados e Resetar Sistema
				</button>
			</div>
		</div>
	)
}

export default RelatorioDiario
