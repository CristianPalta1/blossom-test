# Blossom API Nest

Esta es una API construida con NestJS, GraphQL, TypeORM y PostgreSQL. Sirve como un backend para gestionar datos de personajes, sincronizándolos desde la API pública de Rick and Morty.

## Características

- **Framework:** NestJS (v10.0.0)
- **API:** GraphQL (Apollo)
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize
- **Caché:** Redis
- **Sincronización:** Obtiene y guarda datos de la [API de Rick and Morty](https://rickandmortyapi.com/).

## Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Docker y Docker Compose (para levantar la base de datos y Redis)

## Puesta en Marcha

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd blossom-api-nest
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**

    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables. Puedes usar el archivo `.env.example` como base.

    ```env
    # Aplicación
    PORT=3000

    # Base de Datos PostgreSQL
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=tu_usuario
    DB_PASSWORD=tu_contraseña
    DB_DATABASE=blossom_db

    # Redis
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

4.  **Ejecutar la aplicación:**

    ```bash
    # Modo desarrollo con hot-reload
    npm run start:dev

    # Modo producción
    npm run start:prod
    ```

    La API estará disponible en `http://localhost:3000` y el playground de GraphQL en `http://localhost:3000/graphql`.

## Scripts Útiles

- **Ejecutar tests:**

  ```bash
  npm run test
  ```

- **Linter y Formateo:**

  ```bash
  # Revisar problemas de linting
  npm run lint

  # Formatear código con Prettier
  npm run format
  ```

## API de GraphQL

Una vez que la aplicación está corriendo, puedes explorar el esquema y ejecutar operaciones a través del playground de GraphQL en `http://localhost:3000/graphql`.

### Consultas (Queries)

- `characters(filters)`: Devuelve una lista de personajes con filtros opcionales.
  query {
  characters(
  name: "Rick",
  status: "Alive",
  species: "Human",
  gender: "male"
  ) {
  id
  apiId
  name
  status
  species
  gender
  origin
  location
  image
  url
  }
  }
- `character(id)`: Devuelve un personaje por su ID.
  query {
  character(id: 1) {
  id
  apiId
  name
  status
  species
  gender
  origin
  location
  image
  url
  }
  }
- `charactersCount(filters)`: Devuelve la cantidad de personajes según los filtros.
  query {
  charactersCount(status: "Alive", species: "Human")
  }

- `testDatabaseConnection()`: Prueba la conexion a la DB
  query {
  testDatabaseConnection
  }

### Mutaciones (Mutations)

- `syncCharacters()`: Sincroniza la base de datos local con la API de Rick and Morty.

  mutation {
  syncCharacters
  }

- `getCharacterFromApi(apiId)`: Obtiene un personaje de la API externa y lo guarda en la base de datos.

  mutation {
  getCharacterFromApi(apiId: 42) {
  id
  apiId
  name
  status
  species
  gender
  origin
  location
  image
  url
  }
  }
