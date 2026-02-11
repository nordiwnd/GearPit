#!/bin/bash
# Fix remaining lint errors

cd /home/netgs/GearPit/apps/gearpit-web

# Fix unused 'error' variables - replace with empty catch blocks
sed -i 's/} catch (error) {/} catch {/g' components/loadout/loadout-form-dialog.tsx
sed -i 's/} catch (error) {/} catch {/g' components/trip/add-gear-to-trip-dialog.tsx
sed -i 's/} catch (error) {/} catch {/g' components/trip/add-loadout-to-trip-dialog.tsx
sed -i 's/} catch (error) {/} catch {/g' components/trip/trip-form-dialog.tsx
sed -i 's/} catch (error) {/} catch {/g' app/settings/page.tsx

# Fix unused 'Check' import
sed -i 's/import { Plus, Check } from "lucide-react";/import { Plus } from "lucide-react";/g' components/trip/add-loadout-to-trip-dialog.tsx

# Fix unused 'scaleFactor' variable
sed -i '/const scaleFactor = /d' components/loadout/weight-budget-bar.tsx

# Fix 'any' types in render functions - replace with proper type inference
for file in components/inventory/add-gear-dialog.tsx components/loadout/create-loadout-dialog.tsx components/loadout/loadout-form-dialog.tsx components/trip/trip-form-dialog.tsx app/settings/page.tsx; do
  sed -i 's/render={({ field }: { field: any })/render={({ field })/g' "$file"
done

echo "Fixed remaining lint errors"
