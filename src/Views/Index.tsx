import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, InputGroup, InputGroupText, Row, Col, Input } from 'reactstrap';
import PokeTarjeta from '../Components/PokeTarjeta';
import { PaginationControl } from 'react-bootstrap-pagination-control';

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

const Index: React.FC = () => {
  const [pokemones, setPokemones] = useState<Pokemon[]>([]);
  const [allpokemones, setAllPokemones] = useState<Pokemon[]>([]);
  const [listado, setListado] = useState<Pokemon[]>([]);
  const [filtro, setFiltro] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAllPokemones(offset);
    getPokemones(offset);
  }, []);

  const getPokemones = async (o: number) => {
    const liga = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${o}`;
    try {
      const response = await axios.get(liga);
      const respuesta = response.data;

      // Obtener detalles de cada Pokémon para incluir 'id'
      const pokemonesConDetalles = await Promise.all(
        respuesta.results.map(async (pokemon: { name: string; url: string }) => {
          const pokemonResponse = await axios.get(pokemon.url);
          return {
            name: pokemonResponse.data.name,
            url: pokemon.url,
            id: pokemonResponse.data.id,
            sprites: pokemonResponse.data.sprites,
          };
        })
      );

      setPokemones(pokemonesConDetalles);
      setListado(pokemonesConDetalles);
      setTotal(respuesta.count);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    }
  };

  const getAllPokemones = async (o: number) => {
    const liga = `https://pokeapi.co/api/v2/pokemon?limit=${10000}&offset=${o}`;
    try {
      const response = await axios.get(liga);
      const respuesta = response.data;

      const pokemonesConDetalles = await Promise.all(
        respuesta.results.map(async (pokemon: { name: string; url: string }) => {
          const pokemonResponse = await axios.get(pokemon.url);
          return {
            name: pokemonResponse.data.name,
            url: pokemon.url,
            id: pokemonResponse.data.id,
            sprites: pokemonResponse.data.sprites,
          };
        })
      );

      setAllPokemones(pokemonesConDetalles);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    }
  };

  const buscar = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      if (filtro.trim() !== '') {
        setListado([]);
        setTimeout(() => {
          setListado(allpokemones.filter(p => p.name.includes(filtro)));
        });
      }
    } else if (filtro.trim() === '') {
      setListado([]);
      setTimeout(() => {
        setListado(pokemones);
      }, 100);
    }
  };

  const goPage = async (page: number) => {
    setListado([]);
    await getPokemones(page === 1 ? 0 : (page - 1) * 20);
    setOffset(page);
  };

  return (
    <Container className='shadow bg-danger mt-4'>
      <Row className='animate__animated animate__bounce'>
        <Col>
          <InputGroup className='mt-4 mb-4 shadow'>
            <InputGroupText><i className='fa solid fa search'></i></InputGroupText>
            <Input
              value={filtro}
              onChange={(e) => { setFiltro(e.target.value) }}
              onKeyUpCapture={buscar}
              placeholder="Buscar pokemon"
            />
          </InputGroup>
        </Col>
      </Row>
      <Row className='mt-4 justify-content-center'>
        {listado.map((poke, i) => (
          <Col key={i} xs='12' sm='6' md='4' lg='3' className='d-flex justify-content-center mb-4'>
            <PokeTarjeta poke={poke} />
          </Col>
        ))}
        {listado.length == 0 ? <Col className='text-center fs-2 mb-3'>No Hay Coincidencias</Col> : ''}
        <PaginationControl last={true} limit={limit} total={total} page={offset} changePage={(page) => goPage(page)} />
      </Row>
    </Container>
  );
};

export default Index;
