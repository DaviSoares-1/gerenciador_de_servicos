import React, {
	useState,
	useEffect,
	useImperativeHandle,
	forwardRef,
	useRef
} from "react"
import useOrders from "../store/useOrders"
import Toast from "./Toast"
import { v4 as uuidv4 } from "uuid"

function OrderForm({ editingOrder, setEditingOrder }, ref) {
	const fileInputRef = useRef(null)
	const wrapperRef = useRef(null)
	const { addOrder, updateOrder, orders, deletedOrders } = useOrders()
	const [form, setForm] = useState({
		dataHora: "",
		responsavel: "",
		carroNumero: "",
		modeloCarro: "",
		placaCarro: "",
		tipoVeiculo: [],
		servicos: [],
		total: "",
		caixinha: "",
		cantina: "",
		formaPagamento: "",
		descricaoOutros: "",
		observacoes: "",
		status: "em processamento",
		notaFiscal: null,
		notaFiscalUrl: ""
	})
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [toastType, setToastType] = useState("success")

	const localRef = React.useRef(null)

	useImperativeHandle(ref, () => ({
		resetForm,
		scrollIntoView: () => {
			localRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}))

	useEffect(() => {
		if (editingOrder) setForm(editingOrder)
	}, [editingOrder])

	const handleChangeVeiculo = (e) => {
		const { value, checked } = e.target
		setForm((prevForm) => ({
			...prevForm,
			tipoVeiculo: checked
				? [...prevForm.tipoVeiculo, value]
				: prevForm.tipoVeiculo.filter((s) => s !== value)
		}))
	}

	const handleChangeServico = (e) => {
		const { value, checked } = e.target
		setForm((prevForm) => ({
			...prevForm,
			servicos: checked
				? [...prevForm.servicos, value]
				: prevForm.servicos.filter((s) => s !== value)
		}))
	}

	const resetForm = () => {
		setForm({
			dataHora: "",
			responsavel: "",
			carroNumero: "",
			modeloCarro: "",
			placaCarro: "",
			tipoVeiculo: [],
			servicos: [],
			total: "",
			caixinha: "",
			cantina: "",
			formaPagamento: "",
			descricaoOutros: "",
			observacoes: "",
			status: "em processamento",
			notaFiscal: null,
			notaFiscalUrl: ""
		})
	}

	const formatInput = (str) => {
		if (!str || typeof str !== "string") return ""
		const cleaned = str.trim()
		return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		// Verifica se a numeração já existe (apenas se não estiver editando)
		if (isCarroNumeroDuplicado()) {
			triggerToast(
				`A ordem número: (${form.carroNumero}) já foi adicionada!!`,
				"error"
			)
			return
		}
		const notaFiscalUrl = form.notaFiscalUrl || null
		const cleanedForm = {
			...form,
			observacoes: formatInput(form.observacoes),
			descricaoOutros: formatInput(form.descricaoOutros)
		}
		const orderData = {
			...cleanedForm,
			id: editingOrder ? form.id : uuidv4(),
			notaFiscalUrl
		}

		if (editingOrder) {
			updateOrder(orderData)
			setEditingOrder(null)
			triggerToast(
				`A ordem número: (${
					form.carroNumero
				}) - Carro: ${form.modeloCarro.toUpperCase()} foi Editada.`,
				"edit"
			)
		} else {
			addOrder(orderData)
			triggerToast(
				`A ordem número: (${
					form.carroNumero
				}) - Carro: ${form.modeloCarro.toUpperCase()} foi Gerada.`,
				"success"
			)
		}
		resetForm()
	}

	const handleConcluir = () => {
		const notaFiscalUrl = form.notaFiscalUrl || null
		const updatedForm = {
			...form,
			status: "processada",
			notaFiscalUrl,
			observacoes: formatInput(form.observacoes),
			descricaoOutros: formatInput(form.descricaoOutros)
		}

		if (isCarroNumeroDuplicado()) {
			triggerToast(
				`A ordem número: (${form.carroNumero}) já foi adicionada!!`,
				"error"
			)
			return
		}
		updateOrder(updatedForm)
		triggerToast(
			`A ordem número: (${
				form.carroNumero
			}) - Carro: ${form.modeloCarro.toUpperCase()} foi Concluída.`,
			"success"
		)
		setEditingOrder(null)
		resetForm()
	}

	const handleReabrir = () => {
		const updatedForm = {
			...form,
			status: "em processamento",
			formaPagamento: "", // Reseta a forma de pagamento
			observacoes: formatInput(form.observacoes),
			descricaoOutros: formatInput(form.descricaoOutros)
		}

		updateOrder(updatedForm)
		triggerToast(
			`A ordem número: (${
				form.carroNumero
			}) - Carro: ${form.modeloCarro.toUpperCase()} foi Reaberta.`,
			"reopen"
		)
		setForm(updatedForm)
	}

	const convertToBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = reject
		})

	const handleRemoverArquivo = () => {
		setForm((prevForm) => ({
			...prevForm,
			notaFiscal: null,
			notaFiscalUrl: ""
		}))
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	useImperativeHandle(ref, () => ({
		resetForm,
		scrollToForm: () => {
			wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}))

	// NÃO PODE ADICIONAR NUMERAÇÃO JÁ ADICIONADA, MESMO QUE ESTEJA NA LIXEIRA
	const isCarroNumeroDuplicado = () => {
		const allOrders = [...orders, ...deletedOrders]
		return allOrders.some(
			(order) => order.carroNumero === form.carroNumero && order.id !== form.id // permite que o mesmo número seja mantido ao editar a própria ordem
		)
	}

	const triggerToast = (message, type = "success") => {
		setToastMessage(message)
		setToastType(type)
		setShowToast(true)
		setTimeout(() => setShowToast(false), 3000)
	}

	return (
		<div
			ref={wrapperRef}
			className="min-h-screen flex items-center justify-center p-4 flex-col "
		>
			<h2 className="text-xl md:text-3xl font-bold text-white text-center mb-4">
				📑 Ficha de Serviço 📑
			</h2>
			{showToast && <Toast message={toastMessage} type={toastType} />}
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-4xl bg-gradient-to-br from-yellow-300 to-yellow-600 p-5 md:p-10 rounded-xl shadow-lg space-y-6"
			>
				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Dados do Atendimento:
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="">
						<label htmlFor="dataHora" className="mb-2 block text-lg font-sans">
							Data e Hora:
						</label>
						<input
							id="dataHora"
							type="datetime-local"
							value={form.dataHora}
							onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="responsavel"
							className="mb-2 block text-lg font-sans"
						>
							Nome:
						</label>
						<input
							id="responsavel"
							type="text"
							placeholder="Responsável"
							value={form.responsavel}
							onChange={(e) =>
								setForm({ ...form, responsavel: e.target.value })
							}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="carroNumero"
							className="mb-2 block text-lg font-sans"
						>
							Numeração:
						</label>
						<input
							id="carroNumero"
							type="number"
							min={0}
							placeholder="Carro nº"
							value={form.carroNumero}
							onChange={(e) =>
								setForm({ ...form, carroNumero: e.target.value })
							}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
							required
						/>
					</div>
				</div>
				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Dados do Veículo:
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="modelo" className="mb-2 block text-lg font-sans">
							Modelo:
						</label>
						<input
							id="modelo"
							type="text"
							placeholder="Modelo do carro"
							value={form.modeloCarro}
							onChange={(e) =>
								setForm({ ...form, modeloCarro: e.target.value })
							}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							required
						/>
					</div>
					<div>
						<label htmlFor="placa" className="mb-2 block text-lg font-sans">
							Placa:
						</label>
						<input
							id="placa"
							type="text"
							placeholder="Placa do carro"
							value={form.placaCarro}
							onChange={(e) => setForm({ ...form, placaCarro: e.target.value })}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full"
							required
						/>
					</div>
				</div>
				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Tipo de Veículo:
				</h2>
				<div className="grid grid-cols-2 gap-2">
					{[
						"Uber/Táxi",
						"Carro Grande",
						"Carro Pequeno",
						"Moto",
						"Van",
						"Hunter"
					].map((veiculo) => (
						<label
							key={veiculo}
							className="flex items-center gap-2 text-slate-900"
						>
							<input
								type="checkbox"
								value={veiculo}
								checked={form.tipoVeiculo.includes(veiculo)}
								onChange={handleChangeVeiculo}
							/>
							{veiculo}
						</label>
					))}
				</div>

				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Serviços Solicitados:
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
					{[
						"Estacionamento",
						"Lavagem Geral",
						"Ducha",
						"Limpeza interna",
						"Aspiração",
						"Higienização",
						"Aplicação de cera",
						"Aplicação de Produto",
						"Polimento",
						"Revitalização de Faróis"
					].map((servico) => (
						<label
							key={servico}
							className="flex items-center gap-2 text-slate-900"
						>
							<input
								type="checkbox"
								value={servico}
								checked={form.servicos.includes(servico)}
								onChange={handleChangeServico}
							/>
							{servico}
						</label>
					))}
				</div>

				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Observações:
				</h2>
				<textarea
					placeholder="Informações adicionais sobre o serviço"
					value={form.observacoes}
					onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
					className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full resize-none"
				/>

				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Valor a Receber:
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="total" className="mb-2 block text-lg font-sans">
							Total do Serviço:
						</label>
						<input
							id="total"
							type="number"
							min={0}
							step={0.1}
							placeholder="R$ 00,00"
							value={form.total}
							onChange={(e) => setForm({ ...form, total: e.target.value })}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
							required
						/>
					</div>
					<div>
						<label htmlFor="caixinha" className="mb-2 block text-lg font-sans">
							Caixinha:
						</label>
						<input
							id="caixinha"
							type="number"
							min={0}
							step={0.1}
							placeholder="R$ 00,00"
							value={form.caixinha}
							onChange={(e) => setForm({ ...form, caixinha: e.target.value })}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
						/>
					</div>
					<div>
						<label htmlFor="total" className="mb-2 block text-lg font-sans">
							Cantina:
						</label>
						<input
							id="total"
							type="number"
							min={0}
							step={0.1}
							placeholder="R$ 00,00"
							value={form.cantina}
							onChange={(e) => setForm({ ...form, cantina: e.target.value })}
							className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full no-spinner"
							required
						/>
					</div>
				</div>
				<h2 className="font-mono text-2xl font-bold text-slate-900">
					Forma de Pagamento:
				</h2>
				<div className="flex flex-wrap gap-4 text-slate-900">
					{["Dinheiro", "Cartão de Crédito/Débito", "PIX", "Outros"].map(
						(forma) => (
							<label key={forma} className="flex items-center gap-2">
								<input
									type="radio"
									name="formaPagamento"
									value={forma}
									checked={form.formaPagamento === forma}
									onChange={(e) =>
										setForm({ ...form, formaPagamento: e.target.value })
									}
								/>
								{forma}
							</label>
						)
					)}
				</div>
				{form.formaPagamento === "Outros" && (
					<textarea
						placeholder="Descreva outra forma de pagamento"
						value={form.descricaoOutros}
						onChange={(e) =>
							setForm({ ...form, descricaoOutros: e.target.value })
						}
						className="p-3 text-base rounded-lg bg-gray-300 text-gray-900 border border-gray-600 w-full resize-none"
					/>
				)}

				<h2 className="font-mono text-2xl font-semibold text-slate-900">
					Anexar Nota Fiscal:
				</h2>
				<div className="space-y-2">
					<label className="cursor-pointer inline-block bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
						Selecionar Arquivo
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={async (e) => {
								const file = e.target.files[0]
								if (file) {
									const base64 = await convertToBase64(file)
									setForm({
										...form,
										notaFiscal: file,
										notaFiscalUrl: base64
									})
								}
							}}
							className="hidden"
						/>
					</label>

					{form.notaFiscal && (
						<div className="space-y-1">
							<div className="text-base text-green-700 font-bold">
								✅ Arquivo anexado:{" "}
								<span className="font-semibold">{form.notaFiscal.name}</span>
							</div>
							<button
								type="button"
								onClick={handleRemoverArquivo}
								className="inline-block bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
							>
								Remover Arquivo
							</button>
						</div>
					)}
				</div>

				<div className="flex flex-wrap gap-4">
					<button
						type="submit"
						className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
					>
						{editingOrder ? "Atualizar" : "Criar"} Ordem de Serviço
					</button>
					{editingOrder && (
						<>
							{form.status === "em processamento" && (
								<button
									type="button"
									onClick={handleConcluir}
									className={`px-6 py-2 rounded text-white ${
										form.formaPagamento && !isCarroNumeroDuplicado()
											? "bg-green-600 hover:bg-green-700"
											: "bg-gray-400 cursor-not-allowed"
									}`}
									disabled={!form.formaPagamento || isCarroNumeroDuplicado()}
								>
									Concluir
								</button>
							)}
							{form.status === "processada" && (
								<button
									type="button"
									onClick={handleReabrir}
									className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
								>
									Reabrir Serviço
								</button>
							)}
						</>
					)}
				</div>
			</form>
		</div>
	)
}

export default forwardRef(OrderForm)
