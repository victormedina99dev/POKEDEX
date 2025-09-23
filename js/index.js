document.addEventListener('DOMContentLoaded', () => {
    const urlBase = 'https://pokeapi.co/api/v2/pokemon/';
    let statsChartInstance = null;

    const pokemonNameElement = document.getElementById('pokemon-name');
    const pokemonImageElement = document.getElementById('pokemon-image');
    const pokemonIdElement = document.getElementById('pokemon-id');
    const pokemonTypeElement = document.getElementById('pokemon-type');
    const pokemonSearch = document.getElementById('pokemon-input');
    const searchButton = document.getElementById('search-button');
    const pokemonMovesElement = document.getElementById('pokemon-moves');
    const averageMovePowerElement = document.getElementById('average-move-power');
    const averagePokemonPowerElement = document.getElementById('average-pokemon-power');
    const pokemonStatsElement = document.getElementById('pokemon-stats');
    const statsChartElement = document.getElementById('stats-chart');

    async function fetchPokemonData() {
        const pokemonName = pokemonSearch.value.trim();
        if (!pokemonName) {
            pokemonNameElement.textContent = "¡Error! Ingresa un nombre o ID";
            pokemonImageElement.src = "img/pokemon-ir.png";
            pokemonIdElement.textContent = "ID:";
            pokemonTypeElement.textContent = "Tipo:";
            pokemonMovesElement.innerHTML = "";
            averageMovePowerElement.textContent = "";
            averagePokemonPowerElement.textContent = "";
            pokemonStatsElement.innerHTML = "";
            if (statsChartInstance) {
                statsChartInstance.destroy();
            }
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
            pokemonTypeElement.textContent = "Tipo:";
            pokemonMovesElement.innerHTML = "";
            averageMovePowerElement.textContent = "";
            averagePokemonPowerElement.textContent = "";
            pokemonStatsElement.innerHTML = "";
            if (statsChartInstance) {
                statsChartInstance.destroy();
            }
        }
    }

    function getSpanishStatName(statName) {
        switch (statName) {
            case 'hp':
                return 'PS';
            case 'attack':
                return 'Ataque';
            case 'defense':
                return 'Defensa';
            case 'special-attack':
                return 'Ataque Especial';
            case 'special-defense':
                return 'Defensa Especial';
            case 'speed':
                return 'Velocidad';
            default:
                return statName;
        }
    }

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

    async function displayPokemonData(data) {
        pokemonNameElement.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        pokemonImageElement.src = data.sprites.front_default;
        pokemonIdElement.textContent = data.id;

        const types = data.types.map(typeInfo => typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1));
        pokemonTypeElement.textContent = types.join(', ');

        const statsHtml = data.stats.map(statInfo => {
            const spanishName = getSpanishStatName(statInfo.stat.name);
            const statValue = statInfo.base_stat;
            return `<p><strong>${spanishName}:</strong> ${statValue}</p>`;
        }).join('');
        pokemonStatsElement.innerHTML = statsHtml;
        
        if (statsChartInstance) {
            statsChartInstance.destroy();
        }

        const statLabels = data.stats.map(statInfo => getSpanishStatName(statInfo.stat.name));
        const statValues = data.stats.map(statInfo => statInfo.base_stat);

        const ctx = statsChartElement.getContext('2d');
        statsChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: statLabels,
                datasets: [{
                    label: 'Estadísticas Base',
                    data: statValues,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(185, 6, 0, 1)',
                    borderWidth: 1,
                    pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                    pointBorderColor: '#000000ff',
                    pointHoverBackgroundColor: '#d41b1bff',
                    pointHoverBorderColor: 'rgba(243, 174, 0, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 200,
                        grid: {
                            color: 'rgba(0, 0, 0, 1)'
                        },
                        pointLabels: {
                            color: '#000000ff', // Nuevo color para las etiquetas de los puntos
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000000ff' // Nuevo color para el texto de la leyenda
                        }
                    }
                }
            }
        });
        
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