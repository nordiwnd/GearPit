# Database Schema (PostgreSQL)

## Core Tables

### `gears`
Stores all inventory items.
* `id`: UUID (PK)
* `user_id`: UUID
* `name`: Text
* `weight_g`: Integer (Grams)
* `price`: Integer
* `category`: Text (e.g., "shelter", "cpu")
* `properties`: **JSONB** (Flexible specs based on category)
    * e.g. `{ "r_value": 4.5, "season": "4-season" }`
* `created_at`: Timestamp

### `kits`
A collection of gears (e.g., "Solo Summer Hike").
* `id`: UUID
* `name`: Text

### `kit_items`
Join table (Many-to-Many).
* `kit_id`: UUID
* `gear_id`: UUID
* `quantity`: Integer

### `trips`
An event planning entity.
* `id`: UUID
* `name`: Text
* `start_date`: Timestamp
* `duration_hours`: Float
* `base_altitude_m`: Integer
* `max_altitude_m`: Integer

### `trip_loadouts`
Links a Kit to a Trip (Many-to-Many, allowing multiple kits per trip).
* `trip_id`: UUID
* `kit_id`: UUID