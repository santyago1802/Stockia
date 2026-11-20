describe('Configuración de pruebas', () => {
  test('suma 2 + 3 y da 5', () => {
    // 1. Preparar
    const a = 2;
    const b = 3;

    // 2. Ejecutar
    const resultado = a + b;

    // 3. Verificar
    expect(resultado).toBe(5);
  });
});