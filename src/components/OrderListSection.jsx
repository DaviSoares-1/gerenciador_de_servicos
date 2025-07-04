import React from "react"
import { generatePDF } from "../utils/generatePDF"

function OrderListSection({ orders, onEdit, onDelete }) {
	return (
		<>
		{orders.length === 0 ? (
				<p className="text-center text-gray-400">Nenhuma ordem foi criada ainda.</p>
			) : (
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{[...orders]
					.sort((a, b) => Number(a.carroNumero) - Number(b.carroNumero))
					.map((order) => (
						<div
							key={order.id}
							className="bg-yellow-500 p-4 md:p-5 rounded shadow w-full text-lg min-h-[260px] flex flex-col justify-between flex-wrap"
						>
							<p>
								<strong>Responsável:</strong> {order.responsavel.toUpperCase()}
							</p>
							<p>
								<strong>Modelo:</strong> {order.modeloCarro.toUpperCase()}
							</p>
							<p>
								<strong>Placa:</strong> {order.placaCarro.toUpperCase()}
							</p>
							<p>
								<strong>Total:</strong>{" "}
								{new Intl.NumberFormat("pr-BR", {
									style: "currency",
									currency: "BRL"
								}).format(+order.total)}
							</p>
							<p>
								<strong>Ordem n°:</strong> {order.carroNumero}
							</p>
							<p>
								<strong>Status:</strong> {order.status}
							</p>
							<div className="flex gap-2 mt-2">
								<button
									onClick={() => onEdit(order)}
									className="bg-yellow-400 px-2 py-1 rounded cursor-pointer"
								>
									Editar
								</button>
								<button
									onClick={() => onDelete(order)}
									className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
								>
									Excluir
								</button>
								{order.status === "processada" && (
									<button
										onClick={() => generatePDF(order)}
										className="bg-green-600 text-white px-2 py-1 rounded cursor-pointer"
									>
										Baixar
									</button>
								)}
							</div>
						</div>
					))}
			</div>
			)}
		</>
	)
}

export default OrderListSection
