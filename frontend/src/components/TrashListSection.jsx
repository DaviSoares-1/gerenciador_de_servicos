import React, { useState } from "react"

function TrashListSection({ deletedOrders, onRestore, onPermanentDelete }) {
	const [filtros, setFiltros] = useState({
		modelo: "",
		placa: "",
		total: "",
		caixinha: "",
		cantina: "",
		numero: "",
		status: ""
	})

	const handleChange = (e) => {
		const { name, value } = e.target
		setFiltros((prev) => ({ ...prev, [name]: value }))
	}

	const handleLimparFiltro = () => {
		setFiltros({
			modelo: "",
			placa: "",
			total: "",
			caixinha: "",
			cantina: "",
			numero: "",
			status: ""
		})
	}

	const formatBRL = (valor) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL"
		}).format(+valor)

	const ordersFiltradas = [...deletedOrders].filter((order) => {
		const matchModelo = filtros.modelo
			? order.modeloCarro?.toUpperCase().includes(filtros.modelo.toUpperCase())
			: true
		const matchPlaca = filtros.placa
			? order.placaCarro?.toUpperCase().includes(filtros.placa.toUpperCase())
			: true
		const matchTotal = filtros.total
			? Number(order.total) === Number(filtros.total)
			: true
		const matchCaixinha = filtros.caixinha
			? Number(order.caixinha) === Number(filtros.caixinha)
			: true
		const matchCantina = filtros.cantina
			? Number(order.cantina) === Number(filtros.cantina)
			: true
		const matchNumero = filtros.numero
			? Number(order.carroNumero) === Number(filtros.numero)
			: true
		const matchStatus = filtros.status
			? order.status.toLowerCase() === filtros.status.toLowerCase()
			: true

		return (
			matchModelo &&
			matchPlaca &&
			matchTotal &&
			matchCaixinha &&
			matchCantina &&
			matchNumero &&
			matchStatus
		)
	})

	return (
		<>
			<div className="mb-6 bg-gray-800 text-white p-4 rounded">
				<h2 className="text-2xl font-semibold mb-4 place-self-start">🔍 Pesquisa por Veículos:</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input
						type="text"
						name="modelo"
						value={filtros.modelo}
						onChange={handleChange}
						placeholder="Modelo do veículo"
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
					/>
					<input
						type="text"
						name="placa"
						value={filtros.placa}
						onChange={handleChange}
						placeholder="Placa do veículo"
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
					/>
					<input
						type="number"
						name="total"
						value={filtros.total}
						onChange={handleChange}
						placeholder="Valor total (ex: R$ 30,00)"
						min={0}
						step={0.01}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
					/>
					<input
						type="number"
						name="caixinha"
						value={filtros.caixinha}
						onChange={handleChange}
						placeholder="Caixinha (ex: R$ 5,00)"
						min={0}
						step={0.01}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
					/>
					<input
						type="number"
						name="cantina"
						value={filtros.cantina}
						onChange={handleChange}
						placeholder="Cantina (ex: R$ 2,50)"
						min={0}
						step={0.01}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
					/>
					<input
						type="number"
						name="numero"
						value={filtros.numero}
						onChange={handleChange}
						placeholder="Numeração do veículo"
						min={0}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
					/>
					<select
						name="status"
						value={filtros.status}
						onChange={handleChange}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
					>
						<option value="">Todos os status</option>
						<option value="em processamento">Em processamento</option>
						<option value="processada">Processada</option>
					</select>
				</div>
				<div className="mt-4 flex justify-center">
					<button
						onClick={handleLimparFiltro}
						className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-lg"
					>
						Limpar Filtro
					</button>
				</div>
			</div>

			{ordersFiltradas.length === 0 ? (
				<p className="text-center text-gray-400">Nenhuma ordem encontrada.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{ordersFiltradas
						.sort((a, b) => Number(a.carroNumero) - Number(b.carroNumero))
						.map((order) => (
							<div
								key={order.id}
								className="bg-gradient-to-br from-gray-600 to-gray-700 text-white p-4 md:p-5 rounded shadow w-full text-lg min-h-[260px] flex flex-col justify-between"
							>
								<p>
									<strong>Responsável:</strong>{" "}
									{order.responsavel.toUpperCase()}
								</p>
								<p>
									<strong>Modelo:</strong> {order.modeloCarro.toUpperCase()}
								</p>
								<p>
									<strong>Placa:</strong> {order.placaCarro.toUpperCase()}
								</p>
								<p>
									<strong>Total:</strong> {formatBRL(order.total)}
								</p>
								<p>
									<strong>Caixinha:</strong> {formatBRL(order.caixinha)}
								</p>
								<p>
									<strong>Cantina:</strong> {formatBRL(order.cantina)}
								</p>
								<p>
									<strong>Ordem n°:</strong> {order.carroNumero}
								</p>
								<p>
									<strong>Status:</strong> {order.status}
								</p>
								<div className="flex gap-2 mt-2">
									<button
										onClick={() => onRestore(order)}
										className="bg-blue-600 px-2 py-1 rounded cursor-pointer shadow-lg"
									>
										Restaurar
									</button>
									<button
										onClick={() => onPermanentDelete(order)}
										className="bg-red-700 px-2 py-1 rounded cursor-pointer shadow-lg"
									>
										Apagar
									</button>
								</div>
							</div>
						))}
				</div>
			)}
		</>
	)
}

export default TrashListSection
