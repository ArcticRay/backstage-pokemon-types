import React, { useState } from 'react';
import { Grid, Typography, TextField, Button } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { pokemonOptions, PokemonOption } from '../../data/pokemonOptions';

/** ---------- In-Memory Caches ---------- */
const typeCache: Record<string, string[]> = {};

const ALL_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;
type TypeName = (typeof ALL_TYPES)[number];

type DamageRelations = {
  double_damage_from: { name: TypeName }[];
  half_damage_from: { name: TypeName }[];
  no_damage_from: { name: TypeName }[];
};

const typeRelationsCache: Partial<Record<TypeName, DamageRelations>> = {};

/** ---------- API Helpers ---------- */
const fetchPokemonTypes = async (name: string): Promise<string[]> => {
  if (typeCache[name]) return typeCache[name];
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();
  const types = data.types.map((t: any) => t.type.name);
  typeCache[name] = types;
  return types;
};

async function fetchTypeRelations(
  typeName: TypeName,
): Promise<DamageRelations> {
  const cached = typeRelationsCache[typeName];
  if (cached) return cached;

  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
  const data = await res.json();
  const rel: DamageRelations = {
    double_damage_from: data.damage_relations.double_damage_from
      .map((t: any) => ({ name: t.name as TypeName }))
      .filter((t: any) => ALL_TYPES.includes(t.name)),
    half_damage_from: data.damage_relations.half_damage_from
      .map((t: any) => ({ name: t.name as TypeName }))
      .filter((t: any) => ALL_TYPES.includes(t.name)),
    no_damage_from: data.damage_relations.no_damage_from
      .map((t: any) => ({ name: t.name as TypeName }))
      .filter((t: any) => ALL_TYPES.includes(t.name)),
  };
  typeRelationsCache[typeName] = rel;
  return rel;
}

async function getDefensiveMultipliersForPokemon(ownTypes: TypeName[]) {
  const mult: Record<TypeName, number> = Object.fromEntries(
    ALL_TYPES.map(t => [t, 1]),
  ) as Record<TypeName, number>;

  for (const own of ownTypes) {
    const rel = await fetchTypeRelations(own);
    for (const t of rel.double_damage_from) mult[t.name] *= 2;
    for (const t of rel.half_damage_from) mult[t.name] *= 0.5;
    for (const t of rel.no_damage_from) mult[t.name] *= 0;
  }
  return mult;
}

/** ---------- Component ---------- */
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
  const [weakness, setWeakness] = useState<
    Record<TypeName, { weak: number; severe: number }>
  >({} as any);

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

  const analyzeWeaknessForTeam = async () => {
    const teamTypes: TypeName[][] = [];
    for (const member of team) {
      if (!member) continue;
      const types = (await fetchPokemonTypes(member.name.toLowerCase()))
        .map(t => t as TypeName)
        .filter((t): t is TypeName => ALL_TYPES.includes(t));
      if (types.length) teamTypes.push(types);
    }
    if (!teamTypes.length) {
      setWeakness({} as any);
      return;
    }

    const profiles = await Promise.all(
      teamTypes.map(getDefensiveMultipliersForPokemon),
    );

    const result: Record<TypeName, { weak: number; severe: number }> =
      Object.fromEntries(
        ALL_TYPES.map(t => [t, { weak: 0, severe: 0 }]),
      ) as any;

    for (const prof of profiles) {
      for (const atk of ALL_TYPES) {
        const m = prof[atk];
        if (m > 1) result[atk].weak += 1;
        if (m >= 4) result[atk].severe += 1;
      }
    }
    setWeakness(result);
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
        </Button>{' '}
        <Button
          variant="contained"
          color="secondary"
          onClick={analyzeWeaknessForTeam}
        >
          Analyze Team Weaknesses
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

      {Object.keys(weakness).length > 0 && (
        <Grid item>
          <Typography variant="h6">Team Weaknesses (defense):</Typography>
          {Object.entries(weakness)
            .filter(([_, data]) => data.weak > 0 || data.severe > 0) // don't show zeroes
            .sort((a, b) => b[1].weak - a[1].weak || b[1].severe - a[1].severe)
            .map(([type, data]) => (
              <Typography key={type}>
                {type}: weak {data.weak}
                {data.severe ? ` (severe: ${data.severe} at 4x)` : ''}
              </Typography>
            ))}
        </Grid>
      )}
    </Grid>
  );
};
