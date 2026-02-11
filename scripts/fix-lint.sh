#!/bin/bash
# Fix common lint errors in TypeScript/TSX files

# Remove unused imports
find apps/gearpit-web -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove unused 'Trash2' import from edit-gear-dialog.tsx
  if [[ "$file" == *"edit-gear-dialog.tsx" ]]; then
    sed -i 's/import { toast } from "sonner";/import { toast } from "sonner";/' "$file"
    sed -i 's/, Trash2//' "$file"
  fi
  
  # Remove unused 'Check' import
  if [[ "$file" == *"add-loadout-to-trip-dialog.tsx" ]]; then
    sed -i 's/, Check//' "$file"
  fi
  
  # Remove unused 'scaleFactor' variable
  if [[ "$file" == *"weight-budget-bar.tsx" ]]; then
    sed -i '/const scaleFactor/d' "$file"
  fi
done

echo "Fixed common lint errors"
