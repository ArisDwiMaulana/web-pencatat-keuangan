#!/bin/bash
echo "Menyiapkan environment Tailwind + daisyUI..."

# 1. Unduh Tailwind CLI jika belum ada
if [ ! -f ./tailwindcss ]; then
  echo "Unduh Tailwind Standalone CLI..."
  wget https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 -O ./tailwindcss
  chmod +x tailwindcss
fi

# 2. Unduh daisyui.css jika belum ada
if [ ! -f ./daisyui.css ]; then
  echo "Unduh daisyui.css..."
  wget https://cdn.jsdelivr.net/npm/daisyui@5/daisyui.css -O ./daisyui.css
fi

echo "Setup selesai!"
