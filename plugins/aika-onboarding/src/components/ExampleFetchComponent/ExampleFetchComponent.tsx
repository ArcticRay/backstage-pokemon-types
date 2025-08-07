import React, { useState } from 'react';
import { Grid, Typography, TextField, Button } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { pokemonOptions, PokemonOption } from '../../data/pokemonOptions';

const typeCache: Record<string, string[]> = {};

const fetchPokemonTypes = async (name: string): Promise<string[]> => {
  if (typeCache[name]) {
    return typeCache[name];
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();
  const types = data.types.map((t: any) => t.type.name);

  typeCache[name] = types;
  return types;
};

export const ExampleFetchComponent = () => {
  const [team, setTeam] = useState<(PokemonOption | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});

  const handleChange = (index: number, value: PokemonOption | null) => {
    const newTeam = [...team];
    newTeam[index] = value;
    setTeam(newTeam);
  };

  const analyzeTypes = async () => {
    const allTypes: string[] = [];

    for (const member of team) {
      if (!member) continue;
      try {
        const types = await fetchPokemonTypes(member.name.toLowerCase());
        allTypes.push(...types);
      } catch (err) {
        console.error(`Error loading ${member.name}:`, err);
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
      <Typography variant="h6">Create your Pokémon Team</Typography>

      {team.map((member, idx) => (
        <Grid item key={idx}>
          <Autocomplete
            options={pokemonOptions}
            getOptionLabel={option => option.name}
            value={team[idx]}
            onChange={(_, value) => handleChange(idx, value)}
            renderOption={option => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={option.image}
                  alt={option.name}
                  width={32}
                  height={32}
                  style={{ marginRight: 8 }}
                />
                {option.name}
              </div>
            )}
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
        <Typography variant="h6">Your Team:</Typography>
        <Grid container spacing={1}>
          {team.map((member, idx) =>
            member ? (
              <Grid item key={idx}>
                <img
                  src={member.image}
                  alt={member.name}
                  width={64}
                  height={64}
                  title={member.name}
                />
              </Grid>
            ) : null,
          )}
        </Grid>
      </Grid>

      <Grid item>
        <Typography variant="h6">Type Coverage:</Typography>
        {Object.entries(typeCounts).length === 0 ? (
          <Typography variant="body2">No analysis done yet.</Typography>
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
