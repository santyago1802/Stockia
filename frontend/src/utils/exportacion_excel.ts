import * as XLSX from "xlsx"; // Importa SheetJS para generar archivos .xlsx desde el frontend.

export function exportarAExcel<T extends Record<string, unknown>>( // Función genérica tipada para cualquier tabla o lista de registros.
  datos: T[], // Arreglo de objetos consultados/filtrados (préstamos, materiales o movimientos).
  nombreArchivo: string, // Nombre del archivo .xlsx a descargar.
  nombreHoja = "Datos" // Nombre de la hoja dentro del libro de Excel.
): void {
  const hoja = XLSX.utils.json_to_sheet(datos); // Transforma los objetos en filas y columnas de Excel.
  const libro = XLSX.utils.book_new(); // Crea un nuevo libro de Excel.

  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja); // Añade la hoja al libro.
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`); // Descarga el archivo .xlsx en el navegador.
}