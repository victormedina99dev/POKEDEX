document.addEventListener('DOMContentLoaded', () => {
// La URL de la API de Pokémon.
const urlBase = 'https://pokeapi.co/api/v2/pokemon/';

// Selecciona los elementos HTML donde se mostrará la información.
const pokemonNameElement = document.getElementById('pokemon-name');
const pokemonImageElement = document.getElementById('pokemon-image');
const pokemonIdElement = document.getElementById('pokemon-id');
const pokemonTypeElement = document.getElementById('pokemon-type');
const pokemonSearch = document.getElementById('pokemon-input');
const searchButton = document.getElementById('search-button');


// La función principal para obtener los datos de un Pokémon.
async function fetchPokemonData() {
    
    const pokemonName = pokemonSearch.value;

    try {
        // Hace la solicitud GET a la API usando la función fetch().
        const response = await fetch(`${urlBase}${pokemonName.toLowerCase()}`);

        // Si la respuesta no es exitosa, lanza un error.
        if (!response.ok) {
            throw new Error(`No se encontró el Pokémon: ${pokemonName}`);
        }

        // Convierte la respuesta a formato JSON.
        const data = await response.json();

        // Llama a la función para mostrar la información en la página.
        displayPokemonData(data);

    } catch (error) {
        // Muestra el error en la consola si algo falla.
        console.error("Error al obtener los datos del Pokémon:", error);
        pokemonNameElement.textContent = "¡Error! Llena un valor valido";
        pokemonImageElement.src = "img/pokemon-ir.png";
        pokemonIdElement.textContent = "Busqueda vacia...";
        pokemonTypeElement.textContent = "Busqueda vacia...";
    }
}

// La función para mostrar los datos en el HTML.
function displayPokemonData(data) {
    // Actualiza el texto con el nombre del Pokémon (capitalizando la primera letra).
    pokemonNameElement.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);

    // Actualiza la fuente de la imagen.
    pokemonImageElement.src = data.sprites.front_default;

    // Actualiza el ID.
    pokemonIdElement.textContent = data.id;

    // Obtiene los tipos del Pokémon y los une en una cadena.
    const types = data.types.map(typeInfo => typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1));
    pokemonTypeElement.textContent = types.join(', ');
}

//Añadimos un evento de clic al botón de búsqueda
searchButton.addEventListener('click', fetchPokemonData);

pokemonSearch.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            fetchPokemonData();
        }
    });

// Llama a la función con el nombre del Pokémon que quieres buscar.
// Puedes cambiar 'pikachu' por 'charmander', 'bulbasaur', etc.

});

