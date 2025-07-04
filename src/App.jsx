// src/App.jsx

import React, { useState, useRef } from "react"
import OrderForm from "./components/OrderForm"
import OrderListSection from "./components/OrderListSection"
import TrashListSection from "./components/TrashListSection"
import RelatorioDiario from "./components/RelatorioDiario"
import Toast from "./components/Toast"
import useOrders from "./store/useOrders"

function App() {
  const {
    orders,
    deletedOrders,
    softDeleteOrder,
    restoreOrder,
    permanentlyDeleteOrder
  } = useOrders()

  const [editingOrder, setEditingOrder] = useState(null)
  const formRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  const handleEdit = (order) => {
    setEditingOrder(order)
    setTimeout(() => {
      formRef.current?.scrollToForm()
      formRef.current?.classList?.add("ring", "ring-blue-500", "ring-offset-2")
      setTimeout(() => {
        formRef.current?.classList?.remove(
          "ring",
          "ring-blue-500",
          "ring-offset-2"
        )
      }, 1500)
    }, 100)
  }

  const triggerToast = (message, type = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDelete = (order) => {
    softDeleteOrder(order.id)
    if (editingOrder?.id === order.id) {
      setEditingOrder(null)
      formRef.current?.resetForm()
    }
    triggerToast(
      `A ordem número: (${order.carroNumero}) - Carro: ${order.modeloCarro.toUpperCase()} foi Excluída.`,
      "delete"
    )
  }

  const handleRestore = (order) => {
    restoreOrder(order.id)
    triggerToast(
      `A ordem número: (${order.carroNumero}) - Carro: ${order.modeloCarro.toUpperCase()} foi Restaurada.`,
      "restore"
    )
  }

  const handlePermanentDelete = (order) => {
    permanentlyDeleteOrder(order.id)
    triggerToast(
      `A ordem número: (${order.carroNumero}) - Carro: ${order.modeloCarro.toUpperCase()} foi Excluída Permanentemente.`,
      "permanent-delete"
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col md:flex-row custom-scrollbar">
      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-4 md:mb-6">
          📑Sistema de Ordens de Serviços📑
        </h1>

        {showToast && <Toast message={toastMessage} type={toastType} />}

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Coluna da Esquerda - Formulário */}
          <div className="bg-gray-800 p-4 md:p-2 rounded-lg shadow-md overflow-y-auto max-h-[90vh] w-full text-base md:text-lg">
            <OrderForm
              ref={formRef}
              editingOrder={editingOrder}
              setEditingOrder={setEditingOrder}
            />
          </div>

          {/* Coluna da Direita - Relatórios, Ordens e Lixeira */}
          <div className="flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar text-base md:text-lg">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <RelatorioDiario />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4">
                📝 Ordens Geradas: 📝
              </h2>
              <OrderListSection
                orders={orders}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4">
                🗑️ Lixeira 🗑️
              </h2>
              <TrashListSection
                deletedOrders={deletedOrders}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
