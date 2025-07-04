import React from "react"

function TrashListSection({ deletedOrders, onRestore, onPermanentDelete }) {
	return (
		<>
			{deletedOrders.length === 0 ? (
				<p className="text-center text-gray-400">Nenhuma ordem excluída ainda.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{[...deletedOrders]
						.sort((a, b) => Number(a.carroNumero) - Number(b.carroNumero))
						.map((order) => (
							<div
								key={order.id}
								className="bg-gray-700 text-white p-4 md:p-5 rounded shadow w-full text-lg min-h-[260px] flex flex-col justify-between"
							>
								<p><strong>Responsável:</strong> {order.responsavel.toUpperCase()}</p>
								<p><strong>Modelo:</strong> {order.modeloCarro.toUpperCase()}</p>
								<p><strong>Placa:</strong> {order.placaCarro.toUpperCase()}</p>
								<p><strong>Total:</strong>{" "}
									{new Intl.NumberFormat("pt-BR", {
										style: "currency",
										currency: "BRL"
									}).format(+order.total)}
								</p>
								<p><strong>Ordem n°:</strong> {order.carroNumero}</p>
								<p><strong>Status:</strong> {order.status}</p>
								<div className="flex gap-2 mt-2">
									<button
										onClick={() => onRestore(order)}
										className="bg-blue-600 px-2 py-1 rounded cursor-pointer"
									>
										Restaurar
									</button>
									<button
										onClick={() => onPermanentDelete(order)}
										className="bg-red-700 px-2 py-1 rounded cursor-pointer"
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
