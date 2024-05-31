import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardFooter, CardImg, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';

interface Pokemon {
  name: string;
  url: string;
  id: number;
  sprites: {
    front_default: string;
    other: {
      dream_world: {
        front_default: string | null;
      };
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

interface PokeTarjetaProps {
  poke: {
    name: string;
    url: string;
  };
}

const PokeTarjeta: React.FC<PokeTarjetaProps> = ({ poke }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [image, setImage] = useState<string>('/img/pokeball.gif');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getPokemon();
  }, [poke]);

  const getPokemon = async () => {
    try {
      const response = await axios.get<Pokemon>(poke.url);
      const data = response.data;
      setPokemon(data);
      const sprite = data.sprites.other.dream_world.front_default || data.sprites.other['official-artwork'].front_default;
      setImage(sprite);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
    }
  };

  return (
    <Card className={`card-hover shadow border-4 border-warning ${loading ? 'd-none' : ''}`} style={{ width: '10rem' }}>
      {loading ? (
        <CardImg src="/img/loading.gif" alt="Cargando..." style={{ height: '12rem', objectFit: 'contain' }} className="p-3" />
      ) : (
        <CardImg src={image} alt={pokemon?.name} style={{ height: '12rem', objectFit: 'contain' }} className="p-3" />
      )}
      <CardBody className="text-center">
        {pokemon && (
          <>
            <Badge pill color="danger" className="mb-2">
              #{pokemon.id}
            </Badge>
            <h5 className="text-capitalize">{pokemon.name}</h5>
          </>
        )}
      </CardBody>
      <CardFooter className="bd-warning d-flex justify-content-center">
        <Link to={`/pokemon/${pokemon?.id}`} className="btn btn-dark">
          <i className="fa-solid fa-arrow-up-right-from-square"></i> Detalle
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PokeTarjeta;
