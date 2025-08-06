import React, { useEffect, useState } from 'react';
import { TextField, Grid, Button, Typography } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

const pokemonNames = [
  'pikachu',
  'bulbasaur',
  'charmander',
  'squirtle',
  'gengar',
  'lucario',
  'dragonite',
  // Load from API
];

const fetchPokemonTypes = async (name: string): Promise<string[]> => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();
  return data.types.map((t: any) => t.type.name);
};

export const ExampleFetchComponent = () => {
  const [team, setTeam] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});

  const handleChange = (index: number, value: string | null) => {
    const newTeam = [...team];
    newTeam[index] = value;
    setTeam(newTeam);
  };

  const analyzeTypes = async () => {
    const allTypes: string[] = [];

    for (const name of team) {
      if (!name) continue;
      try {
        const types = await fetchPokemonTypes(name.toLowerCase());
        allTypes.push(...types);
      } catch (err) {
        console.error(`Error loading ${name}:`, err);
      }
    }

    const counts: Record<string, number> = {};
    allTypes.forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });

    setTypeCounts(counts);
  };

  return (
    <Grid container spacing={2} direction="column">
      <Typography variant="h6">Create your Pokemon Team</Typography>
      {team.map((member, idx) => (
        <Grid item key={idx}>
          <Autocomplete
            options={pokemonNames}
            value={member}
            onChange={(_, value) => handleChange(idx, value)}
            renderInput={params => (
              <TextField {...params} label={`Slot ${idx + 1}`} />
            )}
          />
        </Grid>
      ))}
      <Grid item>
        <Button variant="contained" color="primary" onClick={analyzeTypes}>
          Analyse Types
        </Button>
      </Grid>
      <Grid item>
        <Typography variant="h6">Type Coverage:</Typography>
        {Object.entries(typeCounts).length === 0 ? (
          <Typography variant="body2">No Analysis done yet</Typography>
        ) : (
          Object.entries(typeCounts).map(([type, count]) => (
            <Typography key={type}>
              {type}: {count}
            </Typography>
          ))
        )}
      </Grid>
    </Grid>
  );
};
