document.addEventListener('DOMContentLoaded', () => {
    // La URL de la API de Pokémon.
    const urlBase = 'https://pokeapi.co/api/v2/pokemon/';

    // Selecciona los elementos HTML donde se mostrará la información.
    const pokemonNameElement = document.getElementById('pokemon-name');
    const pokemonImageElement = document.getElementById('pokemon-image');
    const pokemonIdElement = document.getElementById('pokemon-id');
    const pokemonRegionElement = document.getElementById('pokemon-region'); // Nuevo elemento
    const pokemonTypeElement = document.getElementById('pokemon-type');
    const pokemonSearch = document.getElementById('pokemon-input');
    const searchButton = document.getElementById('search-button');
    const pokemonMovesElement = document.getElementById('pokemon-moves');
    const averageMovePowerElement = document.getElementById('average-move-power');
    const averagePokemonPowerElement = document.getElementById('average-pokemon-power');


    // La función principal para obtener los datos de un Pokémon.
    async function fetchPokemonData() {
        const pokemonName = pokemonSearch.value.trim();

        if (!pokemonName) {
            pokemonNameElement.textContent = "¡Error! Ingresa un nombre o ID";
            pokemonImageElement.src = "img/pokemon-ir.png";
            pokemonIdElement.textContent = "ID:";
            pokemonRegionElement.textContent = "Región:"; // Limpia el campo de región
            pokemonTypeElement.textContent = "Tipo:";
            pokemonMovesElement.innerHTML = "";
            averageMovePowerElement.textContent = "";
            averagePokemonPowerElement.textContent = "";
            return;
        }

        try {
            const response = await fetch(`${urlBase}${pokemonName.toLowerCase()}`);
            if (!response.ok) {
                throw new Error(`Pokémon no encontrado: ${pokemonName}`);
            }
            const data = await response.json();
            displayPokemonData(data);
        } catch (error) {
            console.error("Error al obtener los datos del Pokémon:", error);
            pokemonNameElement.textContent = "¡Error! Pokémon no encontrado";
            pokemonImageElement.src = "img/pokemon-ir.png";
            pokemonIdElement.textContent = "ID:";
            pokemonRegionElement.textContent = "Región:"; // Limpia el campo de región
            pokemonTypeElement.textContent = "Tipo:";
            pokemonMovesElement.innerHTML = "";
            averageMovePowerElement.textContent = "";
            averagePokemonPowerElement.textContent = "";
        }
    }

    // Nueva función para obtener la región del Pokémon.
    async function fetchPokemonRegion(pokemonSpeciesUrl) {
        try {
            const speciesResponse = await fetch(pokemonSpeciesUrl);
            const speciesData = await speciesResponse.json();
            
            const generationUrl = speciesData.generation.url;
            const generationResponse = await fetch(generationUrl);
            const generationData = await generationResponse.json();
            
            return generationData.main_region.name;
        } catch (error) {
            console.error("Error al obtener la región del Pokémon:", error);
            return 'Desconocida';
        }
    }

    // Función para obtener detalles de un movimiento, incluyendo la traducción a español.
    async function fetchMoveDetails(moveUrl) {
        const response = await fetch(moveUrl);
        const moveData = await response.json();
        
        const spanishName = moveData.names.find(n => n.language.name === 'es') || moveData.name;
        const effectEntry = moveData.effect_entries.find(e => e.language.name === 'es') || moveData.effect_entries[0];
        
        return {
            name: typeof spanishName === 'string' ? spanishName : spanishName.name,
            type: moveData.type.name,
            power: moveData.power,
            effect: effectEntry ? effectEntry.short_effect : 'Sin descripción',
        };
    }

    // La función para mostrar los datos en el HTML.
    async function displayPokemonData(data) {
        pokemonNameElement.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        pokemonImageElement.src = data.sprites.front_default;
        pokemonIdElement.textContent = data.id;

        // Llama a la nueva función para obtener y mostrar la región
        const regionName = await fetchPokemonRegion(data.species.url);
        pokemonRegionElement.textContent = regionName.charAt(0).toUpperCase() + regionName.slice(1);

        const types = data.types.map(typeInfo => typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1));
        pokemonTypeElement.textContent = types.join(', ');

        pokemonMovesElement.innerHTML = 'Cargando movimientos...';

        const moves = data.moves.slice(0, 3);
        const moveDetails = await Promise.all(moves.map(m => fetchMoveDetails(m.move.url)));

        pokemonMovesElement.innerHTML = moveDetails.map(md =>
            `<strong>${md.name}</strong> (Tipo: ${md.type}, Poder: ${md.power})<br>${md.effect}<br>`
        ).join('<hr>');
        
        const validMoves = moveDetails.filter(move => move.power !== null);
        const totalMovePower = validMoves.reduce((total, move) => total + move.power, 0);
        const averageMovePower = validMoves.length > 0 ? (totalMovePower / validMoves.length).toFixed(2) : 'N/A';
        averageMovePowerElement.textContent = averageMovePower;
        
        const totalStats = data.stats.reduce((total, stat) => total + stat.base_stat, 0);
        const averagePokemonPower = (totalStats / data.stats.length).toFixed(2);
        averagePokemonPowerElement.textContent = averagePokemonPower;
    }

    searchButton.addEventListener('click', fetchPokemonData);

    pokemonSearch.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            fetchPokemonData();
        }
    });
});