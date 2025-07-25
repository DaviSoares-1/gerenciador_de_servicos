import { compressToUTF16, decompressFromUTF16 } from "lz-string"

/**
 * Lê e descompacta um item do localStorage
 * @param {string} key - chave do localStorage
 * @param {any} fallback - valor padrão em caso de erro
 * @returns {any} valor recuperado
 */
export function getCompressedItem(key, fallback = null) {
	try {
		const compressed = localStorage.getItem(key)
		if (!compressed) return fallback

		const decompressed = decompressFromUTF16(compressed)
		return JSON.parse(decompressed)
	} catch (error) {
		console.error(`Erro ao ler "${key}":`, error)
		return fallback
	}
}

/**
 * Compacta e salva um item no localStorage
 * @param {string} key - chave para salvar
 * @param {any} value - valor a ser salvo
 */
export function setCompressedItem(key, value) {
	try {
		const compressed = compressToUTF16(JSON.stringify(value))
		localStorage.setItem(key, compressed)
	} catch (error) {
		console.error(`Erro ao salvar "${key}":`, error)
	}
}
