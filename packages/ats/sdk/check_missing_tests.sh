#!/bin/bash

# Script para verificar qué ficheros .ts no tienen su .test.ts correspondiente
# a partir de la lista de ficheros modificados comparados con la rama development
# Los tests están en __tests__ y los fuentes en src

# Función para obtener la lista de ficheros modificados
get_modified_files() {
    git diff --name-only development
}

# Función para obtener la ruta del test correspondiente
get_test_path() {
    local file="$1"
    # Quitar el prefijo packages/ats/sdk/ si existe
    file="${file#packages/ats/sdk/}"
    # Reemplazar src/ con __tests__/ y reemplazar .ts con .test.ts
    file="${file/src\//__tests__\/}"
    echo "packages/ats/sdk/${file%.ts}.test.ts"
}

echo "Verificando ficheros ..."
echo "======================================================"

# Obtener lista de ficheros modificados y procesar solo los .ts
get_modified_files | grep '\.ts$' | while read file; do
    echo "File: $file"
done

echo "======================================================"
echo "Verificación completada."
