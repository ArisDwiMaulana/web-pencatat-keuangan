#!/bin/bash

# Validasi apakah semua argumen sudah diisi
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "❌ Error: Argumen tidak lengkap!"
  echo "💡 Cara pakai: $0 [nama_container] [email_admin] [password]"
  echo "   Contoh  : $0 app_keuangan admin@admin.com password12345"
  exit 1
fi

# Jalankan perintah docker exec jika argumen lengkap
docker exec -it "$1" pocketbase superuser create "$2" "$3"
