import { create } from "zustand"
import { persist } from "zustand/middleware"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"

const useOrders = create(
	persist(
		(set) => ({
			orders: [],
			deletedOrders: [],

			addOrder: (order) =>
				set((state) => ({ orders: [...state.orders, order] })),

			updateOrder: (updated) =>
				set((state) => ({
					orders: state.orders.map((order) =>
						order.id === updated.id ? updated : order
					)
				})),

			softDeleteOrder: (id) =>
				set((state) => {
					const orderToDelete = state.orders.find((o) => o.id === id)
					if (!orderToDelete) return {}
					return {
						orders: state.orders.filter((order) => order.id !== id),
						deletedOrders: [...state.deletedOrders, orderToDelete]
					}
				}),

			restoreOrder: (id) =>
				set((state) => {
					const orderToRestore = state.deletedOrders.find((o) => o.id === id)
					if (!orderToRestore) return {}
					return {
						deletedOrders: state.deletedOrders.filter((o) => o.id !== id),
						orders: [...state.orders, orderToRestore]
					}
				}),

			permanentlyDeleteOrder: (id) =>
				set((state) => ({
					deletedOrders: state.deletedOrders.filter((o) => o.id !== id)
				}))
		}),
		{
			name: "orders-storage",
			getStorage: () => localStorage,
			// Compressão LZ
			serialize: (state) => compressToUTF16(JSON.stringify(state)),
			deserialize: (str) => JSON.parse(decompressFromUTF16(str))
		}
	)
)

export default useOrders
